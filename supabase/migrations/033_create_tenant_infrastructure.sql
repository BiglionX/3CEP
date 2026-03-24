-- 部署租户隔离基础设施
-- 基于 enhanced_rls_policies.sql 创建
-- 执行时间：2026-03-23
--
-- 依赖说明：
-- 此脚本依赖以下前置表：
-- - auth.users (Supabase 内置)
-- - user_profiles_ext (由 003/004 migration 创建)
-- - admin_users (由 003 migration 创建)
--
-- 如果这些表不存在，请先执行对应的迁移脚本

-- ====================================================================
-- 第一部分：检查依赖表是否存在
-- ====================================================================

-- 检查 user_profiles_ext 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles_ext') THEN
    RAISE NOTICE '创建 user_profiles_ext 表...';

    -- 创建用户角色枚举类型（如果不存在）
    DO $type_check$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer');
      END IF;
    END $type_check$;

    -- 创建 user_profiles_ext 表
    CREATE TABLE IF NOT EXISTS user_profiles_ext (
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

    -- 创建基础 RLS 策略
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
  END IF;
END $$;

-- 检查 admin_users 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
    RAISE NOTICE '创建 admin_users 表...';

    CREATE TABLE IF NOT EXISTS admin_users (
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
    CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

    -- 启用 RLS
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ====================================================================
-- 第二部分：租户隔离基础设施
-- ====================================================================

-- 创建租户信息表
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null unique,
  code varchar(50) not null unique,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建用户租户关联表
create table if not exists user_tenants (
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

-- 为租户相关表启用 RLS
alter table tenants enable row level security;
alter table user_tenants enable row level security;

-- ====================================================================
-- 第二部分：行级安全策略
-- ====================================================================

-- 租户表策略
create policy "用户可以查看自己所属租户的信息"
  on tenants for select
  using (
    exists (
      select 1 from user_tenants ut
      where ut.tenant_id = tenants.id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
  );

create policy "系统管理员可以管理所有租户"
  on tenants for all
  using (
    exists (
      select 1 from user_profiles_ext upe
      where upe.user_id = auth.uid()
      and upe.user_type = 'admin'
    )
  );

-- 用户租户关联表策略
create policy "用户可以查看自己的租户关联"
  on user_tenants for select
  using (user_id = auth.uid());

create policy "系统管理员可以管理所有租户关联"
  on user_tenants for all
  using (
    exists (
      select 1 from user_profiles_ext upe
      where upe.user_id = auth.uid()
      and upe.user_type = 'admin'
    )
  );

-- ====================================================================
-- 第三部分：索引优化
-- ====================================================================

-- 创建索引以提高查询性能
create index if not exists idx_user_tenants_user_id
  on user_tenants(user_id, is_active);

create index if not exists idx_user_tenants_tenant_id
  on user_tenants(tenant_id, is_active);

create index if not exists idx_tenants_code
  on tenants(code);

-- ====================================================================
-- 第四部分：初始数据种子
-- ====================================================================

-- 插入默认租户（如果不存在）
insert into tenants (id, name, code, description, is_active)
values
  ('00000000-0000-0000-0000-000000000001', '默认租户', 'default', '系统默认租户', true),
  ('00000000-0000-0000-0000-000000000002', '测试租户', 'test', '测试环境租户', true)
on conflict (code) do nothing;

-- ====================================================================
-- 说明
-- ====================================================================
-- 此脚本创建了多租户系统的基础设施
-- 1. tenants 表存储租户信息
-- 2. user_tenants 表建立用户与租户的关联
-- 3. 启用了行级安全 (RLS) 确保数据隔离
-- 4. 创建了必要的索引优化查询性能
--
-- 使用方法：
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 或使用 Supabase CLI: supabase db push
