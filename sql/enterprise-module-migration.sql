-- 企业服务模块数据库迁移脚本
-- 创建时间: 2026-02-25
-- 版本: 1.0.0

-- 创建企业用户表
CREATE TABLE IF NOT EXISTS enterprise_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  business_license VARCHAR(100),
  contact_person VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  website VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- 创建企业智能体关联表
CREATE TABLE IF NOT EXISTS enterprise_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  configuration JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused', 'error')),
  version VARCHAR(20) DEFAULT '1.0.0',
  deployment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  avg_response_time DECIMAL(8,3) DEFAULT 0.000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建企业采购订单表
CREATE TABLE IF NOT EXISTS enterprise_procurement_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  supplier_name VARCHAR(255),
  supplier_id UUID,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',
  item_count INTEGER NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- 创建采购订单明细表
CREATE TABLE IF NOT EXISTS procurement_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES enterprise_procurement_orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  specifications JSONB,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建企业智能体使用日志表
CREATE TABLE IF NOT EXISTS enterprise_agent_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- 创建企业服务订阅表
CREATE TABLE IF NOT EXISTS enterprise_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_enterprise_users_email ON enterprise_users(email);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_status ON enterprise_users(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_created_at ON enterprise_users(created_at);

CREATE INDEX IF NOT EXISTS idx_enterprise_agents_enterprise_id ON enterprise_agents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_status ON enterprise_agents(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_last_used ON enterprise_agents(last_used DESC);

CREATE INDEX IF NOT EXISTS idx_procurement_orders_enterprise_id ON enterprise_procurement_orders(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_status ON enterprise_procurement_orders(status);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_created_at ON enterprise_procurement_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_order_number ON enterprise_procurement_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_enterprise_id ON enterprise_agent_usage_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_agent_id ON enterprise_agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_created_at ON enterprise_agent_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_success ON enterprise_agent_usage_logs(success);

CREATE INDEX IF NOT EXISTS idx_subscriptions_enterprise_id ON enterprise_subscriptions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON enterprise_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON enterprise_subscriptions(end_date);

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enterprise_users_updated_at 
    BEFORE UPDATE ON enterprise_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_agents_updated_at 
    BEFORE UPDATE ON enterprise_agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_orders_updated_at 
    BEFORE UPDATE ON enterprise_procurement_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON enterprise_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据
INSERT INTO enterprise_users (
  company_name, 
  contact_person, 
  phone, 
  email, 
  status
) VALUES 
  ('示例科技有限公司', '张经理', '13800138000', 'demo@example.com', 'approved'),
  ('测试企业股份公司', '李主管', '13900139000', 'test@company.com', 'approved')
ON CONFLICT (email) DO NOTHING;

-- 添加行级安全策略 (RLS)
ALTER TABLE enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_subscriptions ENABLE ROW LEVEL SECURITY;

-- 企业用户只能查看自己的数据
CREATE POLICY "Enterprise users can view own data" 
ON enterprise_users FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Enterprise users can insert own data" 
ON enterprise_users FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enterprise users can update own data" 
ON enterprise_users FOR UPDATE 
USING (auth.uid() = user_id);

-- 企业智能体相关策略
CREATE POLICY "Enterprise users can view own agents" 
ON enterprise_agents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enterprise_users eu 
    WHERE eu.id = enterprise_id AND eu.user_id = auth.uid()
  )
);

-- 采购订单相关策略
CREATE POLICY "Enterprise users can view own orders" 
ON enterprise_procurement_orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enterprise_users eu 
    WHERE eu.id = enterprise_id AND eu.user_id = auth.uid()
  )
);

-- 使用日志相关策略
CREATE POLICY "Enterprise users can view own usage logs" 
ON enterprise_agent_usage_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enterprise_users eu 
    WHERE eu.id = enterprise_id AND eu.user_id = auth.uid()
  )
);

-- 订阅相关策略
CREATE POLICY "Enterprise users can view own subscriptions" 
ON enterprise_subscriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enterprise_users eu 
    WHERE eu.id = enterprise_id AND eu.user_id = auth.uid()
  )
);

-- 创建视图便于查询
CREATE OR REPLACE VIEW enterprise_dashboard_stats AS
SELECT 
  eu.id as enterprise_id,
  eu.company_name,
  COUNT(DISTINCT ea.id) as total_agents,
  COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'active') as active_agents,
  COUNT(DISTINCT epo.id) as total_orders,
  COUNT(DISTINCT epo.id) FILTER (WHERE epo.status = 'processing') as processing_orders,
  COALESCE(SUM(epo.total_amount) FILTER (WHERE epo.status IN ('processing', 'shipped', 'delivered')), 0) as total_spent,
  COUNT(eaul.id) as total_usage,
  ROUND(AVG(eaul.response_time_ms)::DECIMAL, 2) as avg_response_time
FROM enterprise_users eu
LEFT JOIN enterprise_agents ea ON eu.id = ea.enterprise_id
LEFT JOIN enterprise_procurement_orders epo ON eu.id = epo.enterprise_id
LEFT JOIN enterprise_agent_usage_logs eaul ON eu.id = eaul.enterprise_id
GROUP BY eu.id, eu.company_name;

-- 添加注释
COMMENT ON TABLE enterprise_users IS '企业用户基本信息表';
COMMENT ON TABLE enterprise_agents IS '企业部署的AI智能体信息表';
COMMENT ON TABLE enterprise_procurement_orders IS '企业采购订单主表';
COMMENT ON TABLE procurement_order_items IS '采购订单明细表';
COMMENT ON TABLE enterprise_agent_usage_logs IS '智能体使用日志表';
COMMENT ON TABLE enterprise_subscriptions IS '企业服务订阅表';

COMMENT ON COLUMN enterprise_users.status IS '账户状态: pending(待审核), approved(已批准), rejected(已拒绝), suspended(已暂停)';
COMMENT ON COLUMN enterprise_agents.status IS '智能体状态: active(运行中), inactive(已停用), paused(已暂停), error(错误)';
COMMENT ON COLUMN enterprise_procurement_orders.status IS '订单状态: pending(待审批), approved(已批准), processing(处理中), shipped(已发货), delivered(已送达), cancelled(已取消), rejected(已拒绝)';
COMMENT ON COLUMN enterprise_procurement_orders.priority IS '优先级: low(低), medium(中), high(高), urgent(紧急)';