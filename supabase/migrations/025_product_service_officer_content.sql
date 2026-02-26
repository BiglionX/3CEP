-- 产品服务官内容管理系统表结构
-- Migration: 025_product_service_officer_content.sql
-- 创建时间: 2026-02-25
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：配件发布管理表
-- ====================================================================

-- 企业配件发布表
CREATE TABLE IF NOT EXISTS enterprise_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  part_number VARCHAR(100),
  description TEXT,
  specifications JSONB, -- 规格参数
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'CNY',
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  warranty_period INTEGER, -- 保修期(月)
  image_urls TEXT[], -- 图片URL数组
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 配件分类表
CREATE TABLE IF NOT EXISTS part_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES part_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：产品说明书管理表
-- ====================================================================

-- 企业产品说明书表
CREATE TABLE IF NOT EXISTS enterprise_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_model VARCHAR(100),
  title JSONB NOT NULL, -- 多语言标题 { "zh": "中文标题", "en": "English Title" }
  content JSONB NOT NULL, -- 多语言内容 { "zh": "<html>...</html>", "en": "<html>...</html>" }
  language_codes TEXT[], -- 支持的语言列表
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  cover_image_url TEXT,
  attachment_urls TEXT[], -- 附件URL数组
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第三部分：维修技巧管理表
-- ====================================================================

-- 企业维修技巧表
CREATE TABLE IF NOT EXISTS enterprise_repair_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL, -- article, video, image_gallery
  content_html TEXT, -- 图文内容HTML
  video_url TEXT, -- 视频URL
  image_urls TEXT[], -- 图片URL数组
  device_models TEXT[], -- 适用设备型号
  fault_types TEXT[], -- 适用故障类型
  difficulty_level INTEGER, -- 难度等级(1-5)
  estimated_time INTEGER, -- 预估时间(分钟)
  tools_required TEXT[], -- 所需工具
  parts_required JSONB, -- 所需配件 {part_id: quantity}
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第四部分：软件升级包管理表
-- ====================================================================

-- 企业软件升级包表
CREATE TABLE IF NOT EXISTS enterprise_software_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_model VARCHAR(100),
  software_version VARCHAR(50) NOT NULL,
  previous_version VARCHAR(50), -- 前一版本
  update_type VARCHAR(20) NOT NULL, -- firmware, driver, app, system
  title VARCHAR(255) NOT NULL,
  description TEXT,
  changelog TEXT, -- 更新日志
  file_url TEXT NOT NULL, -- 升级包文件URL
  file_size BIGINT, -- 文件大小(bytes)
  file_hash VARCHAR(128), -- 文件哈希值
  release_date DATE,
  compatibility_info JSONB, -- 兼容性信息
  installation_guide TEXT, -- 安装指南
  warning_notes TEXT, -- 注意事项
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第五部分：有奖问答管理表
-- ====================================================================

-- 企业有奖问答表
CREATE TABLE IF NOT EXISTS enterprise_reward_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_type VARCHAR(20) NOT NULL, -- single_choice, multiple_choice, text_input
  options JSONB, -- 选项 {A: "选项A", B: "选项B"}
  correct_answer TEXT, -- 正确答案
  reward_points INTEGER NOT NULL, -- 奖励积分
  reward_fc_amount DECIMAL(10,2), -- 奖励FC币金额
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER, -- 最大参与人数
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, ended, closed
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户答题记录表
CREATE TABLE IF NOT EXISTS user_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES enterprise_reward_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  reward_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- ====================================================================
-- 第六部分：新品众筹管理表
-- ====================================================================

-- 企业新品众筹表
CREATE TABLE IF NOT EXISTS enterprise_crowdfunding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  product_images TEXT[],
  target_amount DECIMAL(15,2) NOT NULL, -- 目标金额
  current_amount DECIMAL(15,2) DEFAULT 0, -- 当前筹集金额
  min_pledge_amount DECIMAL(10,2) DEFAULT 1.00, -- 最低支持金额
  currency VARCHAR(10) DEFAULT 'CNY',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  delivery_date DATE, -- 预计交付日期
  funding_goal_type VARCHAR(20) DEFAULT 'fixed', -- fixed, flexible
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, successful, failed, cancelled
  video_url TEXT, -- 介绍视频URL
  features JSONB, -- 产品特性
  risks TEXT, -- 风险说明
  faq JSONB, -- 常见问题
  updates JSONB, -- 项目更新
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 众筹支持记录表
CREATE TABLE IF NOT EXISTS crowdfunding_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crowdfunding_id UUID NOT NULL REFERENCES enterprise_crowdfunding(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  pledge_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_selected JSONB, -- 选择的回报
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(20), -- 支付方式
  transaction_id VARCHAR(100) -- 交易ID
);

-- ====================================================================
-- 第七部分：索引创建
-- ====================================================================

