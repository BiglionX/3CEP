-- 维修店管理中心核心数据表
-- Migration: create_repair_shop_core_tables.sql
-- 创建时间: 2026-03-17
-- 版本: 1.0.0
-- 注意：此表依赖于 enterprise-core-tables.sql 的设计模式

-- ====================================================================
-- 第一部分：维修店用户表
-- ====================================================================

-- 维修店用户表（企业主体）
CREATE TABLE IF NOT EXISTS repair_shop_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  shop_type VARCHAR(50) NOT NULL CHECK (
    shop_type IN ('authorized_dealer', 'independent', 'franchise', 'mobile_service')
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
  shop_description TEXT,
  specialties TEXT[],
  services TEXT[],
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'China',
  postal_code VARCHAR(20),
  logo_url TEXT,
  cover_image_url TEXT,
  business_license_url TEXT,
  qualification_cert_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'under_review', 'verified', 'rejected')
  ),
  certification_level INTEGER DEFAULT 1 CHECK (certification_level BETWEEN 1 AND 5),
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_user_id ON repair_shop_users(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_status ON repair_shop_users(status);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_city ON repair_shop_users(city);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_verification_status ON repair_shop_users(verification_status);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_rating ON repair_shop_users(rating);

-- 添加表注释
COMMENT ON TABLE repair_shop_users IS '维修店用户表（企业主体）';
COMMENT ON COLUMN repair_shop_users.shop_type IS '店铺类型：授权经销商、独立维修店、加盟店、移动服务';

-- ====================================================================
-- 第二部分：维修店团队成员表
-- ====================================================================

CREATE TABLE IF NOT EXISTS repair_shop_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES repair_shop_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'manager', 'technician', 'member', 'viewer')
  ),
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'pending', 'suspended')
  ),
  department VARCHAR(100),
  position VARCHAR(100),
  specialization VARCHAR(100),
  certifications TEXT[],
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_repair_shop_team_members_enterprise_id ON repair_shop_team_members(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_team_members_user_id ON repair_shop_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_team_members_role ON repair_shop_team_members(role);
CREATE INDEX IF NOT EXISTS idx_repair_shop_team_members_status ON repair_shop_team_members(status);

-- 添加表注释
COMMENT ON TABLE repair_shop_team_members IS '维修店团队成员表';

-- ====================================================================
-- 第三部分：维修店Token账户表
-- ====================================================================

CREATE TABLE IF NOT EXISTS repair_shop_token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES repair_shop_users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_repair_shop_token_accounts_enterprise_id ON repair_shop_token_accounts(enterprise_id);

-- 添加表注释
COMMENT ON TABLE repair_shop_token_accounts IS '维修店Token账户表';

-- ====================================================================
-- 第四部分：维修店操作日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS repair_shop_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES repair_shop_users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_repair_shop_audit_logs_enterprise_id ON repair_shop_audit_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_audit_logs_user_id ON repair_shop_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_audit_logs_action ON repair_shop_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_repair_shop_audit_logs_created_at ON repair_shop_audit_logs(created_at DESC);

-- 添加表注释
COMMENT ON TABLE repair_shop_audit_logs IS '维修店操作日志表';

-- ====================================================================
-- 第五部分：维修店智能体配置表
-- ====================================================================

CREATE TABLE IF NOT EXISTS repair_shop_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES repair_shop_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('diagnostic_assistant', 'appointment_manager', 'inventory_optimizer', 
             'customer_service', 'quality_inspector', 'pricing_advisor')
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
CREATE INDEX IF NOT EXISTS idx_repair_shop_agents_enterprise_id ON repair_shop_agents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_agents_type ON repair_shop_agents(type);
CREATE INDEX IF NOT EXISTS idx_repair_shop_agents_status ON repair_shop_agents(status);

-- 添加表注释
COMMENT ON TABLE repair_shop_agents IS '维修店智能体配置表';

-- ====================================================================
-- 第六部分：触发器
-- ====================================================================

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_repair_shop_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS trigger_update_repair_shop_users_updated_at ON repair_shop_users;
CREATE TRIGGER trigger_update_repair_shop_users_updated_at
  BEFORE UPDATE ON repair_shop_users
  FOR EACH ROW EXECUTE FUNCTION update_repair_shop_updated_at();

DROP TRIGGER IF EXISTS trigger_update_repair_shop_team_members_updated_at ON repair_shop_team_members;
CREATE TRIGGER trigger_update_repair_shop_team_members_updated_at
  BEFORE UPDATE ON repair_shop_team_members
  FOR EACH ROW EXECUTE FUNCTION update_repair_shop_updated_at();

DROP TRIGGER IF EXISTS trigger_update_repair_shop_token_accounts_updated_at ON repair_shop_token_accounts;
CREATE TRIGGER trigger_update_repair_shop_token_accounts_updated_at
  BEFORE UPDATE ON repair_shop_token_accounts
  FOR EACH ROW EXECUTE FUNCTION update_repair_shop_updated_at();

DROP TRIGGER IF EXISTS trigger_update_repair_shop_agents_updated_at ON repair_shop_agents;
CREATE TRIGGER trigger_update_repair_shop_agents_updated_at
  BEFORE UPDATE ON repair_shop_agents
  FOR EACH ROW EXECUTE FUNCTION update_repair_shop_updated_at();

-- ====================================================================
-- 第七部分：RLS策略（行级安全）
-- ====================================================================

-- 启用RLS
ALTER TABLE repair_shop_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shop_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shop_token_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shop_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shop_agents ENABLE ROW LEVEL SECURITY;

-- 维修店用户只能看到自己的信息
DROP POLICY IF EXISTS "Users can view their own shop account" ON repair_shop_users;
CREATE POLICY "Users can view their own shop account"
ON repair_shop_users FOR SELECT
USING (user_id = auth.uid());

-- 维修店用户可以插入自己的信息
DROP POLICY IF EXISTS "Users can insert their own shop account" ON repair_shop_users;
CREATE POLICY "Users can insert their own shop account"
ON repair_shop_users FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 维修店用户可以更新自己的信息
DROP POLICY IF EXISTS "Users can update their own shop account" ON repair_shop_users;
CREATE POLICY "Users can update their own shop account"
ON repair_shop_users FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 团队成员只能看到自己所属的团队
DROP POLICY IF EXISTS "Team members can view their team" ON repair_shop_team_members;
CREATE POLICY "Team members can view their team"
ON repair_shop_team_members FOR SELECT
USING (user_id = auth.uid());

-- Token账户策略
DROP POLICY IF EXISTS "Users can view their own token account" ON repair_shop_token_accounts;
CREATE POLICY "Users can view their own token account"
ON repair_shop_token_accounts FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM repair_shop_users WHERE user_id = auth.uid()
));

