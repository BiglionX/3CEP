-- 进销存AI预测模块数据库迁移脚本
-- 版本: 001
-- 描述: 添加销量预测、补货建议和预测日志相关表结构
-- 注意: 此脚本假设 foreign_trade_inventory 表已存在
--       如果不存在,请先执行 sql/foreign-trade-schema.sql

-- ============================================
-- 检查前置条件 - 如果表不存在则创建最小化版本
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'foreign_trade_inventory') THEN
        RAISE NOTICE '⚠️  foreign_trade_inventory 表不存在,正在创建最小化版本...';

        -- 首先检查依赖的 warehouses 表
        IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'foreign_trade_warehouses') THEN
            CREATE TABLE IF NOT EXISTS foreign_trade_warehouses (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                location VARCHAR(500),
                capacity DECIMAL(12,2) DEFAULT 0.00,
                utilization DECIMAL(5,2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            RAISE NOTICE '   - 已创建 foreign_trade_warehouses 表';
        END IF;

        -- 创建最小化的 inventory 表
        CREATE TABLE IF NOT EXISTS foreign_trade_inventory (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sku VARCHAR(50) NOT NULL,
            product_name VARCHAR(200) NOT NULL,
            category VARCHAR(100),
            warehouse_id UUID REFERENCES foreign_trade_warehouses(id),
            quantity INTEGER NOT NULL DEFAULT 0,
            unit VARCHAR(20) DEFAULT '件',
            status VARCHAR(20) NOT NULL DEFAULT 'normal',
            is_active BOOLEAN DEFAULT true,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '   - 已创建 foreign_trade_inventory 表(最小化版本)';
    ELSE
        RAISE NOTICE '✅ 前置条件检查通过: foreign_trade_inventory 表存在';
    END IF;
END $$;

-- ============================================
-- 1. 扩展现有库存表,添加AI相关字段
-- ============================================
ALTER TABLE IF EXISTS foreign_trade_inventory
ADD COLUMN IF NOT EXISTS safety_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS forecast_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_forecast_date TIMESTAMP WITH TIME ZONE;

-- 为新增字段添加注释
COMMENT ON COLUMN foreign_trade_inventory.safety_stock IS '安全库存阈值';
COMMENT ON COLUMN foreign_trade_inventory.reorder_point IS '再订货点';
COMMENT ON COLUMN foreign_trade_inventory.lead_time_days IS '采购提前期(天)';
COMMENT ON COLUMN foreign_trade_inventory.forecast_enabled IS '是否启用AI预测';
COMMENT ON COLUMN foreign_trade_inventory.last_forecast_date IS '最后预测时间';

-- ============================================
-- 2. 创建销量预测表
-- ============================================
CREATE TABLE IF NOT EXISTS sales_forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_quantity INTEGER NOT NULL,
    lower_bound INTEGER,
    upper_bound INTEGER,
    confidence_level DECIMAL(5,2) DEFAULT 0.95,
    model_version VARCHAR(50) DEFAULT 'prophet-1.1.5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, forecast_date)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_item_id ON sales_forecasts(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_forecast_date ON sales_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_item_date ON sales_forecasts(item_id, forecast_date);

-- 添加表注释
COMMENT ON TABLE sales_forecasts IS '销量预测表 - 存储AI预测的未来销量数据';
COMMENT ON COLUMN sales_forecasts.item_id IS '库存项ID';
COMMENT ON COLUMN sales_forecasts.forecast_date IS '预测日期';
COMMENT ON COLUMN sales_forecasts.predicted_quantity IS '预测销量';
COMMENT ON COLUMN sales_forecasts.lower_bound IS '置信区间下界';
COMMENT ON COLUMN sales_forecasts.upper_bound IS '置信区间上界';
COMMENT ON COLUMN sales_forecasts.confidence_level IS '置信水平(默认95%)';
COMMENT ON COLUMN sales_forecasts.model_version IS '模型版本';

-- ============================================
-- 3. 创建补货建议表
-- ============================================
CREATE TABLE IF NOT EXISTS replenishment_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    suggested_quantity INTEGER NOT NULL,
    reason TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered')),
    forecast_data JSONB,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    purchase_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_replenishment_item_id ON replenishment_suggestions(item_id);
CREATE INDEX IF NOT EXISTS idx_replenishment_status ON replenishment_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_replenishment_priority ON replenishment_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_replenishment_created_at ON replenishment_suggestions(created_at DESC);

-- 添加表注释
COMMENT ON TABLE replenishment_suggestions IS '补货建议表 - AI生成的智能补货建议';
COMMENT ON COLUMN replenishment_suggestions.item_id IS '库存项ID';
COMMENT ON COLUMN replenishment_suggestions.suggested_quantity IS '建议补货数量';
COMMENT ON COLUMN replenishment_suggestions.reason IS '推荐理由说明';
COMMENT ON COLUMN replenishment_suggestions.priority IS '优先级: low/medium/high/urgent';
COMMENT ON COLUMN replenishment_suggestions.status IS '状态: pending/approved/rejected/ordered';
COMMENT ON COLUMN replenishment_suggestions.forecast_data IS '预测数据快照(JSON格式)';
COMMENT ON COLUMN replenishment_suggestions.purchase_order_id IS '关联的采购订单ID';

-- ============================================
-- 4. 创建预测日志表
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_predictions_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL DEFAULT 'sales_forecast',
    input_data_summary JSONB,
    output_summary JSONB,
    execution_time_ms INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'timeout')),
    error_message TEXT,
    triggered_by VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_predictions_log_item_id ON inventory_predictions_log(item_id);
CREATE INDEX IF NOT EXISTS idx_predictions_log_created_at ON inventory_predictions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_log_status ON inventory_predictions_log(status);

-- 添加表注释
COMMENT ON TABLE inventory_predictions_log IS '预测日志表 - 追踪所有预测任务的执行历史';
COMMENT ON COLUMN inventory_predictions_log.prediction_type IS '预测类型: sales_forecast/demand_prediction等';
COMMENT ON COLUMN inventory_predictions_log.input_data_summary IS '输入数据摘要';
COMMENT ON COLUMN inventory_predictions_log.output_summary IS '输出结果摘要';
COMMENT ON COLUMN inventory_predictions_log.execution_time_ms IS '执行时间(毫秒)';
COMMENT ON COLUMN inventory_predictions_log.triggered_by IS '触发方式: scheduled/manual/webhook';

-- ============================================
-- 5. 创建触发器 - 自动更新updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_replenishment_updated_at ON replenishment_suggestions;
CREATE TRIGGER update_replenishment_updated_at
    BEFORE UPDATE ON replenishment_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 创建视图 - 库存健康度概览
-- ============================================
CREATE OR REPLACE VIEW inventory_health_view AS
SELECT
    i.id as item_id,
    i.sku,
    i.product_name,
    i.quantity as current_stock,
    i.safety_stock,
    i.reorder_point,
    CASE
        WHEN i.quantity <= 0 THEN 'out_of_stock'
        WHEN i.quantity <= COALESCE(i.safety_stock, 0) THEN 'critical'
        WHEN i.quantity <= COALESCE(i.reorder_point, 0) THEN 'low'
        WHEN COALESCE(i.reorder_point, 0) > 0 AND i.quantity > i.reorder_point * 2 THEN 'overstock'
        ELSE 'healthy'
    END as stock_status,
    sf.predicted_quantity as next_30d_forecast,
    rs.suggested_quantity as pending_replenishment,
    rs.priority as replenishment_priority,
    i.last_forecast_date
FROM foreign_trade_inventory i
LEFT JOIN LATERAL (
    SELECT predicted_quantity
    FROM sales_forecasts
    WHERE item_id = i.id
    AND forecast_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    ORDER BY forecast_date DESC
    LIMIT 1
) sf ON true
LEFT JOIN LATERAL (
    SELECT suggested_quantity, priority
    FROM replenishment_suggestions
    WHERE item_id = i.id
    AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
) rs ON true
WHERE i.is_active = true OR i.is_active IS NULL;

COMMENT ON VIEW inventory_health_view IS '库存健康度视图 - 综合展示库存状态、预测和补货建议';

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ 进销存AI预测模块数据库迁移完成';
    RAISE NOTICE '   - 已扩展 foreign_trade_inventory 表';
    RAISE NOTICE '   - 已创建 sales_forecasts 表';
    RAISE NOTICE '   - 已创建 replenishment_suggestions 表';
    RAISE NOTICE '   - 已创建 inventory_predictions_log 表';
    RAISE NOTICE '   - 已创建 inventory_health_view 视图';
END $$;
