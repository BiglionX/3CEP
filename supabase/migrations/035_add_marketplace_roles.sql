-- 添加市场管理相关角色和权限
-- 创建时间：2026-03-23
-- 版本：5.0.0 - 使用 VARCHAR 代替枚举类型，避免事务提交问题

-- ====================================================================
-- 第一部分：扩展用户角色枚举类型
-- ====================================================================

-- 添加新的角色值到 user_role 枚举
DO $$
BEGIN
  -- 检查并添加 marketplace_admin 角色
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                 JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'user_role' AND e.enumlabel = 'marketplace_admin') THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'marketplace_admin';
  END IF;

  -- 检查并添加 shop_reviewer 角色
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                 JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'user_role' AND e.enumlabel = 'shop_reviewer') THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'shop_reviewer';
  END IF;

  -- 检查并添加 agent_operator 角色（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                 JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'user_role' AND e.enumlabel = 'agent_operator') THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'agent_operator';
  END IF;
END $$;

-- ====================================================================
-- 第二部分：创建角色权限映射表（简化版，不依赖 permissions 表）
-- ====================================================================

-- 创建角色权限映射表（如果不存在）
CREATE TABLE IF NOT EXISTS role_permissions_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_name, resource, action)
);

-- 插入 marketplace_admin 角色权限（使用简单的 VALUES + ON CONFLICT）
INSERT INTO role_permissions_map (role_name, resource, action, description) VALUES
  ('marketplace_admin', 'all', 'manage', '市场完全管理权限'),
  ('marketplace_admin', 'agents', 'manage', '智能体管理权限'),
  ('marketplace_admin', 'skills', 'manage', 'Skill 管理权限'),
  ('marketplace_admin', 'agent_store', 'manage', '智能体商店管理权限'),
  ('marketplace_admin', 'skill_store', 'manage', 'Skill 商店管理权限'),
  ('marketplace_admin', 'marketplace_orders', 'manage', '市场订单管理权限'),
  ('marketplace_admin', 'developers', 'manage', '开发者管理权限'),
  ('marketplace_admin', 'reviews', 'manage', '评价管理权限'),
  ('marketplace_admin', 'categories', 'manage', '分类管理权限'),
  ('marketplace_admin', 'audit_logs', 'read', '审核日志查看权限')
ON CONFLICT (role_name, resource, action) DO NOTHING;

-- 插入 shop_reviewer 角色权限
INSERT INTO role_permissions_map (role_name, resource, action, description) VALUES
  ('shop_reviewer', 'shops', 'read', '店铺信息查看权限'),
  ('shop_reviewer', 'shops', 'update', '店铺审核权限'),
  ('shop_reviewer', 'repair_shops', 'read', '维修店信息查看权限'),
  ('shop_reviewer', 'repair_shops', 'update', '维修店审核权限'),
  ('shop_reviewer', 'audit_logs', 'read', '审核日志查看权限')
ON CONFLICT (role_name, resource, action) DO NOTHING;

-- 插入 agent_operator 角色权限
INSERT INTO role_permissions_map (role_name, resource, action, description) VALUES
  ('agent_operator', 'agents', 'read', '智能体查看权限'),
  ('agent_operator', 'agents', 'execute', '智能体执行权限'),
  ('agent_operator', 'agent_executions', 'read', '执行记录查看权限'),
  ('agent_operator', 'agent_executions', 'create', '创建执行任务权限'),
  ('agent_operator', 'workflows', 'read', '工作流查看权限'),
  ('agent_operator', 'workflows', 'execute', '工作流执行权限')
ON CONFLICT (role_name, resource, action) DO NOTHING;

-- 插入 admin 角色市场权限
INSERT INTO role_permissions_map (role_name, resource, action, description) VALUES
  ('admin', 'marketplace', 'manage', '市场完全管理权限'),
  ('admin', 'agent_store', 'manage', '智能体商店管理权限'),
  ('admin', 'skill_store', 'manage', 'Skill 商店管理权限'),
  ('admin', 'developers', 'manage', '开发者管理权限'),
  ('admin', 'marketplace_orders', 'manage', '市场订单管理权限'),
  ('admin', 'revenue_share', 'manage', '收入分成管理权限')
ON CONFLICT (role_name, resource, action) DO NOTHING;

-- ====================================================================
-- 第四部分：创建角色权限视图
-- ====================================================================

-- 创建市场管理员权限视图
CREATE OR REPLACE VIEW marketplace_admin_permissions AS
SELECT
  p.resource,
  p.action,
  p.description
FROM permissions p
WHERE p.role = 'marketplace_admin'
ORDER BY p.resource, p.action;

