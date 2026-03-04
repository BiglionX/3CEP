-- 管理后台优化测试数据库初始化脚本

-- 创建测试数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS prodcycleai_test;

-- 连接到测试数据库
\c prodcycleai_test;

-- 创建测试用户表
CREATE TABLE IF NOT EXISTS test_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建测试权限配置表
CREATE TABLE IF NOT EXISTS test_permission_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建测试审计日志表
CREATE TABLE IF NOT EXISTS test_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入测试用户数据
INSERT INTO test_users (email, password_hash, role) VALUES
  ('admin@test.com', '$2a$10$example_hash_admin', 'admin'),
  ('manager@test.com', '$2a$10$example_hash_manager', 'manager'),
  ('content@test.com', '$2a$10$example_hash_content', 'content_manager'),
  ('shop@test.com', '$2a$10$example_hash_shop', 'shop_manager'),
  ('viewer@test.com', '$2a$10$example_hash_viewer', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- 插入测试权限配置
INSERT INTO test_permission_configs (config_key, config_value, description) VALUES
  ('rbac_config', '{
    "roles": {
      "admin": {
        "name": "超级管理员",
        "description": "系统最高权限角色",
        "level": 100,
        "permissions": ["*"]
      },
      "manager": {
        "name": "管理员",
        "description": "业务管理员",
        "level": 80,
        "permissions": ["dashboard_read", "users_read", "content_read"]
      },
      "viewer": {
        "name": "只读查看员",
        "description": "仅查看权限",
        "level": 30,
        "permissions": ["dashboard_read"]
      }
    },
    "permissions": {
      "dashboard_read": {
        "name": "仪表板查看",
        "description": "查看系统仪表板",
        "category": "dashboard",
        "resource": "dashboard",
        "action": "read"
      },
      "users_read": {
        "name": "用户查看",
        "description": "查看用户信息",
        "category": "user_management",
        "resource": "users",
        "action": "read"
      },
      "content_read": {
        "name": "内容查看",
        "description": "查看内容信息",
        "category": "content_management",
        "resource": "content",
        "action": "read"
      }
    }
  }', 'RBAC权限配置测试数据'),

  ('tenant_config', '{
    "enabled": true,
    "mode": "strict",
    "default_tenant_field": "tenant_id",
    "resources_with_tenant": ["users", "content", "shops"]
  }', '租户隔离配置测试数据')
ON CONFLICT (config_key) DO NOTHING;

-- 创建测试视图
CREATE OR REPLACE VIEW test_user_permissions AS
SELECT
  u.id as user_id,
  u.email,
  u.role,
  pc.config_value->'roles'->u.role->'permissions' as role_permissions,
  pc.config_value->'permissions' as all_permissions
FROM test_users u
CROSS JOIN test_permission_configs pc
WHERE pc.config_key = 'rbac_config';

-- 创建测试函数
CREATE OR REPLACE FUNCTION test_has_permission(user_role TEXT, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_perms JSONB;
  all_perms JSONB;
BEGIN
  SELECT config_value->'roles'->user_role->'permissions',
         config_value->'permissions'
  INTO role_perms, all_perms
  FROM test_permission_configs
  WHERE config_key = 'rbac_config';

  -- 超级管理员拥有所有权限
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- 检查角色是否拥有该权限
  RETURN role_perms ? permission_key;
END;
$$ LANGUAGE plpgsql;

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_test_users_email ON test_users(email);
CREATE INDEX IF NOT EXISTS idx_test_users_role ON test_users(role);
CREATE INDEX IF NOT EXISTS idx_test_audit_logs_created_at ON test_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_test_audit_logs_user_id ON test_audit_logs(user_id);

-- 插入测试审计日志数据
INSERT INTO test_audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES
  ((SELECT id FROM test_users WHERE email = 'admin@test.com'), 'LOGIN', 'auth', 'session_1', '{"success": true}', '192.168.1.100'),
  ((SELECT id FROM test_users WHERE email = 'manager@test.com'), 'USER_CREATE', 'users', 'user_new_1', '{"username": "newuser"}', '192.168.1.101'),
  ((SELECT id FROM test_users WHERE email = 'content@test.com'), 'CONTENT_PUBLISH', 'content', 'article_1', '{"title": "测试文章"}', '192.168.1.102')
ON CONFLICT DO NOTHING;

-- 验证数据插入
SELECT '测试用户数量: ' || COUNT(*) as user_count FROM test_users;
SELECT '测试配置数量: ' || COUNT(*) as config_count FROM test_permission_configs;
SELECT '测试审计日志数量: ' || COUNT(*) as audit_count FROM test_audit_logs;

-- 显示测试用户信息
SELECT '=== 测试用户信息 ===' as info;
SELECT email, role, is_active FROM test_users ORDER BY role, email;
