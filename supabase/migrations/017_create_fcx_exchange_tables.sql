-- FCX配件兑换模块表结构
-- 创建时间: 2026-02-19
-- 版本: 1.0.0

-- 1. 配件FCX价格表
CREATE TABLE IF NOT EXISTS part_fcx_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  fcx_price DECIMAL(18,8) NOT NULL, -- FCX单价
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(part_id, effective_from)
);

-- 2. FCX兑换订单表
CREATE TABLE IF NOT EXISTS fcx_exchange_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- 订单编号
  repair_shop_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_fcx_cost DECIMAL(18,8) NOT NULL, -- 总FCX消耗
  total_items INTEGER NOT NULL, -- 总商品数量
  warehouse_id UUID REFERENCES warehouses(id), -- 发货仓库
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')
  ),
  estimated_delivery_time INTEGER, -- 预计送达时间(小时)
  actual_delivery_time INTEGER, -- 实际送达时间(小时)
  shipping_address JSONB, -- 收货地址
  logistics_provider VARCHAR(100), -- 物流商
  tracking_number VARCHAR(100), -- 快递单号
  wms_order_id VARCHAR(100), -- WMS系统订单ID
  notes TEXT, -- 备注
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FCX兑换订单详情表
CREATE TABLE IF NOT EXISTS fcx_exchange_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES fcx_exchange_orders(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id),
  quantity INTEGER NOT NULL, -- 数量
  fcx_unit_price DECIMAL(18,8) NOT NULL, -- FCX单价
  subtotal_fcx DECIMAL(18,8) NOT NULL, -- 小计FCX
  warehouse_location VARCHAR(100), -- 仓库位置
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'reserved', 'picked', 'packed', 'shipped', 'delivered', 'cancelled')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 库存预留记录表
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES fcx_exchange_order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL, -- 预留数量
  reservation_type VARCHAR(20) NOT NULL DEFAULT 'fcx_exchange' CHECK (
    reservation_type IN ('fcx_exchange', 'purchase_order', 'maintenance')
  ),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 过期时间
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'used', 'expired', 'cancelled')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FCX交易扩展表（补充现有fcx_transactions）
CREATE TABLE IF NOT EXISTS fcx_exchange_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES fcx_transactions(id) ON DELETE CASCADE, -- 关联基础交易表
  order_id UUID REFERENCES fcx_exchange_orders(id) ON DELETE CASCADE, -- 关联兑换订单
  exchange_type VARCHAR(20) NOT NULL DEFAULT 'equipment' CHECK (
    exchange_type IN ('equipment', 'service', 'reward')
  ),
  related_entities JSONB, -- 关联实体信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_part_fcx_prices_part_id ON part_fcx_prices(part_id);
