-- Token套餐和支付系统表结构

-- Token套餐表
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_amount INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户Token余额表
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_consumed INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Token交易记录表
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'consume', 'refund', 'bonus'
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    package_id UUID REFERENCES token_packages(id),
    payment_id UUID, -- 关联支付记录
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES token_packages(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- 'alipay', 'wechat', 'stripe', 'paypal'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id VARCHAR(100), -- 第三方支付平台交易号
    payment_data JSONB, -- 存储支付相关数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_token_packages_active ON token_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_token_packages_popular ON token_packages(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- RLS策略
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Token套餐策略（公开读取）
CREATE POLICY "所有人可以查看激活的套餐" ON token_packages
    FOR SELECT USING (is_active = true);

-- 用户Token余额策略
CREATE POLICY "用户只能查看自己的Token余额" ON user_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "系统可以更新Token余额" ON user_tokens
    FOR UPDATE USING (true);

-- Token交易记录策略
CREATE POLICY "用户只能查看自己的交易记录" ON token_transactions
    FOR SELECT USING (user_id = auth.uid());

-- 支付记录策略
CREATE POLICY "用户只能查看自己的支付记录" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户可以创建支付记录" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 初始套餐数据
INSERT INTO token_packages (name, description, token_amount, price, discount_percentage, is_popular, sort_order) VALUES
('基础套餐', '适合偶尔使用的用户', 100, 9.90, 0, false, 1),
('标准套餐', '性价比之选，满足日常需求', 500, 45.00, 10, true, 2),
('高级套餐', '大量使用用户的首选', 1200, 99.00, 17, false, 3),
('专业套餐', '无限畅享，最佳价值', 3000, 229.00, 24, false, 4)
ON CONFLICT DO NOTHING;