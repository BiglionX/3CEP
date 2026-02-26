-- 终极解决方案：重建管理员表以彻底解决RLS问题

-- 1. 备份现有数据（如果有）
CREATE TABLE IF NOT EXISTS admin_users_backup AS SELECT * FROM admin_users;
CREATE TABLE IF NOT EXISTS permissions_backup AS SELECT * FROM permissions;

-- 2. 删除现有表和所有相关策略
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

-- 3. 重新创建表结构（不带RLS）
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_permissions_role ON permissions(role);

-- 5. 插入默认权限数据
INSERT INTO permissions (role, resource, action, description) VALUES
  ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
  ('content_reviewer', 'content', 'review', '内容审核权限'),
  ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
  ('finance', 'finance', 'manage', '财务管理权限'),
  ('viewer', 'dashboard', 'view', '查看仪表板权限')
ON CONFLICT DO NOTHING;

-- 6. 恢复备份数据（如果存在）
INSERT INTO admin_users (id, user_id, email, role, is_active, created_by, created_at, updated_at)
SELECT id, user_id, email, role, is_active, created_by, created_at, updated_at 
FROM admin_users_backup 
ON CONFLICT (email) DO UPDATE SET 
  user_id = EXCLUDED.user_id,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 7. 为管理员用户创建记录（如果没有的话）
INSERT INTO admin_users (user_id, email, role, is_active, created_by)
SELECT u.id, u.email, 'admin', true, u.id
FROM auth.users u
WHERE u.email = '1055603323@qq.com'
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  is_active = true;

-- 8. 现在安全地启用RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- 9. 创建安全的RLS策略（避免递归）
CREATE POLICY "用户查看自己的记录" 
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户修改自己的记录" 
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "认证用户查看权限" 
  ON permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- 10. 清理备份表
DROP TABLE IF EXISTS admin_users_backup;
DROP TABLE IF EXISTS permissions_backup;

-- 11. 验证结果
SELECT '表重建和RLS修复完成' as status;
SELECT COUNT(*) as admin_count FROM admin_users;
SELECT COUNT(*) as permission_count FROM permissions;
SELECT * FROM admin_users WHERE email = '1055603323@qq.com';