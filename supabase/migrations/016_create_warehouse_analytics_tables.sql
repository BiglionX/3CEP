-- 创建仓库管理和运营分析相关表
-- WMS效能分析看板所需的基础数据表

-- 仓库主表
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('domestic', 'overseas', 'virtual', 'transit')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    
    -- 位置信息
    location JSONB NOT NULL, -- {country, countryCode, city, province, district, address, postalCode, coordinates: {lat, lng}}
    
    -- 联系信息
    contact_info JSONB NOT NULL, -- {manager, phone, email, emergencyContact}
    
    -- 运营信息
    operational_info JSONB NOT NULL, -- {timezone, workingHours, holidays, capacity, currentOccupancy, temperatureControlled, humidityControlled}
    
    -- 物流信息
    logistics_info JSONB NOT NULL, -- {providers, shippingZones, deliveryTime: {domestic, international}}
    
    -- 集成信息
    integration_info JSONB NOT NULL, -- {wmsProvider, wmsApiEndpoint, apiKey, lastSyncedAt, syncStatus, syncFrequency}
    
    -- 成本结构
    cost_structure JSONB NOT NULL, -- {storageFee, handlingFee, insuranceRate}
    
    -- 性能指标
    performance_metrics JSONB NOT NULL, -- {accuracyRate, onTimeRate, damageRate, lastUpdated}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 仓库运营操作记录表
CREATE TABLE IF NOT EXISTS warehouse_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('inbound', 'outbound', 'transfer', 'adjustment')),
    operation_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- 时间信息
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time INTEGER, -- 处理时间(分钟)
    
    -- 数量信息
    item_count INTEGER NOT NULL DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    
    -- 时效信息
    pick_time INTEGER, -- 拣货时间(分钟)
    pack_time INTEGER,  -- 打包时间(分钟)
    ship_time INTEGER,  -- 发货时间(分钟)
    
    -- 状态和质量
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'exception', 'cancelled')),
    accuracy BOOLEAN DEFAULT true,
    exception_reason TEXT,
    
    -- 关联信息
    reference_number VARCHAR(100), -- 关联单号
    operator_id UUID, -- 操作员ID
    
    -- 成本信息
    cost DECIMAL(10,2) DEFAULT 0,
    
    INDEX idx_warehouse_operations_warehouse ON warehouse_operations(warehouse_id),
    INDEX idx_warehouse_operations_type ON warehouse_operations(operation_type),
    INDEX idx_warehouse_operations_created ON warehouse_operations(created_at),
    INDEX idx_warehouse_operations_status ON warehouse_operations(status)
);

-- 仓库库存汇总表
CREATE TABLE IF NOT EXISTS warehouse_inventory_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    
    -- 库存价值
    total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    avg_item_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- 库存周转
    turnover_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
    inventory_days INTEGER NOT NULL DEFAULT 0,
    
    -- 库存质量
    accuracy_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    utilization_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    obsolescence_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- 安全库存
    safety_stock_compliance DECIMAL(5,2) NOT NULL DEFAULT 0,
    stockout_items INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(warehouse_id, report_date),
    INDEX idx_inventory_summary_warehouse ON warehouse_inventory_summary(warehouse_id),
    INDEX idx_inventory_summary_date ON warehouse_inventory_summary(report_date)
);

-- 仓库成本分析表
CREATE TABLE IF NOT EXISTS warehouse_cost_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    analysis_period DATE NOT NULL, -- 分析月份
    
    -- 成本构成
    storage_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    equipment_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    utilities_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(13,2) NOT NULL DEFAULT 0,
    
    -- 作业量
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_shipments INTEGER NOT NULL DEFAULT 0,
    total_items_handled INTEGER NOT NULL DEFAULT 0,
    
    -- 单位成本
    cost_per_order DECIMAL(8,2) NOT NULL DEFAULT 0,
    cost_per_shipment DECIMAL(8,2) NOT NULL DEFAULT 0,
    cost_per_item DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(warehouse_id, analysis_period),
    INDEX idx_cost_analysis_warehouse ON warehouse_cost_analysis(warehouse_id),
    INDEX idx_cost_analysis_period ON warehouse_cost_analysis(analysis_period)
);

