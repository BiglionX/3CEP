-- =====================================================
-- 新品众筹系统数据表定义
-- =====================================================

-- 众筹项目表
CREATE TABLE IF NOT EXISTS crowdfunding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  product_model VARCHAR(100), -- 产品型号
  product_images JSONB, -- 产品图片URL列表
  target_amount DECIMAL(12,2) NOT NULL, -- 目标金额
  current_amount DECIMAL(12,2) DEFAULT 0, -- 当前已筹集
  min_contribution DECIMAL(10,2) NOT NULL, -- 最小支持金额
  max_contribution DECIMAL(10,2), -- 最大支持金额
  start_date DATE NOT NULL, -- 开始日期
  end_date DATE NOT NULL, -- 结束日期
  delivery_date DATE, -- 预计交付日期
  supporters_count INTEGER DEFAULT 0, -- 支持者数量
  status VARCHAR(20) DEFAULT 'draft', -- draft: 草稿, active: 进行中, successful: 成功, failed: 失败, closed: 已关闭
  funding_progress DECIMAL(5,2) DEFAULT 0, -- 筹资进度百分比
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 众筹回报/档位表
CREATE TABLE IF NOT EXISTS crowdfunding_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL, -- 档位名称
  description TEXT, -- 档位描述
  amount DECIMAL(10,2) NOT NULL, -- 支持金额
  reward_items JSONB, -- 回报物品列表
  estimated_delivery DATE, -- 预计发货日期
  shipping_info TEXT, -- 配送信息
  limited_quantity INTEGER, -- 限量数量
  sold_count INTEGER DEFAULT 0, -- 已售数量
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支持者/资助记录表
CREATE TABLE IF NOT EXISTS crowdfunding_supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES crowdfunding_rewards(id),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- 支持金额
  status VARCHAR(20) DEFAULT 'pending', -- pending: 待支付, paid: 已支付, cancelled: 已取消, refunded: 已退款
  shipping_address JSONB, -- 收货地址
  contact_phone VARCHAR(20), -- 联系电话
  remarks TEXT, -- 备注
  supported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 项目更新日志表
CREATE TABLE IF NOT EXISTS crowdfunding_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_enterprise ON crowdfunding_projects(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_projects_status ON crowdfunding_projects(status);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_rewards_project ON crowdfunding_rewards(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_supporters_project ON crowdfunding_supporters(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_supporters_user ON crowdfunding_supporters(user_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_updates_project ON crowdfunding_updates(project_id);
