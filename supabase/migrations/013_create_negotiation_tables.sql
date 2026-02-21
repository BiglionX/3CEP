-- 智能议价引擎数据表结构

-- 1. 议价策略规则表
CREATE TABLE IF NOT EXISTS negotiation_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                    -- 策略名称
    description TEXT,                              -- 策略描述
    strategy_type VARCHAR(50) NOT NULL CHECK (strategy_type IN ('price_based', 'quality_based', 'relationship_based', 'urgency_based')), -- 策略类型
    conditions JSONB NOT NULL,                     -- 触发条件
    actions JSONB NOT NULL,                        -- 执行动作
    priority INTEGER DEFAULT 0,                    -- 优先级
    is_active BOOLEAN DEFAULT true,                -- 是否启用
    created_by UUID REFERENCES profiles(id),       -- 创建人
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 议价历史记录表
CREATE TABLE IF NOT EXISTS negotiation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procurement_request_id UUID REFERENCES procurement_requests(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE SET NULL,
    session_id VARCHAR(100) NOT NULL,              -- 议价会话ID
    round_number INTEGER NOT NULL,                 -- 第几轮议价
    our_initial_offer DECIMAL(12,2),               -- 我方初始报价
    supplier_quote DECIMAL(12,2),                  -- 供应商报价
    our_counter_offer DECIMAL(12,2),               -- 我方还价
    final_price DECIMAL(12,2),                     -- 最终价格
    negotiation_status VARCHAR(20) NOT NULL CHECK (negotiation_status IN ('success', 'failed', 'ongoing', 'cancelled')),
    discount_rate DECIMAL(5,2),                    -- 折扣率 (%)
    negotiation_duration INTEGER,                  -- 议价时长(分钟)
    strategy_used UUID REFERENCES negotiation_strategies(id), -- 使用的策略
    confidence_level DECIMAL(5,2),                 -- 本轮议价信心指数
    remarks TEXT,                                  -- 备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 供应商评分表
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    transaction_count INTEGER DEFAULT 0,           -- 交易次数
    successful_negotiations INTEGER DEFAULT 0,     -- 成功议价次数
    average_discount_rate DECIMAL(5,2) DEFAULT 0,  -- 平均折扣率
    after_sales_rate DECIMAL(5,2) DEFAULT 0,       -- 售后服务评分
    price_competitiveness DECIMAL(5,2) DEFAULT 0,  -- 价格竞争力
    delivery_reliability DECIMAL(5,2) DEFAULT 0,   -- 交货可靠性
    quality_score DECIMAL(5,2) DEFAULT 0,          -- 质量评分
    overall_rating DECIMAL(5,2) DEFAULT 0,         -- 综合评分
    last_transaction_date TIMESTAMP WITH TIME ZONE, -- 最后交易时间
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 议价会话表
CREATE TABLE IF NOT EXISTS negotiation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) UNIQUE NOT NULL,       -- 会话标识符
    procurement_request_id UUID REFERENCES procurement_requests(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE,
    target_price DECIMAL(12,2) NOT NULL,           -- 目标价格
    initial_quote DECIMAL(12,2) NOT NULL,          -- 初始报价
    current_round INTEGER DEFAULT 1,               -- 当前轮次
    max_rounds INTEGER DEFAULT 5,                  -- 最大轮次
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'negotiating', 'success', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER,                        -- 总时长(分钟)
    final_discount_rate DECIMAL(5,2),              -- 最终折扣率
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 索引优化
CREATE INDEX IF NOT EXISTS idx_negotiation_strategies_active ON negotiation_strategies(is_active);
CREATE INDEX IF NOT EXISTS idx_negotiation_strategies_type ON negotiation_strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_strategies_priority ON negotiation_strategies(priority);

CREATE INDEX IF NOT EXISTS idx_negotiation_history_session ON negotiation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_history_supplier ON negotiation_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_history_status ON negotiation_history(negotiation_status);
CREATE INDEX IF NOT EXISTS idx_negotiation_history_created_at ON negotiation_history(created_at);

CREATE INDEX IF NOT EXISTS idx_supplier_ratings_supplier ON supplier_ratings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_rating ON supplier_ratings(overall_rating);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_transaction ON supplier_ratings(transaction_count);

CREATE INDEX IF NOT EXISTS idx_negotiation_sessions_status ON negotiation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_negotiation_sessions_supplier ON negotiation_sessions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_sessions_created_at ON negotiation_sessions(created_at);

-- 6. RLS策略
ALTER TABLE negotiation_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_sessions ENABLE ROW LEVEL SECURITY;

-- 议价策略RLS策略
CREATE POLICY "用户可以查看激活的议价策略" ON negotiation_strategies
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理议价策略" ON negotiation_strategies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 议价历史RLS策略
CREATE POLICY "用户可以查看相关的议价历史" ON negotiation_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM procurement_requests pr 
            WHERE pr.id = procurement_request_id 
            AND pr.created_by = (SELECT auth.uid()::text)
        )
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 供应商评分RLS策略
CREATE POLICY "任何人都可以查看供应商评分" ON supplier_ratings
    FOR SELECT USING (true);

