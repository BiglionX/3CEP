# RLS 无限递归问题修复指南

## 🔴 错误信息

```
infinite recursion detected in policy for relation "tenant_users"
```

## 📋 问题原因

这个错误通常由以下原因引起：

1. **RLS 策略循环引用**
   - Policy A 引用了表 B
   - Policy B 又引用了表 A
   - 形成无限循环

2. **自引用策略**
   - 策略中直接引用了自己所在的表
   - 例如：`tenant_users` 的策略中查询 `tenant_users`

3. **复杂的嵌套 EXISTS 查询**
   - 多层嵌套的 EXISTS 子句
   - 每层都涉及权限检查

## 🔍 诊断步骤

### 步骤 1: 查看现有的 RLS 策略

在 Supabase SQL Editor 中执行：

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('tenant_users', 'admin_users', 'external_data_sources', 'parts_staging')
ORDER BY tablename, policyname;
```

### 步骤 2: 检查具体的策略定义

```sql
-- 查看 tenant_users 的所有策略
SELECT * FROM pg_policies WHERE tablename = 'tenant_users';

-- 查看策略的详细定义
SELECT
    polname,
    polcmd,
    polqual,
    polwithcheck
FROM pg_policy
WHERE polrelid = 'tenant_users'::regclass;
```

### 步骤 3: 识别问题策略

常见的 problematic patterns：

```sql
-- ❌ 错误示例 1: 自引用
CREATE POLICY "check_tenant" ON tenant_users
FOR SELECT TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
);

-- ❌ 错误示例 2: 循环引用
CREATE POLICY "admin_check" ON tenant_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.tenant_id = tenant_users.tenant_id
    )
);

-- admin_users 表又有类似策略引用 tenant_users
```

## ✅ 修复方案

### 方案 1: 简化 RLS 策略（推荐）

```sql
-- 1. 先禁用有问题的策略
ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略（如果需要）
DROP POLICY IF EXISTS "policy_name_1" ON tenant_users;
DROP POLICY IF EXISTS "policy_name_2" ON tenant_users;

-- 3. 创建简单的、非递归的策略
CREATE POLICY "允许认证用户查看自己的租户信息" ON tenant_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "允许管理员查看所有租户信息" ON tenant_users
FOR ALL TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM admin_users
        WHERE is_active = true
    )
);

-- 4. 重新启用 RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
```

### 方案 2: 使用 SECURITY DEFINER 函数

创建辅助函数来避免递归：

```sql
-- 创建安全检查函数
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 使用函数的 RLS 策略
CREATE POLICY "管理员访问" ON tenant_users
FOR ALL TO authenticated
USING (is_admin_user());
```

### 方案 3: 临时绕过 RLS（仅开发环境）

如果急需测试，可以：

1. **完全禁用 RLS**（仅限开发）：

```sql
ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;
```

2. **使用 service_role key**（已在 API 中实现）：

```typescript
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
// service_role key 会自动绕过 RLS
```

## 🛠️ 立即修复步骤

### 在 Supabase Dashboard 执行：

```sql
-- 步骤 1: 查看问题
SELECT policyname, tablename, cmd, qual
FROM pg_policies
WHERE qual::text LIKE '%tenant_users%'
   OR qual::text LIKE '%admin_users%';

-- 步骤 2: 如果发现递归策略，删除它
-- DROP POLICY IF EXISTS [problematic_policy_name] ON tenant_users;

-- 步骤 3: 创建简化版策略
CREATE POLICY "simple_select" ON tenant_users
FOR SELECT TO authenticated
USING (true); -- 临时允许所有认证用户查看

-- 或者更严格的版本
CREATE POLICY "user_tenant_access" ON tenant_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());
```

## 📊 验证修复

修复后测试：

```sql
-- 测试 1: 查询是否正常工作
SELECT * FROM tenant_users LIMIT 10;

-- 测试 2: 检查策略
SELECT * FROM pg_policies WHERE tablename = 'tenant_users';

-- 测试 3: API 调用
-- 访问 http://localhost:3001/api/admin/data-audit/statistics
-- 应该返回 200 而不是 500
```

## 🎯 最佳实践

1. **保持 RLS 策略简单**
   - 避免复杂的嵌套查询
   - 不要在同一策略中引用多个相关表

2. **使用函数封装复杂逻辑**
   - 用 SECURITY DEFINER 函数
   - 函数内部处理复杂查询

3. **测试策略**
   - 创建策略后立即测试
   - 使用不同角色的用户测试

4. **开发环境可以放宽限制**
   - 开发时可以使用简单的 `USING (true)`
   - 生产环境再实施严格策略

## 🔗 相关文件

- 修复脚本：`supabase/migrations/fix_rls_recursion.sql`
- 数据源配置迁移：`supabase/migrations/048_data_center_external_data.sql`

## 📝 注意事项

⚠️ **重要**：

- 修改 RLS 策略前务必备份现有策略
- 在生产环境修改前先测试
- 使用 service_role key 的 API 会绕过 RLS，确保只在必要时使用
