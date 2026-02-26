-- 批量二维码生成系统表结构
-- Migration: 019_create_batch_qrcode_system.sql
-- 创建时间: 2026-02-26
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：批量二维码批次表
-- ====================================================================

-- 批次主表
CREATE TABLE IF NOT EXISTS qr_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) UNIQUE NOT NULL, -- 批次唯一标识
  product_model VARCHAR(100) NOT NULL, -- 产品型号（每批锁定唯一型号）
  product_category VARCHAR(50) NOT NULL, -- 产品类别
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE, -- 品牌ID
  product_name VARCHAR(200) NOT NULL, -- 产品名称
  quantity INTEGER NOT NULL CHECK (quantity > 0), -- 计划生成数量
  generated_count INTEGER DEFAULT 0, -- 已生成数量
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')), -- 批次状态
  config JSONB NOT NULL DEFAULT '{}', -- 生成配置
  start_date DATE, -- 生产开始日期
  end_date DATE, -- 生产结束日期
  completed_at TIMESTAMP WITH TIME ZONE, -- 完成时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 二维码详细记录表
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) REFERENCES qr_batches(batch_id) ON DELETE CASCADE, -- 所属批次
  product_id VARCHAR(100) NOT NULL, -- 产品ID（型号+序列号）
  qr_content TEXT NOT NULL, -- 二维码内容
  qr_image_base64 TEXT, -- 二维码图片Base64
  serial_number VARCHAR(20) NOT NULL, -- 序列号
  format VARCHAR(10) DEFAULT 'png', -- 图片格式
  size INTEGER DEFAULT 300, -- 尺寸
  is_active BOOLEAN DEFAULT true, -- 是否激活
  scanned_count INTEGER DEFAULT 0, -- 扫描次数
  last_scanned_at TIMESTAMP WITH TIME ZONE, -- 最后扫描时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 批次表索引
CREATE INDEX IF NOT EXISTS idx_qr_batches_status ON qr_batches(status);
CREATE INDEX IF NOT EXISTS idx_qr_batches_product_model ON qr_batches(product_model);
CREATE INDEX IF NOT EXISTS idx_qr_batches_created_at ON qr_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_batches_brand_id ON qr_batches(brand_id);

