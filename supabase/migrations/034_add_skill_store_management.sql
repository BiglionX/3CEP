-- Skill 商店管理功能数据库迁移
-- 创建时间：2026-03-23
-- 版本：2.0.0
-- 说明：添加 Skill 商店运营管理所需的管理字段和表

-- ====================================================================
-- 第零部分：先删除旧对象（如果存在），确保干净的环境
-- ====================================================================

-- 删除依赖链：视图 -> 订单表 -> 其他表
DROP VIEW IF EXISTS skill_daily_stats CASCADE;
DROP TABLE IF EXISTS skill_orders CASCADE;
DROP TABLE IF EXISTS skill_reviews CASCADE;
DROP TABLE IF EXISTS skill_versions CASCADE;
DROP TABLE IF EXISTS skill_audit_logs CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- ====================================================================
-- 第一部分：确定 Skill 存储位置并扩展管理字段
-- ====================================================================

-- 注意：根据项目结构，Skill 可能存储在 skills 表或 agent_skills 表
-- 先检查是否存在 skills 表，如果不存在则创建

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',

  -- 审核状态
  review_status VARCHAR(20) DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'draft')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_comments TEXT,

  -- 上下架状态
  shelf_status VARCHAR(20) DEFAULT 'off_shelf'
    CHECK (shelf_status IN ('on_shelf', 'off_shelf', 'suspended')),
  on_shelf_at TIMESTAMP WITH TIME ZONE,
  off_shelf_at TIMESTAMP WITH TIME ZONE,

  -- 定价信息
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'CNY',
  token_cost_per_use DECIMAL(10,4) DEFAULT 0,

  -- 运营指标
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  revenue_total DECIMAL(12,2) DEFAULT 0,

  -- 开发者信息
  developer_id UUID REFERENCES auth.users(id),
  developer_name VARCHAR(100),
  revenue_share_rate DECIMAL(5,2) DEFAULT 70.00,

  -- 技术信息
  github_repo VARCHAR(255),
  documentation_url TEXT,
  demo_url TEXT,
  api_endpoint TEXT,
  parameters JSONB DEFAULT '{}',

  -- 元数据
  tags JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：扩展技能管理字段（如果已存在 skills 表）
-- ====================================================================

-- 添加审核相关字段（如果不存在）
DO $$
BEGIN
  -- 添加审核状态字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'review_status') THEN
    ALTER TABLE skills ADD COLUMN review_status VARCHAR(20) DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'reviewed_at') THEN
    ALTER TABLE skills ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'reviewed_by') THEN
    ALTER TABLE skills ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'review_comments') THEN
    ALTER TABLE skills ADD COLUMN review_comments TEXT;
  END IF;

  -- 添加上下架状态字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'shelf_status') THEN
    ALTER TABLE skills ADD COLUMN shelf_status VARCHAR(20) DEFAULT 'off_shelf';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'on_shelf_at') THEN
    ALTER TABLE skills ADD COLUMN on_shelf_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'off_shelf_at') THEN
    ALTER TABLE skills ADD COLUMN off_shelf_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- 添加运营指标字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'view_count') THEN
    ALTER TABLE skills ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'download_count') THEN
    ALTER TABLE skills ADD COLUMN download_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'usage_count') THEN
    ALTER TABLE skills ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'favorite_count') THEN
    ALTER TABLE skills ADD COLUMN favorite_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'revenue_total') THEN
    ALTER TABLE skills ADD COLUMN revenue_total DECIMAL(12,2) DEFAULT 0;
  END IF;

  -- 添加开发者信息字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'developer_id') THEN
    ALTER TABLE skills ADD COLUMN developer_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'revenue_share_rate') THEN
    ALTER TABLE skills ADD COLUMN revenue_share_rate DECIMAL(5,2) DEFAULT 70.00;
  END IF;
END $$;

-- ====================================================================
-- 第三部分：创建 Skill 分类管理表
-- ====================================================================

CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  parent_id UUID REFERENCES skill_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_skill_categories_parent ON skill_categories(parent_id);
CREATE INDEX idx_skill_categories_slug ON skill_categories(slug);
CREATE INDEX idx_skill_categories_active ON skill_categories(is_active);

