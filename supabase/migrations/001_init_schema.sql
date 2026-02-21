-- 初始化数据库表结构
-- 创建时间: 2026-02-14
-- 版本: 1.0.0

-- 启用必要的扩展
create extension if not exists "uuid-ossp";

-- 配件信息表
create table if not exists parts (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  category varchar(100) not null,
  brand varchar(100),
  model varchar(100),
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 平台价格信息表
create table if not exists part_prices (
  id uuid primary key default uuid_generate_v4(),
  part_id uuid references parts(id) on delete cascade,
  platform varchar(50) not null,
  price decimal(10,2) not null,
  url text,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 用户上传内容表
create table if not exists uploaded_content (
  id uuid primary key default uuid_generate_v4(),
  url text not null unique,
  title varchar(255),
  description text,
  content_type varchar(50),
  user_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 预约时间表
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status varchar(20) default 'pending',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 系统配置表
create table if not exists system_config (
  id uuid primary key default uuid_generate_v4(),
  key varchar(100) unique not null,
  value jsonb,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建索引以提高查询性能
create index if not exists idx_parts_category on parts(category);
create index if not exists idx_parts_brand on parts(brand);
create index if not exists idx_part_prices_part_id on part_prices(part_id);
create index if not exists idx_part_prices_platform on part_prices(platform);
create index if not exists idx_uploaded_content_user_id on uploaded_content(user_id);
create index if not exists idx_appointments_user_id on appointments(user_id);
create index if not exists idx_appointments_time on appointments(start_time, end_time);
create index if not exists idx_system_config_key on system_config(key);

-- 插入初始系统配置
insert into system_config (key, value, description) values
  ('app_version', '"1.0.0"', '应用版本号'),
  ('maintenance_mode', 'false', '维护模式开关'),
  ('price_refresh_interval', '3600', '价格刷新间隔（秒）')
on conflict (key) do nothing;

-- 添加表注释
comment on table parts is '配件基本信息表';
comment on table part_prices is '配件各平台价格信息表';
comment on table uploaded_content is '用户上传的内容URL';
comment on table appointments is '预约时间表';
comment on table system_config is '系统配置表';

comment on column parts.id is '配件唯一标识符';
comment on column parts.name is '配件名称';
comment on column parts.category is '配件分类';
comment on column part_prices.price is '价格（元）';
comment on column appointments.status is '预约状态：pending/confimed/cancelled/completed';