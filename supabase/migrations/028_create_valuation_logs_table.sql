-- V-OPS-01: 估值日志管理系统
-- 创建估值日志表，记录每次估值的输入、输出、方法、置信度等信息

-- 创建估值日志主表
CREATE TABLE IF NOT EXISTS valuation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_qrcode_id TEXT NOT NULL,
    device_profile JSONB,
    condition_input JSONB,
    market_price NUMERIC,
    
    -- 估值结果
    final_value NUMERIC NOT NULL,
    valuation_method TEXT NOT NULL, -- 'ml', 'market', 'rule', 'hybrid', 'fused'
    confidence_score NUMERIC(5,4),
    confidence_level TEXT, -- 'high', 'medium', 'low'
    
    -- 融合详情
    fusion_details JSONB,
    breakdown JSONB,
    alternatives JSONB,
    
    -- 请求信息
    request_source TEXT, -- 'api', 'web', 'mobile', 'admin'
    client_ip INET,
    user_agent TEXT,
    api_key_used TEXT,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processing_time_ms INTEGER,
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    -- 索引优化
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT valid_method CHECK (valuation_method IN ('ml', 'market', 'rule', 'hybrid', 'fused'))
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_valuation_logs_device_qrcode ON valuation_logs(device_qrcode_id);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_created_at ON valuation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_method ON valuation_logs(valuation_method);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_confidence ON valuation_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_source ON valuation_logs(request_source);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_value_range ON valuation_logs(final_value);

-- 创建复合索引用于常用查询组合
CREATE INDEX IF NOT EXISTS idx_valuation_logs_device_method ON valuation_logs(device_qrcode_id, valuation_method);
CREATE INDEX IF NOT EXISTS idx_valuation_logs_date_method ON valuation_logs(DATE(created_at), valuation_method);

-- 创建统计分析视图
CREATE OR REPLACE VIEW valuation_logs_stats AS
SELECT 
    DATE(created_at) as log_date,
    valuation_method,
    COUNT(*) as total_requests,
    AVG(final_value) as avg_value,
    AVG(confidence_score) as avg_confidence,
    MIN(final_value) as min_value,
    MAX(final_value) as max_value,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(DISTINCT device_qrcode_id) as unique_devices
FROM valuation_logs
GROUP BY DATE(created_at), valuation_method
ORDER BY log_date DESC;

-- 创建方法分布统计视图
CREATE OR REPLACE VIEW valuation_method_distribution AS
SELECT 
    valuation_method,
    COUNT(*) as request_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage,
    AVG(confidence_score) as avg_confidence,
    AVG(final_value) as avg_value
FROM valuation_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY valuation_method
ORDER BY request_count DESC;

-- 创建置信度分析视图
CREATE OR REPLACE VIEW confidence_analysis AS
SELECT 
    CASE 
        WHEN confidence_score >= 0.8 THEN 'high'
        WHEN confidence_score >= 0.5 THEN 'medium'
        ELSE 'low'
    END as confidence_category,
    COUNT(*) as count,
    ROUND(AVG(final_value), 2) as avg_value,
    STRING_AGG(DISTINCT valuation_method, ', ') as methods_used
FROM valuation_logs
WHERE confidence_score IS NOT NULL
GROUP BY 
    CASE 
        WHEN confidence_score >= 0.8 THEN 'high'
        WHEN confidence_score >= 0.5 THEN 'medium'
        ELSE 'low'
    END
ORDER BY confidence_category;

-- 配置行级安全策略(RLS)
ALTER TABLE valuation_logs ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有日志
CREATE POLICY "Admins can view all valuation logs" ON valuation_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- 插入初始测试数据
INSERT INTO valuation_logs (
    device_qrcode_id,
    device_profile,
    condition_input,
    market_price,
    final_value,
    valuation_method,
    confidence_score,
    confidence_level,
    request_source,
    processing_time_ms,
    metadata
) VALUES 
(
    'TEST-DEVICE-001',
    '{"productModel": "iPhone 14", "brandName": "Apple", "productCategory": "手机"}'::jsonb,
    '{"screen": "minor_scratches", "battery": "good", "body": "light_wear"}'::jsonb,
    4500,
    3800,
    'fused',
    0.85,
    'high',
    'api',
    120,
    '{"test_record": true}'::jsonb
),
(
    'TEST-DEVICE-002',
    '{"productModel": "Samsung Galaxy S23", "brandName": "Samsung", "productCategory": "手机"}'::jsonb,
    '{"screen": "perfect", "battery": "excellent", "body": "perfect"}'::jsonb,
    5200,
    4600,
    'market',
    0.92,
    'high',
    'web',
    85,
    '{"test_record": true}'::jsonb
),
(
    'TEST-DEVICE-003',
    '{"productModel": "Huawei P50", "brandName": "Huawei", "productCategory": "手机"}'::jsonb,
    '{"screen": "heavy_damage", "battery": "poor", "body": "heavy_wear"}'::jsonb,
    2800,
    1900,
    'rule',
    0.65,
    'medium',
    'mobile',
    65,
    '{"test_record": true}'::jsonb
);

-- 验证表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'valuation_logs'
ORDER BY ordinal_position;