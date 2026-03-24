# 数据库迁移 - 最终修复版本

## ✅ 所有问题已修复

### 修复的问题清单

#### 1. **索引重复创建错误** ✅

**错误**: `ERROR: 42P07: relation "idx_profiles_email" already exists`
**修复**: 所有 `CREATE INDEX` 改为 `CREATE INDEX IF NOT EXISTS`
**文件**: `036_create_profiles_table.sql`

#### 2. **RLS 策略重复创建** ✅

**风险**: 重复执行迁移文件会导致策略冲突
**修复**: 在每个 `CREATE POLICY` 前添加 `DROP POLICY IF EXISTS`
**文件**: `036_create_profiles_table.sql`

#### 3. **触发器重复创建** ✅

**风险**: 重复执行会导致触发器冲突
**修复**: 在每个 `CREATE TRIGGER` 前添加 `DROP TRIGGER IF EXISTS`
**文件**: `036_create_profiles_table.sql`

#### 4. **视图字段依赖问题** ✅

**错误**: `ERROR: 42703: column "status" does not exist`
**修复**: 使用 `DO + IF EXISTS` 条件检查模式
**文件**: `033_add_agent_store_management.sql`, `034_add_skill_store_management.sql`

#### 5. **profiles 表缺失** ✅

**错误**: `ERROR: 42P01: relation "profiles" does not exist`
**修复**: 创建 `036_create_profiles_table.sql` 基础表
**文件**: `036_create_profiles_table.sql` (新增)

---

## 📁 最终的迁移文件（按顺序执行）

### 1️⃣ 036_create_profiles_table.sql

**状态**: ✅ 完全幂等，可重复执行
**内容**:

- ✅ `CREATE TABLE IF NOT EXISTS profiles`
- ✅ `CREATE INDEX IF NOT EXISTS` (所有索引)
- ✅ `DROP POLICY IF EXISTS ... CREATE POLICY` (所有 RLS 策略)
- ✅ `DROP TRIGGER IF EXISTS ... CREATE TRIGGER` (所有触发器)
- ✅ `CREATE OR REPLACE VIEW` (视图)
- ✅ `CREATE OR REPLACE FUNCTION` (函数)

### 2️⃣ 033_add_agent_store_management.sql

**状态**: ✅ 完全幂等，可重复执行
**内容**:

- ✅ `ALTER TABLE agents ADD COLUMN IF NOT EXISTS` (所有字段)
- ✅ `CREATE TABLE IF NOT EXISTS` (所有新表)
- ✅ `DO + IF EXISTS` 条件化创建视图
- ✅ `DROP TRIGGER IF EXISTS ... CREATE TRIGGER` (所有触发器)

### 3️⃣ 034_add_skill_store_management.sql

**状态**: ✅ 完全幂等，可重复执行
**内容**:

- ✅ `CREATE TABLE IF NOT EXISTS skills` (如果不存在)
- ✅ `ALTER TABLE skills ADD COLUMN IF NOT EXISTS` (动态添加字段)
- ✅ `DO + IF EXISTS` 条件化创建视图
- ✅ 独立的触发器函数（不依赖其他文件）

### 4️⃣ 035_add_marketplace_roles.sql

**状态**: ✅ 完全幂等，可重复执行
**内容**:

- ✅ `DO + ALTER TYPE ... ADD VALUE IF NOT EXISTS` (角色枚举)
- ✅ `INSERT INTO ... ON CONFLICT DO NOTHING` (权限数据)
- ✅ `CREATE TABLE IF NOT EXISTS` (权限配置表)

---

## 🚀 执行指南

### 方法一：Supabase Dashboard（推荐）

```sql
-- 步骤 1: 打开 Supabase SQL Editor
-- 步骤 2: 按顺序执行以下文件

-- 1. 基础表
-- 执行：036_create_profiles_table.sql

-- 2. 智能体商店管理
-- 执行：033_add_agent_store_management.sql

-- 3. Skill 商店管理
-- 执行：034_add_skill_store_management.sql

-- 4. 角色权限配置
-- 执行：035_add_marketplace_roles.sql
```

### 方法二：命令行（如果配置了 psql）

