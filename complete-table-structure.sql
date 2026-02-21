-- 数据库表结构创建脚本
-- 执行方式: 通过Supabase控制台SQL Editor执行此文件

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

-- 插入初始系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('app_version', '"1.0.0"', '应用版本号'),
  ('maintenance_mode', 'false', '维护模式开关'),
  ('price_refresh_interval', '3600', '价格刷新间隔（秒）')
ON CONFLICT (key) DO NOTHING;

-- 添加表注释
COMMENT ON TABLE parts IS '配件基本信息表';
COMMENT ON TABLE part_prices IS '配件各平台价格信息表';
COMMENT ON TABLE uploaded_content IS '用户上传的内容URL';
COMMENT ON TABLE appointments IS '预约时间表';
COMMENT ON TABLE system_config IS '系统配置表';

COMMENT ON COLUMN parts.id IS '配件唯一标识符';
COMMENT ON COLUMN parts.name IS '配件名称';
COMMENT ON COLUMN parts.category IS '配件分类';
COMMENT ON COLUMN part_prices.price IS '价格（元）';
COMMENT ON COLUMN appointments.status IS '预约状态：pending/confimed/cancelled/completed';

-- 启用Row Level Security
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 配件表策略
-- 所有用户都可以查看配件信息
CREATE POLICY "允许所有人查看配件"
  ON parts FOR SELECT
  USING (true);

-- 只有认证用户可以插入配件
CREATE POLICY "认证用户可插入配件"
  ON parts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 只有认证用户可以更新自己的配件
CREATE POLICY "认证用户可更新配件"
  ON parts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 只有管理员可以删除配件
CREATE POLICY "仅管理员可删除配件"
  ON parts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 配件价格表策略
-- 所有用户都可以查看价格信息
CREATE POLICY "允许所有人查看价格"
  ON part_prices FOR SELECT
  USING (true);

-- 认证用户可以插入价格信息
CREATE POLICY "认证用户可插入价格"
  ON part_prices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 认证用户可以更新价格信息
CREATE POLICY "认证用户可更新价格"
  ON part_prices FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 上传内容表策略
-- 所有用户都可以查看公开内容
CREATE POLICY "允许查看公开上传内容"
  ON uploaded_content FOR SELECT
  USING (true);

-- 用户只能查看自己的上传内容或公开内容
CREATE POLICY "用户可查看自己的内容"
  ON uploaded_content FOR SELECT
  USING (
    user_id = auth.uid() 
    OR user_id IS NULL 
    OR auth.role() = 'authenticated'
  );

-- 用户可以上传内容
CREATE POLICY "用户可上传内容"
  ON uploaded_content FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

-- 用户可以更新自己的内容
CREATE POLICY "用户可更新自己的内容"
  ON uploaded_content FOR UPDATE
  USING (user_id = auth.uid());

-- 用户可以删除自己的内容
CREATE POLICY "用户可删除自己的内容"
  ON uploaded_content FOR DELETE
  USING (user_id = auth.uid());

-- 预约表策略
-- 用户只能查看自己的预约
CREATE POLICY "用户可查看自己的预约"
  ON appointments FOR SELECT
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

-- 用户可以创建预约
CREATE POLICY "用户可创建预约"
  ON appointments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR (user_id IS NULL AND auth.role() = 'authenticated')
  );

-- 用户可以更新自己的预约
CREATE POLICY "用户可更新自己的预约"
  ON appointments FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

-- 用户可以取消自己的预约
CREATE POLICY "用户可删除自己的预约"
  ON appointments FOR DELETE
  USING (
    user_id = auth.uid() 
    OR auth.role() = 'admin'
  );

-- 系统配置表策略
-- 只有管理员可以查看和修改系统配置
CREATE POLICY "仅管理员可访问系统配置"
  ON system_config FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- 创建视图用于安全的数据访问
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

-- 验证创建结果
SELECT '表结构创建完成' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN 
  ('parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config');