-- 旧机型关联推荐系统表结构迁移脚本
-- 创建时间: 2026-02-20
-- 功能: 实现基于用户历史购买和扫码记录的机型升级推荐

-- 1. 新旧机型映射表 - 定义可升级的型号关系和优惠幅度
CREATE TABLE IF NOT EXISTS model_upgrade_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_model VARCHAR(100) NOT NULL,           -- 旧机型型号
    new_model VARCHAR(100) NOT NULL,           -- 新机型型号
    brand VARCHAR(50) NOT NULL,               -- 品牌
    category VARCHAR(50) NOT NULL,            -- 设备类别（手机、平板等）
    upgrade_discount_rate DECIMAL(5,4) DEFAULT 0.15,  -- 以旧换新折扣率 (0.15 = 15%)
    min_trade_value DECIMAL(10,2) DEFAULT 100,       -- 最小回收价值
    max_trade_value DECIMAL(10,2) DEFAULT 2000,      -- 最大回收价值
    compatibility_score INTEGER DEFAULT 80 CHECK (compatibility_score BETWEEN 0 AND 100), -- 兼容性评分
    upgrade_reason TEXT,                      -- 升级理由
    is_active BOOLEAN DEFAULT true,           -- 是否启用
    priority INTEGER DEFAULT 1,               -- 推荐优先级
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保同一品牌下旧机型到新机型的唯一映射
    CONSTRAINT unique_model_mapping UNIQUE (brand, old_model, new_model)
);

-- 2. 用户设备历史表 - 记录用户拥有的设备信息
CREATE TABLE IF NOT EXISTS user_device_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID,                           -- 关联设备ID（如果存在）
    brand VARCHAR(50) NOT NULL,               -- 品牌
    model VARCHAR(100) NOT NULL,              -- 型号
    category VARCHAR(50),                     -- 设备类别
    purchase_date DATE,                       -- 购买日期
    purchase_price DECIMAL(10,2),             -- 购买价格
    serial_number VARCHAR(100),               -- 序列号
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10), -- 设备状况评分
    usage_duration_months INTEGER,            -- 使用时长（月）
    source_type VARCHAR(20) DEFAULT 'purchase' CHECK (source_type IN ('purchase', 'scan', 'manual')), -- 来源类型
    source_id UUID,                           -- 来源记录ID（scan_records.id 或 orders.id）
    is_current BOOLEAN DEFAULT true,          -- 是否仍在使用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引优化
    CONSTRAINT unique_user_device UNIQUE (user_id, brand, model, serial_number)
);

-- 3. 推荐记录表 - 记录给用户推荐的历史
CREATE TABLE IF NOT EXISTS upgrade_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_model VARCHAR(100) NOT NULL,          -- 推荐的旧机型
    new_model VARCHAR(100) NOT NULL,          -- 推荐的新机型
    brand VARCHAR(50) NOT NULL,               -- 品牌
    predicted_trade_value DECIMAL(10,2),      -- 预估回收价值
    discount_amount DECIMAL(10,2),            -- 折扣金额
    discount_rate DECIMAL(5,4),               -- 折扣率
    recommendation_score DECIMAL(5,4),        -- 推荐得分 (0-1)
    recommendation_reason TEXT,               -- 推荐理由
    clicked BOOLEAN DEFAULT false,            -- 是否点击查看详情
    converted BOOLEAN DEFAULT false,          -- 是否完成转换（下单）
    conversion_date TIMESTAMP WITH TIME ZONE, -- 转换时间
    expires_at TIMESTAMP WITH TIME ZONE,      -- 推荐过期时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_model_upgrade_old_model ON model_upgrade_mappings(old_model);
CREATE INDEX IF NOT EXISTS idx_model_upgrade_new_model ON model_upgrade_mappings(new_model);
CREATE INDEX IF NOT EXISTS idx_model_upgrade_brand ON model_upgrade_mappings(brand);
CREATE INDEX IF NOT EXISTS idx_model_upgrade_active ON model_upgrade_mappings(is_active);

