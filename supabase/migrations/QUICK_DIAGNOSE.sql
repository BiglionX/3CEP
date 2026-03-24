-- ============================================================
-- 快速诊断脚本 - 检查 status 字段是否存在
-- ============================================================

-- 1. 检查 agent_orders 表是否存在
SELECT 'agent_orders 表' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_name = 'agent_orders'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

-- 2. 检查 agent_orders.status 字段是否存在
SELECT 'agent_orders.status 字段' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'agent_orders' AND column_name = 'status'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

-- 3. 如果表存在，显示所有字段
SELECT 'agent_orders 表字段列表' as 说明，column_name as 字段名，data_type as 类型
FROM information_schema.columns
WHERE table_name = 'agent_orders'
ORDER BY ordinal_position;

-- 4. 检查 skill_orders 表是否存在
SELECT 'skill_orders 表' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_name = 'skill_orders'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

-- 5. 检查 skill_orders.status 字段是否存在
SELECT 'skill_orders.status 字段' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'skill_orders' AND column_name = 'status'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

-- 6. 如果表存在，显示所有字段
SELECT 'skill_orders 表字段列表' as 说明，column_name as 字段名，data_type as 类型
FROM information_schema.columns
WHERE table_name = 'skill_orders'
ORDER BY ordinal_position;

-- 7. 检查视图是否存在
SELECT 'agent_daily_stats 视图' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_views
         WHERE viewname = 'agent_daily_stats'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

SELECT 'skill_daily_stats 视图' as 检查项，
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_views
         WHERE viewname = 'skill_daily_stats'
       ) THEN '✅ 存在' ELSE '❌ 不存在' END as 状态;

-- ============================================================
-- 修复建议
-- ============================================================

-- 如果 agent_orders 表存在但没有 status 字段：
-- 执行以下命令删除旧表（下次执行迁移文件时会重新创建）
-- DROP TABLE IF EXISTS agent_orders CASCADE;
-- DROP VIEW IF EXISTS agent_daily_stats;

-- 如果 skill_orders 表存在但没有 status 字段：
-- 执行以下命令删除旧表（下次执行迁移文件时会重新创建）
-- DROP TABLE IF EXISTS skill_orders CASCADE;
-- DROP VIEW IF EXISTS skill_daily_stats;