-- 创建店铺审核员权限视图
CREATE OR REPLACE VIEW shop_reviewer_permissions AS
SELECT
  p.resource,
  p.action,
  p.description
FROM permissions p
WHERE p.role = 'shop_reviewer'
ORDER BY p.resource, p.action;

-- ====================================================================
-- 第五部分：添加菜单权限配置
-- ====================================================================

-- 创建菜单权限配置表（如果不存在）
CREATE TABLE IF NOT EXISTS menu_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id VARCHAR(100) NOT NULL,
  menu_name VARCHAR(200) NOT NULL,
  menu_path VARCHAR(500) NOT NULL,
  required_role VARCHAR(50) NOT NULL, -- 改用 VARCHAR 而不是 user_role 枚举，避免事务问题
  parent_menu_id VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  icon_name VARCHAR(50),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, required_role)
);

-- 启用 RLS
ALTER TABLE menu_permissions ENABLE ROW LEVEL SECURITY;

-- 所有人可查看菜单权限
CREATE POLICY "所有人可查看菜单权限" ON menu_permissions
FOR SELECT USING (true);

-- 仅管理员可管理菜单权限
CREATE POLICY "管理员可管理菜单权限" ON menu_permissions
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 插入智能体商店管理菜单权限
INSERT INTO menu_permissions (menu_id, menu_name, menu_path, required_role, parent_menu_id, sort_order, icon_name) VALUES
  ('store-management', '商店管理', '/admin/store-management', 'admin', NULL, 10, 'Store'),
  ('agent-store-manage', '智能体商店', '/admin/agent-store', 'admin', 'store-management', 1, 'ShoppingBag'),
  ('skill-store-manage', 'Skill 商店', '/admin/skill-store', 'admin', 'store-management', 2, 'Zap'),
  ('marketplace-operate', '市场运营', '/admin/marketplace', 'admin', 'store-management', 3, 'TrendingUp'),
  ('developer-manage', '开发者管理', '/admin/developers', 'admin', 'store-management', 4, 'Users')
ON CONFLICT (menu_id, required_role) DO NOTHING;

-- 插入 marketplace_admin 角色的菜单权限
INSERT INTO menu_permissions (menu_id, menu_name, menu_path, required_role, parent_menu_id, sort_order, icon_name) VALUES
  ('store-management', '商店管理', '/admin/store-management', 'marketplace_admin', NULL, 10, 'Store'),
  ('agent-store-manage', '智能体商店', '/admin/agent-store', 'marketplace_admin', 'store-management', 1, 'ShoppingBag'),
  ('skill-store-manage', 'Skill 商店', '/admin/skill-store', 'marketplace_admin', 'store-management', 2, 'Zap'),
  ('marketplace-operate', '市场运营', '/admin/marketplace', 'marketplace_admin', 'store-management', 3, 'TrendingUp'),
  ('developer-manage', '开发者管理', '/admin/developers', 'marketplace_admin', 'store-management', 4, 'Users')
ON CONFLICT (menu_id, required_role) DO NOTHING;

-- 插入 shop_reviewer 角色的菜单权限
INSERT INTO menu_permissions (menu_id, menu_name, menu_path, required_role, parent_menu_id, sort_order, icon_name) VALUES
  ('shop-pending-review', '待审核店铺', '/admin/shops/pending', 'shop_reviewer', NULL, 5, 'ClipboardList'),
  ('shop-reviewed', '已审核店铺', '/admin/shops/list', 'shop_reviewer', NULL, 6, 'CheckCircle')
ON CONFLICT (menu_id, required_role) DO NOTHING;

-- ====================================================================
-- 第六部分：添加 API 路由权限映射
-- ====================================================================

-- 创建 API 路由权限映射表（如果不存在）
CREATE TABLE IF NOT EXISTS api_route_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_pattern VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  required_role VARCHAR(50) NOT NULL, -- 改用 VARCHAR 而不是 user_role 枚举，避免事务问题
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_pattern, method, required_role)
);

-- 启用 RLS
ALTER TABLE api_route_permissions ENABLE ROW LEVEL SECURITY;

-- 所有人可查看 API 路由权限
CREATE POLICY "所有人可查看 API 路由权限" ON api_route_permissions
FOR SELECT USING (true);

