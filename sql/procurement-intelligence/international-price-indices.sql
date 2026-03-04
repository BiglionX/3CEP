-- 国际市场价格指数系统表结构 (B002)
-- 用于存储和管理全球商品价格数据，支持智能采购决策

-- 1. 商品分类维度表
CREATE TABLE IF NOT EXISTS commodity_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id UUID REFERENCES commodity_categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 国际价格指数主表
CREATE TABLE IF NOT EXISTS international_price_indices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commodity_id UUID NOT NULL REFERENCES commodity_categories(id) ON DELETE CASCADE,
    region_code VARCHAR(20) NOT NULL,  -- 如: asia_pacific, north_america, europe
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    price DECIMAL(15,4) NOT NULL,
    price_date DATE NOT NULL,
    source_system VARCHAR(50) NOT NULL,  -- 数据来源标识：commerce_ministry, customs,行业协会等
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),
    volatility_index DECIMAL(5,4),  -- 波动率指数 (0-1)
    seasonality_factor DECIMAL(5,4),  -- 季节性因子 (0-2)
    moving_average_7d DECIMAL(15,4),  -- 7日移动平均
    moving_average_30d DECIMAL(15,4), -- 30日移动平均
    price_percentile_50 DECIMAL(15,4), -- 50分位数价格
    price_percentile_90 DECIMAL(15,4), -- 90分位数价格
    metadata JSONB,  -- 扩展属性存储
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 确保同一商品在同一地区同一日期的唯一性
    UNIQUE(commodity_id, region_code, price_date, source_system)
);

