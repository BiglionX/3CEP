-- 设备生命周期事件触发器
-- Migration: 026_create_lifecycle_triggers.sql
-- 创建时间: 2026-02-20
-- 版本: 1.0.0
-- 功能: 在设备生命周期事件插入时自动更新设备档案摘要信息

-- ====================================================================
-- 第一部分：创建更新设备档案的函数
-- ====================================================================

-- 创建更新设备档案摘要的函数
CREATE OR REPLACE FUNCTION update_device_profile_from_event()
RETURNS TRIGGER AS $$
DECLARE
    v_repair_count INTEGER;
    v_part_replacement_count INTEGER;
    v_transfer_count INTEGER;
    v_first_activation_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 只在INSERT操作时执行
    IF TG_OP = 'INSERT' THEN
        -- 计算各种事件类型的统计数量
        SELECT 
            COUNT(*) FILTER (WHERE event_type = 'repaired'),
            COUNT(*) FILTER (WHERE event_type = 'part_replaced'),
            COUNT(*) FILTER (WHERE event_type = 'transferred')
        INTO 
            v_repair_count,
            v_part_replacement_count,
            v_transfer_count
        FROM device_lifecycle_events 
        WHERE device_qrcode_id = NEW.device_qrcode_id;

        -- 获取首次激活时间
        SELECT MIN(event_timestamp)
        INTO v_first_activation_time
        FROM device_lifecycle_events 
        WHERE device_qrcode_id = NEW.device_qrcode_id 
        AND event_type = 'activated';

        -- 更新设备档案
        UPDATE device_profiles 
        SET 
            last_event_at = NEW.event_timestamp,
            last_event_type = NEW.event_type,
            total_repair_count = v_repair_count,
            total_part_replacement_count = v_part_replacement_count,
            total_transfer_count = v_transfer_count,
            first_activated_at = COALESCE(first_activated_at, v_first_activation_time),
            current_status = CASE NEW.event_type
                WHEN 'manufactured' THEN 'manufactured'
                WHEN 'activated' THEN 'activated'
                WHEN 'repaired' THEN 
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM device_lifecycle_events 
                            WHERE device_qrcode_id = NEW.device_qrcode_id 
                            AND event_type = 'repaired' 
                            AND is_verified = false
                        ) THEN 'in_repair'
                        ELSE 'active'
                    END
                WHEN 'transferred' THEN 'transferred'
                WHEN 'recycled' THEN 'recycled'
                ELSE current_status
            END,
            updated_at = NOW()
        WHERE qrcode_id = NEW.device_qrcode_id;

        -- 如果设备档案不存在，创建一个基本档案
        IF NOT FOUND THEN
            INSERT INTO device_profiles (
                qrcode_id,
                product_model,
                product_category,
                current_status,
                last_event_at,
                last_event_type,
                total_repair_count,
                total_part_replacement_count,
                total_transfer_count,
                first_activated_at,
                created_at,
                updated_at
            ) VALUES (
                NEW.device_qrcode_id,
                '未知设备',
                '未分类',
                CASE NEW.event_type
                    WHEN 'manufactured' THEN 'manufactured'
                    WHEN 'activated' THEN 'activated'
                    WHEN 'repaired' THEN 'in_repair'
                    WHEN 'transferred' THEN 'transferred'
                    WHEN 'recycled' THEN 'recycled'
                    ELSE 'active'
                END,
                NEW.event_timestamp,
                NEW.event_type,
                CASE WHEN NEW.event_type = 'repaired' THEN 1 ELSE 0 END,
                CASE WHEN NEW.event_type = 'part_replaced' THEN 1 ELSE 0 END,
                CASE WHEN NEW.event_type = 'transferred' THEN 1 ELSE 0 END,
                v_first_activation_time,
                NOW(),
                NOW()
            )
            ON CONFLICT (qrcode_id) DO UPDATE SET
                last_event_at = EXCLUDED.last_event_at,
                last_event_type = EXCLUDED.last_event_type,
                total_repair_count = EXCLUDED.total_repair_count,
                total_part_replacement_count = EXCLUDED.total_part_replacement_count,
                total_transfer_count = EXCLUDED.total_transfer_count,
                first_activated_at = EXCLUDED.first_activated_at,
                current_status = EXCLUDED.current_status,
                updated_at = NOW();
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 第二部分：创建触发器
-- ====================================================================

