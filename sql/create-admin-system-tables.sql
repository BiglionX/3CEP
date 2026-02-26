-- 管理员系统数据库表结构
-- 用于完整的RBAC权限管理

-- 1. 管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户档案扩展表
CREATE TABLE IF NOT EXISTS user_profiles_ext (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 插入默认权限数据
INSERT INTO permissions (role, resource, action, description) VALUES
  ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
  ('content_reviewer', 'content', 'review', '内容审核权限'),
  ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
  ('finance', 'finance', 'manage', '财务管理权限'),
  ('viewer', 'dashboard', 'view', '查看仪表板权限')
ON CONFLICT DO NOTHING;

-- 5. 为现有管理员用户创建记录
-- 注意：这需要在用户登录后执行，或者通过管理界面添加

-- 6. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);

-- 7. RLS策略（行级安全）
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles_ext ENABLE ROW LEVEL SECURITY;

-- 管理员用户表RLS策略
CREATE POLICY "管理员可查看所有管理员用户"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'admin' 
      AND au.is_active = true
    )
  );

CREATE POLICY "只有超级管理员可修改管理员用户"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'admin' 
      AND au.is_active = true
    )
  );

-- 权限表RLS策略
CREATE POLICY "认证用户可查看自己的权限"
  ON permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- 用户档案表RLS策略
CREATE POLICY "用户可查看自己的档案"
  ON user_profiles_ext FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "管理员可管理所有用户档案"
  ON user_profiles_ext FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'admin' 
      AND au.is_active = true
    )
  );

-- 验证表创建
SELECT '管理员系统表创建完成' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'permissions', 'user_profiles_ext');