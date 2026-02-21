-- 修复表结构脚本
-- 解决"column does not exist"错误

-- 检查并添加缺失的列到devices表
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT '手机',
ADD COLUMN IF NOT EXISTS os_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 检查并添加缺失的列到fault_types表
ALTER TABLE fault_types 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS repair_guide_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 检查并添加缺失的列到hot_links表
ALTER TABLE hot_links 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 检查并添加缺失的列到repair_shops表
ALTER TABLE repair_shops 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS specialties JSONB,
ADD COLUMN IF NOT EXISTS languages JSONB,
ADD COLUMN IF NOT EXISTS service_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certification_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 重新创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_devices_category ON devices(category);
CREATE INDEX IF NOT EXISTS idx_devices_os_type ON devices(os_type);
CREATE INDEX IF NOT EXISTS idx_faults_sub_category ON fault_types(sub_category);
CREATE INDEX IF NOT EXISTS idx_hot_links_sub_category ON hot_links(sub_category);
CREATE INDEX IF NOT EXISTS idx_repair_shops_country ON repair_shops(country);
CREATE INDEX IF NOT EXISTS idx_repair_shops_cert_level ON repair_shops(certification_level);

-- 更新表注释
COMMENT ON COLUMN devices.thumbnail_url IS '设备缩略图URL';
COMMENT ON COLUMN devices.category IS '设备分类(手机/平板/笔记本等)';
COMMENT ON COLUMN devices.os_type IS '操作系统类型';
COMMENT ON COLUMN fault_types.sub_category IS '故障子分类';
COMMENT ON COLUMN fault_types.image_url IS '故障示意图URL';
COMMENT ON COLUMN fault_types.repair_guide_url IS '维修指南链接';
COMMENT ON COLUMN hot_links.sub_category IS '链接子分类';
COMMENT ON COLUMN hot_links.image_url IS '封面图片URL';
COMMENT ON COLUMN hot_links.share_count IS '分享次数';
COMMENT ON COLUMN repair_shops.country IS '国家/地区';
COMMENT ON COLUMN repair_shops.postal_code IS '邮政编码';
COMMENT ON COLUMN repair_shops.logo_url IS '店铺Logo图片URL';
COMMENT ON COLUMN repair_shops.cover_image_url IS '店铺封面图片URL';
COMMENT ON COLUMN repair_shops.specialties IS '专长领域(JSON格式)';
COMMENT ON COLUMN repair_shops.languages IS '支持语言(JSON格式)';
COMMENT ON COLUMN repair_shops.service_count IS '服务项目数量';
COMMENT ON COLUMN repair_shops.certification_level IS '认证等级(1-5)';
COMMENT ON COLUMN repair_shops.is_verified IS '是否官方认证';

-- 确保RLS已启用
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shops ENABLE ROW LEVEL SECURITY;

-- 创建或替换RLS策略
DROP POLICY IF EXISTS "允许所有人查看设备" ON devices;
DROP POLICY IF EXISTS "允许所有人查看故障类型" ON fault_types;
DROP POLICY IF EXISTS "允许所有人查看热点链接" ON hot_links;
DROP POLICY IF EXISTS "允许所有人查看维修店铺" ON repair_shops;
DROP POLICY IF EXISTS "认证用户可管理设备" ON devices;
DROP POLICY IF EXISTS "认证用户可管理故障类型" ON fault_types;
DROP POLICY IF EXISTS "认证用户可管理热点链接" ON hot_links;
DROP POLICY IF EXISTS "认证用户可管理维修店铺" ON repair_shops;

CREATE POLICY "允许所有人查看设备" ON devices FOR SELECT USING (true);
CREATE POLICY "允许所有人查看故障类型" ON fault_types FOR SELECT USING (true);
CREATE POLICY "允许所有人查看热点链接" ON hot_links FOR SELECT USING (true);
CREATE POLICY "允许所有人查看维修店铺" ON repair_shops FOR SELECT USING (true);

CREATE POLICY "认证用户可管理设备" ON devices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理故障类型" ON fault_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理热点链接" ON hot_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可管理维修店铺" ON repair_shops FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 表结构修复完成'
