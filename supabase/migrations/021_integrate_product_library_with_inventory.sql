-- Phase 4: 产品库与进销存集成
-- Migration: 021_integrate_product_library_with_inventory.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 目标:
-- 1. 在进销存库存表中添加产品库引用
-- 2. 支持从产品库导入标准产品数据
-- 3. 保持本地覆盖能力（租户自定义）
-- 4. 数据同步机制

-- ====================================================================
-- 第一部分：扩展 foreign_trade_inventory 表
-- ====================================================================

-- 添加产品库引用字段
ALTER TABLE IF EXISTS foreign_trade_inventory
ADD COLUMN IF NOT EXISTS product_library_id UUID,
ADD COLUMN IF NOT EXISTS import_source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false;

-- 添加外键约束（如果 product_library.complete_products 表存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'product_library' AND tablename = 'complete_products') THEN
        ALTER TABLE foreign_trade_inventory
        ADD CONSTRAINT fk_inventory_product_library
        FOREIGN KEY (product_library_id)
        REFERENCES product_library.complete_products(id)
        ON DELETE SET NULL;

        RAISE NOTICE '✅ 已添加产品库外键约束';
    ELSE
        RAISE NOTICE '⚠️  product_library.complete_products 表不存在，跳过外键约束';
    END IF;
END $$;

-- 添加字段注释
COMMENT ON COLUMN foreign_trade_inventory.product_library_id IS '产品库标准产品ID（可选）';
COMMENT ON COLUMN foreign_trade_inventory.import_source IS '数据来源: manual(手动), product_library(产品库), excel(Excel导入), api(API导入)';
COMMENT ON COLUMN foreign_trade_inventory.last_sync_at IS '最后同步时间（从产品库）';
COMMENT ON COLUMN foreign_trade_inventory.sync_enabled IS '是否启用自动同步产品库更新';

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_inventory_product_library_id ON foreign_trade_inventory(product_library_id);
CREATE INDEX IF NOT EXISTS idx_inventory_import_source ON foreign_trade_inventory(import_source);

-- ====================================================================
-- 第二部分：创建产品库引用映射表（用于配件、部件、零件）
-- ====================================================================

CREATE TABLE IF NOT EXISTS inventory_product_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_inventory_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    product_library_type VARCHAR(50) NOT NULL, -- 'complete' | 'accessory' | 'component' | 'part'
    product_library_id UUID NOT NULL, -- 指向对应的产品库表
    reference_data JSONB, -- 缓存的产品库数据快照
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_inventory_id, product_library_type)
);

