-- U1.2__drop_fault_type_dictionary.sql
-- 回滚故障类型字典表创建
-- 版本: 1.2.0

-- 删除RLS策略
DROP POLICY IF EXISTS "允许所有人查看故障类型" ON fault_types;
DROP POLICY IF EXISTS "认证用户可管理故障类型" ON fault_types;

-- 删除表
DROP TABLE IF EXISTS fault_types;

-- 删除索引（如果存在）
DROP INDEX IF EXISTS idx_faults_category;
DROP INDEX IF EXISTS idx_faults_sub_category;

\echo '✅ 故障类型字典表回滚完成'