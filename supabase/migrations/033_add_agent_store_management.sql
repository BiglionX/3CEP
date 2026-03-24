-- 智能体商店管理功能数据库迁移
-- 创建时间：2026-03-23
-- 版本：2.0.0
-- 说明：添加智能体商店运营管理所需的管理字段和表

-- ====================================================================
-- 第零部分：先删除旧对象（如果存在），确保干净的环境
-- ====================================================================

-- 删除依赖链：视图 -> 订单表（CASCADE 会自动删除依赖）
DROP VIEW IF EXISTS agent_daily_stats CASCADE;
DROP TABLE IF EXISTS agent_orders CASCADE;
DROP TABLE IF EXISTS agent_reviews CASCADE;
DROP TABLE IF EXISTS agent_audit_logs CASCADE;
DROP TABLE IF EXISTS agent_categories CASCADE;

-- ====================================================================
-- 第一部分：扩展 agents 表管理字段
-- ====================================================================

-- 添加审核相关字段
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'pending'
CHECK (review_status IN ('pending', 'approved', 'rejected', 'draft'));

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS review_comments TEXT;

-- 添加上下架状态字段
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS shelf_status VARCHAR(20) DEFAULT 'off_shelf'
CHECK (shelf_status IN ('on_shelf', 'off_shelf', 'suspended'));

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS on_shelf_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS off_shelf_at TIMESTAMP WITH TIME ZONE;

-- 添加运营指标字段
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS revenue_total DECIMAL(12,2) DEFAULT 0;

-- 添加库存管理字段
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS inventory_type VARCHAR(20) DEFAULT 'unlimited'
CHECK (inventory_type IN ('unlimited', 'limited', 'subscription'));

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT -1; -- -1 表示无限

-- 添加开发者信息字段（如果不存在）
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES auth.users(id);

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS revenue_share_rate DECIMAL(5,2) DEFAULT 70.00; -- 开发者分成比例 (%)

-- ====================================================================
-- 第二部分：创建智能体分类管理表
-- ====================================================================

CREATE TABLE IF NOT EXISTS agent_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES agent_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agent_categories_parent ON agent_categories(parent_id);
CREATE INDEX idx_agent_categories_slug ON agent_categories(slug);
CREATE INDEX idx_agent_categories_active ON agent_categories(is_active);

-- 插入默认分类数据
INSERT INTO agent_categories (name, slug, description, sort_order) VALUES
('销售营销', 'sales-marketing', '销售和客户管理相关智能体', 1),
('采购供应链', 'procurement-supply', '采购和供应链管理智能体', 2),
('客户服务', 'customer-service', '客服和支持服务智能体', 3),
('数据分析', 'data-analytics', '数据分析和报告智能体', 4),
('办公效率', 'office-productivity', '办公自动化和效率工具', 5),
('财务管理', 'finance-management', '财务和会计相关智能体', 6),
('人力资源', 'hr-management', '人力资源管理智能体', 7),
('技术开发', 'tech-development', '开发和测试工具智能体', 8)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- 第三部分：创建智能体审核日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS agent_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('submit_review', 'approve', 'reject', 'modify', 'suspend', 'restore')),
  action_by UUID REFERENCES auth.users(id),
  action_reason TEXT,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agent_audit_logs_agent ON agent_audit_logs(agent_id);
CREATE INDEX idx_agent_audit_logs_action_type ON agent_audit_logs(action_type);
CREATE INDEX idx_agent_audit_logs_created_at ON agent_audit_logs(created_at DESC);

-- ====================================================================
-- 第四部分：创建智能体订单表
-- ====================================================================

CREATE TABLE IF NOT EXISTS agent_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  developer_id UUID NOT NULL REFERENCES auth.users(id),

  -- 订单金额
  original_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  actual_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',

  -- 订阅信息
  subscription_type VARCHAR(20) DEFAULT 'one_time' CHECK (subscription_type IN ('one_time', 'monthly', 'yearly', 'lifetime')),
  subscription_period INTEGER, -- 订阅周期（月数）

  -- 订单状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'activated', 'refunded', 'cancelled')),

  -- 支付信息
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,

  -- 分成信息
  platform_fee DECIMAL(10,2) DEFAULT 0, -- 平台抽成
  developer_revenue DECIMAL(10,2) DEFAULT 0, -- 开发者收入

  -- 其他
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agent_orders_agent ON agent_orders(agent_id);
CREATE INDEX idx_agent_orders_buyer ON agent_orders(buyer_id);
CREATE INDEX idx_agent_orders_developer ON agent_orders(developer_id);
CREATE INDEX idx_agent_orders_status ON agent_orders(status);
CREATE INDEX idx_agent_orders_created_at ON agent_orders(created_at DESC);
CREATE INDEX idx_agent_orders_number ON agent_orders(order_number);

