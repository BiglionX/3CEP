-- =====================================================
-- 紧急修复：立即禁用 RLS（开发环境专用）
-- =====================================================
-- 执行这个后，所有 API 应该立即恢复正常
-- =====================================================

-- 临时禁用 RLS - 让所有查询都能正常工作
ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 验证
SELECT
    relname,
    relrowsecurity,
    relforcerowsecurity
FROM pg_class
WHERE relname IN ('tenant_users', 'admin_users');

-- 应该显示 relrowsecurity = false