CREATE INDEX IF NOT EXISTS idx_user_device_user_id ON user_device_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_model ON user_device_history(model);
CREATE INDEX IF NOT EXISTS idx_user_device_brand ON user_device_history(brand);
CREATE INDEX IF NOT EXISTS idx_user_device_current ON user_device_history(is_current);
CREATE INDEX IF NOT EXISTS idx_user_device_source ON user_device_history(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_upgrade_recommendations_user_id ON upgrade_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_recommendations_models ON upgrade_recommendations(old_model, new_model);
CREATE INDEX IF NOT EXISTS idx_upgrade_recommendations_created ON upgrade_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_upgrade_recommendations_expires ON upgrade_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_upgrade_recommendations_converted ON upgrade_recommendations(converted);

-- 5. 启用RLS（行级安全）
ALTER TABLE model_upgrade_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_device_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_recommendations ENABLE ROW LEVEL SECURITY;

-- 6. RLS策略设置
-- model_upgrade_mappings 表策略
CREATE POLICY "Public view of active model mappings" 
ON model_upgrade_mappings FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can manage model mappings" 
ON model_upgrade_mappings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'product_manager')
    )
);

-- user_device_history 表策略
CREATE POLICY "Users can view their own device history" 
ON user_device_history FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own device history" 
ON user_device_history FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own device history" 
ON user_device_history FOR UPDATE 
USING (user_id = auth.uid());

-- upgrade_recommendations 表策略
CREATE POLICY "Users can view their own recommendations" 
ON upgrade_recommendations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations" 
ON upgrade_recommendations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'system', 'recommendation_engine')
    )
);

-- 7. 创建触发器函数用于自动更新时间戳
CREATE OR REPLACE FUNCTION update_upgrade_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新时间戳触发器
CREATE TRIGGER update_model_upgrade_mappings_updated_at 
    BEFORE UPDATE ON model_upgrade_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_upgrade_timestamp();

CREATE TRIGGER update_user_device_history_updated_at 
    BEFORE UPDATE ON user_device_history 
    FOR EACH ROW EXECUTE FUNCTION update_upgrade_timestamp();

CREATE TRIGGER update_upgrade_recommendations_updated_at 
    BEFORE UPDATE ON upgrade_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_upgrade_timestamp();

