-- 外贸管理中心核心数据表
-- Migration: create_foreign_trade_core_tables.sql
-- 创建时间: 2026-03-17
-- 版本: 1.0.0
-- 注意：此表依赖于 enterprise-core-tables.sql 的设计模式

-- ====================================================================
-- 第一部分：外贸用户表
-- ====================================================================

-- 外贸用户表（企业主体）
CREATE TABLE IF NOT EXISTS foreign_trade_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (
    business_type IN ('trading_company', 'manufacturer', 'distributor', 'agent', 'other')
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
  main_products TEXT[],
  target_markets TEXT[],
  website VARCHAR(255),
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
CREATE INDEX IF NOT EXISTS idx_foreign_trade_users_user_id ON foreign_trade_users(user_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_users_status ON foreign_trade_users(status);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_users_country ON foreign_trade_users(country);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_users_verification_status ON foreign_trade_users(verification_status);

-- 添加表注释
COMMENT ON TABLE foreign_trade_users IS '外贸用户表（企业主体）';
COMMENT ON COLUMN foreign_trade_users.business_type IS '业务类型：贸易公司、制造商、分销商、代理、其他';

-- ====================================================================
-- 第二部分：外贸团队成员表
-- ====================================================================

CREATE TABLE IF NOT EXISTS foreign_trade_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES foreign_trade_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'manager', 'member', 'viewer')
  ),
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'pending', 'suspended')
  ),
  department VARCHAR(100),
  position VARCHAR(100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_foreign_trade_team_members_enterprise_id ON foreign_trade_team_members(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_team_members_user_id ON foreign_trade_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_team_members_role ON foreign_trade_team_members(role);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_team_members_status ON foreign_trade_team_members(status);

-- 添加表注释
COMMENT ON TABLE foreign_trade_team_members IS '外贸团队成员表';

-- ====================================================================
-- 第三部分：外贸Token账户表
-- ====================================================================

CREATE TABLE IF NOT EXISTS foreign_trade_token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES foreign_trade_users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_foreign_trade_token_accounts_enterprise_id ON foreign_trade_token_accounts(enterprise_id);

-- 添加表注释
COMMENT ON TABLE foreign_trade_token_accounts IS '外贸Token账户表';

-- ====================================================================
-- 第四部分：外贸操作日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS foreign_trade_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES foreign_trade_users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_foreign_trade_audit_logs_enterprise_id ON foreign_trade_audit_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_audit_logs_user_id ON foreign_trade_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_audit_logs_action ON foreign_trade_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_audit_logs_created_at ON foreign_trade_audit_logs(created_at DESC);

-- 添加表注释
COMMENT ON TABLE foreign_trade_audit_logs IS '外贸操作日志表';

-- ====================================================================
-- 第五部分：外贸智能体配置表
-- ====================================================================

CREATE TABLE IF NOT EXISTS foreign_trade_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES foreign_trade_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('trading_assistant', 'logistics_optimizer', 'risk_analyzer', 'price_negotiator', 'document_manager')
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
CREATE INDEX IF NOT EXISTS idx_foreign_trade_agents_enterprise_id ON foreign_trade_agents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_agents_type ON foreign_trade_agents(type);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_agents_status ON foreign_trade_agents(status);

-- 添加表注释
COMMENT ON TABLE foreign_trade_agents IS '外贸智能体配置表';

-- ====================================================================
-- 第六部分：触发器
-- ====================================================================

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_foreign_trade_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS trigger_update_foreign_trade_users_updated_at ON foreign_trade_users;
CREATE TRIGGER trigger_update_foreign_trade_users_updated_at
  BEFORE UPDATE ON foreign_trade_users
  FOR EACH ROW EXECUTE FUNCTION update_foreign_trade_updated_at();

DROP TRIGGER IF EXISTS trigger_update_foreign_trade_team_members_updated_at ON foreign_trade_team_members;
CREATE TRIGGER trigger_update_foreign_trade_team_members_updated_at
  BEFORE UPDATE ON foreign_trade_team_members
  FOR EACH ROW EXECUTE FUNCTION update_foreign_trade_updated_at();

DROP TRIGGER IF EXISTS trigger_update_foreign_trade_token_accounts_updated_at ON foreign_trade_token_accounts;
CREATE TRIGGER trigger_update_foreign_trade_token_accounts_updated_at
  BEFORE UPDATE ON foreign_trade_token_accounts
  FOR EACH ROW EXECUTE FUNCTION update_foreign_trade_updated_at();

DROP TRIGGER IF EXISTS trigger_update_foreign_trade_agents_updated_at ON foreign_trade_agents;
CREATE TRIGGER trigger_update_foreign_trade_agents_updated_at
  BEFORE UPDATE ON foreign_trade_agents
  FOR EACH ROW EXECUTE FUNCTION update_foreign_trade_updated_at();

-- ====================================================================
-- 第七部分：RLS策略（行级安全）
-- ====================================================================

-- 启用RLS
ALTER TABLE foreign_trade_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_token_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_agents ENABLE ROW LEVEL SECURITY;

-- 外贸用户只能看到自己的信息
DROP POLICY IF EXISTS "Users can view their own trade account" ON foreign_trade_users;
CREATE POLICY "Users can view their own trade account"
ON foreign_trade_users FOR SELECT
USING (user_id = auth.uid());

-- 外贸用户可以插入自己的信息
DROP POLICY IF EXISTS "Users can insert their own trade account" ON foreign_trade_users;
CREATE POLICY "Users can insert their own trade account"
ON foreign_trade_users FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 外贸用户可以更新自己的信息
DROP POLICY IF EXISTS "Users can update their own trade account" ON foreign_trade_users;
CREATE POLICY "Users can update their own trade account"
ON foreign_trade_users FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 团队成员只能看到自己所属的团队
DROP POLICY IF EXISTS "Team members can view their team" ON foreign_trade_team_members;
CREATE POLICY "Team members can view their team"
ON foreign_trade_team_members FOR SELECT
USING (user_id = auth.uid());

-- Token账户策略
DROP POLICY IF EXISTS "Users can view their own token account" ON foreign_trade_token_accounts;
CREATE POLICY "Users can view their own token account"
ON foreign_trade_token_accounts FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM foreign_trade_users WHERE user_id = auth.uid()
));

