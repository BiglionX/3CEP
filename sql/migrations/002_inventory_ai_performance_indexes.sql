-- =====================================================
-- 进销存AI集成模块 - 数据库索引优化脚本
-- 版本: v2.0
-- 日期: 2026-04-08
-- 目标: 提升查询性能，优化P95响应时间 < 100ms
-- =====================================================

-- 1. 库存表索引优化
-- =====================================================

-- 复合索引: SKU (用于唯一性检查和快速查找)
CREATE INDEX IF NOT EXISTS idx_inventory_sku
ON foreign_trade_inventory(sku);

-- 状态索引 (用于状态过滤查询)
CREATE INDEX IF NOT EXISTS idx_inventory_status
ON foreign_trade_inventory(status);

-- 仓库索引 (用于按仓库查询)
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse
ON foreign_trade_inventory(warehouse_id);

-- 更新时间索引 (用于排序和增量同步)
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at
ON foreign_trade_inventory(updated_at DESC);

-- 分类索引 (用于分类统计)
CREATE INDEX IF NOT EXISTS idx_inventory_category
ON foreign_trade_inventory(category)
WHERE category IS NOT NULL;

-- 活跃状态索引 (用于过滤已禁用的商品)
CREATE INDEX IF NOT EXISTS idx_inventory_is_active
ON foreign_trade_inventory(is_active)
WHERE is_active = true;

-- 覆盖索引: 常用查询字段组合 (SKU + 状态 + 时间)
CREATE INDEX IF NOT EXISTS idx_inventory_covering_query
ON foreign_trade_inventory(sku, status, updated_at)
INCLUDE (product_name, quantity, safety_stock, reorder_point);


-- 2. 库存交易记录表索引优化
-- =====================================================
-- 注意: 此表可能在其他迁移脚本中创建，使用DO块进行条件检查

DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foreign_trade_inventory_transactions') THEN
        -- 库存项ID索引 (用于查询商品的出入库记录)
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item
        ON foreign_trade_inventory_transactions(inventory_id);

        -- 交易类型索引 (用于按类型统计)
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type
        ON foreign_trade_inventory_transactions(transaction_type);

        -- 创建时间索引 (用于时间范围查询)
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created
        ON foreign_trade_inventory_transactions(created_at DESC);

        -- 复合索引: 库存项 + 时间 (用于商品交易历史)
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_date
        ON foreign_trade_inventory_transactions(inventory_id, created_at DESC);

        -- 操作人索引 (用于审计查询)
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_operator
        ON foreign_trade_inventory_transactions(created_by);

        RAISE NOTICE '✅ foreign_trade_inventory_transactions 表索引创建完成';
    ELSE
        RAISE NOTICE '⚠️  foreign_trade_inventory_transactions 表不存在，跳过索引创建';
        RAISE NOTICE '   提示: 请先执行 sql/foreign-trade-logistics-extended.sql';
    END IF;
END $$;


-- 3. 销量预测表索引优化
-- =====================================================

-- item_id + 预测日期复合索引 (核心查询索引)
CREATE INDEX IF NOT EXISTS idx_forecast_item_date
ON sales_forecasts(item_id, forecast_date);

-- 创建时间索引 (用于获取最新预测)
CREATE INDEX IF NOT EXISTS idx_forecast_created_at
ON sales_forecasts(created_at DESC);

-- 预测准确度索引 (用于模型评估 - 基于置信区间宽度)
CREATE INDEX IF NOT EXISTS idx_forecast_confidence
ON sales_forecasts(confidence_level)
WHERE confidence_level IS NOT NULL;

-- 模型版本索引 (用于按版本统计)
CREATE INDEX IF NOT EXISTS idx_forecast_model_version
ON sales_forecasts(model_version)
WHERE model_version IS NOT NULL;


-- 4. 补货建议表索引优化
-- =====================================================

-- 状态索引 (用于查询待处理建议)
CREATE INDEX IF NOT EXISTS idx_replenishment_status
ON replenishment_suggestions(status);

-- 优先级 + 创建时间复合索引 (用于排序展示)
CREATE INDEX IF NOT EXISTS idx_replenishment_priority_date
ON replenishment_suggestions(priority DESC, created_at DESC);

-- item_id索引 (用于查询商品的补货历史)
CREATE INDEX IF NOT EXISTS idx_replenishment_item
ON replenishment_suggestions(item_id);

-- 过期/过时建议索引 (用于清理旧建议 - 基于创建时间)
CREATE INDEX IF NOT EXISTS idx_replenishment_old_pending
ON replenishment_suggestions(created_at)
WHERE status = 'pending';