-- 仓库人员效率表
CREATE TABLE IF NOT EXISTS warehouse_labor_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    
    -- 人员配置
    total_staff INTEGER NOT NULL DEFAULT 0,
    active_staff INTEGER NOT NULL DEFAULT 0,
    
    -- 工作时间
    total_work_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    productive_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    -- 效率指标
    orders_processed INTEGER NOT NULL DEFAULT 0,
    items_processed INTEGER NOT NULL DEFAULT 0,
    orders_per_hour DECIMAL(8,2) NOT NULL DEFAULT 0,
    items_per_hour DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    -- 质量指标
    accuracy_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(warehouse_id, report_date),
    INDEX idx_labor_efficiency_warehouse ON warehouse_labor_efficiency(warehouse_id),
    INDEX idx_labor_efficiency_date ON warehouse_labor_efficiency(report_date)
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_warehouse_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at 
    BEFORE UPDATE ON warehouses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_warehouse_updated_at();

CREATE TRIGGER update_inventory_summary_updated_at 
    BEFORE UPDATE ON warehouse_inventory_summary 
    FOR EACH ROW 
    EXECUTE FUNCTION update_warehouse_updated_at();

CREATE TRIGGER update_cost_analysis_updated_at 
    BEFORE UPDATE ON warehouse_cost_analysis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_warehouse_updated_at();

CREATE TRIGGER update_labor_efficiency_updated_at 
    BEFORE UPDATE ON warehouse_labor_efficiency 
    FOR EACH ROW 
    EXECUTE FUNCTION update_warehouse_updated_at();

