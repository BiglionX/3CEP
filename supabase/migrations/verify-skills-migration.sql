-- ============================================================
-- Skills 功能数据库迁移完整性检查脚本
-- ============================================================
-- 用途：验证所有 Skills 相关的表、字段、索引、RLS 策略是否已正确创建
-- 执行方式：在 Supabase SQL Editor 中直接运行
-- ============================================================

DO $$
DECLARE
  v_total_tables INTEGER;
  v_total_columns INTEGER;
  v_total_indexes INTEGER;
  v_total_policies INTEGER;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_success BOOLEAN := TRUE;
  err TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Skills 数据库迁移完整性检查';
  RAISE NOTICE '========================================';

  -- ========================================
  -- 1. 检查核心表是否存在 (12 个表)
  -- ========================================
  SELECT COUNT(*) INTO v_total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'skills',                    -- Skill 主表
    'skill_categories',          -- 分类表
    'skill_audit_logs',         -- 审核日志表
    'skill_versions',           -- 版本表
    'skill_orders',             -- 订单表
    'skill_reviews',            -- 评论表
    'skill_version_history',    -- 版本历史表
    'skill_executions',         -- 执行日志表
    'skill_tags',               -- 标签表
    'skill_recommendations',    -- 推荐表
    'skill_sandboxes',          -- 沙箱表
    'skill_documents'           -- 文档表
  );

  IF v_total_tables < 12 THEN
    v_errors := array_append(v_errors,
      '❌ 核心表缺失：期望 12 个，实际 ' || v_total_tables || ' 个');
    v_success := FALSE;
  ELSE
    RAISE NOTICE '✅ 核心表检查：12/12 已创建';
  END IF;

  -- ========================================
  -- 2. 检查 skills 表的关键字段
  -- ========================================
  SELECT COUNT(*) INTO v_total_columns
  FROM information_schema.columns
  WHERE table_name = 'skills'
  AND column_name IN (
    'id', 'name', 'title', 'description', 'category',
    'review_status', 'shelf_status', 'price', 'developer_id',
    'view_count', 'usage_count', 'rating', 'version'
  );

  IF v_total_columns < 13 THEN
    v_errors := array_append(v_errors,
      '❌ skills 表缺少关键字段：期望 13 个，实际 ' || v_total_columns || ' 个');
    v_success := FALSE;
  ELSE
    RAISE NOTICE '✅ skills 表字段：13/13 关键字段存在';
  END IF;

  -- ========================================
  -- 3. 检查 skill_version_history 表结构
  -- ========================================
  SELECT COUNT(*) INTO v_total_columns
  FROM information_schema.columns
  WHERE table_name = 'skill_version_history'
  AND column_name IN ('skill_id', 'new_version', 'changes', 'changed_by', 'created_at');

  IF v_total_columns < 5 THEN
    v_errors := array_append(v_errors,
      '❌ skill_version_history 表结构不完整');
    v_success := FALSE;
  ELSE
    RAISE NOTICE '✅ skill_version_history 表：5/5 关键字段存在';
  END IF;

  -- ========================================
  -- 4. 检查 RLS 策略是否启用
  -- ========================================
  SELECT COUNT(*) INTO v_total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename LIKE 'skill_%';

  IF v_total_policies < 20 THEN
    v_errors := array_append(v_errors,
      '⚠️ RLS 策略可能不完整：期望至少 20 个，实际 ' || v_total_policies || ' 个');
    -- 不标记为失败，因为可能有部分策略
  ELSE
    RAISE NOTICE '✅ RLS 策略：% 个已启用', v_total_policies;
  END IF;

  -- ========================================
  -- 5. 检查索引数量
  -- ========================================
  SELECT COUNT(*) INTO v_total_indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename LIKE 'skill_%';

  IF v_total_indexes < 30 THEN
    v_errors := array_append(v_errors,
      '⚠️ 索引可能不完整：期望至少 30 个，实际 ' || v_total_indexes || ' 个');
  ELSE
    RAISE NOTICE '✅ 索引优化：% 个已创建', v_total_indexes;
  END IF;

  -- ========================================
  -- 6. 检查默认分类数据
  -- ========================================
  SELECT COUNT(*) INTO v_total_columns
  FROM skill_categories;

  IF v_total_columns < 8 THEN
    v_errors := array_append(v_errors,
      '⚠️ 默认分类数据不足：期望至少 8 个，实际 ' || v_total_columns || ' 个');
  ELSE
    RAISE NOTICE '✅ 分类数据：% 个已插入', v_total_columns;
  END IF;

  -- ========================================
  -- 7. 检查触发器
  -- ========================================
  SELECT COUNT(*) INTO v_total_columns
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%skill%' OR trigger_name LIKE '%version%');

  IF v_total_columns < 5 THEN
    v_errors := array_append(v_errors,
      '⚠️ 触发器可能缺失：期望至少 5 个，实际 ' || v_total_columns || ' 个');
  ELSE
    RAISE NOTICE '✅ 触发器：% 个已创建', v_total_columns;
  END IF;

  -- ========================================
  -- 输出最终结果
  -- ========================================
  RAISE NOTICE '========================================';

  IF v_success AND array_length(v_errors, 1) IS NULL THEN
    RAISE NOTICE '🎉 检查通过！所有 Skills 迁移已完成';
    RAISE NOTICE '';
    RAISE NOTICE '统计信息:';
    RAISE NOTICE '- 核心表：12 个 ✅';
    RAISE NOTICE '- 关键字段：完整 ✅';
    RAISE NOTICE '- RLS 策略：% 个 ✅', v_total_policies;
    RAISE NOTICE '- 索引：% 个 ✅', v_total_indexes;
    RAISE NOTICE '- 分类数据：% 个 ✅', v_total_columns;
  ELSE
    RAISE NOTICE '⚠️ 发现以下问题:';
    FOREACH err IN ARRAY v_errors LOOP
      RAISE NOTICE '%', err;
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE '建议：重新执行缺失的迁移脚本';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- 详细表结构检查 (单独执行每个查询)
-- ============================================================

-- 1. 查看所有 skill_开头的表
SELECT
  table_name as "表名",
  '✅' as "状态"
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'skill_%'
ORDER BY table_name;

-- 2. 检查 skills 表完整结构
SELECT
  column_name as "字段名",
  data_type as "类型",
  is_nullable as "可空",
  column_default as "默认值"
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position;

-- 3. 检查各表记录数
SELECT
  'skills' as "表名", COUNT(*) as "记录数" FROM skills
UNION ALL
SELECT 'skill_categories', COUNT(*) FROM skill_categories
UNION ALL
SELECT 'skill_reviews', COUNT(*) FROM skill_reviews
UNION ALL
SELECT 'skill_tags', COUNT(*) FROM skill_tags
UNION ALL
SELECT 'skill_documents', COUNT(*) FROM skill_documents;

-- 4. 查看 RLS 策略详情
SELECT
  schemaname as "模式",
  tablename as "表名",
  policyname as "策略名",
  permissive as "类型",
  roles as "角色",
  cmd as "命令",
  qual as "条件"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'skill_%'
ORDER BY tablename, policyname;

-- 5. 查看索引详情
SELECT
  tablename as "表名",
  indexname as "索引名",
  indexdef as "定义"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'skill_%'
ORDER BY tablename, indexname;
