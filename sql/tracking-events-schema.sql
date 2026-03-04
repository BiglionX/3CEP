-- 埋点事件数据表迁移脚本

-- 创建埋点事件表
CREATE TABLE IF NOT EXISTS tracking_events (
    id BIGSERIAL PRIMARY KEY,
    app_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id VARCHAR(100),

    -- 页面上下文信息
    page_name VARCHAR(255),
    page_path VARCHAR(500),
    referrer TEXT,
    url TEXT,
    title VARCHAR(255),

    -- 设备信息
    user_agent TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),

    -- 事件数据
    event_data JSONB,
    metadata JSONB,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tracking_events_app_id ON tracking_events(app_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_device_type ON tracking_events(device_type);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_tracking_events_app_timestamp ON tracking_events(app_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_event_type ON tracking_events(user_id, event_type);

-- 创建函数自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_tracking_events_updated_at ON tracking_events;
CREATE TRIGGER update_tracking_events_updated_at
    BEFORE UPDATE ON tracking_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建视图用于常用查询
CREATE OR REPLACE VIEW tracking_events_summary AS
SELECT
    app_id,
    event_type,
    device_type,
    DATE(timestamp) as event_date,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM tracking_events
GROUP BY app_id, event_type, device_type, DATE(timestamp);

-- 创建每日汇总表（可选，用于大数据量场景）
CREATE TABLE IF NOT EXISTS tracking_events_daily_summary (
    id BIGSERIAL PRIMARY KEY,
    app_id VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    device_type VARCHAR(20),
    event_count BIGINT DEFAULT 0,
    unique_users BIGINT DEFAULT 0,
    unique_sessions BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(app_id, event_date, event_type, device_type)
);

-- 创建分区表（适用于超大数据量）
CREATE TABLE IF NOT EXISTS tracking_events_partitioned (
    LIKE tracking_events INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- 创建最近30天的分区（示例）
-- 注意：实际使用时需要根据数据量调整分区策略
/*
CREATE TABLE tracking_events_2024_01 PARTITION OF tracking_events_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE tracking_events_2024_02 PARTITION OF tracking_events_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
*/

-- 插入一些示例数据用于测试
INSERT INTO tracking_events (
    app_id, session_id, event_id, event_type, timestamp, user_id,
    page_name, page_path, referrer, url, title,
    user_agent, screen_width, screen_height, device_type, browser, os,
    event_data, metadata
) VALUES
(
    '3cep-app',
    'sess_test_001',
    'evt_test_001',
    'page_view',
    NOW() - INTERVAL '1 hour',
    'user_001',
    '首页',
    '/',
    '',
    'https://3cep.example.com/',
    '3CEP - 智能企业平台',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    1920,
    1080,
    'desktop',
    'Chrome',
    'Windows',
    '{"duration": 120}',
    '{"collectorVersion": "1.0.0", "isValid": true}'
),
(
    '3cep-app',
    'sess_test_001',
    'evt_test_002',
    'click',
    NOW() - INTERVAL '55 minutes',
    'user_001',
    '首页',
    '/',
    '',
    'https://3cep.example.com/',
    '3CEP - 智能企业平台',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    1920,
    1080,
    'desktop',
    'Chrome',
    'Windows',
    '{"elementId": "login-button", "elementText": "登录"}',
    '{"collectorVersion": "1.0.0", "isValid": true}'
),
(
    '3cep-app',
    'sess_test_002',
    'evt_test_003',
    'search',
    NOW() - INTERVAL '30 minutes',
    'user_002',
    '搜索页面',
    '/search',
    '/',
    'https://3cep.example.com/search?q=test',
    '搜索结果 - 3CEP',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    375,
    667,
    'mobile',
    'Safari',
    'iOS',
    '{"query": "test", "resultsCount": 5, "searchTime": 1200}',
    '{"collectorVersion": "1.0.0", "isValid": true}'
);

-- 验证表结构
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tracking_events'
ORDER BY ordinal_position;

-- 显示索引信息
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'tracking_events';
