-- =====================================================
-- P2-001 性能优化：数据库查询优化
-- =====================================================
-- 目标：
-- 1. 添加缺失的复合索引
-- 2. 优化慢查询
-- 3. 分析查询性能
-- 预计提升：所有查询 < 100ms
-- =====================================================

-- =====================================================
-- 1. Skills 表索引优化
-- =====================================================

-- 1.1 分类 + 状态复合索引 (用于筛选查询)
CREATE INDEX IF NOT EXISTS idx_skills_category_shelf_status
ON skills(category, shelf_status)
WHERE shelf_status = 'on_shelf';

-- 1.2 审核状态 + 分类索引 (用于管理后台)
CREATE INDEX IF NOT EXISTS idx_skills_review_status_category
ON skills(review_status, category);

-- 1.3 热门度复合索引 (用于推荐系统)
CREATE INDEX IF NOT EXISTS idx_skills_hot_metrics
ON skills(shelf_status, review_status, rating DESC, usage_count DESC)
WHERE shelf_status = 'on_shelf' AND review_status = 'approved';

-- 1.4 创建时间倒序索引 (用于最新列表)
CREATE INDEX IF NOT EXISTS idx_skills_created_at_desc
ON skills(created_at DESC)
WHERE shelf_status = 'on_shelf' AND review_status = 'approved';

-- =====================================================
-- 2. Skill 评论表索引优化
-- =====================================================

-- 2.1 Skill ID + 审核状态索引 (用于评论列表)
CREATE INDEX IF NOT EXISTS idx_skill_reviews_skill_approved
ON skill_reviews(skill_id, is_approved)
WHERE is_approved = true;

-- 2.2 父评论 ID 索引 (用于嵌套回复)
CREATE INDEX IF NOT EXISTS idx_skill_reviews_parent_id
ON skill_reviews(parent_id)
WHERE parent_id IS NOT NULL;

-- 2.3 评分索引 (用于筛选)
CREATE INDEX IF NOT EXISTS idx_skill_reviews_rating
ON skill_reviews(rating)
WHERE is_approved = true;

-- =====================================================
-- 3. Skill 执行日志索引优化
-- =====================================================

-- 3.1 Skill ID + 时间索引 (用于统计查询)
CREATE INDEX IF NOT EXISTS idx_skill_executions_skill_date
ON skill_executions(skill_id, created_at DESC);

-- 3.2 用户 ID + 时间索引 (用于个人历史)
CREATE INDEX IF NOT EXISTS idx_skill_executions_user_date
ON skill_executions(user_id, created_at DESC);

-- 3.3 状态索引 (用于失败分析)
CREATE INDEX IF NOT EXISTS idx_skill_executions_status
ON skill_executions(status, created_at DESC);

-- =====================================================
-- 4. Skill 版本历史索引优化
-- =====================================================

-- 4.1 Skill ID + 版本号索引 (使用 new_version)
CREATE INDEX IF NOT EXISTS idx_skill_versions_skill_version
ON skill_version_history(skill_id, new_version DESC);

-- 4.2 操作人索引 (用于审计，使用 created_at)
CREATE INDEX IF NOT EXISTS idx_skill_versions_changed_by
ON skill_version_history(changed_by, created_at DESC);

-- =====================================================
-- 5. Skill 标签索引优化
-- =====================================================

-- 5.1 热门标签索引
CREATE INDEX IF NOT EXISTS idx_skill_tags_is_hot
ON skill_tags(is_hot, name)
WHERE is_hot = true;

-- 5.2 使用次数索引 (用于排序)
CREATE INDEX IF NOT EXISTS idx_skill_tags_usage_count
ON skill_tags(usage_count DESC);

-- =====================================================
-- 6. Skill 文档索引优化
-- =====================================================

-- 6.1 Skill ID + 分类 + 排序索引
CREATE INDEX IF NOT EXISTS idx_skill_documents_skill_category_order
ON skill_documents(skill_id, category, order_index);

-- 6.2 发布状态 + 时间索引
CREATE INDEX IF NOT EXISTS idx_skill_documents_published
ON skill_documents(is_published, published_at DESC)
WHERE is_published = true;

-- 6.3 全文搜索 GIN 索引 (如果数据量大)
-- CREATE INDEX IF NOT EXISTS idx_skill_documents_content_search
-- ON skill_documents USING gin(to_tsvector('english', title || ' ' || content));

-- =====================================================
-- 7. 推荐系统索引优化
-- =====================================================

-- 7.1 推荐记录索引
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_skill_type
ON skill_recommendations(skill_id, recommendation_type);

-- 7.2 点击率索引 (使用 is_clicked)
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_clicked
ON skill_recommendations(is_clicked) WHERE is_clicked = true;

-- =====================================================
-- 8. 测试沙箱索引优化
-- =====================================================

-- 8.1 用户 + Skill 索引
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_user_skill
ON skill_sandboxes(user_id, skill_id);

-- 8.2 状态 + 时间索引
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_status_date
ON skill_sandboxes(status, created_at DESC);

-- 8.3 公开测试索引
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_public
ON skill_sandboxes(is_public, created_at DESC)
WHERE is_public = true;

-- =====================================================
-- 9. 文档点赞索引优化
-- =====================================================

-- 9.1 文档 ID 索引
CREATE INDEX IF NOT EXISTS idx_document_likes_document
ON document_likes(document_id);

-- 9.2 用户 ID 索引 (防重复检查)
CREATE INDEX IF NOT EXISTS idx_document_likes_user
ON document_likes(user_id);

-- =====================================================
-- 10. 管理员用户索引优化
-- =====================================================