-- 插入示例仓库数据
INSERT INTO warehouses (
    code, name, type, status,
    location, contact_info, operational_info,
    logistics_info, integration_info, cost_structure, performance_metrics
) VALUES 
(
    'WH-US-LAX-001',
    '美国洛杉矶海外仓',
    'overseas',
    'active',
    '{"country": "美国", "countryCode": "US", "city": "洛杉矶", "province": "加利福尼亚州", "address": "123 Main St", "postalCode": "90001", "coordinates": {"lat": 34.0522, "lng": -118.2437}}',
    '{"manager": "张伟", "phone": "+1-213-1234567", "email": "zhangwei@warehouse.com", "emergencyContact": "+1-213-9876543"}',
    '{"timezone": "America/Los_Angeles", "workingHours": "08:00-18:00", "holidays": [], "capacity": 5000, "currentOccupancy": 3200, "temperatureControlled": true, "humidityControlled": true}',
    '{"providers": ["FedEx", "UPS", "DHL"], "shippingZones": ["北美", "南美"], "deliveryTime": {"domestic": 24, "international": 72}}',
    '{"wmsProvider": "GoodCang", "wmsApiEndpoint": "https://api.goodcang.com/v1", "apiKey": "demo_key", "lastSyncedAt": "2026-02-19T10:00:00Z", "syncStatus": "success", "syncFrequency": 5}',
    '{"storageFee": 0.5, "handlingFee": 2.0, "insuranceRate": 0.3}',
    '{"accuracyRate": 99.2, "onTimeRate": 97.8, "damageRate": 0.3, "lastUpdated": "2026-02-19T10:00:00Z"}'
),
(
    'WH-DE-FRA-001',
    '德国法兰克福海外仓',
    'overseas',
    'active',
    '{"country": "德国", "countryCode": "DE", "city": "法兰克福", "province": "黑森州", "address": "456 Market St", "postalCode": "60311", "coordinates": {"lat": 50.1109, "lng": 8.6821}}',
    '{"manager": "李娜", "phone": "+49-69-12345678", "email": "lina@warehouse.de", "emergencyContact": "+49-69-87654321"}',
    '{"timezone": "Europe/Berlin", "workingHours": "08:00-17:00", "holidays": ["2026-01-01", "2026-12-25"], "capacity": 3000, "currentOccupancy": 2100, "temperatureControlled": false, "humidityControlled": false}',
    '{"providers": ["DHL", "DPD", "Hermes"], "shippingZones": ["欧洲"], "deliveryTime": {"domestic": 24, "international": 48}}',
    '{"wmsProvider": "Custom", "wmsApiEndpoint": "https://wms.germany-warehouse.com/api", "apiKey": "demo_key", "lastSyncedAt": "2026-02-19T09:30:00Z", "syncStatus": "success", "syncFrequency": 10}',
    '{"storageFee": 0.8, "handlingFee": 2.5, "insuranceRate": 0.5}',
    '{"accuracyRate": 98.7, "onTimeRate": 96.5, "damageRate": 0.5, "lastUpdated": "2026-02-19T09:30:00Z"}'
),
(
    'WH-JP-TYO-001',
    '日本东京海外仓',
    'overseas',
    'active',
    '{"country": "日本", "countryCode": "JP", "city": "东京", "province": "东京都", "address": "789 Cherry Ave", "postalCode": "100-0001", "coordinates": {"lat": 35.6762, "lng": 139.6503}}',
    '{"manager": "田中太郎", "phone": "+81-3-1234-5678", "email": "tanaka@warehouse.jp", "emergencyContact": "+81-3-8765-4321"}',
    '{"timezone": "Asia/Tokyo", "workingHours": "09:00-18:00", "holidays": ["2026-01-01", "2026-01-02", "2026-01-03"], "capacity": 2500, "currentOccupancy": 1800, "temperatureControlled": true, "humidityControlled": true}',
    '{"providers": ["Yamato", "Sagawa", "Japan Post"], "shippingZones": ["亚洲"], "deliveryTime": {"domestic": 24, "international": 96}}',
    '{"wmsProvider": "4PX", "wmsApiEndpoint": "https://api.4px.com/jp", "apiKey": "demo_key", "lastSyncedAt": "2026-02-19T18:00:00Z", "syncStatus": "success", "syncFrequency": 15}',
    '{"storageFee": 1.2, "handlingFee": 3.0, "insuranceRate": 0.4}',
    '{"accuracyRate": 99.5, "onTimeRate": 98.2, "damageRate": 0.2, "lastUpdated": "2026-02-19T18:00:00Z"}'
)
ON CONFLICT (code) DO NOTHING;

-- 插入示例运营数据
INSERT INTO warehouse_operations (
    warehouse_id, operation_type, operation_number,
    created_at, completed_at, processing_time,
    item_count, total_value,
    pick_time, pack_time, ship_time,
    status, accuracy
) 
SELECT 
    w.id,
    CASE WHEN random() > 0.5 THEN 'inbound' ELSE 'outbound' END,
    CONCAT(
        CASE WHEN random() > 0.5 THEN 'IN' ELSE 'OUT' END,
        '-', w.code, '-', 
        TO_CHAR(NOW() - (random() * 30 || ' days')::interval, 'YYYYMMDD'),
        '-', LPAD((random() * 1000)::int::text, 4, '0')
    ),
    NOW() - (random() * 30 || ' days')::interval,
    NOW() - (random() * 29 || ' days')::interval,
    (15 + random() * 45)::int,
    (10 + random() * 190)::int,
    (1000 + random() * 9000)::decimal(10,2),
    CASE WHEN random() > 0.5 THEN (5 + random() * 20)::int ELSE NULL END,
    CASE WHEN random() > 0.5 THEN (3 + random() * 12)::int ELSE NULL END,
    CASE WHEN random() > 0.5 THEN (10 + random() * 30)::int ELSE NULL END,
    CASE 
        WHEN random() > 0.95 THEN 'exception'
        WHEN random() > 0.9 THEN 'cancelled'
        ELSE 'completed'
    END,
    random() > 0.02
