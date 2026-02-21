-- V1.4__create_repair_shops_table.sql
-- 创建维修店铺表
-- 创建时间: 2026-02-20
-- 版本: 1.4.0

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
CREATE INDEX IF NOT EXISTS idx_repair_shops_city ON repair_shops(city);
CREATE INDEX IF NOT EXISTS idx_repair_shops_province ON repair_shops(province);
CREATE INDEX IF NOT EXISTS idx_repair_shops_country ON repair_shops(country);
CREATE INDEX IF NOT EXISTS idx_repair_shops_rating ON repair_shops(rating);
CREATE INDEX IF NOT EXISTS idx_repair_shops_is_verified ON repair_shops(is_verified);
CREATE INDEX IF NOT EXISTS idx_repair_shops_cert_level ON repair_shops(certification_level);
CREATE INDEX IF NOT EXISTS idx_repair_shops_slug ON repair_shops(slug);

-- 添加表注释
COMMENT ON TABLE repair_shops IS '维修店铺信息表';
COMMENT ON COLUMN repair_shops.id IS '店铺唯一标识符';
COMMENT ON COLUMN repair_shops.name IS '店铺名称';
COMMENT ON COLUMN repair_shops.slug IS '店铺唯一标识符(URL友好)';
COMMENT ON COLUMN repair_shops.contact_person IS '联系人姓名';
COMMENT ON COLUMN repair_shops.phone IS '联系电话';
COMMENT ON COLUMN repair_shops.address IS '详细地址';
COMMENT ON COLUMN repair_shops.city IS '城市';
COMMENT ON COLUMN repair_shops.province IS '省份';
COMMENT ON COLUMN repair_shops.country IS '国家/地区';
COMMENT ON COLUMN repair_shops.postal_code IS '邮政编码';
COMMENT ON COLUMN repair_shops.latitude IS '纬度坐标';
COMMENT ON COLUMN repair_shops.longitude IS '经度坐标';
COMMENT ON COLUMN repair_shops.logo_url IS '店铺Logo图片URL';
COMMENT ON COLUMN repair_shops.cover_image_url IS '店铺封面图片URL';
COMMENT ON COLUMN repair_shops.business_license IS '营业执照图片URL';
COMMENT ON COLUMN repair_shops.qualification_cert IS '资质证书图片URL';
COMMENT ON COLUMN repair_shops.services IS '提供的服务项目(JSON格式)';
COMMENT ON COLUMN repair_shops.specialties IS '专长领域(JSON格式)';
COMMENT ON COLUMN repair_shops.languages IS '支持语言(JSON格式)';
COMMENT ON COLUMN repair_shops.rating IS '店铺评分(0.0-5.0)';
COMMENT ON COLUMN repair_shops.review_count IS '评价数量';
COMMENT ON COLUMN repair_shops.service_count IS '服务项目数量';
COMMENT ON COLUMN repair_shops.certification_level IS '认证等级(1-5)';
COMMENT ON COLUMN repair_shops.is_verified IS '是否官方认证';
COMMENT ON COLUMN repair_shops.status IS '店铺状态(active/inactive)';
COMMENT ON COLUMN repair_shops.created_at IS '创建时间';
COMMENT ON COLUMN repair_shops.updated_at IS '更新时间';

-- 启用RLS
ALTER TABLE repair_shops ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "允许所有人查看维修店铺" ON repair_shops FOR SELECT USING (true);
CREATE POLICY "认证用户可管理维修店铺" ON repair_shops FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 维修店铺表创建完成'