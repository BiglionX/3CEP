-- 采购管理中心核心数据表
-- Migration: create_procurement_core_tables.sql
-- 创建时间: 2026-03-17
-- 版本: 1.0.0
-- 注意：此表依赖于 enterprise-core-tables.sql 的设计模式

-- ====================================================================
-- 第一部分：采购用户表
-- ====================================================================

-- 采购用户表（企业主体）
CREATE TABLE IF NOT EXISTS procurement_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (
    business_type IN ('manufacturer', 'distributor', 'retailer', 'government', 'other')
  ),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'suspended', 'closed')
  ),
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (
    subscription_plan IN ('free', 'basic', 'professional', 'enterprise')
  ),
  subscription_start_at TIMESTAMP WITH TIME ZONE,
  subscription_end_at TIMESTAMP WITH TIME ZONE,
  company_description TEXT,
  procurement_categories TEXT[],
  annual_budget DECIMAL(15,2),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  logo_url TEXT,
  business_license_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'under_review', 'verified', 'rejected')
  ),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_users_user_id ON procurement_users(user_id);
CREATE INDEX IF NOT EXISTS idx_procurement_users_status ON procurement_users(status);
CREATE INDEX IF NOT EXISTS idx_procurement_users_country ON procurement_users(country);
CREATE INDEX IF NOT EXISTS idx_procurement_users_verification_status ON procurement_users(verification_status);

-- 添加表注释
COMMENT ON TABLE procurement_users IS '采购用户表（企业主体）';
COMMENT ON COLUMN procurement_users.business_type IS '业务类型：制造商、分销商、零售商、政府、其他';

-- ====================================================================
-- 第二部分：采购团队成员表
-- ====================================================================

CREATE TABLE IF NOT EXISTS procurement_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES procurement_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'manager', 'buyer', 'analyst', 'member', 'viewer')
  ),
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'pending', 'suspended')
  ),
  department VARCHAR(100),
  position VARCHAR(100),
  specialization VARCHAR(100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_team_members_enterprise_id ON procurement_team_members(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_procurement_team_members_user_id ON procurement_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_procurement_team_members_role ON procurement_team_members(role);
CREATE INDEX IF NOT EXISTS idx_procurement_team_members_status ON procurement_team_members(status);

-- 添加表注释
COMMENT ON TABLE procurement_team_members IS '采购团队成员表';

-- ====================================================================
-- 第三部分：采购Token账户表
-- ====================================================================

CREATE TABLE IF NOT EXISTS procurement_token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES procurement_users(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  frozen DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (frozen >= 0),
  pending DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (pending >= 0),
  currency VARCHAR(10) DEFAULT 'FXC',
  account_level VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (
    account_level IN ('basic', 'standard', 'premium', 'enterprise')
  ),
  credit_limit DECIMAL(15,2) DEFAULT 0.00,
  auto_recharge BOOLEAN DEFAULT false,
  auto_recharge_threshold DECIMAL(15,2),
  auto_recharge_amount DECIMAL(15,2),
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_token_accounts_enterprise_id ON procurement_token_accounts(enterprise_id);

-- 添加表注释
COMMENT ON TABLE procurement_token_accounts IS '采购Token账户表';

-- ====================================================================
-- 第四部分：采购操作日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS procurement_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES procurement_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (
    status IN ('success', 'failure', 'warning')
  ),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_audit_logs_enterprise_id ON procurement_audit_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_procurement_audit_logs_user_id ON procurement_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_procurement_audit_logs_action ON procurement_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_procurement_audit_logs_created_at ON procurement_audit_logs(created_at DESC);

-- 添加表注释
COMMENT ON TABLE procurement_audit_logs IS '采购操作日志表';

-- ====================================================================
-- 第五部分：采购智能体配置表
-- ====================================================================

CREATE TABLE IF NOT EXISTS procurement_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES procurement_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('price_analyzer', 'supplier_evaluator', 'demand_forecaster', 
             'contract_analyzer', 'risk_assessor', 'spending_optimizer')
  ),
  description TEXT,
  model_config JSONB DEFAULT '{}',
  prompt_template TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'training', 'error')
  ),
  capabilities JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_procurement_agents_enterprise_id ON procurement_agents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_procurement_agents_type ON procurement_agents(type);
CREATE INDEX IF NOT EXISTS idx_procurement_agents_status ON procurement_agents(status);

-- 添加表注释
COMMENT ON TABLE procurement_agents IS '采购智能体配置表';

-- ====================================================================
-- 第六部分：触发器
-- ====================================================================

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_procurement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS trigger_update_procurement_users_updated_at ON procurement_users;
CREATE TRIGGER trigger_update_procurement_users_updated_at
  BEFORE UPDATE ON procurement_users
  FOR EACH ROW EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS trigger_update_procurement_team_members_updated_at ON procurement_team_members;
