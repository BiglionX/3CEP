-- 外贸管理系统数据库表结构设计

-- 1. 订单管理表
CREATE TABLE IF NOT EXISTS foreign_trade_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('import', 'export')),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id),
    contract_number VARCHAR(50) NOT NULL,
    product_details JSONB NOT NULL DEFAULT '[]',
    quantity INTEGER NOT NULL DEFAULT 0,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    ),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (
        priority IN ('low', 'medium', 'high')
    ),
    expected_delivery DATE NOT NULL,
    actual_delivery DATE,
    payment_terms VARCHAR(50),
    shipping_method VARCHAR(50),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 合作伙伴管理表
CREATE TABLE IF NOT EXISTS foreign_trade_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('supplier', 'customer')),
    country VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    address TEXT,
    products TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    cooperation_years INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('active', 'inactive', 'pending')
    ),
    annual_volume DECIMAL(15,2),
    payment_terms VARCHAR(50),
    credit_limit DECIMAL(15,2),
    outstanding_balance DECIMAL(15,2) DEFAULT 0.00,
    contract_expiry DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 合同管理表
CREATE TABLE IF NOT EXISTS foreign_trade_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    supplier_id UUID REFERENCES foreign_trade_partners(id),
    customer_id UUID REFERENCES foreign_trade_partners(id),
    type VARCHAR(20) NOT NULL CHECK (
        type IN ('purchase', 'sales', 'service', 'nda')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'pending', 'active', 'expired', 'terminated')
    ),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_terms VARCHAR(100),
    responsible_person VARCHAR(100),
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 发货管理表
CREATE TABLE IF NOT EXISTS foreign_trade_shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES foreign_trade_orders(id),
    carrier VARCHAR(100) NOT NULL,
    transport_mode VARCHAR(10) NOT NULL CHECK (
        transport_mode IN ('sea', 'air', 'land', 'rail')
    ),
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'in_transit', 'customs', 'delivered', 'delayed')
    ),
    planned_departure TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_departure TIMESTAMP WITH TIME ZONE,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    weight DECIMAL(10,2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    packages INTEGER NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    container_number VARCHAR(50),
    vessel_name VARCHAR(100),
    flight_number VARCHAR(20),
    driver_info VARCHAR(200),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 仓储管理表
CREATE TABLE IF NOT EXISTS foreign_trade_warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity DECIMAL(12,2) NOT NULL,
    current_stock DECIMAL(12,2) DEFAULT 0.00,
    utilization DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'maintenance', 'full', 'closed')
    ),
    manager VARCHAR(100) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    last_inventory DATE,
    next_maintenance DATE,
    temperature_controlled BOOLEAN DEFAULT FALSE,
    security_level VARCHAR(20) DEFAULT 'standard' CHECK (
        security_level IN ('basic', 'standard', 'high')
    ),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 库存管理表
CREATE TABLE IF NOT EXISTS foreign_trade_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES foreign_trade_warehouses(id),
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    reserved DECIMAL(12,2) DEFAULT 0.00,
    available DECIMAL(12,2) GENERATED ALWAYS AS (quantity - reserved) STORED,
    unit VARCHAR(20) NOT NULL,
    min_stock DECIMAL(12,2) DEFAULT 0.00,
    max_stock DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (
        status IN ('normal', 'low', 'overstock', 'outofstock')
    ),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 订单时间线表
CREATE TABLE IF NOT EXISTS foreign_trade_order_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES foreign_trade_orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 发货时间线表
CREATE TABLE IF NOT EXISTS foreign_trade_shipment_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES foreign_trade_shipments(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    coordinates JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 订单文档表
CREATE TABLE IF NOT EXISTS foreign_trade_order_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES foreign_trade_orders(id) ON DELETE CASCADE,
    document_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 发货文档表
CREATE TABLE IF NOT EXISTS foreign_trade_shipment_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES foreign_trade_shipments(id) ON DELETE CASCADE,
    document_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_foreign_trade_orders_partner_id ON foreign_trade_orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_orders_status ON foreign_trade_orders(status);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_orders_type ON foreign_trade_orders(type);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_orders_created_at ON foreign_trade_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_orders_order_number ON foreign_trade_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_foreign_trade_partners_type ON foreign_trade_partners(type);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_partners_status ON foreign_trade_partners(status);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_partners_country ON foreign_trade_partners(country);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_partners_name ON foreign_trade_partners(name);

CREATE INDEX IF NOT EXISTS idx_foreign_trade_contracts_supplier_id ON foreign_trade_contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_contracts_customer_id ON foreign_trade_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_contracts_status ON foreign_trade_contracts(status);

CREATE INDEX IF NOT EXISTS idx_foreign_trade_shipments_order_id ON foreign_trade_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_shipments_status ON foreign_trade_shipments(status);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_shipments_tracking_number ON foreign_trade_shipments(tracking_number);

CREATE INDEX IF NOT EXISTS idx_foreign_trade_inventory_warehouse_id ON foreign_trade_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_inventory_sku ON foreign_trade_inventory(sku);
CREATE INDEX IF NOT EXISTS idx_foreign_trade_inventory_status ON foreign_trade_inventory(status);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_foreign_trade_orders_updated_at 
    BEFORE UPDATE ON foreign_trade_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_trade_partners_updated_at 
    BEFORE UPDATE ON foreign_trade_partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_trade_contracts_updated_at 
    BEFORE UPDATE ON foreign_trade_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_trade_shipments_updated_at 
    BEFORE UPDATE ON foreign_trade_shipments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_trade_warehouses_updated_at 
    BEFORE UPDATE ON foreign_trade_warehouses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_trade_inventory_updated_at 
    BEFORE UPDATE ON foreign_trade_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略设置
ALTER TABLE foreign_trade_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_inventory ENABLE ROW LEVEL SECURITY;

-- 基础RLS策略：用户只能访问自己创建的数据
CREATE POLICY "Users can view their own orders" ON foreign_trade_orders
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own orders" ON foreign_trade_orders
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own orders" ON foreign_trade_orders
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own partners" ON foreign_trade_partners
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own partners" ON foreign_trade_partners
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own partners" ON foreign_trade_partners
    FOR UPDATE USING (auth.uid() = created_by);

-- 对于时间线和文档表，允许访问关联的主记录
CREATE POLICY "Users can view order timelines" ON foreign_trade_order_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_orders 
            WHERE foreign_trade_orders.id = foreign_trade_order_timeline.order_id 
            AND foreign_trade_orders.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert order timelines" ON foreign_trade_order_timeline
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM foreign_trade_orders 
            WHERE foreign_trade_orders.id = foreign_trade_order_timeline.order_id 
            AND foreign_trade_orders.created_by = auth.uid()
        )
    );