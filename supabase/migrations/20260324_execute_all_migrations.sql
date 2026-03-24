-- ============================================
-- 数据库迁移执行脚本
-- 包含：subscription pause fields + reminders
-- 执行时间：2026-03-24
-- ============================================

-- 1. 执行订阅暂停字段迁移
-- 注意：请依次手动执行以下两个迁移文件
-- 第一步：执行 20260324_add_subscription_pause_fields.sql
-- 第二步：执行 20260324_create_subscription_reminders.sql

-- ============================================
-- 验证查询（在执行完上述两个迁移后运行）
-- ============================================

-- 检查 user_agent_installations 表的新字段
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_agent_installations'
  AND column_name IN (
    'paused_at',
    'resumed_at',
    'pause_reason',
    'max_pause_count',
    'current_pause_count'
  )
ORDER BY ordinal_position;

-- 检查 agent_subscription_reminders 表
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'agent_subscription_reminders'
ORDER BY ordinal_position;

-- 检查索引
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_agent_installations', 'agent_subscription_reminders')
  AND (indexname LIKE '%pause%' OR indexname LIKE '%reminder%')
ORDER BY tablename, indexname;

-- ============================================
-- 迁移执行说明
-- ============================================
-- 1. 在 Supabase Dashboard 中依次执行:
--    a. 20260324_add_subscription_pause_fields.sql
--    b. 20260324_create_subscription_reminders.sql
-- 2. 然后运行本文件的验证查询部分
-- 3. 或使用命令行工具:
--    psql $DATABASE_URL -f 20260324_add_subscription_pause_fields.sql
--    psql $DATABASE_URL -f 20260324_create_subscription_reminders.sql
--    psql $DATABASE_URL -f 20260324_execute_all_migrations.sql
-- ============================================
