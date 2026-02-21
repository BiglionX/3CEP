-- 众筹系统表结构迁移脚本
-- 创建时间: 2026-02-20

-- 1. 创建众筹项目表
CREATE TABLE IF NOT EXISTS crowdfunding_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    product_model VARCHAR(100) NOT NULL,
    old_models TEXT[] DEFAULT '{}',
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    min_pledge_amount DECIMAL(10,2) DEFAULT 100 CHECK (min_pledge_amount > 0),
    max_pledge_amount DECIMAL(10,2) CHECK (max_pledge_amount > 0),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'success', 'failed', 'cancelled')),
    cover_image_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    risk_info TEXT,
    faq JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束：结束时间必须晚于开始时间
    CONSTRAINT check_dates CHECK (end_date > start_date),
    -- 约束：当前金额不能超过目标金额
    CONSTRAINT check_amounts CHECK (current_amount <= target_amount)
);

-- 2. 创建支持记录表
CREATE TABLE IF NOT EXISTS crowdfunding_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    pledge_type VARCHAR(20) DEFAULT 'reservation' CHECK (pledge_type IN ('reservation', 'support')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    reward_level VARCHAR(50),
    shipping_address JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    payment_method VARCHAR(20),
    transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建项目回报设置表
CREATE TABLE IF NOT EXISTS crowdfunding_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    minimum_amount DECIMAL(10,2) NOT NULL CHECK (minimum_amount > 0),
    quantity_limit INTEGER CHECK (quantity_limit > 0),
    claimed_count INTEGER DEFAULT 0 CHECK (claimed_count >= 0),
    delivery_estimate DATE,
    is_digital BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束：已认领数量不能超过限制数量
    CONSTRAINT check_claimed_limit CHECK (
        quantity_limit IS NULL OR claimed_count <= quantity_limit
    )
);

-- 4. 创建项目更新日志表
CREATE TABLE IF NOT EXISTS crowdfunding_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'progress' CHECK (update_type IN ('progress', 'announcement', 'milestone')),
    is_public BOOLEAN DEFAULT TRUE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_status ON crowdfunding_projects(status);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_creator ON crowdfunding_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_dates ON crowdfunding_projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_category ON crowdfunding_projects(category);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_product_model ON crowdfunding_projects(product_model);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_project ON crowdfunding_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_user ON crowdfunding_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_status ON crowdfunding_pledges(status);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_created ON crowdfunding_pledges(created_at);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_rewards_project ON crowdfunding_rewards(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_rewards_amount ON crowdfunding_rewards(minimum_amount);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_updates_project ON crowdfunding_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_updates_public ON crowdfunding_updates(is_public);

-- 6. 启用RLS（行级安全）
ALTER TABLE crowdfunding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_updates ENABLE ROW LEVEL SECURITY;

-- 7. 项目表RLS策略
-- 所有人可查看公开项目
CREATE POLICY "Public projects are viewable by everyone" 
ON crowdfunding_projects FOR SELECT 
USING (status IN ('active', 'success'));

-- 创建者可查看自己的所有项目
CREATE POLICY "Users can view their own projects" 
ON crowdfunding_projects FOR SELECT 
USING (creator_id = auth.uid());

-- 认证用户可创建项目
CREATE POLICY "Authenticated users can create projects" 
ON crowdfunding_projects FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- 创建者可更新自己的项目（草稿状态下）
CREATE POLICY "Creators can update their draft projects" 
ON crowdfunding_projects FOR UPDATE 
USING (creator_id = auth.uid() AND status = 'draft');

-- 创建者可删除自己的草稿项目
CREATE POLICY "Creators can delete their draft projects" 
ON crowdfunding_projects FOR DELETE 
USING (creator_id = auth.uid() AND status = 'draft');

-- 8. 支持记录表RLS策略
-- 用户只能查看自己的支持记录
CREATE POLICY "Users can view their own pledges" 
ON crowdfunding_pledges FOR SELECT 
USING (user_id = auth.uid());

-- 用户可以创建支持记录
CREATE POLICY "Users can create pledges" 
ON crowdfunding_pledges FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 用户可以更新自己的待确认支持
CREATE POLICY "Users can update their pending pledges" 
ON crowdfunding_pledges FOR UPDATE 
USING (user_id = auth.uid() AND status = 'pending');

-- 9. 回报设置表RLS策略
-- 所有人可查看项目的回报设置
CREATE POLICY "Reward settings are viewable by everyone" 
ON crowdfunding_rewards FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM crowdfunding_projects 
    WHERE id = project_id AND status IN ('active', 'success')
));

-- 项目创建者可管理回报设置
CREATE POLICY "Project creators can manage rewards" 
ON crowdfunding_rewards FOR ALL 
USING (EXISTS (
    SELECT 1 FROM crowdfunding_projects 
    WHERE id = project_id AND creator_id = auth.uid()
));

-- 10. 更新日志表RLS策略
-- 所有人可查看公开的项目更新
CREATE POLICY "Public updates are viewable by everyone" 
ON crowdfunding_updates FOR SELECT 
USING (is_public = TRUE AND EXISTS (
    SELECT 1 FROM crowdfunding_projects 
    WHERE id = project_id AND status IN ('active', 'success')
));

