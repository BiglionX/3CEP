-- 智能体模块数据库迁移脚本
-- 创建时间: 2026-03-16
-- 版本: 1.0.0

-- 创建智能体表
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'coding', 'writing', 'analysis', 'assistant', 'custom')),
  configuration JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'paused', 'error', 'draft')),
  version VARCHAR(20) DEFAULT '1.0.0',
  tags JSONB DEFAULT '[]',
  pricing JSONB DEFAULT '{"type": "free", "price": 0}',
  icon_url TEXT,
  author_name VARCHAR(100),
  author_avatar TEXT,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建智能体使用日志表
CREATE TABLE IF NOT EXISTS agent_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  session_id VARCHAR(100),
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建智能体评价表
CREATE TABLE IF NOT EXISTS agent_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建智能体版本历史表
CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  configuration JSONB NOT NULL,
  changelog TEXT,
  is_current BOOLEAN DEFAULT false,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;

-- 智能体表的RLS策略
CREATE POLICY "agents_select" ON agents FOR SELECT USING (true);
CREATE POLICY "agents_insert" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (true);
CREATE POLICY "agents_delete" ON agents FOR DELETE USING (true);

-- 智能体使用日志的RLS策略
CREATE POLICY "agent_usage_logs_select" ON agent_usage_logs FOR SELECT USING (true);
CREATE POLICY "agent_usage_logs_insert" ON agent_usage_logs FOR INSERT WITH CHECK (true);

-- 智能体评价的RLS策略
CREATE POLICY "agent_reviews_select" ON agent_reviews FOR SELECT USING (true);
CREATE POLICY "agent_reviews_insert" ON agent_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_reviews_update" ON agent_reviews FOR UPDATE USING (true);
CREATE POLICY "agent_reviews_delete" ON agent_reviews FOR DELETE USING (true);

-- 智能体版本的RLS策略
CREATE POLICY "agent_versions_select" ON agent_versions FOR SELECT USING (true);
CREATE POLICY "agent_versions_insert" ON agent_versions FOR INSERT WITH CHECK (true);

-- 创建索引
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_by ON agents(created_by);
CREATE INDEX idx_agent_usage_logs_agent_id ON agent_usage_logs(agent_id);
CREATE INDEX idx_agent_usage_logs_created_at ON agent_usage_logs(created_at);
CREATE INDEX idx_agent_reviews_agent_id ON agent_reviews(agent_id);
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);

-- 添加智能体数据（来自项目各模块的真实智能体）
-- 先清空现有数据（可选）
-- DELETE FROM agents;

