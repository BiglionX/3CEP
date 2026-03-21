-- ============================================================================
-- 多类型用户管理 - 独立部署版 SQL
-- ============================================================================
-- 创建时间：2026-03-22
-- 版本：1.0.1 (修复 roles 表依赖)
-- 说明：不依赖任何外部表，可直接执行
-- ============================================================================

-- ============================================================================
-- 第一部分：统一的用户账户表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 用户类型（核心字段）
  user_type VARCHAR(50) NOT NULL CHECK (
    user_type IN ('individual', 'repair_shop', 'enterprise', 'foreign_trade_company')
  ),
  account_type VARCHAR(50) NOT NULL CHECK (
    account_type IN ('individual', 'repair_shop', 'factory', 'supplier', 'enterprise', 'foreign_trade')
  ),

  -- 基本信息
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- 状态管理
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'suspended', 'closed', 'rejected')
  ),

  -- 认证信息
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'under_review', 'verified', 'rejected')
  ),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),

  -- 订阅信息
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (
    subscription_plan IN ('free', 'basic', 'professional', 'enterprise')
  ),
  subscription_start_at TIMESTAMP WITH TIME ZONE,
  subscription_end_at TIMESTAMP WITH TIME ZONE,

  -- 用户角色（简化版，直接存储）
  role VARCHAR(50) DEFAULT 'viewer' CHECK (
    role IN ('admin', 'manager', 'content_manager', 'shop_manager', 'finance_manager',
             'procurement_specialist', 'warehouse_operator', 'agent_operator', 'viewer')
  ),

  -- 元数据
  metadata JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_type ON user_accounts(user_type);