-- 审批人索引 (用于审计查询)
CREATE INDEX IF NOT EXISTS idx_replenishment_approved_by
ON replenishment_suggestions(approved_by)
WHERE approved_by IS NOT NULL;

-- 采购订单关联索引
CREATE INDEX IF NOT EXISTS idx_replenishment_purchase_order
ON replenishment_suggestions(purchase_order_id)
WHERE purchase_order_id IS NOT NULL;


-- 5. 仓库表索引优化
-- =====================================================

-- 状态索引 (用于查询活跃仓库)
CREATE INDEX IF NOT EXISTS idx_warehouses_status
ON foreign_trade_warehouses(status);

-- 位置索引 (用于地理位置查询)
CREATE INDEX IF NOT EXISTS idx_warehouses_location
ON foreign_trade_warehouses(location);

-- 使用率索引 (用于容量监控)
CREATE INDEX IF NOT EXISTS idx_warehouses_utilization
ON foreign_trade_warehouses(utilization);


-- 6. 采购订单表索引优化
-- =====================================================
-- 注意: 这些表可能在其他迁移脚本中创建

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enterprise_procurement_orders') THEN
        -- 订单号索引 (用于快速查找)
        CREATE INDEX IF NOT EXISTS idx_purchase_orders_number
        ON enterprise_procurement_orders(order_number);

        -- 状态索引 (用于状态过滤)
        CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
        ON enterprise_procurement_orders(status);

        -- 供应商索引 (用于供应商订单查询)
        CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier
        ON enterprise_procurement_orders(supplier_id);

        -- 创建时间索引 (用于时间范围查询)
        CREATE INDEX IF NOT EXISTS idx_purchase_orders_created
        ON enterprise_procurement_orders(created_at DESC);

        -- 复合索引: 供应商 + 状态 + 时间
        CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_status
        ON enterprise_procurement_orders(supplier_id, status, created_at DESC);

        RAISE NOTICE '✅ enterprise_procurement_orders 表索引创建完成';
    ELSE
        RAISE NOTICE '⚠️  enterprise_procurement_orders 表不存在，跳过索引创建';
    END IF;
END $$;


-- 7. 供应商表索引优化
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procurement_suppliers') THEN
        -- 状态索引 (用于查询活跃供应商)
        CREATE INDEX IF NOT EXISTS idx_suppliers_status
        ON procurement_suppliers(status);

        -- 评分索引 (用于供应商排序)
        CREATE INDEX IF NOT EXISTS idx_suppliers_rating
        ON procurement_suppliers(rating DESC);

        -- 分类索引 (用于按类别筛选)
        CREATE INDEX IF NOT EXISTS idx_suppliers_category
        ON procurement_suppliers(category)
        WHERE category IS NOT NULL;

        RAISE NOTICE '✅ procurement_suppliers 表索引创建完成';
    ELSE
        RAISE NOTICE '⚠️  procurement_suppliers 表不存在，跳过索引创建';
    END IF;
END $$;


-- 8. 部分索引优化 (针对高频查询场景)
-- =====================================================

-- 低库存商品索引 (预警查询)
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock
ON foreign_trade_inventory(sku, quantity, safety_stock)
WHERE quantity <= safety_stock AND is_active = true;

-- 待处理补货建议索引 (高优先级优先)
CREATE INDEX IF NOT EXISTS idx_replenishment_pending_high_priority
ON replenishment_suggestions(priority DESC, created_at DESC)
WHERE status = 'pending' AND priority IN ('high', 'urgent');

-- 最近创建的预测索引 (用于获取最新预测结果)
-- 注意: 不能使用 NOW() 函数，因为它不是 IMMUTABLE
-- 如果需要时间范围过滤，建议在应用层处理或使用物化视图
CREATE INDEX IF NOT EXISTS idx_forecast_recent
ON sales_forecasts(item_id, created_at DESC);


-- 9. 视图优化 (如果需要)
-- =====================================================

-- 库存概览视图 (通过JOIN关联预测数据)
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT
    i.id as item_id,
    i.sku,
    i.product_name as name,
    i.category,
    i.warehouse_id,
    i.quantity,
    i.safety_stock,
    i.reorder_point,
    i.status,
    i.is_active,
    COUNT(DISTINCT sf.id) as forecast_count,
    AVG(sf.predicted_quantity) as avg_predicted_quantity,
    MAX(sf.forecast_date) as latest_forecast_date,
    COUNT(DISTINCT CASE WHEN rs.status = 'pending' THEN rs.id END) as pending_suggestions_count,
    COUNT(DISTINCT CASE WHEN rs.status = 'approved' THEN rs.id END) as approved_suggestions_count
