-- 扩展入库预报表结构
-- WMS-203 入库预报管理功能增强

-- 扩展现有的wms_inbound_notices表
ALTER TABLE wms_inbound_notices 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS forecast_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- 创建预报单状态变更历史表
CREATE TABLE IF NOT EXISTS wms_inbound_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES wms_inbound_notices(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建预报单通知记录表
CREATE TABLE IF NOT EXISTS wms_inbound_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES wms_inbound_notices(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL, -- 'created', 'status_changed', 'reminder'
    recipient_email VARCHAR(255),
    subject VARCHAR(255),
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为新增字段创建索引
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_created_by ON wms_inbound_notices(created_by);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_brand_id ON wms_inbound_notices(brand_id);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_forecast_number ON wms_inbound_notices(forecast_number);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_actual_arrival ON wms_inbound_notices(actual_arrival);

-- 为历史表创建索引
CREATE INDEX IF NOT EXISTS idx_wms_inbound_status_history_notice ON wms_inbound_status_history(notice_id);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_status_history_changed_by ON wms_inbound_status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_status_history_created_at ON wms_inbound_status_history(created_at);

-- 为通知表创建索引
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notifications_notice ON wms_inbound_notifications(notice_id);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notifications_type ON wms_inbound_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notifications_status ON wms_inbound_notifications(status);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notifications_sent_at ON wms_inbound_notifications(sent_at);

-- 添加RLS策略
ALTER TABLE wms_inbound_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_inbound_notifications ENABLE ROW LEVEL SECURITY;

-- 状态历史表RLS策略
CREATE POLICY "授权用户可以查看状态历史" ON wms_inbound_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager', 'purchaser')
        )
    );

CREATE POLICY "系统可以管理状态历史" ON wms_inbound_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'system')
        )
    );

-- 通知记录表RLS策略
CREATE POLICY "授权用户可以查看通知记录" ON wms_inbound_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager', 'purchaser')
        )
    );

CREATE POLICY "系统可以管理通知记录" ON wms_inbound_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'system')
        )
    );

-- 更新现有数据，为已有的预报单生成预报单号
UPDATE wms_inbound_notices 
SET forecast_number = 'INF' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE forecast_number IS NULL;

-- 创建触发器函数来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_wms_inbound_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为wms_inbound_notices表添加更新时间触发器
DROP TRIGGER IF EXISTS update_wms_inbound_notices_updated_at ON wms_inbound_notices;
CREATE TRIGGER update_wms_inbound_notices_updated_at 
    BEFORE UPDATE ON wms_inbound_notices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_wms_inbound_notices_updated_at();

-- 创建视图：预报单完整信息
CREATE OR REPLACE VIEW wms_inbound_forecast_view AS
SELECT 
    n.id,
    n.forecast_number,
    n.connection_id,
    c.name as warehouse_name,
    c.warehouse_id,
    n.supplier_name,
    n.supplier_contact,
    n.supplier_address,
    n.expected_arrival,
    n.actual_arrival,
    n.status,
    n.remarks,
    n.created_by,
    n.brand_id,
    n.attachments,
    n.created_at,
    n.updated_at,
    -- 统计信息
    COUNT(i.id) as item_count,
    SUM(i.quantity) as total_forecasted_quantity,
    SUM(i.received_quantity) as total_received_quantity,
    -- 状态中文描述
    CASE n.status
        WHEN 'pending' THEN '预报中'
        WHEN 'confirmed' THEN '已确认'
        WHEN 'received' THEN '已收货'
        WHEN 'cancelled' THEN '已取消'
        ELSE n.status
    END as status_display
FROM wms_inbound_notices n
LEFT JOIN wms_connections c ON n.connection_id = c.id
LEFT JOIN wms_inbound_items i ON n.id = i.notice_id
GROUP BY 
    n.id, n.forecast_number, n.connection_id, c.name, c.warehouse_id,
    n.supplier_name, n.supplier_contact, n.supplier_address,
    n.expected_arrival, n.actual_arrival, n.status, n.remarks,
    n.created_by, n.brand_id, n.attachments, n.created_at, n.updated_at;

-- 创建视图：预报单状态统计
CREATE OR REPLACE VIEW wms_inbound_status_stats AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_count,
    AVG(EXTRACT(EPOCH FROM (actual_arrival - expected_arrival))/3600) as avg_delay_hours
FROM wms_inbound_notices
WHERE status IN ('pending', 'confirmed', 'received', 'cancelled')
GROUP BY status;

-- 插入示例预报单数据
INSERT INTO wms_inbound_notices (
    forecast_number,
    connection_id,
    expected_arrival,
    supplier_name,
    supplier_contact,
    supplier_address,
    status,
    remarks,
    created_by
) 
SELECT 
    'INF' || TO_CHAR(NOW() + (ordinality - 1) * INTERVAL '1 day', 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0'),
    c.id,
    NOW() + (ordinality - 1) * INTERVAL '3 days',
    '示例供应商' || ordinality,
    '联系人' || ordinality || ' 1380013800' || ordinality,
    '示例地址' || ordinality,
    CASE ordinality % 4
        WHEN 1 THEN 'pending'
        WHEN 2 THEN 'confirmed'
        WHEN 3 THEN 'received'
        ELSE 'cancelled'
    END,
    '测试预报单' || ordinality,
    '00000000-0000-0000-0000-000000000000'::UUID
FROM wms_connections c
CROSS JOIN generate_series(1, 5) WITH ORDINALITY
WHERE c.is_active = true
ON CONFLICT DO NOTHING;

-- 为示例预报单插入明细数据
INSERT INTO wms_inbound_items (
    notice_id,
    wms_sku,
    quantity,
    unit_weight,
    dimensions
)
SELECT 
    n.id,
    'TEST-SKU-' || LPAD(FLOOR(RANDOM() * 100)::TEXT, 3, '0'),
    FLOOR(RANDOM() * 1000) + 100,
    ROUND(RANDOM() * 10, 3),
    jsonb_build_object(
        'length', ROUND(RANDOM() * 50 + 10, 1),
        'width', ROUND(RANDOM() * 30 + 5, 1),
        'height', ROUND(RANDOM() * 20 + 2, 1)
    )
FROM wms_inbound_notices n
CROSS JOIN generate_series(1, 3)
WHERE n.forecast_number LIKE 'INF%'
ON CONFLICT DO NOTHING;