-- 手动部署热点链接审核表结构
-- 请在Supabase控制台SQL Editor中执行此脚本

-- 1. 创建热点链接池表
CREATE TABLE IF NOT EXISTS hot_link_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  ai_tags JSONB,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending_review',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  article_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  summary TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft',
  tags JSONB,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  publish_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建文章分类表
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES article_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_hot_link_pool_status ON hot_link_pool(status);
CREATE INDEX IF NOT EXISTS idx_hot_link_pool_scraped_at ON hot_link_pool(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_hot_link_pool_likes ON hot_link_pool(likes DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_publish_at ON articles(publish_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON article_categories(slug);

-- 5. 启用RLS
ALTER TABLE hot_link_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- 6. 插入示例分类数据
INSERT INTO article_categories (name, slug, description, sort_order) VALUES
  ('维修教程', 'repair-tutorial', '各类设备维修教程', 1),
  ('技术分享', 'tech-share', '技术经验分享', 2),
  ('行业资讯', 'industry-news', '手机维修行业新闻', 3),
  ('工具推荐', 'tool-recommendation', '维修工具和设备推荐', 4),
  ('案例分析', 'case-study', '实际维修案例分析', 5)
ON CONFLICT (slug) DO NOTHING;

-- 7. 插入示例热点链接数据
INSERT INTO hot_link_pool (
  url, title, description, source, category, sub_category, 
  image_url, likes, views, ai_tags, status
) VALUES
  ('https://www.zhihu.com/question/445678901', 
   'iPhone 14 Pro屏幕更换完整教程', 
   '从拆机到安装的详细iPhone屏幕维修指南，包含工具准备和注意事项',
   '知乎', '维修教程', '屏幕维修',
   'https://picsum.photos/400/200?random=901', 156, 1200,
   '{"tags": ["iPhone", "屏幕维修", "DIY"], "confidence": 0.95}'::jsonb,
   'pending_review'),
   
  ('https://www.bilibili.com/video/BV1A24y1r7K8',
   '小米13 Pro拆机实录',
   '手把手教你拆解小米旗舰手机，详细展示内部结构',
   '哔哩哔哩', '视频教程', '拆机教学',
   'https://picsum.photos/400/200?random=902', 89, 856,
   '{"tags": ["小米", "拆机", "视频教程"], "confidence": 0.88}'::jsonb,
   'pending_review'),
   
  ('https://jingyan.baidu.com/article/abcdef123456',
   '安卓手机Root风险评估',
   '全面分析安卓手机获取Root权限的利弊和安全风险',
   '百度经验', '技术分析', '系统优化',
   'https://picsum.photos/400/200?random=903', 234, 2100,
   '{"tags": ["安卓", "Root", "安全"], "confidence": 0.92}'::jsonb,
   'pending_review'),
   
  ('https://www.ifixit.com/Guide/iPhone+15+Pro+Screen+Replacement/157342',
   'iPhone 15 Pro屏幕更换官方指南',
   'iFixit提供的专业iPhone 15 Pro屏幕拆解维修教程',
   'iFixit', '官方指南', '屏幕维修',
   'https://picsum.photos/400/200?random=904', 445, 3200,
   '{"tags": ["iPhone 15", "官方指南", "专业"], "confidence": 0.98}'::jsonb,
   'pending_review')
ON CONFLICT (url) DO NOTHING;

-- 8. 验证创建结果
SELECT '=== 热点链接审核表结构创建完成 ===' as status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('hot_link_pool', 'articles', 'article_categories')
ORDER BY table_name;

SELECT '=== 各表记录数统计 ===' as status;

SELECT 'hot_link_pool' as table_name, COUNT(*) as record_count FROM hot_link_pool
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'article_categories', COUNT(*) FROM article_categories
ORDER BY table_name;