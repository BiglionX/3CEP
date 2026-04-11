-- Phase 5: 溯源码插件数据库设计
-- Migration: 022_create_traceability_system.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 目标:
-- 1. 创建 SKU 级别溯源码表
-- 2. 支持全生命周期事件追踪
-- 3. 支持 QR Code、RFID、NFC 多种码类型
-- 4. 提供溯源查询接口

-- ====================================================================
-- 第一部分：创建溯源码主表
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.traceability_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(200) UNIQUE NOT NULL, -- 全局唯一溯源码 TRC-{UUID}-{Timestamp}
    code_type VARCHAR(50) NOT NULL DEFAULT 'qr', -- 'qr' | 'rfid' | 'nfc'
    tenant_product_id UUID NOT NULL REFERENCES foreign_trade_inventory(id) ON DELETE CASCADE,
    product_library_id UUID REFERENCES product_library.complete_products(id) ON DELETE SET NULL,
    sku VARCHAR(100), -- SKU 编码（冗余字段，便于查询）
    product_name VARCHAR(500), -- 产品名称（冗余字段）
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' | 'inactive' | 'expired'
    qr_code_image_url TEXT, -- 二维码图片 URL
    qr_code_base64 TEXT, -- 二维码 Base64
    rfid_tag_id VARCHAR(200), -- RFID 标签 ID
    nfc_uid VARCHAR(200), -- NFC UID
    activated_at TIMESTAMP WITH TIME ZONE, -- 激活时间
    expired_at TIMESTAMP WITH TIME ZONE, -- 过期时间
    lifecycle_events JSONB DEFAULT '[]', -- 生命周期事件数组
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_code_type CHECK (code_type IN ('qr', 'rfid', 'nfc')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'expired'))
);

-- 添加注释
COMMENT ON TABLE public.traceability_codes IS 'SKU级别溯源码表';
COMMENT ON COLUMN public.traceability_codes.code IS '全局唯一溯源码';
COMMENT ON COLUMN public.traceability_codes.code_type IS '码类型：qr/rfid/nfc';
COMMENT ON COLUMN public.traceability_codes.tenant_product_id IS '租户库存项ID';
COMMENT ON COLUMN public.traceability_codes.product_library_id IS '产品库标准产品ID';
COMMENT ON COLUMN public.traceability_codes.lifecycle_events IS '全生命周期事件记录';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trace_codes_code ON public.traceability_codes(code);
CREATE INDEX IF NOT EXISTS idx_trace_codes_tenant_product_id ON public.traceability_codes(tenant_product_id);
CREATE INDEX IF NOT EXISTS idx_trace_codes_product_library_id ON public.traceability_codes(product_library_id);
CREATE INDEX IF NOT EXISTS idx_trace_codes_sku ON public.traceability_codes(sku);
CREATE INDEX IF NOT EXISTS idx_trace_codes_status ON public.traceability_codes(status);
CREATE INDEX IF NOT EXISTS idx_trace_codes_activated_at ON public.traceability_codes(activated_at);
CREATE INDEX IF NOT EXISTS idx_trace_codes_expired_at ON public.traceability_codes(expired_at);

-- ====================================================================
-- 第二部分：创建溯源码扫描记录表
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.traceability_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traceability_code_id UUID NOT NULL REFERENCES public.traceability_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanner_location VARCHAR(500), -- 扫描位置
    scanner_device VARCHAR(200), -- 扫描设备
    scanner_user_id UUID, -- 扫描用户
    scan_result VARCHAR(50) DEFAULT 'success', -- 'success' | 'failed' | 'expired'
    ip_address INET, -- 扫描者 IP
    user_agent TEXT, -- 用户代理
    metadata JSONB -- 额外元数据
);

-- 添加注释
COMMENT ON TABLE public.traceability_scans IS '溯源码扫描记录表';
COMMENT ON COLUMN public.traceability_scans.scanner_location IS '扫描地理位置';
COMMENT ON COLUMN public.traceability_scans.scan_result IS '扫描结果';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trace_scans_code_id ON public.traceability_scans(traceability_code_id);
CREATE INDEX IF NOT EXISTS idx_trace_scans_scanned_at ON public.traceability_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_trace_scans_result ON public.traceability_scans(scan_result);

-- ====================================================================
-- 第三部分：创建触发器 - 自动更新时间戳
-- ====================================================================

CREATE OR REPLACE FUNCTION update_traceability_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trace_codes_updated_at
    BEFORE UPDATE ON public.traceability_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_traceability_codes_updated_at();

-- ====================================================================
-- 第四部分：创建辅助函数
-- ====================================================================

-- 函数1: 生成溯源码
CREATE OR REPLACE FUNCTION generate_traceability_code(
    p_tenant_product_id UUID,
    p_code_type VARCHAR(50) DEFAULT 'qr',
    p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS VARCHAR(200) AS $$
DECLARE
    v_code VARCHAR(200);
    v_uuid VARCHAR(32);
    v_timestamp VARCHAR(20);
    v_expired_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 生成唯一码: TRC-{UUID16}-{Timestamp36}
    v_uuid := SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 16);
    v_timestamp := UPPER(to_hex(EXTRACT(EPOCH FROM NOW())::BIGINT));
    v_code := 'TRC-' || v_uuid || '-' || v_timestamp;

    -- 计算过期时间
    IF p_expires_in_days IS NOT NULL THEN
        v_expired_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
    END IF;

    -- 插入溯源码记录
    INSERT INTO public.traceability_codes (
        code,
        code_type,
        tenant_product_id,
        status,
        expired_at,
        activated_at
    ) VALUES (
        v_code,
        p_code_type,
        p_tenant_product_id,
        'active',
        v_expired_at,
        NOW()
    );

    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- 函数2: 批量生成溯源码
