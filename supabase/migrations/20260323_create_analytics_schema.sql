-- FixCycle 6.0 Analytics Platform - Database Schema
-- 数据分析平台数据库表结构

-- ========================================
-- 1. 核心事件表
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_events (
    -- 主键
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,

    -- 事件基本信息
    event_type TEXT NOT NULL CHECK (event_type IN ('pageview', 'click', 'custom', 'error', 'performance')),
    event_name TEXT NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL,

    -- 用户和会话
    user_id TEXT,
    session_id TEXT NOT NULL,

    -- 设备信息
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    device_os TEXT,
    device_browser TEXT,
    device_resolution TEXT,
    device_language TEXT,

    -- 页面信息
    page_url TEXT,
    page_path TEXT,
    page_title TEXT,
    page_referrer TEXT,

    -- 性能指标（JSONB 存储）
    metrics JSONB,

    -- 事件属性和丰富数据
    properties JSONB,
    enriched_data JSONB,

    -- 数据质量
    quality_score INTEGER DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100),
    flags JSONB DEFAULT '{}',

    -- 元数据
    app_id TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'production',

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引优化
    CONSTRAINT valid_quality_score CHECK (quality_score BETWEEN 0 AND 100)
);

-- 创建索引以优化查询性能
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_path ON analytics_events(page_path);
CREATE INDEX idx_analytics_events_app ON analytics_events(app_id);
CREATE INDEX idx_analytics_events_environment ON analytics_events(environment);

-- JSONB 字段索引
CREATE INDEX idx_analytics_events_metrics ON analytics_events USING GIN(metrics);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);
CREATE INDEX idx_analytics_events_enriched ON analytics_events USING GIN(enriched_data);

-- 复合索引用于常用查询
CREATE INDEX idx_analytics_events_app_timestamp ON analytics_events(app_id, event_timestamp DESC);
CREATE INDEX idx_analytics_events_type_timestamp ON analytics_events(event_type, event_timestamp DESC);
CREATE INDEX idx_analytics_events_path_timestamp ON analytics_events(page_path, event_timestamp DESC);

-- 分区表（按月分区，可选）
-- CREATE TABLE analytics_events_2026_03 PARTITION OF analytics_events
--     FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');


-- ========================================
-- 2. 数据质量指标表
-- ========================================

CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id BIGSERIAL PRIMARY KEY,
    app_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,

    -- 事件统计
    total_events INTEGER NOT NULL DEFAULT 0,
    valid_events INTEGER NOT NULL DEFAULT 0,
    invalid_events INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    anomaly_count INTEGER NOT NULL DEFAULT 0,

    -- 质量评分
    avg_quality_score NUMERIC(5,2) DEFAULT 100.00,
    validity_rate NUMERIC(5,4) DEFAULT 1.0000,

    -- 详细问题统计
    missing_field_count INTEGER DEFAULT 0,
    invalid_format_count INTEGER DEFAULT 0,
    out_of_range_count INTEGER DEFAULT 0,

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_quality_metrics_app_timestamp ON data_quality_metrics(app_id, timestamp DESC);


-- ========================================
-- 3. 聚合指标表（预计算）
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_hourly_metrics (
    id BIGSERIAL PRIMARY KEY,
    hour TIMESTAMPTZ NOT NULL,
    app_id TEXT NOT NULL,

    -- 流量指标
    pageviews INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,

    -- 参与度指标
    avg_session_duration NUMERIC(10,2),
    bounce_rate NUMERIC(5,4),
    pages_per_session NUMERIC(5,2),

    -- 性能指标
    avg_page_load_time NUMERIC(10,2),
    avg_first_paint NUMERIC(10,2),
    avg_lcp NUMERIC(10,2),
    avg_fid NUMERIC(10,2),
    avg_cls NUMERIC(10,4),

    -- 错误统计
    error_count INTEGER DEFAULT 0,

    -- 设备分布
    mobile_percentage NUMERIC(5,2),
    desktop_percentage NUMERIC(5,2),
    tablet_percentage NUMERIC(5,2),

    -- 浏览器分布（Top 5）
    browser_distribution JSONB,

    -- 页面排名（Top 10）
    top_pages JSONB,

    -- 地理分布（Top 10）
    geo_distribution JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(hour, app_id)
);

CREATE INDEX idx_analytics_hourly_metrics_hour ON analytics_hourly_metrics(hour DESC);
CREATE INDEX idx_analytics_hourly_metrics_app ON analytics_hourly_metrics(app_id);


