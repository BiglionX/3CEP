-- =====================================================
-- 检查 alert_rules 表的完整结构
-- =====================================================

-- 1. 查看所有列及其类型
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision
FROM information_schema.columns
WHERE table_name = 'alert_rules'
ORDER BY ordinal_position;

-- 2. 查看是否有 UNIQUE 约束
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'alert_rules'
AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE');

-- 3. 查看索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'alert_rules';
