-- FCX2奖励机制扩展表结构迁移
-- 为支持完整的等级体系和权益兑换功能而创建的新表

-- 1. 权益类型定义表
CREATE TABLE IF NOT EXISTS equity_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,                    -- 权益名称
  description TEXT,                             -- 权益描述
  icon VARCHAR(50),                             -- 图标标识符
  cost DECIMAL(18,8) NOT NULL,                  -- 兑换所需FCX2数量
  level_requirement VARCHAR(20) NOT NULL,       -- 等级要求 (bronze/silver/gold/diamond)
  validity_days INTEGER NOT NULL DEFAULT 30,    -- 有效期（天）
  max_redemptions INTEGER NOT NULL DEFAULT -1,  -- 最大兑换次数 (-1表示无限制)
  daily_limit INTEGER NOT NULL DEFAULT 10,      -- 每日兑换限制
  is_active BOOLEAN DEFAULT true,               -- 是否激活
  sort_order INTEGER DEFAULT 0,                 -- 排序字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户权益持有记录表
CREATE TABLE IF NOT EXISTS user_equities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,  -- 用户ID（关联维修店）
  equity_type_id UUID REFERENCES equity_types(id) ON DELETE CASCADE, -- 权益类型ID
  cost DECIMAL(18,8) NOT NULL,                  -- 兑换时的成本
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),          -- 兑换时间
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,                -- 过期时间
  status VARCHAR(20) DEFAULT 'active',          -- 状态 (active/expired/used)
  metadata JSONB,                               -- 额外元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 等级变更日志表
CREATE TABLE IF NOT EXISTS level_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_shop_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE, -- 维修店ID
  old_level VARCHAR(20),                        -- 变更前等级
  new_level VARCHAR(20) NOT NULL,               -- 变更后等级
  score DECIMAL(5,2) NOT NULL,                  -- 当时的评分
  reason TEXT,                                  -- 变更原因
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),             -- 变更时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FCX2奖励发放日志表
CREATE TABLE IF NOT EXISTS fcx_reward_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES repair_orders(id) ON DELETE CASCADE,    -- 关联工单ID
  repair_shop_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE, -- 维修店ID
  reward_amount DECIMAL(18,8) NOT NULL,         -- 奖励金额
  reward_type VARCHAR(50) NOT NULL,             -- 奖励类型 (fcx2_option/bonus等)
  calculation_details JSONB,                    -- 计算详情
  status VARCHAR(20) DEFAULT 'distributed',     -- 状态 (pending/distributed/failed)
  distributed_at TIMESTAMP WITH TIME ZONE,      -- 发放时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 权益兑换日志表
