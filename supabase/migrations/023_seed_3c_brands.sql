-- Phase 6: 产品库冷启动数据 - 50+ 3C品牌
-- Migration: 023_seed_3c_brands.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 目标: 插入50+个知名3C品牌数据，用于系统冷启动

-- ====================================================================
-- 第一部分：国际知名品牌（20个）
-- ====================================================================

INSERT INTO product_library.brands (name, slug, website_url) VALUES
('Apple', 'apple', 'https://www.apple.com'),
('Samsung', 'samsung', 'https://www.samsung.com'),
('Sony', 'sony', 'https://www.sony.com'),
('Microsoft', 'microsoft', 'https://www.microsoft.com'),
('Dell', 'dell', 'https://www.dell.com'),
('HP', 'hp', 'https://www.hp.com'),
('Lenovo', 'lenovo', 'https://www.lenovo.com'),
('ASUS', 'asus', 'https://www.asus.com'),
('Acer', 'acer', 'https://www.acer.com'),
('LG', 'lg', 'https://www.lg.com'),
('Panasonic', 'panasonic', 'https://www.panasonic.com'),
('Toshiba', 'toshiba', 'https://www.toshiba.com'),
('Intel', 'intel', 'https://www.intel.com'),
('AMD', 'amd', 'https://www.amd.com'),
('NVIDIA', 'nvidia', 'https://www.nvidia.com'),
('Qualcomm', 'qualcomm', 'https://www.qualcomm.com'),
('Huawei', 'huawei', 'https://www.huawei.com'),
('Xiaomi', 'xiaomi', 'https://www.mi.com'),
('OPPO', 'oppo', 'https://www.oppo.com'),
('vivo', 'vivo', 'https://www.vivo.com');

-- ====================================================================
-- 第二部分：中国知名品牌（15个）
-- ====================================================================

INSERT INTO product_library.brands (name, slug, website_url) VALUES
('Honor', 'honor', 'https://www.hihonor.com'),
('Realme', 'realme', 'https://www.realme.com'),
('OnePlus', 'oneplus', 'https://www.oneplus.com'),
('ZTE', 'zte', 'https://www.zte.com.cn'),
('Meizu', 'meizu', 'https://www.meizu.com'),
('Smartisan', 'smartisan', 'https://www.smartisan.com'),
('Nubia', 'nubia', 'https://www.nubia.com'),
('iQOO', 'iqoo', 'https://www.iqoo.com'),
('Redmi', 'redmi', 'https://www.redmi.com'),
('POCO', 'poco', 'https://www.poco.net'),
('Nothing', 'nothing', 'https://www.nothing.tech'),
('Transsion', 'transsion', 'https://www.transsion.com'),
('Coolpad', 'coolpad', 'https://www.coolpad.com'),
('Gionee', 'gionee', 'https://www.gionee.com'),
('LeEco', 'leeco', 'https://www.le.com');

-- ====================================================================
-- 第三部分：电脑外设品牌（10个）
-- ====================================================================

INSERT INTO product_library.brands (name, slug, website_url) VALUES
('Logitech', 'logitech', 'https://www.logitech.com'),
('Razer', 'razer', 'https://www.razer.com'),
('Corsair', 'corsair', 'https://www.corsair.com'),
('SteelSeries', 'steelseries', 'https://steelseries.com'),
('HyperX', 'hyperx', 'https://www.hyperx.com'),
('Bose', 'bose', 'https://www.bose.com'),
('JBL', 'jbl', 'https://www.jbl.com'),
('Sennheiser', 'sennheiser', 'https://www.sennheiser.com'),
('Audio-Technica', 'audio-technica', 'https://www.audio-technica.com'),
('Beats', 'beats', 'https://www.beatsbydre.com');

-- ====================================================================
-- 第四部分：智能家居与IoT品牌（10个）
-- ====================================================================

INSERT INTO product_library.brands (name, slug, website_url) VALUES
('DJI', 'dji', 'https://www.dji.com'),
('Anker', 'anker', 'https://www.anker.com'),
('Baseus', 'baseus', 'https://www.baseus.com'),
('UGREEN', 'ugreen', 'https://www.ugreen.com'),
('TP-Link', 'tp-link', 'https://www.tp-link.com'),
('Tenda', 'tenda', 'https://www.tenda.com.cn'),
('Hikvision', 'hikvision', 'https://www.hikvision.com'),
('Dahua', 'dahua', 'https://www.dahuatech.com'),
('Roborock', 'roborock', 'https://www.roborock.com'),
('Ecovacs', 'ecovacs', 'https://www.ecovacs.com');

-- ====================================================================
-- 第五部分：其他知名品牌（5个）
-- ====================================================================

INSERT INTO product_library.brands (name, slug, website_url) VALUES
('Canon', 'canon', 'https://www.canon.com'),
('Nikon', 'nikon', 'https://www.nikon.com'),
('GoPro', 'gopro', 'https://gopro.com'),
('Fitbit', 'fitbit', 'https://www.fitbit.com'),
('Garmin', 'garmin', 'https://www.garmin.com');

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM product_library.brands;
    RAISE NOTICE '✅ 成功插入 % 个3C品牌数据', v_count;
    RAISE NOTICE '   - 国际知名品牌: 20个';
    RAISE NOTICE '   - 中国知名品牌: 15个';
    RAISE NOTICE '   - 电脑外设品牌: 10个';
    RAISE NOTICE '   - 智能家居与IoT: 10个';
    RAISE NOTICE '   - 其他知名品牌: 5个';
END $$;
