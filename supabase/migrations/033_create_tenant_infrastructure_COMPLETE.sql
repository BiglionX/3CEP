-- ====================================================================
-- 多租户基础设施完整部署脚本
-- ====================================================================
-- 创建时间：2026-03-23
-- 版本：1.0.0 (修正版)
--
-- 功能说明：
-- 1. 自动检查并创建所有依赖表
-- 2. 创建租户管理相关表
-- 3. 配置 RLS 行级安全策略
-- 4. 创建索引和默认数据
--
-- 使用方法：
-- 在 Supabase Dashboard -> SQL Editor 中复制全部内容并执行
-- ====================================================================

-- ====================================================================
-- 第一部分：检查并创建基础依赖表
-- ====================================================================

-- 1.1 创建用户角色枚举类型（如果不存在）
DO $type_check$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer');
    RAISE NOTICE '创建 user_role 枚举类型...';
  END IF;
END $type_check$;

-- 1.2 创建 user_profiles_ext 表（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles_ext') THEN
    RAISE NOTICE '创建 user_profiles_ext 表...';

    CREATE TABLE user_profiles_ext (
      id uuid primary key default uuid_generate_v4(),
      user_id uuid references auth.users(id) on delete cascade,
      email varchar(255),
      role user_role default 'viewer',
      sub_roles text[],
      is_active boolean default true,
      created_by uuid references auth.users(id),
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles_ext(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles_ext(email);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles_ext(role);

    -- 启用 RLS
    ALTER TABLE user_profiles_ext ENABLE ROW LEVEL SECURITY;
  ELSE
    RAISE NOTICE 'user_profiles_ext 表已存在，跳过...';
  END IF;
END $$;

-- 1.3 创建 admin_users 表（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
    RAISE NOTICE '创建 admin_users 表...';

    CREATE TABLE admin_users (
      id uuid primary key default uuid_generate_v4(),
      user_id uuid references auth.users(id) on delete cascade,
      email varchar(255) not null unique,
      role user_role not null default 'viewer',
      is_active boolean default true,
      created_by uuid references auth.users(id),
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

    -- 启用 RLS
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  ELSE
    RAISE NOTICE 'admin_users 表已存在，跳过...';
  END IF;
END $$;

-- ====================================================================
-- 第二部分：创建租户管理相关表
-- ====================================================================

-- 2.1 创建 tenants 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
    RAISE NOTICE '创建 tenants 表...';

    CREATE TABLE tenants (
      id uuid primary key default gen_random_uuid(),
      name varchar(255) not null unique,
      code varchar(50) not null unique,
      description text,
      is_active boolean default true,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    -- 启用 RLS
    ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
  ELSE
    RAISE NOTICE 'tenants 表已存在，跳过...';
  END IF;
END $$;

-- 2.2 创建 user_tenants 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_tenants') THEN
    RAISE NOTICE '创建 user_tenants 表...';

    CREATE TABLE user_tenants (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade,
      tenant_id uuid references tenants(id) on delete cascade,
      role varchar(50) not null default 'member',
      is_primary boolean default false,
      is_active boolean default true,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now(),
      unique(user_id, tenant_id)
    );

    -- 启用 RLS
    ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
  ELSE
    RAISE NOTICE 'user_tenants 表已存在，跳过...';
  END IF;
END $$;

-- ====================================================================
-- 第三部分：配置 RLS 行级安全策略
-- ====================================================================

-- 3.1 user_profiles_ext 表策略
DO $$
BEGIN
  -- 删除现有策略（如果存在）
  DROP POLICY IF EXISTS "用户可查看自己的档案" ON user_profiles_ext;
  DROP POLICY IF EXISTS "管理员可管理所有用户档案" ON user_profiles_ext;

  -- 创建新策略
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
END $$;

-- 3.2 admin_users 表策略
-- 注意：使用 auth.uid() 直接检查，避免递归查询 admin_users 表
DO $$
BEGIN
  DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
  DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;

  -- 策略说明：
  -- 由于在 admin_users 表上查询时会触发 RLS 策略
  -- 如果策略本身又查询 admin_users 表，会导致无限递归
  -- 因此我们采用简化的策略：允许所有认证用户查看，但只有管理员可修改

  CREATE POLICY "认证用户可查看 admin_users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "仅管理员可修改 admin_users"
    ON admin_users FOR ALL
    USING (
      -- 使用当前会话中的 claims 检查角色，避免查询表
      -- 这需要在用户登录时通过 RPC 或 trigger 设置 custom claims
      COALESCE(
        (current_setting('app.settings.current_user_role', true))::text = 'admin',
        false
      )
    );
END $$;

-- 3.3 tenants 表策略
DO $$
BEGIN
  DROP POLICY IF EXISTS "用户可以查看自己所属租户的信息" ON tenants;
  DROP POLICY IF EXISTS "系统管理员可以管理所有租户" ON tenants;

  CREATE POLICY "用户可以查看自己所属租户的信息"
    ON tenants FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM user_tenants ut
        WHERE ut.tenant_id = tenants.id
        AND ut.user_id = auth.uid()
        AND ut.is_active = true
      )
    );

  CREATE POLICY "系统管理员可以管理所有租户"
    ON tenants FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles_ext upe
        WHERE upe.user_id = auth.uid()
        AND upe.role = 'admin'
      )
    );
