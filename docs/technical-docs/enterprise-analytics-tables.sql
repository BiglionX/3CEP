-- ====================================================================
-- 企业分析数据表
-- 用于存储企业KPI指标、分析数据和报告
-- ====================================================================

-- 企业KPI指标表
CREATE TABLE IF NOT EXISTS enterprise_analytics_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  kpi_name VARCHAR(100) NOT NULL,                    -- 指标名称
  kpi_value DECIMAL(15,2) NOT NULL,                  -- 指标值
  target_value DECIMAL(15,2),                        -- 目标值
  unit VARCHAR(20),                                  -- 单位
  period VARCHAR(20) NOT NULL DEFAULT 'monthly',     -- 周期：daily, weekly, monthly, quarterly, yearly
  period_date DATE NOT NULL,                         -- 统计日期
  trend_direction VARCHAR(10),                       -- 趋势：up, down, stable
  change_percentage DECIMAL(5,2),                    -- 变化百分比
  category VARCHAR(50),                              -- 分类：financial, user, business, technical
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 复合唯一索引，防止重复记录
  UNIQUE(enterprise_id, kpi_name, period_date)
);

-- 企业分析报告表
CREATE TABLE IF NOT EXISTS enterprise_analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,                  -- 报告类型：daily_summary, weekly_insights, monthly_performance
  report_date DATE NOT NULL,                         -- 报告日期
  title VARCHAR(200) NOT NULL,                       -- 报告标题
  summary TEXT,                                      -- 报告摘要
  data JSONB NOT NULL DEFAULT '{}',                  -- 报告数据（JSON格式）
  format VARCHAR(20) NOT NULL DEFAULT 'json',        -- 格式：json, csv, pdf
  status VARCHAR(20) NOT NULL DEFAULT 'generated',   -- 状态：generating, generated, failed
  generated_by UUID REFERENCES enterprise_users(id), -- 生成者
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引优化
  UNIQUE(enterprise_id, report_type, report_date)
);

-- 企业指标配置表
CREATE TABLE IF NOT EXISTS enterprise_analytics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,                  -- 配置键
  config_value JSONB NOT NULL DEFAULT '{}',          -- 配置值（JSON格式）
  description TEXT,                                  -- 配置描述
  is_active BOOLEAN DEFAULT TRUE,                    -- 是否激活
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 复合唯一索引
  UNIQUE(enterprise_id, config_key)
);

-- 企业KPI告警表
CREATE TABLE IF NOT EXISTS enterprise_kpi_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  kpi_name VARCHAR(100) NOT NULL,                    -- 指标名称
  kpi_value DECIMAL(15,2) NOT NULL,                  -- 当前值
  target_value DECIMAL(15,2),                        -- 目标值
  threshold_value DECIMAL(15,2),                     -- 阈值
  severity VARCHAR(20) NOT NULL,                     -- 严重程度：high, medium, low
  message TEXT NOT NULL,                             -- 告警消息
  status VARCHAR(20) NOT NULL DEFAULT 'active',      -- 状态：active, resolved, dismissed
  resolved_at TIMESTAMP,                             -- 解决时间
  resolved_by UUID REFERENCES enterprise_users(id),  -- 解决者
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引优化
  INDEX idx_kpi_alerts_enterprise_status (enterprise_id, status)
);

-- 企业分析数据快照表（用于历史趋势分析）
CREATE TABLE IF NOT EXISTS enterprise_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  snapshot_type VARCHAR(50) NOT NULL,                -- 快照类型：daily, weekly, monthly
  snapshot_date DATE NOT NULL,                       -- 快照日期
  data JSONB NOT NULL DEFAULT '{}',                  -- 快照数据
  metadata JSONB DEFAULT '{}',                       -- 元数据
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 复合唯一索引
  UNIQUE(enterprise_id, snapshot_type, snapshot_date)
);

