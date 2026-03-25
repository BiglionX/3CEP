-- =====================================================
-- P2-006 监控告警增强 - 告警规则和历史表
-- =====================================================
-- 用途：支持系统监控和告警管理
-- 执行方式：在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 告警规则表
-- 注意：先检查表是否存在，避免重复创建
DO $$
BEGIN
  -- 如果表不存在，创建基础表
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_rules') THEN
    CREATE TABLE alert_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL UNIQUE,
      resource_type VARCHAR(50) DEFAULT 'system', -- 添加 resource_type 字段
      rule_type VARCHAR(50) DEFAULT 'threshold', -- 添加 rule_type 字段
      condition JSONB DEFAULT '{"type": "gt"}'::jsonb, -- condition 是 JSONB 类型
      metric_type VARCHAR(100), -- 修改为 metric_type
      condition_type VARCHAR(20), -- 保留 condition_type 作为兼容
      threshold_value NUMERIC, -- 修改为 threshold_value
      priority VARCHAR(20) DEFAULT 'medium',
      notification_channels JSONB DEFAULT '["email"]'::jsonb, -- 修改为 JSONB 类型
      enabled BOOLEAN DEFAULT TRUE,
      cooldown_minutes INTEGER DEFAULT 30,
      last_triggered_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_alert_rules_metric ON alert_rules(metric_type);
    CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
    CREATE INDEX idx_alert_rules_priority ON alert_rules(priority);
  ELSE
    -- 表已存在，添加可能缺失的字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'resource_type') THEN
      ALTER TABLE alert_rules ADD COLUMN resource_type VARCHAR(50) DEFAULT 'system';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'rule_type') THEN
      ALTER TABLE alert_rules ADD COLUMN rule_type VARCHAR(50) DEFAULT 'threshold';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'condition') THEN
      ALTER TABLE alert_rules ADD COLUMN condition JSONB DEFAULT '{"type": "gt"}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'metric_type') THEN
      ALTER TABLE alert_rules ADD COLUMN metric_type VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'condition_type') THEN
      ALTER TABLE alert_rules ADD COLUMN condition_type VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'threshold_value') THEN
      ALTER TABLE alert_rules ADD COLUMN threshold_value NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'alert_rules' AND column_name = 'notification_channels') THEN
      ALTER TABLE alert_rules ADD COLUMN notification_channels JSONB DEFAULT '["email"]'::jsonb;
    END IF;

    -- 处理旧的 threshold 字段：如果存在且为 NOT NULL，先允许 NULL，填充数据后再设为 NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'alert_rules' AND column_name = 'threshold') THEN
      -- 先允许 NULL 值
      ALTER TABLE alert_rules ALTER COLUMN threshold DROP NOT NULL;

      -- 根据 condition_type 和 threshold_value 填充 threshold 字段（JSONB 格式）
      UPDATE alert_rules
      SET threshold = jsonb_build_object('value', COALESCE(threshold_value, 0))
      WHERE threshold IS NULL;
    END IF;
  END IF;
END $$;

COMMENT ON TABLE alert_rules IS '告警规则配置表';

-- 插入基础告警规则示例 (使用正确的字段名和 JSONB 类型)
-- 注意：如果表已存在且有数据，使用 ON CONFLICT (name) 需要 name 有 UNIQUE 约束
DO $$
BEGIN
  -- 尝试插入，如果 name 已存在则跳过
  INSERT INTO alert_rules (name, resource_type, rule_type, condition, metric_type, condition_type, threshold_value, priority, notification_channels)
  VALUES
    ('慢查询过多', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'slow_queries_count', 'gt', 5, 'high', '["email"]'::jsonb),
    ('数据库连接失败', 'system', 'threshold', '{"type": "eq"}'::jsonb, 'database_connection', 'eq', 0, 'critical', '["email", "slack"]'::jsonb),
    ('Skills 表过大', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'skills_table_size_mb', 'gt', 1000, 'medium', '["email"]'::jsonb),
    ('未使用索引', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'unused_indexes_count', 'gt', 10, 'low', '["email"]'::jsonb)
  ON CONFLICT (name) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果 ON CONFLICT 失败（可能表已存在但没有 UNIQUE 约束），使用普通 INSERT
    INSERT INTO alert_rules (name, resource_type, rule_type, condition, metric_type, condition_type, threshold_value, priority, notification_channels)
    SELECT * FROM (
      VALUES
        ('慢查询过多', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'slow_queries_count', 'gt', 5, 'high', '["email"]'::jsonb),
        ('数据库连接失败', 'system', 'threshold', '{"type": "eq"}'::jsonb, 'database_connection', 'eq', 0, 'critical', '["email", "slack"]'::jsonb),
        ('Skills 表过大', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'skills_table_size_mb', 'gt', 1000, 'medium', '["email"]'::jsonb),
        ('未使用索引', 'system', 'threshold', '{"type": "gt"}'::jsonb, 'unused_indexes_count', 'gt', 10, 'low', '["email"]'::jsonb)
    ) AS v(name, resource_type, rule_type, condition, metric_type, condition_type, threshold_value, priority, notification_channels)
    WHERE NOT EXISTS (
      SELECT 1 FROM alert_rules a
      WHERE a.name = v.name
    );
END $$;

COMMENT ON TABLE alert_rules IS '告警规则配置表';

-- 2. 告警历史表
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  status VARCHAR(20) DEFAULT 'firing', -- firing, acknowledged, resolved
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_error TEXT,
  metadata JSONB
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_at ON alert_history(triggered_at DESC);

