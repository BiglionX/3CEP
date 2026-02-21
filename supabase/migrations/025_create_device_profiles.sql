-- 设备档案主表
-- Migration: 025_create_device_profiles.sql
-- 创建时间: 2026-02-20
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：设备档案主表
-- ====================================================================

-- 设备档案主表
CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrcode_id VARCHAR(100) UNIQUE NOT NULL REFERENCES product_qrcodes(qr_code_id) ON DELETE CASCADE,
  product_model VARCHAR(100) NOT NULL,
  product_category VARCHAR(100),
  brand_name VARCHAR(100),
  serial_number VARCHAR(100),
  manufacturing_date DATE,
  first_activated_at TIMESTAMP WITH TIME ZONE,
  warranty_start_date DATE,
  warranty_expiry DATE,
  warranty_period INTEGER, -- 保修期（月）
  current_status VARCHAR(50) DEFAULT 'manufactured', -- manufactured, activated, in_repair, transferred, recycled
  last_event_at TIMESTAMP WITH TIME ZONE,
  last_event_type VARCHAR(50),
  total_repair_count INTEGER DEFAULT 0,
  total_part_replacement_count INTEGER DEFAULT 0,
  total_transfer_count INTEGER DEFAULT 0,
  current_location VARCHAR(255),
  owner_info JSONB, -- 当前所有者信息
  maintenance_history JSONB, -- 维护历史摘要
  specifications JSONB, -- 设备规格参数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_profiles_qrcode_id ON device_profiles(qrcode_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_status ON device_profiles(current_status);
CREATE INDEX IF NOT EXISTS idx_device_profiles_model ON device_profiles(product_model);
CREATE INDEX IF NOT EXISTS idx_device_profiles_brand ON device_profiles(brand_name);
CREATE INDEX IF NOT EXISTS idx_device_profiles_last_event ON device_profiles(last_event_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_profiles_warranty_expiry ON device_profiles(warranty_expiry);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_device_profiles_status_model ON device_profiles(current_status, product_model);
CREATE INDEX IF NOT EXISTS idx_device_profiles_brand_model ON device_profiles(brand_name, product_model);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_device_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为设备档案表添加触发器
CREATE TRIGGER update_device_profiles_updated_at 
    BEFORE UPDATE ON device_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_device_profiles_updated_at_column();

-- ====================================================================
-- 第四部分：约束和检查
-- ====================================================================

-- 添加状态约束
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_current_status CHECK (
  current_status IN (
    'manufactured',     -- 已制造
    'activated',        -- 已激活
    'in_repair',        -- 维修中
    'active',           -- 正常使用
    'transferred',      -- 已转移
    'recycled',         -- 已回收
    'archived'          -- 已归档
  )
);

-- 添加保修期检查约束
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_warranty_period CHECK (
  warranty_period IS NULL OR warranty_period > 0
);

-- 添加统计计数检查约束
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_repair_count CHECK (total_repair_count >= 0);
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_part_replacement_count CHECK (total_part_replacement_count >= 0);
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_transfer_count CHECK (total_transfer_count >= 0);

-- ====================================================================
-- 第五部分：表注释
-- ====================================================================

-- 添加表和列注释
COMMENT ON TABLE device_profiles IS '设备档案主表';
COMMENT ON COLUMN device_profiles.qrcode_id IS '关联的二维码ID';
COMMENT ON COLUMN device_profiles.product_model IS '产品型号';
COMMENT ON COLUMN device_profiles.product_category IS '产品类别';
COMMENT ON COLUMN device_profiles.brand_name IS '品牌名称';
COMMENT ON COLUMN device_profiles.serial_number IS '序列号';
COMMENT ON COLUMN device_profiles.manufacturing_date IS '制造日期';
COMMENT ON COLUMN device_profiles.first_activated_at IS '首次激活时间';
COMMENT ON COLUMN device_profiles.warranty_start_date IS '保修开始日期';
COMMENT ON COLUMN device_profiles.warranty_expiry IS '保修结束日期';
COMMENT ON COLUMN device_profiles.warranty_period IS '保修期（月）';
COMMENT ON COLUMN device_profiles.current_status IS '当前状态：manufactured,activated,in_repair,active,transferred,recycled,archived';
COMMENT ON COLUMN device_profiles.last_event_at IS '最后事件时间';
COMMENT ON COLUMN device_profiles.last_event_type IS '最后事件类型';
COMMENT ON COLUMN device_profiles.total_repair_count IS '总维修次数';
COMMENT ON COLUMN device_profiles.total_part_replacement_count IS '总配件更换次数';
COMMENT ON COLUMN device_profiles.total_transfer_count IS '总转移次数';
COMMENT ON COLUMN device_profiles.current_location IS '当前位置';
COMMENT ON COLUMN device_profiles.owner_info IS '当前所有者信息(JSON)';
COMMENT ON COLUMN device_profiles.maintenance_history IS '维护历史摘要(JSON)';
COMMENT ON COLUMN device_profiles.specifications IS '设备规格参数(JSON)';

-- ====================================================================
-- 第六部分：视图和函数
-- ====================================================================

-- 创建设备保修状态视图
CREATE OR REPLACE VIEW device_warranty_status AS
SELECT 
    dp.id,
    dp.qrcode_id,
    dp.product_model,
    dp.brand_name,
    dp.warranty_start_date,
    dp.warranty_expiry,
    dp.warranty_period,
    CASE 
        WHEN dp.warranty_expiry IS NULL THEN '无保修信息'
        WHEN NOW() <= dp.warranty_expiry THEN '在保'
        ELSE '已过保'
    END as warranty_status,
    CASE 
        WHEN dp.warranty_expiry IS NOT NULL THEN 
            GREATEST(0, DATE_PART('day', dp.warranty_expiry - NOW()::date))
        ELSE NULL
    END as remaining_days
FROM device_profiles dp
ORDER BY dp.warranty_expiry;

COMMENT ON VIEW device_warranty_status IS '设备保修状态视图';

-- 创建设备统计概览视图
CREATE OR REPLACE VIEW device_statistics_overview AS
SELECT 
    dp.current_status,
    COUNT(*) as device_count,
    AVG(dp.total_repair_count) as avg_repair_count,
    AVG(dp.total_part_replacement_count) as avg_part_replacement_count
FROM device_profiles dp
GROUP BY dp.current_status
ORDER BY device_count DESC;

COMMENT ON VIEW device_statistics_overview IS '设备统计概览视图';

-- ====================================================================
-- 第七部分：初始化示例数据（可选）
-- ====================================================================

-- 插入示例设备档案数据（仅用于测试）
-- 注意：实际使用时需要根据真实的产品二维码数据插入
/*
INSERT INTO device_profiles (
    qrcode_id,
    product_model,
    product_category,
    brand_name,
    serial_number,
    manufacturing_date,
    warranty_period,
    current_status,
    specifications
) VALUES 
    ('qr_test_device_001', 'iPhone 14 Pro', '智能手机', 'Apple', 'SN123456789', '2026-01-15', 12, 'manufactured', '{"storage": "256GB", "color": "Deep Purple"}'),
    ('qr_test_device_002', 'Galaxy S23', '智能手机', 'Samsung', 'SN987654321', '2026-01-20', 12, 'activated', '{"storage": "128GB", "color": "Phantom Black"}')
ON CONFLICT (qrcode_id) DO NOTHING;
*/