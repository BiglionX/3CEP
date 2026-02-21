-- 配件联盟链接管理系统表结构
-- Migration: 023_create_part_affiliate_links.sql
-- 创建时间: 2026-02-20
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：配件联盟链接表
-- ====================================================================

-- 配件联盟链接主表
CREATE TABLE IF NOT EXISTS part_affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- jd, taobao, amazon, tmall
  base_url TEXT NOT NULL,
  affiliate_params JSONB DEFAULT '{}', -- 联盟参数配置
  template_url TEXT NOT NULL, -- 完整的链接模板
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- 优先级，数字越大越优先
  click_count BIGINT DEFAULT 0,
  conversion_count BIGINT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 配件与联盟链接关联表
CREATE TABLE IF NOT EXISTS part_affiliate_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  affiliate_link_id UUID REFERENCES part_affiliate_links(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false, -- 是否为默认链接
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 联盟链接点击追踪表
CREATE TABLE IF NOT EXISTS affiliate_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES part_affiliate_links(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  user_id UUID, -- 可选的用户标识
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  campaign_id VARCHAR(100), -- 营销活动ID
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 联盟收入统计表
CREATE TABLE IF NOT EXISTS affiliate_revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES part_affiliate_links(id) ON DELETE CASCADE,
  click_id UUID REFERENCES affiliate_click_tracking(id) ON DELETE SET NULL,
  transaction_id VARCHAR(100), -- 交易ID
  revenue_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL, -- 佣金比例
  commission_amount DECIMAL(12,2) NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引创建
-- ====================================================================

-- 配件联盟链接表索引
CREATE INDEX idx_part_affiliate_links_platform ON part_affiliate_links(platform);
CREATE INDEX idx_part_affiliate_links_part_name ON part_affiliate_links(part_name);
CREATE INDEX idx_part_affiliate_links_is_active ON part_affiliate_links(is_active);
CREATE INDEX idx_part_affiliate_links_priority ON part_affiliate_links(priority DESC);
CREATE INDEX idx_part_affiliate_links_created_at ON part_affiliate_links(created_at DESC);

-- 配件映射表索引
CREATE INDEX idx_part_affiliate_mappings_part_id ON part_affiliate_mappings(part_id);
CREATE INDEX idx_part_affiliate_mappings_affiliate_link_id ON part_affiliate_mappings(affiliate_link_id);
CREATE INDEX idx_part_affiliate_mappings_is_default ON part_affiliate_mappings(is_default);

-- 点击追踪表索引
CREATE INDEX idx_affiliate_click_tracking_affiliate_link_id ON affiliate_click_tracking(affiliate_link_id);
CREATE INDEX idx_affiliate_click_tracking_part_id ON affiliate_click_tracking(part_id);
CREATE INDEX idx_affiliate_click_tracking_user_id ON affiliate_click_tracking(user_id);
CREATE INDEX idx_affiliate_click_tracking_clicked_at ON affiliate_click_tracking(clicked_at DESC);
CREATE INDEX idx_affiliate_click_tracking_utm_source ON affiliate_click_tracking(utm_source);
CREATE INDEX idx_affiliate_click_tracking_campaign_id ON affiliate_click_tracking(campaign_id);

-- 收入统计表索引
CREATE INDEX idx_affiliate_revenue_tracking_affiliate_link_id ON affiliate_revenue_tracking(affiliate_link_id);
CREATE INDEX idx_affiliate_revenue_tracking_transaction_id ON affiliate_revenue_tracking(transaction_id);
CREATE INDEX idx_affiliate_revenue_tracking_settled_at ON affiliate_revenue_tracking(settled_at);
CREATE INDEX idx_affiliate_revenue_tracking_created_at ON affiliate_revenue_tracking(created_at DESC);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_part_affiliate_links_updated_at
  BEFORE UPDATE ON part_affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 点击计数自动增加触发器
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE part_affiliate_links 
  SET click_count = click_count + 1 
  WHERE id = NEW.affiliate_link_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_increment_click_count
  AFTER INSERT ON affiliate_click_tracking
  FOR EACH ROW
  EXECUTE FUNCTION increment_click_count();

-- ====================================================================
-- 第四部分：初始数据
-- ====================================================================

-- 插入常见电商平台的联盟链接模板
INSERT INTO part_affiliate_links (part_name, platform, base_url, affiliate_params, template_url, priority) VALUES
-- 京东联盟链接模板
('iPhone电池', 'jd', 'https://item.jd.com/', 
 '{"utm_source": "fixcycle", "utm_medium": "affiliate", "union_id": "YOUR_UNION_ID"}',
 '{base_url}{product_id}.html?utm_source=fixcycle&utm_medium=affiliate&union_id=YOUR_UNION_ID&fc_source=tutorial',
 10),

-- 淘宝联盟链接模板  
('屏幕总成', 'taobao', 'https://detail.tmall.com/item.htm',
 '{"spm": "a219r.lm872.14.1", "ut_sk": "1.YOUR_UT_SK"}',
 '{base_url}?id={product_id}&spm=a219r.lm872.14.1&ut_sk=1.YOUR_UT_SK&fc_source=tutorial',
 8),

-- 亚马逊联盟链接模板
('充电器', 'amazon', 'https://www.amazon.com/dp/',
 '{"tag": "fixcycle-20", "_encoding": "UTF8"}',
 '{base_url}{product_id}?tag=fixcycle-20&_encoding=UTF8&fc_source=tutorial',
 6),

-- 天猫联盟链接模板
('数据线', 'tmall', 'https://detail.tmall.com/item.htm',
 '{"ali_trackid": "YOUR_TRACK_ID"}',
 '{base_url}?id={product_id}&ali_trackid=YOUR_TRACK_ID&fc_source=tutorial',
 7);

-- ====================================================================
-- 第五部分：RLS安全策略
-- ====================================================================

-- 启用RLS
ALTER TABLE part_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_affiliate_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_click_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_revenue_tracking ENABLE ROW LEVEL SECURITY;

-- 公开读取权限（仅活跃链接）
CREATE POLICY "Allow public read active affiliate links"
  ON part_affiliate_links FOR SELECT
  USING (is_active = true);

-- 管理员完全访问权限
CREATE POLICY "Allow admin full access to affiliate links"
  ON part_affiliate_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- 点击追踪数据插入权限（公开）
CREATE POLICY "Allow insert affiliate clicks"
  ON affiliate_click_tracking FOR INSERT
  WITH CHECK (true);

-- 管理员访问点击数据
CREATE POLICY "Allow admin read affiliate clicks"
  ON affiliate_click_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- 验证创建结果
SELECT '=== 配件联盟链接系统表创建完成 ===' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('part_affiliate_links', 'part_affiliate_mappings', 'affiliate_click_tracking', 'affiliate_revenue_tracking')
ORDER BY table_name;