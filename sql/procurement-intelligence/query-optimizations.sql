-- 采购智能体数据库查询优化脚本
-- 包含索引优化、查询重构和性能提升方案

-- 1. 供应商智能档案表索引优化
-- 当前表结构分析和索引建议

-- 为常用查询字段创建复合索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_composite 
ON supplier_intelligence_profiles (
  business_scale, 
  registration_country, 
  compliance_status
) WHERE compliance_status = 'compliant';

-- 为供应商评分相关查询创建索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_rating 
ON supplier_intelligence_profiles (
  quality_score DESC, 
  delivery_score DESC, 
  price_score DESC
) WHERE quality_score >= 80 AND delivery_score >= 80;

-- 为地理位置查询创建索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_location 
ON supplier_intelligence_profiles (
  registration_country, 
  primary_business_region
);

-- 为行业分类查询创建索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_industry 
ON supplier_intelligence_profiles 
USING gin(industries_served);

-- 为认证资质查询创建索引
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_certifications 
ON supplier_intelligence_profiles 
USING gin(certifications);

-- 2. 国际价格指数表优化
-- 为时间序列查询创建索引
CREATE INDEX IF NOT EXISTS idx_price_indices_time_commodity 
ON international_price_indices (
  commodity, 
  recorded_at DESC
);

-- 为区域价格比较创建索引
CREATE INDEX IF NOT EXISTS idx_price_indices_region_commodity 
ON international_price_indices (
  region, 
  commodity, 
  recorded_at DESC
);

-- 为货币转换查询创建索引
CREATE INDEX IF NOT EXISTS idx_price_indices_currency 
ON international_price_indices (currency, recorded_at DESC);

-- 3. 采购决策审计表优化
-- 为决策追踪查询创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_request_id 
ON procurement_decision_audit (request_id);

-- 为时间范围查询创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_timestamp 
ON procurement_decision_audit (
  decision_timestamp DESC
);

-- 为决策结果查询创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_result 
ON procurement_decision_audit (
  final_recommendation, 
  confidence_score DESC
);

-- 4. 采购需求表优化
-- 为需求匹配查询创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_requirements_items 
ON procurement_requirements 
USING gin(items);

-- 为紧急程度查询创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_requirements_priority 
ON procurement_requirements (
  priority, 
  urgency_level DESC, 
  created_at DESC
);

-- 5. 视图优化 - 创建常用的聚合视图

-- 供应商综合评分视图
CREATE OR REPLACE VIEW v_supplier_comprehensive_scores AS
SELECT 
  supplier_id,
  company_name,
  registration_country,
  business_scale,
  quality_score,
  delivery_score,
  price_score,
  service_score,
  reliability_score,
  financial_health_score,
  ROUND(
    (quality_score * 0.3 + 
     delivery_score * 0.25 + 
     price_score * 0.2 + 
     service_score * 0.15 + 
     reliability_score * 0.1), 2
  ) AS composite_score,
  CASE 
    WHEN quality_score >= 90 AND delivery_score >= 90 THEN 'premium'
    WHEN quality_score >= 70 AND delivery_score >= 70 THEN 'standard'
    ELSE 'basic'
  END AS supplier_tier,
  compliance_status,
  ARRAY_LENGTH(industries_served, 1) AS industry_count,
  ARRAY_LENGTH(certifications, 1) AS certification_count,
  last_updated
FROM supplier_intelligence_profiles
WHERE compliance_status = 'compliant'
  AND quality_score IS NOT NULL
  AND delivery_score IS NOT NULL;

-- 最新市场价格指数视图
CREATE OR REPLACE VIEW v_latest_price_indices AS
WITH latest_records AS (
  SELECT 
    commodity,
    region,
    currency,
    MAX(recorded_at) as latest_time
  FROM international_price_indices
  GROUP BY commodity, region, currency
)
SELECT 
  ipi.*,
  ROUND(((ipi.price - lag_price.previous_price) / lag_price.previous_price * 100), 2) AS price_change_percent
FROM international_price_indices ipi
JOIN latest_records lr 
  ON ipi.commodity = lr.commodity 
  AND ipi.region = lr.region 
  AND ipi.currency = lr.currency 
  AND ipi.recorded_at = lr.latest_time
LEFT JOIN (
  SELECT 
    commodity,
    region,
    currency,
    recorded_at,
    price as previous_price,
    ROW_NUMBER() OVER (
      PARTITION BY commodity, region, currency 
      ORDER BY recorded_at DESC
    ) as rn
  FROM international_price_indices
  WHERE recorded_at < CURRENT_DATE - INTERVAL '30 days'
) lag_price 
  ON ipi.commodity = lag_price.commodity 
  AND ipi.region = lag_price.region 
  AND ipi.currency = lag_price.currency 
  AND lag_price.rn = 1;

-- 6. 函数优化 - 创建常用的查询函数

