-- 产品说明书和Token计费系统表结构
-- Migration: 006_product_manuals_and_token_system.sql

-- ====================================================================
-- 第一部分：产品说明书系统
-- ====================================================================

-- 产品说明书主表
CREATE TABLE IF NOT EXISTS product_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title JSONB NOT NULL, -- 多语言标题 { "zh": "中文标题", "en": "English Title" }
  content JSONB NOT NULL, -- 多语言内容 { "zh": "<html>...</html>", "en": "<html>...</html>" }
  language_codes TEXT[], -- 支持的语言列表 ['zh', 'en']
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书版本历史表
CREATE TABLE IF NOT EXISTS manual_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title JSONB NOT NULL,
  content JSONB NOT NULL,
  changes TEXT, -- 变更说明
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书审核记录表
CREATE TABLE IF NOT EXISTS manual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  action VARCHAR(20) NOT NULL, -- approve, reject, request_changes
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：Token计费系统
-- ====================================================================

-- Token账户表
CREATE TABLE IF NOT EXISTS token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  brand_id UUID UNIQUE, -- 品牌商账户，与user_id互斥
  balance INTEGER DEFAULT 0, -- 当前余额（Token数量）
  total_consumed INTEGER DEFAULT 0, -- 累计消耗
  total_purchased INTEGER DEFAULT 0, -- 累计购买
  status VARCHAR(20) DEFAULT 'active', -- active, frozen, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token交易记录表
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES token_accounts(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 正数为充值，负数为消费
  transaction_type VARCHAR(20) NOT NULL, -- purchase, consumption, refund, bonus
  reference_id UUID, -- 关联的订单ID或其他引用
  description TEXT NOT NULL,
  balance_after INTEGER NOT NULL, -- 交易后余额
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token套餐表
CREATE TABLE IF NOT EXISTS token_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL, -- 多语言名称 { "zh": "基础套餐", "en": "Basic Package" }
  tokens INTEGER NOT NULL, -- 包含的Token数量
  price_usd DECIMAL(10,2) NOT NULL, -- 美元价格
  price_cny DECIMAL(10,2) NOT NULL, -- 人民币价格
  bonus_percentage DECIMAL(5,2) DEFAULT 0.00, -- 奖励百分比
  popular BOOLEAN DEFAULT FALSE, -- 是否推荐
  featured BOOLEAN DEFAULT FALSE, -- 是否精选
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  sort_order INTEGER DEFAULT 0, -- 排序权重
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 计费规则表
CREATE TABLE IF NOT EXISTS billing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(50) NOT NULL, -- diagnosis, manual_view, advanced_feature
  cost_per_unit INTEGER NOT NULL, -- 每单位消耗的Token数
  unit_type VARCHAR(20) NOT NULL, -- per_request, per_minute, per_mb
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI诊断会话表
CREATE TABLE IF NOT EXISTS diagnosis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_id UUID, -- 关联的设备ID
  token_account_id UUID REFERENCES token_accounts(id),
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  tokens_consumed INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI诊断消息记录表
CREATE TABLE IF NOT EXISTS diagnosis_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES diagnosis_sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  tokens_used INTEGER, -- 本次消息消耗的Token数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第三部分：索引优化
-- ====================================================================

-- 说明书相关索引
CREATE INDEX IF NOT EXISTS idx_product_manuals_product_id ON product_manuals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_manuals_status ON product_manuals(status);
CREATE INDEX IF NOT EXISTS idx_product_manuals_created_by ON product_manuals(created_by);
CREATE INDEX IF NOT EXISTS idx_manual_versions_manual_id ON manual_versions(manual_id);
CREATE INDEX IF NOT EXISTS idx_manual_reviews_manual_id ON manual_reviews(manual_id);

-- Token系统相关索引
CREATE INDEX IF NOT EXISTS idx_token_accounts_user_id ON token_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_token_accounts_brand_id ON token_accounts(brand_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_account_id ON token_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_packages_status ON token_packages(status);
CREATE INDEX IF NOT EXISTS idx_billing_rules_service_type ON billing_rules(service_type);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_user_id ON diagnosis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_token_account_id ON diagnosis_sessions(token_account_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_messages_session_id ON diagnosis_messages(session_id);

-- ====================================================================
-- 第四部分：RLS安全策略
-- ====================================================================

-- 为所有新表启用RLS
ALTER TABLE product_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_messages ENABLE ROW LEVEL SECURITY;

-- 说明书表策略
CREATE POLICY "用户只能查看已发布的说明书"
  ON product_manuals FOR SELECT
  USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "认证用户可以创建说明书"
  ON product_manuals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "用户只能修改自己创建的说明书"
  ON product_manuals FOR UPDATE
  USING (created_by = auth.uid());

-- Token账户策略
CREATE POLICY "用户只能查看自己的Token账户"
  ON token_accounts FOR SELECT
  USING (user_id = auth.uid() OR brand_id IN (
    SELECT id FROM brands WHERE created_by = auth.uid()
  ));

CREATE POLICY "用户可以创建自己的Token账户"
  ON token_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 交易记录策略
CREATE POLICY "用户只能查看自己的交易记录"
  ON token_transactions FOR SELECT
  USING (account_id IN (
    SELECT id FROM token_accounts 
    WHERE user_id = auth.uid() OR brand_id IN (
      SELECT id FROM brands WHERE created_by = auth.uid()
    )
  ));

-- 诊断会话策略
CREATE POLICY "用户只能查看自己的诊断会话"
  ON diagnosis_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可以创建自己的诊断会话"
  ON diagnosis_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ====================================================================
-- 第五部分：初始数据填充
-- ====================================================================

-- 插入默认计费规则
INSERT INTO billing_rules (service_type, cost_per_unit, unit_type, description) VALUES
  ('diagnosis', 50, 'per_request', 'AI故障诊断基础费用'),
  ('manual_view', 10, 'per_request', '查看说明书费用'),
  ('advanced_feature', 100, 'per_request', '高级功能使用费用')
ON CONFLICT (service_type) DO NOTHING;

-- 插入默认Token套餐
INSERT INTO token_packages (name, tokens, price_usd, price_cny, bonus_percentage, popular, sort_order) VALUES
  ('{"zh": "入门套餐", "en": "Starter Package"}', 1000, 9.99, 68.00, 0.00, false, 1),
  ('{"zh": "标准套餐", "en": "Standard Package"}', 5000, 39.99, 268.00, 0.10, true, 2),
  ('{"zh": "专业套餐", "en": "Professional Package"}', 15000, 99.99, 668.00, 0.20, false, 3),
  ('{"zh": "企业套餐", "en": "Enterprise Package"}', 50000, 299.99, 1999.00, 0.30, false, 4)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 第六部分：触发器和函数
-- ====================================================================

-- 自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_product_manuals_updated_at 
    BEFORE UPDATE ON product_manuals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_accounts_updated_at 
    BEFORE UPDATE ON token_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_packages_updated_at 
    BEFORE UPDATE ON token_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_rules_updated_at 
    BEFORE UPDATE ON billing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Token消费自动扣费触发器
CREATE OR REPLACE FUNCTION deduct_tokens_on_consumption()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有消费类型的交易才扣减余额
    IF NEW.transaction_type = 'consumption' AND NEW.amount < 0 THEN
        UPDATE token_accounts 
        SET balance = balance + NEW.amount, -- amount是负数，所以用+
            total_consumed = total_consumed - NEW.amount, -- 转为正数累加
            updated_at = NOW()
        WHERE id = NEW.account_id;
    -- 充值类型的交易增加余额
    ELSIF NEW.transaction_type IN ('purchase', 'bonus', 'refund') AND NEW.amount > 0 THEN
        UPDATE token_accounts 
        SET balance = balance + NEW.amount,
            total_purchased = total_purchased + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.account_id;
    END IF;
    
    -- 设置交易后的余额
    SELECT balance INTO NEW.balance_after 
    FROM token_accounts 
    WHERE id = NEW.account_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_deduct_tokens 
    BEFORE INSERT ON token_transactions
    FOR EACH ROW EXECUTE FUNCTION deduct_tokens_on_consumption();

-- 表注释
COMMENT ON TABLE product_manuals IS '产品说明书主表';
COMMENT ON TABLE manual_versions IS '说明书版本历史';
COMMENT ON TABLE token_accounts IS 'Token账户表';
COMMENT ON TABLE token_transactions IS 'Token交易记录';
COMMENT ON TABLE token_packages IS 'Token套餐表';
COMMENT ON TABLE billing_rules IS '计费规则表';
COMMENT ON TABLE diagnosis_sessions IS 'AI诊断会话表';
COMMENT ON TABLE diagnosis_messages IS '诊断消息记录表';