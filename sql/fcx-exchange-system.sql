-- FXC 兑换 Token 功能数据库迁移
-- 创建时间：2026-03-24
-- 版本：1.0.0

-- ============================================
-- 1. 创建 FXC 兑换交易表
-- ============================================
CREATE TABLE IF NOT EXISTS fcx_exchange_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fxc_account_id UUID NOT NULL REFERENCES fcx_accounts(id),
  token_account_id UUID NOT NULL REFERENCES token_accounts(id),
  
  -- 兑换金额
  fxc_amount DECIMAL(18,8) NOT NULL CHECK (fxc_amount > 0),
  token_amount DECIMAL(18,8) NOT NULL CHECK (token_amount >= 0),
  fee_amount DECIMAL(18,8) DEFAULT 0 CHECK (fee_amount >= 0),
  final_amount DECIMAL(18,8) NOT NULL CHECK (final_amount >= 0),
  
  -- 汇率信息
  exchange_rate DECIMAL(10,4) NOT NULL CHECK (exchange_rate > 0),
  rate_type VARCHAR(20) DEFAULT 'dynamic' CHECK (rate_type IN ('dynamic', 'fixed')),
  
  -- 状态追踪
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN 
    ('pending', 'processing', 'completed', 'failed', 'cancelled')
  ),
  
  -- 元数据
  memo TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_fcx_exchange_user_id ON fcx_exchange_transactions(user_id);
CREATE INDEX idx_fcx_exchange_fxc_account ON fcx_exchange_transactions(fxc_account_id);
CREATE INDEX idx_fcx_exchange_token_account ON fcx_exchange_transactions(token_account_id);
CREATE INDEX idx_fcx_exchange_status ON fcx_exchange_transactions(status);
CREATE INDEX idx_fcx_exchange_created_at ON fcx_exchange_transactions(created_at DESC);

-- 添加注释
COMMENT ON TABLE fcx_exchange_transactions IS 'FXC 兑换 Token 交易记录表';
COMMENT ON COLUMN fcx_exchange_transactions.fxc_amount IS '兑换的 FXC 金额';
COMMENT ON COLUMN fcx_exchange_transactions.token_amount IS '理论获得的 Token 数量（扣除手续费前）';
COMMENT ON COLUMN fcx_exchange_transactions.fee_amount IS '手续费（Token）';
COMMENT ON COLUMN fcx_exchange_transactions.final_amount IS '实际到账的 Token 数量';
COMMENT ON COLUMN fcx_exchange_transactions.exchange_rate IS '兑换汇率（1 FXC = ? Tokens）';
COMMENT ON COLUMN fcx_exchange_transactions.rate_type IS '汇率类型：dynamic=动态汇率，fixed=固定汇率';

-- ============================================
-- 2. 创建每日兑换限额追踪表
-- ============================================
CREATE TABLE IF NOT EXISTS fcx_daily_exchange_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_date DATE NOT NULL,
  total_exchanged DECIMAL(18,8) DEFAULT 0 CHECK (total_exchanged >= 0),
  transaction_count INTEGER DEFAULT 0 CHECK (transaction_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, exchange_date)
);

-- 创建索引
CREATE INDEX idx_fcx_daily_limit_user_date ON fcx_daily_exchange_limits(user_id, exchange_date DESC);

-- 添加注释
COMMENT ON TABLE fcx_daily_exchange_limits IS 'FXC 每日兑换限额追踪表';