-- 二维码表索引
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON qr_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_serial_number ON qr_codes(serial_number);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- 复合索引
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_serial ON qr_codes(batch_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_qr_batches_model_status ON qr_batches(product_model, status);

-- ====================================================================
-- 第三部分：触发器
-- ====================================================================

-- 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为两个表添加更新触发器
CREATE TRIGGER update_qr_batches_updated_at 
    BEFORE UPDATE ON qr_batches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
    BEFORE UPDATE ON qr_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 自动更新批次的生成计数
CREATE OR REPLACE FUNCTION update_batch_generated_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE qr_batches 
        SET generated_count = generated_count + 1,
            updated_at = NOW()
        WHERE batch_id = NEW.batch_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE qr_batches 
        SET generated_count = generated_count - 1,
            updated_at = NOW()
        WHERE batch_id = OLD.batch_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 添加计数更新触发器
CREATE TRIGGER update_batch_count_after_qr_insert
    AFTER INSERT OR DELETE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_generated_count();

-- ====================================================================
-- 第四部分：视图
-- ====================================================================

-- 批次统计视图
CREATE OR REPLACE VIEW qr_batch_statistics AS
SELECT 
    b.id,
    b.batch_id,
    b.product_model,
    b.product_category,
    b.product_name,
    b.quantity,
    b.generated_count,
    b.status,
    b.config,
    b.start_date,
    b.end_date,
    b.created_at,
    b.completed_at,
    b.updated_at,
    -- 计算进度百分比
    ROUND(COALESCE(b.generated_count::DECIMAL / NULLIF(b.quantity, 0) * 100, 0), 2) as progress_percent,
    -- 计算剩余时间（基于当前生成速度估算）
    CASE 
        WHEN b.status = 'processing' AND b.generated_count > 0 THEN
            ((b.quantity - b.generated_count) * EXTRACT(EPOCH FROM (NOW() - b.created_at)) / b.generated_count / 3600)::INTEGER
        ELSE NULL
    END as estimated_hours_remaining
FROM qr_batches b;

-- 二维码详情视图（包含产品和品牌信息）
CREATE OR REPLACE VIEW qr_codes_with_details AS
SELECT 
    qc.id,
    qc.batch_id,
    qc.product_id,
    qc.qr_content,
    qc.qr_image_base64,
    qc.serial_number,
    qc.format,
    qc.size,
    qc.is_active,
    qc.scanned_count,
    qc.last_scanned_at,
    qc.created_at,
    qc.updated_at,
    b.name as brand_name,
    b.id as brand_id,
    qb.product_model,
    qb.product_category,
    qb.product_name
FROM qr_codes qc
JOIN qr_batches qb ON qc.batch_id = qb.batch_id
LEFT JOIN brands b ON qb.brand_id = b.id;

-- ====================================================================
-- 第五部分：权限控制
-- ====================================================================

-- 启用RLS（行级安全）
ALTER TABLE qr_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 管理员可以访问所有批次
CREATE POLICY "Admins can view all batches" ON qr_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 管理员可以访问所有二维码
CREATE POLICY "Admins can view all qr codes" ON qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 品牌用户只能访问自己品牌的批次
CREATE POLICY "Brand users can view own batches" ON qr_batches
    FOR SELECT USING (
        brand_id IN (
            SELECT brand_id FROM brand_users 
            WHERE user_id = auth.uid()
        )
    );

-- 品牌用户只能访问自己品牌的二维码
CREATE POLICY "Brand users can view own qr codes" ON qr_codes
    FOR SELECT USING (
        batch_id IN (
            SELECT batch_id FROM qr_batches qb
            JOIN brand_users bu ON qb.brand_id = bu.brand_id
            WHERE bu.user_id = auth.uid()
        )
    );

-- ====================================================================
-- 第六部分：表注释
-- ====================================================================

COMMENT ON TABLE qr_batches IS '批量二维码生成批次表';
COMMENT ON TABLE qr_codes IS '二维码详细记录表';

COMMENT ON COLUMN qr_batches.batch_id IS '批次唯一标识符';
COMMENT ON COLUMN qr_batches.product_model IS '产品型号（每批锁定唯一型号）';
COMMENT ON COLUMN qr_batches.quantity IS '计划生成的二维码总数';
COMMENT ON COLUMN qr_batches.generated_count IS '已成功生成的二维码数量';
COMMENT ON COLUMN qr_batches.status IS '批次状态：pending(待处理), processing(处理中), completed(已完成), failed(失败)';
COMMENT ON COLUMN qr_batches.config IS '生成配置JSON，包含格式、尺寸、纠错等级等';

COMMENT ON COLUMN qr_codes.batch_id IS '所属批次ID';
COMMENT ON COLUMN qr_codes.product_id IS '完整产品ID（型号+序列号）';
COMMENT ON COLUMN qr_codes.serial_number IS '序列号，用于区分同一批次内的不同二维码';
COMMENT ON COLUMN qr_codes.qr_content IS '二维码实际内容（通常是产品页面URL）';
COMMENT ON COLUMN qr_codes.scanned_count IS '被扫描的次数统计';

-- ====================================================================
-- 第七部分：初始化数据（可选）
-- ====================================================================

-- 插入示例数据（仅用于测试）
-- INSERT INTO qr_batches (batch_id, product_model, product_category, brand_id, product_name, quantity, status, config)
-- VALUES 
-- ('batch_sample_001', 'IPH15P-A2842', 'smartphone', 'brand_apple_001', 'iPhone 15 Pro', 10, 'completed', '{"format": "png", "size": 300}'),
-- ('batch_sample_002', 'SM-S9280', 'smartphone', 'brand_samsung_001', 'Galaxy S24 Ultra', 5, 'pending', '{"format": "svg", "size": 400}');

-- 添加约束检查
ALTER TABLE qr_batches ADD CONSTRAINT check_valid_dates 
CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

ALTER TABLE qr_batches ADD CONSTRAINT check_positive_quantity 
CHECK (quantity > 0);

ALTER TABLE qr_codes ADD CONSTRAINT check_positive_size 
CHECK (size > 0);

-- 创建统计函数
CREATE OR REPLACE FUNCTION get_batch_progress(batch_id_param VARCHAR)
RETURNS TABLE(
    total INTEGER,
    generated INTEGER,
    progress_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.quantity as total,
        b.generated_count as generated,
        ROUND(COALESCE(b.generated_count::DECIMAL / NULLIF(b.quantity, 0) * 100, 0), 2) as progress_percent
    FROM qr_batches b
    WHERE b.batch_id = batch_id_param;
END;
$$ LANGUAGE plpgsql;