-- 添加注释
COMMENT ON TABLE inventory_product_references IS '进销存-产品库引用映射表';
COMMENT ON COLUMN inventory_product_references.tenant_inventory_id IS '租户库存项ID';
COMMENT ON COLUMN inventory_product_references.product_library_type IS '产品类型：complete/accessory/component/part';
COMMENT ON COLUMN inventory_product_references.product_library_id IS '产品库中的产品ID';
COMMENT ON COLUMN inventory_product_references.reference_data IS '产品库数据快照（用于快速展示）';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inv_prod_ref_tenant_id ON inventory_product_references(tenant_inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_prod_ref_library_id ON inventory_product_references(product_library_id);
CREATE INDEX IF NOT EXISTS idx_inv_prod_ref_type ON inventory_product_references(product_library_type);

-- ====================================================================
-- 第三部分：创建数据同步日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_inventory_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    product_library_id UUID NOT NULL,
    sync_type VARCHAR(50) NOT NULL, -- 'full' | 'incremental' | 'manual'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed' | 'partial'
    changes_summary JSONB, -- 变更摘要
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加注释
COMMENT ON TABLE product_sync_logs IS '产品库数据同步日志';
COMMENT ON COLUMN product_sync_logs.sync_type IS '同步类型：full(全量), incremental(增量), manual(手动)';
COMMENT ON COLUMN product_sync_logs.status IS '同步状态';
COMMENT ON COLUMN product_sync_logs.changes_summary IS '变更摘要（哪些字段被更新）';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant_id ON product_sync_logs(tenant_inventory_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON product_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON product_sync_logs(created_at DESC);

-- ====================================================================
-- 第四部分：创建触发器 - 自动更新时间戳
-- ====================================================================

CREATE OR REPLACE FUNCTION update_inventory_product_ref_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inv_prod_ref_updated_at
    BEFORE UPDATE ON inventory_product_references
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_product_ref_updated_at();

-- ====================================================================
-- 第五部分：创建辅助函数
-- ====================================================================

-- 函数1: 从产品库导入产品到进销存
CREATE OR REPLACE FUNCTION import_product_from_library(
    p_product_library_id UUID,
    p_tenant_id UUID,
    p_custom_name VARCHAR(200) DEFAULT NULL,
    p_custom_specifications JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_inventory_id UUID;
    v_product_record RECORD;
    v_brand_name VARCHAR(255);
BEGIN
    -- 从产品库获取产品信息
    SELECT cp.*, b.name as brand_name
    INTO v_product_record
    FROM product_library.complete_products cp
    LEFT JOIN product_library.brands b ON cp.brand_id = b.id
    WHERE cp.id = p_product_library_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION '产品库中未找到产品 ID: %', p_product_library_id;
    END IF;

    -- 创建或更新库存记录
    INSERT INTO foreign_trade_inventory (
        sku,
        product_name,
        category,
        quantity,
        unit,
        status,
        is_active,
        created_by,
        product_library_id,
        import_source
    ) VALUES (
        v_product_record.sku_code,
        COALESCE(p_custom_name, v_product_record.name),
        'imported_from_library',
        0,
        '件',
        'normal',
        true,
        p_tenant_id,
        p_product_library_id,
        'product_library'
    )
    ON CONFLICT (sku) DO UPDATE SET
        product_name = COALESCE(p_custom_name, EXCLUDED.product_name),
        product_library_id = p_product_library_id,
        import_source = 'product_library',
        updated_at = NOW()
    RETURNING id INTO v_inventory_id;

    -- 创建引用映射
    INSERT INTO inventory_product_references (
        tenant_inventory_id,
        product_library_type,
        product_library_id,
        reference_data
    ) VALUES (
        v_inventory_id,
        'complete',
        p_product_library_id,
        jsonb_build_object(
            'name', v_product_record.name,
            'brand', v_brand_name,
            'specifications', COALESCE(p_custom_specifications, v_product_record.specifications),
            'description', v_product_record.description
        )
    )
    ON CONFLICT (tenant_inventory_id, product_library_type) DO UPDATE SET
        reference_data = EXCLUDED.reference_data,
        updated_at = NOW();

    -- 记录同步日志
    INSERT INTO product_sync_logs (
        tenant_inventory_id,
        product_library_id,
        sync_type,
        status,
        changes_summary,
        completed_at
    ) VALUES (
        v_inventory_id,
        p_product_library_id,
        'full',
        'success',
        jsonb_build_object('action', 'import', 'source', 'product_library'),
        NOW()
    );

    RETURN v_inventory_id;
END;
$$ LANGUAGE plpgsql;

-- 函数2: 同步产品库更新到进销存
CREATE OR REPLACE FUNCTION sync_product_library_updates(
    p_tenant_inventory_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_ref_record RECORD;
    v_product_record RECORD;
    v_changes JSONB := '{}'::jsonb;
BEGIN
    -- 获取引用映射
    SELECT * INTO v_ref_record
    FROM inventory_product_references
    WHERE tenant_inventory_id = p_tenant_inventory_id
    AND product_library_type = 'complete';

    IF NOT FOUND THEN
        RAISE EXCEPTION '未找到产品库引用映射';
    END IF;

    -- 获取产品库最新数据
    SELECT * INTO v_product_record
    FROM product_library.complete_products
    WHERE id = v_ref_record.product_library_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION '产品库中未找到产品';
    END IF;

    -- 比较并更新（仅当 sync_enabled = true 时）
    UPDATE foreign_trade_inventory
    SET
        product_name = CASE
            WHEN sync_enabled THEN v_product_record.name
            ELSE product_name
        END,
        last_sync_at = NOW()
    WHERE id = p_tenant_inventory_id
    AND sync_enabled = true;

    -- 更新引用数据
    UPDATE inventory_product_references
    SET
        reference_data = jsonb_build_object(
            'name', v_product_record.name,
            'specifications', v_product_record.specifications,
            'description', v_product_record.description,
            'version', v_product_record.version
        ),
        updated_at = NOW()
    WHERE tenant_inventory_id = p_tenant_inventory_id;

    -- 记录同步日志
    INSERT INTO product_sync_logs (
        tenant_inventory_id,
        product_library_id,
        sync_type,
        status,
        changes_summary,
        completed_at
    ) VALUES (
        p_tenant_inventory_id,
        v_ref_record.product_library_id,
        'incremental',
        'success',
        v_changes,
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 第六部分：创建视图 - 产品库关联查询
-- ====================================================================

CREATE OR REPLACE VIEW v_inventory_with_product_library AS
SELECT
    inv.id AS inventory_id,
    inv.sku,
    inv.product_name,
    inv.category,
    inv.quantity,
    inv.status,
    inv.import_source,
    inv.product_library_id,
    inv.sync_enabled,
    inv.last_sync_at,
    pl.name AS library_product_name,
    pl.sku_code AS library_sku,
    pl.description AS library_description,
    pl.specifications AS library_specifications,
    pl.version AS library_version,
    b.name AS brand_name,
    ref.reference_data
FROM foreign_trade_inventory inv
LEFT JOIN product_library.complete_products pl ON inv.product_library_id = pl.id
LEFT JOIN product_library.brands b ON pl.brand_id = b.id
LEFT JOIN inventory_product_references ref ON inv.id = ref.tenant_inventory_id
WHERE inv.is_active = true;

COMMENT ON VIEW v_inventory_with_product_library IS '进销存与产品库关联视图';

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Phase 4: 产品库与进销存集成完成';
    RAISE NOTICE '   - 已扩展 foreign_trade_inventory 表';
    RAISE NOTICE '   - 已创建 inventory_product_references 映射表';
    RAISE NOTICE '   - 已创建 product_sync_logs 同步日志表';
    RAISE NOTICE '   - 已创建辅助函数和视图';
END $$;
