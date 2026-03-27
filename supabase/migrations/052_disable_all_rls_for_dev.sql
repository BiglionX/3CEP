-- =====================================================
-- 完全禁用所有 RLS（开发环境专用）
-- =====================================================
-- 执行这个后，所有数据相关的 API 都应该恢复正常
-- =====================================================

-- 禁用所有业务表的 RLS
ALTER TABLE IF EXISTS tenant_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS external_data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parts_staging DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unified_link_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles_ext DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS repair_shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;

-- 如果有视图依赖这些表，也删除并重建视图（如果需要）
-- DROP VIEW IF EXISTS v_sync_statistics;

-- 验证所有表都已禁用 RLS
SELECT
    relname as table_name,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class
WHERE relname IN (
    'tenant_users',
    'admin_users',
    'external_data_sources',
    'parts_staging',
    'unified_link_library',
    'articles',
    'user_profiles_ext',
    'repair_shops',
    'appointments'
)
ORDER BY relname;

-- 应该全部显示 DISABLED