-- ========================================
-- 4. 每日聚合表
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    app_id TEXT NOT NULL,

    -- 汇总指标
    total_pageviews INTEGER DEFAULT 0,
    total_unique_visitors INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,

    -- 平均指标
    avg_session_duration NUMERIC(10,2),
    avg_bounce_rate NUMERIC(5,4),
    avg_pages_per_session NUMERIC(5,2),

    -- Web Vitals 日均值
    avg_page_load_time NUMERIC(10,2),
    avg_first_paint NUMERIC(10,2),
    avg_lcp NUMERIC(10,2),
    avg_fid NUMERIC(10,2),
    avg_cls NUMERIC(10,4),

    -- 新增用户
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,

    -- 转化率相关
    conversion_events INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5,4),

    -- 热门页面（Top 20）
    top_pages JSONB,

    -- 热门事件（Top 20）
    top_events JSONB,

    -- 时段分布（24 小时）
    hourly_distribution JSONB,

    -- 质量指标
    avg_quality_score NUMERIC(5,2),
    data_completeness_rate NUMERIC(5,4),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date, app_id)
);

CREATE INDEX idx_analytics_daily_metrics_date ON analytics_daily_metrics(date DESC);
CREATE INDEX idx_analytics_daily_metrics_app ON analytics_daily_metrics(app_id);


-- ========================================
-- 5. 实时仪表板视图
-- ========================================

-- 最近 1 小时实时数据
CREATE OR REPLACE VIEW v_realtime_dashboard AS
SELECT
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as active_sessions,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) FILTER (WHERE event_type = 'pageview') as pageviews,
    COUNT(*) FILTER (WHERE event_type = 'error') as errors,
    AVG(quality_score) as avg_quality_score,
    MAX(event_timestamp) as last_event_time
FROM analytics_events
WHERE event_timestamp >= NOW() - INTERVAL '1 hour';

-- 页面浏览量排名（最近 1 小时）
CREATE OR REPLACE VIEW v_realtime_top_pages AS
SELECT
    page_path,
    page_title,
    COUNT(*) as views,
    COUNT(DISTINCT session_id) as unique_visitors
FROM analytics_events
WHERE event_type = 'pageview'
  AND event_timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY page_path, page_title
ORDER BY views DESC
LIMIT 20;

-- 事件类型分布（最近 1 小时）
CREATE OR REPLACE VIEW v_realtime_event_distribution AS
SELECT
    event_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM analytics_events
WHERE event_timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY event_type
ORDER BY count DESC;

-- 设备类型分布（最近 1 小时）
CREATE OR REPLACE VIEW v_realtime_device_distribution AS
SELECT
    device_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM analytics_events
WHERE device_type IS NOT NULL
  AND event_timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY device_type
ORDER BY count DESC;


-- ========================================
-- 7. 数据清理策略
-- ========================================

-- 自动清理过期数据的函数
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
DECLARE
    cutoff_date DATE := CURRENT_DATE - INTERVAL '90 days';
BEGIN
    -- 删除 90 天前的原始事件数据
    DELETE FROM analytics_events
    WHERE event_timestamp < (cutoff_date::TIMESTAMP);

    -- 删除 180 天前的小时聚合数据
    DELETE FROM analytics_hourly_metrics
    WHERE hour < (cutoff_date - INTERVAL '90 days');

    -- 保留每日聚合数据（至少 2 年）
    -- 这里可以根据需要调整

    RAISE NOTICE '已清理 % 之前的数据', cutoff_date;
END;
$$ LANGUAGE plpgsql;

-- 设置定时任务（需要 pg_cron 扩展）
-- SELECT cron.schedule(
--     'cleanup-old-analytics-data',
--     '0 2 * * *',  -- 每天凌晨 2 点执行
--     'SELECT cleanup_old_analytics_data()'
-- );


-- ========================================
-- 8. 权限设置
-- ========================================

-- 创建只读角色
CREATE ROLE analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO analytics_readonly;

-- 创建写入角色（仅 API 使用）
CREATE ROLE analytics_writer;
GRANT USAGE ON SCHEMA public TO analytics_writer;
GRANT INSERT, UPDATE ON analytics_events TO analytics_writer;
GRANT INSERT, UPDATE ON data_quality_metrics TO analytics_writer;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO analytics_writer;

