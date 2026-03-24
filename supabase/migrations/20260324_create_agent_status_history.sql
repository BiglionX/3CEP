-- =====================================================
-- OPT-018: 实现历史监控数据存储
-- 创建智能体状态历史表（分区表，按月）
-- =====================================================

-- 创建主表（分区表）
CREATE TABLE IF NOT EXISTS agent_status_history (
  id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  metrics JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- 创建唯一索引（替代主键的自动索引）
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_status_history_pkey
ON agent_status_history(id, recorded_at);

-- 创建普通索引
CREATE INDEX IF NOT EXISTS idx_agent_status_history_agent_id
ON agent_status_history(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_status_history_recorded_at
ON agent_status_history(recorded_at);

CREATE INDEX IF NOT EXISTS idx_agent_status_history_status
ON agent_status_history(status);

-- 创建分区表（按月）
-- 2026 年 3 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_03
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- 2026 年 4 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_04
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- 2026 年 5 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_05
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- 2026 年 6 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_06
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- 2026 年 7 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_07
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- 2026 年 8 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_08
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- 2026 年 9 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_09
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- 2026 年 10 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_10
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- 2026 年 11 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_11
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

-- 2026 年 12 月
CREATE TABLE IF NOT EXISTS agent_status_history_2026_12
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- 添加注释
COMMENT ON TABLE agent_status_history IS '智能体状态历史记录表（分区表，保留 90 天数据）';
COMMENT ON COLUMN agent_status_history.agent_id IS '智能体 ID';
COMMENT ON COLUMN agent_status_history.status IS '智能体状态（online/offline/busy/error）';
COMMENT ON COLUMN agent_status_history.metrics IS '监控指标（JSON 格式：response_time, error_rate, usage_count 等）';
COMMENT ON COLUMN agent_status_history.recorded_at IS '记录时间';

-- 创建 RLS 策略
ALTER TABLE agent_status_history ENABLE ROW LEVEL SECURITY;

-- 允许管理员查看所有历史记录
CREATE POLICY "admin_view_all_history" ON agent_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 允许系统账号插入历史记录
CREATE POLICY "system_insert_history" ON agent_status_history
FOR INSERT
WITH CHECK (TRUE);

-- 创建数据归档函数（删除 90 天前的数据）
CREATE OR REPLACE FUNCTION archive_old_agent_status_history()
RETURNS void AS $$
BEGIN
  -- 删除 90 天前的分区数据
  EXECUTE format(
    'TRUNCATE TABLE %I',
    'agent_status_history_' || to_char(CURRENT_DATE - INTERVAL '90 days', 'YYYY_MM')
  );

  RAISE NOTICE '已归档 90 天前的历史数据';
END;
$$ LANGUAGE plpgsql;

-- 创建物化视图（用于快速查询最近 7 天的统计数据）
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_status_last_7days AS
SELECT
  agent_id,
  DATE(recorded_at) as record_date,
  COUNT(*) as snapshot_count,
  AVG((metrics->>'response_time')::numeric) as avg_response_time,
  MAX((metrics->>'response_time')::numeric) as max_response_time,
  MIN((metrics->>'response_time')::numeric) as min_response_time,
  AVG((metrics->>'error_rate')::numeric) as avg_error_rate,
  SUM((metrics->>'usage_count')::numeric) as total_usage_count
FROM agent_status_history
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY agent_id, DATE(recorded_at)
ORDER BY record_date DESC;

-- 为物化视图创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_status_last_7days_agent_date
ON agent_status_last_7days(agent_id, record_date);

COMMENT ON MATERIALIZED VIEW agent_status_last_7days IS '最近 7 天智能体状态统计（物化视图，每小时刷新）';
