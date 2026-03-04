-- 供应商智能画像数据表 (B001)
-- 用于存储供应商的多维度智能评估数据

-- 1. 供应商智能画像主表
CREATE TABLE IF NOT EXISTS supplier_intelligence_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    
    -- 基础画像信息
    company_name VARCHAR(200) NOT NULL,
    registration_country VARCHAR(100) NOT NULL,
    business_scale VARCHAR(20) NOT NULL CHECK (
        business_scale IN ('small', 'medium', 'large', 'enterprise')
    ),
    
    -- 能力评分 (0-100)
    quality_score DECIMAL(5,2) DEFAULT 0.00 CHECK (quality_score >= 0 AND quality_score <= 100),
    delivery_score DECIMAL(5,2) DEFAULT 0.00 CHECK (delivery_score >= 0 AND delivery_score <= 100),
    price_score DECIMAL(5,2) DEFAULT 0.00 CHECK (price_score >= 0 AND price_score <= 100),
    service_score DECIMAL(5,2) DEFAULT 0.00 CHECK (service_score >= 0 AND service_score <= 100),
    innovation_score DECIMAL(5,2) DEFAULT 0.00 CHECK (innovation_score >= 0 AND innovation_score <= 100),
    
    -- 综合评分
    overall_score DECIMAL(5,2) GENERATED ALWAYS AS (
        (quality_score * 0.3 + 
         delivery_score * 0.2 + 
         price_score * 0.25 + 
         service_score * 0.15 + 
         innovation_score * 0.1)
    ) STORED,
    
    -- 风险评估
    financial_risk_level VARCHAR(10) CHECK (financial_risk_level IN ('low', 'medium', 'high', 'critical')),
    operational_risk_level VARCHAR(10) CHECK (operational_risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_risk_level VARCHAR(10) CHECK (compliance_risk_level IN ('low', 'medium', 'high', 'critical')),
    geopolitical_risk_level VARCHAR(10) CHECK (geopolitical_risk_level IN ('low', 'medium', 'high', 'critical')),
    supply_chain_risk_level VARCHAR(10) CHECK (supply_chain_risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- 综合风险评分 (0-100，分数越高风险越大)
    risk_score DECIMAL(5,2) DEFAULT 0.00 CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- 市场表现指标
    market_share DECIMAL(5,2) DEFAULT 0.00 CHECK (market_share >= 0 AND market_share <= 100),
    growth_rate DECIMAL(8,4) DEFAULT 0.0000,
    customer_satisfaction DECIMAL(5,2) DEFAULT 0.00 CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 100),
    industry_ranking INTEGER DEFAULT 0,
    
    -- 合规认证信息
    certifications TEXT[],  -- 认证证书数组
    regulatory_compliance VARCHAR(20) DEFAULT 'pending' CHECK (
        regulatory_compliance IN ('compliant', 'non_compliant', 'pending')
    ),
    
    -- 供应商等级 (基于综合评分)
    supplier_tier VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN overall_score >= 90 THEN 'premium'
            WHEN overall_score >= 70 THEN 'standard'
            WHEN overall_score >= 50 THEN 'basic'
            ELSE 'risky'
        END
    ) STORED,
    
    -- 最后评估时间
    last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 数据来源和可信度
    data_sources TEXT[],  -- 数据来源数组
    confidence_level DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个供应商只有一个画像记录
    UNIQUE(supplier_id)
);

