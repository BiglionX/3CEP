-- =====================================================
-- 诊断所有 RLS 相关表的递归问题
-- =====================================================
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. 检查所有可能有递归问题的策略
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual::text as condition
FROM pg_policies
WHERE qual::text LIKE '%tenant_users%'
   OR qual::text LIKE '%admin_users%'
ORDER BY tablename, policyname;

-- 2. 检查是否有视图引用了这些表
SELECT
    viewname,
    definition
FROM pg_views
WHERE definition::text LIKE '%tenant_users%'
   OR definition::text LIKE '%admin_users%';

-- 3. 检查 v_sync_statistics 视图
SELECT
    viewname,
    definition
FROM pg_views
WHERE viewname = 'v_sync_statistics';

-- 4. 如果发现视图也有问题，需要重建视图或禁用相关 RLS

-- 5. 临时解决方案：禁用所有相关表的 RLS
ALTER TABLE IF EXISTS tenant_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS external_data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parts_staging DISABLE ROW LEVEL SECURITY;

-- 如果视图有问题，可能需要：
-- DROP VIEW IF EXISTS v_sync_statistics;
-- 然后重新创建不带 RLS 检查的视图

-- 6. 验证
SELECT
    relname,
    relrowsecurity
FROM pg_class
WHERE relname IN (
    'tenant_users',
    'admin_users',
    'external_data_sources',
    'parts_staging'
);
