-- 创建维修教程表
-- 创建时间: 2026-02-20
-- 版本: 1.0.0

-- 启用必要的扩展
create extension if not exists "uuid-ossp";

-- 维修教程表
create table if not exists repair_tutorials (
  id uuid primary key default uuid_generate_v4(),
  device_model varchar(100) not null,
  fault_type varchar(100) not null,
  title varchar(255) not null,
  description text,
  steps jsonb not null, -- 步骤数组，每个步骤包含description, image_url, estimated_time等
  video_url text,
  tools jsonb, -- 工具清单数组
  parts jsonb, -- 配件清单数组
  cover_image text,
  difficulty_level integer default 1 check (difficulty_level >= 1 and difficulty_level <= 5), -- 1-5难度等级
  estimated_time integer, -- 预估时间(分钟)
  view_count integer default 0,
  like_count integer default 0,
  status varchar(20) default 'draft' check (status in ('draft', 'published', 'archived')), -- 草稿/发布/归档
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建索引以提高查询性能
create index if not exists idx_repair_tutorials_device_model on repair_tutorials(device_model);
create index if not exists idx_repair_tutorials_fault_type on repair_tutorials(fault_type);
create index if not exists idx_repair_tutorials_status on repair_tutorials(status);
create index if not exists idx_repair_tutorials_created_at on repair_tutorials(created_at);
create index if not exists idx_repair_tutorials_created_by on repair_tutorials(created_by);

-- 创建复合索引
create index if not exists idx_repair_tutorials_device_fault on repair_tutorials(device_model, fault_type);
create index if not exists idx_repair_tutorials_status_created on repair_tutorials(status, created_at desc);

-- 添加表注释
comment on table repair_tutorials is '维修教程信息表';
comment on column repair_tutorials.id is '教程唯一标识符';
comment on column repair_tutorials.device_model is '设备型号';
comment on column repair_tutorials.fault_type is '故障类型';
comment on column repair_tutorials.title is '教程标题';
comment on column repair_tutorials.description is '教程描述';
comment on column repair_tutorials.steps is '维修步骤(JSON数组)';
comment on column repair_tutorials.video_url is '视频教程链接';
comment on column repair_tutorials.tools is '所需工具清单(JSON数组)';
comment on column repair_tutorials.parts is '所需配件清单(JSON数组)';
comment on column repair_tutorials.cover_image is '封面图片URL';
comment on column repair_tutorials.difficulty_level is '难度等级(1-5)';
comment on column repair_tutorials.estimated_time is '预估维修时间(分钟)';
comment on column repair_tutorials.view_count is '浏览次数';
comment on column repair_tutorials.like_count is '点赞次数';
comment on column repair_tutorials.status is '教程状态(draft/published/archived)';
comment on column repair_tutorials.created_by is '创建者用户ID';
comment on column repair_tutorials.created_at is '创建时间';
comment on column repair_tutorials.updated_at is '更新时间';

-- 创建更新时间触发器函数
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- 为repair_tutorials表创建更新时间触发器
create trigger update_repair_tutorials_updated_at 
    before update on repair_tutorials 
    for each row 
    execute function update_updated_at_column();

-- 插入示例数据
insert into repair_tutorials (
  device_model, fault_type, title, description, steps, video_url, 
  tools, parts, cover_image, difficulty_level, estimated_time, status
) values 
  (
    'iPhone 14 Pro', 
    'screen_broken', 
    'iPhone 14 Pro 屏幕更换详细教程',
    '从拆机到安装的完整iPhone 14 Pro屏幕更换指南，包含所需工具和注意事项',
    '[
      {
        "id": "step1",
        "title": "准备工作",
        "description": "关闭设备电源，准备好所有必要工具",
        "image_url": "https://example.com/step1.jpg",
        "estimated_time": 5
      },
      {
        "id": "step2", 
        "title": "拆卸屏幕",
        "description": "使用吸盘和撬棒小心分离屏幕组件",
        "image_url": "https://example.com/step2.jpg",
        "estimated_time": 15
      },
      {
        "id": "step3",
        "title": "断开连接",
        "description": "断开屏幕排线连接器",
        "image_url": "https://example.com/step3.jpg",
        "estimated_time": 10
      },
      {
        "id": "step4",
        "title": "安装新屏幕",
        "description": "连接新屏幕排线并测试显示功能",
        "image_url": "https://example.com/step4.jpg",
        "estimated_time": 20
      },
      {
        "id": "step5",
        "title": "最终组装",
        "description": "重新组装设备并进行全面测试",
        "image_url": "https://example.com/step5.jpg",
        "estimated_time": 10
      }
    ]'::jsonb,
    'https://www.youtube.com/watch?v=screen_repair_demo',
    '["螺丝刀套装", "吸盘", "撬棒", "镊子", "热风枪"]'::jsonb,
    '["iPhone 14 Pro原装屏幕", "屏幕胶"]'::jsonb,
    'https://example.com/iphone14pro-screen-cover.jpg',
    4,
    60,
    'published'
  ),
  (
    'Samsung Galaxy S23',
    'battery_issue',
    '三星Galaxy S23 电池更换指南',
    '详细的三星Galaxy S23电池更换步骤，适合有一定动手能力的用户',
    '[
      {
        "id": "step1",
        "title": "关机并准备工具",
        "description": "完全关闭手机电源，准备精密螺丝刀和撬棒",
        "image_url": "https://example.com/s23_step1.jpg",
        "estimated_time": 3
      },
      {
        "id": "step2",
        "title": "拆卸后盖",
        "description": "加热后盖边缘使其软化，然后小心撬开",
        "image_url": "https://example.com/s23_step2.jpg",
        "estimated_time": 12
      },
      {
        "id": "step3",
        "title": "移除旧电池",
        "description": "断开电池连接器，小心取出旧电池",
        "image_url": "https://example.com/s23_step3.jpg",
        "estimated_time": 8
      },
      {
        "id": "step4",
        "title": "安装新电池",
        "description": "放入新电池并重新连接电池排线",
        "image_url": "https://example.com/s23_step4.jpg",
        "estimated_time": 10
      },
      {
        "id": "step5",
        "title": "测试和组装",
        "description": "开机测试电池功能，重新安装后盖",
        "image_url": "https://example.com/s23_step5.jpg",
        "estimated_time": 7
      }
    ]'::jsonb,
    'https://www.bilibili.com/video/BV123456789',
    '["精密螺丝刀", "塑料撬棒", "热风枪", "吸盘"]'::jsonb,
    '["三星S23原装电池", "后盖胶"]'::jsonb,
    'https://example.com/s23-battery-cover.jpg',
    3,
    40,
    'published'
  ),
  (
    'Huawei Mate 50',
    'water_damage',
    '华为Mate 50 进水应急处理方案',
    '手机意外进水后的紧急处理步骤和专业维修建议',
    '[
      {
        "id": "step1",
        "title": "立即断电",
        "description": "第一时间关闭手机电源，避免短路损坏",
        "image_url": "https://example.com/mate50_step1.jpg",
        "estimated_time": 1
      },
      {
        "id": "step2",
        "title": "取出SIM卡和存储卡",
        "description": "尽快取出所有可拆卸部件",
        "image_url": "https://example.com/mate50_step2.jpg",
        "estimated_time": 2
      },
      {
        "id": "step3",
        "title": "清洁表面水分",
        "description": "用干净布料轻轻擦拭表面水分",
        "image_url": "https://example.com/mate50_step3.jpg",
        "estimated_time": 3
      },
      {
        "id": "step4",
        "title": "干燥处理",
        "description": "放置在干燥通风处自然晾干至少48小时",
        "image_url": "https://example.com/mate50_step4.jpg",
        "estimated_time": 2880
      },
      {
        "id": "step5",
        "title": "专业检测",
        "description": "联系专业维修店进行全面检测",
        "image_url": "https://example.com/mate50_step5.jpg",
        "estimated_time": 30
      }
    ]'::jsonb,
    null,
    '["干净毛巾", "干燥剂", "吹风机(冷风)"]'::jsonb,
    '[]'::jsonb,
    'https://example.com/mate50-water-cover.jpg',
    2,
    30,
    'published'
  )
on conflict do nothing;