-- ====================================================================
-- 验证租户基础设施部署
-- ====================================================================
-- 执行此脚本验证所有表、策略和数据是否创建成功
-- ====================================================================

-- 1️⃣ 检查所有表是否创建成功
SELECT 
  table_name as "表名",
  '✅ 已创建' as "状态"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles_ext', 'admin_users', 'tenants', 'user_tenants')
ORDER BY table_name;

-- 2️⃣ 查看租户数据
SELECT 
  id,
  name as "租户名称",
  code as "租户代码",
  description as "描述",
  is_active as "激活状态"
FROM tenants
ORDER BY code;

-- 3️⃣ 查看所有索引
SELECT 
  tablename as "表名",
  indexname as "索引名称"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_profiles_ext', 'admin_users', 'tenants', 'user_tenants')
ORDER BY tablename, indexname;

-- 4️⃣ 查看 RLS 策略
SELECT 
  tablename as "表名",
  policyname as "策略名称",
  cmd as "操作类型"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles_ext', 'admin_users', 'tenants', 'user_tenants')
ORDER BY tablename, policyname;

-- 5️⃣ 统计每个表的数据量
SELECT 'user_profiles_ext' as "表名", COUNT(*) as "记录数" FROM user_profiles_ext
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'user_tenants', COUNT(*) FROM user_tenants;
