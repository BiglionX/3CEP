-- 智能体注册和状态管理表
-- 创建时间: 2026-03-16
-- 为智能体 API 路由提供必需的数据表支持

-- 创建智能体注册表
CREATE TABLE IF NOT EXISTS agent_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('n8n', 'service')),
  endpoint TEXT NOT NULL,
  version VARCHAR(20),
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  health_check_endpoint TEXT,
  supported_operations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建智能体状态表
CREATE TABLE IF NOT EXISTS agent_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name VARCHAR(255) NOT NULL UNIQUE REFERENCES agent_registry(name) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'offline', 'degraded')) DEFAULT 'offline',
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB NOT NULL DEFAULT '{
    "success_rate": 0,
    "avg_response_time": 0,
    "error_rate": 0,
    "request_count": 0
  }',
  health JSONB NOT NULL DEFAULT '{
    "endpoint_reachable": false,
    "response_time": 0,
    "last_check": null
  }',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;

-- agent_registry 表的 RLS 策略
CREATE POLICY "agent_registry_select" ON agent_registry FOR SELECT USING (true);
CREATE POLICY "agent_registry_insert" ON agent_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_registry_update" ON agent_registry FOR UPDATE USING (true);
CREATE POLICY "agent_registry_delete" ON agent_registry FOR DELETE USING (true);

-- agent_status 表的 RLS 策略
CREATE POLICY "agent_status_select" ON agent_status FOR SELECT USING (true);
CREATE POLICY "agent_status_insert" ON agent_status FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_status_update" ON agent_status FOR UPDATE USING (true);
CREATE POLICY "agent_status_delete" ON agent_status FOR DELETE USING (true);

-- 创建索引
CREATE INDEX idx_agent_registry_domain ON agent_registry(domain);
CREATE INDEX idx_agent_registry_type ON agent_registry(type);
CREATE INDEX idx_agent_status_agent_name ON agent_status(agent_name);
CREATE INDEX idx_agent_status_status ON agent_status(status);
CREATE INDEX idx_agent_status_last_heartbeat ON agent_status(last_heartbeat);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_agent_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_agent_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
CREATE TRIGGER agent_registry_updated_at
  BEFORE UPDATE ON agent_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_registry_updated_at();

CREATE TRIGGER agent_status_updated_at
  BEFORE UPDATE ON agent_status
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_status_updated_at();

-- 插入示例数据（可选，用于测试）
INSERT INTO agent_registry (name, domain, type, endpoint, version, description, metadata, health_check_endpoint, supported_operations)
VALUES
  ('代码审查助手', 'coding', 'n8n', 'http://localhost:5678/webhook/code-review', '1.2.0', '自动审查代码，提供优化建议和质量评分', '{"latency_sensitive": false, "security_level": "high", "traffic_level": "medium", "status_complexity": "high"}', 'http://localhost:5678/webhook/health', '["code_review", "security_scan", "performance_analysis"]'),
  ('文案创作助手', 'writing', 'n8n', 'http://localhost:5678/webhook/copywriting', '1.1.0', '帮助撰写各类营销文案、产品描述', '{"latency_sensitive": false, "security_level": "medium", "traffic_level": "medium", "status_complexity": "medium"}', 'http://localhost:5678/webhook/health', '["copywriting", "seo_optimization", "content_generation"]'),
  ('数据分析助手', 'analysis', 'n8n', 'http://localhost:5678/webhook/data-analysis', '1.3.0', '智能分析数据趋势，生成可视化报告', '{"latency_sensitive": true, "security_level": "medium", "traffic_level": "high", "status_complexity": "high"}', 'http://localhost:5678/webhook/health', '["data_analysis", "chart_generation", "forecast"]')
ON CONFLICT (name) DO NOTHING;

-- 添加注释
COMMENT ON TABLE agent_registry IS '智能体注册表，记录所有注册的智能体及其配置信息';
COMMENT ON TABLE agent_status IS '智能体状态表，记录智能体的实时状态和监控指标';
