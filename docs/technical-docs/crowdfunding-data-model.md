# 众筹系统数据模型设计

## 核心业务实体

### 1. 众筹项目表 (crowdfunding_projects)

存储众筹项目的基本信息和状态

```sql
CREATE TABLE crowdfunding_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    product_model VARCHAR(100) NOT NULL, -- 产品型号
    old_models TEXT[], -- 兼容的旧机型型号数组
    target_amount DECIMAL(12,2) NOT NULL, -- 目标金额
    current_amount DECIMAL(12,2) DEFAULT 0, -- 当前筹集金额
    min_pledge_amount DECIMAL(10,2) DEFAULT 100, -- 最小支持金额
    max_pledge_amount DECIMAL(10,2), -- 最大支持金额（可选）
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_date DATE, -- 预计交付日期
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, success, failed, cancelled
    cover_image_url TEXT,
    images TEXT[], -- 项目图片数组
    video_url TEXT, -- 介绍视频链接
    creator_id UUID REFERENCES auth.users(id), -- 创建者
    category VARCHAR(50), -- 分类（如：手机、平板、笔记本等）
    tags TEXT[], -- 标签数组
    risk_info TEXT, -- 风险说明
    faq JSONB, -- 常见问题（JSON格式）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 支持记录表 (crowdfunding_pledges)

记录用户的预定和支持信息

```sql
CREATE TABLE crowdfunding_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    pledge_type VARCHAR(20) DEFAULT 'reservation', -- reservation(预定), support(支持)
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, refunded
    reward_level VARCHAR(50), -- 回报档位
    shipping_address JSONB, -- 收货地址信息
    contact_info JSONB, -- 联系信息
    payment_method VARCHAR(20), -- 支付方式
    transaction_id TEXT, -- 交易ID
    notes TEXT, -- 备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 项目回报设置表 (crowdfunding_rewards)

项目的支持回报设置

```sql
CREATE TABLE crowdfunding_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- 回报标题
    description TEXT, -- 回报描述
    minimum_amount DECIMAL(10,2) NOT NULL, -- 最低支持金额
    quantity_limit INTEGER, -- 数量限制（null表示无限制）
    claimed_count INTEGER DEFAULT 0, -- 已认领数量
    delivery_estimate DATE, -- 预计交付时间
    is_digital BOOLEAN DEFAULT FALSE, -- 是否为数字产品
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 项目更新日志表 (crowdfunding_updates)

项目进度更新记录

```sql
CREATE TABLE crowdfunding_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'progress', -- progress, announcement, milestone
    is_public BOOLEAN DEFAULT TRUE, -- 是否公开
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 关键业务逻辑

### 项目状态流转

```
draft(草稿) → active(进行中) → success(成功) | failed(失败)
                    ↓
                cancelled(取消)
```

### 支持状态流转

```
pending(待确认) → confirmed(已确认) → completed(已完成)
      ↓              ↓
  cancelled(已取消)  refunded(已退款)
```

## RLS 策略

```sql
-- 项目表RLS策略
ALTER TABLE crowdfunding_projects ENABLE ROW LEVEL SECURITY;

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

-- 支持记录RLS策略
ALTER TABLE crowdfunding_pledges ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的支持记录
CREATE POLICY "Users can view their own pledges"
ON crowdfunding_pledges FOR SELECT
USING (user_id = auth.uid());

-- 用户可以创建支持记录
CREATE POLICY "Users can create pledges"
ON crowdfunding_pledges FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 回报设置RLS策略
ALTER TABLE crowdfunding_rewards ENABLE ROW LEVEL SECURITY;

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
```

## 索引优化

```sql
-- 项目表索引
CREATE INDEX idx_crowdfunding_projects_status ON crowdfunding_projects(status);
CREATE INDEX idx_crowdfunding_projects_creator ON crowdfunding_projects(creator_id);
CREATE INDEX idx_crowdfunding_projects_dates ON crowdfunding_projects(start_date, end_date);
CREATE INDEX idx_crowdfunding_projects_category ON crowdfunding_projects(category);

-- 支持记录索引
CREATE INDEX idx_crowdfunding_pledges_project ON crowdfunding_pledges(project_id);
CREATE INDEX idx_crowdfunding_pledges_user ON crowdfunding_pledges(user_id);
CREATE INDEX idx_crowdfunding_pledges_status ON crowdfunding_pledges(status);

-- 回报设置索引
CREATE INDEX idx_crowdfunding_rewards_project ON crowdfunding_rewards(project_id);
```

## 视图定义

```sql
-- 项目统计视图
CREATE VIEW crowdfunding_project_stats AS
SELECT
    p.id,
    p.title,
    p.current_amount,
    p.target_amount,
    ROUND((p.current_amount / p.target_amount * 100), 2) as progress_percentage,
    COUNT(pl.id) as supporter_count,
    MAX(pl.created_at) as last_support_time
FROM crowdfunding_projects p
LEFT JOIN crowdfunding_pledges pl ON p.id = pl.project_id AND pl.status = 'confirmed'
WHERE p.status = 'active'
GROUP BY p.id, p.title, p.current_amount, p.target_amount;

-- 用户支持历史视图
CREATE VIEW user_crowdfunding_history AS
SELECT
    pl.id,
    pl.amount,
    pl.status,
    pl.created_at,
    p.title as project_title,
    p.cover_image_url,
    p.end_date
FROM crowdfunding_pledges pl
JOIN crowdfunding_projects p ON pl.project_id = p.id
WHERE pl.user_id = auth.uid();
```
