-- 完整数据库表结构检查脚本
-- 用于诊断所有相关表的状态

-- ========================================
-- 1. 检查核心表是否存在
-- ========================================

SELECT
  table_name,
  '✅ 存在' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'agents',
  'agent_orders',
  'user_agent_installations',
  'agent_audit_logs',
  'profiles'
)
ORDER BY table_name;

-- ========================================
-- 2. 检查可选表是否存在
-- ========================================

SELECT
  table_name,
  '⚠️ 可选' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'notifications',
  'agent_subscription_reminders'
)
ORDER BY table_name;

-- ========================================
-- 3. 显示所有 agent_ 开头的表
-- ========================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'agent_%'
ORDER BY table_name;

-- ========================================
-- 4. 检查 profiles 表的 tenant_id 字段
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'tenant_id';

-- 如果没有返回结果，说明 tenant_id 字段还不存在

-- ========================================
-- 5. 检查 agents 表的结构
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
ORDER BY ordinal_position;

-- ========================================
-- 6. 检查 agent_orders 表的结构
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_orders'
ORDER BY ordinal_position;

-- ========================================
-- 7. 检查 user_agent_installations 表
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_agent_installations'
ORDER BY ordinal_position;

-- ========================================
-- 8. 检查 agent_audit_logs 表
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_audit_logs'
ORDER BY ordinal_position;

-- ========================================
-- 9. 统计信息
-- ========================================

SELECT
  '核心表总数' as item,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'agents',
  'agent_orders',
  'user_agent_installations',
  'agent_audit_logs',
  'profiles'
)
UNION ALL
SELECT
  '可选表总数',
  COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'notifications',
  'agent_subscription_reminders'
);
