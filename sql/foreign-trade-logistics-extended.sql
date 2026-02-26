-- 物流管理扩展表结构

-- 1. 承运商信息表
CREATE TABLE IF NOT EXISTS foreign_trade_carriers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (
        type IN ('international', 'domestic', 'specialized')
    ),
    country VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    services TEXT[], -- 提供的服务类型
    coverage_areas TEXT[], -- 服务覆盖区域
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'suspended')
    ),
    contract_start DATE,
    contract_end DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 运输路线表
CREATE TABLE IF NOT EXISTS foreign_trade_shipping_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrier_id UUID NOT NULL REFERENCES foreign_trade_carriers(id),
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    transport_mode VARCHAR(20) NOT NULL CHECK (
        transport_mode IN ('sea', 'air', 'land', 'rail', 'multimodal')
    ),
    transit_time INTEGER, -- 运输时间（小时）
    frequency VARCHAR(50), -- 运输频率
    cost_per_kg DECIMAL(10,2),
    min_weight DECIMAL(10,2),
    max_weight DECIMAL(10,2),
    restrictions TEXT,
    schedule JSONB DEFAULT '{}', -- 时间安排
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'seasonal')
    ),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 关税信息表
CREATE TABLE IF NOT EXISTS foreign_trade_customs_duties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hs_code VARCHAR(20) NOT NULL, -- 海关编码
    product_description TEXT NOT NULL,
    country_from VARCHAR(100) NOT NULL,
    country_to VARCHAR(100) NOT NULL,
    duty_rate DECIMAL(5,2), -- 关税率(%)
    vat_rate DECIMAL(5,2), -- 增值税率(%)
    excise_rate DECIMAL(5,2), -- 消费税率(%)
    special_conditions TEXT, -- 特殊条件
    effective_date DATE NOT NULL,
    expiry_date DATE,
    last_updated DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 物流成本表
CREATE TABLE IF NOT EXISTS foreign_trade_logistics_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES foreign_trade_shipments(id) ON DELETE CASCADE,
    cost_type VARCHAR(50) NOT NULL CHECK (
        cost_type IN ('freight', 'insurance', 'customs', 'handling', 'storage', 'other')
    ),
    description VARCHAR(200),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    vendor VARCHAR(200),
    invoice_number VARCHAR(50),
    paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 保险信息表
CREATE TABLE IF NOT EXISTS foreign_trade_insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES foreign_trade_shipments(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) NOT NULL,
    insurer VARCHAR(200) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL CHECK (
        coverage_type IN ('comprehensive', 'basic', 'cargo_only', 'liability')
    ),
    insured_amount DECIMAL(15,2) NOT NULL,
    premium DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    claims_history JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'claimed', 'cancelled')
    ),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 清关记录表
CREATE TABLE IF NOT EXISTS foreign_trade_customs_clearance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES foreign_trade_shipments(id) ON DELETE CASCADE,
    clearance_type VARCHAR(20) NOT NULL CHECK (
        clearance_type IN ('import', 'export')
    ),
    customs_office VARCHAR(200) NOT NULL,
    declaration_number VARCHAR(100),
    broker VARCHAR(200),
    declared_value DECIMAL(15,2),
    duties_paid DECIMAL(12,2) DEFAULT 0.00,
    taxes_paid DECIMAL(12,2) DEFAULT 0.00,
    clearance_date DATE,
    expected_date DATE,
    actual_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'submitted', 'processing', 'cleared', 'rejected', 'held')
    ),
    documents JSONB DEFAULT '[]',
    remarks TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 仓储库存变动记录表
CREATE TABLE IF NOT EXISTS foreign_trade_inventory_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES foreign_trade_inventory(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('inbound', 'outbound', 'adjustment', 'transfer', 'damage')
    ),
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(12,2),
    reference_type VARCHAR(20), -- 'order', 'shipment', 'adjustment'
    reference_id UUID,
    location_from VARCHAR(100), -- 调拨时的来源位置
    location_to VARCHAR(100), -- 调拨时的目标位置
    reason VARCHAR(200),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 仓库作业表
CREATE TABLE IF NOT EXISTS foreign_trade_warehouse_operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    warehouse_id UUID NOT NULL REFERENCES foreign_trade_warehouses(id),
    operation_type VARCHAR(30) NOT NULL CHECK (
        operation_type IN ('receiving', 'putaway', 'picking', 'packing', 'shipping', 'cycle_count')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'in_progress', 'completed', 'cancelled')
    ),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (
        priority IN ('low', 'medium', 'high', 'urgent')
    ),
    assigned_to UUID REFERENCES auth.users(id),
    scheduled_date DATE,
    start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    items JSONB DEFAULT '[]', -- 作业涉及的商品
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_carriers_name ON foreign_trade_carriers(name);
CREATE INDEX IF NOT EXISTS idx_carriers_country ON foreign_trade_carriers(country);
CREATE INDEX IF NOT EXISTS idx_shipping_routes_carrier_id ON foreign_trade_shipping_routes(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipping_routes_origin_dest ON foreign_trade_shipping_routes(origin, destination);
CREATE INDEX IF NOT EXISTS idx_customs_duties_hs_code ON foreign_trade_customs_duties(hs_code);
CREATE INDEX IF NOT EXISTS idx_logistics_costs_shipment_id ON foreign_trade_logistics_costs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_shipment_id ON foreign_trade_insurance_policies(shipment_id);
CREATE INDEX IF NOT EXISTS idx_customs_clearance_shipment_id ON foreign_trade_customs_clearance(shipment_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON foreign_trade_inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_operations_warehouse_id ON foreign_trade_warehouse_operations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_operations_status ON foreign_trade_warehouse_operations(status);

-- 更新时间触发器
CREATE TRIGGER update_carriers_updated_at 
    BEFORE UPDATE ON foreign_trade_carriers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_routes_updated_at 
    BEFORE UPDATE ON foreign_trade_shipping_routes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customs_duties_updated_at 
    BEFORE UPDATE ON foreign_trade_customs_duties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_costs_updated_at 
    BEFORE UPDATE ON foreign_trade_logistics_costs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at 
    BEFORE UPDATE ON foreign_trade_insurance_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customs_clearance_updated_at 
    BEFORE UPDATE ON foreign_trade_customs_clearance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_operations_updated_at 
    BEFORE UPDATE ON foreign_trade_warehouse_operations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE foreign_trade_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_shipping_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_customs_duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_logistics_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_customs_clearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_warehouse_operations ENABLE ROW LEVEL SECURITY;

-- 物流扩展表的RLS策略
CREATE POLICY "Users can view carriers" ON foreign_trade_carriers
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert carriers" ON foreign_trade_carriers
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view shipping routes" ON foreign_trade_shipping_routes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_carriers 
            WHERE foreign_trade_carriers.id = foreign_trade_shipping_routes.carrier_id 
            AND foreign_trade_carriers.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert shipping routes" ON foreign_trade_shipping_routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM foreign_trade_carriers 
            WHERE foreign_trade_carriers.id = foreign_trade_shipping_routes.carrier_id 
            AND foreign_trade_carriers.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view logistics costs" ON foreign_trade_logistics_costs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_shipments 
            WHERE foreign_trade_shipments.id = foreign_trade_logistics_costs.shipment_id 
            AND foreign_trade_shipments.created_by = auth.uid()
        )
    );