FROM foreign_trade_inventory i
LEFT JOIN sales_forecasts sf ON i.id = sf.item_id
LEFT JOIN replenishment_suggestions rs ON i.id = rs.item_id
GROUP BY
    i.id, i.sku, i.product_name, i.category, i.warehouse_id,
    i.quantity, i.safety_stock, i.reorder_point, i.status, i.is_active;

-- 为视图创建索引 (物化视图可使用，普通视图不需要)
-- 注意: PostgreSQL普通视图不支持直接创建索引，如需性能优化请使用物化视图


-- 10. 统计分析函数
-- =====================================================

-- 创建函数: 获取索引使用情况统计
CREATE OR REPLACE FUNCTION fn_get_index_usage_stats()
RETURNS TABLE (
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint,
    idx_tup_read bigint,
    idx_tup_fetch bigint,
    index_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.schemaname::text,
        s.tablename::text,
        s.indexrelname::text,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch,
        pg_size_pretty(pg_relation_size(s.indexrelid))::text as index_size
    FROM pg_stat_user_indexes s
    WHERE s.schemaname = 'public'
    ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建函数: 获取未使用的索引
CREATE OR REPLACE FUNCTION fn_get_unused_indexes()
RETURNS TABLE (
    tablename text,
    indexname text,
    index_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.tablename::text,
        s.indexrelname::text,
        pg_size_pretty(pg_relation_size(s.indexrelid))::text as index_size
    FROM pg_stat_user_indexes s
    WHERE s.schemaname = 'public'
      AND s.idx_scan = 0
      AND s.indexrelname NOT LIKE '%pkey%'
    ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建函数: 获取慢查询统计
CREATE OR REPLACE FUNCTION fn_get_slow_queries(threshold_ms integer DEFAULT 100)
RETURNS TABLE (
    query text,
    calls bigint,
    mean_time double precision,
    total_time double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.query::text,
        q.calls,
        q.mean_time,
        q.total_time
    FROM pg_stat_statements q
    WHERE q.mean_time > threshold_ms
    ORDER BY q.mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 执行后验证
-- =====================================================

-- 查看新创建的索引
SELECT
    s.relname as table_name,
    i.indexname,
    pg_size_pretty(pg_relation_size(s.indexrelid)) as size
FROM pg_stat_user_indexes s
JOIN pg_indexes i ON s.indexrelname = i.indexname
WHERE s.schemaname = 'public'
  AND i.indexname LIKE 'idx_%'
ORDER BY s.relname, i.indexname;

-- 检查索引大小 (仅显示已存在的表的索引)
SELECT
    i.indexname as index_name,
    pg_size_pretty(pg_relation_size(s.indexrelid)) as index_size,
    s.idx_scan as times_used
FROM pg_stat_user_indexes s
JOIN pg_indexes i ON s.indexrelname = i.indexname
WHERE s.schemaname = 'public'
  AND (i.indexname LIKE 'idx_inventory%'
     OR i.indexname LIKE 'idx_forecast%'
     OR i.indexname LIKE 'idx_replenishment%'
     OR i.indexname LIKE 'idx_warehouses%'
     OR i.indexname LIKE 'idx_purchase_orders%'
     OR i.indexname LIKE 'idx_suppliers%')
ORDER BY pg_relation_size(s.indexrelid) DESC;

-- 分析已存在的表以更新统计信息
DO $$
BEGIN
    -- 分析库存表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foreign_trade_inventory') THEN
        ANALYZE foreign_trade_inventory;
        RAISE NOTICE '✅ 已分析 foreign_trade_inventory 表';
    END IF;

    -- 分析预测表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_forecasts') THEN
        ANALYZE sales_forecasts;
        RAISE NOTICE '✅ 已分析 sales_forecasts 表';
    END IF;

    -- 分析补货建议表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replenishment_suggestions') THEN
        ANALYZE replenishment_suggestions;
        RAISE NOTICE '✅ 已分析 replenishment_suggestions 表';
    END IF;

    -- 分析仓库表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foreign_trade_warehouses') THEN
        ANALYZE foreign_trade_warehouses;
        RAISE NOTICE '✅ 已分析 foreign_trade_warehouses 表';
    END IF;

    -- 分析采购订单表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enterprise_procurement_orders') THEN
        ANALYZE enterprise_procurement_orders;
        RAISE NOTICE '✅ 已分析 enterprise_procurement_orders 表';
    END IF;

    RAISE NOTICE '🎉 所有表分析完成';
END $$;

-- 为迁移脚本添加版本标记（通过创建元数据表）
CREATE TABLE IF NOT EXISTS migration_metadata (
    migration_name VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO migration_metadata (migration_name, description)
VALUES ('002_inventory_ai_performance_indexes', '进销存AI集成模块 - 数据库索引优化完成')
ON CONFLICT (migration_name) DO NOTHING;
