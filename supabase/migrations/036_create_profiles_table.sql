-- 创建用户资料表 (profiles)
-- 创建时间：2026-03-23
-- 版本：1.0.0
-- 说明：创建基础用户资料表，用于存储用户扩展信息和角色权限

-- ====================================================================
-- 第一部分：创建 profiles 表
-- ====================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),

  -- 角色信息（使用文本类型而不是枚举，避免依赖）
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'marketplace_admin', 'shop_reviewer', 'agent_operator', 'content_manager', 'finance_manager', 'procurement_specialist', 'warehouse_operator', 'content_reviewer', 'viewer', 'external_partner')),

  -- 扩展信息
  company_name VARCHAR(255),
  company_role VARCHAR(100),
  department VARCHAR(100),

  -- 偏好设置
  language VARCHAR(10) DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',

  -- 状态
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- 元数据
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：创建索引
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ====================================================================
-- 第三部分：启用 RLS 并创建策略
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户可查看自己的资料
DROP POLICY IF EXISTS "用户可查看自己的资料" ON profiles;
CREATE POLICY "用户可查看自己的资料" ON profiles
FOR SELECT USING (id = auth.uid());

-- 用户可更新自己的资料
DROP POLICY IF EXISTS "用户可更新自己的资料" ON profiles;
CREATE POLICY "用户可更新自己的资料" ON profiles
FOR UPDATE USING (id = auth.uid());

-- 管理员可查看所有资料
DROP POLICY IF EXISTS "管理员可查看所有资料" ON profiles;
CREATE POLICY "管理员可查看所有资料" ON profiles
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'marketplace_admin')
));

-- 管理员可管理所有资料
DROP POLICY IF EXISTS "管理员可管理所有资料" ON profiles;
CREATE POLICY "管理员可管理所有资料" ON profiles
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- 系统可插入新 profile（用于 trigger）
DROP POLICY IF EXISTS "系统可插入新 profile" ON profiles;
CREATE POLICY "系统可插入新 profile" ON profiles
FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 第四部分：创建触发器
-- ====================================================================

-- 自动更新时间戳
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- 新用户自动创建 profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
CREATE TRIGGER trigger_create_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- ====================================================================
-- 第五部分：创建视图和函数
-- ====================================================================

-- 创建用户角色视图
CREATE OR REPLACE VIEW user_roles_view AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  p.created_at
FROM profiles p;

-- 创建获取用户角色的函数
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id AND is_active = true;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建检查用户权限的函数
CREATE OR REPLACE FUNCTION check_role(required_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid() AND is_active = true;

  -- admin 拥有所有权限
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;

  -- 角色层级检查（简化版）
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 第六部分：插入默认管理员（可选）
-- ====================================================================

-- 注意：实际管理员应该通过 Supabase 控制台或注册流程创建
-- 这里仅作为示例

-- ====================================================================
-- 完成提示
-- ====================================================================

COMMENT ON TABLE profiles IS '用户资料表，存储用户扩展信息和角色权限';
COMMENT ON COLUMN profiles.role IS '用户角色：admin, manager, user, marketplace_admin 等';
COMMENT ON COLUMN profiles.is_active IS '账户是否激活';
COMMENT ON COLUMN profiles.is_verified IS '邮箱是否验证';

-- 迁移完成！
