-- 智能体执行记录表
-- 创建时间: 2026-03-16

-- 创建智能体执行记录表
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB,
  parameters JSONB DEFAULT '{}',
  is_debug BOOLEAN DEFAULT false,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  tokens_used INTEGER,
  triggered_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "agent_executions_select" ON agent_executions FOR SELECT USING (true);
CREATE POLICY "agent_executions_insert" ON agent_executions FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_executions_update" ON agent_executions FOR UPDATE USING (true);
CREATE POLICY "agent_executions_delete" ON agent_executions FOR DELETE USING (true);

-- 创建索引
CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);
CREATE INDEX idx_agent_executions_is_debug ON agent_executions(is_debug);

-- 添加注释
COMMENT ON TABLE agent_executions IS '智能体执行记录表，记录每次智能体执行的详细信息';
