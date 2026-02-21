-- 设备生命周期事件表
-- Migration: 024_create_device_lifecycle_events.sql
-- 创建时间: 2026-02-20
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：设备生命周期事件表
-- ====================================================================

-- 设备生命周期事件表
CREATE TABLE IF NOT EXISTS device_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_qrcode_id VARCHAR(100) NOT NULL REFERENCES product_qrcodes(qr_code_id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- manufactured, activated, repaired, part_replaced, transferred, recycled
  event_subtype VARCHAR(50), -- 具体子类型，如维修类型、更换配件类型等
  event_data JSONB, -- 事件详情数据
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location VARCHAR(255), -- 事件发生地点
  notes TEXT, -- 备注信息
  metadata JSONB, -- 元数据，如操作人员、联系方式等
  is_verified BOOLEAN DEFAULT false, -- 是否已验证
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_qrcode_id ON device_lifecycle_events(device_qrcode_id);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_event_type ON device_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_timestamp ON device_lifecycle_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_created_by ON device_lifecycle_events(created_by);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_verified ON device_lifecycle_events(is_verified);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_qrcode_type ON device_lifecycle_events(device_qrcode_id, event_type);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_type_timestamp ON device_lifecycle_events(event_type, event_timestamp DESC);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_device_lifecycle_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为设备生命周期事件表添加触发器
CREATE TRIGGER update_device_lifecycle_events_updated_at 
    BEFORE UPDATE ON device_lifecycle_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_device_lifecycle_updated_at_column();

-- ====================================================================
-- 第四部分：初始化数据和约束
-- ====================================================================

-- 添加事件类型约束
ALTER TABLE device_lifecycle_events 
ADD CONSTRAINT chk_event_type CHECK (
  event_type IN (
    'manufactured',     -- 出厂
    'activated',        -- 激活
    'repaired',         -- 维修
    'part_replaced',    -- 更换配件
    'transferred',      -- 转移
    'recycled',         -- 回收
    'inspected',        -- 检查
    'maintained',       -- 保养
    'upgraded'          -- 升级
  )
);

-- 添加事件子类型约束示例
ALTER TABLE device_lifecycle_events 
ADD CONSTRAINT chk_repair_subtype CHECK (
  event_type != 'repaired' OR 
  event_subtype IS NULL OR
  event_subtype IN (
    'screen_replacement',   -- 屏幕更换
    'battery_replacement',  -- 电池更换
    'water_damage',         -- 进水维修
    'hardware_fault',       -- 硬件故障
    'software_issue',       -- 软件问题
    'other'                 -- 其他
  )
);

-- ====================================================================
-- 第五部分：表注释
-- ====================================================================

-- 添加表和列注释
COMMENT ON TABLE device_lifecycle_events IS '设备生命周期事件记录表';
COMMENT ON COLUMN device_lifecycle_events.device_qrcode_id IS '关联的设备二维码ID';
COMMENT ON COLUMN device_lifecycle_events.event_type IS '事件类型：manufactured,activated,repaired,part_replaced,transferred,recycled,inspected,maintained,upgraded';
COMMENT ON COLUMN device_lifecycle_events.event_subtype IS '事件子类型，如具体的维修类型或配件类型';
COMMENT ON COLUMN device_lifecycle_events.event_data IS '事件详细数据(JSON格式)';
COMMENT ON COLUMN device_lifecycle_events.event_timestamp IS '事件发生时间';
COMMENT ON COLUMN device_lifecycle_events.created_by IS '事件创建者';
COMMENT ON COLUMN device_lifecycle_events.location IS '事件发生地点';
COMMENT ON COLUMN device_lifecycle_events.notes IS '事件备注信息';
COMMENT ON COLUMN device_lifecycle_events.metadata IS '事件元数据';
COMMENT ON COLUMN device_lifecycle_events.is_verified IS '事件是否已验证';
COMMENT ON COLUMN device_lifecycle_events.verified_by IS '验证人';
COMMENT ON COLUMN device_lifecycle_events.verified_at IS '验证时间';

-- ====================================================================
-- 第六部分：视图创建（可选）
-- ====================================================================

-- 创建设备生命周期概览视图
CREATE OR REPLACE VIEW device_lifecycle_overview AS
SELECT 
    dle.id,
    dle.device_qrcode_id,
    dle.event_type,
    dle.event_subtype,
    dle.event_timestamp,
    dle.location,
    dle.notes,
    dle.is_verified,
    dle.created_at,
    pq.product_id,
    p.name as product_name,
    p.model as product_model,
    b.name as brand_name
FROM device_lifecycle_events dle
JOIN product_qrcodes pq ON dle.device_qrcode_id = pq.qr_code_id
JOIN products p ON pq.product_id = p.id
JOIN brands b ON p.brand_id = b.id
ORDER BY dle.event_timestamp DESC;

COMMENT ON VIEW device_lifecycle_overview IS '设备生命周期事件概览视图';