-- 操作日志策略
DROP POLICY IF EXISTS "Users can view their own audit logs" ON foreign_trade_audit_logs;
CREATE POLICY "Users can view their own audit logs"
ON foreign_trade_audit_logs FOR SELECT
USING (user_id = auth.uid() OR enterprise_id IN (
  SELECT id FROM foreign_trade_users WHERE user_id = auth.uid()
));

-- 智能体策略
DROP POLICY IF EXISTS "Users can view their own agents" ON foreign_trade_agents;
CREATE POLICY "Users can view their own agents"
ON foreign_trade_agents FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM foreign_trade_users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own agents" ON foreign_trade_agents;
CREATE POLICY "Users can insert their own agents"
ON foreign_trade_agents FOR INSERT
WITH CHECK (enterprise_id IN (
  SELECT id FROM foreign_trade_users WHERE user_id = auth.uid()
));

-- ====================================================================
-- 第八部分：视图和函数
-- ====================================================================

-- 外贸概览视图
CREATE OR REPLACE VIEW foreign_trade_overview AS
SELECT 
  ftu.id,
  ftu.company_name,
  ftu.business_type,
  ftu.status,
  ftu.subscription_plan,
  ftu.country,
  (SELECT COUNT(*) FROM foreign_trade_team_members 
   WHERE enterprise_id = ftu.id AND status = 'active') as team_size,
  (SELECT COUNT(*) FROM foreign_trade_agents 
   WHERE enterprise_id = ftu.id AND status = 'active') as agents_count,
  COALESCE(ftta.balance, 0) as token_balance,
  0 as partners_count
FROM foreign_trade_users ftu
LEFT JOIN foreign_trade_token_accounts ftta ON ftu.id = ftta.enterprise_id;

COMMENT ON VIEW foreign_trade_overview IS '外贸概览视图';

-- 获取外贸统计信息
CREATE OR REPLACE FUNCTION get_foreign_trade_stats(p_enterprise_id UUID)
RETURNS TABLE(
  team_size BIGINT,
  active_agents BIGINT,
  token_balance DECIMAL(15,2),
  partners_count BIGINT,
  pending_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM foreign_trade_team_members 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as team_size,
    (SELECT COUNT(*) FROM foreign_trade_agents 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as active_agents,
    (SELECT COALESCE(balance, 0) FROM foreign_trade_token_accounts 
     WHERE enterprise_id = p_enterprise_id) as token_balance,
    0 as partners_count,
    0 as pending_orders;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_foreign_trade_stats IS '获取外贸统计信息（合作伙伴和订单统计需要配合业务特定表使用）';

-- ====================================================================
-- 完成
-- ====================================================================
