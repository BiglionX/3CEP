# 部署租户基础设施指南

## 问题诊断

**错误现象**：

```
Error: relation "user_tenants" does not exist
```

**根本原因**：

- `user_tenants` 表尚未在 Supabase 数据库中创建
- 该表是多租户架构的核心，用于建立用户与租户的关联关系

## 解决方案

### ✅ 方案已准备完成

我已创建迁移脚本：`supabase/migrations/033_create_tenant_infrastructure.sql`

**重要改进**：

- ✅ 自动检测并创建缺失的依赖表（`user_profiles_ext`、`admin_users`）
- ✅ 智能判断：如果表已存在则跳过，避免重复创建
- ✅ 自动处理表之间的依赖关系
- ✅ 包含完整的 RLS 策略和索引

### 执行步骤

#### 方法 1：使用 Supabase Dashboard（推荐）

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 点击左侧菜单 "SQL Editor"
   - 点击 "New query"

3. **执行迁移脚本**
   - 复制 `033_create_tenant_infrastructure.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

4. **验证执行结果**

   ```sql
   -- 检查表是否创建成功
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('tenants', 'user_tenants');

   -- 检查默认租户数据
   SELECT * FROM tenants;
   ```

#### 方法 2：使用 Supabase CLI

```bash
# 确保已安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
npx supabase login

# 链接到你的项目
npx supabase link --project-ref YOUR_PROJECT_REF

# 推送迁移
npx supabase db push
```

## 执行后验证

### 1. 检查表结构

```sql
-- 查看 user_tenants 表结构
\d user_tenants

-- 查看 tenants 表结构
\d tenants
```

### 2. 测试 RLS 策略

```sql
-- 以管理员身份测试（需要实际管理员账号）
SELECT set_config('request.jwt.claims', '{"sub":"YOUR_USER_ID","role":"admin"}', true);

-- 测试查询租户关联
SELECT * FROM user_tenants;
```

### 3. 检查索引

```sql
-- 查看创建的索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('user_tenants', 'tenants');
```

## 预期结果

执行成功后，你将拥有：

✅ **两个核心表**：

- `tenants` - 租户信息表
- `user_tenants` - 用户与租户关联表

✅ **行级安全策略 (RLS)**：

- 用户可以查看自己的租户关联
- 系统管理员可以管理所有租户关联
- 租户数据自动隔离

✅ **性能优化索引**：

- `idx_user_tenants_user_id` - 加速按用户查询
- `idx_user_tenants_tenant_id` - 加速按租户查询
- `idx_tenants_code` - 加速租户代码查询

✅ **初始数据**：

- 默认租户 (`default`)
- 测试租户 (`test`)

## 后续步骤

### 1. 为现有用户分配租户

```sql
-- 将所有现有用户分配到默认租户
INSERT INTO user_tenants (user_id, tenant_id, role, is_primary, is_active)
SELECT
  id as user_id,
  '00000000-0000-0000-0000-000000000001'::uuid as tenant_id,
  'member' as role,
  true as is_primary,
  true as is_active
FROM auth.users
ON CONFLICT (user_id, tenant_id) DO NOTHING;
```

### 2. 更新 AuthProvider 代码

表创建完成后，`src/components/providers/AuthProvider.tsx` 中的代码将正常工作，无需修改。

### 3. 测试多租户功能

- 测试用户登录后的租户切换
- 验证不同租户间的数据隔离
- 确认管理员可以跨租户管理

## 故障排除

### 问题 1：执行失败，提示表已存在

**解决方案**：

```sql
-- 如果表已存在但不完整，先删除
DROP TABLE IF EXISTS user_tenants CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- 重新执行迁移脚本
```

### 问题 2：RLS 策略冲突

**解决方案**：

```sql
-- 删除所有现有策略
DROP POLICY IF EXISTS "用户可以查看自己所属租户的信息" ON tenants;
DROP POLICY IF EXISTS "系统管理员可以管理所有租户" ON tenants;
DROP POLICY IF EXISTS "用户可以查看自己的租户关联" ON user_tenants;
DROP POLICY IF EXISTS "系统管理员可以管理所有租户关联" ON user_tenants;

-- 重新执行迁移脚本
```

### 问题 3：权限不足

**解决方案**：

- 确保使用具有 DDL 权限的数据库角色
- 在 Supabase Dashboard 中使用项目所有者账号
- 或使用 Service Role Key

## 相关文档

- [Supabase RLS 官方文档](https://supabase.com/docs/guides/auth/row-level-security)
- [多租户架构最佳实践](docs/architecture/multi-tenant-architecture.md)
- [权限管理指南](docs/admin-optimization/api-permission-middleware-guide.md)

---

**创建时间**: 2026-03-23
**迁移版本**: 033
**影响范围**: 新增表，不影响现有数据
