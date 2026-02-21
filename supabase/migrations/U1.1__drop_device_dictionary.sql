-- U1.1__drop_device_dictionary.sql
-- 回滚设备字典表创建
-- 版本: 1.1.0

-- 删除RLS策略
DROP POLICY IF EXISTS "允许所有人查看设备" ON devices;
DROP POLICY IF EXISTS "认证用户可管理设备" ON devices;

-- 删除表
DROP TABLE IF EXISTS devices;

-- 删除索引（如果存在）
DROP INDEX IF EXISTS idx_devices_brand;
DROP INDEX IF EXISTS idx_devices_model;
DROP INDEX IF EXISTS idx_devices_category;
DROP INDEX IF EXISTS idx_devices_os_type;

\echo '✅ 设备字典表回滚完成'