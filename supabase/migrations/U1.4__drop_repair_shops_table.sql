-- U1.4__drop_repair_shops_table.sql
-- 回滚维修店铺表创建
-- 版本: 1.4.0

-- 删除RLS策略
DROP POLICY IF EXISTS "允许所有人查看维修店铺" ON repair_shops;
DROP POLICY IF EXISTS "认证用户可管理维修店铺" ON repair_shops;

-- 删除表
DROP TABLE IF EXISTS repair_shops;

-- 删除索引（如果存在）
DROP INDEX IF EXISTS idx_repair_shops_city;
DROP INDEX IF EXISTS idx_repair_shops_province;
DROP INDEX IF EXISTS idx_repair_shops_country;
DROP INDEX IF EXISTS idx_repair_shops_rating;
DROP INDEX IF EXISTS idx_repair_shops_is_verified;
DROP INDEX IF EXISTS idx_repair_shops_cert_level;

\echo '✅ 维修店铺表回滚完成'