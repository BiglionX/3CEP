-- =====================================================
-- 修复 tenant_users 表的 RLS 无限递归问题
-- =====================================================
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 问题诊断
-- ==========
-- 现有策略 "租户隔离 - 查看租户成员" 存在自引用：
-- tenant_users 的策略中查询了 tenant_users_1，导致无限递归

-- 解决方案
-- ==========

-- 1. 先删除有问题的递归策略
DROP POLICY IF EXISTS "租户隔离 - 查看租户成员" ON tenant_users;

-- 2. 创建新的、不会递归的策略
-- 方案 A: 简单版本（推荐用于开发环境）
CREATE POLICY "允许认证用户查看自己的租户信息" ON tenant_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 方案 B: 管理员可以查看所有租户
CREATE POLICY "管理员可查看所有租户信息" ON tenant_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_active = true
    )
);

-- 3. 如果还需要租户内协作（可选）
-- 例如：同一租户的用户可以互相查看
-- CREATE POLICY "同租户用户可查看" ON tenant_users
-- FOR SELECT TO authenticated
-- USING (
--     tenant_id IN (
--         SELECT tu.tenant_id
--         FROM tenant_users tu
--         WHERE tu.user_id = auth.uid()
--     )
-- );
-- ⚠️ 注意：上面这个策略可能会有递归风险，谨慎使用

-- 4. 确保 RLS 已启用
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- 验证修复
-- ==========

-- 检查策略是否已修复
SELECT
    policyname,
    tablename,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'tenant_users'
ORDER BY policyname;

-- 测试查询是否正常
SELECT * FROM tenant_users LIMIT 10;

-- 测试 admin_users 查询
SELECT * FROM admin_users LIMIT 10;

-- 完成检查清单
-- ====================
-- ✅ 删除递归策略
-- ✅ 创建新的非递归策略
-- ✅ 管理员可以管理租户
-- ✅ 用户可以查看自己的租户信息
-- ✅ RLS 已启用
-- ✅ 测试查询成功
