-- Row Level Security (RLS) 策略配置
-- 创建时间: 2026-02-14

-- 为所有表启用RLS
alter table parts enable row level security;
alter table part_prices enable row level security;
alter table uploaded_content enable row level security;
alter table appointments enable row level security;
alter table system_config enable row level security;

-- 配件表策略
-- 所有用户都可以查看配件信息
create policy "允许所有人查看配件"
  on parts for select
  using (true);

-- 只有认证用户可以插入配件
create policy "认证用户可插入配件"
  on parts for insert
  with check (auth.role() = 'authenticated');

-- 只有认证用户可以更新自己的配件
create policy "认证用户可更新配件"
  on parts for update
  using (auth.role() = 'authenticated');

-- 只有管理员可以删除配件
create policy "仅管理员可删除配件"
  on parts for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- 配件价格表策略
-- 所有用户都可以查看价格信息
create policy "允许所有人查看价格"
  on part_prices for select
  using (true);

-- 认证用户可以插入价格信息
create policy "认证用户可插入价格"
  on part_prices for insert
  with check (auth.role() = 'authenticated');

-- 认证用户可以更新价格信息
create policy "认证用户可更新价格"
  on part_prices for update
  using (auth.role() = 'authenticated');

-- 上传内容表策略
-- 所有用户都可以查看公开内容
create policy "允许查看公开上传内容"
  on uploaded_content for select
  using (true);

-- 用户只能查看自己的上传内容或公开内容
create policy "用户可查看自己的内容"
  on uploaded_content for select
  using (
    user_id = auth.uid() 
    or user_id is null 
    or auth.role() = 'authenticated'
  );

-- 用户可以上传内容
create policy "用户可上传内容"
  on uploaded_content for insert
  with check (
    user_id = auth.uid() 
    or (user_id is null and auth.role() = 'authenticated')
  );

-- 用户可以更新自己的内容
create policy "用户可更新自己的内容"
  on uploaded_content for update
  using (user_id = auth.uid());

-- 用户可以删除自己的内容
create policy "用户可删除自己的内容"
  on uploaded_content for delete
  using (user_id = auth.uid());

-- 预约表策略
-- 用户只能查看自己的预约
create policy "用户可查看自己的预约"
  on appointments for select
  using (
    user_id = auth.uid() 
    or auth.role() = 'admin'
  );

-- 用户可以创建预约
create policy "用户可创建预约"
  on appointments for insert
  with check (
    user_id = auth.uid() 
    or (user_id is null and auth.role() = 'authenticated')
  );

-- 用户可以更新自己的预约
create policy "用户可更新自己的预约"
  on appointments for update
  using (
    user_id = auth.uid() 
    or auth.role() = 'admin'
  );

-- 用户可以取消自己的预约
create policy "用户可删除自己的预约"
  on appointments for delete
  using (
    user_id = auth.uid() 
    or auth.role() = 'admin'
  );

-- 系统配置表策略
-- 只有管理员可以查看和修改系统配置
create policy "仅管理员可访问系统配置"
  on system_config for all
  using (auth.jwt() ->> 'role' = 'admin');

-- 创建视图用于安全的数据访问
create or replace view public.parts_with_prices as
  select 
    p.id,
    p.name,
    p.category,
    p.brand,
    p.model,
    p.description,
    p.image_url,
    p.created_at,
    json_agg(
      json_build_object(
        'platform', pp.platform,
        'price', pp.price,
        'url', pp.url,
        'last_updated', pp.last_updated
      )
    ) as prices
  from parts p
  left join part_prices pp on p.id = pp.part_id
  group by p.id, p.name, p.category, p.brand, p.model, p.description, p.image_url, p.created_at;

-- 授权视图访问权限
grant select on public.parts_with_prices to authenticated, anon;