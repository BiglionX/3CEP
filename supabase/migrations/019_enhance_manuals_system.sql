-- 增强版说明书管理系统表结构
-- Migration: 019_enhance_manuals_system.sql
-- 创建时间: 2026-02-19
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：增强产品说明书表结构
-- ====================================================================

-- 产品说明书主表（增强版）
CREATE TABLE IF NOT EXISTS product_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title JSONB NOT NULL, -- 多语言标题 { "zh": "中文标题", "en": "English Title" }
  content JSONB NOT NULL, -- 多语言内容 { "zh": "<html>...</html>", "en": "<html>...</html>" }
  language_codes TEXT[], -- 支持的语言列表 ['zh', 'en']
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, rejected
  cover_image_url TEXT, -- 封面图片URL
  video_url TEXT, -- 视频教程URL
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书章节表（支持结构化内容）
CREATE TABLE IF NOT EXISTS manual_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL, -- 章节顺序
  section_title JSONB NOT NULL, -- 多语言章节标题
  section_content JSONB NOT NULL, -- 章节内容（HTML格式）
  media_urls JSONB, -- 媒体资源URL数组 { "images": [], "videos": [] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书版本历史表
CREATE TABLE IF NOT EXISTS manual_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title JSONB NOT NULL,
  content JSONB NOT NULL,
  changes TEXT, -- 变更说明
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书审核记录表
CREATE TABLE IF NOT EXISTS manual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  action VARCHAR(20) NOT NULL, -- approve, reject, request_changes
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 说明书评论表
CREATE TABLE IF NOT EXISTS manual_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES product_manuals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 评分1-5星
  is_resolved BOOLEAN DEFAULT false, -- 是否已解决
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_product_manuals_product_id ON product_manuals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_manuals_status ON product_manuals(status);
CREATE INDEX IF NOT EXISTS idx_product_manuals_created_by ON product_manuals(created_by);
CREATE INDEX IF NOT EXISTS idx_product_manuals_language_codes ON product_manuals USING GIN(language_codes);
CREATE INDEX IF NOT EXISTS idx_product_manuals_created_at ON product_manuals(created_at);

CREATE INDEX IF NOT EXISTS idx_manual_sections_manual_id ON manual_sections(manual_id);
CREATE INDEX IF NOT EXISTS idx_manual_sections_section_order ON manual_sections(section_order);

CREATE INDEX IF NOT EXISTS idx_manual_versions_manual_id ON manual_versions(manual_id);
CREATE INDEX IF NOT EXISTS idx_manual_versions_version ON manual_versions(version);

CREATE INDEX IF NOT EXISTS idx_manual_reviews_manual_id ON manual_reviews(manual_id);
CREATE INDEX IF NOT EXISTS idx_manual_comments_manual_id ON manual_comments(manual_id);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_manuals_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_product_manuals_updated_at 
    BEFORE UPDATE ON product_manuals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_manuals_updated_at_column();

CREATE TRIGGER update_manual_sections_updated_at 
    BEFORE UPDATE ON manual_sections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_manuals_updated_at_column();

CREATE TRIGGER update_manual_comments_updated_at 
    BEFORE UPDATE ON manual_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_manuals_updated_at_column();

-- ====================================================================
-- 第四部分：RLS策略
-- ====================================================================

-- 为product_manuals表添加RLS策略
ALTER TABLE product_manuals ENABLE ROW LEVEL SECURITY;

-- 用户只能查看已发布的说明书或自己创建的说明书
CREATE POLICY "Users can view published manuals or their own drafts" ON product_manuals
    FOR SELECT USING (
        status = 'published' 
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 认证用户可以创建说明书
CREATE POLICY "Authenticated users can create manuals" ON product_manuals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户只能修改自己创建的说明书
CREATE POLICY "Users can update their own manuals" ON product_manuals
    FOR UPDATE USING (created_by = auth.uid());

-- 管理员可以删除任何说明书
CREATE POLICY "Admins can delete manuals" ON product_manuals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 为manual_sections表添加RLS策略
ALTER TABLE manual_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections are accessible through manuals" ON manual_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM product_manuals pm
            WHERE pm.id = manual_sections.manual_id
            AND (
                pm.status = 'published' 
                OR pm.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM auth.users u 
                    WHERE u.id = auth.uid() 
                    AND u.role = 'admin'
                )
            )
        )
    );

-- 为manual_comments表添加RLS策略
ALTER TABLE manual_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible manuals" ON manual_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product_manuals pm
            WHERE pm.id = manual_comments.manual_id
            AND (
                pm.status = 'published' 
                OR pm.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM auth.users u 
                    WHERE u.id = auth.uid() 
                    AND u.role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Authenticated users can create comments" ON manual_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- 第五部分：初始化数据和视图
-- ====================================================================

-- 创建说明书统计视图
CREATE OR REPLACE VIEW manual_statistics AS
SELECT 
    pm.id,
    pm.product_id,
    p.name as product_name,
    p.model as product_model,
    b.name as brand_name,
    pm.title,
    pm.language_codes,
    pm.version,
    pm.status,
    pm.view_count,
    pm.download_count,
    pm.created_by,
    u.email as creator_email,
    pm.created_at,
    pm.updated_at,
    COUNT(mc.id) as comment_count,
    AVG(mc.rating) as average_rating
FROM product_manuals pm
JOIN products p ON pm.product_id = p.id
JOIN brands b ON p.brand_id = b.id
JOIN auth.users u ON pm.created_by = u.id
LEFT JOIN manual_comments mc ON pm.id = mc.manual_id
GROUP BY pm.id, p.name, p.model, b.name, u.email;

-- 插入系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('manual_max_file_size', '10485760', '说明书最大文件大小（字节）'),
  ('manual_allowed_languages', '["zh", "en"]', '允许的语言代码'),
  ('manual_min_rating', '1', '最小评分'),
  ('manual_max_rating', '5', '最大评分')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- 第六部分：表注释
-- ====================================================================

COMMENT ON TABLE product_manuals IS '产品说明书主表';
COMMENT ON TABLE manual_sections IS '说明书章节表';
COMMENT ON TABLE manual_versions IS '说明书版本历史表';
COMMENT ON TABLE manual_reviews IS '说明书审核记录表';
COMMENT ON TABLE manual_comments IS '说明书评论表';

COMMENT ON COLUMN product_manuals.title IS '多语言标题JSON';
COMMENT ON COLUMN product_manuals.content IS '多语言内容JSON';
COMMENT ON COLUMN product_manuals.cover_image_url IS '封面图片URL';
COMMENT ON COLUMN product_manuals.video_url IS '视频教程URL';
COMMENT ON COLUMN product_manuals.view_count IS '查看次数';
COMMENT ON COLUMN product_manuals.download_count IS '下载次数';
COMMENT ON COLUMN manual_sections.media_urls IS '媒体资源URL数组';
COMMENT ON COLUMN manual_comments.rating IS '用户评分1-5星';