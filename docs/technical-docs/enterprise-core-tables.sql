-- 企业管理系统核心数据表
-- Migration: 033_create_enterprise_core_tables.sql
-- 创建时间: 2026-03-17
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：企业用户表
-- ====================================================================

-- 企业用户表（企业主体）
CREATE TABLE IF NOT EXISTS enterprise_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  company_license VARCHAR(100) UNIQUE,
  unified_social_credit_code VARCHAR(50), -- 统一社会信用代码
  industry VARCHAR(100), -- 所属行业
  scale VARCHAR(50), -- 企业规模
  contact_person VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  business_license_url TEXT, -- 营业执照文件URL
  business_license_valid_until DATE, -- 营业执照有效期
  address TEXT, -- 企业地址
  city VARCHAR(100), -- 所在城市
  province VARCHAR(100), -- 所在省份
  status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, approved, rejected, suspended
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic', -- basic, professional, enterprise
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT false, -- 是否为管理员
  metadata JSONB, -- 额外的企业元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：企业团队成员表
-- ====================================================================

-- 企业团队成员表
CREATE TABLE IF NOT EXISTS enterprise_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, manager, member, viewer
  permissions JSONB DEFAULT '{}', -- 具体权限配置
  department VARCHAR(100), -- 所属部门
  job_title VARCHAR(100), -- 职位
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id, user_id)
);

-- ====================================================================
-- 第三部分：企业权限定义表
-- ====================================================================

-- 企业权限定义表
CREATE TABLE IF NOT EXISTS enterprise_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL, -- 权限代码
  name VARCHAR(200) NOT NULL, -- 权限名称
  description TEXT, -- 权限描述
  module VARCHAR(50) NOT NULL, -- 所属模块：agents, tokens, procurement, documents, devices, etc.
  category VARCHAR(50), -- 权限分类：view, create, edit, delete, approve
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第四部分：企业操作日志表
-- ====================================================================

-- 企业操作日志表
CREATE TABLE IF NOT EXISTS enterprise_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 操作类型：create, update, delete, login, logout, etc.
  resource_type VARCHAR(50) NOT NULL, -- 资源类型：agent, token, device, document, etc.
  resource_id UUID, -- 资源ID
  resource_name VARCHAR(255), -- 资源名称
  old_values JSONB, -- 修改前的值
  new_values JSONB, -- 修改后的值
  status VARCHAR(20) DEFAULT 'success', -- success, failed
  error_message TEXT, -- 错误信息
  ip_address INET, -- 操作IP
  user_agent TEXT, -- 用户代理
  metadata JSONB, -- 额外的元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第五部分：企业Token账户表
-- ====================================================================

-- 企业Token账户表
CREATE TABLE IF NOT EXISTS enterprise_token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) DEFAULT 0, -- 可用余额
  frozen DECIMAL(15,2) DEFAULT 0, -- 冻结金额
  pending DECIMAL(15,2) DEFAULT 0, -- 待到账
  total_purchased DECIMAL(15,2) DEFAULT 0, -- 总购买量
  total_consumed DECIMAL(15,2) DEFAULT 0, -- 总消费量
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enterprise_id)
);

-- ====================================================================
-- 第六部分：企业智能体配置表
-- ====================================================================

-- 企业智能体配置表
CREATE TABLE IF NOT EXISTS enterprise_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- customer_service, sales_consultant, technical_support, etc.
  avatar_url TEXT,
  config JSONB DEFAULT '{}', -- 智能体配置
  model_config JSONB, -- 模型配置
  prompt_template TEXT, -- 提示词模板
  knowledge_base_ids UUID[], -- 关联的知识库ID
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, inactive, archived
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第七部分：企业设备表（引用前面创建的）
-- ====================================================================

-- 注意：enterprise_devices 表已在 enterprise-devices-tables.sql 中定义
-- 这里只添加与 enterprise_users 的关系
-- ALTER TABLE enterprise_devices ALTER COLUMN enterprise_id SET DATA TYPE UUID;

