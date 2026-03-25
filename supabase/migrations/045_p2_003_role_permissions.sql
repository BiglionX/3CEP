-- =====================================================
-- P2-003 权限细化 - 角色权限管理表
-- =====================================================
-- 用途：支持细粒度的角色权限配置
-- 执行方式：在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 权限定义表
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_admin_permissions_module ON admin_permissions(module);
CREATE INDEX idx_admin_permissions_name ON admin_permissions(name);

-- 插入基础权限数据
INSERT INTO admin_permissions (name, module, description) VALUES
-- 技能管理模块
('skill_create', 'skill_management', '创建新 Skill'),
('skill_edit', 'skill_management', '编辑现有 Skill'),
('skill_delete', 'skill_management', '删除 Skill'),
('skill_view', 'skill_management', '查看 Skill 详情'),
('skill_publish', 'skill_management', '发布/下架 Skill'),
('skill_review', 'skill_management', '审核 Skill'),
('skill_batch_review', 'skill_management', '批量审核 Skills'),
('skill_export', 'skill_management', '导出 Skills 数据'),
('skill_import', 'skill_management', '导入 Skills 数据'),

-- 用户管理模块
('user_view', 'user_management', '查看用户列表'),
('user_detail', 'user_management', '查看用户详情'),
('user_edit', 'user_management', '编辑用户信息'),
('user_delete', 'user_management', '删除用户'),
('user_ban', 'user_management', '禁用/启用用户'),
('user_role_manage', 'user_management', '分配用户角色'),

-- 系统设置模块
('role_view', 'system_settings', '查看角色列表'),
('role_create', 'system_settings', '创建新角色'),
('role_edit', 'system_settings', '编辑角色权限'),
('role_delete', 'system_settings', '删除角色'),
('permission_manage', 'system_settings', '管理权限定义'),
('system_config', 'system_settings', '修改系统配置'),

-- 数据分析模块
('analytics_view', 'analytics', '查看数据分析'),
('analytics_export', 'analytics', '导出数据报表'),
('analytics_realtime', 'analytics', '查看实时监控'),

-- 内容管理模块
('content_create', 'content_management', '创建内容'),
('content_edit', 'content_management', '编辑内容'),
('content_delete', 'content_management', '删除内容'),
('content_publish', 'content_management', '发布内容')
ON CONFLICT (name) DO NOTHING;

-- 2. 角色表 (如果不存在)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_admin_roles_name ON admin_roles(name);
CREATE INDEX idx_admin_roles_system ON admin_roles(is_system);

-- 插入基础角色数据
INSERT INTO admin_roles (name, description, is_system) VALUES
('超级管理员', '拥有所有权限的系统管理员', TRUE),
('运营管理员', '负责日常运营和内容管理', FALSE),
('审核管理员', '负责技能和用户审核', FALSE),
('数据分析师', '负责数据分析和报表', FALSE)
ON CONFLICT (name) DO NOTHING;

-- 3. 角色权限关联表
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 创建索引
CREATE INDEX idx_admin_role_permissions_role ON admin_role_permissions(role_id);
CREATE INDEX idx_admin_role_permissions_permission ON admin_role_permissions(permission_id);

-- 为超级管理员分配所有权限
DO $$
DECLARE
  super_admin_id UUID;
BEGIN
  SELECT id INTO super_admin_id FROM admin_roles WHERE name = '超级管理员';

  IF super_admin_id IS NOT NULL THEN
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT super_admin_id, id
    FROM admin_permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END $$;

-- 4. 审计日志表
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_admin_audit_logs_user ON admin_audit_logs(user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- 5. 存储过程：更新角色权限
CREATE OR REPLACE FUNCTION update_role_permissions(
  p_role_id UUID,
  p_permission_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  -- 删除旧的权限关联
  DELETE FROM admin_role_permissions
  WHERE role_id = p_role_id;

  -- 插入新的权限关联
  IF array_length(p_permission_ids, 1) > 0 THEN
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT p_role_id, unnest(p_permission_ids)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为相关表添加触发器
DROP TRIGGER IF EXISTS update_admin_permissions_updated_at ON admin_permissions;
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 策略 (行级安全)
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 允许认证用户查看权限定义
CREATE POLICY "允许认证用户查看权限" ON admin_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- 只允许管理员操作角色和权限
CREATE POLICY "仅管理员可修改角色" ON admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 8. 注释说明
COMMENT ON TABLE admin_permissions IS '权限定义表';
COMMENT ON TABLE admin_roles IS '角色表';
COMMENT ON TABLE admin_role_permissions IS '角色权限关联表';
COMMENT ON TABLE admin_audit_logs IS '操作审计日志表';

COMMENT ON FUNCTION update_role_permissions IS '更新角色权限的存储过程';
COMMENT ON FUNCTION update_updated_at_column IS '自动更新 updated_at 字段的触发器函数';

-- =====================================================
-- 完成检查清单
-- =====================================================
-- ✅ admin_permissions 表已创建
-- ✅ admin_roles 表已创建
-- ✅ admin_role_permissions 表已创建
-- ✅ admin_audit_logs 表已创建
-- ✅ 基础权限数据已插入
-- ✅ 基础角色数据已插入
-- ✅ 存储过程已创建
-- ✅ 触发器已创建
-- ✅ RLS 策略已配置
-- =====================================================