-- 2. 供应商审计结果表
CREATE TABLE IF NOT EXISTS supplier_audit_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_profile_id UUID NOT NULL REFERENCES supplier_intelligence_profiles(id) ON DELETE CASCADE,
    
    audit_date DATE NOT NULL,
    auditor VARCHAR(100) NOT NULL,
    audit_type VARCHAR(50) NOT NULL,  -- 如: 'quality', 'financial', 'compliance'
    result VARCHAR(20) NOT NULL CHECK (result IN ('pass', 'fail', 'conditional')),
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 供应商历史交易记录表
CREATE TABLE IF NOT EXISTS supplier_transaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_profile_id UUID NOT NULL REFERENCES supplier_intelligence_profiles(id) ON DELETE CASCADE,
    
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('order', 'payment', 'dispute', 'return')
    ),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    transaction_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('completed', 'pending', 'failed', 'disputed')
    ),
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 供应商能力评分详情表 (存储每次评分的详细因子)
CREATE TABLE IF NOT EXISTS supplier_capability_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_profile_id UUID NOT NULL REFERENCES supplier_intelligence_profiles(id) ON DELETE CASCADE,
    
    capability_type VARCHAR(20) NOT NULL CHECK (
        capability_type IN ('quality', 'delivery', 'price', 'service', 'innovation')
    ),
    factor_name VARCHAR(100) NOT NULL,  -- 具体评估因子名称
    factor_score DECIMAL(5,2) NOT NULL CHECK (factor_score >= 0 AND factor_score <= 100),
    weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluator VARCHAR(100),
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 供应商风险事件记录表
CREATE TABLE IF NOT EXISTS supplier_risk_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_profile_id UUID NOT NULL REFERENCES supplier_intelligence_profiles(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,  -- 如: 'delay', 'quality_issue', 'financial_problem'
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    event_date DATE NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATE,
    description TEXT,
    impact_assessment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_supplier_intelligence_supplier_id ON supplier_intelligence_profiles(supplier_id);
CREATE INDEX idx_supplier_intelligence_overall_score ON supplier_intelligence_profiles(overall_score DESC);
CREATE INDEX idx_supplier_intelligence_risk_score ON supplier_intelligence_profiles(risk_score DESC);
CREATE INDEX idx_supplier_intelligence_tier ON supplier_intelligence_profiles(supplier_tier);
CREATE INDEX idx_supplier_intelligence_country ON supplier_intelligence_profiles(registration_country);

CREATE INDEX idx_audit_results_profile_id ON supplier_audit_results(supplier_profile_id);
CREATE INDEX idx_audit_results_date ON supplier_audit_results(audit_date DESC);

CREATE INDEX idx_transaction_history_profile_id ON supplier_transaction_history(supplier_profile_id);
CREATE INDEX idx_transaction_history_date ON supplier_transaction_history(transaction_date DESC);

CREATE INDEX idx_capability_details_profile_id ON supplier_capability_details(supplier_profile_id);
CREATE INDEX idx_capability_details_type_date ON supplier_capability_details(capability_type, assessment_date DESC);

CREATE INDEX idx_risk_events_profile_id ON supplier_risk_events(supplier_profile_id);
CREATE INDEX idx_risk_events_type_date ON supplier_risk_events(event_type, event_date DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_intelligence_updated_at 
    BEFORE UPDATE ON supplier_intelligence_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_results_updated_at 
    BEFORE UPDATE ON supplier_audit_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_events_updated_at 
    BEFORE UPDATE ON supplier_risk_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略 (RLS)
ALTER TABLE supplier_intelligence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_capability_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_risk_events ENABLE ROW LEVEL SECURITY;

-- 为供应商画像表创建策略
CREATE POLICY "Users can view supplier profiles for their partners" 
ON supplier_intelligence_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners 
        WHERE foreign_trade_partners.id = supplier_intelligence_profiles.supplier_id 
        AND foreign_trade_partners.created_by = auth.uid()
    )
);

CREATE POLICY "Users can insert supplier profiles for their partners" 
ON supplier_intelligence_profiles FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners 
        WHERE foreign_trade_partners.id = supplier_id 
        AND foreign_trade_partners.created_by = auth.uid()
    )
);

CREATE POLICY "Users can update supplier profiles for their partners" 
ON supplier_intelligence_profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners 
        WHERE foreign_trade_partners.id = supplier_id 
        AND foreign_trade_partners.created_by = auth.uid()
    )
);

-- 为相关表创建策略
CREATE POLICY "Users can view related audit results" 
ON supplier_audit_results FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM supplier_intelligence_profiles sip
        JOIN foreign_trade_partners ftp ON ftp.id = sip.supplier_id
        WHERE supplier_audit_results.supplier_profile_id = sip.id
        AND ftp.created_by = auth.uid()
    )
);

-- 为其他表创建类似的策略...
CREATE POLICY "Users can view related transaction history" 
ON supplier_transaction_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM supplier_intelligence_profiles sip
        JOIN foreign_trade_partners ftp ON ftp.id = sip.supplier_id
        WHERE supplier_transaction_history.supplier_profile_id = sip.id
        AND ftp.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view related capability details" 
ON supplier_capability_details FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM supplier_intelligence_profiles sip
        JOIN foreign_trade_partners ftp ON ftp.id = sip.supplier_id
        WHERE supplier_capability_details.supplier_profile_id = sip.id
        AND ftp.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view related risk events" 
ON supplier_risk_events FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM supplier_intelligence_profiles sip
        JOIN foreign_trade_partners ftp ON ftp.id = sip.supplier_id
        WHERE supplier_risk_events.supplier_profile_id = sip.id
        AND ftp.created_by = auth.uid()
    )
);