CREATE TRIGGER trigger_update_procurement_team_members_updated_at
  BEFORE UPDATE ON procurement_team_members
  FOR EACH ROW EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS trigger_update_procurement_token_accounts_updated_at ON procurement_token_accounts;
CREATE TRIGGER trigger_update_procurement_token_accounts_updated_at
  BEFORE UPDATE ON procurement_token_accounts
  FOR EACH ROW EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS trigger_update_procurement_agents_updated_at ON procurement_agents;
CREATE TRIGGER trigger_update_procurement_agents_updated_at
  BEFORE UPDATE ON procurement_agents
  FOR EACH ROW EXECUTE FUNCTION update_procurement_updated_at();

-- ====================================================================
-- 第七部分：RLS策略（行级安全）
-- ====================================================================

-- 启用RLS
ALTER TABLE procurement_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_token_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_agents ENABLE ROW LEVEL SECURITY;

-- 采购用户只能看到自己的信息
DROP POLICY IF EXISTS "Users can view their own procurement account" ON procurement_users;
CREATE POLICY "Users can view their own procurement account"
ON procurement_users FOR SELECT
USING (user_id = auth.uid());

-- 采购用户可以插入自己的信息
DROP POLICY IF EXISTS "Users can insert their own procurement account" ON procurement_users;
CREATE POLICY "Users can insert their own procurement account"
ON procurement_users FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 采购用户可以更新自己的信息
DROP POLICY IF EXISTS "Users can update their own procurement account" ON procurement_users;
CREATE POLICY "Users can update their own procurement account"
ON procurement_users FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 团队成员只能看到自己所属的团队
DROP POLICY IF EXISTS "Team members can view their team" ON procurement_team_members;
CREATE POLICY "Team members can view their team"
ON procurement_team_members FOR SELECT
USING (user_id = auth.uid());

-- Token账户策略
DROP POLICY IF EXISTS "Users can view their own token account" ON procurement_token_accounts;
CREATE POLICY "Users can view their own token account"
ON procurement_token_accounts FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM procurement_users WHERE user_id = auth.uid()
));

-- 操作日志策略
DROP POLICY IF EXISTS "Users can view their own audit logs" ON procurement_audit_logs;
CREATE POLICY "Users can view their own audit logs"
ON procurement_audit_logs FOR SELECT
USING (user_id = auth.uid() OR enterprise_id IN (
  SELECT id FROM procurement_users WHERE user_id = auth.uid()
));

-- 智能体策略
DROP POLICY IF EXISTS "Users can view their own agents" ON procurement_agents;
CREATE POLICY "Users can view their own agents"
ON procurement_agents FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM procurement_users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own agents" ON procurement_agents;
CREATE POLICY "Users can insert their own agents"
ON procurement_agents FOR INSERT
WITH CHECK (enterprise_id IN (
  SELECT id FROM procurement_users WHERE user_id = auth.uid()
));

-- ====================================================================
-- 第八部分：视图和函数
-- ====================================================================

-- 采购概览视图
CREATE OR REPLACE VIEW procurement_overview AS
SELECT 
  pu.id,
  pu.company_name,
  pu.business_type,
  pu.status,
  pu.subscription_plan,
  pu.country,
  pu.annual_budget,
  (SELECT COUNT(*) FROM procurement_team_members 
   WHERE enterprise_id = pu.id AND status = 'active') as team_size,
  (SELECT COUNT(*) FROM procurement_agents 
   WHERE enterprise_id = pu.id AND status = 'active') as agents_count,
  COALESCE(pta.balance, 0) as token_balance,
  0 as pending_requests_count
FROM procurement_users pu
LEFT JOIN procurement_token_accounts pta ON pu.id = pta.enterprise_id;

COMMENT ON VIEW procurement_overview IS '采购概览视图';

-- 获取采购统计信息
CREATE OR REPLACE FUNCTION get_procurement_stats(p_enterprise_id UUID)
RETURNS TABLE(
  team_size BIGINT,
  active_agents BIGINT,
  token_balance DECIMAL(15,2),
  pending_requests BIGINT,
  total_spend DECIMAL(15,2),
  active_suppliers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM procurement_team_members 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as team_size,
    (SELECT COUNT(*) FROM procurement_agents 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as active_agents,
    (SELECT COALESCE(balance, 0) FROM procurement_token_accounts 
     WHERE enterprise_id = p_enterprise_id) as token_balance,
    0 as pending_requests,
    0 as total_spend,
    0 as active_suppliers;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_procurement_stats IS '获取采购统计信息（采购请求和供应商统计需要配合业务特定表使用）';

-- ====================================================================
-- 完成
-- ====================================================================
