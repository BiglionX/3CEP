-- ============================================================================
-- 多类型用户管理 - 数据库验证 SQL（Supabase Dashboard 专用版）
-- ============================================================================
-- 说明：此脚本用于验证数据库表结构是否成功创建
-- 使用方法：在 Supabase Dashboard -> SQL Editor 中执行
-- ============================================================================

-- ============================================================================
-- 1. 检查 4 个核心表是否存在
-- ============================================================================
SELECT
  table_name,
  '✅ 表存在' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
)
ORDER BY table_name;

-- 预期结果：应该返回 4 行结果


-- ============================================================================
-- 2. 测试统计视图是否可用
-- ============================================================================
SELECT
  total_users,
  individual_count,
  repair_shop_count,
  enterprise_count,
  foreign_trade_count
FROM user_stats_view;

-- 预期结果：返回一行统计数据（初始可能都是 0）


-- ============================================================================
-- 3. 查看 user_accounts 表的所有字段
-- ============================================================================
SELECT
  column_name as "字段名",
  data_type as "数据类型",
  is_nullable as "是否可空",
  column_default as "默认值"
FROM information_schema.columns
WHERE table_name = 'user_accounts'
ORDER BY ordinal_position;

-- 预期结果：显示所有字段，包括 role 字段


-- ============================================================================
-- 4. 验证 user_accounts 表的约束条件
-- ============================================================================
SELECT
  conname as "约束名称",
  contype as "约束类型",
  pg_get_constraintdef(oid) as "约束定义"
FROM pg_constraint
WHERE conrelid = 'user_accounts'::regclass
ORDER BY contype, conname;

-- 预期结果：显示 CHECK 约束、主键约束等


-- ============================================================================
-- 5. 检查索引数量
-- ============================================================================
SELECT
  indexname as "索引名称",
  tablename as "表名"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
)
ORDER BY tablename, indexname;

-- 预期结果：显示所有索引（应该有 13+ 个）


-- ============================================================================
-- 6. 检查外键关系
-- ============================================================================
SELECT
    tc.table_name AS "表名",
    kcu.column_name AS "列名",
    ccu.table_name AS "引用表",
    ccu.column_name AS "引用列"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
);

-- 预期结果：显示所有外键关系


-- ============================================================================
-- 7. 查看触发器
-- ============================================================================
SELECT
    trigger_name as "触发器名称",
    event_object_table as "表名",
    action_statement as "触发动作"
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
)
ORDER BY event_object_table, trigger_name;

-- 预期结果：显示自动更新时间戳的触发器


-- ============================================================================
-- 8. 综合验证报告
-- ============================================================================
SELECT
  '验证完成' as "状态",
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%user%') as "用户相关表总数",
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('user_accounts', 'individual_users', 'repair_shop_users_detail', 'enterprise_users_detail')) as "索引总数",
  (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table IN ('user_accounts', 'individual_users', 'repair_shop_users_detail', 'enterprise_users_detail')) as "触发器总数";

-- 预期结果：显示整体统计信息