-- 获取顶级供应商函数
CREATE OR REPLACE FUNCTION get_top_suppliers(
  p_limit INTEGER DEFAULT 10,
  p_country TEXT DEFAULT NULL,
  p_industry TEXT DEFAULT NULL
) RETURNS TABLE (
  supplier_id TEXT,
  company_name TEXT,
  composite_score NUMERIC,
  quality_score NUMERIC,
  delivery_score NUMERIC,
  price_score NUMERIC,
  registration_country TEXT,
  business_scale TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.supplier_id,
    s.company_name,
    ROUND(
      (s.quality_score * 0.3 + 
       s.delivery_score * 0.25 + 
       s.price_score * 0.2 + 
       s.service_score * 0.15 + 
       s.reliability_score * 0.1), 2
    ) AS composite_score,
    s.quality_score,
    s.delivery_score,
    s.price_score,
    s.registration_country,
    s.business_scale
  FROM supplier_intelligence_profiles s
  WHERE s.compliance_status = 'compliant'
    AND s.quality_score >= 80
    AND s.delivery_score >= 80
    AND (p_country IS NULL OR s.registration_country = p_country)
    AND (p_industry IS NULL OR p_industry = ANY(s.industries_served))
  ORDER BY 
    (s.quality_score * 0.3 + 
     s.delivery_score * 0.25 + 
     s.price_score * 0.2 + 
     s.service_score * 0.15 + 
     s.reliability_score * 0.1) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 价格趋势分析函数
CREATE OR REPLACE FUNCTION analyze_price_trends(
  p_commodity TEXT,
  p_days INTEGER DEFAULT 30
) RETURNS TABLE (
  commodity TEXT,
  current_price NUMERIC,
  previous_price NUMERIC,
  price_change NUMERIC,
  price_change_percent NUMERIC,
  volatility_index NUMERIC,
  trend_direction TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH price_data AS (
    SELECT 
      price,
      recorded_at,
      LAG(price) OVER (ORDER BY recorded_at) as prev_price,
      STDDEV(price) OVER (ORDER BY recorded_at ROWS BETWEEN 4 PRECEDING AND CURRENT ROW) as rolling_stddev
    FROM international_price_indices
    WHERE commodity = p_commodity
      AND recorded_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ORDER BY recorded_at DESC
    LIMIT 50
  ),
  latest_prices AS (
    SELECT 
      price as current_price,
      prev_price as previous_price,
      (price - prev_price) as price_change,
      ROUND(((price - prev_price) / prev_price * 100), 2) as price_change_percent,
      COALESCE(rolling_stddev, 0) as volatility_index
    FROM price_data
    WHERE prev_price IS NOT NULL
    ORDER BY recorded_at DESC
    LIMIT 1
  )
  SELECT 
    p_commodity as commodity,
    current_price,
    previous_price,
    price_change,
    price_change_percent,
    ROUND(volatility_index, 2) as volatility_index,
    CASE 
      WHEN price_change_percent > 5 THEN 'strong_up'
      WHEN price_change_percent > 1 THEN 'moderate_up'
      WHEN price_change_percent > -1 THEN 'stable'
      WHEN price_change_percent > -5 THEN 'moderate_down'
      ELSE 'strong_down'
    END as trend_direction
  FROM latest_prices;
END;
$$ LANGUAGE plpgsql;

-- 7. 分区表建议（适用于大数据量场景）

-- 如果供应商档案数据量很大，可以考虑按国家分区
/*
CREATE TABLE supplier_intelligence_profiles_partitioned (
  LIKE supplier_intelligence_profiles INCLUDING ALL
) PARTITION BY LIST (registration_country);

-- 创建主要国家的分区
CREATE TABLE supplier_profiles_us PARTITION OF supplier_intelligence_profiles_partitioned
FOR VALUES IN ('United States', 'USA', 'US');

CREATE TABLE supplier_profiles_cn PARTITION OF supplier_intelligence_profiles_partitioned
FOR VALUES IN ('China', 'CN');

CREATE TABLE supplier_profiles_other PARTITION OF supplier_intelligence_profiles_partitioned
FOR VALUES IN (NULL, 'Other');
*/

-- 8. 统计信息更新
-- 确保查询优化器有最新的统计信息
ANALYZE supplier_intelligence_profiles;
ANALYZE international_price_indices;
ANALYZE procurement_decision_audit;
ANALYZE procurement_requirements;

-- 9. 查询计划分析示例
/*
-- 查看查询执行计划
EXPLAIN ANALYZE 
SELECT * FROM v_supplier_comprehensive_scores 
WHERE registration_country = 'China' 
ORDER BY composite_score DESC 
LIMIT 10;

-- 查看价格趋势分析执行计划
EXPLAIN ANALYZE 
SELECT * FROM analyze_price_trends('semiconductors', 30);
*/

-- 10. 监控查询性能的视图
CREATE OR REPLACE VIEW v_slow_queries_monitor AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- 平均执行时间超过100ms的查询
ORDER BY total_time DESC
LIMIT 20;

-- 输出优化完成信息
\echo '✅ 采购智能体数据库查询优化完成！'
\echo '已创建索引：8个'
\echo '已创建视图：2个'  
\echo '已创建函数：2个'
\echo '请运行 ANALYZE 命令更新统计信息'