CREATE OR REPLACE FUNCTION generate_batch_traceability_codes(
    p_tenant_product_id UUID,
    p_quantity INTEGER,
    p_code_type VARCHAR(50) DEFAULT 'qr',
    p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS TABLE(code VARCHAR(200)) AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..p_quantity LOOP
        code := generate_traceability_code(p_tenant_product_id, p_code_type, p_expires_in_days);
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 函数3: 记录生命周期事件
CREATE OR REPLACE FUNCTION record_lifecycle_event(
    p_traceability_code_id UUID,
    p_event_type VARCHAR(50),
    p_location VARCHAR(500) DEFAULT NULL,
    p_operator VARCHAR(200) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_current_events JSONB;
    v_new_event JSONB;
BEGIN
    -- 获取当前事件列表
    SELECT lifecycle_events INTO v_current_events
    FROM public.traceability_codes
    WHERE id = p_traceability_code_id;

    -- 构建新事件
    v_new_event := jsonb_build_object(
        'id', gen_random_uuid()::TEXT,
        'type', p_event_type,
        'timestamp', NOW(),
        'location', p_location,
        'operator', p_operator,
        'notes', p_notes,
        'metadata', p_metadata
    );

    -- 更新事件列表
    UPDATE public.traceability_codes
    SET lifecycle_events = v_current_events || jsonb_build_array(v_new_event),
        updated_at = NOW()
    WHERE id = p_traceability_code_id;
END;
$$ LANGUAGE plpgsql;

-- 函数4: 验证溯源码有效性
CREATE OR REPLACE FUNCTION verify_traceability_code(p_code VARCHAR(200))
RETURNS TABLE(
    is_valid BOOLEAN,
    status VARCHAR(50),
    product_name VARCHAR(500),
    sku VARCHAR(100),
    message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN tc.status = 'active' AND (tc.expired_at IS NULL OR tc.expired_at > NOW()) THEN true
            ELSE false
        END AS is_valid,
        tc.status,
        tc.product_name,
        tc.sku,
        CASE
            WHEN tc.status = 'active' AND (tc.expired_at IS NULL OR tc.expired_at > NOW()) THEN '溯源码有效'
            WHEN tc.status = 'inactive' THEN '溯源码已停用'
            WHEN tc.status = 'expired' THEN '溯源码已过期'
            ELSE '溯源码不存在'
        END AS message
    FROM public.traceability_codes tc
    WHERE tc.code = p_code;

    -- 如果未找到记录
    IF NOT FOUND THEN
        is_valid := false;
        status := 'not_found';
        product_name := NULL;
        sku := NULL;
        message := '溯源码不存在';
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 第五部分：创建视图 - 溯源码统计
-- ====================================================================

CREATE OR REPLACE VIEW v_traceability_statistics AS
SELECT
    tenant_product_id,
    COUNT(*) AS total_codes,
    COUNT(*) FILTER (WHERE status = 'active') AS active_codes,
    COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_codes,
    COUNT(*) FILTER (WHERE status = 'expired') AS expired_codes,
    COUNT(*) FILTER (WHERE expired_at IS NOT NULL AND expired_at < NOW()) AS actually_expired,
    MIN(activated_at) AS first_activation,
    MAX(updated_at) AS last_update
FROM public.traceability_codes
GROUP BY tenant_product_id;

COMMENT ON VIEW v_traceability_statistics IS '溯源码使用统计视图';

-- ====================================================================
-- 第六部分：创建视图 - 完整溯源信息
-- ====================================================================

CREATE OR REPLACE VIEW v_full_traceability_info AS
SELECT
    tc.id AS traceability_id,
    tc.code,
    tc.code_type,
    tc.status,
    tc.sku,
    tc.product_name,
    tc.activated_at,
    tc.expired_at,
    tc.lifecycle_events,
    tc.created_at,
    inv.product_name AS inventory_product_name,
    inv.sku AS inventory_sku,
    pl.name AS library_product_name,
    pl.brand_id,
    b.name AS brand_name,
    (SELECT COUNT(*) FROM public.traceability_scans ts WHERE ts.traceability_code_id = tc.id) AS scan_count
FROM public.traceability_codes tc
LEFT JOIN foreign_trade_inventory inv ON tc.tenant_product_id = inv.id
LEFT JOIN product_library.complete_products pl ON tc.product_library_id = pl.id
LEFT JOIN product_library.brands b ON pl.brand_id = b.id;

COMMENT ON VIEW v_full_traceability_info IS '完整溯源信息查询视图';

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Phase 5: 溯源码插件数据库设计完成';
    RAISE NOTICE '   - 已创建 traceability_codes 溯源码表';
    RAISE NOTICE '   - 已创建 traceability_scans 扫描记录表';
    RAISE NOTICE '   - 已创建辅助函数（生成、验证、事件记录）';
    RAISE NOTICE '   - 已创建统计视图';
END $$;