-- 10.1 角色索引
CREATE INDEX IF NOT EXISTS idx_admin_users_role
ON admin_users(role);

-- 10.2 活跃状态索引 (使用 is_active)
CREATE INDEX IF NOT EXISTS idx_admin_users_status
ON admin_users(is_active);

-- =====================================================
-- 11. 分析和统计函数优化
-- =====================================================

-- 11.1 创建物化视图缓存热门统计
-- 如果已存在，先删除再重建
DROP MATERIALIZED VIEW IF EXISTS mv_skill_hot_stats;
CREATE MATERIALIZED VIEW mv_skill_hot_stats AS
SELECT
  s.id,
  s.title,
  s.category,
  COALESCE(se.total_executions, 0) as execution_count,
  COALESCE(se.success_rate, 0) as success_rate,
  COALESCE(se.avg_execution_time, 0) as avg_execution_time,
  COALESCE(su.daily_usage, 0) as daily_usage,
  COALESCE(s.rating, 0) as rating,
  (
    COALESCE(se.total_executions, 0) * 0.001 +
    COALESCE(s.rating, 0) * 0.1 +
    COALESCE(su.daily_usage, 0) * 0.01
  )::DECIMAL(10,4) as hot_score
FROM skills s
LEFT JOIN (
  SELECT
    skill_id,
    COUNT(*) as total_executions,
    AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) * 100 as success_rate,
    AVG(execution_time) as avg_execution_time
  FROM skill_executions
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY skill_id
) se ON se.skill_id = s.id
LEFT JOIN (
  SELECT
    skill_id,
    COUNT(DISTINCT user_id) as daily_usage
  FROM skill_executions
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY skill_id
) su ON su.skill_id = s.id
WHERE s.shelf_status = 'on_shelf'
  AND s.review_status = 'approved'
ORDER BY hot_score DESC;

-- 为物化视图添加索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_skill_hot_stats_id
ON mv_skill_hot_stats(id);

CREATE INDEX IF NOT EXISTS idx_mv_skill_hot_stats_score
ON mv_skill_hot_stats(hot_score DESC);

-- 刷新物化视图的函数
-- 如果函数已存在，先删除再重建
DROP FUNCTION IF EXISTS refresh_skill_hot_stats();
CREATE OR REPLACE FUNCTION refresh_skill_hot_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_skill_hot_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. 查询性能分析示例
-- =====================================================

-- 分析 Skills 列表查询
-- EXPLAIN ANALYZE
-- SELECT * FROM skills
-- WHERE category = 'AI' AND shelf_status = 'on_shelf'
-- ORDER BY created_at DESC
-- LIMIT 20;

-- 分析评论统计查询
-- EXPLAIN ANALYZE
-- SELECT
--   skill_id,
--   COUNT(*) as total_reviews,
--   AVG(rating) as avg_rating
-- FROM skill_reviews
-- WHERE is_approved = true
-- GROUP BY skill_id;

-- 分析用户行为追踪
-- EXPLAIN ANALYZE
-- SELECT
--   user_id,
--   COUNT(DISTINCT skill_id) as unique_skills,
--   COUNT(*) as total_actions
-- FROM skill_executions
-- WHERE created_at >= NOW() - INTERVAL '7 days'
-- GROUP BY user_id;

-- =====================================================
-- 13. 定期维护任务
-- =====================================================

-- 13.1 清理旧数据的函数 (保留最近 90 天)
-- 如果函数已存在，先删除关联的触发器，再删除函数
DROP TRIGGER IF EXISTS trigger_cleanup_executions ON skill_executions;
DROP FUNCTION IF EXISTS cleanup_old_executions();
-- 注意：触发器函数必须返回 trigger 类型，不能是 void
CREATE OR REPLACE FUNCTION cleanup_old_executions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM skill_executions
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- 分析表
  ANALYZE skill_executions;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建新的触发器 (如果不存在)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_cleanup_executions'
  ) THEN
    CREATE TRIGGER trigger_cleanup_executions
    AFTER INSERT ON skill_executions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_executions();
  END IF;
END $$;

-- 13.2 重建索引的函数
-- 如果函数已存在，先删除再重建
DROP FUNCTION IF EXISTS rebuild_indexes();
CREATE OR REPLACE FUNCTION rebuild_indexes()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  -- 重建所有 skills 相关索引
  FOR r IN
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'skills'
  LOOP
    EXECUTE format('REINDEX INDEX %I', r.indexname);
  END LOOP;

  RAISE NOTICE 'Indexes rebuilt successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. 性能监控视图
-- =====================================================

-- 慢查询监控
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT
  pid,
  now() - query_start as duration,
  query,
  state,
  wait_event_type,
  usename
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - query_start > interval '100 milliseconds'
ORDER BY duration DESC;

-- 索引使用统计
CREATE OR REPLACE VIEW v_index_usage_stats AS
SELECT
  schemaname,
  relname as tablename,
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 表大小统计
CREATE OR REPLACE VIEW v_table_sizes AS
SELECT
  relname as table_name,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as data_size,
  pg_size_pretty(pg_indexes_size(relid)) as index_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- =====================================================
-- 完成检查清单
-- =====================================================
-- ✅ 复合索引已创建
-- ✅ 物化视图已创建
-- ✅ 监控视图已创建
-- ✅ 维护函数已创建
--
-- 下一步:
-- 1. 在 Supabase Dashboard 执行此脚本
-- 2. 验证索引创建成功
-- 3. 运行 EXPLAIN ANALYZE 测试查询性能
-- 4. 设置定时任务刷新物化视图
-- =====================================================
