-- =====================================================
-- 044 号迁移脚本预检查
-- =====================================================
-- 用途：在实际执行前验证所有索引的列名是否存在
-- 执行方式：在 Supabase SQL Editor 中先执行此脚本
-- =====================================================

DO $$
DECLARE
  v_count INTEGER;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  err TEXT;
BEGIN
  -- 1. 检查 skills 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skills' AND column_name IN ('category', 'shelf_status', 'review_status', 'rating', 'usage_count', 'created_at');
  IF v_count < 6 THEN
    v_errors := array_append(v_errors, '❌ skills 表缺少必要列');
  END IF;

  -- 2. 检查 skill_version_history 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_version_history' AND column_name IN ('skill_id', 'new_version', 'changed_by', 'created_at');
  IF v_count < 4 THEN
    v_errors := array_append(v_errors, '❌ skill_version_history 表缺少必要列 (应该是 new_version 不是 version)');
  END IF;

  -- 3. 检查 skill_reviews 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_reviews' AND column_name IN ('skill_id', 'is_approved', 'parent_id', 'rating', 'created_at');
  IF v_count < 5 THEN
    v_errors := array_append(v_errors, '❌ skill_reviews 表缺少必要列');
  END IF;

  -- 4. 检查 skill_executions 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_executions' AND column_name IN ('skill_id', 'user_id', 'status', 'execution_time', 'created_at');
  IF v_count < 5 THEN
    v_errors := array_append(v_errors, '❌ skill_executions 表缺少必要列');
  END IF;

  -- 5. 检查 skill_tags 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_tags' AND column_name IN ('is_hot', 'name', 'usage_count');
  IF v_count < 3 THEN
    v_errors := array_append(v_errors, '❌ skill_tags 表缺少必要列');
  END IF;

  -- 6. 检查 skill_documents 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_documents' AND column_name IN ('skill_id', 'category', 'order_index', 'is_published', 'published_at');
  IF v_count < 5 THEN
    v_errors := array_append(v_errors, '❌ skill_documents 表缺少必要列');
  END IF;

  -- 7. 检查 skill_recommendations 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_recommendations' AND column_name IN ('skill_id', 'recommendation_type', 'is_clicked');
  IF v_count < 3 THEN
    v_errors := array_append(v_errors, '❌ skill_recommendations 表缺少必要列 (没有 click_through_rate, 应该用 is_clicked)');
  END IF;

  -- 8. 检查 skill_sandboxes 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'skill_sandboxes' AND column_name IN ('user_id', 'skill_id', 'status', 'is_public', 'created_at');
  IF v_count < 5 THEN
    v_errors := array_append(v_errors, '❌ skill_sandboxes 表缺少必要列');
  END IF;

  -- 9. 检查 document_likes 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'document_likes' AND column_name IN ('document_id', 'user_id');
  IF v_count < 2 THEN
    v_errors := array_append(v_errors, '❌ document_likes 表缺少必要列');
  END IF;

  -- 10. 检查 admin_users 表
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'admin_users' AND column_name IN ('role', 'is_active');
  IF v_count < 2 THEN
    v_errors := array_append(v_errors, '❌ admin_users 表缺少必要列 (应该是 is_active 不是 status)');
  END IF;

  -- 输出结果
  IF array_length(v_errors, 1) > 0 THEN
    RAISE NOTICE '%', '发现以下问题:';
    FOREACH err IN ARRAY v_errors LOOP
      RAISE NOTICE '%', err;
    END LOOP;
    RAISE EXCEPTION '请先修复上述问题后再执行迁移脚本';
  ELSE
    RAISE NOTICE '✅ 所有表结构验证通过，可以安全执行迁移';
  END IF;
END $$;
