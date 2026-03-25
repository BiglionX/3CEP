-- ============================================
-- 数据中心表依赖检测脚本
-- 用途：检测数据中心功能所需的表是否已创建
-- 执行方式：psql -U your_user -d your_database -f check-datacenter-tables.sql
-- 注意：此脚本包含 psql 元命令，需要在 psql 环境中执行
-- ============================================

-- 设置输出格式（仅 psql 支持）
\pset format wrapped
\pset border 2

-- 显示开始信息
\echo ''
\echo '=============================================='
\echo '开始检测数据中心所需的数据表...'
\echo '=============================================='
\echo ''

-- 设置输出格式
\pset format wrapped
\pset border 2

-- 创建临时表来存储检测结果
CREATE TEMP TABLE IF NOT EXISTS table_check_results (
    table_name TEXT,
    schema_name TEXT,
    exists BOOLEAN,
    row_count BIGINT,
    has_primary_key BOOLEAN,
    last_analyzed TIMESTAMP,
    status TEXT
);

-- 清空之前的结果
TRUNCATE TABLE table_check_results;

-- ============================================
-- 1. 核心设备管理相关表
-- ============================================
-- 设置输出格式
\pset format wrapped
\pset border 2

-- 显示模块标题
\echo ''
\echo '============================================================='
\echo '检测设备管理相关表...'
\echo '============================================================='

INSERT INTO table_check_results (table_name, schema_name, exists, row_count, has_primary_key, last_analyzed, status)
SELECT
    t.table_name,
    t.table_schema,
    true as exists,
    COALESCE(ps.reltuples, 0)::BIGINT as row_count,
    EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_name = t.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
    ) as has_primary_key,
    pg_stat_get_last_analyze_time(c.oid) as last_analyzed,
    CASE
        WHEN COALESCE(ps.reltuples, 0) > 0 THEN '✅ 正常'
        WHEN COALESCE(ps.reltuples, 0) = 0 THEN '⚠️ 空表'
        ELSE '❌ 异常'
    END as status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
LEFT JOIN pg_stat_user_tables pst ON pst.relname = t.table_name
LEFT JOIN pg_class ps ON ps.oid = pst.relid
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name IN (
    'devices',                    -- 设备信息表
    'device_profiles',            -- 设备档案表
    'device_lifecycle_events',    -- 设备生命周期事件表
    'crowdfunding_pledges',       -- 众筹承诺表
    'repair_orders',              -- 维修订单表
    'parts',                      -- 配件库表
    'fault_types',                -- 故障类型表
    'repair_shops'                -- 维修店铺表
)
ORDER BY t.table_name;

-- ============================================
-- 2. 用户与权限相关表
-- ============================================
-- 显示模块标题
\echo ''
\echo '============================================================='
\echo '检测用户与权限相关表...'
\echo '============================================================='

INSERT INTO table_check_results (table_name, schema_name, exists, row_count, has_primary_key, last_analyzed, status)
SELECT
    t.table_name,
    t.table_schema,
    true as exists,
    COALESCE(ps.reltuples, 0)::BIGINT as row_count,
    EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_name = t.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
    ) as has_primary_key,
    pg_stat_get_last_analyze_time(c.oid) as last_analyzed,
    CASE
        WHEN COALESCE(ps.reltuples, 0) > 0 THEN '✅ 正常'
        WHEN COALESCE(ps.reltuples, 0) = 0 THEN '⚠️ 空表'
        ELSE '❌ 异常'
    END as status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
LEFT JOIN pg_stat_user_tables pst ON pst.relname = t.table_name
LEFT JOIN pg_class ps ON ps.oid = pst.relid
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name IN (
    'admin_users',               -- 管理员用户表
    'user_profiles',             -- 用户档案表
    'tenants',                   -- 租户表
    'user_tenants',              -- 用户租户关联表
    'roles',                     -- 角色表
    'permissions',               -- 权限表
    'user_roles',                -- 用户角色关联表
    'role_permissions'           -- 角色权限关联表
)
ORDER BY t.table_name;

-- ============================================
-- 3. 数据源与元数据相关表
-- ============================================
-- 显示模块标题
\echo ''
\echo '============================================================='
\echo '检测数据源与元数据相关表...'
\echo '============================================================='

INSERT INTO table_check_results (table_name, schema_name, exists, row_count, has_primary_key, last_analyzed, status)
SELECT
    t.table_name,
    t.table_schema,
    true as exists,
    COALESCE(ps.reltuples, 0)::BIGINT as row_count,
    EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_name = t.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
    ) as has_primary_key,
    pg_stat_get_last_analyze_time(c.oid) as last_analyzed,
    CASE
        WHEN COALESCE(ps.reltuples, 0) > 0 THEN '✅ 正常'
        WHEN COALESCE(ps.reltuples, 0) = 0 THEN '⚠️ 空表'
        ELSE '❌ 异常'
    END as status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
