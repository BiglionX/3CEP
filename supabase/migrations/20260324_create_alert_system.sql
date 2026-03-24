-- =====================================================
-- OPT-017: 实现告警通知机制
-- 创建告警规则和告警历史表
-- =====================================================

-- 告警规则表
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- 'status', 'error_rate', 'response_time', 'offline'
  resource_type VARCHAR(50) NOT NULL, -- 'agent', 'system'
  resource_id UUID, -- 关联的资源 ID（如智能体 ID）
  condition JSONB NOT NULL, -- 告警条件配置
  threshold JSONB NOT NULL, -- 阈值配置
  notification_channels JSONB NOT NULL, -- 通知渠道 ['email', 'sms', 'webhook']
  notification_recipients JSONB, -- 通知接收者列表
  enabled BOOLEAN DEFAULT true,
  cooldown_period INTEGER DEFAULT 3600, -- 冷却期（秒），防止重复告警
  priority VARCHAR(20) DEFAULT 'warning', -- 'warning', 'critical', 'fatal'
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 告警历史表
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'closed'
  severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical', 'fatal'
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  metric_value JSONB, -- 触发时的指标值
  notifications_sent JSONB, -- 已发送的通知记录
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 告警订阅表（用户可订阅特定告警）
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type VARCHAR(50), -- 订阅特定类型的告警
  resource_type VARCHAR(50),
  resource_id UUID,
  notification_channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'in_app'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, rule_type, resource_type, resource_id, notification_channel)
);

-- 创建索引
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_alert_rules_resource ON alert_rules(resource_type, resource_id);
CREATE INDEX idx_alert_history_rule ON alert_history(rule_id);
CREATE INDEX idx_alert_history_status ON alert_history(status);
CREATE INDEX idx_alert_history_triggered ON alert_history(triggered_at DESC);
CREATE INDEX idx_alert_history_resource ON alert_history(resource_type, resource_id);
CREATE INDEX idx_alert_subscriptions_user ON alert_subscriptions(user_id);
CREATE INDEX idx_alert_subscriptions_enabled ON alert_subscriptions(enabled);

-- 添加注释
COMMENT ON TABLE alert_rules IS '告警规则配置表';
COMMENT ON TABLE alert_history IS '告警历史记录表';
COMMENT ON TABLE alert_subscriptions IS '用户告警订阅表';

COMMENT ON COLUMN alert_rules.rule_type IS '告警类型：status(状态异常), error_rate(错误率), response_time(响应时间), offline(离线)';
COMMENT ON COLUMN alert_rules.condition IS '告警条件：{"field": "error_rate", "operator": ">", "duration": 300}';
COMMENT ON COLUMN alert_rules.threshold IS '阈值配置：{"value": 0.05, "unit": "percent"}';
COMMENT ON COLUMN alert_rules.cooldown_period IS '冷却期（秒），同一规则在冷却期内不会重复触发';

COMMENT ON COLUMN alert_history.metric_value IS '触发告警时的指标快照';
COMMENT ON COLUMN alert_history.notifications_sent IS '已发送的通知：[{"channel": "email", "sent_at": "...", "status": "sent"}]';

-- RLS 策略
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有告警规则
CREATE POLICY "admin_view_all_alert_rules" ON alert_rules
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 管理员可以创建告警规则
CREATE POLICY "admin_create_alert_rules" ON alert_rules
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 管理员可以更新告警规则
CREATE POLICY "admin_update_alert_rules" ON alert_rules
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 用户可以查看自己的告警历史
CREATE POLICY "user_view_own_alert_history" ON alert_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND
    (profiles.role = 'admin' OR metadata->>'user_id' = auth.uid()::text)
  )
);

-- 系统可以插入告警历史
CREATE POLICY "system_insert_alert_history" ON alert_history
FOR INSERT WITH CHECK (TRUE);

-- 用户可以管理自己的告警订阅
CREATE POLICY "user_manage_own_subscriptions" ON alert_subscriptions
FOR ALL USING (user_id = auth.uid());

-- 插入默认告警规则
INSERT INTO alert_rules (name, description, rule_type, resource_type, condition, threshold, notification_channels, priority, enabled) VALUES
(
  '智能体离线告警',
  '当智能体离线超过 10 分钟时触发告警',
  'offline',
  'agent',
  '{"field": "status", "operator": "=", "value": "offline", "duration": 600}',
  '{"value": "offline"}',
  '["email", "in_app"]',
  'critical',
  true
),
(
  '高错误率告警',
  '当智能体错误率超过 5% 时触发告警',
  'error_rate',
  'agent',
  '{"field": "error_rate", "operator": ">", "value": 0.05, "duration": 300}',
  '{"value": 0.05, "unit": "percent"}',
  '["email", "in_app"]',
  'warning',
  true
),
(
  '响应时间过长告警',
  '当智能体平均响应时间超过 5 秒时触发告警',
  'response_time',
  'agent',
  '{"field": "response_time", "operator": ">", "value": 5000, "duration": 300}',
  '{"value": 5000, "unit": "ms"}',
  '["email", "in_app"]',
  'warning',
  true
);

-- 创建物化视图（活跃告警统计）
CREATE MATERIALIZED VIEW IF NOT EXISTS active_alerts_summary AS
SELECT
  rule_id,
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_count,
  COUNT(*) FILTER (WHERE severity = 'critical' OR severity = 'fatal') as critical_count,
  MAX(triggered_at) as last_triggered
FROM alert_history
WHERE status IN ('active', 'acknowledged')
GROUP BY rule_id;

CREATE UNIQUE INDEX idx_active_alerts_summary_rule ON active_alerts_summary(rule_id);

COMMENT ON MATERIALIZED VIEW active_alerts_summary IS '活跃告警统计（实时）';
