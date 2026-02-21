-- 采购订单相关表结构

-- 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,  -- 订单编号 PO-20240101-ABC123
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    items JSONB NOT NULL,  -- 采购商品列表 [{product_id, quantity, unit_price, total_price}]
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipping', 'received', 'cancelled')),
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 采购订单状态历史表
CREATE TABLE IF NOT EXISTS purchase_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    status_from VARCHAR(20),
    status_to VARCHAR(20) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 采购申请表（用于内部审批流程）
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,  -- 申请编号 PR-20240101-ABC123
    requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    department VARCHAR(100),
    items JSONB NOT NULL,  -- 申请商品列表
    reason TEXT NOT NULL,  -- 申请原因
    estimated_cost DECIMAL(12,2),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse ON purchase_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number ON purchase_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_purchase_order_status_history_order ON purchase_order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_status_history_created_at ON purchase_order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester ON purchase_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at);

-- RLS策略
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- 采购订单RLS策略
CREATE POLICY "用户可以查看自己的采购订单" ON purchase_orders
    FOR SELECT USING (
        created_by = (SELECT auth.uid()::text)
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "授权用户可以创建采购订单" ON purchase_orders
    FOR INSERT WITH CHECK (
        created_by = (SELECT auth.uid()::text)
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'purchaser')
        )
    );

CREATE POLICY "授权用户可以更新采购订单" ON purchase_orders
    FOR UPDATE USING (
        created_by = (SELECT auth.uid()::text)
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 采购订单状态历史RLS策略
CREATE POLICY "用户可以查看相关订单的状态历史" ON purchase_order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po 
            WHERE po.id = order_id 
            AND (
                po.created_by = (SELECT auth.uid()::text)
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'supply_chain_manager')
                )
            )
        )
    );

-- 采购申请RLS策略
CREATE POLICY "用户可以查看自己的采购申请" ON purchase_requests
    FOR SELECT USING (
        requester_id = auth.uid()
        OR approver_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "用户可以创建采购申请" ON purchase_requests
    FOR INSERT WITH CHECK (
        requester_id = auth.uid()
    );

CREATE POLICY "审批人可以更新采购申请" ON purchase_requests
    FOR UPDATE USING (
        approver_id = auth.uid()
        OR requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at 
    BEFORE UPDATE ON purchase_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化一些示例数据
INSERT INTO purchase_orders (order_number, supplier_id, warehouse_id, items, total_amount, status, expected_delivery_date, created_by) VALUES
('PO-20240115-TEST001', 
 (SELECT id FROM suppliers LIMIT 1), 
 (SELECT id FROM warehouses LIMIT 1),
 '[{"product_id": "test-product-1", "quantity": 100, "unit_price": 25.50, "total_price": 2550.00}]',
 2550.00, 'pending', NOW() + INTERVAL '7 days', 'system'),
('PO-20240115-TEST002', 
 (SELECT id FROM suppliers LIMIT 1), 
 (SELECT id FROM warehouses LIMIT 1),
 '[{"product_id": "test-product-2", "quantity": 50, "unit_price": 18.75, "total_price": 937.50}]',
 937.50, 'confirmed', NOW() + INTERVAL '5 days', 'system')
ON CONFLICT (order_number) DO NOTHING;