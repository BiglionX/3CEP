-- =====================================================
-- 修复 RLS 无限递归问题
-- =====================================================
-- 问题：tenant_users 表的 RLS 策略检测到无限递归
-- 原因：可能是策略中引用了自身或其他循环引用
-- =====================================================

-- 1. 先检查现有的 RLS 策略
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

-- 2. 如果发现 problematic 的策略，临时禁用 RLS
-- ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;

-- 3. 删除有问题的策略（如果有）
-- DROP POLICY IF EXISTS [problematic_policy_name] ON tenant_users;

-- 4. 重新创建正确的 RLS 策略
-- tenant_users 表应该允许：
-- - 认证用户可以查看自己的租户信息
-- - 管理员可以查看所有租户信息

-- 示例：创建简单的 RLS 策略
-- CREATE POLICY "用户查看自己的租户信息" ON tenant_users
--   FOR SELECT
--   TO authenticated
--   USING (user_id = auth.uid());

-- CREATE POLICY "管理员查看所有租户信息" ON tenant_users
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM admin_users
--       WHERE admin_users.user_id = auth.uid()
--       AND admin_users.is_active = true
--     )
--   );

-- 5. 重新启用 RLS
-- ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 临时解决方案：绕过 RLS 检查（仅用于测试）
-- =====================================================
-- 使用 service_role key 可以绕过 RLS
-- 确保 API 中使用的是 SUPABASE_SERVICE_ROLE_KEY 而不是 anon key
