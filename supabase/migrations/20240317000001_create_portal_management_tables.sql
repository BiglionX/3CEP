-- 门户管理系统数据表
-- 用于存储用户门户的基本信息、业务链接、宣传图片和博客文章

-- 1. 门户基本信息表
CREATE TABLE IF NOT EXISTS user_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_name VARCHAR(255) NOT NULL,
  portal_description TEXT,
  portal_logo_url VARCHAR(2048),
  business_type VARCHAR(100) NOT NULL, -- 'enterprise' | 'repair-shop' | 'foreign-trade'
  
  -- 联系信息
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  address TEXT,
  business_hours VARCHAR(255),
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 审核状态
  approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_business_type CHECK (business_type IN ('enterprise', 'repair-shop', 'foreign-trade')),
  CONSTRAINT valid_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

-- 2. 业务链接表
CREATE TABLE IF NOT EXISTS portal_business_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES user_portals(id) ON DELETE CASCADE,
  
  link_name VARCHAR(255) NOT NULL,
  link_url VARCHAR(2048) NOT NULL,
  link_type VARCHAR(100) NOT NULL, -- 'shop' | 'service' | 'booking' | 'contact' | 'custom'
  link_icon VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  
  -- 统计
  click_count INTEGER DEFAULT 0,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_link_type CHECK (link_type IN ('shop', 'service', 'booking', 'contact', 'custom'))
);

-- 3. 宣传图片表
CREATE TABLE IF NOT EXISTS portal_promotional_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES user_portals(id) ON DELETE CASCADE,
  
  image_url VARCHAR(2048) NOT NULL,
  image_title VARCHAR(255),
  image_description TEXT,
  image_type VARCHAR(100), -- 'banner' | 'showcase' | 'product' | 'team'
  display_order INTEGER DEFAULT 0,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_image_type CHECK (image_type IN ('banner', 'showcase', 'product', 'team'))
);

-- 4. 博客文章表
CREATE TABLE IF NOT EXISTS portal_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES user_portals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  post_title VARCHAR(500) NOT NULL,
  post_slug VARCHAR(500) UNIQUE NOT NULL,
  post_excerpt TEXT,
  post_content TEXT NOT NULL,
  featured_image_url VARCHAR(2048),
  
  -- 分类和标签
  category VARCHAR(255),
  tags TEXT[],
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- 状态
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 调度
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_user_portals_user_id ON user_portals(user_id);
CREATE INDEX idx_user_portals_business_type ON user_portals(business_type);
CREATE INDEX idx_user_portals_approval_status ON user_portals(approval_status);
CREATE INDEX idx_user_portals_is_active ON user_portals(is_active);
CREATE INDEX idx_user_portals_is_published ON user_portals(is_published);

CREATE INDEX idx_portal_business_links_portal_id ON portal_business_links(portal_id);
CREATE INDEX idx_portal_business_links_link_type ON portal_business_links(link_type);

CREATE INDEX idx_portal_promotional_images_portal_id ON portal_promotional_images(portal_id);
CREATE INDEX idx_portal_promotional_images_image_type ON portal_promotional_images(image_type);

CREATE INDEX idx_portal_blog_posts_portal_id ON portal_blog_posts(portal_id);
CREATE INDEX idx_portal_blog_posts_author_id ON portal_blog_posts(author_id);
CREATE INDEX idx_portal_blog_posts_post_slug ON portal_blog_posts(post_slug);
CREATE INDEX idx_portal_blog_posts_category ON portal_blog_posts(category);
CREATE INDEX idx_portal_blog_posts_is_published ON portal_blog_posts(is_published);
CREATE INDEX idx_portal_blog_posts_published_at ON portal_blog_posts(published_at DESC);

-- 创建触发器函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
CREATE TRIGGER update_user_portals_updated_at BEFORE UPDATE ON user_portals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_business_links_updated_at BEFORE UPDATE ON portal_business_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_promotional_images_updated_at BEFORE UPDATE ON portal_promotional_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_blog_posts_updated_at BEFORE UPDATE ON portal_blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE user_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_business_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_promotional_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS 策略

-- 用户只能访问自己的门户
CREATE POLICY "Users can view their own portals"
  ON user_portals FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own portals"
  ON user_portals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portals"
  ON user_portals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any portal"
  ON user_portals FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 业务链接：通过 portal_id 级联访问
CREATE POLICY "Users can view links from their portals"
  ON portal_business_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_portals 
      WHERE user_portals.id = portal_business_links.portal_id 
      AND user_portals.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- 宣传图片：通过 portal_id 级联访问
CREATE POLICY "Users can view images from their portals"
  ON portal_promotional_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_portals 
      WHERE user_portals.id = portal_promotional_images.portal_id 
      AND user_portals.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- 博客文章：通过 portal_id 级联访问
CREATE POLICY "Users can view posts from their portals"
  ON portal_blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_portals 
      WHERE user_portals.id = portal_blog_posts.portal_id 
      AND user_portals.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- 添加注释
COMMENT ON TABLE user_portals IS '用户门户基本信息表';
COMMENT ON TABLE portal_business_links IS '门户业务链接表';
COMMENT ON TABLE portal_promotional_images IS '门户宣传图片表';
COMMENT ON TABLE portal_blog_posts IS '门户博客文章表';
