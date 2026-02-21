-- 管理后台权限系统数据库迁移
-- 创建时间: 2026-02-14
-- 版本: 1.0.0

-- 添加用户角色枚举类型
create type user_role as enum ('admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer');

-- 检查并创建user_profiles_ext表（如果不存在）
create table if not exists user_profiles_ext (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email varchar(255),
  role user_role default 'viewer',
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 扩展用户档案表（添加缺失的字段）
alter table user_profiles_ext 
add column if not exists role user_role default 'viewer',
add column if not exists is_active boolean default true,
add column if not exists created_by uuid references auth.users(id),
add column if not exists created_at timestamp with time zone default now();

-- 创建管理员用户表（独立于普通用户）
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email varchar(255) not null unique,
  role user_role not null default 'viewer',
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建权限表
create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  role user_role not null,
  resource varchar(100) not null, -- 如 'users', 'content', 'shops'
  action varchar(50) not null,   -- 如 'read', 'write', 'delete'
  description text,
  created_at timestamp with time zone default now(),
  unique(role, resource, action)
);

-- 插入默认权限配置
insert into permissions (role, resource, action, description) values
  ('admin', 'all', 'manage', '完全管理权限'),
  ('content_reviewer', 'content', 'read', '查看内容'),
  ('content_reviewer', 'content', 'update', '审核内容'),
  ('shop_reviewer', 'shops', 'read', '查看店铺信息'),
  ('shop_reviewer', 'shops', 'update', '审核店铺'),
  ('finance', 'orders', 'read', '查看订单'),
  ('finance', 'payments', 'read', '查看支付记录'),
  ('viewer', 'dashboard', 'read', '查看仪表板')
on conflict (role, resource, action) do nothing;

-- 创建视图：用户权限视图
create or replace view user_permissions_view as
select 
  au.id as admin_user_id,
  au.user_id,
  au.email,
  au.role,
  au.is_active,
  p.resource,
  p.action,
  p.description
from admin_users au
join permissions p on au.role = p.role
where au.is_active = true;

-- 创建索引以提高查询性能
create index if not exists idx_admin_users_user_id on admin_users(user_id);
create index if not exists idx_admin_users_email on admin_users(email);
create index if not exists idx_admin_users_role on admin_users(role);
create index if not exists idx_permissions_role on permissions(role);
create index if not exists idx_permissions_resource on permissions(resource);

-- 添加表注释
comment on table admin_users is '管理员用户表';
comment on table permissions is '权限配置表';
comment on table user_profiles_ext is '用户档案扩展表';

comment on column admin_users.role is '用户角色：admin(超级管理员)/content_reviewer(内容审核员)/shop_reviewer(店铺审核员)/finance(财务)/viewer(查看者)';
comment on column permissions.resource is '资源类型：users/content/shops/orders/payments/dashboard等';
comment on column permissions.action is '操作类型：read/write/update/delete/manage等';

-- RLS策略设置
alter table admin_users enable row level security;
alter table permissions enable row level security;
alter table user_profiles_ext enable row level security;

-- 管理员用户表RLS策略
create policy "管理员可查看所有管理员用户"
  on admin_users for select
  using (
    exists (
      select 1 from admin_users au 
      where au.user_id = auth.uid() 
      and au.role = 'admin' 
      and au.is_active = true
    )
  );

create policy "只有超级管理员可修改管理员用户"
  on admin_users for all
  using (
    exists (
      select 1 from admin_users au 
      where au.user_id = auth.uid() 
      and au.role = 'admin' 
      and au.is_active = true
    )
  );

-- 权限表RLS策略
create policy "认证用户可查看自己的权限"
  on permissions for select
  using (
    exists (
      select 1 from admin_users au 
      where au.user_id = auth.uid() 
      and au.is_active = true
    )
  );

-- 用户档案表RLS策略
create policy "用户可查看自己的档案"
  on user_profiles_ext for select
  using (user_id = auth.uid());

create policy "管理员可管理所有用户档案"
  on user_profiles_ext for all
  using (
    exists (
      select 1 from admin_users au 
      where au.user_id = auth.uid() 
      and au.role = 'admin' 
      and au.is_active = true
    )
  );