-- 配件表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_parts_enterprise_id ON enterprise_parts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_parts_status ON enterprise_parts(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_parts_category ON enterprise_parts(category);

-- 说明书表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_manuals_enterprise_id ON enterprise_manuals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_manuals_status ON enterprise_manuals(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_manuals_product_model ON enterprise_manuals(product_model);

-- 维修技巧表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_repair_tips_enterprise_id ON enterprise_repair_tips(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_repair_tips_status ON enterprise_repair_tips(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_repair_tips_device_models ON enterprise_repair_tips USING GIN(device_models);

-- 软件升级表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_software_updates_enterprise_id ON enterprise_software_updates(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_software_updates_status ON enterprise_software_updates(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_software_updates_product_model ON enterprise_software_updates(product_model);

-- 有奖问答表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_reward_questions_enterprise_id ON enterprise_reward_questions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_reward_questions_status ON enterprise_reward_questions(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_reward_questions_time ON enterprise_reward_questions(start_time, end_time);

-- 众筹表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_crowdfunding_enterprise_id ON enterprise_crowdfunding(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_crowdfunding_status ON enterprise_crowdfunding(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_crowdfunding_dates ON enterprise_crowdfunding(start_date, end_date);

-- 用户答题记录索引
CREATE INDEX IF NOT EXISTS idx_user_question_answers_question_id ON user_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_answers_user_id ON user_question_answers(user_id);

-- 众筹支持记录索引
CREATE INDEX IF NOT EXISTS idx_crowdfunding_backers_crowdfunding_id ON crowdfunding_backers(crowdfunding_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_backers_user_id ON crowdfunding_backers(user_id);

-- ====================================================================
-- 第八部分：RLS安全策略
-- ====================================================================

-- 启用RLS
ALTER TABLE enterprise_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_repair_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_software_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_reward_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_crowdfunding ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_backers ENABLE ROW LEVEL SECURITY;

-- 企业配件表策略
CREATE POLICY "企业用户可查看自己的配件"
  ON enterprise_parts FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的配件"
  ON enterprise_parts FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 企业说明书表策略
CREATE POLICY "企业用户可查看自己的说明书"
  ON enterprise_manuals FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的说明书"
  ON enterprise_manuals FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 企业维修技巧表策略
CREATE POLICY "企业用户可查看自己的维修技巧"
  ON enterprise_repair_tips FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的维修技巧"
  ON enterprise_repair_tips FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 企业软件升级表策略
CREATE POLICY "企业用户可查看自己的软件升级包"
  ON enterprise_software_updates FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的软件升级包"
  ON enterprise_software_updates FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 企业有奖问答表策略
CREATE POLICY "企业用户可查看自己的有奖问答"
  ON enterprise_reward_questions FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的有奖问答"
  ON enterprise_reward_questions FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 用户答题记录表策略
CREATE POLICY "用户可查看自己的答题记录"
  ON user_question_answers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可创建答题记录"
  ON user_question_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 企业众筹表策略
CREATE POLICY "企业用户可查看自己的众筹项目"
  ON enterprise_crowdfunding FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的众筹项目"
  ON enterprise_crowdfunding FOR ALL
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 众筹支持记录表策略
CREATE POLICY "用户可查看自己的支持记录"
  ON crowdfunding_backers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可创建支持记录"
  ON crowdfunding_backers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ====================================================================
-- 第九部分：触发器和函数
-- ====================================================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新时间触发器
CREATE TRIGGER update_enterprise_parts_updated_at 
    BEFORE UPDATE ON enterprise_parts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_manuals_updated_at 
    BEFORE UPDATE ON enterprise_manuals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_repair_tips_updated_at 
    BEFORE UPDATE ON enterprise_repair_tips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_software_updates_updated_at 
    BEFORE UPDATE ON enterprise_software_updates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_reward_questions_updated_at 
    BEFORE UPDATE ON enterprise_reward_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_crowdfunding_updated_at 
    BEFORE UPDATE ON enterprise_crowdfunding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 第十部分：初始数据
-- ====================================================================

-- 插入默认配件分类
INSERT INTO part_categories (name, sort_order) VALUES
  ('手机配件', 1),
  ('电脑配件', 2),
  ('平板配件', 3),
  ('相机配件', 4),
  ('耳机音响', 5),
  ('充电配件', 6),
  ('数据线材', 7),
  ('保护配件', 8)
ON CONFLICT DO NOTHING;

-- 插入示例数据
INSERT INTO enterprise_parts (
  enterprise_id, name, category, brand, model, description, price, status
) VALUES 
  (
    (SELECT id FROM enterprise_users LIMIT 1),
    'iPhone 15 Pro 原装屏幕',
    '手机配件',
    'Apple',
    'iPhone 15 Pro',
    '原装OLED显示屏，支持原彩显示和ProMotion技术',
    1299.00,
    'published'
  ),
  (
    (SELECT id FROM enterprise_users LIMIT 1),
    'Samsung Galaxy S24 电池',
    '手机配件',
    'Samsung',
    'Galaxy S24',
    '4000mAh原装电池，支持快充技术',
    299.00,
    'published'
  )
ON CONFLICT DO NOTHING;

COMMENT ON TABLE enterprise_parts IS '企业配件发布管理表';
COMMENT ON TABLE enterprise_manuals IS '企业产品说明书管理表';
COMMENT ON TABLE enterprise_repair_tips IS '企业维修技巧管理表';
COMMENT ON TABLE enterprise_software_updates IS '企业软件升级包管理表';
COMMENT ON TABLE enterprise_reward_questions IS '企业有奖问答管理表';
COMMENT ON TABLE enterprise_crowdfunding IS '企业新品众筹管理表';