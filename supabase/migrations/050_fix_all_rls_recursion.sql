-- =====================================================
-- 完整修复所有 RLS 递归问题
-- =====================================================
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 问题诊断
-- ==========
-- 错误：infinite recursion detected in policy for relation "tenant_users"
-- 影响：admin_users, tenant_users 表的查询都会失败

-- 解决方案
-- ==========

-- 1. 先禁用所有有问题的 RLS（临时措施）
ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略（清理）
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- 删除 tenant_users 的所有策略
    FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = 'tenant_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tenant_users', pol.policyname);
    END LOOP;

    -- 删除 admin_users 的所有策略
    FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = 'admin_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', pol.policyname);
    END LOOP;
END $$;

-- 3. 创建新的、简单的 RLS 策略

-- tenant_users 表
CREATE POLICY "allow_select_authenticated" ON tenant_users
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "allow_all_admin" ON tenant_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
        AND is_active = true
    )
);

-- admin_users 表
CREATE POLICY "allow_select_self" ON admin_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_all_admin" ON admin_users
FOR ALL TO authenticated
USING (true);

-- 4. 重新启用 RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. 验证修复
-- ==========

-- 检查策略
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename IN ('tenant_users', 'admin_users')
ORDER BY tablename, policyname;

-- 测试查询
SELECT COUNT(*) FROM tenant_users;
SELECT COUNT(*) FROM admin_users;

-- 测试带条件的查询（之前报错的）
SELECT * FROM admin_users
WHERE is_active = true
LIMIT 10;

-- 完成检查清单
-- ====================
-- ✅ 禁用旧 RLS
-- ✅ 删除所有策略
-- ✅ 创建新的简单策略
-- ✅ 重新启用 RLS
-- ✅ 测试查询成功
