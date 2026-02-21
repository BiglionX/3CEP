-- WMS集成系统表结构
-- FixCycle 3.5 海外仓智能管理系统

-- WMS连接配置表
CREATE TABLE IF NOT EXISTS wms_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('goodcang', '4px', 'winit', 'custom')),
    warehouse_id VARCHAR(100) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted TEXT NOT NULL, -- 加密存储
    is_active BOOLEAN DEFAULT true,
    sync_frequency INTEGER DEFAULT 5, -- 同步频率(分钟)
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WMS库存映射表
CREATE TABLE IF NOT EXISTS wms_inventory_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    wms_sku VARCHAR(100) NOT NULL, -- WMS系统中的SKU
    local_product_id UUID, -- 本地产品ID (可为空，用于后续关联)
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100),
    batch_number VARCHAR(100),
    expiry_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(connection_id, wms_sku)
);

-- WMS同步记录表
CREATE TABLE IF NOT EXISTS wms_sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    items_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WMS库存变动历史表
CREATE TABLE IF NOT EXISTS wms_inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_id UUID REFERENCES wms_inventory_mapping(id) ON DELETE CASCADE,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    available_before INTEGER NOT NULL,
    available_after INTEGER NOT NULL,
    reserved_before INTEGER NOT NULL,
    reserved_after INTEGER NOT NULL,
    change_reason VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WMS订单映射表
CREATE TABLE IF NOT EXISTS wms_order_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    wms_order_id VARCHAR(100) NOT NULL,
    local_order_id UUID, -- 本地订单ID
    order_number VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(connection_id, wms_order_id)
);

-- WMS入库预报表
CREATE TABLE IF NOT EXISTS wms_inbound_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    notice_number VARCHAR(100) NOT NULL,
    expected_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(100),
    supplier_address TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'received', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WMS入库预报明细表
CREATE TABLE IF NOT EXISTS wms_inbound_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES wms_inbound_notices(id) ON DELETE CASCADE,
    wms_sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_weight DECIMAL(10,3),
    dimensions JSONB, -- {length, width, height}
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wms_connections_provider ON wms_connections(provider);
CREATE INDEX IF NOT EXISTS idx_wms_connections_is_active ON wms_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_wms_connections_last_synced ON wms_connections(last_synced_at);

CREATE INDEX IF NOT EXISTS idx_wms_inventory_mapping_connection ON wms_inventory_mapping(connection_id);
CREATE INDEX IF NOT EXISTS idx_wms_inventory_mapping_sku ON wms_inventory_mapping(wms_sku);
CREATE INDEX IF NOT EXISTS idx_wms_inventory_mapping_local_product ON wms_inventory_mapping(local_product_id);
CREATE INDEX IF NOT EXISTS idx_wms_inventory_mapping_last_updated ON wms_inventory_mapping(last_updated);

CREATE INDEX IF NOT EXISTS idx_wms_sync_records_connection ON wms_sync_records(connection_id);
CREATE INDEX IF NOT EXISTS idx_wms_sync_records_status ON wms_sync_records(status);
CREATE INDEX IF NOT EXISTS idx_wms_sync_records_start_time ON wms_sync_records(start_time);

CREATE INDEX IF NOT EXISTS idx_wms_inventory_history_mapping ON wms_inventory_history(mapping_id);
CREATE INDEX IF NOT EXISTS idx_wms_inventory_history_changed_at ON wms_inventory_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_wms_order_mapping_connection ON wms_order_mapping(connection_id);
CREATE INDEX IF NOT EXISTS idx_wms_order_mapping_wms_order_id ON wms_order_mapping(wms_order_id);
CREATE INDEX IF NOT EXISTS idx_wms_order_mapping_local_order_id ON wms_order_mapping(local_order_id);
CREATE INDEX IF NOT EXISTS idx_wms_order_mapping_status ON wms_order_mapping(status);

CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_connection ON wms_inbound_notices(connection_id);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_status ON wms_inbound_notices(status);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_notices_expected_arrival ON wms_inbound_notices(expected_arrival);

