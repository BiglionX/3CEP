-- 创建设备/故障字典等缺失表结构
-- 在Supabase控制台 SQL Editor 中执行此脚本

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 设备型号表
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  series VARCHAR(100),
  release_year INTEGER,
  image_url TEXT,
  thumbnail_url TEXT,
  specifications JSONB,
  category VARCHAR(50) DEFAULT '手机',
  os_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand, model)
);

-- 故障类型表
CREATE TABLE IF NOT EXISTS fault_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(50),
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time INTEGER, -- 分钟
  image_url TEXT,
  repair_guide_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 热点链接池表
CREATE TABLE IF NOT EXISTS hot_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  image_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 维修店铺表
CREATE TABLE IF NOT EXISTS repair_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  logo_url TEXT,
  cover_image_url TEXT,
  business_license TEXT,
  qualification_cert TEXT,
  services JSONB,
  specialties JSONB,
  languages JSONB,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  certification_level INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices(brand);
CREATE INDEX IF NOT EXISTS idx_devices_model ON devices(model);
CREATE INDEX IF NOT EXISTS idx_devices_category ON devices(category);
CREATE INDEX IF NOT EXISTS idx_devices_os_type ON devices(os_type);
CREATE INDEX IF NOT EXISTS idx_faults_category ON fault_types(category);
CREATE INDEX IF NOT EXISTS idx_faults_sub_category ON fault_types(sub_category);
CREATE INDEX IF NOT EXISTS idx_hot_links_category ON hot_links(category);
CREATE INDEX IF NOT EXISTS idx_hot_links_sub_category ON hot_links(sub_category);
CREATE INDEX IF NOT EXISTS idx_repair_shops_city ON repair_shops(city);
CREATE INDEX IF NOT EXISTS idx_repair_shops_province ON repair_shops(province);
CREATE INDEX IF NOT EXISTS idx_repair_shops_country ON repair_shops(country);
CREATE INDEX IF NOT EXISTS idx_repair_shops_rating ON repair_shops(rating);
CREATE INDEX IF NOT EXISTS idx_repair_shops_is_verified ON repair_shops(is_verified);
CREATE INDEX IF NOT EXISTS idx_repair_shops_cert_level ON repair_shops(certification_level);

-- 添加表注释
COMMENT ON TABLE devices IS '设备型号信息表';
COMMENT ON TABLE fault_types IS '故障类型字典表';
COMMENT ON TABLE hot_links IS '热点链接池表';
COMMENT ON TABLE repair_shops IS '维修店铺信息表';

COMMENT ON COLUMN devices.brand IS '设备品牌';
COMMENT ON COLUMN devices.model IS '设备型号';
COMMENT ON COLUMN devices.thumbnail_url IS '设备缩略图URL';
COMMENT ON COLUMN devices.category IS '设备分类(手机/平板/笔记本等)';
COMMENT ON COLUMN devices.os_type IS '操作系统类型';
COMMENT ON COLUMN fault_types.difficulty_level IS '维修难度等级(1-5)';
COMMENT ON COLUMN fault_types.estimated_time IS '预估维修时间(分钟)';
COMMENT ON COLUMN fault_types.image_url IS '故障示意图URL';
COMMENT ON COLUMN fault_types.repair_guide_url IS '维修指南链接';
COMMENT ON COLUMN hot_links.image_url IS '封面图片URL';
COMMENT ON COLUMN hot_links.sub_category IS '子分类';
COMMENT ON COLUMN hot_links.share_count IS '分享次数';
COMMENT ON COLUMN repair_shops.slug IS '店铺唯一标识符';
COMMENT ON COLUMN repair_shops.country IS '国家/地区';
COMMENT ON COLUMN repair_shops.latitude IS '纬度';
COMMENT ON COLUMN repair_shops.longitude IS '经度';
COMMENT ON COLUMN repair_shops.logo_url IS '店铺Logo图片URL';
COMMENT ON COLUMN repair_shops.cover_image_url IS '店铺封面图片URL';
COMMENT ON COLUMN repair_shops.specialties IS '专长领域(JSON格式)';
COMMENT ON COLUMN repair_shops.languages IS '支持语言(JSON格式)';
COMMENT ON COLUMN repair_shops.service_count IS '服务项目数量';
COMMENT ON COLUMN repair_shops.certification_level IS '认证等级(1-5)';
COMMENT ON COLUMN repair_shops.is_verified IS '是否官方认证';
COMMENT ON COLUMN repair_shops.rating IS '店铺评分(0.0-5.0)';

-- 启用RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shops ENABLE ROW LEVEL SECURITY;

-- 创建基础的RLS策略（允许所有人读取）
CREATE POLICY "允许所有人查看设备" ON devices FOR SELECT USING (true);
CREATE POLICY "允许所有人查看故障类型" ON fault_types FOR SELECT USING (true);
CREATE POLICY "允许所有人查看热点链接" ON hot_links FOR SELECT USING (true);
CREATE POLICY "允许所有人查看维修店铺" ON repair_shops FOR SELECT USING (true);

-- 允许认证用户插入和更新
CREATE POLICY "认证用户可管理设备" ON devices 
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "认证用户可管理故障类型" ON fault_types 
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "认证用户可管理热点链接" ON hot_links 
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "认证用户可管理维修店铺" ON repair_shops 
FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 表结构创建完成'
