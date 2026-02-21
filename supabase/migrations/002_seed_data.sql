-- 初始种子数据
-- 创建时间: 2026-02-14

-- 插入示例配件数据
insert into parts (name, category, brand, model, description, image_url) values
  ('iPhone 15 Pro 屏幕总成', '屏幕', 'Apple', 'iPhone 15 Pro', '原装屏幕总成，支持原彩显示', 'https://example.com/iphone15-screen.jpg'),
  ('华为Mate60 电池', '电池', '华为', 'Mate60', '原装锂电池，容量4800mAh', 'https://example.com/mate60-battery.jpg'),
  ('小米14 充电器', '充电器', '小米', '14', '67W快充充电器，支持多种快充协议', 'https://example.com/xiaomi-charger.jpg'),
  ('三星Galaxy S24 摄像头模组', '摄像头', '三星', 'Galaxy S24', '后置三摄模组，主摄5000万像素', 'https://example.com/s24-camera.jpg'),
  ('OPPO Reno11 外壳', '外壳', 'OPPO', 'Reno11', '硅胶软壳，防摔保护', 'https://example.com/reno11-case.jpg')
on conflict do nothing;

-- 获取刚插入的配件ID用于关联价格数据
with inserted_parts as (
  select id, name from parts where name in (
    'iPhone 15 Pro 屏幕总成',
    '华为Mate60 电池',
    '小米14 充电器',
    '三星Galaxy S24 摄像头模组',
    'OPPO Reno11 外壳'
  )
)
-- 插入价格数据
insert into part_prices (part_id, platform, price, url) 
select ip.id, '淘宝', 899.00, 'https://taobao.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = 'iPhone 15 Pro 屏幕总成'
union all
select ip.id, '京东', 959.00, 'https://jd.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = 'iPhone 15 Pro 屏幕总成'
union all
select ip.id, '拼多多', 799.00, 'https://pinduoduo.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = 'iPhone 15 Pro 屏幕总成'
union all
select ip.id, '淘宝', 299.00, 'https://taobao.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = '华为Mate60 电池'
union all
select ip.id, '京东', 329.00, 'https://jd.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = '华为Mate60 电池'
union all
select ip.id, '拼多多', 259.00, 'https://pinduoduo.com/item/' || lower(replace(ip.name, ' ', '-'))
from inserted_parts ip where ip.name = '华为Mate60 电池'
on conflict do nothing;

-- 插入示例预约时间数据
insert into appointments (user_id, start_time, end_time, status, notes) values
  (null, '2026-02-15 09:00:00+08', '2026-02-15 10:00:00+08', 'confirmed', 'iPhone屏幕更换'),
  (null, '2026-02-15 14:00:00+08', '2026-02-15 15:00:00+08', 'pending', '华为电池更换'),
  (null, '2026-02-16 10:00:00+08', '2026-02-16 11:00:00+08', 'confirmed', '小米充电器购买咨询')
on conflict do nothing;

-- 更新系统配置
insert into system_config (key, value, description) values
  ('default_currency', '"CNY"', '默认货币单位'),
  ('contact_email', '"support@example.com"', '客服邮箱'),
  ('business_hours', '{"start": "09:00", "end": "18:00"}', '营业时间')
on conflict (key) do update set 
  value = excluded.value,
  description = excluded.description,
  updated_at = now();

-- 插入一些示例上传内容
insert into uploaded_content (url, title, description, content_type) values
  ('https://example.com/guide/iphone-repair.pdf', 'iPhone维修指南', '详细的iPhone维修步骤说明', 'application/pdf'),
  ('https://example.com/video/battery-replacement.mp4', '电池更换教程视频', '手把手教学如何更换手机电池', 'video/mp4'),
  ('https://example.com/article/screen-protection-tips.html', '屏幕保护小贴士', '延长手机屏幕使用寿命的方法', 'text/html')
on conflict (url) do nothing;