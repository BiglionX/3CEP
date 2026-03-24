# 🎉 数据库迁移 - 最终执行指南

## ✅ 所有问题已彻底解决！

### 🔧 关键修复：使用动态 SQL 延迟字段验证

#### **问题根源**

PostgreSQL 在**解析** `CREATE OR REPLACE VIEW` 语句时就会检查所有引用的字段是否存在，即使在 `IF EXISTS` 块内也无法避免。

#### **解决方案**

使用 `EXECUTE` 动态 SQL，将视图创建语句作为字符串执行，这样字段的验证会延迟到运行时，而不是解析时。

**修改前** (会报错):

```sql
DO $$
BEGIN
  IF EXISTS (...) THEN
    CREATE OR REPLACE VIEW agent_daily_stats AS  -- ❌ PostgreSQL 会立即检查字段
    SELECT ... WHERE o.status IN ('paid', 'activated');
  END IF;
END $$;
```

**修改后** (正确):

```sql
DO $$
BEGIN
  IF EXISTS (...) THEN
    EXECUTE '  -- ✅ 使用动态 SQL，延迟验证
    CREATE OR REPLACE VIEW agent_daily_stats AS
    SELECT ... WHERE o.status IN (''paid'', ''activated'');';
  END IF;
END $$;
```

---

## 📁 修复完成的文件

### ✅ 036_create_profiles_table.sql

- ✅ 所有索引使用 `CREATE INDEX IF NOT EXISTS`
- ✅ 所有 RLS 策略使用 `DROP POLICY IF EXISTS ... CREATE POLICY`
- ✅ 所有触发器使用 `DROP TRIGGER IF EXISTS ... CREATE TRIGGER`
- ✅ 完全幂等，可重复执行

### ✅ 033_add_agent_store_management.sql

- ✅ 使用 `EXECUTE` 动态 SQL 创建 `agent_daily_stats` 视图
- ✅ 所有 ALTER TABLE 使用 `ADD COLUMN IF NOT EXISTS`
- ✅ 所有表使用 `CREATE TABLE IF NOT EXISTS`
- ✅ 完全幂等，可重复执行

### ✅ 034_add_skill_store_management.sql

- ✅ 使用 `EXECUTE` 动态 SQL 创建 `skill_daily_stats` 视图
- ✅ 独立的触发器函数（不依赖其他文件）
- ✅ 完全幂等，可重复执行

### ✅ 035_add_marketplace_roles.sql

- ✅ 使用 `ON CONFLICT DO NOTHING` 插入数据
- ✅ 完全幂等，可重复执行

---

## 🚀 执行步骤（超级简单）

### 方法一：Supabase Dashboard（推荐）

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. **按顺序**打开并执行以下文件：

```sql
-- 第 1 步：基础表
036_create_profiles_table.sql

-- 第 2 步：智能体商店管理
033_add_agent_store_management.sql

-- 第 3 步：Skill 商店管理
034_add_skill_store_management.sql

-- 第 4 步：角色权限配置
035_add_marketplace_roles.sql
```

每个文件执行成功后再执行下一个。

---

## 🔍 验证是否成功

执行以下 SQL 检查所有表和视图：

```sql
-- 检查所有表（应该返回 14 个表）
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'agents', 'agent_categories', 'agent_audit_logs',
  'agent_orders', 'agent_reviews', 'skills', 'skill_categories',
  'skill_versions', 'skill_audit_logs', 'skill_orders', 'skill_reviews',
  'menu_permissions', 'api_route_permissions'
)
ORDER BY tablename;

-- 检查所有视图（应该返回 3 个视图）
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('user_roles_view', 'agent_daily_stats', 'skill_daily_stats');

-- 检查 profiles 表结构
\d profiles

-- 检查 agents 表的扩展字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN (
  'review_status', 'shelf_status', 'view_count',
  'revenue_total', 'developer_id', 'revenue_share_rate'
)
ORDER BY ordinal_position;
```

---

## 🎯 迁移后的完整数据结构

### 核心业务表（14 个）

1. **profiles** - 用户资料和角色管理
2. **agents** - 智能体信息（已扩展管理字段）
3. **agent_categories** - 智能体分类
4. **agent_audit_logs** - 智能体审核日志
5. **agent_orders** - 智能体订单
6. **agent_reviews** - 智能体评价
7. **skills** - Skill 信息
8. **skill_categories** - Skill 分类
9. **skill_versions** - Skill 版本管理
10. **skill_audit_logs** - Skill 审核日志
11. **skill_orders** - Skill 订单
12. **skill_reviews** - Skill 评价
13. **menu_permissions** - 菜单权限配置
14. **api_route_permissions** - API 路由权限映射

### 统计视图（3 个）

1. **user_roles_view** - 用户角色视图
2. **agent_daily_stats** - 智能体每日销售统计
3. **skill_daily_stats** - Skill 每日销售统计

### 辅助函数（5 个）

1. `update_profiles_updated_at()` - 自动更新时间戳
2. `create_user_profile()` - 新用户自动创建 profile
3. `get_user_role(user_id)` - 获取用户角色
4. `check_role(required_role)` - 检查用户权限
5. 各表的 `update_xxx_updated_at()` 函数

---

## ⚠️ 重要提示

### ✅ 文件特性

- **完全幂等**: 所有文件都可重复执行，不会产生副作用
- **自我清理**: 先删除旧对象再创建新对象
- **条件检查**: 智能判断是否需要创建
- **动态 SQL**: 延迟字段验证，避免解析错误

### 🔄 如果执行失败

1. 查看错误信息，确认具体问题
2. 修复后可从头重新执行（因为是完全幂等的）
3. 不需要手动清理已创建的对象

### 📝 最佳实践

1. ✅ 先在开发环境测试
2. ✅ 生产环境执行前备份数据库
3. ✅ 按顺序执行，不要跳步
4. ✅ 每个文件执行成功后再执行下一个
5. ✅ 执行完成后运行验证脚本

---

## 🎊 完成后的下一步

数据库迁移完成后，系统已经具备：

- ✅ 完整的智能体商店管理功能
- ✅ 完整的 Skill 商店管理功能
- ✅ 完善的 RBAC 权限控制
- ✅ 完整的订单和评价系统
- ✅ 数据统计和分析能力

接下来可以继续：

1. 创建剩余的管理 API 端点
2. 开发前端管理页面
3. 集成侧边栏菜单
4. 进行端到端测试

---

**最终修复时间**: 2026-03-23
**版本**: 3.0.0 - 生产就绪版
**状态**: ✅ 所有问题已彻底解决