COMMENT ON TABLE alert_history IS '告警触发历史记录表';

-- 3. 系统指标快照表
CREATE TABLE IF NOT EXISTS system_metrics_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cpu_usage NUMERIC, -- CPU 使用率 (%)
  memory_usage NUMERIC, -- 内存使用率 (%)
  disk_usage NUMERIC, -- 磁盘使用率 (%)
  active_connections INTEGER, -- 活跃连接数
  slow_queries_count INTEGER, -- 慢查询数量
  total_skills INTEGER, -- Skills 总数
  total_users INTEGER, -- 用户总数
  requests_per_minute INTEGER, -- 每分钟请求数
  avg_response_time_ms NUMERIC, -- 平均响应时间 (ms)
  error_rate NUMERIC, -- 错误率 (%)
  metadata JSONB
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_metrics_snapshot_time ON system_metrics_snapshot(snapshot_time DESC);

COMMENT ON TABLE system_metrics_snapshot IS '系统指标快照表';

-- 4. 存储过程：检查告警规则
CREATE OR REPLACE FUNCTION check_alert_rules()
RETURNS TABLE(rule_id UUID, rule_name VARCHAR, triggered BOOLEAN, metric_value NUMERIC) AS $$
DECLARE
  r RECORD;
  v_metric_value NUMERIC;
BEGIN
  FOR r IN
    SELECT * FROM alert_rules WHERE enabled = TRUE
  LOOP
    -- 根据指标类型获取当前值
    CASE r.metric_type
      WHEN 'slow_queries_count' THEN
        SELECT COUNT(*) INTO v_metric_value FROM v_slow_queries;

      WHEN 'database_connection' THEN
        -- 简单检查数据库连接
        SELECT CASE WHEN EXISTS(SELECT 1 FROM skills LIMIT 1) THEN 1 ELSE 0 END INTO v_metric_value;

      WHEN 'skills_table_size_mb' THEN
        SELECT COALESCE(
          (SELECT pg_total_relation_size(relid) / 1024 / 1024
           FROM pg_stat_user_tables WHERE relname = 'skills'), 0
        ) INTO v_metric_value;

      WHEN 'unused_indexes_count' THEN
        SELECT COUNT(*) INTO v_metric_value
        FROM v_index_usage_stats
        WHERE idx_scan = 0;

      ELSE
        v_metric_value := 0;
    END CASE;

    -- 检查是否满足告警条件
    CASE r.condition_type
      WHEN 'gt' THEN
        IF v_metric_value > r.threshold_value THEN
          RETURN NEXT;
        END IF;
      WHEN 'lt' THEN
        IF v_metric_value < r.threshold_value THEN
          RETURN NEXT;
        END IF;
      WHEN 'eq' THEN
        IF v_metric_value = r.threshold_value THEN
          RETURN NEXT;
        END IF;
      WHEN 'gte' THEN
        IF v_metric_value >= r.threshold_value THEN
          RETURN NEXT;
        END IF;
      WHEN 'lte' THEN
        IF v_metric_value <= r.threshold_value THEN
          RETURN NEXT;
        END IF;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_alert_rules IS '检查所有启用的告警规则并返回触发的规则';

-- 5. 存储过程：记录系统指标快照
CREATE OR REPLACE FUNCTION record_system_metrics()
RETURNS VOID AS $$
DECLARE
  v_cpu_usage NUMERIC;
  v_memory_usage NUMERIC;
  v_active_connections INTEGER;
  v_slow_queries_count INTEGER;
  v_total_skills INTEGER;
  v_total_users INTEGER;
BEGIN
  -- 获取活跃连接数
  SELECT COUNT(*) INTO v_active_connections
  FROM pg_stat_activity
  WHERE state = 'active';

  -- 获取慢查询数量
  SELECT COUNT(*) INTO v_slow_queries_count FROM v_slow_queries;

  -- 获取 Skills 总数
  SELECT COUNT(*) INTO v_total_skills FROM skills;

  -- 获取用户总数
  SELECT COUNT(*) INTO v_total_users FROM auth.users;

  -- 插入快照记录
  INSERT INTO system_metrics_snapshot (
    active_connections,
    slow_queries_count,
    total_skills,
    total_users
  ) VALUES (
    v_active_connections,
    v_slow_queries_count,
    v_total_skills,
    v_total_users
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_system_metrics IS '记录当前系统指标快照';

-- 6. 触发器：自动更新 updated_at
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 策略
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics_snapshot ENABLE ROW LEVEL SECURITY;

-- 允许认证用户查看告警规则
CREATE POLICY "允许认证用户查看告警规则" ON alert_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- 只允许管理员修改告警规则
CREATE POLICY "仅管理员可修改告警规则" ON alert_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 允许认证用户查看告警历史
CREATE POLICY "允许认证用户查看告警历史" ON alert_history
  FOR SELECT
  TO authenticated
  USING (true);

-- 允许认证用户查看系统指标
CREATE POLICY "允许认证用户查看系统指标" ON system_metrics_snapshot
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 完成检查清单
-- =====================================================
-- ✅ alert_rules 表已创建
-- ✅ alert_history 表已创建
-- ✅ system_metrics_snapshot 表已创建
-- ✅ 存储过程 check_alert_rules 已创建
-- ✅ 存储过程 record_system_metrics 已创建
-- ✅ 触发器已创建
-- ✅ RLS 策略已配置
-- ✅ 基础告警规则已插入
-- =====================================================
