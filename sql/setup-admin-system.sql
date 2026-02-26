-- 创建管理员用户表
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

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户档案扩展表
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

-- 插入默认权限
INSERT INTO permissions (role, resource, action, description) VALUES
  ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
  ('content_reviewer', 'content', 'review', '内容审核权限'),
  ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
  ('finance', 'finance', 'manage', '财务管理权限'),
  ('viewer', 'dashboard', 'view', '查看仪表板权限')
ON CONFLICT DO NOTHING;

-- 为现有用户创建管理员记录的函数
CREATE OR REPLACE FUNCTION create_admin_user(p_email TEXT, p_password TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  admin_id UUID;
BEGIN
  -- 创建用户
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), NOW())
  RETURNING id INTO user_id;
  
  -- 创建用户档案
  INSERT INTO user_profiles_ext (user_id, email, role, is_active)
  VALUES (user_id, p_email, 'admin', true);
  
  -- 创建管理员记录
  INSERT INTO admin_users (user_id, email, role, is_active, created_by)
  VALUES (user_id, p_email, 'admin', true, user_id)
  RETURNING id INTO admin_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- 验证表创建
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'permissions', 'user_profiles_ext');