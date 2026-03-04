-- 采购决策记录与审计系统表结构 (B003)
-- 用于记录完整的采购决策过程，支持全流程审计和决策追溯

-- 1. 决策流程节点定义表
CREATE TABLE IF NOT EXISTS decision_process_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    node_code VARCHAR(50) UNIQUE NOT NULL,
    node_name VARCHAR(100) NOT NULL,
    node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('input', 'processing', 'evaluation', 'decision', 'output', 'feedback')),
    description TEXT,
    required_fields JSONB,  -- 该节点必需的输入字段定义
    optional_fields JSONB,  -- 可选字段定义
    expected_output JSONB,  -- 期望输出格式定义
    execution_timeout INTEGER,  -- 执行超时时间(秒)
    retry_count INTEGER DEFAULT 3,  -- 重试次数
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 采购决策主记录表
CREATE TABLE IF NOT EXISTS procurement_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL,  -- 关联原始采购请求
    company_id UUID NOT NULL,
    decision_type VARCHAR(50) NOT NULL,  -- 决策类型：supplier_selection, price_negotiation, contract_approval, risk_assessment
    decision_subtype VARCHAR(50),  -- 子类型：specific_supplier, price_range, contract_terms等
    decision_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (decision_status IN ('pending', 'processing', 'completed', 'cancelled', 'rejected')),
    priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_duration_ms INTEGER,  -- 总执行时间毫秒
    final_outcome JSONB,  -- 最终决策结果JSON
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    alternative_options JSONB,  -- 备选方案
    rejection_reason TEXT,  -- 拒绝原因（如果被拒绝）
    created_by UUID REFERENCES auth.users(id),  -- 创建用户
    approved_by UUID REFERENCES auth.users(id),  -- 审批用户
    metadata JSONB,  -- 扩展元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 决策过程轨迹记录表
CREATE TABLE IF NOT EXISTS decision_process_trails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decision_id UUID NOT NULL REFERENCES procurement_decisions(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES decision_process_nodes(id),
    execution_order INTEGER NOT NULL,
    parent_trail_id UUID REFERENCES decision_process_trails(id) ON DELETE SET NULL,  -- 支持树状结构
    input_data JSONB,  -- 输入数据快照（完整数据）
    input_summary JSONB,  -- 输入数据摘要（关键字段）
    processing_params JSONB,  -- 处理参数（如权重配置、算法参数）
    output_data JSONB,  -- 输出结果完整数据
    output_summary JSONB,  -- 输出结果摘要
    execution_time_ms INTEGER,  -- 实际执行耗时毫秒
    memory_usage_kb INTEGER,  -- 内存使用量KB
    cpu_time_ms INTEGER,  -- CPU时间毫秒
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_code VARCHAR(50),  -- 错误代码
    error_message TEXT,  -- 错误详细信息
    stack_trace TEXT,  -- 错误堆栈跟踪
    user_interactions JSONB,  -- 用户交互记录：[{action, timestamp, user_id, details}]
    system_recommendations JSONB,  -- 系统建议记录
    manual_adjustments JSONB,  -- 人工调整记录：[{field, old_value, new_value, reason, user_id, timestamp}]
    checkpoint_data JSONB,  -- 检查点数据（用于恢复）
    version_tag VARCHAR(20),  -- 版本标识
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 决策因素权重配置表
CREATE TABLE IF NOT EXISTS decision_weight_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decision_type VARCHAR(50) NOT NULL,
    configuration_name VARCHAR(100) NOT NULL,
    weights JSONB NOT NULL,  -- 权重配置：{"quality": 0.3, "price": 0.25, "delivery": 0.2, "service": 0.15, "innovation": 0.1}
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    description TEXT,
    applicable_scenarios TEXT[],  -- 适用场景标签
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(decision_type, configuration_name)
);