CREATE INDEX IF NOT EXISTS idx_wms_inbound_items_notice ON wms_inbound_items(notice_id);
CREATE INDEX IF NOT EXISTS idx_wms_inbound_items_sku ON wms_inbound_items(wms_sku);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_wms_connections_updated_at 
    BEFORE UPDATE ON wms_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wms_inventory_mapping_updated_at 
    BEFORE UPDATE ON wms_inventory_mapping 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wms_order_mapping_updated_at 
    BEFORE UPDATE ON wms_order_mapping 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wms_inbound_notices_updated_at 
    BEFORE UPDATE ON wms_inbound_notices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略 (行级安全)
ALTER TABLE wms_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_inventory_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_sync_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_order_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_inbound_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_inbound_items ENABLE ROW LEVEL SECURITY;

-- WMS连接表RLS策略
CREATE POLICY "管理员可以查看所有WMS连接" ON wms_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "管理员可以管理WMS连接" ON wms_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- WMS库存映射表RLS策略
CREATE POLICY "授权用户可以查看WMS库存" ON wms_inventory_mapping
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

CREATE POLICY "授权用户可以更新WMS库存" ON wms_inventory_mapping
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

-- 同步记录表RLS策略
CREATE POLICY "授权用户可以查看同步记录" ON wms_sync_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

-- 订单映射表RLS策略
CREATE POLICY "授权用户可以查看订单映射" ON wms_order_mapping
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager', 'sales')
        )
    );

-- 入库预报表RLS策略
CREATE POLICY "授权用户可以管理入库预报" ON wms_inbound_notices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager', 'purchaser')
        )
    );

CREATE POLICY "授权用户可以查看入库明细" ON wms_inbound_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager', 'purchaser')
        )
    );

-- 初始化示例数据
INSERT INTO wms_connections (
    name, 
    provider, 
    warehouse_id, 
    base_url, 
    client_id, 
    client_secret_encrypted,
    is_active,
    sync_frequency
) VALUES 
(
    '美国洛杉矶仓-谷仓',
    'goodcang',
    'US-LAX',
    'https://api.goodcang.com',
    'demo_client_id',
    'encrypted_demo_secret',
    true,
    5
),
(
    '欧洲英国仓-谷仓',
    'goodcang',
    'UK-LON',
    'https://api.goodcang.com',
    'demo_client_id',
    'encrypted_demo_secret',
    true,
    5
)
ON CONFLICT DO NOTHING;

-- 创建视图：当前库存状态汇总
CREATE OR REPLACE VIEW wms_current_inventory AS
SELECT 
    c.id as connection_id,
    c.name as warehouse_name,
    c.provider,
    c.warehouse_id,
    m.wms_sku,
    m.product_name,
    m.quantity,
    m.available_quantity,
    m.reserved_quantity,
    m.location,
    m.batch_number,
    m.expiry_date,
    m.last_updated,
    ROUND(
        CASE 
            WHEN m.quantity > 0 THEN (m.available_quantity::DECIMAL / m.quantity * 100)
            ELSE 0
        END, 2
    ) as availability_rate
FROM wms_connections c
JOIN wms_inventory_mapping m ON c.id = m.connection_id
WHERE c.is_active = true;

-- 创建视图：同步健康状态
CREATE OR REPLACE VIEW wms_sync_health AS
SELECT 
    c.id as connection_id,
    c.name as warehouse_name,
    c.sync_status,
    c.last_synced_at,
    c.error_message,
    CASE 
        WHEN c.sync_status = 'success' AND c.last_synced_at >= NOW() - INTERVAL '10 minutes' THEN 'healthy'
        WHEN c.sync_status = 'success' AND c.last_synced_at >= NOW() - INTERVAL '1 hour' THEN 'degraded'
        ELSE 'unhealthy'
    END as health_status,
    COUNT(r.id) as recent_sync_count,
    AVG(r.end_time - r.start_time) as avg_sync_duration
FROM wms_connections c
LEFT JOIN wms_sync_records r ON c.id = r.connection_id 
    AND r.start_time >= NOW() - INTERVAL '24 hours'
GROUP BY c.id, c.name, c.sync_status, c.last_synced_at, c.error_message;