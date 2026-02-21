-- 库存准确性监控相关表结构

-- 库存准确性报告表
CREATE TABLE IF NOT EXISTS inventory_accuracy_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(100) UNIQUE NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    accuracy_rate DECIMAL(5,2) NOT NULL, -- 准确率百分比
    total_items INTEGER NOT NULL,
    accurate_items INTEGER NOT NULL,
    discrepancy_items INTEGER NOT NULL,
    average_discrepancy DECIMAL(5,2) NOT NULL, -- 平均差异百分比
    discrepancies JSONB, -- 差异详情
    recommendations TEXT[], -- 改进建议
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 库存盘点记录表
CREATE TABLE IF NOT EXISTS inventory_physical_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    wms_sku VARCHAR(100) NOT NULL,
    physical_count INTEGER NOT NULL,
    system_count INTEGER NOT NULL,
    difference INTEGER NOT NULL,
    difference_percentage DECIMAL(5,2) NOT NULL,
    counted_by VARCHAR(100) NOT NULL,
    counted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 库存差异调整记录表
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES wms_connections(id) ON DELETE CASCADE,
    wms_sku VARCHAR(100) NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'correction')),
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    adjusted_quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    adjusted_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 库存准确性配置表
CREATE TABLE IF NOT EXISTS inventory_accuracy_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_accuracy_reports_period ON inventory_accuracy_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_accuracy_reports_created ON inventory_accuracy_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_accuracy_reports_rate ON inventory_accuracy_reports(accuracy_rate);

CREATE INDEX IF NOT EXISTS idx_physical_counts_connection ON inventory_physical_counts(connection_id);
CREATE INDEX IF NOT EXISTS idx_physical_counts_sku ON inventory_physical_counts(wms_sku);
CREATE INDEX IF NOT EXISTS idx_physical_counts_date ON inventory_physical_counts(counted_at);

CREATE INDEX IF NOT EXISTS idx_adjustments_connection ON inventory_adjustments(connection_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_sku ON inventory_adjustments(wms_sku);
CREATE INDEX IF NOT EXISTS idx_adjustments_date ON inventory_adjustments(adjustment_date);

CREATE INDEX IF NOT EXISTS idx_accuracy_config_key ON inventory_accuracy_config(config_key);

-- RLS策略
ALTER TABLE inventory_accuracy_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_physical_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_accuracy_config ENABLE ROW LEVEL SECURITY;

-- 准确性报告表RLS策略
CREATE POLICY "授权用户可以查看准确性报告" ON inventory_accuracy_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

CREATE POLICY "授权用户可以创建准确性报告" ON inventory_accuracy_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

-- 物理盘点表RLS策略
CREATE POLICY "授权用户可以查看盘点记录" ON inventory_physical_counts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

CREATE POLICY "授权用户可以创建盘点记录" ON inventory_physical_counts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

-- 库存调整表RLS策略
CREATE POLICY "授权用户可以查看调整记录" ON inventory_adjustments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

CREATE POLICY "授权用户可以创建调整记录" ON inventory_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'warehouse_manager')
        )
    );

-- 配置表RLS策略
CREATE POLICY "授权用户可以查看配置" ON inventory_accuracy_config
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "管理员可以管理配置" ON inventory_accuracy_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 初始化默认配置
INSERT INTO inventory_accuracy_config (config_key, config_value, description, updated_by) VALUES
(
    'accuracy_thresholds',
    '{"target_accuracy": 99.0, "alert_threshold": 5, "auto_adjust_threshold": 10}'::jsonb,
    '库存准确性阈值配置',
    'system'
),
(
    'monitoring_schedule',
    '{"frequency": "daily", "check_time": "02:00"}'::jsonb,
    '监控计划配置',
    'system'
),
(
    'notification_settings',
    '{"channels": ["email", "system"], "recipients": ["admin@company.com"]}'::jsonb,
    '通知设置',
    'system'
)
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- 创建视图：库存差异分析
CREATE OR REPLACE VIEW inventory_discrepancy_analysis AS
SELECT 
    pc.connection_id,
    c.name as warehouse_name,
    pc.wms_sku,
    p.product_name,
    pc.physical_count,
    pc.system_count,
    pc.difference,
    pc.difference_percentage,
    pc.counted_at,
    pc.notes,
    CASE 
        WHEN pc.difference_percentage <= 2 THEN '轻微差异'
        WHEN pc.difference_percentage <= 5 THEN '中等差异'
        WHEN pc.difference_percentage <= 10 THEN '较大差异'
        ELSE '严重差异'
    END as discrepancy_level,
    ABS(pc.difference) * 100.0 / NULLIF(pc.system_count, 0) as actual_percentage_diff
FROM inventory_physical_counts pc
JOIN wms_connections c ON pc.connection_id = c.id
LEFT JOIN wms_inventory_mapping p ON pc.connection_id = p.connection_id AND pc.wms_sku = p.wms_sku
WHERE pc.counted_at >= NOW() - INTERVAL '30 days';

-- 创建视图：月度准确性趋势
CREATE OR REPLACE VIEW monthly_accuracy_trend AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    AVG(accuracy_rate) as avg_accuracy_rate,
    COUNT(*) as report_count,
    MIN(accuracy_rate) as min_accuracy_rate,
    MAX(accuracy_rate) as max_accuracy_rate
FROM inventory_accuracy_reports
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 创建视图：高差异商品监控
CREATE OR REPLACE VIEW high_discrepancy_items AS
SELECT 
    da.warehouse_name,
    da.wms_sku,
    da.product_name,
    COUNT(*) as discrepancy_count,
    AVG(da.difference_percentage) as avg_discrepancy,
    MAX(da.counted_at) as last_discrepancy_date
FROM inventory_discrepancy_analysis da
WHERE da.discrepancy_level IN ('较大差异', '严重差异')
GROUP BY da.warehouse_name, da.wms_sku, da.product_name
HAVING COUNT(*) >= 2
ORDER BY avg_discrepancy DESC;