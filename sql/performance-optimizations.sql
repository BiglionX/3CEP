-- 采购智能体数据库性能优化
    
-- 1. 为常用查询字段添加索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_company_name 
ON supplier_intelligence_profiles(company_name);
    
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_score 
ON supplier_intelligence_profiles(overall_score DESC);
    
CREATE INDEX IF NOT EXISTS idx_market_indices_timestamp 
ON international_price_indices(created_at DESC);
    
-- 2. 优化查询语句
-- 预编译常用查询
PREPARE get_supplier_profile AS
SELECT * FROM supplier_intelligence_profiles 
WHERE supplier_id = $1;
    
PREPARE get_market_trends AS
SELECT * FROM international_price_indices 
WHERE commodity = $1 
ORDER BY created_at DESC 
LIMIT 50;
    
-- 3. 数据库连接池优化配置
-- 在应用配置中增加连接池大小
-- connectionPool: { min: 10, max: 50, idleTimeoutMillis: 30000 }