-- 创建市场数据存储表
-- 用于存储从闲鱼、转转等平台采集的二手设备价格数据

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_model VARCHAR(100) NOT NULL,
  avg_price DECIMAL(10,2),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  median_price DECIMAL(10,2),
  sample_count INTEGER DEFAULT 0,
  source VARCHAR(20) NOT NULL CHECK (source IN ('xianyu', 'zhuan_turn', 'aggregate')),
  freshness_score DECIMAL(3,2) DEFAULT 1.0 CHECK (freshness_score >= 0 AND freshness_score <= 1.0),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_market_prices_model_source 
  ON market_prices(device_model, source);

CREATE INDEX IF NOT EXISTS idx_market_prices_collected_at 
  ON market_prices(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_freshness 
  ON market_prices(freshness_score DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_model 
  ON market_prices(device_model);

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_market_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_market_prices_updated_at
  BEFORE UPDATE ON market_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_market_prices_updated_at();

-- 添加表注释
COMMENT ON TABLE market_prices IS '市场二手设备价格数据表，存储从各平台采集的价格信息';
COMMENT ON COLUMN market_prices.device_model IS '设备型号';
COMMENT ON COLUMN market_prices.avg_price IS '平均价格';
COMMENT ON COLUMN market_prices.min_price IS '最低价格';
COMMENT ON COLUMN market_prices.max_price IS '最高价格';
COMMENT ON COLUMN market_prices.median_price IS '中位数价格';
COMMENT ON COLUMN market_prices.sample_count IS '样本数量';
COMMENT ON COLUMN market_prices.source IS '数据来源平台';
COMMENT ON COLUMN market_prices.freshness_score IS '数据新鲜度评分(0-1)';
COMMENT ON COLUMN market_prices.collected_at IS '数据采集时间';

-- 插入测试数据
INSERT INTO market_prices (
  device_model, avg_price, min_price, max_price, median_price, 
  sample_count, source, freshness_score
) VALUES 
  ('iPhone 14', 4500.00, 3800.00, 5200.00, 4450.00, 25, 'xianyu', 0.95),
  ('iPhone 13', 3200.00, 2800.00, 3800.00, 3150.00, 18, 'xianyu', 0.88),
  ('iPhone 14', 4300.00, 3600.00, 5000.00, 4250.00, 15, 'zhuan_turn', 0.92),
  ('Samsung Galaxy S23', 3800.00, 3200.00, 4500.00, 3750.00, 12, 'xianyu', 0.85)
ON CONFLICT DO NOTHING;

-- 验证表创建
SELECT '✅ market_prices 表创建成功' as status;
SELECT COUNT(*) as record_count FROM market_prices;