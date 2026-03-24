# 智能体商店 & Skill 商店管理功能 - 数据库迁移指南

## 📋 迁移文件清单

请**按顺序**执行以下数据库迁移文件：

### 1. **基础依赖表**

```
📁 036_create_profiles_table.sql
   - 创建 profiles 用户资料表
   - 创建用户角色管理功能
   - 创建触发器和权限控制
   ⚠️ **必须最先执行**，因为其他迁移文件依赖 profiles 表
```

### 2. **智能体商店管理**

```
📁 033_add_agent_store_management.sql
   - 扩展 agents 表添加管理字段
   - 创建 agent_categories 分类表
   - 创建 agent_audit_logs 审核日志表
   - 创建 agent_orders 订单表
   - 创建 agent_reviews 评价表
   - 创建统计视图和 RLS 策略
```

### 3. **Skill 商店管理**

```
📁 034_add_skill_store_management.sql
   - 创建/扩展 skills 表
   - 创建 skill_categories 分类表
   - 创建 skill_versions 版本管理表
   - 创建 skill_orders 订单表
   - 创建 skill_reviews 评价表
   - 创建统计视图和 RLS 策略
```

### 4. **市场管理角色权限**

```
📁 035_add_marketplace_roles.sql
   - 添加 marketplace_admin、shop_reviewer 等新角色
   - 配置菜单权限和 API 路由权限
   - 创建 menu_permissions 和 api_route_permissions 表
```

---

## 🚀 执行步骤

### 方法一：Supabase Dashboard（推荐）

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. **按顺序**打开并执行每个迁移文件：
   ```
   036_create_profiles_table.sql     → 执行
   033_add_agent_store_management.sql → 执行
   034_add_skill_store_management.sql → 执行
   035_add_marketplace_roles.sql      → 执行
   ```

### 方法二：Supabase CLI

```bash
# 安装 Supabase CLI（如果未安装）
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行迁移（按顺序）
supabase db push --db-url YOUR_DB_URL --include-all
```

---

## ✅ 验证迁移成功

执行以下 SQL 检查表是否创建成功：

```sql
-- 检查所有表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles',
  'agents',
  'agent_categories',
  'agent_audit_logs',
  'agent_orders',
  'agent_reviews',
  'skills',
  'skill_categories',
  'skill_versions',
  'skill_audit_logs',
  'skill_orders',
  'skill_reviews',
  'menu_permissions',
  'api_route_permissions'
)
ORDER BY table_name;

-- 检查 profiles 表结构
\d profiles

-- 检查 agents 表新增字段
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('review_status', 'shelf_status', 'view_count', 'revenue_total')
ORDER BY column_name;

-- 检查 skills 表结构
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position;
```

---

## 🔧 故障排查

### 错误 1: `relation "profiles" does not exist`

**原因**: 未执行 036 号迁移文件或执行顺序错误
**解决**: 确保先执行 `036_create_profiles_table.sql`

### 错误 2: `column "status" does not exist`

**原因**: 创建统计视图时引用了尚未提交的字段
**解决**: 033 和 034 号文件已修复，使用条件检查确保字段存在后才创建视图

### 错误 3: `function uuid_generate_v4() does not exist`

**原因**: 缺少 uuid-ossp 扩展
**解决**:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 错误 4: `type user_role does not exist`

**原因**: 枚举类型不存在或名称不匹配
**解决**: 036 号文件已改用 VARCHAR + CHECK 约束，避免此问题

### 错误 4: RLS 策略冲突

**原因**: 重复执行迁移文件导致策略重复
**解决**: 使用 `DROP POLICY IF EXISTS` 或删除重复的策略

---

## 📊 迁移后的数据结构

### 核心业务表

- `profiles` - 用户资料和角色管理
- `agents` - 智能体信息（已扩展管理字段）
- `skills` - 技能信息（新建或扩展）

### 分类管理表

- `agent_categories` - 智能体分类
- `skill_categories` - Skill 分类

### 订单交易表

- `agent_orders` - 智能体订单
- `skill_orders` - Skill 订单

### 评价系统表

- `agent_reviews` - 智能体评价
- `skill_reviews` - Skill 评价

### 审核日志表

- `agent_audit_logs` - 智能体审核日志
- `skill_audit_logs` - Skill 审核日志

### 版本管理表

- `skill_versions` - Skill 版本管理

### 权限配置表

- `menu_permissions` - 菜单权限配置
- `api_route_permissions` - API 路由权限映射

---

## 🎯 后续步骤

数据库迁移完成后：

1. ✅ 更新任务状态为已完成
2. ⏭️ 继续创建 Skill 商店管理 API
3. ⏭️ 开发前端管理页面
4. ⏭️ 集成侧边栏菜单
5. ⏭️ 进行功能测试

---

## 📝 注意事项

1. **幂等性**: 所有迁移文件都设计为幂等的，可安全重复执行
2. **数据备份**: 建议在生产环境执行前备份数据库
3. **测试环境**: 先在开发/测试环境验证后再部署到生产环境
4. **依赖顺序**: 必须严格按照上述顺序执行迁移文件
5. **触发器函数**: 034 号文件已修复，不再依赖 033 号的触发器函数

---

## 🔗 相关文件

- 前端 API: `/src/app/api/admin/agent-store/`
- 管理页面：待创建 `/admin/agent-store/`
- 侧边栏组件：`/src/components/admin/RoleAwareSidebar.tsx`

---

**创建时间**: 2026-03-23
**最后更新**: 2026-03-23
**版本**: 1.0.0
