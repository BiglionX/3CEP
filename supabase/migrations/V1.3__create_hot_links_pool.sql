-- V1.3__create_hot_links_pool.sql
-- 创建热点链接池表
-- 创建时间: 2026-02-20
-- 版本: 1.3.0

-- 热点链接池表
CREATE TABLE IF NOT EXISTS hot_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  image_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_hot_links_category ON hot_links(category);
CREATE INDEX IF NOT EXISTS idx_hot_links_sub_category ON hot_links(sub_category);
CREATE INDEX IF NOT EXISTS idx_hot_links_views ON hot_links(views);
CREATE INDEX IF NOT EXISTS idx_hot_links_created_at ON hot_links(created_at);

-- 添加表注释
COMMENT ON TABLE hot_links IS '热点链接池表';
COMMENT ON COLUMN hot_links.id IS '链接唯一标识符';
COMMENT ON COLUMN hot_links.url IS '链接URL';
COMMENT ON COLUMN hot_links.title IS '链接标题';
COMMENT ON COLUMN hot_links.description IS '链接描述';
COMMENT ON COLUMN hot_links.source IS '来源网站';
COMMENT ON COLUMN hot_links.category IS '链接分类';
COMMENT ON COLUMN hot_links.sub_category IS '链接子分类';
COMMENT ON COLUMN hot_links.image_url IS '封面图片URL';
COMMENT ON COLUMN hot_links.views IS '浏览次数';
COMMENT ON COLUMN hot_links.likes IS '点赞数';
COMMENT ON COLUMN hot_links.share_count IS '分享次数';
COMMENT ON COLUMN hot_links.scraped_at IS '爬取时间';
COMMENT ON COLUMN hot_links.created_at IS '创建时间';
COMMENT ON COLUMN hot_links.status IS '链接状态(active/inactive)';

-- 启用RLS
ALTER TABLE hot_links ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "允许所有人查看热点链接" ON hot_links FOR SELECT USING (true);
CREATE POLICY "认证用户可管理热点链接" ON hot_links FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 热点链接池表创建完成'