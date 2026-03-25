-- =====================================================
-- 检查对象依赖关系
-- =====================================================
-- 用途：查看函数、视图、触发器之间的依赖关系
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. 检查 cleanup_old_executions 函数的依赖
SELECT
  'cleanup_old_executions' as function_name,
  d.refobjid::regclass as dependent_table,
  d.objid::regproc as dependent_function,
  t.tgname as trigger_name
FROM pg_depend d
JOIN pg_trigger t ON t.tgfoid = d.objid
WHERE d.objid = 'cleanup_old_executions'::regproc;

-- 2. 检查所有技能相关的触发器
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relname LIKE 'skill%'
ORDER BY c.relname, t.tgname;

-- 3. 检查物化视图依赖
SELECT
  mv.matviewname as materialized_view,
  d.refobjid::regclass as depends_on_table
FROM pg_matviews mv
JOIN pg_depend d ON d.objid = (
  SELECT oid FROM pg_class WHERE relname = mv.matviewname
)
WHERE mv.schemaname = 'public'
AND mv.matviewname LIKE '%skill%';

-- 4. 检查函数被哪些对象使用
SELECT
  p.proname as function_name,
  n.nspname as schema_name,
  CASE
    WHEN d.deptype = 'a' THEN 'SQL body'
    WHEN d.deptype = 'n' THEN 'Normal dependency'
    WHEN d.deptype = 'i' THEN 'Internal dependency'
    ELSE d.deptype::text
  END as dependency_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN pg_depend d ON d.objid = p.oid
WHERE p.proname IN (
  'cleanup_old_executions',
  'rebuild_indexes',
  'refresh_skill_hot_stats',
  'cleanup_old_version_history'
)
ORDER BY p.proname;

-- 5. 检查是否有定时任务调用这些函数
SELECT
  schedule_id,
  schedule_name,
  database_name,
  role_name,
  sql
FROM pgtt_schema.pg_cron_job
WHERE sql LIKE '%cleanup_old_executions%'
   OR sql LIKE '%refresh_skill_hot_stats%'
   OR sql LIKE '%rebuild_indexes%';

-- 6. 查看完整的触发器定义
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE t.tgname LIKE '%cleanup%'
   OR t.tgname LIKE '%skill%';

-- =====================================================
-- 预期结果:
-- - cleanup_old_executions 被 trigger_cleanup_executions 依赖
-- - 该触发器在 skill_executions 表上
-- - 删除函数前需要先删除触发器
-- =====================================================
