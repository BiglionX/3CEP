-- 为用户档案表添加状态字段以支持封禁功能
-- 创建时间: 2026-02-14
-- 版本: 1.2.0

-- 添加用户状态枚举类型
create type user_status as enum ('active', 'banned', 'suspended');

-- 为user_profiles_ext表添加status字段
alter table user_profiles_ext 
add column if not exists status user_status default 'active',
add column if not exists banned_reason text,
add column if not exists banned_at timestamp with time zone,
add column if not exists unbanned_at timestamp with time zone;

-- 确保已有数据的状态字段有默认值
update user_profiles_ext 
set status = 'active' 
where status is null;

-- 添加约束
alter table user_profiles_ext 
alter column status set not null;

-- 创建索引以提高查询性能
create index if not exists idx_user_profiles_status on user_profiles_ext(status);

-- 添加表注释
comment on column user_profiles_ext.status is '用户状态：active(正常)/banned(封禁)/suspended(暂停)';
comment on column user_profiles_ext.banned_reason is '封禁原因';
comment on column user_profiles_ext.banned_at is '封禁时间';
comment on column user_profiles_ext.unbanned_at is '解封时间';

-- 更新RLS策略以包含状态检查
drop policy if exists "用户可查看自己的档案" on user_profiles_ext;
create policy "用户可查看自己的档案"
  on user_profiles_ext for select
  using (
    user_id = auth.uid() 
    and status != 'banned'
  );

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

-- 创建视图用于用户管理查询
create or replace view user_management_view as
select 
  upe.id,
  upe.user_id,
  upe.email,
  upe.role,
  upe.sub_roles,
  upe.status,
  upe.is_active,
  upe.banned_reason,
  upe.banned_at,
  upe.unbanned_at,
  upe.created_at,
  upe.updated_at,
  au.role as admin_role,
  au.is_active as admin_is_active
from user_profiles_ext upe
left join admin_users au on upe.user_id = au.user_id;

-- 授权视图访问权限给管理员
grant select on user_management_view to authenticated;

\echo '✅ 用户状态字段添加完成'