-- 为设备生命周期事件表创建触发器
CREATE TRIGGER trigger_update_device_profile
    AFTER INSERT ON device_lifecycle_events
    FOR EACH ROW
    EXECUTE FUNCTION update_device_profile_from_event();

-- ====================================================================
-- 第三部分：创建手动更新函数（用于修复数据）
-- ====================================================================

-- 创建手动重新计算设备统计信息的函数
CREATE OR REPLACE FUNCTION recalculate_device_stats(p_qrcode_id VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_repair_count INTEGER;
    v_part_replacement_count INTEGER;
    v_transfer_count INTEGER;
    v_first_activation_time TIMESTAMP WITH TIME ZONE;
    v_last_event RECORD;
BEGIN
    -- 计算各种事件类型的统计数量
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'repaired'),
        COUNT(*) FILTER (WHERE event_type = 'part_replaced'),
        COUNT(*) FILTER (WHERE event_type = 'transferred')
    INTO 
        v_repair_count,
        v_part_replacement_count,
        v_transfer_count
    FROM device_lifecycle_events 
    WHERE device_qrcode_id = p_qrcode_id;

    -- 获取首次激活时间
    SELECT MIN(event_timestamp)
    INTO v_first_activation_time
    FROM device_lifecycle_events 
    WHERE device_qrcode_id = p_qrcode_id 
    AND event_type = 'activated';

    -- 获取最后一次事件信息
    SELECT event_type, event_timestamp
    INTO v_last_event
    FROM device_lifecycle_events 
    WHERE device_qrcode_id = p_qrcode_id
    ORDER BY event_timestamp DESC
    LIMIT 1;

    -- 更新设备档案
    UPDATE device_profiles 
    SET 
        last_event_at = v_last_event.event_timestamp,
        last_event_type = v_last_event.event_type,
        total_repair_count = v_repair_count,
        total_part_replacement_count = v_part_replacement_count,
        total_transfer_count = v_transfer_count,
        first_activated_at = COALESCE(first_activated_at, v_first_activation_time),
        current_status = CASE v_last_event.event_type
            WHEN 'manufactured' THEN 'manufactured'
            WHEN 'activated' THEN 'activated'
            WHEN 'repaired' THEN 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM device_lifecycle_events 
                        WHERE device_qrcode_id = p_qrcode_id 
                        AND event_type = 'repaired' 
                        AND is_verified = false
                    ) THEN 'in_repair'
                    ELSE 'active'
                END
            WHEN 'transferred' THEN 'transferred'
            WHEN 'recycled' THEN 'recycled'
            ELSE current_status
        END,
        updated_at = NOW()
    WHERE qrcode_id = p_qrcode_id;

    RAISE NOTICE '设备 % 的统计信息已重新计算', p_qrcode_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 第四部分：添加函数注释
-- ====================================================================

COMMENT ON FUNCTION update_device_profile_from_event() IS '设备生命周期事件触发器函数：在插入事件后自动更新设备档案摘要信息';
COMMENT ON FUNCTION recalculate_device_stats(VARCHAR) IS '手动重新计算设备统计信息函数：用于修复数据一致性问题';
COMMENT ON TRIGGER trigger_update_device_profile ON device_lifecycle_events IS '设备档案更新触发器：在生命周期事件插入后自动更新相关设备档案';

-- ====================================================================
-- 第五部分：测试数据（可选）
-- ====================================================================

-- /*
-- 插入测试数据来验证触发器功能
-- INSERT INTO device_lifecycle_events (
--     device_qrcode_id,
--     event_type,
--     event_subtype,
--     location,
--     notes,
--     is_verified
-- ) VALUES 
--     ('qr_test_device_001', 'manufactured', NULL, '深圳工厂', '设备出厂测试', true),
--     ('qr_test_device_001', 'activated', NULL, '北京用户家中', '设备首次激活', true),
--     ('qr_test_device_001', 'repaired', 'screen_replacement', '上海维修中心', '屏幕更换维修', false);
-- */