-- 插入智能体数据
INSERT INTO agents (name, description, category, configuration, status, version, author_name, rating, review_count, is_public, is_featured, tags, usage_count) VALUES
('代码审查助手', '自动审查代码，提供优化建议和质量评分，支持安全漏洞检测', 'coding', '{"capabilities": ["code_review", "security_scan", "performance_analysis", "bug_detection"]}', 'active', '1.2.0', '3CEP Team', 4.85, 128, true, true, '["代码", "审查", "安全"]', 5680),
('文案创作助手', '帮助撰写各类营销文案、产品描述和社交媒体内容，支持SEO优化', 'writing', '{"capabilities": ["copywriting", "seo_optimization", "translation", "content_generation"]}', 'active', '1.1.0', '3CEP Team', 4.72, 89, true, true, '["文案", "营销", "SEO"]', 3240),
('数据分析助手', '智能分析数据趋势，生成可视化报告和业务洞察', 'analysis', '{"capabilities": ["data_analysis", "chart_generation", "forecast", "insights"]}', 'active', '1.3.0', '3CEP Team', 4.90, 156, true, true, '["数据", "分析", "可视化"]', 8920),
('智能客服助手', '处理常见客户咨询，提供24/7自动回复服务和工单创建', 'assistant', '{"capabilities": ["faq", "ticket_creation", "sentiment_analysis", "live_transfer"]}', 'active', '2.0.0', '3CEP Team', 4.65, 203, true, true, '["客服", "自动回复", "FAQ"]', 15430),
('客服智能体', '企业客户服务智能体，处理咨询、投诉和建议，提供智能路由', 'assistant', '{"module": "customer-service", "capabilities": ["chat", "faq", "complaint", "suggestion", "smart_routing"]}', 'active', '1.5.0', '3CEP 企业服务', 4.78, 312, true, true, '["企业", "客服", "服务"]', 12890),
('售后智能体', '处理退换货、维修预约、技术支持等售后服务请求', 'assistant', '{"module": "after-sales", "capabilities": ["return_request", "repair_booking", "technical_support", "warranty_check"]}', 'active', '1.4.0', '3CEP 企业服务', 4.82, 198, true, true, '["售后", "维修", "服务"]', 8920),
('技术支持智能体', '提供技术咨询、故障诊断和解决方案推荐', 'assistant', '{"module": "customer-service", "capabilities": ["tech_consult", "diagnosis", "solution_recommend", "remote_assist"]}', 'active', '1.6.0', '3CEP 企业服务', 4.88, 267, true, true, '["技术", "支持", "诊断"]', 7650),
('销售智能体', '智能销售助手，处理询价、报价、订单咨询和销售转化', 'assistant', '{"module": "procurement", "capabilities": ["inquiry", "quotation", "order_consult", "conversion"]}', 'active', '1.3.0', '3CEP 企业服务', 4.70, 145, true, true, '["销售", "转化", "企业"]', 5430),
('采购智能体', '企业采购助手，智能推荐供应商、管理采购订单和审批流程', 'custom', '{"module": "procurement", "capabilities": ["supplier_recommend", "order_management", "approval_flow", "cost_analysis"]}', 'active', '1.2.0', '3CEP 企业服务', 4.75, 98, true, true, '["采购", "供应链", "管理"]', 4320),
('供应链智能体', '供应链管理智能体，监控物流、优化库存和预测需求', 'custom', '{"module": "supply-chain", "capabilities": ["logistics", "inventory", "demand_forecast", "supplier_mgmt"]}', 'active', '1.1.0', '3CEP 企业服务', 4.68, 76, true, false, '["供应链", "物流", "库存"]', 2890),
('仓储智能体', '智能仓储管理，处理入库、出库、库存盘点和预警', 'custom', '{"module": "warehousing", "capabilities": ["inbound", "outbound", "inventory_count", "alert"]}', 'active', '1.0.0', '3CEP 企业服务', 4.55, 54, true, false, '["仓储", "库存", "管理"]', 1870),
('设备故障诊断智能体', '基于AI的设备故障诊断，识别问题并提供维修建议', 'analysis', '{"module": "repair-shop", "capabilities": ["fault_detection", "diagnosis", "repair_recommend", "parts_lookup"]}', 'active', '2.1.0', '3CEP 智能维修', 4.92, 342, true, true, '["故障", "诊断", "维修"]', 12340),
('配件查询智能体', '智能配件搜索和匹配，查找兼容配件和价格对比', 'analysis', '{"module": "parts-market", "capabilities": ["parts_search", "compatibility", "price_compare", "availability"]}', 'active', '1.4.0', '3CEP 配件商城', 4.80, 189, true, true, '["配件", "查询", "比价"]', 9870),
('设备管理智能体', '设备全生命周期管理，记录保养、维修和状态监控', 'custom', '{"module": "device", "capabilities": ["lifecycle", "maintenance", "status_monitor", "warranty"]}', 'active', '1.2.0', '3CEP 设备管理', 4.73, 134, true, false, '["设备", "管理", "监控"]', 6540),
('众筹项目管理智能体', '智能众筹项目管理和进度追踪，实时更新项目状态', 'custom', '{"module": "crowdfunding", "capabilities": ["project_mgmt", "progress_track", "milestone", "backers"]}', 'active', '1.1.0', '3CEP 众筹平台', 4.65, 67, true, false, '["众筹", "项目", "管理"]', 2340),
('FCX积分智能体', 'FCX积分管理和兑换助手，查询余额和推荐兑换商品', 'custom', '{"module": "fcx", "capabilities": ["balance_query", "exchange", "reward_recommend", "history"]}', 'active', '1.0.0', '3CEP 积分商城', 4.58, 89, true, false, '["积分", "FCX", "兑换"]', 4560);