CREATE TABLE IF NOT EXISTS equity_redemption_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,      -- 用户ID
  equity_type_id UUID REFERENCES equity_types(id) ON DELETE CASCADE, -- 权益类型ID
  quantity INTEGER NOT NULL DEFAULT 1,          -- 兑换数量
  total_cost DECIMAL(18,8) NOT NULL,            -- 总成本
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),              -- 兑换时间
  ip_address VARCHAR(45),                       -- IP地址（用于安全审计）
  user_agent TEXT,                              -- 用户代理
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 等级计算权重配置表
CREATE TABLE IF NOT EXISTS level_calculation_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weight_key VARCHAR(50) UNIQUE NOT NULL,       -- 权重键名
  weight_value DECIMAL(5,4) NOT NULL,           -- 权重值 (0.0000-1.0000)
  description TEXT,                             -- 描述
  is_active BOOLEAN DEFAULT true,               -- 是否激活
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 用户行为指标统计表（用于等级计算）
CREATE TABLE IF NOT EXISTS user_behavior_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,      -- 用户ID
  metric_date DATE NOT NULL,                    -- 统计日期
  rating_average DECIMAL(3,2),                  -- 平均评分
  total_orders INTEGER DEFAULT 0,               -- 总订单数
  completed_orders INTEGER DEFAULT 0,           -- 完成订单数
  cancelled_orders INTEGER DEFAULT 0,           -- 取消订单数
  dispute_orders INTEGER DEFAULT 0,             -- 争议订单数
  service_quality_score DECIMAL(5,4),           -- 服务质量得分
  activity_score DECIMAL(5,4),                  -- 活跃度得分
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),            -- 计算时间
  UNIQUE(user_id, metric_date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_equity_types_level ON equity_types(level_requirement);
CREATE INDEX IF NOT EXISTS idx_equity_types_active ON equity_types(is_active);
CREATE INDEX IF NOT EXISTS idx_user_equities_user ON user_equities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equities_status ON user_equities(status);
CREATE INDEX IF NOT EXISTS idx_user_equities_expires ON user_equities(expires_at);
CREATE INDEX IF NOT EXISTS idx_level_logs_shop ON level_change_logs(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_level_logs_date ON level_change_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_reward_logs_shop ON fcx_reward_logs(repair_shop_id);
CREATE INDEX IF NOT EXISTS idx_reward_logs_date ON fcx_reward_logs(distributed_at);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_user ON equity_redemption_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_date ON equity_redemption_logs(redeemed_at);
CREATE INDEX IF NOT EXISTS idx_behavior_metrics_user ON user_behavior_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_metrics_date ON user_behavior_metrics(metric_date);

-- 添加表注释
COMMENT ON TABLE equity_types IS '权益类型定义表，存储可兑换的各种权益信息';
COMMENT ON TABLE user_equities IS '用户权益持有记录表，跟踪用户拥有的权益';
COMMENT ON TABLE level_change_logs IS '等级变更日志表，记录用户的等级变化历史';
COMMENT ON TABLE fcx_reward_logs IS 'FCX2奖励发放日志表，记录奖励发放详情';
COMMENT ON TABLE equity_redemption_logs IS '权益兑换日志表，记录权益兑换操作';
COMMENT ON TABLE level_calculation_weights IS '等级计算权重配置表，定义各指标的权重';
COMMENT ON TABLE user_behavior_metrics IS '用户行为指标统计表，用于等级计算的数据源';

-- 初始化默认权益类型数据
INSERT INTO equity_types (name, description, icon, cost, level_requirement, validity_days, max_redemptions, daily_limit, sort_order) VALUES
  ('优先派单权', '获得优质订单的优先推荐权，提高接单成功率', 'priority-order', 500, 'silver', 30, 5, 1, 1),
  ('服务折扣券', '享受维修服务费用10%的折扣优惠', 'discount-coupon', 300, 'bronze', 60, 10, 2, 2),
  ('免费检测服务', '每月可享受一次免费的设备检测服务', 'free-service', 800, 'gold', 30, 12, 1, 3),
  ('VIP专属客服', '享受一对一专属客服服务，优先解决问题', 'vip-support', 1200, 'diamond', 90, -1, 1, 4),
  ('急速配送服务', '享受配件和设备的急速配送服务', 'express-delivery', 600, 'gold', 45, 20, 3, 5),
  ('延长质保服务', '为维修服务提供额外3个月的质保期', 'extended-warranty', 1000, 'silver', 180, 5, 1, 6)
ON CONFLICT (name) DO NOTHING;

-- 初始化等级计算权重配置
INSERT INTO level_calculation_weights (weight_key, weight_value, description) VALUES
  ('rating', 0.3000, '用户评分权重'),
  ('completion_rate', 0.2500, '订单完成率权重'),
  ('order_count', 0.2000, '订单数量权重'),
  ('service_quality', 0.1500, '服务质量权重'),
  ('fcx2_balance', 0.1000, 'FCX2余额权重')
ON CONFLICT (weight_key) DO NOTHING;

-- 启用RLS（行级安全）
ALTER TABLE equity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equities ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_reward_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_redemption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_calculation_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_metrics ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 权益类型：所有人都可以查看激活的权益
CREATE POLICY "公开查看激活权益" ON equity_types 
FOR SELECT USING (is_active = true);

-- 用户权益：用户只能查看自己的权益
CREATE POLICY "用户只能查看自己的权益" ON user_equities 
FOR ALL USING (user_id = auth.uid());

-- 等级变更日志：用户只能查看自己的记录
CREATE POLICY "用户只能查看自己的等级变更记录" ON level_change_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM repair_shops rs 
    WHERE rs.id = level_change_logs.repair_shop_id 
    AND rs.user_id = auth.uid()
  )
);

-- 奖励日志：用户只能查看自己店铺的记录
CREATE POLICY "用户只能查看自己店铺的奖励记录" ON fcx_reward_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM repair_shops rs 
    WHERE rs.id = fcx_reward_logs.repair_shop_id 
    AND rs.user_id = auth.uid()
  )
);

-- 兑换日志：用户只能查看自己的记录
CREATE POLICY "用户只能查看自己的兑换记录" ON equity_redemption_logs 
FOR SELECT USING (user_id = auth.uid());

-- 权重配置：只读权限
CREATE POLICY "只读权重配置" ON level_calculation_weights 
FOR SELECT USING (true);

-- 行为指标：用户只能查看自己的数据
CREATE POLICY "用户只能查看自己的行为指标" ON user_behavior_metrics 
FOR ALL USING (user_id = auth.uid());

-- 添加触发器函数用于自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_equity_types_updated_at 
    BEFORE UPDATE ON equity_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_level_calculation_weights_updated_at 
    BEFORE UPDATE ON level_calculation_weights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 验证表创建
DO $$
BEGIN
    RAISE NOTICE '✅ FCX2奖励机制扩展表结构创建完成';
    RAISE NOTICE '📊 创建了7个新表用于支持完整的奖励和权益系统';
    RAISE NOTICE '🔐 已配置行级安全策略保护用户数据';
    RAISE NOTICE '📈 初始化了默认权益类型和权重配置';
END $$;