-- 8. 创建存储过程用于获取用户设备历史
CREATE OR REPLACE FUNCTION get_user_recent_devices(user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    brand VARCHAR,
    model VARCHAR,
    category VARCHAR,
    purchase_date DATE,
    usage_duration_months INTEGER,
    condition_rating INTEGER,
    source_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        udh.brand,
        udh.model,
        udh.category,
        udh.purchase_date,
        udh.usage_duration_months,
        udh.condition_rating,
        udh.source_type
    FROM user_device_history udh
    WHERE udh.user_id = $1 
      AND udh.is_current = true
    ORDER BY 
        CASE WHEN udh.purchase_date IS NOT NULL THEN udh.purchase_date ELSE udh.created_at END DESC
    LIMIT $2;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建存储过程用于获取推荐列表
CREATE OR REPLACE FUNCTION get_upgrade_recommendations_for_user(
    user_id UUID,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(
    old_model VARCHAR,
    new_model VARCHAR,
    brand VARCHAR,
    predicted_trade_value DECIMAL,
    discount_amount DECIMAL,
    discount_rate DECIMAL,
    recommendation_score DECIMAL,
    recommendation_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.old_model,
        ur.new_model,
        ur.brand,
        ur.predicted_trade_value,
        ur.discount_amount,
        ur.discount_rate,
        ur.recommendation_score,
        ur.recommendation_reason,
        ur.expires_at
    FROM upgrade_recommendations ur
    WHERE ur.user_id = $1 
      AND ur.expires_at > NOW()
      AND ur.converted = false
    ORDER BY ur.recommendation_score DESC, ur.created_at DESC
    LIMIT $2;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建存储过程用于生成升级推荐
CREATE OR REPLACE FUNCTION generate_upgrade_recommendations(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    device_record RECORD;
    mapping_record RECORD;
    recommendation_count INTEGER := 0;
    trade_value DECIMAL;
    discount_amount DECIMAL;
    recommendation_score DECIMAL;
BEGIN
    -- 获取用户最近的设备
    FOR device_record IN 
        SELECT brand, model, category, purchase_date, usage_duration_months, condition_rating
        FROM get_user_recent_devices(user_id, 5)
    LOOP
        -- 查找对应的升级映射
        FOR mapping_record IN
            SELECT new_model, upgrade_discount_rate, min_trade_value, max_trade_value, 
                   compatibility_score, upgrade_reason, priority
            FROM model_upgrade_mappings
            WHERE brand = device_record.brand
              AND old_model = device_record.model
              AND is_active = true
        LOOP
            -- 计算预估回收价值（基于设备状况和使用时长）
            trade_value := mapping_record.min_trade_value + 
                          (mapping_record.max_trade_value - mapping_record.min_trade_value) * 
                          (COALESCE(device_record.condition_rating, 7) / 10.0) *
                          GREATEST(0.5, 1.0 - COALESCE(device_record.usage_duration_months, 12) / 60.0);
            
            -- 计算折扣金额
            discount_amount := trade_value * mapping_record.upgrade_discount_rate;
            
            -- 计算推荐得分（综合考虑兼容性、优先级、设备状况）
            recommendation_score := (mapping_record.compatibility_score / 100.0) * 0.4 +
                                  (1.0 - mapping_record.priority / 10.0) * 0.3 +
                                  (COALESCE(device_record.condition_rating, 7) / 10.0) * 0.2 +
                                  (CASE 
                                     WHEN device_record.usage_duration_months > 24 THEN 0.1
                                     ELSE 0.0 
                                   END);
            
            -- 插入推荐记录
            INSERT INTO upgrade_recommendations (
                user_id,
                old_model,
                new_model,
                brand,
                predicted_trade_value,
                discount_amount,
                discount_rate,
                recommendation_score,
                recommendation_reason,
                expires_at
            ) VALUES (
                user_id,
                device_record.model,
                mapping_record.new_model,
                device_record.brand,
                trade_value,
                discount_amount,
                mapping_record.upgrade_discount_rate,
                recommendation_score,
                mapping_record.upgrade_reason,
                NOW() + INTERVAL '7 days'
            );
            
            recommendation_count := recommendation_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN recommendation_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 插入示例数据
-- iPhone系列升级映射
INSERT INTO model_upgrade_mappings (
    old_model, new_model, brand, category, 
    upgrade_discount_rate, min_trade_value, max_trade_value,
    compatibility_score, upgrade_reason, priority
) VALUES 
('iPhone 12', 'iPhone 15', 'Apple', '手机', 0.20, 200, 800, 95, '显著性能提升，支持最新iOS功能', 1),
('iPhone 13', 'iPhone 15', 'Apple', '手机', 0.18, 300, 900, 95, '摄像头升级，续航增强', 1),
('iPhone 14', 'iPhone 15', 'Apple', '手机', 0.15, 400, 1000, 90, '小幅升级，性价比之选', 2),
('iPhone 11', 'iPhone 14', 'Apple', '手机', 0.25, 150, 600, 85, '大幅升级推荐', 1),
('iPhone XR', 'iPhone 13', 'Apple', '手机', 0.30, 100, 500, 80, '经济实惠的升级选择', 3),
('Samsung Galaxy S21', 'Samsung Galaxy S24', 'Samsung', '手机', 0.18, 250, 850, 90, '新一代旗舰体验', 1),
('Samsung Galaxy S22', 'Samsung Galaxy S24', 'Samsung', '手机', 0.15, 350, 950, 92, 'AI功能增强', 1),
('Huawei P40', 'Huawei P60', 'Huawei', '手机', 0.22, 180, 700, 85, '鸿蒙系统升级', 2)
ON CONFLICT (brand, old_model, new_model) DO NOTHING;

-- 12. 输出完成信息
SELECT '旧机型关联推荐系统表结构创建完成' as migration_status;