-- ============================================
-- 3. 创建 FXC 兑换存储过程（事务处理）
-- ============================================
CREATE OR REPLACE FUNCTION execute_fcx_exchange(
  p_user_id UUID,
  p_fxc_account_id UUID,
  p_token_account_id UUID,
  p_fxc_amount DECIMAL,
  p_token_amount DECIMAL,
  p_fee_amount DECIMAL,
  p_final_amount DECIMAL,
  p_exchange_rate DECIMAL
) RETURNS TABLE (
  transaction_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_fxc_balance DECIMAL;
  v_transaction_id UUID;
  v_today_date DATE;
  v_today_exchanged DECIMAL := 0;
BEGIN
  -- 1. 验证 FXC 账户余额
  SELECT balance INTO v_fxc_balance
  FROM fcx_accounts
  WHERE id = p_fxc_account_id;
  
  IF v_fxc_balance IS NULL OR v_fxc_balance < p_fxc_amount THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      FALSE,
      'FXC 账户余额不足';
    RETURN;
  END IF;
  
  -- 2. 检查每日兑换限额
  v_today_date := CURRENT_DATE;
  
  SELECT COALESCE(total_exchanged, 0)
  INTO v_today_exchanged
  FROM fcx_daily_exchange_limits
  WHERE user_id = p_user_id AND exchange_date = v_today_date;
  
  IF v_today_exchanged + p_fxc_amount > 10000 THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      FALSE,
      '超过每日兑换限额（10000 FXC）';
    RETURN;
  END IF;
  
  -- 3. 开始执行兑换（使用事务块）
  BEGIN
    -- 3.1 扣减 FXC 账户余额
    UPDATE fcx_accounts
    SET balance = balance - p_fxc_amount,
        updated_at = NOW()
    WHERE id = p_fxc_account_id;
    
    -- 3.2 增加 Token 账户余额
    UPDATE token_accounts
    SET balance = balance + p_final_amount,
        total_purchased = total_purchased + p_final_amount,
        updated_at = NOW()
    WHERE id = p_token_account_id;
    
    -- 3.3 创建兑换交易记录
    INSERT INTO fcx_exchange_transactions (
      user_id,
      fxc_account_id,
      token_account_id,
      fxc_amount,
      token_amount,
      fee_amount,
      final_amount,
      exchange_rate,
      rate_type,
      status,
      memo
    ) VALUES (
      p_user_id,
      p_fxc_account_id,
      p_token_account_id,
      p_fxc_amount,
      p_token_amount,
      p_fee_amount,
      p_final_amount,
      p_exchange_rate,
      'dynamic',
      'completed',
      format('FXC 兑换 Token: %s FXC -> %s Tokens (汇率：%s)', 
             p_fxc_amount, p_final_amount, p_exchange_rate)
    )
    RETURNING id INTO v_transaction_id;
    
    -- 3.4 更新每日兑换统计
    INSERT INTO fcx_daily_exchange_limits (
      user_id,
      exchange_date,
      total_exchanged,
      transaction_count
    ) VALUES (
      p_user_id,
      v_today_date,
      p_fxc_amount,
      1
    )
    ON CONFLICT (user_id, exchange_date) DO UPDATE
    SET 
      total_exchanged = fcx_daily_exchange_limits.total_exchanged + p_fxc_amount,
      transaction_count = fcx_daily_exchange_limits.transaction_count + 1,
      updated_at = NOW();
    
    -- 返回成功结果
    RETURN QUERY SELECT 
      v_transaction_id,
      TRUE,
      NULL::TEXT;
    
  EXCEPTION WHEN OTHERS THEN
    -- 捕获异常并返回错误信息
    RETURN QUERY SELECT 
      NULL::UUID,
      FALSE,
      SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION execute_fcx_exchange IS '执行 FXC 兑换 Token 的事务处理函数';

-- ============================================
-- 4. 创建触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为兑换交易表添加触发器
CREATE TRIGGER update_fcx_exchange_transactions_updated_at
  BEFORE UPDATE ON fcx_exchange_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为每日限额表添加触发器
CREATE TRIGGER update_fcx_daily_exchange_limits_updated_at
  BEFORE UPDATE ON fcx_daily_exchange_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 创建视图：用户兑换统计
-- ============================================
CREATE OR REPLACE VIEW v_user_exchange_stats AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  SUM(fxc_amount) as total_fxc_exchanged,
  SUM(final_amount) as total_tokens_received,
  SUM(fee_amount) as total_fees_paid,
  AVG(exchange_rate) as avg_exchange_rate,
  MIN(created_at) as first_exchange_date,
  MAX(created_at) as last_exchange_date
FROM fcx_exchange_transactions
WHERE status = 'completed'
GROUP BY user_id;

COMMENT ON VIEW v_user_exchange_stats IS '用户 FXC 兑换统计视图';

-- ============================================
-- 6. 创建 RLS（行级安全策略）
-- ============================================

-- 启用 RLS
ALTER TABLE fcx_exchange_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_daily_exchange_limits ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的兑换记录
CREATE POLICY "Users can view own exchange transactions"
  ON fcx_exchange_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能查看自己的每日限额
CREATE POLICY "Users can view own daily limits"
  ON fcx_daily_exchange_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只有系统可以插入兑换记录
CREATE POLICY "System can insert exchange transactions"
  ON fcx_exchange_transactions
  FOR INSERT
  WITH CHECK (true);

-- 只有系统可以更新每日限额
CREATE POLICY "System can update daily limits"
  ON fcx_daily_exchange_limits
  FOR ALL
  USING (true);

-- ============================================
-- 7. 插入测试数据（可选）
-- ============================================
-- 注意：生产环境请注释掉以下内容
-- DO $$
-- DECLARE
--   v_test_user_id UUID;
--   v_test_fxc_account_id UUID;
--   v_test_token_account_id UUID;
-- BEGIN
--   -- 获取测试用户
--   SELECT id INTO v_test_user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
--   
--   IF v_test_user_id IS NOT NULL THEN
--     -- 获取测试账户
--     SELECT id INTO v_test_fxc_account_id FROM fcx_accounts WHERE user_id = v_test_user_id LIMIT 1;
--     SELECT id INTO v_test_token_account_id FROM token_accounts WHERE user_id = v_test_user_id LIMIT 1;
--     
--     -- 插入测试数据
--     IF v_test_fxc_account_id IS NOT NULL AND v_test_token_account_id IS NOT NULL THEN
--       INSERT INTO fcx_exchange_transactions (
--         user_id, fxc_account_id, token_account_id,
--         fxc_amount, token_amount, fee_amount, final_amount,
--         exchange_rate, status, memo
--       ) VALUES (
--         v_test_user_id, v_test_fxc_account_id, v_test_token_account_id,
--         100, 1000, 10, 990,
--         10.0, 'completed',
--         '测试兑换交易'
--       );
--     END IF;
--   END IF;
-- END $$;

-- ============================================
-- 迁移完成
-- ============================================