FROM warehouses w
CROSS JOIN generate_series(1, 50) as gs
ON CONFLICT (operation_number) DO NOTHING;

-- 插入示例库存汇总数据
INSERT INTO warehouse_inventory_summary (
    warehouse_id, report_date,
    total_value, avg_item_value, turnover_rate, inventory_days,
    accuracy_rate, utilization_rate, obsolescence_rate,
    safety_stock_compliance, stockout_items
)
SELECT 
    w.id,
    CURRENT_DATE - (gs.n || ' days')::interval,
    (300000 + random() * 700000)::decimal(12,2),
    (50 + random() * 150)::decimal(8,2),
    (6 + random() * 8)::decimal(5,2),
    (20 + random() * 25)::int,
    (95 + random() * 4.5)::decimal(5,2),
    (70 + random() * 25)::decimal(5,2),
    (1 + random() * 4)::decimal(5,2),
    (85 + random() * 12)::decimal(5,2),
    (random() * 5)::int
FROM warehouses w
CROSS JOIN generate_series(0, 29) as gs(n)
ON CONFLICT (warehouse_id, report_date) DO NOTHING;

-- 插入示例成本分析数据
INSERT INTO warehouse_cost_analysis (
    warehouse_id, analysis_period,
    storage_cost, labor_cost, equipment_cost, utilities_cost, other_cost, total_cost,
    total_orders, total_shipments, total_items_handled,
    cost_per_order, cost_per_shipment, cost_per_item
)
SELECT 
    w.id,
    DATE_TRUNC('month', CURRENT_DATE) - (gs.n || ' months')::interval,
    (15000 + random() * 10000)::decimal(10,2),
    (25000 + random() * 15000)::decimal(10,2),
    (8000 + random() * 5000)::decimal(10,2),
    (3000 + random() * 2000)::decimal(10,2),
    (2000 + random() * 1500)::decimal(10,2),
    0, -- 将在下面更新
    (800 + random() * 400)::int,
    (1200 + random() * 600)::int,
    (25000 + random() * 15000)::int,
    0, 0, 0 -- 将在下面更新
FROM warehouses w
CROSS JOIN generate_series(0, 5) as gs(n);

-- 更新总成本和单位成本
UPDATE warehouse_cost_analysis 
SET 
    total_cost = storage_cost + labor_cost + equipment_cost + utilities_cost + other_cost,
    cost_per_order = CASE WHEN total_orders > 0 THEN total_cost / total_orders ELSE 0 END,
    cost_per_shipment = CASE WHEN total_shipments > 0 THEN total_cost / total_shipments ELSE 0 END,
    cost_per_item = CASE WHEN total_items_handled > 0 THEN total_cost / total_items_handled ELSE 0 END;

-- 插入示例人员效率数据
INSERT INTO warehouse_labor_efficiency (
    warehouse_id, report_date,
    total_staff, active_staff,
    total_work_hours, productive_hours,
    orders_processed, items_processed,
    orders_per_hour, items_per_hour,
    accuracy_rate, overtime_hours
)
SELECT 
    w.id,
    CURRENT_DATE - (gs.n || ' days')::interval,
    (15 + random() * 10)::int,
    (12 + random() * 8)::int,
    ((15 + random() * 10) * 8)::decimal(6,2),
    ((12 + random() * 8) * 7.5)::decimal(6,2),
    (200 + random() * 300)::int,
    (5000 + random() * 7000)::int,
    0, 0, -- 将在下面更新
    (95 + random() * 4.5)::decimal(5,2),
    (random() * 10)::decimal(4,2)
FROM warehouses w
CROSS JOIN generate_series(0, 29) as gs(n)
ON CONFLICT (warehouse_id, report_date) DO NOTHING;

-- 更新效率指标
UPDATE warehouse_labor_efficiency 
SET 
    orders_per_hour = CASE WHEN productive_hours > 0 THEN orders_processed / productive_hours ELSE 0 END,
    items_per_hour = CASE WHEN productive_hours > 0 THEN items_processed / productive_hours ELSE 0 END;