-- V-FUSE-03: 用户反馈收集系统
-- 创建估值反馈表和相关索引

-- 1. 创建估值反馈表
CREATE TABLE IF NOT EXISTS valuation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES device_profiles(id) ON DELETE CASCADE,
    valuation_value DECIMAL(10,2) NOT NULL,
    user_feedback VARCHAR(20) NOT NULL CHECK (user_feedback IN ('reasonable', 'unreasonable', 'too_high', 'too_low')),
    feedback_reason TEXT,
    actual_transaction_price DECIMAL(10,2),
    feedback_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_device_id ON valuation_feedback(device_id);
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_user_id ON valuation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_feedback_type ON valuation_feedback(user_feedback);
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_created_at ON valuation_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_valuation_range ON valuation_feedback(valuation_value);

-- 3. 创建复合索引用于分析查询
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_analysis ON valuation_feedback(device_id, user_feedback, created_at);
CREATE INDEX IF NOT EXISTS idx_valuation_feedback_session ON valuation_feedback(session_id, created_at);

-- 4. 创建反馈统计视图
CREATE OR REPLACE VIEW valuation_feedback_stats AS
SELECT 
    device_id,
    COUNT(*) as total_feedback_count,
    COUNT(CASE WHEN user_feedback = 'reasonable' THEN 1 END) as reasonable_count,
    COUNT(CASE WHEN user_feedback = 'unreasonable' THEN 1 END) as unreasonable_count,
    COUNT(CASE WHEN user_feedback = 'too_high' THEN 1 END) as too_high_count,
    COUNT(CASE WHEN user_feedback = 'too_low' THEN 1 END) as too_low_count,
    ROUND(
        COUNT(CASE WHEN user_feedback = 'reasonable' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as reasonable_percentage,
    AVG(valuation_value) as avg_valuation_value,
    AVG(actual_transaction_price) as avg_actual_price,
    COUNT(actual_transaction_price) as transaction_count
FROM valuation_feedback
GROUP BY device_id;

-- 5. 创建月度反馈趋势视图
CREATE OR REPLACE VIEW monthly_feedback_trends AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    user_feedback,
    COUNT(*) as feedback_count,
    COUNT(DISTINCT device_id) as unique_devices,
    AVG(valuation_value) as avg_valuation
FROM valuation_feedback
GROUP BY DATE_TRUNC('month', created_at), user_feedback
ORDER BY month DESC, feedback_count DESC;

-- 6. 创建行级安全策略(RLS)
ALTER TABLE valuation_feedback ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的反馈
CREATE POLICY "Users can view own feedback" 
ON valuation_feedback FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- 用户可以插入自己的反馈
CREATE POLICY "Users can insert own feedback" 
ON valuation_feedback FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- 管理员可以查看所有反馈
CREATE POLICY "Admins can view all feedback" 
ON valuation_feedback FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- 7. 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_valuation_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_valuation_feedback_updated_at
    BEFORE UPDATE ON valuation_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_valuation_feedback_updated_at();

-- 8. 插入示例数据（可选）
/*
INSERT INTO valuation_feedback (
    device_id,
    valuation_value,
    user_feedback,
    feedback_reason,
    actual_transaction_price,
    user_id,
    session_id
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    4500.00,
    'reasonable',
    '价格符合市场预期，成色评估准确',
    4450.00,
    '00000000-0000-0000-0000-000000000002',
    'session_12345'
),
(
    '00000000-0000-0000-0000-000000000001',
    3800.00,
    'too_low',
    '同型号设备在闲鱼上能卖到4200元以上',
    NULL,
    '00000000-0000-0000-0000-000000000003',
    'session_67890'
);
*/

-- 9. 验证表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'valuation_feedback'
ORDER BY ordinal_position;

-- 10. 验证索引
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'valuation_feedback';

-- 11. 验证视图
SELECT 
    viewname,
    definition
FROM pg_views 
WHERE viewname LIKE '%feedback%';

COMMENT ON TABLE valuation_feedback IS '设备估值用户反馈表，用于收集用户对估值结果的满意度和建议';
COMMENT ON COLUMN valuation_feedback.user_feedback IS '用户反馈类型: reasonable(合理), unreasonable(不合理), too_high(估价过高), too_low(估价过低)';
COMMENT ON COLUMN valuation_feedback.feedback_reason IS '用户反馈的具体原因说明';
COMMENT ON COLUMN valuation_feedback.actual_transaction_price IS '实际成交价格（如果用户提供）';
COMMENT ON COLUMN valuation_feedback.session_id IS '会话ID，用于跟踪用户会话';