-- 5. 决策规则引擎表
CREATE TABLE IF NOT EXISTS decision_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    decision_type VARCHAR(50) NOT NULL,
    rule_condition JSONB NOT NULL,  -- 规则条件表达式
    rule_action JSONB NOT NULL,     -- 规则动作定义
    priority INTEGER DEFAULT 100,   -- 优先级，数值越小优先级越高
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 用户决策行为记录表
CREATE TABLE IF NOT EXISTS user_decision_behaviors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    decision_id UUID NOT NULL REFERENCES procurement_decisions(id) ON DELETE CASCADE,
    behavior_type VARCHAR(50) NOT NULL,  -- 查看、修改、确认、驳回等
    behavior_details JSONB,  -- 行为详细信息
    previous_state JSONB,    -- 操作前状态
    current_state JSONB,     -- 操作后状态
    session_id VARCHAR(100), -- 会话ID
    ip_address VARCHAR(45),  -- IP地址
    user_agent TEXT,         -- 用户代理
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 决策质量评估表
CREATE TABLE IF NOT EXISTS decision_quality_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decision_id UUID NOT NULL REFERENCES procurement_decisions(id) ON DELETE CASCADE,
    evaluation_period_days INTEGER NOT NULL DEFAULT 90,  -- 评估周期天数
    actual_outcome JSONB,  -- 实际结果
    predicted_outcome JSONB,  -- 预测结果
    accuracy_score DECIMAL(3,2),  -- 准确度评分
    cost_benefit_ratio DECIMAL(8,4),  -- 成本效益比
    roi_percentage DECIMAL(8,2),     -- 投资回报率%
    risk_realization_rate DECIMAL(3,2), -- 风险实现率
    supplier_performance_score DECIMAL(3,2), -- 供应商实际表现评分
    evaluation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluator_id UUID REFERENCES auth.users(id),
    notes TEXT
);

-- 8. 决策模板表
CREATE TABLE IF NOT EXISTS decision_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    decision_type VARCHAR(50) NOT NULL,
    template_description TEXT,
    node_sequence JSONB NOT NULL,  -- 节点执行顺序
    default_weights JSONB,         -- 默认权重配置
    required_parameters JSONB,     -- 必需参数定义
    optional_parameters JSONB,     -- 可选参数定义
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0, -- 使用次数统计
    average_execution_time_ms INTEGER, -- 平均执行时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_decision_nodes_code ON decision_process_nodes(node_code);
CREATE INDEX IF NOT EXISTS idx_decision_nodes_type ON decision_process_nodes(node_type);

