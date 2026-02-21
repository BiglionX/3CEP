-- 配件管理模块表结构
-- 创建时间: 2026-02-14
-- 版本: 1.0.0

-- 修改配件表，增加更多字段
ALTER TABLE parts 
ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT '个',
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS specifications JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 1000;

-- 创建配件与设备关联表
CREATE TABLE IF NOT EXISTS part_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  compatibility_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(part_id, device_id)
);

-- 创建配件与故障关联表
CREATE TABLE IF NOT EXISTS part_faults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  fault_id UUID REFERENCES fault_types(id) ON DELETE CASCADE,
  usage_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(part_id, fault_id)
);

-- 创建配件图片表
CREATE TABLE IF NOT EXISTS part_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_key VARCHAR(255),
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建配件库存记录表
CREATE TABLE IF NOT EXISTS part_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- in/out/adjustment
  reason VARCHAR(255),
  reference_number VARCHAR(100),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_part_devices_part_id ON part_devices(part_id);
CREATE INDEX IF NOT EXISTS idx_part_devices_device_id ON part_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_part_faults_part_id ON part_faults(part_id);
CREATE INDEX IF NOT EXISTS idx_part_faults_fault_id ON part_faults(fault_id);
CREATE INDEX IF NOT EXISTS idx_part_images_part_id ON part_images(part_id);
CREATE INDEX IF NOT EXISTS idx_part_images_is_primary ON part_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_part_inventory_part_id ON part_inventory(part_id);
CREATE INDEX IF NOT EXISTS idx_part_inventory_created_at ON part_inventory(created_at);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);

-- 创建视图：配件完整信息
CREATE OR REPLACE VIEW parts_complete_view AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.brand,
  p.model,
  p.part_number,
  p.unit,
  p.description,
  p.image_url,
  p.stock_quantity,
  p.min_stock,
  p.max_stock,
  p.status,
  p.created_at,
  p.updated_at,
  -- 关联的设备信息
  json_agg(DISTINCT jsonb_build_object(
    'id', d.id,
    'brand', d.brand,
    'model', d.model,
    'series', d.series
  )) FILTER (WHERE d.id IS NOT NULL) as compatible_devices,
  -- 关联的故障信息
  json_agg(DISTINCT jsonb_build_object(
    'id', f.id,
    'name', f.name,
    'category', f.category
  )) FILTER (WHERE f.id IS NOT NULL) as related_faults,
  -- 主图片信息
  pi.image_url as primary_image_url
FROM parts p
LEFT JOIN part_devices pd ON p.id = pd.part_id
LEFT JOIN devices d ON pd.device_id = d.id
LEFT JOIN part_faults pf ON p.id = pf.part_id
LEFT JOIN fault_types f ON pf.fault_id = f.id
LEFT JOIN part_images pi ON p.id = pi.part_id AND pi.is_primary = true
WHERE p.status != 'deleted'
GROUP BY p.id, pi.image_url;

-- 添加表注释
COMMENT ON TABLE part_devices IS '配件与设备兼容关系表';
COMMENT ON TABLE part_faults IS '配件与故障对应关系表';
COMMENT ON TABLE part_images IS '配件图片表';
COMMENT ON TABLE part_inventory IS '配件库存变动记录表';

COMMENT ON COLUMN parts.unit IS '计量单位';
COMMENT ON COLUMN parts.part_number IS '配件型号编码';
COMMENT ON COLUMN parts.specifications IS '规格参数JSON';
COMMENT ON COLUMN parts.status IS '状态：active/inactive/deleted';
COMMENT ON COLUMN parts.stock_quantity IS '当前库存数量';
COMMENT ON COLUMN parts.min_stock IS '最小库存预警值';
COMMENT ON COLUMN parts.max_stock IS '最大库存值';

COMMENT ON COLUMN part_devices.compatibility_notes IS '兼容性说明';
COMMENT ON COLUMN part_faults.usage_notes IS '使用说明';
COMMENT ON COLUMN part_images.is_primary IS '是否为主图';
COMMENT ON COLUMN part_inventory.transaction_type IS '交易类型：in(入库)/out(出库)/adjustment(调整)';
COMMENT ON COLUMN part_inventory.reference_number IS '关联单据编号';

-- 启用RLS
ALTER TABLE part_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_faults ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_inventory ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 允许所有人查看
CREATE POLICY "允许查看配件关联设备" ON part_devices FOR SELECT USING (true);
CREATE POLICY "允许查看配件关联故障" ON part_faults FOR SELECT USING (true);
CREATE POLICY "允许查看配件图片" ON part_images FOR SELECT USING (true);

-- 允许认证用户管理
CREATE POLICY "认证用户可管理配件设备关系" ON part_devices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理配件故障关系" ON part_faults FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理配件图片" ON part_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理库存记录" ON part_inventory FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 配件管理表结构创建完成'