-- 合作伙伴管理扩展表结构

-- 1. 合作伙伴联系人表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 合作伙伴银行账户表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    bank_name VARCHAR(200) NOT NULL,
    branch_name VARCHAR(200),
    account_number VARCHAR(50) NOT NULL,
    swift_code VARCHAR(20),
    iban VARCHAR(50),
    account_holder VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 合作伙伴产品目录表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    moq INTEGER, -- 最小起订量
    lead_time INTEGER, -- 交货周期（天）
    specifications JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'discontinued')
    ),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 合作伙伴关系历史表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (
        relationship_type IN ('primary', 'backup', 'preferred', 'blacklisted')
    ),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    performance_score DECIMAL(3,2) CHECK (performance_score >= 0 AND performance_score <= 5),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 合作伙伴评估表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    evaluation_period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
    evaluation_date DATE NOT NULL,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    delivery_score DECIMAL(3,2) CHECK (delivery_score >= 0 AND delivery_score <= 5),
    price_score DECIMAL(3,2) CHECK (price_score >= 0 AND price_score <= 5),
    service_score DECIMAL(3,2) CHECK (service_score >= 0 AND service_score <= 5),
    overall_score DECIMAL(3,2) GENERATED ALWAYS AS (
        (quality_score + delivery_score + price_score + service_score) / 4
    ) STORED,
    evaluator UUID NOT NULL REFERENCES auth.users(id),
    comments TEXT,
    recommendations TEXT,
    next_evaluation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 合作伙伴沟通记录表
CREATE TABLE IF NOT EXISTS foreign_trade_partner_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    communication_type VARCHAR(20) NOT NULL CHECK (
        communication_type IN ('email', 'phone', 'meeting', 'video_call', 'written')
    ),
    subject VARCHAR(200) NOT NULL,
    participants JSONB DEFAULT '[]',
    communication_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    summary TEXT,
    action_items JSONB DEFAULT '[]',
    follow_up_date DATE,
    attachment_urls TEXT[],
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_partner_contacts_partner_id ON foreign_trade_partner_contacts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_contacts_email ON foreign_trade_partner_contacts(email);
CREATE INDEX IF NOT EXISTS idx_partner_banks_partner_id ON foreign_trade_partner_banks(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_products_partner_id ON foreign_trade_partner_products(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_products_category ON foreign_trade_partner_products(category);
CREATE INDEX IF NOT EXISTS idx_partner_relationships_partner_id ON foreign_trade_partner_relationships(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_evaluations_partner_id ON foreign_trade_partner_evaluations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_evaluations_date ON foreign_trade_partner_evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_partner_communications_partner_id ON foreign_trade_partner_communications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_communications_date ON foreign_trade_partner_communications(communication_date);

-- 更新时间触发器
CREATE TRIGGER update_partner_contacts_updated_at 
    BEFORE UPDATE ON foreign_trade_partner_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_banks_updated_at 
    BEFORE UPDATE ON foreign_trade_partner_banks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_products_updated_at 
    BEFORE UPDATE ON foreign_trade_partner_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_relationships_updated_at 
    BEFORE UPDATE ON foreign_trade_partner_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE foreign_trade_partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partner_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partner_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partner_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partner_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_trade_partner_communications ENABLE ROW LEVEL SECURITY;

-- 合作伙伴扩展表的RLS策略
CREATE POLICY "Users can view partner contacts" ON foreign_trade_partner_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_contacts.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert partner contacts" ON foreign_trade_partner_contacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_contacts.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view partner banks" ON foreign_trade_partner_banks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_banks.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert partner banks" ON foreign_trade_partner_banks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_banks.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view partner products" ON foreign_trade_partner_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_products.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert partner products" ON foreign_trade_partner_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM foreign_trade_partners 
            WHERE foreign_trade_partners.id = foreign_trade_partner_products.partner_id 
            AND foreign_trade_partners.created_by = auth.uid()
        )
    );