-- 插入默认分类数据
INSERT INTO skill_categories (name, slug, description, icon_emoji, sort_order) VALUES
('定位服务', 'location-services', '基于地理位置的查询服务', '📍', 1),
('诊断分析', 'diagnosis-analysis', '设备故障诊断和分析服务', '🔍', 2),
('配件服务', 'parts-services', '配件查询和兼容性服务', '🔧', 3),
('估值定价', 'valuation-pricing', '设备估价和定价服务', '💰', 4),
('信息查询', 'information-query', '各类信息查询服务', 'ℹ️', 5),
('工具效率', 'tools-productivity', '提升工作效率的工具', '⚡', 6),
('数据分析', 'data-analytics', '数据处理和分析服务', '📊', 7),
('其他服务', 'other-services', '其他类型的技能服务', '📦', 8)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- 第四部分：创建 Skill 审核日志表
-- ====================================================================

CREATE TABLE IF NOT EXISTS skill_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL
    CHECK (action_type IN ('submit_review', 'approve', 'reject', 'modify', 'suspend', 'restore')),
  action_by UUID REFERENCES auth.users(id),
  action_reason TEXT,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_skill_audit_logs_skill ON skill_audit_logs(skill_id);
CREATE INDEX idx_skill_audit_logs_action_type ON skill_audit_logs(action_type);
CREATE INDEX idx_skill_audit_logs_created_at ON skill_audit_logs(created_at DESC);

-- ====================================================================
-- 第五部分：创建 Skill 版本管理表
-- ====================================================================

CREATE TABLE IF NOT EXISTS skill_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  version_number VARCHAR(20) NOT NULL,
  changelog TEXT, -- 更新日志
  release_notes TEXT, -- 发布说明

  -- 技术信息
  github_commit_hash VARCHAR(40),
  github_release_url TEXT,
  package_url TEXT, -- 安装包下载地址
  file_size_bytes BIGINT,
  checksum_md5 VARCHAR(32), -- 文件校验和

  -- 兼容性信息
  min_api_version VARCHAR(20),
  max_api_version VARCHAR(20),
  dependencies JSONB DEFAULT '[]',

  -- 发布状态
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'deprecated', 'withdrawn')),
  is_current BOOLEAN DEFAULT false, -- 是否为当前最新版本

  published_at TIMESTAMP WITH TIME ZONE,
  deprecated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_skill_versions_skill ON skill_versions(skill_id);
CREATE INDEX idx_skill_versions_number ON skill_versions(version_number);
CREATE INDEX idx_skill_versions_current ON skill_versions(is_current);
CREATE INDEX idx_skill_versions_status ON skill_versions(status);

-- 唯一约束：每个技能的每个版本号只能有一个
CREATE UNIQUE INDEX idx_skill_versions_unique
ON skill_versions(skill_id, version_number);

-- ====================================================================
-- 第六部分：创建 Skill 订单表
-- ====================================================================

CREATE TABLE IF NOT EXISTS skill_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  developer_id UUID NOT NULL REFERENCES auth.users(id),

  -- 订单金额
  original_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  actual_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',

  -- 授权类型
  license_type VARCHAR(20) DEFAULT 'single'
    CHECK (license_type IN ('single', 'multi', 'enterprise', 'subscription')),
  license_duration INTEGER, -- 授权时长（月数），NULL 表示永久

  -- 订单状态
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'activated', 'refunded', 'cancelled')),

  -- 支付信息
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,

  -- 分成信息
  platform_fee DECIMAL(10,2) DEFAULT 0,
  developer_revenue DECIMAL(10,2) DEFAULT 0,

  -- 使用统计
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- 其他
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_skill_orders_skill ON skill_orders(skill_id);
CREATE INDEX idx_skill_orders_buyer ON skill_orders(buyer_id);
CREATE INDEX idx_skill_orders_developer ON skill_orders(developer_id);
CREATE INDEX idx_skill_orders_status ON skill_orders(status);
CREATE INDEX idx_skill_orders_created_at ON skill_orders(created_at DESC);
CREATE INDEX idx_skill_orders_number ON skill_orders(order_number);

-- ====================================================================
-- 第七部分：创建 Skill 评价表
-- ====================================================================

CREATE TABLE IF NOT EXISTS skill_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES skill_orders(id) ON DELETE SET NULL,

  -- 评分
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- 评价内容
  title VARCHAR(200),
  content TEXT,
  pros TEXT, -- 优点
  cons TEXT, -- 缺点

  -- 媒体附件
  images JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',

  -- 使用场景标签
  usage_scenarios JSONB DEFAULT '[]',

  -- 审核状态
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),

  -- 互动数据
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- 开发者回复
  developer_reply TEXT,
  developer_reply_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_skill_reviews_skill ON skill_reviews(skill_id);
CREATE INDEX idx_skill_reviews_user ON skill_reviews(user_id);
CREATE INDEX idx_skill_reviews_rating ON skill_reviews(rating);
CREATE INDEX idx_skill_reviews_status ON skill_reviews(status);
CREATE INDEX idx_skill_reviews_created_at ON skill_reviews(created_at DESC);