CREATE INDEX IF NOT EXISTS idx_part_fcx_prices_effective_from ON part_fcx_prices(effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_orders_user_id ON fcx_exchange_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_orders_repair_shop_id ON fcx_exchange_orders(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_orders_status ON fcx_exchange_orders(status);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_orders_created_at ON fcx_exchange_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_order_items_order_id ON fcx_exchange_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_order_items_part_id ON fcx_exchange_order_items(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_part_warehouse ON inventory_reservations(part_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_expires_at ON inventory_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_fcx_exchange_transactions_order_id ON fcx_exchange_transactions(order_id);

-- 创建视图：兑换订单完整信息
CREATE OR REPLACE VIEW fcx_exchange_orders_complete AS
SELECT 
  o.id,
  o.order_number,
  o.repair_shop_id,
  o.user_id,
  o.total_fcx_cost,
  o.total_items,
  o.warehouse_id,
  w.name as warehouse_name,
  o.status,
  o.estimated_delivery_time,
  o.actual_delivery_time,
  o.shipping_address,
  o.logistics_provider,
  o.tracking_number,
  o.notes,
  o.created_at,
  o.updated_at,
  ARRAY_AGG(
    json_build_object(
      'part_id', oi.part_id,
      'part_name', p.name,
      'quantity', oi.quantity,
      'fcx_unit_price', oi.fcx_unit_price,
      'subtotal_fcx', oi.subtotal_fcx,
      'status', oi.status
    )
  ) FILTER (WHERE oi.id IS NOT NULL) as items
FROM fcx_exchange_orders o
LEFT JOIN warehouses w ON o.warehouse_id = w.id
LEFT JOIN fcx_exchange_order_items oi ON o.id = oi.order_id
LEFT JOIN parts p ON oi.part_id = p.id
GROUP BY o.id, w.name;

-- 创建视图：当前有效FCX价格
CREATE OR REPLACE VIEW current_part_fcx_prices AS
SELECT DISTINCT ON (part_id)
  part_id,
  fcx_price,
  effective_from,
  effective_to,
  created_at
FROM part_fcx_prices
WHERE effective_from <= NOW() 
  AND (effective_to IS NULL OR effective_to > NOW())
ORDER BY part_id, effective_from DESC;

-- 添加注释
COMMENT ON TABLE part_fcx_prices IS '配件FCX价格表，记录不同时间段的价格';
COMMENT ON TABLE fcx_exchange_orders IS 'FCX兑换订单表，记录维修店兑换配件的订单';
COMMENT ON TABLE fcx_exchange_order_items IS 'FCX兑换订单详情表，记录订单中的具体商品';
COMMENT ON TABLE inventory_reservations IS '库存预留记录表，防止超卖';
COMMENT ON TABLE fcx_exchange_transactions IS 'FCX兑换交易扩展表';

COMMENT ON COLUMN part_fcx_prices.fcx_price IS 'FCX单价';
COMMENT ON COLUMN fcx_exchange_orders.order_number IS '订单编号，格式：FXE20260219XXXX';
COMMENT ON COLUMN fcx_exchange_orders.total_fcx_cost IS '总FCX消耗金额';
COMMENT ON COLUMN fcx_exchange_orders.status IS '订单状态：pending(待确认), confirmed(已确认), processing(处理中), shipped(已发货), delivered(已送达), cancelled(已取消), failed(失败)';
COMMENT ON COLUMN inventory_reservations.expires_at IS '预留过期时间，默认24小时后过期';
COMMENT ON COLUMN inventory_reservations.status IS '预留状态：active(活跃), used(已使用), expired(已过期), cancelled(已取消)';

-- 启用RLS（行级安全）
ALTER TABLE part_fcx_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_exchange_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_exchange_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_exchange_transactions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 配件价格表：公开读取，管理员可写入
CREATE POLICY "所有人可以查看配件FCX价格" ON part_fcx_prices 
FOR SELECT USING (true);

CREATE POLICY "管理员可以管理配件FCX价格" ON part_fcx_prices 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 兑换订单表：用户只能查看自己的订单
CREATE POLICY "用户可以查看自己的兑换订单" ON fcx_exchange_orders 
FOR SELECT USING (
  user_id = auth.uid() OR repair_shop_id IN (
    SELECT id FROM repair_shops WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "用户可以创建兑换订单" ON fcx_exchange_orders 
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 订单详情表：关联订单可见性
CREATE POLICY "用户可以查看订单详情" ON fcx_exchange_order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM fcx_exchange_orders o 
    WHERE o.id = fcx_exchange_order_items.order_id 
    AND (o.user_id = auth.uid() OR o.repair_shop_id IN (
      SELECT id FROM repair_shops WHERE owner_id = auth.uid()
    ))
  )
);

-- 库存预留表：内部系统使用
CREATE POLICY "系统可以管理库存预留" ON inventory_reservations 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
  )
);

-- 插入初始示例数据
INSERT INTO part_fcx_prices (part_id, fcx_price, effective_from) 
SELECT 
  id,
  ROUND((RANDOM() * 1000 + 100)::numeric, 2), -- 随机价格100-1100 FCX
  NOW()
FROM parts 
WHERE status = 'active'
ON CONFLICT DO NOTHING;