-- 企业用户行为分析表
CREATE TABLE IF NOT EXISTS enterprise_user_behavior (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,                             -- 用户ID
  session_id VARCHAR(100),                           -- 会话ID
  event_type VARCHAR(50) NOT NULL,                   -- 事件类型：page_view, click, conversion, etc.
  event_name VARCHAR(100) NOT NULL,                  -- 事件名称
  page_url VARCHAR(500),                             -- 页面URL
  referrer VARCHAR(500),                             -- 来源
  device_type VARCHAR(50),                           -- 设备类型
  browser VARCHAR(100),                              -- 浏览器
  platform VARCHAR(50),                              -- 平台
  duration_seconds INTEGER,                          -- 停留时间（秒）
  metadata JSONB DEFAULT '{}',                       -- 额外数据
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引优化
  INDEX idx_user_behavior_enterprise_date (enterprise_id, created_at),
  INDEX idx_user_behavior_event_type (enterprise_id, event_type, created_at)
);

-- 企业转化漏斗表
CREATE TABLE IF NOT EXISTS enterprise_conversion_funnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  funnel_name VARCHAR(100) NOT NULL,                 -- 漏斗名称
  stage_name VARCHAR(100) NOT NULL,                  -- 阶段名称
  user_count INTEGER NOT NULL DEFAULT 0,             -- 用户数量
  conversion_rate DECIMAL(5,2),                      -- 转化率
  avg_time_to_next_stage INTEGER,                    -- 平均到下一阶段时间（秒）
  stage_order INTEGER NOT NULL,                      -- 阶段顺序
  period_date DATE NOT NULL,                         -- 统计日期
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 复合唯一索引
  UNIQUE(enterprise_id, funnel_name, stage_name, period_date)
);

-- ====================================================================
-- 表注释
-- ====================================================================

COMMENT ON TABLE enterprise_analytics_kpis IS '企业KPI指标表';
COMMENT ON COLUMN enterprise_analytics_kpis.kpi_name IS '指标名称，如：月度收入、活跃用户数';
COMMENT ON COLUMN enterprise_analytics_kpis.period IS '统计周期：daily(每日), weekly(每周), monthly(每月), quarterly(每季), yearly(每年)';
COMMENT ON COLUMN enterprise_analytics_kpis.trend_direction IS '趋势方向：up(上升), down(下降), stable(稳定)';

COMMENT ON TABLE enterprise_analytics_reports IS '企业分析报告表';
COMMENT ON COLUMN enterprise_analytics_reports.report_type IS '报告类型：daily_summary(日报), weekly_insights(周报), monthly_performance(月报)';
COMMENT ON COLUMN enterprise_analytics_reports.status IS '状态：generating(生成中), generated(已生成), failed(失败)';

COMMENT ON TABLE enterprise_analytics_config IS '企业分析配置表';
COMMENT ON COLUMN enterprise_analytics_config.config_key IS '配置键，如：kpi_targets, notification_thresholds';
COMMENT ON COLUMN enterprise_analytics_config.config_value IS '配置值，JSON格式';

COMMENT ON TABLE enterprise_kpi_alerts IS '企业KPI告警表';
COMMENT ON COLUMN enterprise_kpi_alerts.severity IS '严重程度：high(高), medium(中), low(低)';
COMMENT ON COLUMN enterprise_kpi_alerts.status IS '状态：active(活跃), resolved(已解决), dismissed(已忽略)';

COMMENT ON TABLE enterprise_analytics_snapshots IS '企业分析数据快照表';
COMMENT ON COLUMN enterprise_analytics_snapshots.snapshot_type IS '快照类型：daily(每日), weekly(每周), monthly(每月)';

COMMENT ON TABLE enterprise_user_behavior IS '企业用户行为分析表';
COMMENT ON COLUMN enterprise_user_behavior.event_type IS '事件类型：page_view(页面浏览), click(点击), conversion(转化)';

COMMENT ON TABLE enterprise_conversion_funnel IS '企业转化漏斗表';
COMMENT ON COLUMN enterprise_conversion_funnel.funnel_name IS '漏斗名称，如：购买流程、注册流程';
COMMENT ON COLUMN enterprise_conversion_funnel.stage_name IS '阶段名称，如：浏览商品、加入购物车、提交订单';