-- 3. 价格数据源配置表
CREATE TABLE IF NOT EXISTS price_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_code VARCHAR(50) UNIQUE NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('government', 'industry', 'exchange', 'custom')),
    base_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    crawl_frequency INTERVAL,  -- 爬取频率
    last_crawl_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    authentication_config JSONB,  -- 认证配置
    data_format VARCHAR(20) DEFAULT 'json',  -- 数据格式
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 价格采集任务记录表
CREATE TABLE IF NOT EXISTS price_collection_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES price_data_sources(id),
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('scheduled', 'manual', 'backfill')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    error_message TEXT,
    execution_log JSONB,  -- 执行日志
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 价格异常检测记录表
CREATE TABLE IF NOT EXISTS price_anomaly_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    price_index_id UUID NOT NULL REFERENCES international_price_indices(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL,  -- 异常类型：outlier, spike, drop, seasonal_deviation
    deviation_value DECIMAL(10,4),  -- 偏离值
    detection_method VARCHAR(50),   -- 检测方法
    confidence_level DECIMAL(3,2),  -- 置信度
    reviewed BOOLEAN DEFAULT FALSE, -- 是否已审核
    review_notes TEXT,              -- 审核备注
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 6. 地区汇率对照表
CREATE TABLE IF NOT EXISTS regional_exchange_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    region_code VARCHAR(20) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_currency, to_currency, region_code, rate_date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_commodity_categories_code ON commodity_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_commodity_categories_parent ON commodity_categories(parent_category_id);

CREATE INDEX IF NOT EXISTS idx_price_indices_commodity_date ON international_price_indices(commodity_id, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_indices_region_date ON international_price_indices(region_code, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_indices_source_date ON international_price_indices(source_system, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_indices_trend ON international_price_indices(trend_direction);
CREATE INDEX IF NOT EXISTS idx_price_indices_volatility ON international_price_indices(volatility_index DESC);

CREATE INDEX IF NOT EXISTS idx_data_sources_type_active ON price_data_sources(source_type, is_active);
CREATE INDEX IF NOT EXISTS idx_data_sources_last_crawl ON price_data_sources(last_crawl_time DESC);

CREATE INDEX IF NOT EXISTS idx_collection_jobs_status_time ON price_collection_jobs(status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_collection_jobs_source_time ON price_collection_jobs(source_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_records_type_time ON price_anomaly_records(anomaly_type, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_records_reviewed ON price_anomaly_records(reviewed, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies_date ON regional_exchange_rates(from_currency, to_currency, rate_date DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commodity_categories_updated_at 
    BEFORE UPDATE ON commodity_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_international_price_indices_updated_at 
    BEFORE UPDATE ON international_price_indices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_data_sources_updated_at 
    BEFORE UPDATE ON price_data_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略 (RLS)
ALTER TABLE commodity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE international_price_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_collection_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_anomaly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_exchange_rates ENABLE ROW LEVEL SECURITY;

-- 基础RLS策略：允许认证用户读取公共数据
CREATE POLICY "Enable read access for authenticated users" ON commodity_categories 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON international_price_indices 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON price_data_sources 
FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "Enable read access for authenticated users" ON regional_exchange_rates 
FOR SELECT USING (auth.role() = 'authenticated');

-- 管理员权限策略
CREATE POLICY "Enable full access for admins" ON commodity_categories 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Enable full access for admins" ON price_data_sources 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Enable full access for admins" ON price_collection_jobs 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Enable full access for admins" ON price_anomaly_records 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 初始化基础商品分类数据
INSERT INTO commodity_categories (category_code, category_name, unit_of_measure, description) VALUES
-- 电子产品类
('ELEC_SMARTPHONE', '智能手机', 'unit', '各类智能手机设备'),
('ELEC_LAPTOP', '笔记本电脑', 'unit', '便携式计算机设备'),
('ELEC_TABLET', '平板电脑', 'unit', '平板触屏设备'),

-- 工业原材料类
('MAT_STEEL', '钢材', 'ton', '各类钢铁材料'),
('MAT_ALUMINUM', '铝材', 'ton', '铝合金材料'),
('MAT_COPPER', '铜材', 'ton', '电解铜材料'),
('MAT_PLASTIC', '塑料原料', 'ton', '聚乙烯等塑料粒子'),

-- 消费品类
('CONS_CLOTHING', '服装纺织品', 'piece', '各类服装产品'),
('CONS_FOOD', '食品饮料', 'kg', '加工食品和饮品'),
('CONS_COSMETICS', '化妆品', 'unit', '护肤品和彩妆产品'),

-- 机械设备类
('MACH_TOOL', '机床设备', 'unit', '数控机床等工业设备'),
('MACH_AUTO', '汽车零部件', 'unit', '汽车制造配套件'),
('MACH_MEDICAL', '医疗器械', 'unit', '医疗诊断治疗设备')
ON CONFLICT (category_code) DO NOTHING;

-- 初始化数据源配置
INSERT INTO price_data_sources (source_code, source_name, source_type, base_url, crawl_frequency, data_format) VALUES
('COMMERCE_MINISTRY_CN', '中华人民共和国商务部', 'government', 'http://www.mofcom.gov.cn', '1 day', 'html'),
('CUSTOMS_CN', '中华人民共和国海关总署', 'government', 'http://www.customs.gov.cn', '1 day', 'html'),
('STATS_CN', '国家统计局', 'government', 'http://www.stats.gov.cn', '1 week', 'json'),
('CCTD', '中国煤炭交易中心', 'industry', 'http://www.cctd.com.cn', '1 day', 'json'),
('SHFE', '上海期货交易所', 'exchange', 'http://www.shfe.com.cn', '1 hour', 'json')
ON CONFLICT (source_code) DO NOTHING;

-- 创建视图：最新价格指数概览
CREATE OR REPLACE VIEW latest_price_indices AS
SELECT 
    c.category_code,
    c.category_name,
    ipi.region_code,
    ipi.currency_code,
    ipi.price,
    ipi.price_date,
    ipi.trend_direction,
    ipi.volatility_index,
    ipi.confidence_score,
    ipi.source_system,
    ipi.moving_average_7d,
    ipi.moving_average_30d
FROM international_price_indices ipi
JOIN commodity_categories c ON ipi.commodity_id = c.id
WHERE ipi.price_date = (
    SELECT MAX(price_date) 
    FROM international_price_indices ipi2 
    WHERE ipi2.commodity_id = ipi.commodity_id 
    AND ipi2.region_code = ipi.region_code
);

-- 创建视图：价格趋势分析
CREATE OR REPLACE VIEW price_trend_analysis AS
SELECT 
    c.category_code,
    c.category_name,
    ipi.region_code,
    COUNT(*) as data_points,
    AVG(ipi.price) as avg_price,
    MIN(ipi.price) as min_price,
    MAX(ipi.price) as max_price,
    STDDEV(ipi.price) as price_stddev,
    AVG(ipi.volatility_index) as avg_volatility,
    MODE() WITHIN GROUP (ORDER BY ipi.trend_direction) as dominant_trend
FROM international_price_indices ipi
JOIN commodity_categories c ON ipi.commodity_id = c.id
WHERE ipi.price_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.category_code, c.category_name, ipi.region_code;