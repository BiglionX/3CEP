-- 现有表结构智能扩展 (B004)
-- 扩展foreign_trade_partners表以支持智能采购功能

-- 1. 扩展foreign_trade_partners表字段
ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    intelligence_rating DECIMAL(3,2) CHECK (intelligence_rating >= 0 AND intelligence_rating <= 5);

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    cooperation_depth VARCHAR(20) CHECK (cooperation_depth IN ('strategic', 'preferred', 'standard', 'casual'));

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    last_evaluation_date DATE;

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    risk_exposure_level VARCHAR(10) CHECK (risk_exposure_level IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    preferred_categories TEXT[];  -- 优势产品品类

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    annual_trading_volume DECIMAL(15,2);  -- 年交易额

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    delivery_performance_score DECIMAL(3,2) CHECK (delivery_performance_score >= 0 AND delivery_performance_score <= 5);

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    quality_complaint_rate DECIMAL(5,4) CHECK (quality_complaint_rate >= 0 AND quality_complaint_rate <= 1);

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    payment_terms_days INTEGER;  -- 标准付款账期天数

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    certification_status JSONB;  -- 认证状态：{"iso9001": true, "iso14001": false, "sa8000": true}

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    geographical_coverage TEXT[];  -- 服务地理范围

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    lead_time_avg_days INTEGER;  -- 平均交货天数

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    minimum_order_quantity INTEGER;  -- 最小起订量

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    price_fluctuation_tolerance DECIMAL(3,2) CHECK (price_fluctuation_tolerance >= 0 AND price_fluctuation_tolerance <= 1);

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    sustainability_score DECIMAL(3,2) CHECK (sustainability_score >= 0 AND sustainability_score <= 5);

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    digital_integration_level VARCHAR(20) CHECK (digital_integration_level IN ('basic', 'intermediate', 'advanced', 'fully_digital'));

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    last_communication_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    relationship_manager_id UUID REFERENCES auth.users(id);  -- 客户经理

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    collaboration_projects JSONB;  -- 合作项目记录

ALTER TABLE foreign_trade_partners ADD COLUMN IF NOT EXISTS 
    performance_history JSONB;  -- 历史表现记录

-- 2. 创建供应商智能评估历史表
CREATE TABLE IF NOT EXISTS supplier_intelligence_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL,
    intelligence_rating DECIMAL(3,2) CHECK (intelligence_rating >= 0 AND intelligence_rating <= 5),
    cooperation_depth VARCHAR(20) CHECK (cooperation_depth IN ('strategic', 'preferred', 'standard', 'casual')),
    risk_exposure_level VARCHAR(10) CHECK (risk_exposure_level IN ('low', 'medium', 'high', 'critical')),
    capability_scores JSONB,  -- 各维度能力评分
    evaluation_factors JSONB,  -- 评估因子详情
    evaluator_id UUID REFERENCES auth.users(id),
    evaluation_method VARCHAR(50),  -- 评估方法
    confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建供应商交易历史明细表
CREATE TABLE IF NOT EXISTS supplier_transaction_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    order_id UUID,  -- 关联订单ID（如果有）
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'payment', 'refund', 'adjustment')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    transaction_date DATE NOT NULL,
    due_date DATE,  -- 到期日
    actual_payment_date DATE,  -- 实际付款日
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),  -- 付款方式
    invoice_number VARCHAR(50),  -- 发票号
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建供应商沟通记录表
CREATE TABLE IF NOT EXISTS supplier_communication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'video_call', 'chat', 'document')),
    subject VARCHAR(200),
    content TEXT,
    communication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,  -- 沟通时长（分钟）
    participants JSONB,  -- 参与人员
    outcome VARCHAR(500),  -- 沟通结果
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_deadline DATE,
    attachment_urls TEXT[],  -- 附件链接
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建供应商风险事件表
CREATE TABLE IF NOT EXISTS supplier_risk_events_extended (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- delay, quality_issue, financial_problem, compliance_violation
    severity_level VARCHAR(10) NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    event_date DATE NOT NULL,
    resolution_target_date DATE,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATE,
    resolution_cost DECIMAL(12,2),  -- 解决成本
    impact_score DECIMAL(3,2) CHECK (impact_score >= 0 AND impact_score <= 5),  -- 影响评分
    affected_orders JSONB,  -- 受影响的订单
    root_cause_analysis TEXT,  -- 根因分析
    corrective_actions JSONB,  -- 纠正措施
    preventive_measures JSONB,  -- 预防措施
    responsible_party VARCHAR(100),  -- 责任方
    reported_by UUID REFERENCES auth.users(id),
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建供应商协作项目表
CREATE TABLE IF NOT EXISTS supplier_collaboration_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES foreign_trade_partners(id) ON DELETE CASCADE,
    project_name VARCHAR(200) NOT NULL,
    project_type VARCHAR(50) NOT NULL,  -- joint_development, cost_reduction, quality_improvement, innovation
    start_date DATE NOT NULL,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled', 'on_hold')),
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    expected_benefits JSONB,  -- 预期收益
    actual_outcomes JSONB,    -- 实际成果
    project_manager UUID REFERENCES auth.users(id),
    team_members JSONB,       -- 项目团队成员
    milestones JSONB,         -- 里程碑计划
    risks JSONB,             -- 项目风险
    lessons_learned TEXT,    -- 经验教训
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_partners_intelligence_rating ON foreign_trade_partners(intelligence_rating DESC);
CREATE INDEX IF NOT EXISTS idx_partners_cooperation_depth ON foreign_trade_partners(cooperation_depth);
CREATE INDEX IF NOT EXISTS idx_partners_risk_level ON foreign_trade_partners(risk_exposure_level);
CREATE INDEX IF NOT EXISTS idx_partners_last_evaluation ON foreign_trade_partners(last_evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_partners_relationship_manager ON foreign_trade_partners(relationship_manager_id);

CREATE INDEX IF NOT EXISTS idx_intelligence_history_partner_date ON supplier_intelligence_history(partner_id, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_history_rating ON supplier_intelligence_history(intelligence_rating DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_details_partner_date ON supplier_transaction_details(partner_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_details_status ON supplier_transaction_details(status);
CREATE INDEX IF NOT EXISTS idx_transaction_details_type_date ON supplier_transaction_details(transaction_type, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_communication_logs_partner_date ON supplier_communication_logs(partner_id, communication_date DESC);
CREATE INDEX IF NOT EXISTS idx_communication_logs_type_date ON supplier_communication_logs(communication_type, communication_date DESC);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_by ON supplier_communication_logs(created_by, communication_date DESC);

CREATE INDEX IF NOT EXISTS idx_risk_events_partner_date ON supplier_risk_events_extended(partner_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_events_type_severity ON supplier_risk_events_extended(event_type, severity_level);
CREATE INDEX IF NOT EXISTS idx_risk_events_resolved ON supplier_risk_events_extended(resolved, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_collaboration_projects_partner_status ON supplier_collaboration_projects(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_collaboration_projects_dates ON supplier_collaboration_projects(start_date, planned_end_date);
CREATE INDEX IF NOT EXISTS idx_collaboration_projects_manager ON supplier_collaboration_projects(project_manager, created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_transaction_details_updated_at 
    BEFORE UPDATE ON supplier_transaction_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_risk_events_extended_updated_at 
    BEFORE UPDATE ON supplier_risk_events_extended 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_collaboration_projects_updated_at 
    BEFORE UPDATE ON supplier_collaboration_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略 (RLS)
ALTER TABLE supplier_intelligence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_risk_events_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_collaboration_projects ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能访问自己公司的供应商相关数据
CREATE POLICY "Users can view intelligence history for their partners" 
ON supplier_intelligence_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners ftp
        WHERE ftp.id = supplier_intelligence_history.partner_id 
        AND ftp.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view transaction details for their partners" 
ON supplier_transaction_details FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners ftp
        WHERE ftp.id = supplier_transaction_details.partner_id 
        AND ftp.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view communication logs for their partners" 
ON supplier_communication_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM foreign_trade_partners ftp
        WHERE ftp.id = supplier_communication_logs.partner_id 
        AND ftp.created_by = auth.uid()
    )
);

-- 管理员权限策略
CREATE POLICY "Admins have full access to supplier intelligence tables" 
ON supplier_intelligence_history FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins have full access to supplier transaction details" 
ON supplier_transaction_details FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 创建视图：供应商综合评估视图
CREATE OR REPLACE VIEW supplier_comprehensive_assessment AS
SELECT 
    ftp.id as partner_id,
    ftp.name as supplier_name,
    ftp.type,
    ftp.country,
    ftp.intelligence_rating,
    ftp.cooperation_depth,
    ftp.risk_exposure_level,
    ftp.delivery_performance_score,
    ftp.quality_complaint_rate,
    ftp.annual_trading_volume,
    ftp.sustainability_score,
    COUNT(stx.id) as transaction_count,
    SUM(CASE WHEN stx.status = 'completed' THEN stx.amount ELSE 0 END) as total_completed_amount,
    AVG(CASE WHEN sre.severity_level = 'high' OR sre.severity_level = 'critical' THEN 1 ELSE 0 END) as high_risk_incident_rate,
    MAX(sih.evaluation_date) as last_evaluation_date,
    COUNT(scp.id) as active_projects
FROM foreign_trade_partners ftp
LEFT JOIN supplier_transaction_details stx ON ftp.id = stx.partner_id AND stx.status = 'completed'
LEFT JOIN supplier_risk_events_extended sre ON ftp.id = sre.partner_id AND sre.resolved = FALSE
LEFT JOIN supplier_intelligence_history sih ON ftp.id = sih.partner_id
LEFT JOIN supplier_collaboration_projects scp ON ftp.id = scp.partner_id AND scp.status = 'ongoing'
WHERE ftp.status = 'active'
GROUP BY ftp.id, ftp.name, ftp.type, ftp.country, ftp.intelligence_rating, 
         ftp.cooperation_depth, ftp.risk_exposure_level, ftp.delivery_performance_score,
         ftp.quality_complaint_rate, ftp.annual_trading_volume, ftp.sustainability_score;

-- 创建视图：供应商风险预警视图
CREATE OR REPLACE VIEW supplier_risk_alerts AS
SELECT 
    ftp.id as partner_id,
    ftp.name as supplier_name,
    ftp.risk_exposure_level,
    ftp.intelligence_rating,
    COUNT(CASE WHEN sre.severity_level = 'high' THEN 1 END) as high_severity_events,
    COUNT(CASE WHEN sre.severity_level = 'critical' THEN 1 END) as critical_severity_events,
    COUNT(CASE WHEN sre.event_type = 'delay' AND sre.event_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_delays,
    COUNT(CASE WHEN sre.event_type = 'quality_issue' AND sre.event_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_quality_issues,
    CASE 
        WHEN ftp.risk_exposure_level = 'critical' THEN 'immediate_attention'
        WHEN ftp.risk_exposure_level = 'high' AND (
            COUNT(CASE WHEN sre.severity_level = 'high' THEN 1 END) > 2 OR
            COUNT(CASE WHEN sre.severity_level = 'critical' THEN 1 END) > 0
        ) THEN 'high_priority'
        WHEN ftp.risk_exposure_level = 'medium' AND (
            COUNT(CASE WHEN sre.event_type = 'delay' THEN 1 END) > 3 OR
            COUNT(CASE WHEN sre.event_type = 'quality_issue' THEN 1 END) > 2
        ) THEN 'monitoring_required'
        ELSE 'normal'
    END as risk_status
FROM foreign_trade_partners ftp
LEFT JOIN supplier_risk_events_extended sre ON ftp.id = sre.partner_id 
    AND sre.event_date >= CURRENT_DATE - INTERVAL '90 days'
WHERE ftp.status = 'active'
GROUP BY ftp.id, ftp.name, ftp.risk_exposure_level, ftp.intelligence_rating;