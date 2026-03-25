-- =====================================================
-- 检查所有相关表的实际列名
-- =====================================================
-- 用途：避免在创建索引时使用不存在的列名
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. skill_version_history 表结构
SELECT
  'skill_version_history' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_version_history'
ORDER BY ordinal_position;

-- 2. skill_executions 表结构
SELECT
  'skill_executions' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_executions'
ORDER BY ordinal_position;

-- 3. skill_reviews 表结构
SELECT
  'skill_reviews' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_reviews'
ORDER BY ordinal_position;

-- 4. skill_documents 表结构
SELECT
  'skill_documents' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_documents'
ORDER BY ordinal_position;

-- 5. skill_recommendations 表结构
SELECT
  'skill_recommendations' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_recommendations'
ORDER BY ordinal_position;

-- 6. skill_sandboxes 表结构
SELECT
  'skill_sandboxes' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'skill_sandboxes'
ORDER BY ordinal_position;

-- 7. document_likes 表结构
SELECT
  'document_likes' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'document_likes'
ORDER BY ordinal_position;

-- 8. admin_users 表结构
SELECT
  'admin_users' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- =====================================================
-- 预期结果:
-- skill_version_history: id, skill_id, old_version, new_version, changes, changed_by, created_at
-- skill_executions: id, user_id, skill_id, input_params, output, execution_time, memory_usage, status, error_message, created_at
-- skill_reviews: id, skill_id, user_id, parent_id, content, rating, is_approved, is_offensive, created_at
-- skill_documents: id, skill_id, title, slug, content_type, content, summary, category, version, order_index, is_published, is_official, published_at, view_count, like_count, help_count, meta_title, meta_description, keywords, created_at, updated_at
-- skill_recommendations: id, skill_id, recommended_skill_id, recommendation_type, similarity_score, click_through_rate, impression_count, click_count, created_at
-- skill_sandboxes: id, user_id, skill_id, test_name, input_params, expected_output, actual_output, execution_time, memory_usage, status, error_message, is_public, tags, created_at, updated_at
-- document_likes: id, document_id, user_id, is_helpful, created_at
-- admin_users: user_id, email, role, permissions, is_active, created_at, updated_at
-- =====================================================
