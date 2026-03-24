-- 数据库表存在性检查脚本
-- 用于诊断哪些表存在，哪些不存在

-- 检查所有相关的表
SELECT
  table_name,
  CASE
    WHEN table_name IS NOT NULL THEN '✅ 存在'
    ELSE '❌ 不存在'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'agents',
  'agent_orders',
  'user_agent_installations',
  'agent_audit_logs',
  'notifications',
  'agent_subscription_reminders',
  'profiles'
)
ORDER BY table_name;

-- 显示所有以 agent_ 开头的表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'agent_%'
ORDER BY table_name;

-- 显示 profiles 表的结构（确认 tenant_id 是否已存在）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
