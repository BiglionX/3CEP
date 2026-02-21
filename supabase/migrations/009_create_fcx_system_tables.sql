-- 创建FCX通证系统表结构
-- 执行时间: 2026-02-15
-- 版本: 1.0.0

-- 1. FCX账户表
CREATE TABLE IF NOT EXISTS fcx_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(18,8) DEFAULT 0.00000000,
  frozen_balance DECIMAL(18,8) DEFAULT 0.00000000,
  account_type VARCHAR(20) DEFAULT 'repair_shop', -- factory, supplier, repair_shop
  status VARCHAR(20) DEFAULT 'active', -- active, frozen, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FCX交易流水表
CREATE TABLE IF NOT EXISTS fcx_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_account_id UUID REFERENCES fcx_accounts(id),
  to_account_id UUID REFERENCES fcx_accounts(id),
  amount DECIMAL(18,8) NOT NULL,
  transaction_type VARCHAR(30) NOT NULL, -- purchase, reward, settlement, freeze, unfreeze, stake, unstake
  reference_id UUID, -- 关联的工单或订单ID
  memo TEXT,
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FCX2期权记录表
CREATE TABLE IF NOT EXISTS fcx2_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_shop_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,
  amount DECIMAL(18,8) NOT NULL,
  earned_from_order_id UUID REFERENCES repair_orders(id),
  status VARCHAR(20) DEFAULT 'active', -- active, redeemed, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 years')
);

-- 4. 维修工单表
CREATE TABLE IF NOT EXISTS repair_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  consumer_id UUID REFERENCES auth.users(id),
  repair_shop_id UUID REFERENCES repair_shops(id),
  device_info JSONB,
  fault_description TEXT,
  fcx_amount_locked DECIMAL(18,8), -- 锁定的FCX金额
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, disputed, cancelled
  rating DECIMAL(2,1), -- 消费者评分 (0.0-5.0)
  factory_id UUID REFERENCES fcx_accounts(id), -- 关联的工厂账户
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. 扩展维修店铺表结构
ALTER TABLE repair_shops 
ADD COLUMN IF NOT EXISTS fcx_staked DECIMAL(18,8) DEFAULT 0.00000000,
ADD COLUMN IF NOT EXISTS fcx2_balance DECIMAL(18,8) DEFAULT 0.00000000,
ADD COLUMN IF NOT EXISTS alliance_level VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, diamond
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_alliance_member BOOLEAN DEFAULT false;

-- 6. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_fcx_accounts_user_id ON fcx_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_fcx_accounts_type ON fcx_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_fcx_transactions_from_account ON fcx_transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_fcx_transactions_to_account ON fcx_transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_fcx_transactions_type ON fcx_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_fcx_transactions_created_at ON fcx_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fcx2_options_shop_id ON fcx2_options(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_fcx2_options_status ON fcx2_options(status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_shop_id ON repair_orders(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_consumer_id ON repair_orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_created_at ON repair_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_shops_alliance ON repair_shops(is_alliance_member, alliance_level);

-- 7. 添加表注释
COMMENT ON TABLE fcx_accounts IS 'FCX账户表，存储用户FCX积分余额';
COMMENT ON COLUMN fcx_accounts.balance IS '可用FCX余额';
COMMENT ON COLUMN fcx_accounts.frozen_balance IS '冻结的FCX余额';
COMMENT ON COLUMN fcx_accounts.account_type IS '账户类型：factory(工厂), supplier(供应商), repair_shop(维修店)';

COMMENT ON TABLE fcx_transactions IS 'FCX交易流水表，记录所有FCX转账记录';
COMMENT ON COLUMN fcx_transactions.transaction_type IS '交易类型：purchase(购买), reward(奖励), settlement(结算), freeze(冻结), unfreeze(解冻), stake(质押), unstake(解除质押)';
COMMENT ON COLUMN fcx_transactions.reference_id IS '关联的业务ID，如工单ID或订单ID';

COMMENT ON TABLE fcx2_options IS 'FCX2数字期权表，记录维修店获得的期权奖励';
COMMENT ON COLUMN fcx2_options.amount IS 'FCX2期权数量';
COMMENT ON COLUMN fcx2_options.earned_from_order_id IS '获得期权的工单ID';

COMMENT ON TABLE repair_orders IS '维修工单表，记录消费者发起的维修请求';
COMMENT ON COLUMN repair_orders.order_number IS '工单编号，唯一标识';
COMMENT ON COLUMN repair_orders.fcx_amount_locked IS '锁定的FCX金额，用于支付维修费用';
COMMENT ON COLUMN repair_orders.status IS '工单状态：pending(待确认), confirmed(已确认), in_progress(进行中), completed(已完成), disputed(争议中), cancelled(已取消)';

COMMENT ON COLUMN repair_shops.fcx_staked IS '质押的FCX数量';
COMMENT ON COLUMN repair_shops.fcx2_balance IS '累计的FCX2期权余额';
COMMENT ON COLUMN repair_shops.alliance_level IS '联盟等级：bronze(青铜), silver(白银), gold(黄金), diamond(钻石)';
COMMENT ON COLUMN repair_shops.is_alliance_member IS '是否为联盟成员';

-- 8. 启用RLS（行级安全）
ALTER TABLE fcx_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx2_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;

-- 9. 创建RLS策略
-- FCX账户策略：用户只能查看和操作自己的账户
CREATE POLICY "用户只能访问自己的FCX账户" ON fcx_accounts 
FOR ALL USING (user_id = auth.uid());

-- FCX交易策略：用户可以查看相关的交易记录
CREATE POLICY "用户可以查看相关的FCX交易" ON fcx_transactions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM fcx_accounts fa 
    WHERE (fa.id = fcx_transactions.from_account_id OR fa.id = fcx_transactions.to_account_id)
    AND fa.user_id = auth.uid()
  )
);

-- FCX2期权策略：维修店只能查看自己的期权
CREATE POLICY "维修店只能查看自己的FCX2期权" ON fcx2_options 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM repair_shops rs 
    WHERE rs.id = fcx2_options.repair_shop_id 
    AND rs.user_id = auth.uid()
  )
);

-- 维修工单策略：消费者和维修店可以查看相关工单
CREATE POLICY "用户可以查看相关的维修工单" ON repair_orders 
FOR ALL USING (
  consumer_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM repair_shops rs 
    WHERE rs.id = repair_orders.repair_shop_id 
    AND rs.user_id = auth.uid()
  )
);

-- 10. 创建触发器函数自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为fcx_accounts表创建触发器
CREATE TRIGGER update_fcx_accounts_updated_at 
    BEFORE UPDATE ON fcx_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. 插入初始系统账户（示例数据）
INSERT INTO fcx_accounts (user_id, account_type, balance, status) 
SELECT 
  au.user_id,
  CASE 
    WHEN au.role = 'admin' THEN 'factory'
    WHEN au.role = 'shop_reviewer' THEN 'repair_shop'
    ELSE 'supplier'
  END,
  1000.00000000, -- 初始赠送1000 FCX
  'active'
FROM admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM fcx_accounts fa WHERE fa.user_id = au.user_id
)
LIMIT 5;

\echo '✅ FCX系统表结构创建完成'