-- 创建管理员角色
CREATE ROLE analytics_admin;
GRANT analytics_readonly TO analytics_admin;
GRANT analytics_writer TO analytics_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO analytics_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO analytics_admin;


-- ========================================
-- 6. 监控和告警
-- ========================================

-- 数据质量告警视图
CREATE OR REPLACE VIEW v_data_quality_alerts AS
SELECT
    app_id,
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(avg_quality_score) as avg_score,
    COUNT(*) FILTER (WHERE avg_quality_score < 80) as low_quality_batches,
    SUM(invalid_events) as total_invalid,
    SUM(anomaly_count) as total_anomalies
FROM data_quality_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY app_id, DATE_TRUNC('hour', timestamp)
HAVING AVG(avg_quality_score) < 80
    OR SUM(invalid_events) > 100
    OR SUM(anomaly_count) > 50;

-- 异常流量检测视图
CREATE OR REPLACE VIEW v_traffic_anomalies AS
SELECT
    app_id,
    DATE_TRUNC('hour', event_timestamp) as hour,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as session_count,
    CASE
        WHEN COUNT(*) > (SELECT AVG(cnt) * 3 FROM (
            SELECT COUNT(*) as cnt
            FROM analytics_events
            WHERE event_timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY DATE_TRUNC('hour', event_timestamp)
        ) subquery) THEN true
        ELSE false
    END as is_anomaly
FROM analytics_events
WHERE event_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY app_id, DATE_TRUNC('hour', event_timestamp);


-- ========================================
-- 7. 物化视图（预计算加速查询）
-- ========================================
-- 注意：物化视图必须在所有基础表创建完成后才能创建

-- 每日页面浏览量（物化视图）
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_pageviews AS
SELECT
    DATE(event_timestamp) as date,
    app_id,
    page_path,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    AVG(time_on_page) as avg_time_on_page
FROM (
    SELECT
        event_timestamp,
        app_id,
        page_path,
        session_id,
        LEAD(event_timestamp) OVER (PARTITION BY session_id, page_path ORDER BY event_timestamp) - event_timestamp as time_on_page
    FROM analytics_events
    WHERE event_type = 'pageview'
) subquery
WHERE time_on_page IS NOT NULL
GROUP BY DATE(event_timestamp), app_id, page_path
WITH DATA;

-- 刷新物化视图的函数
CREATE OR REPLACE FUNCTION refresh_mv_daily_pageviews()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_pageviews;
END;
$$ LANGUAGE plpgsql;

-- 每小时性能指标（物化视图）
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_performance AS
SELECT
    DATE_TRUNC('hour', event_timestamp) as hour,
    app_id,
    AVG((metrics->>'pageLoadTime')::NUMERIC) as avg_page_load,
    AVG((metrics->>'firstContentfulPaint')::NUMERIC) as avg_fcp,
    AVG((metrics->>'largestContentfulPaint')::NUMERIC) as avg_lcp,
    AVG((metrics->>'firstInputDelay')::NUMERIC) as avg_fid,
    AVG((metrics->>'cumulativeLayoutShift')::NUMERIC) as avg_cls,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metrics->>'pageLoadTime')::NUMERIC) as p95_page_load,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY (metrics->>'pageLoadTime')::NUMERIC) as p99_page_load
FROM analytics_events
WHERE event_type = 'performance'
  AND metrics IS NOT NULL
GROUP BY DATE_TRUNC('hour', event_timestamp), app_id
WITH DATA;

CREATE OR REPLACE FUNCTION refresh_mv_hourly_performance()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_performance;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- 完成提示
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ FixCycle 6.0 Analytics 数据库架构部署完成';
    RAISE NOTICE '📊 核心表：analytics_events, data_quality_metrics, analytics_hourly_metrics, analytics_daily_metrics';
    RAISE NOTICE '👁️  实时视图：v_realtime_dashboard, v_realtime_top_pages, v_data_quality_alerts, v_traffic_anomalies';
    RAISE NOTICE '💾 物化视图：mv_daily_pageviews, mv_hourly_performance';
    RAISE NOTICE '🔧 维护函数：refresh_mv_*(), cleanup_old_analytics_data()';
    RAISE NOTICE '🔐 权限角色：analytics_readonly, analytics_writer, analytics_admin';
    RAISE NOTICE '⚠️  注意：示例数据已移除，首次运行请手动插入测试数据或使用验证脚本';
END $$;
