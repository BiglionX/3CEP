-- U1.3__drop_hot_links_pool.sql
-- 回滚热点链接池表创建
-- 版本: 1.3.0

-- 删除RLS策略
DROP POLICY IF EXISTS "允许所有人查看热点链接" ON hot_links;
DROP POLICY IF EXISTS "认证用户可管理热点链接" ON hot_links;

-- 删除表
DROP TABLE IF EXISTS hot_links;

-- 删除索引（如果存在）
DROP INDEX IF EXISTS idx_hot_links_category;
DROP INDEX IF EXISTS idx_hot_links_sub_category;

\echo '✅ 热点链接池表回滚完成'