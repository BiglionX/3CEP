-- ====================================================================
-- 验证 Skill 评论系统安装结果
-- ====================================================================

-- 1. 检查表是否存在
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'skill_reviews';

-- 2. 查看表结构 (列信息)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_reviews'
ORDER BY ordinal_position;

-- 3. 查看索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'skill_reviews'
ORDER BY indexname;

-- 4. 查看 RLS 策略
SELECT
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'skill_reviews'
ORDER BY policyname;

-- 5. 统计信息
SELECT
  '列数' as item, COUNT(*)::text as value
FROM information_schema.columns WHERE table_name = 'skill_reviews'
UNION ALL
SELECT
  '索引数', COUNT(*)::text
FROM pg_indexes WHERE tablename = 'skill_reviews'
UNION ALL
SELECT
  'RLS 策略数', COUNT(*)::text
FROM pg_policies WHERE tablename = 'skill_reviews';
