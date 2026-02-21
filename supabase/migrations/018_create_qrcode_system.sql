-- 二维码管理系统表结构
-- Migration: 018_create_qrcode_system.sql
-- 创建时间: 2026-02-19
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：产品二维码表
-- ====================================================================

-- 产品二维码主表
CREATE TABLE IF NOT EXISTS product_qrcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  qr_code_id VARCHAR(100) UNIQUE NOT NULL, -- 唯一编码，如 product_123456
  qr_content TEXT NOT NULL, -- 二维码包含的内容（通常是URL）
  qr_image_url TEXT, -- 二维码图片存储URL
  qr_image_base64 TEXT, -- 二维码图片Base64编码
  format VARCHAR(10) DEFAULT 'png', -- 图片格式: png, svg
  size INTEGER DEFAULT 300, -- 二维码尺寸（像素）
  error_correction_level VARCHAR(10) DEFAULT 'M', -- 纠错级别: L, M, Q, H
  margin INTEGER DEFAULT 4, -- 边距
  fg_color VARCHAR(7) DEFAULT '#000000', -- 前景色
  bg_color VARCHAR(7) DEFAULT '#FFFFFF', -- 背景色
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 二维码生成记录表（用于追踪生成历史）
CREATE TABLE IF NOT EXISTS qr_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES product_qrcodes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 生成者
  generation_method VARCHAR(50), -- 生成方式: api, batch, manual
  request_params JSONB, -- 请求参数
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 二维码扫描统计表
CREATE TABLE IF NOT EXISTS qr_scan_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES product_qrcodes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  scan_count INTEGER DEFAULT 0, -- 总扫描次数
  unique_scans INTEGER DEFAULT 0, -- 唯一用户扫描次数
  last_scan_time TIMESTAMP WITH TIME ZONE,
  daily_stats JSONB, -- 每日统计数据 { "2026-02-19": 45, "2026-02-18": 32 }
  weekly_stats JSONB, -- 每周统计数据
  monthly_stats JSONB, -- 每月统计数据
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_product_qrcodes_product_id ON product_qrcodes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_qrcodes_qr_code_id ON product_qrcodes(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_product_qrcodes_is_active ON product_qrcodes(is_active);
CREATE INDEX IF NOT EXISTS idx_product_qrcodes_created_at ON product_qrcodes(created_at);

CREATE INDEX IF NOT EXISTS idx_qr_generation_logs_qr_code_id ON qr_generation_logs(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_generation_logs_product_id ON qr_generation_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_qr_generation_logs_created_at ON qr_generation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_qr_scan_statistics_qr_code_id ON qr_scan_statistics(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_statistics_product_id ON qr_scan_statistics(product_id);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_qr_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_product_qrcodes_updated_at 
    BEFORE UPDATE ON product_qrcodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_qr_updated_at_column();

CREATE TRIGGER update_qr_scan_statistics_updated_at 
    BEFORE UPDATE ON qr_scan_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_qr_updated_at_column();

-- ====================================================================
-- 第四部分：初始化数据和视图
-- ====================================================================

-- 创建二维码统计视图
CREATE OR REPLACE VIEW qr_code_analytics AS
SELECT 
    pq.id,
    pq.qr_code_id,
    pq.product_id,
    p.name as product_name,
    p.model as product_model,
    b.name as brand_name,
    pq.qr_content,
    pq.format,
    pq.size,
    qs.scan_count,
    qs.unique_scans,
    qs.last_scan_time,
    pq.created_at,
    pq.is_active
FROM product_qrcodes pq
JOIN products p ON pq.product_id = p.id
JOIN brands b ON p.brand_id = b.id
LEFT JOIN qr_scan_statistics qs ON pq.id = qs.qr_code_id;

-- 插入系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('qrcode_default_size', '300', '二维码默认尺寸（像素）'),
  ('qrcode_default_format', '"png"', '二维码默认格式'),
  ('qrcode_error_correction', '"M"', '二维码默认纠错级别'),
  ('qrcode_margin', '4', '二维码默认边距')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- 第五部分：RLS策略（如果启用RLS）
-- ====================================================================

-- 为product_qrcodes表添加RLS策略
ALTER TABLE product_qrcodes ENABLE ROW LEVEL SECURITY;

-- 品牌只能访问自己的二维码
CREATE POLICY "Brands can view their own qrcodes" ON product_qrcodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            JOIN brands b ON p.brand_id = b.id 
            WHERE p.id = product_qrcodes.product_id 
            AND b.api_key = current_setting('request.headers', true)::json->>'x-api-key'
        )
    );

-- 品牌可以创建自己的二维码
CREATE POLICY "Brands can create qrcodes for their products" ON product_qrcodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p 
            JOIN brands b ON p.brand_id = b.id 
            WHERE p.id = product_qrcodes.product_id 
            AND b.api_key = current_setting('request.headers', true)::json->>'x-api-key'
        )
    );

-- 管理员可以访问所有二维码
CREATE POLICY "Admins can view all qrcodes" ON product_qrcodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 添加表注释
COMMENT ON TABLE product_qrcodes IS '产品二维码信息表';
COMMENT ON TABLE qr_generation_logs IS '二维码生成日志表';
COMMENT ON TABLE qr_scan_statistics IS '二维码扫描统计表';

COMMENT ON COLUMN product_qrcodes.qr_code_id IS '二维码唯一编码';
COMMENT ON COLUMN product_qrcodes.qr_content IS '二维码内容（通常是产品页面URL）';
COMMENT ON COLUMN product_qrcodes.qr_image_url IS '二维码图片存储路径';
COMMENT ON COLUMN product_qrcodes.qr_image_base64 IS '二维码图片Base64编码';
COMMENT ON COLUMN qr_scan_statistics.scan_count IS '总扫描次数';
COMMENT ON COLUMN qr_scan_statistics.unique_scans IS '独立用户扫描次数';