CREATE INDEX IF NOT EXISTS idx_procurement_decisions_request ON procurement_decisions(request_id);
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_company ON procurement_decisions(company_id);
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_type_status ON procurement_decisions(decision_type, decision_status);
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_created_by ON procurement_decisions(created_by);
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_start_time ON procurement_decisions(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_process_trails_decision ON decision_process_trails(decision_id);
CREATE INDEX IF NOT EXISTS idx_process_trails_node ON decision_process_trails(node_id);
CREATE INDEX IF NOT EXISTS idx_process_trails_order ON decision_process_trails(decision_id, execution_order);
CREATE INDEX IF NOT EXISTS idx_process_trails_success ON decision_process_trails(success, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_process_trails_parent ON decision_process_trails(parent_trail_id);

CREATE INDEX IF NOT EXISTS idx_weight_configs_type_default ON decision_weight_configurations(decision_type, is_default DESC);
CREATE INDEX IF NOT EXISTS idx_weight_configs_active ON decision_weight_configurations(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_rules_type_active ON decision_rules(decision_type, is_active);
CREATE INDEX IF NOT EXISTS idx_decision_rules_priority ON decision_rules(priority, is_active);

CREATE INDEX IF NOT EXISTS idx_user_behaviors_user ON user_decision_behaviors(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_decision ON user_decision_behaviors(decision_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_type ON user_decision_behaviors(behavior_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_decision ON decision_quality_metrics(decision_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_evaluator ON decision_quality_metrics(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_timestamp ON decision_quality_metrics(evaluation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_templates_type_active ON decision_templates(decision_type, is_active);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON decision_templates(usage_count DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_decision_process_nodes_updated_at 
    BEFORE UPDATE ON decision_process_nodes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_decisions_updated_at 
    BEFORE UPDATE ON procurement_decisions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_weight_configurations_updated_at 
    BEFORE UPDATE ON decision_weight_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_rules_updated_at 
    BEFORE UPDATE ON decision_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_templates_updated_at 
    BEFORE UPDATE ON decision_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略 (RLS)
ALTER TABLE decision_process_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_process_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_weight_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decision_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_templates ENABLE ROW LEVEL SECURITY;

-- 基础RLS策略
CREATE POLICY "Users can view decision nodes" ON decision_process_nodes 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own decisions" ON procurement_decisions 
FOR SELECT USING (
    company_id IN (
        SELECT eu.company_id 
        FROM enterprise_users eu 
        WHERE eu.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view trails for their decisions" ON decision_process_trails 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM procurement_decisions pd
        WHERE pd.id = decision_process_trails.decision_id
        AND pd.company_id IN (
            SELECT eu.company_id 
            FROM enterprise_users eu 
            WHERE eu.user_id = auth.uid()
        )
    )
);

-- 管理员权限策略
CREATE POLICY "Admins have full access to decision nodes" ON decision_process_nodes 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins have full access to weight configs" ON decision_weight_configurations 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins have full access to decision rules" ON decision_rules 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 初始化基础决策节点定义
INSERT INTO decision_process_nodes (node_code, node_name, node_type, description, required_fields, execution_timeout) VALUES
('INPUT_REQUIREMENTS', '需求输入解析', 'input', '解析用户输入的采购需求', '{"description": "text", "quantity": "number", "specifications": "object"}', 30),
('SUPPLIER_FETCH', '供应商数据获取', 'processing', '获取符合条件的供应商信息', '{"category": "string", "region": "string"}', 60),
('PRICE_ANALYSIS', '价格分析', 'evaluation', '分析供应商报价和市场价格趋势', '{"supplier_prices": "array", "market_indices": "array"}', 45),
('RISK_ASSESSMENT', '风险评估', 'evaluation', '评估供应商和交易风险', '{"supplier_profile": "object", "market_conditions": "object"}', 60),
('MATCHING_SCORE', '智能匹配评分', 'processing', '计算供应商综合匹配度', '{"capability_scores": "object", "weights": "object"}', 30),
('DECISION_MAKING', '最终决策', 'decision', '生成最终采购决策建议', '{"ranked_suppliers": "array", "criteria": "object"}', 20),
('OUTPUT_GENERATION', '结果输出', 'output', '生成决策报告和建议', '{"recommendations": "array", "rationale": "string"}', 15)
ON CONFLICT (node_code) DO NOTHING;

-- 初始化默认权重配置
INSERT INTO decision_weight_configurations (decision_type, configuration_name, weights, is_default, description) VALUES
('supplier_selection', '标准采购权重', 
'{"quality": 0.3, "price": 0.25, "delivery": 0.2, "service": 0.15, "innovation": 0.1}', 
TRUE, '适用于一般采购场景的标准权重配置'),
('price_negotiation', '价格敏感型权重', 
'{"price": 0.4, "quality": 0.25, "delivery": 0.2, "service": 0.1, "innovation": 0.05}', 
TRUE, '适用于价格敏感型采购场景的权重配置'),
('risk_assessment', '风险规避型权重', 
'{"quality": 0.2, "price": 0.2, "delivery": 0.2, "service": 0.2, "innovation": 0.1, "risk": 0.1}', 
TRUE, '适用于风险规避型采购场景的权重配置')
ON CONFLICT (decision_type, configuration_name) DO NOTHING;

-- 创建视图：决策执行统计
CREATE OR REPLACE VIEW decision_execution_statistics AS
SELECT 
    pd.decision_type,
    pd.decision_status,
    COUNT(*) as total_decisions,
    AVG(pd.total_duration_ms) as avg_duration_ms,
    AVG(pd.confidence_score) as avg_confidence,
    COUNT(CASE WHEN pd.success = TRUE THEN 1 END) as successful_decisions,
    ROUND(COUNT(CASE WHEN pd.success = TRUE THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM procurement_decisions pd
WHERE pd.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pd.decision_type, pd.decision_status;

-- 创建视图：用户决策行为分析
CREATE OR REPLACE VIEW user_decision_behavior_analysis AS
SELECT 
    udb.user_id,
    COUNT(DISTINCT udb.decision_id) as decisions_involved,
    COUNT(*) as total_actions,
    COUNT(CASE WHEN udb.behavior_type = 'modify' THEN 1 END) as modifications,
    COUNT(CASE WHEN udb.behavior_type = 'approve' THEN 1 END) as approvals,
    COUNT(CASE WHEN udb.behavior_type = 'reject' THEN 1 END) as rejections,
    MIN(udb.created_at) as first_activity,
    MAX(udb.created_at) as last_activity
FROM user_decision_behaviors udb
WHERE udb.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY udb.user_id;

-- 创建视图：决策质量评估汇总
CREATE OR REPLACE VIEW decision_quality_summary AS
SELECT 
    dqm.decision_id,
    pd.decision_type,
    dqm.evaluation_period_days,
    dqm.accuracy_score,
    dqm.cost_benefit_ratio,
    dqm.roi_percentage,
    dqm.risk_realization_rate,
    dqm.supplier_performance_score,
    CASE 
        WHEN dqm.accuracy_score >= 0.9 THEN 'excellent'
        WHEN dqm.accuracy_score >= 0.7 THEN 'good'
        WHEN dqm.accuracy_score >= 0.5 THEN 'fair'
        ELSE 'poor'
    END as quality_grade
FROM decision_quality_metrics dqm
JOIN procurement_decisions pd ON dqm.decision_id = pd.id
WHERE dqm.evaluation_timestamp >= CURRENT_DATE - INTERVAL '180 days';