CREATE POLICY "管理员可以更新供应商评分" ON supplier_ratings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 议价会话RLS策略
CREATE POLICY "用户可以查看自己的议价会话" ON negotiation_sessions
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "用户可以创建议价会话" ON negotiation_sessions
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
    );

-- 7. 触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_negotiation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_negotiation_strategies_updated_at 
    BEFORE UPDATE ON negotiation_strategies 
    FOR EACH ROW EXECUTE FUNCTION update_negotiation_updated_at();

CREATE TRIGGER update_negotiation_history_updated_at 
    BEFORE UPDATE ON negotiation_history 
    FOR EACH ROW EXECUTE FUNCTION update_negotiation_updated_at();

CREATE TRIGGER update_supplier_ratings_updated_at 
    BEFORE UPDATE ON supplier_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_negotiation_updated_at();

CREATE TRIGGER update_negotiation_sessions_updated_at 
    BEFORE UPDATE ON negotiation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_negotiation_updated_at();

-- 8. 初始化默认议价策略
INSERT INTO negotiation_strategies (name, description, strategy_type, conditions, actions, priority) VALUES
('价格敏感型策略', '针对价格敏感的采购需求，追求最大折扣', 'price_based',
 '{"minDiscountRate": 5, "maxPriceDeviation": 10}', 
 '{"priceAdjustment": -3, "deliveryTimeFlexibility": 2}', 1),

('质量优先策略', '针对质量要求高的产品，适度让步换取更好质量保证', 'quality_based',
 '{"supplierRatingThreshold": 4.0}', 
 '{"priceAdjustment": -1, "qualityGuarantee": "extended_warranty"}', 2),

('紧急采购策略', '针对紧急需求，快速决策', 'urgency_based',
 '{"urgencyLevel": "urgent", "maxRounds": 3}', 
 '{"priceAdjustment": -2, "fastDelivery": true}', 3),

('长期合作策略', '维护长期供应商关系，在合理范围内接受价格', 'relationship_based',
 '{"transactionCountThreshold": 10, "successfulNegotiationsRatio": 0.7}', 
 '{"priceAdjustment": -1, "longTermContract": true}', 4)
ON CONFLICT DO NOTHING;

-- 9. 初始化示例供应商评分数据
INSERT INTO supplier_ratings (supplier_id, transaction_count, successful_negotiations, average_discount_rate, after_sales_rate, price_competitiveness, overall_rating)
SELECT 
    s.id,
    FLOOR(RANDOM() * 50)::INTEGER,           -- 随机交易次数 0-50
    FLOOR(RANDOM() * 30)::INTEGER,           -- 随机成功议价次数
    ROUND(RANDOM() * 15, 2),                 -- 随机平均折扣率 0-15%
    ROUND(3.0 + RANDOM() * 2, 2),            -- 售后评分 3.0-5.0
    ROUND(3.0 + RANDOM() * 2, 2),            -- 价格竞争力 3.0-5.0
    ROUND(3.0 + RANDOM() * 2, 2)             -- 综合评分 3.0-5.0
FROM suppliers s
WHERE NOT EXISTS (
    SELECT 1 FROM supplier_ratings sr WHERE sr.supplier_id = s.id
)
LIMIT 10;
