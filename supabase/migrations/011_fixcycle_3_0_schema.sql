-- FixCycle 3.0 数据库表结构

-- 品牌表
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    api_key VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    category VARCHAR(100),
    qr_url TEXT UNIQUE,
    description TEXT,
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品说明书表
CREATE TABLE IF NOT EXISTS manuals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title JSONB NOT NULL, -- 多语言标题 { "zh": "标题", "en": "Title" }
    content JSONB NOT NULL, -- 多语言内容 { "zh": [...], "en": [...] }
    language_codes TEXT[], -- 支持的语言列表
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES brands(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户扫描记录表
CREATE TABLE IF NOT EXISTS scan_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_agent TEXT,
    ip_address INET,
    country_code CHAR(2),
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI诊断记录表
CREATE TABLE IF NOT EXISTS diagnosis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_session_id VARCHAR(255),
    conversation_history JSONB,
    diagnosis_result JSONB,
    solutions JSONB,
    tokens_consumed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token余额表
CREATE TABLE IF NOT EXISTS token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0,
    total_recharged INTEGER DEFAULT 0,
    total_consumed INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token消费记录表
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'recharge', 'consume', 'refund'
    description TEXT,
    related_record_id UUID, -- 关联的诊断记录ID等
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_manuals_product_id ON manuals(product_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_product_id ON scan_records(product_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_scan_time ON scan_records(scan_time);
CREATE INDEX IF NOT EXISTS idx_diagnosis_records_product_id ON diagnosis_records(product_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_records_created_at ON diagnosis_records(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_brand_id ON token_transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuals_updated_at 
    BEFORE UPDATE ON manuals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_balances_updated_at 
    BEFORE UPDATE ON token_balances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();