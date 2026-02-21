-- 一体化数据库部署脚本
-- 包含完整的表结构、数据和安全策略

-- ====================================================================
-- 第一部分：表结构和索引创建
-- ====================================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 配件信息表
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 平台价格信息表
CREATE TABLE IF NOT EXISTS part_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户上传内容表
CREATE TABLE IF NOT EXISTS uploaded_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  content_type VARCHAR(50),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 预约时间表
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand);
CREATE INDEX IF NOT EXISTS idx_part_prices_part_id ON part_prices(part_id);
CREATE INDEX IF NOT EXISTS idx_part_prices_platform ON part_prices(platform);
CREATE INDEX IF NOT EXISTS idx_uploaded_content_user_id ON uploaded_content(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);

-- 添加表注释
COMMENT ON TABLE parts IS '配件基本信息表';
COMMENT ON TABLE part_prices IS '配件各平台价格信息表';
COMMENT ON TABLE uploaded_content IS '用户上传的内容URL';
COMMENT ON TABLE appointments IS '预约时间表';
COMMENT ON TABLE system_config IS '系统配置表';

-- ====================================================================
-- 第二部分：初始数据插入
-- ====================================================================

-- 插入示例配件数据
INSERT INTO parts (name, category, brand, model, description, image_url) VALUES
  ('iPhone 15 Pro 屏幕总成', '屏幕', 'Apple', 'iPhone 15 Pro', '原装屏幕总成，支持原彩显示', 'https://example.com/iphone15-screen.jpg'),
  ('华为Mate60 电池', '电池', '华为', 'Mate60', '原装锂电池，容量4800mAh', 'https://example.com/mate60-battery.jpg'),
  ('小米14 充电器', '充电器', '小米', '14', '67W快充充电器，支持多种快充协议', 'https://example.com/xiaomi-charger.jpg'),
  ('三星Galaxy S24 摄像头模组', '摄像头', '三星', 'Galaxy S24', '后置三摄模组，主摄5000万像素', 'https://example.com/s24-camera.jpg'),
  ('OPPO Reno11 外壳', '外壳', 'OPPO', 'Reno11', '硅胶软壳，防摔保护', 'https://example.com/reno11-case.jpg')
ON CONFLICT DO NOTHING;

-- 插入价格数据
WITH inserted_parts AS (
  SELECT id, name FROM parts WHERE name IN (
    'iPhone 15 Pro 屏幕总成',
    '华为Mate60 电池',
    '小米14 充电器',
    '三星Galaxy S24 摄像头模组',
    'OPPO Reno11 外壳'
  )
)
INSERT INTO part_prices (part_id, platform, price, url) 
SELECT ip.id, '淘宝', 899.00, 'https://taobao.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = 'iPhone 15 Pro 屏幕总成'
UNION ALL
SELECT ip.id, '京东', 959.00, 'https://jd.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = 'iPhone 15 Pro 屏幕总成'
UNION ALL
SELECT ip.id, '拼多多', 799.00, 'https://pinduoduo.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = 'iPhone 15 Pro 屏幕总成'
UNION ALL
SELECT ip.id, '淘宝', 299.00, 'https://taobao.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = '华为Mate60 电池'
UNION ALL
SELECT ip.id, '京东', 329.00, 'https://jd.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = '华为Mate60 电池'
UNION ALL
SELECT ip.id, '拼多多', 259.00, 'https://pinduoduo.com/item/' || lower(replace(ip.name, ' ', '-'))
FROM inserted_parts ip WHERE ip.name = '华为Mate60 电池'
ON CONFLICT DO NOTHING;

-- 插入示例预约时间数据
INSERT INTO appointments (user_id, start_time, end_time, status, notes) VALUES
  (NULL, '2026-02-15 09:00:00+08', '2026-02-15 10:00:00+08', 'confirmed', 'iPhone屏幕更换'),
  (NULL, '2026-02-15 14:00:00+08', '2026-02-15 15:00:00+08', 'pending', '华为电池更换'),
  (NULL, '2026-02-16 10:00:00+08', '2026-02-16 11:00:00+08', 'confirmed', '小米充电器购买咨询')
ON CONFLICT DO NOTHING;

-- 插入系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('app_version', '"1.0.0"', '应用版本号'),
  ('maintenance_mode', 'false', '维护模式开关'),
  ('price_refresh_interval', '3600', '价格刷新间隔（秒）'),
  ('default_currency', '"CNY"', '默认货币单位'),
  ('contact_email', '"support@example.com"', '客服邮箱'),
  ('business_hours', '{"start": "09:00", "end": "18:00"}', '营业时间')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 插入示例上传内容
