-- 配件管理模块种子数据
-- 创建时间: 2026-02-14

-- 插入示例配件数据
INSERT INTO parts (name, category, brand, model, part_number, unit, description, image_url, stock_quantity, min_stock, status) VALUES
-- 屏幕类配件
('原装屏幕总成', '屏幕', 'Apple', 'iPhone 15 Pro', 'IPH15PRO-SCR-001', '个', 'iPhone 15 Pro原装屏幕总成，支持原彩显示', 'https://example.com/images/iphone15pro-screen.jpg', 50, 10, 'active'),
('OLED显示屏', '屏幕', '三星', 'Galaxy S24', 'SAM-S24-OLED-001', '个', '三星Galaxy S24 OLED显示屏', 'https://example.com/images/s24-oled.jpg', 30, 5, 'active'),
('LCD屏幕', '屏幕', '小米', 'Redmi Note 12', 'XM-N12-LCD-001', '个', '小米Redmi Note 12 LCD屏幕', 'https://example.com/images/note12-lcd.jpg', 100, 20, 'active'),

-- 电池类配件
('原装电池', '电池', 'Apple', 'iPhone 15 Pro', 'IPH15PRO-BAT-001', '个', 'iPhone 15 Pro原装电池，容量4441mAh', 'https://example.com/images/iphone15pro-battery.jpg', 80, 15, 'active'),
('锂聚合物电池', '电池', '华为', 'Mate 60 Pro', 'HW-M60-BAT-001', '个', '华为Mate 60 Pro原装电池', 'https://example.com/images/mate60-battery.jpg', 60, 10, 'active'),
('快充电池', '电池', '小米', '14 Ultra', 'XM-14U-BAT-001', '个', '小米14 Ultra快充电池', 'https://example.com/images/14ultra-battery.jpg', 45, 8, 'active'),

-- 摄像头类配件
('主摄模组', '摄像头', 'Apple', 'iPhone 15 Pro', 'IPH15PRO-CAM-001', '个', 'iPhone 15 Pro主摄像头模组', 'https://example.com/images/iphone15pro-camera.jpg', 25, 5, 'active'),
('超广角镜头', '摄像头', '华为', 'P60 Pro', 'HW-P60-UW-001', '个', '华为P60 Pro超广角镜头', 'https://example.com/images/p60-ultrawide.jpg', 35, 8, 'active'),
('长焦镜头', '摄像头', '小米', '14 Ultra', 'XM-14U-TEL-001', '个', '小米14 Ultra长焦镜头', 'https://example.com/images/14ultra-telephoto.jpg', 20, 3, 'active'),

-- 外壳类配件
('硅胶保护壳', '外壳', 'Apple', 'iPhone 15 Pro', 'IPH15PRO-CASE-001', '个', 'iPhone 15 Pro硅胶保护壳', 'https://example.com/images/iphone15pro-case.jpg', 200, 30, 'active'),
('金属中框', '外壳', '三星', 'Galaxy S24', 'SAM-S24-FRM-001', '个', '三星Galaxy S24金属中框', 'https://example.com/images/s24-frame.jpg', 75, 15, 'active'),
('PC后盖', '外壳', '小米', '14', 'XM-14-BACK-001', '个', '小米14 PC材质后盖', 'https://example.com/images/14-backcover.jpg', 150, 25, 'active'),

-- 其他配件
('充电线', '线材', 'Apple', 'USB-C to Lightning', 'APP-C2L-CBL-001', '根', '苹果原装USB-C转Lightning充电线', 'https://example.com/images/c2l-cable.jpg', 300, 50, 'active'),
('无线充电器', '充电器', '小米', '30W无线充', 'XM-30W-WCH-001', '个', '小米30W无线充电器', 'https://example.com/images/30w-wireless.jpg', 80, 15, 'active'),
('数据线', '线材', '华为', 'SuperCharge', 'HW-SCP-CBL-001', '根', '华为SuperCharge数据线', 'https://example.com/images/huawei-cable.jpg', 180, 30, 'active')
ON CONFLICT DO NOTHING;

-- 获取刚插入的配件ID用于关联
WITH inserted_parts AS (
  SELECT id, name, brand, model FROM parts 
  WHERE brand IN ('Apple', '三星', '小米', '华为') 
  AND status = 'active'
  LIMIT 12
),
compatible_devices AS (
  SELECT 
    ip.id as part_id,
    d.id as device_id,
    CASE 
      WHEN ip.brand = d.brand AND ip.model LIKE '%' || d.model || '%' THEN '完全兼容'
      WHEN ip.brand = d.brand THEN '同品牌兼容'
      ELSE '通用配件'
    END as compatibility_notes
  FROM inserted_parts ip
  JOIN devices d ON (
    (ip.brand = d.brand AND ip.model LIKE '%' || d.model || '%') OR
    (ip.brand = d.brand AND d.model LIKE '%' || SPLIT_PART(ip.model, ' ', 1) || '%') OR
    (ip.category = '线材' AND d.category = '手机')
  )
  WHERE d.status = 'active'
)
INSERT INTO part_devices (part_id, device_id, compatibility_notes)
SELECT part_id, device_id, compatibility_notes 
FROM compatible_devices
ON CONFLICT DO NOTHING;

-- 关联故障类型
WITH inserted_parts AS (
  SELECT id, category FROM parts WHERE status = 'active' LIMIT 12
),
related_faults AS (
  SELECT 
    ip.id as part_id,
    ft.id as fault_id,
    CASE ft.category
      WHEN '屏幕' THEN '屏幕损坏/老化/显示异常时更换'
      WHEN '电池' THEN '电池老化/续航下降时更换'
      WHEN '摄像头' THEN '拍照模糊/无法对焦时更换'
      WHEN '外壳' THEN '外壳破损/划痕严重时更换'
      WHEN '充电' THEN '充电异常时检查更换'
      ELSE '相关故障时可考虑更换'
    END as usage_notes
  FROM inserted_parts ip
  JOIN fault_types ft ON (
    (ip.category = '屏幕' AND ft.category = '屏幕') OR
    (ip.category = '电池' AND ft.category = '电池') OR
    (ip.category = '摄像头' AND ft.category IN ('摄像头', '拍照')) OR
    (ip.category = '外壳' AND ft.category = '外观') OR
    (ip.category IN ('线材', '充电器') AND ft.category = '充电')
  )
  WHERE ft.status = 'active'
)
INSERT INTO part_faults (part_id, fault_id, usage_notes)
SELECT part_id, fault_id, usage_notes 
FROM related_faults
ON CONFLICT DO NOTHING;

-- 插入配件图片
WITH inserted_parts AS (
  SELECT id, name FROM parts WHERE status = 'active' LIMIT 12
)
INSERT INTO part_images (part_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  ip.id,
  'https://example.com/images/' || LOWER(REPLACE(REPLACE(ip.name, ' ', '-'), '/', '-')) || '.jpg',
  ip.name || '产品图片',
  true,
  0
FROM inserted_parts ip
ON CONFLICT DO NOTHING;

-- 更新配件表的主图URL
UPDATE parts p
SET image_url = pi.image_url
FROM part_images pi
WHERE p.id = pi.part_id AND pi.is_primary = true AND p.image_url IS NULL;

\echo '✅ 配件种子数据插入完成'