-- ====================================================================
-- 第八部分：索引优化
-- ====================================================================

-- enterprise_users 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_users_user_id ON enterprise_users(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_status ON enterprise_users(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_subscription_plan ON enterprise_users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_company_name ON enterprise_users(company_name);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_license ON enterprise_users(company_license);

-- enterprise_team_members 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_enterprise_id ON enterprise_team_members(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_user_id ON enterprise_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_role ON enterprise_team_members(role);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_status ON enterprise_team_members(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_department ON enterprise_team_members(department);

-- enterprise_permissions 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_permissions_module ON enterprise_permissions(module);
CREATE INDEX IF NOT EXISTS idx_enterprise_permissions_category ON enterprise_permissions(category);

-- enterprise_audit_logs 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_enterprise_id ON enterprise_audit_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_user_id ON enterprise_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_action ON enterprise_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_resource_type ON enterprise_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_created_at ON enterprise_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_status ON enterprise_audit_logs(status);

-- enterprise_token_accounts 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_token_accounts_enterprise_id ON enterprise_token_accounts(enterprise_id);

-- enterprise_agents 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_enterprise_id ON enterprise_agents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_type ON enterprise_agents(type);
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_status ON enterprise_agents(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_agents_created_by ON enterprise_agents(created_by);

-- ====================================================================
-- 第九部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加触发器
DROP TRIGGER IF EXISTS update_enterprise_users_updated_at ON enterprise_users;
CREATE TRIGGER update_enterprise_users_updated_at
    BEFORE UPDATE ON enterprise_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enterprise_team_members_updated_at ON enterprise_team_members;
CREATE TRIGGER update_enterprise_team_members_updated_at
    BEFORE UPDATE ON enterprise_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enterprise_token_accounts_updated_at ON enterprise_token_accounts;
CREATE TRIGGER update_enterprise_token_accounts_updated_at
    BEFORE UPDATE ON enterprise_token_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enterprise_agents_updated_at ON enterprise_agents;
CREATE TRIGGER update_enterprise_agents_updated_at
    BEFORE UPDATE ON enterprise_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 第十部分：约束和检查
-- ====================================================================

-- enterprise_users 表约束
ALTER TABLE enterprise_users 
ADD CONSTRAINT chk_enterprise_status CHECK (
  status IN ('pending_review', 'approved', 'rejected', 'suspended')
);

ALTER TABLE enterprise_users 
ADD CONSTRAINT chk_subscription_plan CHECK (
  subscription_plan IN ('basic', 'professional', 'enterprise', 'trial')
);

-- enterprise_team_members 表约束
ALTER TABLE enterprise_team_members 
ADD CONSTRAINT chk_team_member_status CHECK (
  status IN ('active', 'inactive', 'pending', 'removed')
);

ALTER TABLE enterprise_team_members 
ADD CONSTRAINT chk_team_member_role CHECK (
  role IN ('admin', 'manager', 'member', 'viewer', 'analyst')
);

-- enterprise_audit_logs 表约束
ALTER TABLE enterprise_audit_logs 
ADD CONSTRAINT chk_audit_status CHECK (
  status IN ('success', 'failed')
);

ALTER TABLE enterprise_audit_logs 
ADD CONSTRAINT chk_audit_action CHECK (
  action IN (
    'create', 'update', 'delete', 'login', 'logout', 'view',
    'download', 'upload', 'approve', 'reject', 'invite'
  )
);

-- enterprise_agents 表约束
ALTER TABLE enterprise_agents 
ADD CONSTRAINT chk_agent_status CHECK (
  status IN ('draft', 'active', 'inactive', 'archived')
);

-- ====================================================================
-- 第十一部分：表注释
-- ====================================================================

-- enterprise_users 表注释
COMMENT ON TABLE enterprise_users IS '企业用户表';
COMMENT ON COLUMN enterprise_users.user_id IS '关联的用户ID';
COMMENT ON COLUMN enterprise_users.company_name IS '企业名称';
COMMENT ON COLUMN enterprise_users.company_license IS '营业执照号';
COMMENT ON COLUMN enterprise_users.unified_social_credit_code IS '统一社会信用代码';
COMMENT ON COLUMN enterprise_users.industry IS '所属行业';
COMMENT ON COLUMN enterprise_users.scale IS '企业规模';
COMMENT ON COLUMN enterprise_users.status IS '状态：pending_review,approved,rejected,suspended';
COMMENT ON COLUMN enterprise_users.subscription_plan IS '订阅计划：basic,professional,enterprise,trial';

-- enterprise_team_members 表注释
COMMENT ON TABLE enterprise_team_members IS '企业团队成员表';
COMMENT ON COLUMN enterprise_team_members.role IS '角色：admin,manager,member,viewer,analyst';

-- enterprise_permissions 表注释
COMMENT ON TABLE enterprise_permissions IS '企业权限定义表';
COMMENT ON COLUMN enterprise_permissions.code IS '权限代码';
COMMENT ON COLUMN enterprise_permissions.module IS '所属模块';
COMMENT ON COLUMN enterprise_permissions.category IS '权限分类：view,create,edit,delete,approve';

-- enterprise_audit_logs 表注释
COMMENT ON TABLE enterprise_audit_logs IS '企业操作日志表';
COMMENT ON COLUMN enterprise_audit_logs.action IS '操作类型';
COMMENT ON COLUMN enterprise_audit_logs.resource_type IS '资源类型';

-- enterprise_token_accounts 表注释
COMMENT ON TABLE enterprise_token_accounts IS '企业Token账户表';
COMMENT ON COLUMN enterprise_token_accounts.balance IS '可用余额';
COMMENT ON COLUMN enterprise_token_accounts.frozen IS '冻结金额';
COMMENT ON COLUMN enterprise_token_accounts.pending IS '待到账';

-- enterprise_agents 表注释
COMMENT ON TABLE enterprise_agents IS '企业智能体配置表';
COMMENT ON COLUMN enterprise_agents.type IS '智能体类型';
COMMENT ON COLUMN enterprise_agents.status IS '状态：draft,active,inactive,archived';

-- ====================================================================
-- 第十二部分：RLS策略
-- ====================================================================

-- 启用RLS
ALTER TABLE enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_token_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_permissions ENABLE ROW LEVEL SECURITY;

-- enterprise_users 表策略
DROP POLICY IF EXISTS "用户可查看自己的企业信息" ON enterprise_users;
CREATE POLICY "用户可查看自己的企业信息"
  ON enterprise_users FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "用户可创建企业信息" ON enterprise_users;
CREATE POLICY "用户可创建企业信息"
  ON enterprise_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "用户可更新自己的企业信息" ON enterprise_users;
CREATE POLICY "用户可更新自己的企业信息"
  ON enterprise_users FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- enterprise_team_members 表策略
DROP POLICY IF EXISTS "团队成员可查看团队成员列表" ON enterprise_team_members;
CREATE POLICY "团队成员可查看团队成员列表"
  ON enterprise_team_members FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业管理员可管理团队成员" ON enterprise_team_members;
CREATE POLICY "企业管理员可管理团队成员"
  ON enterprise_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE id = enterprise_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

-- enterprise_audit_logs 表策略
DROP POLICY IF EXISTS "企业可查看自己的操作日志" ON enterprise_audit_logs;
CREATE POLICY "企业可查看自己的操作日志"
  ON enterprise_audit_logs FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "系统可记录操作日志" ON enterprise_audit_logs;
CREATE POLICY "系统可记录操作日志"
  ON enterprise_audit_logs FOR INSERT
  WITH CHECK (true);

-- enterprise_token_accounts 表策略
DROP POLICY IF EXISTS "企业可查看自己的Token账户" ON enterprise_token_accounts;
CREATE POLICY "企业可查看自己的Token账户"
  ON enterprise_token_accounts FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "系统可更新Token账户" ON enterprise_token_accounts;
CREATE POLICY "系统可更新Token账户"
  ON enterprise_token_accounts FOR UPDATE
  WITH CHECK (true);

-- enterprise_agents 表策略
DROP POLICY IF EXISTS "企业可查看自己的智能体" ON enterprise_agents;
CREATE POLICY "企业可查看自己的智能体"
  ON enterprise_agents FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业可创建智能体" ON enterprise_agents;
CREATE POLICY "企业可创建智能体"
  ON enterprise_agents FOR INSERT
  WITH CHECK (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业可更新自己的智能体" ON enterprise_agents;
CREATE POLICY "企业可更新自己的智能体"
  ON enterprise_agents FOR UPDATE
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "企业可删除自己的智能体" ON enterprise_agents;
CREATE POLICY "企业可删除自己的智能体"
  ON enterprise_agents FOR DELETE
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users WHERE user_id = auth.uid()
    )
  );

-- enterprise_permissions 表策略（公开读取）
DROP POLICY IF EXISTS "所有人可查看权限定义" ON enterprise_permissions;
CREATE POLICY "所有人可查看权限定义"
  ON enterprise_permissions FOR SELECT
  USING (true);

-- ====================================================================
-- 第十三部分：初始化权限数据
-- ====================================================================

-- 插入企业权限定义
INSERT INTO enterprise_permissions (code, name, description, module, category) VALUES
  -- 仪表板权限
  ('dashboard_view', '查看仪表板', '允许查看企业仪表板', 'dashboard', 'view'),
  
  -- 智能体管理权限
  ('agents_view', '查看智能体', '允许查看智能体列表', 'agents', 'view'),
  ('agents_create', '创建智能体', '允许创建新智能体', 'agents', 'create'),
  ('agents_edit', '编辑智能体', '允许编辑智能体配置', 'agents', 'edit'),
  ('agents_delete', '删除智能体', '允许删除智能体', 'agents', 'delete'),
  ('agents_deploy', '部署智能体', '允许部署智能体', 'agents', 'edit'),
  
  -- Token管理权限
  ('tokens_view', '查看Token', '允许查看Token余额和使用记录', 'tokens', 'view'),
  ('tokens_purchase', '购买Token', '允许购买Token', 'tokens', 'create'),
  ('tokens_transfer', '转移Token', '允许转移Token', 'tokens', 'edit'),
  
  -- 门户管理权限
  ('portal_view', '查看门户', '允许查看企业门户', 'portal', 'view'),
  ('portal_edit', '编辑门户', '允许编辑企业门户配置', 'portal', 'edit'),
  
  -- 采购管理权限
  ('procurement_view', '查看采购', '允许查看采购订单', 'procurement', 'view'),
  ('procurement_create', '创建采购', '允许创建采购订单', 'procurement', 'create'),
  ('procurement_edit', '编辑采购', '允许编辑采购订单', 'procurement', 'edit'),
  ('procurement_delete', '删除采购', '允许删除采购订单', 'procurement', 'delete'),
  ('procurement_approve', '审批采购', '允许审批采购订单', 'procurement', 'approve'),
  
  -- 有奖问答权限
  ('reward_qa_view', '查看问答', '允许查看有奖问答', 'reward_qa', 'view'),
  ('reward_qa_create', '创建问答', '允许创建问答活动', 'reward_qa', 'create'),
  ('reward_qa_manage', '管理问答', '允许管理问答内容', 'reward_qa', 'edit'),
  ('reward_qa_approve', '审批问答', '允许审批问答内容', 'reward_qa', 'approve'),
  
  -- 众筹管理权限
  ('crowdfunding_view', '查看众筹', '允许查看众筹项目', 'crowdfunding', 'view'),
  ('crowdfunding_create', '创建众筹', '允许创建众筹项目', 'crowdfunding', 'create'),
  ('crowdfunding_edit', '编辑众筹', '允许编辑众筹项目', 'crowdfunding', 'edit'),
  ('crowdfunding_delete', '删除众筹', '允许删除众筹项目', 'crowdfunding', 'delete'),
  ('crowdfunding_approve', '审批众筹', '允许审批众筹项目', 'crowdfunding', 'approve'),
  
  -- 文档管理权限
  ('documents_view', '查看文档', '允许查看企业文档', 'documents', 'view'),
  ('documents_upload', '上传文档', '允许上传文档', 'documents', 'create'),
  ('documents_edit', '编辑文档', '允许编辑文档信息', 'documents', 'edit'),
  ('documents_delete', '删除文档', '允许删除文档', 'documents', 'delete'),
  ('documents_approve', '审批文档', '允许审批文档', 'documents', 'approve'),
  
  -- 设备管理权限
  ('devices_view', '查看设备', '允许查看设备列表', 'devices', 'view'),
  ('devices_create', '添加设备', '允许添加新设备', 'devices', 'create'),
  ('devices_edit', '编辑设备', '允许编辑设备信息', 'devices', 'edit'),
  ('devices_delete', '删除设备', '允许删除设备', 'devices', 'delete'),
  
  -- 数据分析权限
  ('analytics_view', '查看分析', '允许查看数据分析', 'analytics', 'view'),
  ('analytics_export', '导出数据', '允许导出分析数据', 'analytics', 'edit'),
  
  -- 团队管理权限
  ('team_view', '查看团队', '允许查看团队成员', 'team', 'view'),
  ('team_invite', '邀请成员', '允许邀请团队成员', 'team', 'create'),
  ('team_edit', '编辑成员', '允许编辑成员信息', 'team', 'edit'),
  ('team_remove', '移除成员', '允许移除团队成员', 'team', 'delete'),
  ('team_permissions', '管理权限', '允许管理成员权限', 'team', 'edit'),
  
  -- 系统设置权限
  ('settings_view', '查看设置', '允许查看系统设置', 'settings', 'view'),
  ('settings_edit', '编辑设置', '允许修改系统设置', 'settings', 'edit')
ON CONFLICT (code) DO NOTHING;

-- ====================================================================
-- 第十四部分：实用视图和函数
-- ====================================================================

-- 企业概览视图
CREATE OR REPLACE VIEW enterprise_overview AS
SELECT 
  eu.id,
  eu.company_name,
  eu.status,
  eu.subscription_plan,
  (SELECT COUNT(*) FROM enterprise_team_members 
   WHERE enterprise_id = eu.id AND status = 'active') as team_size,
  (SELECT COUNT(*) FROM enterprise_agents 
   WHERE enterprise_id = eu.id AND status = 'active') as agents_count,
  COALESCE(eta.balance, 0) as token_balance,
  0 as devices_count
FROM enterprise_users eu
LEFT JOIN enterprise_token_accounts eta ON eu.id = eta.enterprise_id;

COMMENT ON VIEW enterprise_overview IS '企业概览视图';

-- 获取企业统计信息
CREATE OR REPLACE FUNCTION get_enterprise_stats(p_enterprise_id UUID)
RETURNS TABLE(
  team_size BIGINT,
  active_agents BIGINT,
  total_devices BIGINT,
  online_devices BIGINT,
  token_balance DECIMAL(15,2),
  pending_documents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM enterprise_team_members 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as team_size,
    (SELECT COUNT(*) FROM enterprise_agents 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as active_agents,
    0 as total_devices,
    0 as online_devices,
    (SELECT COALESCE(balance, 0) FROM enterprise_token_accounts 
     WHERE enterprise_id = p_enterprise_id) as token_balance,
    (SELECT COUNT(*) FROM enterprise_documents 
     WHERE enterprise_id = p_enterprise_id AND status = 'pending') as pending_documents;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_enterprise_stats IS '获取企业统计信息（设备相关字段为0，需配合enterprise-devices-tables.sql使用）';
