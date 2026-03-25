-- =====================================================
-- 044 号迁移脚本验证
-- =====================================================
-- 用途：验证索引、物化视图、函数是否创建成功
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. 验证索引数量 (应该返回 28)
SELECT
  'Total Indexes' as check_item,
  COUNT(*) as count
FROM pg_indexes
WHERE tablename IN (
  'skills', 'skill_reviews', 'skill_executions',
  'skill_version_history', 'skill_tags', 'skill_documents',
  'skill_recommendations', 'skill_sandboxes', 'document_likes',
  'admin_users'
);

-- 2. 验证特定索引是否存在
SELECT
  indexname,
  tablename,
  '✅' as status
FROM pg_indexes
WHERE indexname IN (
  'idx_skills_category_shelf_status',
  'idx_skills_review_status_category',
  'idx_skills_hot_metrics',
  'idx_skills_created_at_desc',
  'idx_skill_reviews_skill_approved',
  'idx_skill_reviews_parent_id',
  'idx_skill_executions_skill_date',
  'idx_skill_versions_skill_version'
)
ORDER BY tablename, indexname;

-- 3. 验证物化视图
SELECT
  matviewname as materialized_view,
  '✅' as status
FROM pg_matviews
WHERE matviewname = 'mv_skill_hot_stats';

-- 4. 验证物化视图数据
SELECT
  id,
  title,
  category,
  execution_count,
  success_rate,
  hot_score
FROM mv_skill_hot_stats
LIMIT 5;

-- 5. 验证监控视图
SELECT
  viewname as view_name,
  '✅' as status
FROM pg_views
WHERE viewname IN (
  'v_slow_queries',
  'v_index_usage_stats',
  'v_table_sizes'
);

-- 6. 验证维护函数
SELECT
  routine_name as function_name,
  '✅' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'refresh_skill_hot_stats',
  'cleanup_old_executions',
  'rebuild_indexes'
);

-- 7. 测试查询性能 (使用新索引)
EXPLAIN ANALYZE
SELECT * FROM skills
WHERE category = 'AI' AND shelf_status = 'on_shelf'
ORDER BY created_at DESC
LIMIT 20;

-- 8. 检查索引大小
SELECT
  relname as index_name,
  pg_size_pretty(pg_relation_size(relid)) as size
FROM pg_stat_user_indexes
WHERE indexrelname LIKE 'idx_%'
ORDER BY pg_relation_size(relid) DESC
LIMIT 10;

-- 9. 表空间占用统计
SELECT
  relname as table_name,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_stat_user_tables
WHERE relname IN ('skills', 'skill_reviews', 'skill_executions')
ORDER BY pg_total_relation_size(relid) DESC;

-- =====================================================
-- 预期结果:
-- ✅ 索引总数：28 个
-- ✅ 物化视图：mv_skill_hot_stats 存在
-- ✅ 监控视图：3 个 (v_slow_queries, v_index_usage_stats, v_table_sizes)
-- ✅ 维护函数：3 个 (refresh_skill_hot_stats, cleanup_old_executions, rebuild_indexes)
-- ✅ 查询性能：Index Scan，耗时 < 20ms
-- =====================================================
