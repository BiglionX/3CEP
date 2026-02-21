-- 增强版行级安全策略 (Enhanced RLS Policies)
-- 支持多租户隔离和精细化权限控制
-- 创建时间: 2026-02-21

-- ====================================================================
-- 第一部分：租户隔离基础设施
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

-- 为租户相关表启用RLS
alter table tenants enable row level security;
alter table user_tenants enable row level security;

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
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- 用户租户关联表策略
create policy "用户可以查看自己的租户关联"
  on user_tenants for select
  using (user_id = auth.uid());

create policy "系统管理员可以管理用户租户关联"
  on user_tenants for all
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- ====================================================================
-- 第二部分：现有表的租户隔离增强
-- ====================================================================

-- 为现有表添加租户字段（如果不存在）
do $$ 
begin
  -- 为用户相关表添加租户字段
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'tenant_id') then
    alter table profiles add column tenant_id uuid references tenants(id);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'uploaded_content' and column_name = 'tenant_id') then
    alter table uploaded_content add column tenant_id uuid references tenants(id);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'appointments' and column_name = 'tenant_id') then
    alter table appointments add column tenant_id uuid references tenants(id);
  end if;
  
  -- 为业务表添加租户字段
  if not exists (select 1 from information_schema.columns where table_name = 'parts' and column_name = 'tenant_id') then
    alter table parts add column tenant_id uuid references tenants(id);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'part_prices' and column_name = 'tenant_id') then
    alter table part_prices add column tenant_id uuid references tenants(id);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'system_config' and column_name = 'tenant_id') then
    alter table system_config add column tenant_id uuid references tenants(id);
  end if;
end $$;

-- ====================================================================
-- 第三部分：精细化RLS策略
-- ====================================================================

-- 配件表增强策略
drop policy if exists "允许所有人查看配件" on parts;
drop policy if exists "认证用户可插入配件" on parts;
drop policy if exists "认证用户可更新配件" on parts;
drop policy if exists "仅管理员可删除配件" on parts;