-- 操作日志策略
DROP POLICY IF EXISTS "Users can view their own audit logs" ON repair_shop_audit_logs;
CREATE POLICY "Users can view their own audit logs"
ON repair_shop_audit_logs FOR SELECT
USING (user_id = auth.uid() OR enterprise_id IN (
  SELECT id FROM repair_shop_users WHERE user_id = auth.uid()
));

-- 智能体策略
DROP POLICY IF EXISTS "Users can view their own agents" ON repair_shop_agents;
CREATE POLICY "Users can view their own agents"
ON repair_shop_agents FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM repair_shop_users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own agents" ON repair_shop_agents;
CREATE POLICY "Users can insert their own agents"
ON repair_shop_agents FOR INSERT
WITH CHECK (enterprise_id IN (
  SELECT id FROM repair_shop_users WHERE user_id = auth.uid()
));

-- ====================================================================
-- 第八部分：视图和函数
-- ====================================================================

-- 维修店概览视图
CREATE OR REPLACE VIEW repair_shop_overview AS
SELECT 
  rsu.id,
  rsu.shop_name,
  rsu.shop_type,
  rsu.status,
  rsu.subscription_plan,
  rsu.city,
  rsu.rating,
  rsu.review_count,
  rsu.service_count,
  rsu.certification_level,
  (SELECT COUNT(*) FROM repair_shop_team_members 
   WHERE enterprise_id = rsu.id AND status = 'active') as team_size,
  (SELECT COUNT(*) FROM repair_shop_agents 
   WHERE enterprise_id = rsu.id AND status = 'active') as agents_count,
  COALESCE(rsta.balance, 0) as token_balance,
  0 as tutorials_count
FROM repair_shop_users rsu
LEFT JOIN repair_shop_token_accounts rsta ON rsu.id = rsta.enterprise_id;

COMMENT ON VIEW repair_shop_overview IS '维修店概览视图';

-- 获取维修店统计信息
CREATE OR REPLACE FUNCTION get_repair_shop_stats(p_enterprise_id UUID)
RETURNS TABLE(
  team_size BIGINT,
  active_agents BIGINT,
  token_balance DECIMAL(15,2),
  tutorials_count BIGINT,
  total_services BIGINT,
  average_rating DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM repair_shop_team_members 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as team_size,
    (SELECT COUNT(*) FROM repair_shop_agents 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as active_agents,
    (SELECT COALESCE(balance, 0) FROM repair_shop_token_accounts 
     WHERE enterprise_id = p_enterprise_id) as token_balance,
    0 as tutorials_count,
    0 as total_services,
    0 as average_rating;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_repair_shop_stats IS '获取维修店统计信息（教程统计需要配合业务特定表使用）';

-- ====================================================================
-- 完成
-- ====================================================================
