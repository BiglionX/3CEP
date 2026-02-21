-- 增强用户档案表结构
-- 创建时间: 2026-02-14
-- 版本: 1.1.0

-- 确保用户角色枚举类型存在
create type if not exists user_role as enum ('admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer');

-- 检查并创建user_profiles_ext表（如果不存在）
create table if not exists user_profiles_ext (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email varchar(255),
  role user_role default 'viewer',
  sub_roles text[], -- 支持多个子角色，如['shop_owner']
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 添加缺失的字段到user_profiles_ext表
alter table user_profiles_ext 
add column if not exists role user_role default 'viewer',
add column if not exists sub_roles text[], -- 支持多个子角色
add column if not exists is_active boolean default true,
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_at timestamp with time zone default now();

-- 确保已有数据的角色字段有默认值
update user_profiles_ext 
set role = 'viewer' 
where role is null;

update user_profiles_ext 
set is_active = true 
where is_active is null;

-- 添加约束
alter table user_profiles_ext 
alter column role set not null,
alter column is_active set not null;

-- 创建索引以提高查询性能
create index if not exists idx_user_profiles_user_id on user_profiles_ext(user_id);
create index if not exists idx_user_profiles_email on user_profiles_ext(email);
create index if not exists idx_user_profiles_role on user_profiles_ext(role);

-- 添加表注释
comment on table user_profiles_ext is '用户档案扩展表';
comment on column user_profiles_ext.role is '用户角色：admin(超级管理员)/content_reviewer(内容审核员)/shop_reviewer(店铺审核员)/finance(财务)/viewer(查看者)';
comment on column user_profiles_ext.sub_roles is '用户子角色数组，如["shop_owner"]';
comment on column user_profiles_ext.is_active is '账户是否激活';
comment on column user_profiles_ext.created_by is '创建者用户ID';

-- 更新RLS策略
alter table user_profiles_ext enable row level security;

-- 用户只能查看自己的档案
drop policy if exists "用户可查看自己的档案" on user_profiles_ext;
create policy "用户可查看自己的档案"
  on user_profiles_ext for select
  using (user_id = auth.uid());

-- 管理员可以管理所有用户档案
drop policy if exists "管理员可管理所有用户档案" on user_profiles_ext;
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