-- 用户可以查看公共配件或自己租户的配件
create policy "用户可查看公共和本租户配件"
  on parts for select
  using (
    tenant_id is null  -- 公共配件
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = parts.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- 用户可以在自己的租户内创建配件
create policy "用户可在本租户创建配件"
  on parts for insert
  with check (
    (tenant_id is null and auth.role() = 'authenticated')  -- 公共配件
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = parts.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
  );

-- 用户可以更新自己租户的配件
create policy "用户可更新本租户配件"
  on parts for update
  using (
    tenant_id is null
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = parts.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- 只有管理员或租户管理员可以删除配件
create policy "管理员可删除配件"
  on parts for delete
  using (
    exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = parts.tenant_id
      and ut.user_id = auth.uid()
      and ut.role in ('admin', 'manager')
      and ut.is_active = true
    )
  );

-- 配件价格表增强策略
drop policy if exists "允许所有人查看价格" on part_prices;
drop policy if exists "认证用户可插入价格" on part_prices;
drop policy if exists "认证用户可更新价格" on part_prices;

create policy "用户可查看相关配件价格"
  on part_prices for select
  using (
    exists (
      select 1 from parts p
      where p.id = part_prices.part_id
      and (
        p.tenant_id is null
        or exists (
          select 1 from user_tenants ut
          where ut.tenant_id = p.tenant_id
          and ut.user_id = auth.uid()
          and ut.is_active = true
        )
      )
    )
  );

create policy "用户可管理相关配件价格"
  on part_prices for all
  using (
    exists (
      select 1 from parts p
      where p.id = part_prices.part_id
      and (
        p.tenant_id is null
        or exists (
          select 1 from user_tenants ut
          where ut.tenant_id = p.tenant_id
          and ut.user_id = auth.uid()
          and ut.is_active = true
        )
      )
    )
  );

-- 上传内容表增强策略
drop policy if exists "允许查看公开上传内容" on uploaded_content;
drop policy if exists "用户可查看自己的内容" on uploaded_content;
drop policy if exists "用户可上传内容" on uploaded_content;
drop policy if exists "用户可更新自己的内容" on uploaded_content;
drop policy if exists "用户可删除自己的内容" on uploaded_content;

create policy "用户可查看相关内容"
  on uploaded_content for select
  using (
    user_id = auth.uid()  -- 自己的内容
    or user_id is null    -- 公开内容
    or tenant_id is null  -- 公共内容
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = uploaded_content.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

create policy "用户可管理相关内容"
  on uploaded_content for all
  using (
    user_id = auth.uid()
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = uploaded_content.tenant_id
      and ut.user_id = auth.uid()
      and ut.role in ('admin', 'manager', 'content_manager')
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- 预约表增强策略
drop policy if exists "用户可查看自己的预约" on appointments;
drop policy if exists "用户可创建预约" on appointments;
drop policy if exists "用户可更新自己的预约" on appointments;
drop policy if exists "用户可删除自己的预约" on appointments;

create policy "用户可管理预约"
  on appointments for all
  using (
    user_id = auth.uid()
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = appointments.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- 系统配置表增强策略
drop policy if exists "仅管理员可访问系统配置" on system_config;

create policy "管理员可访问系统配置"
  on system_config for all
  using (
    (tenant_id is null and auth.jwt() ->> 'role' = 'admin')
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = system_config.tenant_id
      and ut.user_id = auth.uid()
      and ut.role = 'admin'
      and ut.is_active = true
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
    )
  );

-- ====================================================================
-- 第四部分：租户隔离视图
-- ====================================================================

-- 创建租户安全视图
create or replace view tenant_safe_parts as
  select 
    p.*,
    t.name as tenant_name,
    t.code as tenant_code
  from parts p
  left join tenants t on p.tenant_id = t.id
  where 
    p.tenant_id is null  -- 公共配件
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = p.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    );

-- 创建用户安全视图
create or replace view user_safe_content as
  select 
    uc.*,
    p.username as uploader_name,
    t.name as tenant_name
  from uploaded_content uc
  left join profiles p on uc.user_id = p.id
  left join tenants t on uc.tenant_id = t.id
  where 
    uc.user_id = auth.uid()  -- 自己的内容
    or uc.user_id is null     -- 公开内容
    or uc.tenant_id is null   -- 公共内容
    or exists (
      select 1 from user_tenants ut
      where ut.tenant_id = uc.tenant_id
      and ut.user_id = auth.uid()
      and ut.is_active = true
    );

-- 授权视图访问权限
grant select on tenant_safe_parts to authenticated;
grant select on user_safe_content to authenticated;

-- ====================================================================
-- 第五部分：权限检查函数
-- ====================================================================

-- 创建权限检查函数
create or replace function check_user_permission(
  user_id uuid,
  permission_name text,
  tenant_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  user_role text;
  has_permission boolean := false;
begin
  -- 获取用户角色
  select raw_user_meta_data->>'role' into user_role
  from auth.users
  where id = user_id;
  
  -- 超级管理员拥有所有权限
  if user_role = 'admin' or user_id::text ilike '%admin%' then
    return true;
  end if;
  
  -- 检查租户管理员权限
  if tenant_id is not null then
    select exists(
      select 1 from user_tenants ut
      where ut.user_id = user_id
      and ut.tenant_id = tenant_id
      and ut.role in ('admin', 'manager')
      and ut.is_active = true
    ) into has_permission;
    
    if has_permission then
      return true;
    end if;
  end if;
  
  -- 这里可以根据具体权限配置进行检查
  -- 简化实现：根据角色返回权限
  case permission_name
    when 'content_read' then
      return user_role in ('content_manager', 'manager');
    when 'content_create' then
      return user_role in ('content_manager', 'manager');
    when 'content_update' then
      return user_role in ('content_manager', 'manager');
    when 'content_delete' then
      return user_role = 'manager';
    when 'shops_read' then
      return user_role in ('shop_manager', 'manager');
    when 'shops_approve' then
      return user_role in ('shop_manager', 'manager');
    when 'payments_read' then
      return user_role in ('finance_manager', 'manager');
    when 'payments_refund' then
      return user_role in ('finance_manager', 'manager');
    else
      return false;
  end case;
end;
$$;

-- 创建租户访问检查函数
create or replace function check_tenant_access(
  user_id uuid,
  target_tenant_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  -- 超级管理员可以访问所有租户
  if exists (
    select 1 from auth.users u
    where u.id = user_id
    and (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
  ) then
    return true;
  end if;
  
  -- 检查用户是否属于该租户
  return exists (
    select 1 from user_tenants ut
    where ut.user_id = user_id
    and ut.tenant_id = target_tenant_id
    and ut.is_active = true
  );
end;
$$;

-- ====================================================================
-- 第六部分：索引优化
-- ====================================================================

-- 为安全查询创建索引
create index if not exists idx_parts_tenant_id on parts(tenant_id);
create index if not exists idx_uploaded_content_tenant_id on uploaded_content(tenant_id);
create index if not exists idx_appointments_tenant_id on appointments(tenant_id);
create index if not exists idx_user_tenants_user_id on user_tenants(user_id);
create index if not exists idx_user_tenants_tenant_id on user_tenants(tenant_id);
create index if not exists idx_tenants_code on tenants(code);

-- ====================================================================
-- 第七部分：初始数据填充
-- ====================================================================

-- 插入默认租户
insert into tenants (name, code, description)
values 
  ('主租户', 'MAIN', '系统默认主租户'),
  ('演示租户', 'DEMO', '演示和测试专用租户')
on conflict (code) do nothing;

-- 为现有管理员用户关联默认租户
insert into user_tenants (user_id, tenant_id, role, is_primary, is_active)
select 
  u.id,
  (select id from tenants where code = 'MAIN'),
  'admin',
  true,
  true
from auth.users u
where (u.raw_user_meta_data->>'role' = 'admin' or u.email ilike '%admin%')
on conflict (user_id, tenant_id) do nothing;

-- 更新现有数据的租户字段
update parts set tenant_id = (select id from tenants where code = 'MAIN') where tenant_id is null;
update uploaded_content set tenant_id = (select id from tenants where code = 'MAIN') where tenant_id is null;
update appointments set tenant_id = (select id from tenants where code = 'MAIN') where tenant_id is null;

-- ====================================================================
-- 完成提示
-- ====================================================================

/*
✅ 增强版RLS策略部署完成！

主要特性：
1. 多租户隔离支持
2. 精细化权限控制
3. 安全视图和函数
4. 管理员特权保留
5. 性能优化索引

使用说明：
- 系统会自动为管理员用户关联主租户
- 新用户需要手动分配租户
- 通过安全视图查询数据更加安全
- 权限函数可用于复杂权限检查

验证查询：
select * from tenant_safe_parts;  -- 查看可访问的配件
select * from user_safe_content;  -- 查看可访问的内容
select check_user_permission(auth.uid(), 'content_read');  -- 检查权限
*/