-- ====================================================================
-- 索引优化
-- ====================================================================

-- 为 enterprise_analytics_kpis 表添加索引
CREATE INDEX IF NOT EXISTS idx_analytics_kpis_enterprise_date 
ON enterprise_analytics_kpis(enterprise_id, period_date DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_kpis_category 
ON enterprise_analytics_kpis(category);

-- 为 enterprise_analytics_reports 表添加索引
CREATE INDEX IF NOT EXISTS idx_analytics_reports_enterprise_type 
ON enterprise_analytics_reports(enterprise_id, report_type, report_date DESC);

-- 为 enterprise_analytics_snapshots 表添加索引
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_enterprise_date 
ON enterprise_analytics_snapshots(enterprise_id, snapshot_date DESC);

-- ====================================================================
-- RLS策略（行级安全策略）
-- ====================================================================

-- 启用RLS
ALTER TABLE enterprise_analytics_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_kpi_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_conversion_funnel ENABLE ROW LEVEL SECURITY;

-- enterprise_analytics_kpis 表策略
DROP POLICY IF EXISTS "企业可查看自己的KPI数据" ON enterprise_analytics_kpis;
CREATE POLICY "企业可查看自己的KPI数据"
  ON enterprise_analytics_kpis FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业管理员可管理KPI数据" ON enterprise_analytics_kpis;
CREATE POLICY "企业管理员可管理KPI数据"
  ON enterprise_analytics_kpis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE id = enterprise_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

-- enterprise_analytics_reports 表策略
DROP POLICY IF EXISTS "企业可查看自己的分析报告" ON enterprise_analytics_reports;
CREATE POLICY "企业可查看自己的分析报告"
  ON enterprise_analytics_reports FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

-- enterprise_analytics_config 表策略
DROP POLICY IF EXISTS "企业可查看自己的分析配置" ON enterprise_analytics_config;
CREATE POLICY "企业可查看自己的分析配置"
  ON enterprise_analytics_config FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业管理员可管理分析配置" ON enterprise_analytics_config;
CREATE POLICY "企业管理员可管理分析配置"
  ON enterprise_analytics_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE id = enterprise_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

-- enterprise_kpi_alerts 表策略
DROP POLICY IF EXISTS "企业可查看自己的KPI告警" ON enterprise_kpi_alerts;
CREATE POLICY "企业可查看自己的KPI告警"
  ON enterprise_kpi_alerts FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业管理员可管理KPI告警" ON enterprise_kpi_alerts;
CREATE POLICY "企业管理员可管理KPI告警"
  ON enterprise_kpi_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE id = enterprise_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

-- ====================================================================
-- 触发器
-- ====================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间戳的表添加触发器
CREATE TRIGGER update_analytics_kpis_updated_at 
  BEFORE UPDATE ON enterprise_analytics_kpis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at 
  BEFORE UPDATE ON enterprise_analytics_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_config_updated_at 
  BEFORE UPDATE ON enterprise_analytics_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_alerts_updated_at 
  BEFORE UPDATE ON enterprise_kpi_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_funnel_updated_at 
  BEFORE UPDATE ON enterprise_conversion_funnel 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 默认配置数据
-- ====================================================================

-- 插入默认的KPI目标配置（可以在应用启动时执行）
-- INSERT INTO enterprise_analytics_config (enterprise_id, config_key, config_value, description)
-- SELECT 
--   id,
--   'kpi_targets',
--   '{
--     "月度收入": 500000,
--     "活跃用户数": 10000,
--     "订单完成率": 95,
--     "客户满意度": 4.8,
--     "平均响应时间": 2.0,
--     "转化率": 4.0
--   }'::jsonb,
--   '默认KPI目标配置'
-- FROM enterprise_users
-- WHERE NOT EXISTS (
--   SELECT 1 FROM enterprise_analytics_config 
--   WHERE config_key = 'kpi_targets' AND enterprise_id = enterprise_users.id
-- );