INSERT INTO uploaded_content (url, title, description, content_type) VALUES
  ('https://example.com/guide/iphone-repair.pdf', 'iPhone维修指南', '详细的iPhone维修步骤说明', 'application/pdf'),
  ('https://example.com/video/battery-replacement.mp4', '电池更换教程视频', '手把手教学如何更换手机电池', 'video/mp4'),
  ('https://example.com/article/screen-protection-tips.html', '屏幕保护小贴士', '延长手机屏幕使用寿命的方法', 'text/html')
ON CONFLICT (url) DO NOTHING;

-- ====================================================================
-- 第三部分：RLS安全策略
-- ====================================================================

-- 为所有表启用RLS
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 配件表策略
-- 先删除可能存在的同名策略
DROP POLICY IF EXISTS "允许所有人查看配件" ON parts;
DROP POLICY IF EXISTS "认证用户可插入配件" ON parts;
DROP POLICY IF EXISTS "认证用户可更新配件" ON parts;
DROP POLICY IF EXISTS "仅管理员可删除配件" ON parts;

-- 创建新的策略
CREATE POLICY "允许所有人查看配件"
  ON parts FOR SELECT
  USING (true);

CREATE POLICY "认证用户可插入配件"
  ON parts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "认证用户可更新配件"
  ON parts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "仅管理员可删除配件"
  ON parts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 配件价格表策略
DROP POLICY IF EXISTS "允许所有人查看价格" ON part_prices;
DROP POLICY IF EXISTS "认证用户可插入价格" ON part_prices;
DROP POLICY IF EXISTS "认证用户可更新价格" ON part_prices;

CREATE POLICY "允许所有人查看价格"
  ON part_prices FOR SELECT
  USING (true);

CREATE POLICY "认证用户可插入价格"
  ON part_prices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "认证用户可更新价格"
  ON part_prices FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 上传内容表策略
DROP POLICY IF EXISTS "允许查看公开上传内容" ON uploaded_content;
DROP POLICY IF EXISTS "用户可查看自己的内容" ON uploaded_content;
DROP POLICY IF EXISTS "用户可上传内容" ON uploaded_content;
DROP POLICY IF EXISTS "用户可更新自己的内容" ON uploaded_content;
DROP POLICY IF EXISTS "用户可删除自己的内容" ON uploaded_content;

CREATE POLICY "允许查看公开上传内容"
  ON uploaded_content FOR SELECT
  USING (true);

CREATE POLICY "用户可查看自己的内容"
  ON uploaded_content FOR SELECT
  USING (
    user_id = auth.uid() 
    OR user_id IS NULL 
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "用户可上传内容"
  ON uploaded_content FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

CREATE POLICY "用户可更新自己的内容"
  ON uploaded_content FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "用户可删除自己的内容"
  ON uploaded_content FOR DELETE
  USING (user_id = auth.uid());

-- 预约表策略
DROP POLICY IF EXISTS "用户可查看自己的预约" ON appointments;
DROP POLICY IF EXISTS "用户可创建预约" ON appointments;
DROP POLICY IF EXISTS "用户可更新自己的预约" ON appointments;
DROP POLICY IF EXISTS "用户可删除自己的预约" ON appointments;

CREATE POLICY "用户可查看自己的预约"
  ON appointments FOR SELECT
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

CREATE POLICY "用户可创建预约"
  ON appointments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

CREATE POLICY "用户可更新自己的预约"
  ON appointments FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

CREATE POLICY "用户可删除自己的预约"
  ON appointments FOR DELETE
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

-- 系统配置表策略
DROP POLICY IF EXISTS "仅管理员可访问系统配置" ON system_config;

CREATE POLICY "仅管理员可访问系统配置"
  ON system_config FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- 创建安全视图
CREATE OR REPLACE VIEW public.parts_with_prices AS
  SELECT 
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
    ) AS prices
  FROM parts p
  LEFT JOIN part_prices pp ON p.id = pp.part_id
  GROUP BY p.id, p.name, p.category, p.brand, p.model, p.description, p.image_url, p.created_at;

-- 授权视图访问权限
GRANT SELECT ON public.parts_with_prices TO authenticated, anon;

-- ====================================================================
-- 第四部分：部署验证
-- ====================================================================

-- 验证创建结果
SELECT '=== 数据库结构创建完成 ===' as status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config')
ORDER BY table_name;

SELECT '=== 各表记录数统计 ===' as status;

SELECT 'parts' as table_name, COUNT(*) as record_count FROM parts
UNION ALL
SELECT 'part_prices', COUNT(*) FROM part_prices
UNION ALL
SELECT 'uploaded_content', COUNT(*) FROM uploaded_content
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config
ORDER BY table_name;