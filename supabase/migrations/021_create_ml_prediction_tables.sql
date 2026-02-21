-- 创建机器学习预测相关表
-- 任务ID: DATA-303 - 机器学习集成（预测）

-- ML预测结果表
CREATE TABLE IF NOT EXISTS ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('demand', 'price')),
    product_id VARCHAR(100) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    platform VARCHAR(50), -- 电商平台，如 taobao, jd, tmall
    
    -- 预测参数
    horizon_days INTEGER NOT NULL DEFAULT 30,
    prediction_options JSONB, -- 预测选项配置
    
    -- 预测结果
    prediction_result JSONB NOT NULL, -- 完整的预测结果
    predicted_values JSONB, -- 格式化的预测值数组
    
    -- 模型信息
    model_used VARCHAR(100) DEFAULT 'deepseek-chat',
    model_version VARCHAR(50),
    raw_model_response TEXT, -- 原始模型响应
    
    -- 准确性评估
    actual_values JSONB, -- 实际值（后续用于准确率计算）
    accuracy_metrics JSONB, -- 准确性指标
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 索引优化
    INDEX idx_ml_predictions_product_created (product_id, created_at DESC),
    INDEX idx_ml_predictions_type_created (prediction_type, created_at DESC),
    INDEX idx_ml_predictions_warehouse (warehouse_id, created_at DESC)
);

-- ML模型配置表
CREATE TABLE IF NOT EXISTS ml_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('demand', 'price', 'general')),
    provider VARCHAR(50) NOT NULL, -- deepseek, tongyi, openai等
    api_endpoint TEXT,
    api_key_encrypted TEXT, -- 加密存储的API密钥
    model_params JSONB, -- 模型参数配置
    prompt_templates JSONB, -- 提示词模板
    
    -- 性能指标
    avg_response_time INTEGER, -- 平均响应时间(ms)
    success_rate DECIMAL(5,2), -- 成功率(%)
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- 状态管理
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_ml_models_active (is_active),
    INDEX idx_ml_models_type (model_type)
);

-- 预测任务队列表（支持异步预测）
CREATE TABLE IF NOT EXISTS ml_prediction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('single', 'batch')),
    prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('demand', 'price')),
    
    -- 任务参数
    job_params JSONB NOT NULL,
    priority INTEGER DEFAULT 1, -- 任务优先级 1-10
    
    -- 执行状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 结果引用
    result_id UUID REFERENCES ml_predictions(id) ON DELETE SET NULL,
    error_message TEXT,
    
    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    INDEX idx_ml_jobs_status_priority (status, priority DESC),
    INDEX idx_ml_jobs_created (created_at DESC)
);

-- 预测准确率历史表
CREATE TABLE IF NOT EXISTS prediction_accuracy_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES ml_predictions(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL,
    
    -- 实际值vs预测值
    actual_value NUMERIC(15,2),
    predicted_value NUMERIC(15,2),
    lower_bound NUMERIC(15,2),
    upper_bound NUMERIC(15,2),
    
    -- 误差指标
    absolute_error NUMERIC(15,2),
    percentage_error DECIMAL(5,2),
    is_within_confidence BOOLEAN,
    
    -- 评估维度
    evaluation_metric VARCHAR(50), -- MAE, RMSE, MAPE等
    confidence_level DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_accuracy_prediction (prediction_id),
    INDEX idx_accuracy_date (evaluation_date)
);

-- 插入默认模型配置
INSERT INTO ml_model_configs (
    model_name,
    model_type,
    provider,
    api_endpoint,
    model_params,
    prompt_templates,
    is_active,
    is_default
) VALUES 
(
    'deepseek-chat-demand',
    'demand',
    'deepseek',
    'https://api.deepseek.com/v1/chat/completions',
    '{"temperature": 0.3, "max_tokens": 2000}',
    '{"demand_template": "需求预测标准模板", "price_template": "价格预测标准模板"}',
    true,
    true
),
(
    'deepseek-chat-price',
    'price',
    'deepseek',
    'https://api.deepseek.com/v1/chat/completions',
    '{"temperature": 0.3, "max_tokens": 2000}',
    '{"demand_template": "需求预测标准模板", "price_template": "价格预测标准模板"}',
    true,
    true
)
ON CONFLICT (model_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 创建触发器函数更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_ml_predictions_updated_at
    BEFORE UPDATE ON ml_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_model_configs_updated_at
    BEFORE UPDATE ON ml_model_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：预测任务统计
CREATE OR REPLACE VIEW ml_prediction_statistics AS
SELECT 
    prediction_type,
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_predictions,
    AVG(CASE WHEN status = 'completed' THEN progress_percentage END) as avg_completion_rate,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as avg_processing_minutes,
    MAX(created_at) as last_prediction_time
FROM ml_prediction_jobs
GROUP BY prediction_type;

-- 创建视图：模型性能统计
CREATE OR REPLACE VIEW ml_model_performance AS
SELECT 
    mc.model_name,
    mc.model_type,
    mc.provider,
    COUNT(mp.id) as total_predictions,
    AVG(pa.percentage_error) as avg_error_rate,
    AVG(CASE WHEN pa.is_within_confidence THEN 1.0 ELSE 0.0 END) as confidence_accuracy,
    MAX(mp.created_at) as last_used
FROM ml_model_configs mc
LEFT JOIN ml_predictions mp ON mc.model_name = mp.model_used
LEFT JOIN prediction_accuracy_history pa ON mp.id = pa.prediction_id
WHERE mc.is_active = true
GROUP BY mc.model_name, mc.model_type, mc.provider;

-- RLS策略设置
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_prediction_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_accuracy_history ENABLE ROW LEVEL SECURITY;

-- 为管理员角色设置RLS策略
CREATE POLICY "Admin full access to ml_predictions" ON ml_predictions
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = auth.uid() 
        AND r.name = 'admin'
    )
);

CREATE POLICY "Admin full access to ml_model_configs" ON ml_model_configs
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = auth.uid() 
        AND r.name = 'admin'
    )
);

-- 为普通用户设置只读权限
CREATE POLICY "Users can view own predictions" ON ml_predictions
FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = auth.uid() 
        AND r.permissions ? 'ml.predictions.read'
    )
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_ml_predictions_composite 
ON ml_predictions (prediction_type, product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ml_jobs_composite 
ON ml_prediction_jobs (status, priority DESC, created_at);

CREATE INDEX IF NOT EXISTS idx_accuracy_composite 
ON prediction_accuracy_history (prediction_id, evaluation_date);

COMMENT ON TABLE ml_predictions IS '机器学习预测结果存储表';
COMMENT ON TABLE ml_model_configs IS 'ML模型配置和管理表';
COMMENT ON TABLE ml_prediction_jobs IS '预测任务队列表（支持异步处理）';
COMMENT ON TABLE prediction_accuracy_history IS '预测准确率历史记录表';