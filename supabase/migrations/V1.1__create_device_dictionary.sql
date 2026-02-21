-- V1.1__create_device_dictionary.sql
-- 创建设备型号字典表
-- 创建时间: 2026-02-20
-- 版本: 1.1.0

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices(brand);
CREATE INDEX IF NOT EXISTS idx_devices_model ON devices(model);
CREATE INDEX IF NOT EXISTS idx_devices_category ON devices(category);
CREATE INDEX IF NOT EXISTS idx_devices_os_type ON devices(os_type);

-- 添加表注释
COMMENT ON TABLE devices IS '设备型号信息表';
COMMENT ON COLUMN devices.id IS '设备唯一标识符';
COMMENT ON COLUMN devices.brand IS '设备品牌';
COMMENT ON COLUMN devices.model IS '设备型号';
COMMENT ON COLUMN devices.series IS '设备系列';
COMMENT ON COLUMN devices.release_year IS '发布年份';
COMMENT ON COLUMN devices.image_url IS '设备图片URL';
COMMENT ON COLUMN devices.thumbnail_url IS '设备缩略图URL';
COMMENT ON COLUMN devices.specifications IS '设备规格(JSON格式)';
COMMENT ON COLUMN devices.category IS '设备分类(手机/平板/笔记本等)';
COMMENT ON COLUMN devices.os_type IS '操作系统类型';
COMMENT ON COLUMN devices.status IS '设备状态(active/inactive)';
COMMENT ON COLUMN devices.created_at IS '创建时间';
COMMENT ON COLUMN devices.updated_at IS '更新时间';

-- 启用RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "允许所有人查看设备" ON devices FOR SELECT USING (true);
CREATE POLICY "认证用户可管理设备" ON devices FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 设备字典表创建完成'