LEFT JOIN pg_stat_user_tables pst ON pst.relname = t.table_name
LEFT JOIN pg_class ps ON ps.oid = pst.relid
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name IN (
    'data_sources',              -- 数据源表
    'data_assets',               -- 数据资产表
    'metadata_registry',         -- 元数据注册表
    'data_quality_rules',        -- 数据质量规则表
    'data_lineage'               -- 数据血缘表
)
ORDER BY t.table_name;

-- ============================================
-- 4. 显示检测结果
-- ============================================
-- 显示检测结果
\echo ''
\echo '============================================================='
\echo '检测结果汇总'
\echo '============================================================='

SELECT
    table_name AS "表名",
    schema_name AS "模式",
    CASE WHEN exists THEN '✓ 存在' ELSE '✗ 不存在' END AS "状态",
    row_count AS "行数",
    CASE WHEN has_primary_key THEN '✓' ELSE '✗' END AS "主键",
    status AS "评估"
FROM table_check_results
ORDER BY
    CASE WHEN exists THEN 0 ELSE 1 END,
    table_name;

-- ============================================
-- 5. 统计信息
-- ============================================
-- 统计信息
\echo ''
\echo '============================================================='
\echo '统计信息'
\echo '============================================================='

SELECT
    COUNT(*) AS "总表数",
    SUM(CASE WHEN exists THEN 1 ELSE 0 END) AS "存在的表",
    SUM(CASE WHEN NOT exists THEN 1 ELSE 0 END) AS "不存在的表",
    SUM(CASE WHEN status LIKE '%✅%' THEN 1 ELSE 0 END) AS "正常的表",
    SUM(CASE WHEN status LIKE '%⚠️%' THEN 1 ELSE 0 END) AS "空表",
    SUM(CASE WHEN status LIKE '%❌%' THEN 1 ELSE 0 END) AS "异常的表"
FROM table_check_results;

-- ============================================
-- 6. 缺失的表列表
-- ============================================
-- 缺失的表列表
\echo ''
\echo '============================================================='
\echo '缺失或需要创建的表'
\echo '============================================================='

-- 列出所有期望但尚未创建的表
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        -- 设备管理
        'devices',
        'device_profiles',
        'device_lifecycle_events',
        'crowdfunding_pledges',
        'repair_orders',
        'parts',
        'fault_types',
        'repair_shops',

        -- 用户与权限
        'admin_users',
        'user_profiles',
        'tenants',
        'user_tenants',
        'roles',
        'permissions',
        'user_roles',
        'role_permissions',

        -- 数据源与元数据
        'data_sources',
        'data_assets',
        'metadata_registry',
        'data_quality_rules',
        'data_lineage'
    ]) AS expected_table_name
)
SELECT
    expected_table_name AS "缺失的表名",
    CASE
        WHEN expected_table_name IN ('devices', 'device_profiles', 'device_lifecycle_events') THEN '设备管理模块'
        WHEN expected_table_name IN ('admin_users', 'user_profiles', 'tenants') THEN '用户管理模块'
        WHEN expected_table_name IN ('data_sources', 'data_assets', 'metadata_registry') THEN '数据中心模块'
        ELSE '其他模块'
    END AS "所属模块"
FROM expected_tables
LEFT JOIN table_check_results tcr ON tcr.table_name = expected_table_name AND tcr.exists = true
WHERE tcr.table_name IS NULL
ORDER BY expected_table_name;

-- ============================================
-- 7. RLS 策略检查
-- ============================================
-- RLS 策略检查
\echo ''
\echo '============================================================='
\echo 'RLS (行级安全) 策略检查'
\echo '============================================================='

SELECT
    schemaname AS "模式",
    tablename AS "表名",
    policyname AS "策略名称",
    permissive AS "允许性",
    roles AS "适用角色",
    cmd AS "命令类型",
    qual AS "限制条件"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 8. 索引使用情况
-- ============================================
-- 索引使用情况
\echo ''
\echo '============================================================='
\echo '索引使用情况'
\echo '============================================================='

SELECT
    schemaname AS "模式",
    tablename AS "表名",
    indexname AS "索引名",
    indexdef AS "索引定义"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '============================================================='
\echo '检测完成!'
\echo '============================================================='

-- 清理临时表
DROP TABLE IF EXISTS table_check_results;