-- 仅管理员可管理 API 路由权限
CREATE POLICY "管理员可管理 API 路由权限" ON api_route_permissions
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 插入智能体商店管理 API 权限
INSERT INTO api_route_permissions (route_pattern, method, required_role, description) VALUES
  ('/api/admin/agent-store/*', 'GET', 'admin', '智能体商店管理 API - 读取'),
  ('/api/admin/agent-store/*', 'POST', 'admin', '智能体商店管理 API - 写入'),
  ('/api/admin/agent-store/*', 'PUT', 'admin', '智能体商店管理 API - 更新'),
  ('/api/admin/agent-store/*', 'DELETE', 'admin', '智能体商店管理 API - 删除'),
  ('/api/admin/agent-store/*', 'GET', 'marketplace_admin', '智能体商店管理 API - 读取'),
  ('/api/admin/agent-store/*', 'POST', 'marketplace_admin', '智能体商店管理 API - 写入'),
  ('/api/admin/agent-store/*', 'PUT', 'marketplace_admin', '智能体商店管理 API - 更新')
ON CONFLICT (route_pattern, method, required_role) DO NOTHING;

-- 插入 Skill 商店管理 API 权限
INSERT INTO api_route_permissions (route_pattern, method, required_role, description) VALUES
  ('/api/admin/skill-store/*', 'GET', 'admin', 'Skill 商店管理 API - 读取'),
  ('/api/admin/skill-store/*', 'POST', 'admin', 'Skill 商店管理 API - 写入'),
  ('/api/admin/skill-store/*', 'PUT', 'admin', 'Skill 商店管理 API - 更新'),
  ('/api/admin/skill-store/*', 'DELETE', 'admin', 'Skill 商店管理 API - 删除'),
  ('/api/admin/skill-store/*', 'GET', 'marketplace_admin', 'Skill 商店管理 API - 读取'),
  ('/api/admin/skill-store/*', 'POST', 'marketplace_admin', 'Skill 商店管理 API - 写入'),
  ('/api/admin/skill-store/*', 'PUT', 'marketplace_admin', 'Skill 商店管理 API - 更新')
ON CONFLICT (route_pattern, method, required_role) DO NOTHING;

-- 插入市场运营管理 API 权限
INSERT INTO api_route_permissions (route_pattern, method, required_role, description) VALUES
  ('/api/admin/marketplace/*', 'GET', 'admin', '市场运营管理 API - 读取'),
  ('/api/admin/marketplace/*', 'POST', 'admin', '市场运营管理 API - 写入'),
  ('/api/admin/marketplace/*', 'GET', 'marketplace_admin', '市场运营管理 API - 读取'),
  ('/api/admin/marketplace/*', 'POST', 'marketplace_admin', '市场运营管理 API - 写入'),
  ('/api/admin/marketplace/*', 'GET', 'finance_manager', '市场运营管理 API - 读取')
ON CONFLICT (route_pattern, method, required_role) DO NOTHING;

-- 插入开发者管理 API 权限
INSERT INTO api_route_permissions (route_pattern, method, required_role, description) VALUES
  ('/api/admin/developers/*', 'GET', 'admin', '开发者管理 API - 读取'),
  ('/api/admin/developers/*', 'POST', 'admin', '开发者管理 API - 写入'),
  ('/api/admin/developers/*', 'PUT', 'admin', '开发者管理 API - 更新'),
  ('/api/admin/developers/*', 'GET', 'marketplace_admin', '开发者管理 API - 读取'),
  ('/api/admin/developers/*', 'POST', 'marketplace_admin', '开发者管理 API - 写入')
ON CONFLICT (route_pattern, method, required_role) DO NOTHING;

-- 插入店铺审核 API 权限
INSERT INTO api_route_permissions (route_pattern, method, required_role, description) VALUES
  ('/api/admin/shops/*', 'GET', 'admin', '店铺管理 API - 读取'),
  ('/api/admin/shops/*', 'POST', 'admin', '店铺管理 API - 写入'),
  ('/api/admin/shops/*', 'PUT', 'admin', '店铺管理 API - 更新'),
  ('/api/admin/shops/*', 'GET', 'shop_reviewer', '店铺管理 API - 读取'),
  ('/api/admin/shops/*', 'PUT', 'shop_reviewer', '店铺管理 API - 更新')
ON CONFLICT (route_pattern, method, required_role) DO NOTHING;

-- ====================================================================
-- 第七部分：注释说明
-- ====================================================================

COMMENT ON TABLE menu_permissions IS '菜单权限配置表，用于控制不同角色可见的菜单项';
COMMENT ON TABLE api_route_permissions IS 'API 路由权限配置表，用于控制不同角色可访问的 API 端点';
COMMENT ON COLUMN menu_permissions.required_role IS '允许访问该菜单的角色';
COMMENT ON COLUMN api_route_permissions.required_role IS '允许访问该 API 的角色';

-- ====================================================================
-- 完成提示
-- ====================================================================

-- 权限配置完成！
-- 新增角色：marketplace_admin, shop_reviewer, agent_operator
-- 请确保在应用代码中正确实现基于角色的访问控制