```bash
# 设置环境变量
export DB_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# 按顺序执行
psql $DB_URL -f supabase/migrations/036_create_profiles_table.sql
psql $DB_URL -f supabase/migrations/033_add_agent_store_management.sql
psql $DB_URL -f supabase/migrations/034_add_skill_store_management.sql
psql $DB_URL -f supabase/migrations/035_add_marketplace_roles.sql
```

---

## 🔍 验证脚本

执行以下 SQL 验证所有迁移是否成功：

```sql
-- 1. 检查所有表是否存在
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
-- 应该返回 14 个表

-- 2. 检查 profiles 表结构
\d profiles
-- 应该显示所有字段和索引

-- 3. 检查 agents 表扩展字段
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN (
  'review_status', 'shelf_status', 'view_count',
  'revenue_total', 'developer_id', 'revenue_share_rate'
)
ORDER BY ordinal_position;
-- 应该返回 6 行

-- 4. 检查所有视图
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('agent_daily_stats', 'skill_daily_stats', 'user_roles_view');
-- 应该返回 3 个视图（如果字段存在）

-- 5. 检查所有触发器
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%'
ORDER BY trigger_name;
-- 应该显示所有触发器

-- 6. 检查 profiles 表的 RLS 是否启用
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'profiles';
-- relrowsecurity 应该为 true

-- 7. 测试获取用户角色函数
SELECT get_user_role(auth.uid());
-- 应该返回当前用户的角色
```

---

## 🎯 迁移后的数据结构

### 核心表（14 个）

1. `profiles` - 用户资料和角色管理
2. `agents` - 智能体信息（已扩展）
3. `agent_categories` - 智能体分类
4. `agent_audit_logs` - 智能体审核日志
5. `agent_orders` - 智能体订单
6. `agent_reviews` - 智能体评价
7. `skills` - Skill 信息
8. `skill_categories` - Skill 分类
9. `skill_versions` - Skill 版本管理
10. `skill_audit_logs` - Skill 审核日志
11. `skill_orders` - Skill 订单
12. `skill_reviews` - Skill 评价
13. `menu_permissions` - 菜单权限配置
14. `api_route_permissions` - API 路由权限映射

### 视图（3 个）

1. `user_roles_view` - 用户角色视图
2. `agent_daily_stats` - 智能体每日统计
3. `skill_daily_stats` - Skill 每日统计

### 函数（5 个）

1. `update_profiles_updated_at()` - 更新时间戳
2. `create_user_profile()` - 新用户自动创建 profile
3. `get_user_role(user_id)` - 获取用户角色
4. `check_role(required_role)` - 检查用户权限
5. `update_xxx_updated_at()` - 各表的更新时间函数

---

## 📝 重要提示

### ✅ 迁移文件的特性

1. **幂等性**: 所有文件都可重复执行，不会产生副作用
2. **条件化**: 使用 IF EXISTS 检查，避免重复创建
3. **自包含**: 减少跨文件依赖
4. **安全性**: 包含完整的 RLS 策略和权限控制

### ⚠️ 注意事项

1. **执行顺序**: 必须严格按照 036 → 033 → 034 → 035 的顺序
2. **事务处理**: 每个文件都在独立的事务中执行
3. **错误处理**: 如果某一步失败，修复后可以从头重新执行
4. **备份建议**: 生产环境执行前先备份数据库

### 🔄 如果需要回滚

```sql
-- 删除所有创建的表（谨慎操作！）
DROP TABLE IF EXISTS api_route_permissions CASCADE;
DROP TABLE IF EXISTS menu_permissions CASCADE;
DROP TABLE IF EXISTS skill_reviews CASCADE;
DROP TABLE IF EXISTS skill_orders CASCADE;
DROP TABLE IF EXISTS skill_versions CASCADE;
DROP TABLE IF EXISTS skill_audit_logs CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS agent_reviews CASCADE;
DROP TABLE IF EXISTS agent_orders CASCADE;
DROP TABLE IF EXISTS agent_audit_logs CASCADE;
DROP TABLE IF EXISTS agent_categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 删除视图
DROP VIEW IF EXISTS skill_daily_stats;
DROP VIEW IF EXISTS agent_daily_stats;
DROP VIEW IF EXISTS user_roles_view;

-- 删除函数
DROP FUNCTION IF EXISTS check_role(VARCHAR);
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_profiles_updated_at();
```

---

**修复完成时间**: 2026-03-23
**最终版本**: 2.0.0
**状态**: ✅ 生产就绪
