-- 简化版配件联盟链接表结构
-- 用于手动在Supabase SQL Editor中执行

-- 创建配件联盟链接主表
CREATE TABLE IF NOT EXISTS part_affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  base_url TEXT NOT NULL,
  affiliate_params JSONB DEFAULT '{}',
  template_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  click_count BIGINT DEFAULT 0,
  conversion_count BIGINT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建点击追踪表
CREATE TABLE IF NOT EXISTS affiliate_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES part_affiliate_links(id) ON DELETE CASCADE,
  part_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_part_affiliate_links_platform ON part_affiliate_links(platform);
CREATE INDEX IF NOT EXISTS idx_part_affiliate_links_part_name ON part_affiliate_links(part_name);
CREATE INDEX IF NOT EXISTS idx_affiliate_click_tracking_affiliate_link_id ON affiliate_click_tracking(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_click_tracking_clicked_at ON affiliate_click_tracking(clicked_at DESC);

-- 插入测试数据
INSERT INTO part_affiliate_links (part_name, platform, base_url, affiliate_params, template_url, priority) VALUES
('iPhone电池', 'jd', 'https://item.jd.com/', 
 '{"utm_source": "fixcycle", "utm_medium": "affiliate", "union_id": "YOUR_UNION_ID"}',
 '{base_url}{product_id}.html?utm_source=fixcycle&utm_medium=affiliate&union_id=YOUR_UNION_ID&fc_source=tutorial',
 10),
('屏幕总成', 'taobao', 'https://detail.tmall.com/item.htm',
 '{"spm": "a219r.lm872.14.1", "ut_sk": "1.YOUR_UT_SK"}',
 '{base_url}?id={product_id}&spm=a219r.lm872.14.1&ut_sk=1.YOUR_UT_SK&fc_source=tutorial',
 8),
('充电器', 'amazon', 'https://www.amazon.com/dp/',
 '{"tag": "fixcycle-20", "_encoding": "UTF8"}',
 '{base_url}{product_id}?tag=fixcycle-20&_encoding=UTF8&fc_source=tutorial',
 6);

-- 验证创建结果
SELECT '=== 表创建完成 ===' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('part_affiliate_links', 'affiliate_click_tracking')
ORDER BY table_name;