-- 项目创建者可查看所有更新
CREATE POLICY "Project creators can view all updates" 
ON crowdfunding_updates FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM crowdfunding_projects 
    WHERE id = project_id AND creator_id = auth.uid()
));

-- 项目创建者可管理更新
CREATE POLICY "Project creators can manage updates" 
ON crowdfunding_updates FOR ALL 
USING (EXISTS (
    SELECT 1 FROM crowdfunding_projects 
    WHERE id = project_id AND creator_id = auth.uid()
));

-- 11. 创建触发器函数用于自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新时间戳触发器
CREATE TRIGGER update_crowdfunding_projects_updated_at 
    BEFORE UPDATE ON crowdfunding_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowdfunding_pledges_updated_at 
    BEFORE UPDATE ON crowdfunding_pledges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowdfunding_rewards_updated_at 
    BEFORE UPDATE ON crowdfunding_rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowdfunding_updates_updated_at 
    BEFORE UPDATE ON crowdfunding_updates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. 创建存储过程用于更新项目金额
CREATE OR REPLACE FUNCTION update_project_amount(project_id UUID, amount_change DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE crowdfunding_projects 
    SET current_amount = GREATEST(0, current_amount + amount_change)
    WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 创建存储过程用于获取项目统计信息
CREATE OR REPLACE FUNCTION get_project_stats(project_id UUID)
RETURNS TABLE(
    supporter_count BIGINT,
    total_raised DECIMAL,
    progress_percentage DECIMAL,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(p.id) as supporter_count,
        COALESCE(SUM(p.amount), 0) as total_raised,
        CASE 
            WHEN cp.target_amount > 0 THEN 
                ROUND((COALESCE(SUM(p.amount), 0) / cp.target_amount * 100), 2)
            ELSE 0 
        END as progress_percentage,
        GREATEST(0, CEIL(EXTRACT(EPOCH FROM (cp.end_date - NOW())) / 86400))::INTEGER as days_remaining
    FROM crowdfunding_projects cp
    LEFT JOIN crowdfunding_pledges p ON cp.id = p.project_id AND p.status = 'confirmed'
    WHERE cp.id = project_id
    GROUP BY cp.target_amount, cp.end_date;
END;
$$ LANGUAGE plpgsql;

-- 14. 创建存储过程用于获取支持统计信息
CREATE OR REPLACE FUNCTION get_pledge_stats(project_id UUID)
RETURNS TABLE(
    total_pledges BIGINT,
    total_amount DECIMAL,
    average_amount DECIMAL,
    recent_pledges JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_pledges,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(ROUND(AVG(amount), 2), 0) as average_amount,
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'amount', amount,
                'created_at', created_at
            ) ORDER BY created_at DESC LIMIT 10)
            FROM crowdfunding_pledges 
            WHERE project_id = $1 AND status = 'confirmed'
        ), '[]'::jsonb) as recent_pledges
    FROM crowdfunding_pledges 
    WHERE project_id = $1 AND status = 'confirmed';
END;
$$ LANGUAGE plpgsql;

-- 15. 插入示例数据（可选）
INSERT INTO crowdfunding_projects (
    title,
    description,
    product_model,
    old_models,
    target_amount,
    min_pledge_amount,
    start_date,
    end_date,
    delivery_date,
    status,
    cover_image_url,
    creator_id,
    category,
    tags
) VALUES (
    '全新智能手机配件众筹',
    '一款专为现代智能手机设计的多功能保护壳，集成了无线充电、防摔保护和个性化定制功能。',
    'SmartPhone-Pro-X1',
    ARRAY['iPhone 14', 'iPhone 15', 'Samsung Galaxy S23'],
    50000,
    99,
    NOW(),
    NOW() + INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '60 days',
    'active',
    'https://example.com/images/smartphone-case.jpg',
    '00000000-0000-0000-0000-000000000000', -- 示例用户ID，需要替换为真实ID
    '手机配件',
    ARRAY['保护壳', '无线充电', '防摔']
) ON CONFLICT DO NOTHING;

-- 16. 为示例项目创建回报设置
INSERT INTO crowdfunding_rewards (
    project_id,
    title,
    description,
    minimum_amount,
    quantity_limit,
    delivery_estimate,
    is_digital
) SELECT 
    id,
    '早鸟优惠',
    '限量版保护壳，享受最大折扣',
    99,
    100,
    CURRENT_DATE + INTERVAL '45 days',
    FALSE
FROM crowdfunding_projects 
WHERE product_model = 'SmartPhone-Pro-X1' ON CONFLICT DO NOTHING;

INSERT INTO crowdfunding_rewards (
    project_id,
    title,
    description,
    minimum_amount,
    quantity_limit,
    delivery_estimate,
    is_digital
) SELECT 
    id,
    '标准版',
    '经典款保护壳',
    129,
    500,
    CURRENT_DATE + INTERVAL '60 days',
    FALSE
FROM crowdfunding_projects 
WHERE product_model = 'SmartPhone-Pro-X1' ON CONFLICT DO NOTHING;

-- 输出完成信息
SELECT '众筹系统表结构创建完成' as migration_status;