-- ====================================================================
-- 第八部分：启用 RLS 并创建策略
-- ====================================================================

-- 启用行级安全
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_reviews ENABLE ROW LEVEL SECURITY;

-- 分类管理策略
CREATE POLICY "所有人可查看活跃分类" ON skill_categories
FOR SELECT USING (is_active = true OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

CREATE POLICY "管理员可管理分类" ON skill_categories
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

-- Skills 基础策略
CREATE POLICY "所有人可查看已上架技能" ON skills
FOR SELECT USING (
  shelf_status = 'on_shelf' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin'))
);

CREATE POLICY "开发者可管理自己的技能" ON skills
FOR UPDATE USING (developer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')));

-- 审核日志策略
CREATE POLICY "管理员可查看审核日志" ON skill_audit_logs
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin', 'content_reviewer')
));

CREATE POLICY "系统可写入审核日志" ON skill_audit_logs
FOR INSERT WITH CHECK (true);

-- 版本管理策略
CREATE POLICY "所有人可查看已发布版本" ON skill_versions
FOR SELECT USING (status = 'published' OR is_current = true OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

CREATE POLICY "开发者可管理自己的版本" ON skill_versions
FOR ALL USING (EXISTS (
  SELECT 1 FROM skills WHERE id = skill_versions.skill_id AND developer_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

-- 订单管理策略
CREATE POLICY "用户可查看自己的订单" ON skill_orders
FOR SELECT USING (buyer_id = auth.uid() OR developer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin', 'finance_manager')
));

CREATE POLICY "用户可创建自己的订单" ON skill_orders
FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- 评价管理策略
CREATE POLICY "所有人可查看已审核评价" ON skill_reviews
FOR SELECT USING (status = 'approved' OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

CREATE POLICY "用户可创建自己的评价" ON skill_reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可更新自己的评价" ON skill_reviews
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "管理员可管理所有评价" ON skill_reviews
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
));

-- ====================================================================
-- 第九部分：创建触发器
-- ====================================================================

-- 自动更新时间戳
CREATE OR REPLACE FUNCTION update_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_skills_updated_at
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION update_skills_updated_at();

CREATE OR REPLACE FUNCTION update_skill_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_skill_categories_updated_at
BEFORE UPDATE ON skill_categories
FOR EACH ROW
EXECUTE FUNCTION update_skill_categories_updated_at();

CREATE OR REPLACE FUNCTION update_skill_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_skill_orders_updated_at
BEFORE UPDATE ON skill_orders
FOR EACH ROW
EXECUTE FUNCTION update_skill_orders_updated_at();

CREATE OR REPLACE FUNCTION update_skill_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_skill_reviews_updated_at
BEFORE UPDATE ON skill_reviews
FOR EACH ROW
EXECUTE FUNCTION update_skill_reviews_updated_at();

-- ====================================================================
-- 第十部分：创建统计视图
-- ====================================================================

-- Skill 每日统计视图（此时 skill_orders 表已创建，直接使用）
CREATE OR REPLACE VIEW skill_daily_stats AS
SELECT
  DATE(o.created_at) as stat_date,
  s.id as skill_id,
  s.name as skill_name,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.actual_amount) as total_revenue,
  SUM(o.developer_revenue) as total_developer_revenue,
  SUM(o.platform_fee) as total_platform_fee,
  AVG(o.actual_amount) as avg_order_value
FROM skills s
LEFT JOIN skill_orders o ON s.id = o.skill_id
WHERE o.status IN ('paid', 'activated')
GROUP BY DATE(o.created_at), s.id, s.name;

-- ====================================================================
-- 完成提示
-- ====================================================================

COMMENT ON COLUMN skills.review_status IS '审核状态：pending-待审核，approved-已通过，rejected-已驳回，draft-草稿';
COMMENT ON COLUMN skills.shelf_status IS '上下架状态：on_shelf-上架，off_shelf-下架，suspended-暂停销售';
COMMENT ON COLUMN skills.revenue_share_rate IS '开发者分成比例，如 70.00 表示 70%';
COMMENT ON TABLE skill_categories IS 'Skill 分类表';
COMMENT ON TABLE skill_audit_logs IS 'Skill 审核日志表';
COMMENT ON TABLE skill_versions IS 'Skill 版本管理表';
COMMENT ON TABLE skill_orders IS 'Skill 订单表';
COMMENT ON TABLE skill_reviews IS 'Skill 评价表';

-- 迁移完成！