END $$;

-- 3.4 user_tenants 表策略
DO $$
BEGIN
  DROP POLICY IF EXISTS "用户可以查看自己的租户关联" ON user_tenants;
  DROP POLICY IF EXISTS "系统管理员可以管理所有租户关联" ON user_tenants;

  CREATE POLICY "用户可以查看自己的租户关联"
    ON user_tenants FOR SELECT
    USING (user_id = auth.uid());

  CREATE POLICY "系统管理员可以管理所有租户关联"
    ON user_tenants FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles_ext upe
        WHERE upe.user_id = auth.uid()
        AND upe.role = 'admin'
      )
    );
END $$;

-- ====================================================================
-- 第四部分：创建性能优化索引
-- ====================================================================

-- 4.1 user_tenants 索引
CREATE INDEX IF NOT EXISTS idx_user_tenants_user_id
  ON user_tenants(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_id
  ON user_tenants(tenant_id, is_active);

-- 4.2 tenants 索引
CREATE INDEX IF NOT EXISTS idx_tenants_code
  ON tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_name
  ON tenants(name);

-- ====================================================================
-- 第五部分：插入默认数据
-- ====================================================================

-- 5.1 插入默认租户
INSERT INTO tenants (id, name, code, description, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', '默认租户', 'default', '系统默认租户', true),
  ('00000000-0000-0000-0000-000000000002', '测试租户', 'test', '测试环境租户', true)
ON CONFLICT (code) DO NOTHING;

-- 5.2 为现有用户分配默认租户（如果有用户的话）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users) AND
     NOT EXISTS (SELECT 1 FROM user_tenants WHERE tenant_id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE NOTICE '为现有用户分配默认租户...';

    INSERT INTO user_tenants (user_id, tenant_id, role, is_primary, is_active)
    SELECT
      id as user_id,
      '00000000-0000-0000-0000-000000000001'::uuid as tenant_id,
      'member' as role,
      true as is_primary,
      true as is_active
    FROM auth.users
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
  END IF;
END $$;

-- ====================================================================
-- 第六部分：验证和总结
-- ====================================================================

-- 显示创建成功的表
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('user_profiles_ext', 'admin_users', 'tenants', 'user_tenants');

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 多租户基础设施部署完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '已创建的表数量：% / 4', v_count;
  RAISE NOTICE '';
  RAISE NOTICE '表清单:';
  RAISE NOTICE '  1. user_profiles_ext - 用户档案扩展表';
  RAISE NOTICE '  2. admin_users - 管理员用户表';
  RAISE NOTICE '  3. tenants - 租户信息表';
  RAISE NOTICE '  4. user_tenants - 用户租户关联表';
  RAISE NOTICE '';
  RAISE NOTICE '默认租户:';
  RAISE NOTICE '  - default (默认租户)';
  RAISE NOTICE '  - test (测试租户)';
  RAISE NOTICE '';
  RAISE NOTICE '下一步操作:';
  RAISE NOTICE '  1. 刷新浏览器重新加载应用';
  RAISE NOTICE '  2. 检查 AuthProvider 是否正常工作';
  RAISE NOTICE '  3. 测试登录和多租户功能';
  RAISE NOTICE '========================================';
END $$;