CREATE INDEX IF NOT EXISTS idx_user_accounts_account_type ON user_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON user_accounts(status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_verification_status ON user_accounts(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_subscription_plan ON user_accounts(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_created_at ON user_accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role);

COMMENT ON TABLE user_accounts IS '统一用户账户表 - 管理所有类型的用户';
COMMENT ON COLUMN user_accounts.user_type IS '用户类型：个人、维修店、企业、外贸公司';
COMMENT ON COLUMN user_accounts.account_type IS '账户类型：个人、维修店、工厂、供应商、企业、外贸';
COMMENT ON COLUMN user_accounts.role IS '用户角色（简化版，直接存储在账户表中）';

-- ============================================================================
-- 第二部分：C 端个人用户详情表
-- ============================================================================

CREATE TABLE IF NOT EXISTS individual_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id UUID NOT NULL UNIQUE REFERENCES user_accounts(id) ON DELETE CASCADE,

  -- 个人信息
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  nickname VARCHAR(100),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  birthday DATE,

  -- 地址信息
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'China',
  postal_code VARCHAR(20),

  -- 会员信息
  membership_level INTEGER DEFAULT 1,
  membership_points INTEGER DEFAULT 0,

  -- 扩展信息
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_individual_users_user_account_id ON individual_users(user_account_id);
CREATE INDEX IF NOT EXISTS idx_individual_users_membership_level ON individual_users(membership_level);

COMMENT ON TABLE individual_users IS 'C 端个人用户详情表';

-- ============================================================================
-- 第三部分：维修店用户详情表
-- ============================================================================

CREATE TABLE IF NOT EXISTS repair_shop_users_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id UUID NOT NULL UNIQUE REFERENCES user_accounts(id) ON DELETE CASCADE,

  -- 店铺信息
  shop_name VARCHAR(255) NOT NULL,
  shop_type VARCHAR(50) NOT NULL CHECK (
    shop_type IN ('authorized_dealer', 'independent', 'franchise', 'mobile_service')
  ),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),

  -- 店铺详情
  shop_description TEXT,
  specialties TEXT[],
  services TEXT[],

  -- 联系信息
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'China',
  postal_code VARCHAR(20),

  -- 认证信息
  logo_url TEXT,
  cover_image_url TEXT,
  business_license_url TEXT,
  qualification_cert_url TEXT,
  certification_level INTEGER DEFAULT 1 CHECK (certification_level BETWEEN 1 AND 5),

  -- 扩展信息
  business_hours JSONB,
  service_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_shop_users_detail_user_account_id ON repair_shop_users_detail(user_account_id);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_detail_shop_type ON repair_shop_users_detail(shop_type);
CREATE INDEX IF NOT EXISTS idx_repair_shop_users_detail_city ON repair_shop_users_detail(city);

COMMENT ON TABLE repair_shop_users_detail IS '维修店用户详情表';

-- ============================================================================
-- 第四部分：企业用户详情表（包含贸易公司、工厂、供应商）
-- ============================================================================

CREATE TABLE IF NOT EXISTS enterprise_users_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id UUID NOT NULL UNIQUE REFERENCES user_accounts(id) ON DELETE CASCADE,

  -- 企业信息
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (
    business_type IN ('manufacturer', 'supplier', 'distributor', 'retailer', 'foreign_trade', 'government')
  ),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  company_license TEXT,

  -- 企业详情
  company_description TEXT,
  industry VARCHAR(100),
  employee_count VARCHAR(50),
  annual_revenue VARCHAR(50),

  -- 业务信息
  procurement_categories TEXT[],
  main_products TEXT[],
  target_markets TEXT[],

  -- 联系信息
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_person VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'China',
  postal_code VARCHAR(20),

  -- 认证信息
  logo_url TEXT,
  cover_image_url TEXT,
  business_license_url TEXT,
  iso_cert_url TEXT,

  -- 扩展信息
  website_url TEXT,
  social_media JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_users_detail_user_account_id ON enterprise_users_detail(user_account_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_detail_business_type ON enterprise_users_detail(business_type);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_detail_country ON enterprise_users_detail(country);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_detail_industry ON enterprise_users_detail(industry);

COMMENT ON TABLE enterprise_users_detail IS '企业用户详情表（包含贸易公司、工厂、供应商）';

-- ============================================================================
-- 第五部分：用户统计视图
-- ============================================================================

CREATE OR REPLACE VIEW user_stats_view AS
SELECT
  -- 总体统计
  COUNT(*) as total_users,

  -- 按用户类型统计
  COUNT(*) FILTER (WHERE user_type = 'individual') as individual_count,
  COUNT(*) FILTER (WHERE user_type = 'repair_shop') as repair_shop_count,
  COUNT(*) FILTER (WHERE user_type = 'enterprise') as enterprise_count,
  COUNT(*) FILTER (WHERE user_type = 'foreign_trade_company') as foreign_trade_count,

  -- 按账户类型统计
  COUNT(*) FILTER (WHERE account_type = 'individual') as individual_account_count,
  COUNT(*) FILTER (WHERE account_type = 'repair_shop') as repair_shop_account_count,
  COUNT(*) FILTER (WHERE account_type IN ('factory', 'supplier')) as supply_chain_count,
  COUNT(*) FILTER (WHERE account_type = 'enterprise') as enterprise_account_count,
  COUNT(*) FILTER (WHERE account_type = 'foreign_trade') as foreign_trade_account_count,

  -- 按状态统计
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'suspended') as suspended_count,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_count,

  -- 按认证状态统计
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(*) FILTER (WHERE verification_status = 'under_review') as under_review_count,
  COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_count,

  -- 按订阅计划统计
  COUNT(*) FILTER (WHERE subscription_plan = 'free') as free_count,
  COUNT(*) FILTER (WHERE subscription_plan = 'basic') as basic_count,
  COUNT(*) FILTER (WHERE subscription_plan = 'professional') as professional_count,
  COUNT(*) FILTER (WHERE subscription_plan = 'enterprise') as enterprise_plan_count,

  -- 按角色统计
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'manager') as manager_count,
  COUNT(*) FILTER (WHERE role = 'viewer') as viewer_count

FROM user_accounts;

COMMENT ON VIEW user_stats_view IS '用户统计视图 - 提供各维度用户数据统计';

-- ============================================================================
-- 第六部分：触发器函数（自动更新时间戳）
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 user_accounts 表创建触发器
CREATE TRIGGER trg_update_user_account_updated_at
  BEFORE UPDATE ON user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_account_updated_at();

CREATE OR REPLACE FUNCTION update_detail_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为详情表创建触发器
CREATE TRIGGER trg_update_individual_updated_at
  BEFORE UPDATE ON individual_users
  FOR EACH ROW
  EXECUTE FUNCTION update_detail_table_updated_at();

CREATE TRIGGER trg_update_repair_shop_updated_at
  BEFORE UPDATE ON repair_shop_users_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_detail_table_updated_at();

CREATE TRIGGER trg_update_enterprise_updated_at
  BEFORE UPDATE ON enterprise_users_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_detail_table_updated_at();

-- ============================================================================
-- 完成提示
-- ============================================================================

SELECT '✅ 多类型用户管理表结构创建完成！' AS migration_status;
