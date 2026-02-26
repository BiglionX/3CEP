-- 批量二维码系统数据库表创建脚本
-- 执行此脚本以启用批量二维码生成功能

-- 1. 创建批次主表
CREATE TABLE IF NOT EXISTS qr_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) UNIQUE NOT NULL,
  product_model VARCHAR(100) NOT NULL,
  product_category VARCHAR(50) NOT NULL,
  brand_id UUID,
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  generated_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  config JSONB NOT NULL DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建二维码明细表
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) REFERENCES qr_batches(batch_id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  qr_content TEXT NOT NULL,
  qr_image_base64 TEXT,
  serial_number VARCHAR(20) NOT NULL,
  format VARCHAR(10) DEFAULT 'png',
  size INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  scanned_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_qr_batches_status ON qr_batches(status);
CREATE INDEX IF NOT EXISTS idx_qr_batches_product_model ON qr_batches(product_model);
CREATE INDEX IF NOT EXISTS idx_qr_batches_created_at ON qr_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON qr_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_serial_number ON qr_codes(serial_number);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- 4. 创建复合索引
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_serial ON qr_codes(batch_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_qr_batches_model_status ON qr_batches(product_model, status);

-- 5. 创建自动更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为表添加更新触发器
CREATE TRIGGER update_qr_batches_updated_at 
    BEFORE UPDATE ON qr_batches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
    BEFORE UPDATE ON qr_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 创建自动更新批次计数的触发器函数
CREATE OR REPLACE FUNCTION update_batch_generated_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE qr_batches 
        SET generated_count = generated_count + 1,
            updated_at = NOW()
        WHERE batch_id = NEW.batch_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE qr_batches 
        SET generated_count = generated_count - 1,
            updated_at = NOW()
        WHERE batch_id = OLD.batch_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 8. 添加计数更新触发器
CREATE TRIGGER update_batch_count_after_qr_insert
    AFTER INSERT OR DELETE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_generated_count();

-- 9. 创建有用的视图
CREATE OR REPLACE VIEW qr_batch_statistics AS
SELECT 
    b.id,
    b.batch_id,
    b.product_model,
    b.product_category,
    b.product_name,
    b.quantity,
    b.generated_count,
    b.status,
    b.config,
    b.created_at,
    b.completed_at,
    ROUND(COALESCE(b.generated_count::DECIMAL / NULLIF(b.quantity, 0) * 100, 0), 2) as progress_percent
FROM qr_batches b;

-- 10. 启用行级安全（如果需要）
-- ALTER TABLE qr_batches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 11. 插入测试数据（可选）
-- INSERT INTO qr_batches (batch_id, product_model, product_category, brand_id, product_name, quantity, status, config)
-- VALUES 
-- ('batch_test_001', 'TEST-MODEL-001', 'electronics', NULL, '测试产品', 10, 'pending', '{"format": "png", "size": 300}');

-- 验证表创建成功
SELECT 'Table creation completed successfully!' as message;
SELECT table_name FROM information_schema.tables WHERE table_name IN ('qr_batches', 'qr_codes');