-- ====================================================================
-- 第五部分：创建智能体评价表
-- ====================================================================

CREATE TABLE IF NOT EXISTS agent_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES agent_orders(id) ON DELETE SET NULL,

  -- 评分
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- 评价内容
  title VARCHAR(200),
  content TEXT,
  pros TEXT, -- 优点
  cons TEXT, -- 缺点

  -- 媒体附件
  images JSONB DEFAULT '[]', -- 图片 URL 数组

  -- 审核状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),

  -- 互动数据
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- 商家回复
  developer_reply TEXT,
  developer_reply_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agent_reviews_agent ON agent_reviews(agent_id);
CREATE INDEX idx_agent_reviews_user ON agent_reviews(user_id);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX idx_agent_reviews_status ON agent_reviews(status);
CREATE INDEX idx_agent_reviews_created_at ON agent_reviews(created_at DESC);

-- ====================================================================
-- 第六部分：创建统计视图
-- ====================================================================

-- 智能体每日统计视图（此时 agent_orders 表已创建，直接使用）
CREATE OR REPLACE VIEW agent_daily_stats AS
SELECT
  DATE(o.created_at) as stat_date,
  a.id as agent_id,
  a.name as agent_name,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.actual_amount) as total_revenue,
  SUM(o.developer_revenue) as total_developer_revenue,
  SUM(o.platform_fee) as total_platform_fee,
  AVG(o.actual_amount) as avg_order_value
FROM agents a
LEFT JOIN agent_orders o ON a.id = o.agent_id
WHERE o.status IN ('paid', 'activated')
GROUP BY DATE(o.created_at), a.id, a.name;

-- ====================================================================
-- 第七部分：启用 RLS 并创建策略
-- ====================================================================

-- 启用行级安全
ALTER TABLE agent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;

-- 分类管理策略
CREATE POLICY "所有人可查看活跃分类" ON agent_categories
FOR SELECT USING (is_active = true OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

CREATE POLICY "管理员可管理分类" ON agent_categories
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

-- 审核日志策略
CREATE POLICY "管理员可查看审核日志" ON agent_audit_logs
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin', 'content_reviewer')
));

CREATE POLICY "系统可写入审核日志" ON agent_audit_logs
FOR INSERT WITH CHECK (true);

-- 订单管理策略
CREATE POLICY "用户可查看自己的订单" ON agent_orders
FOR SELECT USING (buyer_id = auth.uid() OR developer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin', 'finance_manager')
));

CREATE POLICY "用户可创建自己的订单" ON agent_orders
FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- 评价管理策略
CREATE POLICY "所有人可查看已审核评价" ON agent_reviews
FOR SELECT USING (status = 'approved' OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

CREATE POLICY "用户可创建自己的评价" ON agent_reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可更新自己的评价" ON agent_reviews
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "管理员可管理所有评价" ON agent_reviews
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

-- ====================================================================
-- 第八部分：创建触发器
-- ====================================================================

-- 自动更新时间戳
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agents_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_agents_updated_at();

CREATE OR REPLACE FUNCTION update_agent_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agent_categories_updated_at
BEFORE UPDATE ON agent_categories
FOR EACH ROW
EXECUTE FUNCTION update_agent_categories_updated_at();

CREATE OR REPLACE FUNCTION update_agent_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agent_orders_updated_at
BEFORE UPDATE ON agent_orders
FOR EACH ROW
EXECUTE FUNCTION update_agent_orders_updated_at();

CREATE OR REPLACE FUNCTION update_agent_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agent_reviews_updated_at
BEFORE UPDATE ON agent_reviews
FOR EACH ROW
EXECUTE FUNCTION update_agent_reviews_updated_at();

-- ====================================================================
-- 第九部分：注释说明
-- ====================================================================

COMMENT ON COLUMN agents.review_status IS '审核状态：pending-待审核，approved-已通过，rejected-已驳回，draft-草稿';
COMMENT ON COLUMN agents.shelf_status IS '上下架状态：on_shelf-上架，off_shelf-下架，suspended-暂停销售';
COMMENT ON COLUMN agents.inventory_type IS '库存类型：unlimited-无限，limited-限量，subscription-订阅制';
COMMENT ON COLUMN agents.revenue_share_rate IS '开发者分成比例，如 70.00 表示 70%';
COMMENT ON TABLE agent_categories IS '智能体分类表';
COMMENT ON TABLE agent_audit_logs IS '智能体审核日志表';
COMMENT ON TABLE agent_orders IS '智能体订单表';
COMMENT ON TABLE agent_reviews IS '智能体评价表';

-- ====================================================================
-- 完成提示
-- ====================================================================

-- 迁移完成！
-- 新增角色权限配置请执行：033_add_marketplace_roles.sql
