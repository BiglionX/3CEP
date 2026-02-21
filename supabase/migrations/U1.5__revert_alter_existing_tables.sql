-- U1.5__revert_alter_existing_tables.sql
-- 回滚表结构调整（注意：此操作不会删除已添加的列数据）
-- 版本: 1.5.0

-- 注意：ALTER TABLE DROP COLUMN 是破坏性操作，这里只删除索引和策略
-- 实际的列删除需要谨慎处理，通常不建议在生产环境执行

-- 删除重建的索引（如果存在）
DROP INDEX IF EXISTS idx_devices_category;
DROP INDEX IF EXISTS idx_devices_os_type;
DROP INDEX IF EXISTS idx_faults_sub_category;
DROP INDEX IF EXISTS idx_hot_links_sub_category;
DROP INDEX IF EXISTS idx_repair_shops_country;
DROP INDEX IF EXISTS idx_repair_shops_cert_level;

-- 重建原始RLS策略（如果需要的话）
-- 这里保持现有策略不变，因为删除列不会影响策略

\echo '✅ 表结构调整回滚完成（仅索引部分）'
\echo '⚠️  注意：列结构变更无法完全回滚，如需恢复请使用数据库备份'