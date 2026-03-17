-- 用户智能体安装表
-- 创建时间: 2026-03-16

CREATE TABLE IF NOT EXISTS user_agent_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100) NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  runtime_type VARCHAR(20) DEFAULT 'desktop' CHECK (runtime_type IN ('desktop', 'cloud')),
  subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'desktop', 'cloud')),
  monthly_price INTEGER DEFAULT 0,
  yearly_price INTEGER DEFAULT 0,
  token_balance INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE user_agent_installations ENABLE ROW LEVEL SECURITY;

-- RLS策略 (使用 IF NOT EXISTS 使其幂等)
DROP POLICY IF EXISTS "user_agent_installations_select" ON user_agent_installations;
DROP POLICY IF EXISTS "user_agent_installations_insert" ON user_agent_installations;
DROP POLICY IF EXISTS "user_agent_installations_update" ON user_agent_installations;
DROP POLICY IF EXISTS "user_agent_installations_delete" ON user_agent_installations;

CREATE POLICY "user_agent_installations_select" ON user_agent_installations FOR SELECT USING (true);
CREATE POLICY "user_agent_installations_insert" ON user_agent_installations FOR INSERT WITH CHECK (true);
CREATE POLICY "user_agent_installations_update" ON user_agent_installations FOR UPDATE USING (true);
CREATE POLICY "user_agent_installations_delete" ON user_agent_installations FOR DELETE USING (true);

-- 创建索引 (使用 IF NOT EXISTS 使其幂等)
DROP INDEX IF EXISTS idx_user_agent_installations_user_id;
DROP INDEX IF EXISTS idx_user_agent_installations_agent_id;
DROP INDEX IF EXISTS idx_user_agent_installations_status;

CREATE INDEX idx_user_agent_installations_user_id ON user_agent_installations(user_id);
CREATE INDEX idx_user_agent_installations_agent_id ON user_agent_installations(agent_id);
CREATE INDEX idx_user_agent_installations_status ON user_agent_installations(status);

-- 注释
COMMENT ON TABLE user_agent_installations IS '用户智能体安装表，记录用户订阅和安装的智能体';
