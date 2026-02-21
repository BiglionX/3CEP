-- 一键创建完整数据库结构
-- 包含表结构、索引、初始数据和RLS策略

-- 第一部分：创建表结构和索引
\ir supabase/migrations/001_init_schema.sql

-- 第二部分：插入初始数据
\ir supabase/migrations/002_seed_data.sql

-- 第三部分：应用RLS安全策略
\ir supabase/rls_policies.sql

-- 验证创建结果
SELECT '=== 数据库结构创建完成 ===' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config')
ORDER BY table_name;

SELECT '=== 各表记录数统计 ===' as status;
SELECT 'parts' as table_name, COUNT(*) as record_count FROM parts
UNION ALL
SELECT 'part_prices', COUNT(*) FROM part_prices
UNION ALL
SELECT 'uploaded_content', COUNT(*) FROM uploaded_content
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config;