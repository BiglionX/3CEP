-- ====================================================================
-- Skill 文档管理系统
-- ====================================================================
-- 说明：管理 Skills 的文档、教程和使用指南
-- 执行顺序：在 042_add_skill_sandbox_system.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 文档表
CREATE TABLE IF NOT EXISTS skill_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL, -- 文档标题
  slug VARCHAR(255), -- URL 友好的标识符

  -- 文档内容
  content_type VARCHAR(50) DEFAULT 'markdown'
    CHECK (content_type IN ('markdown', 'html', 'plaintext')),
  content TEXT, -- 文档内容
  summary TEXT, -- 摘要

  -- 文档元数据
  category VARCHAR(50) DEFAULT 'guide'
    CHECK (category IN ('guide', 'api', 'tutorial', 'faq', 'changelog')),
  version VARCHAR(20), -- 适用的 Skill 版本
  order_index INTEGER DEFAULT 0, -- 排序索引

  -- 发布状态
  is_published BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false, -- 是否官方文档
  published_at TIMESTAMP WITH TIME ZONE,

  -- 统计信息
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  help_count INTEGER DEFAULT 0, -- 认为有帮助的用户数

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_skill_documents_skill_id ON skill_documents(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_documents_slug ON skill_documents(slug);
CREATE INDEX IF NOT EXISTS idx_skill_documents_category ON skill_documents(category);
CREATE INDEX IF NOT EXISTS idx_skill_documents_is_published ON skill_documents(is_published);
CREATE INDEX IF NOT EXISTS idx_skill_documents_order ON skill_documents(order_index);
CREATE INDEX IF NOT EXISTS idx_skill_documents_created_at ON skill_documents(created_at DESC);

-- 3. 添加注释
COMMENT ON TABLE skill_documents IS 'Skill 文档表';
COMMENT ON COLUMN skill_documents.slug IS 'URL 友好的标识符，用于生成友好链接';
COMMENT ON COLUMN skill_documents.content_type IS '内容格式：markdown/html/plaintext';
COMMENT ON COLUMN skill_documents.category IS '文档分类：guide/api/tutorial/faq/changelog';
COMMENT ON COLUMN skill_documents.is_official IS '是否官方文档 (开发者发布)';
COMMENT ON COLUMN skill_documents.order_index IS '排序索引，数字越小越靠前';

-- 4. 启用 RLS
ALTER TABLE skill_documents ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 所有人可以查看已发布的文档
CREATE POLICY "view_published_documents" ON skill_documents
  FOR SELECT
  USING (is_published = true);

-- 认证用户可以查看所有文档 (包括草稿)
CREATE POLICY "authenticated_view_documents" ON skill_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可以创建文档
CREATE POLICY "create_documents" ON skill_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户可以更新自己的文档
CREATE POLICY "update_own_documents" ON skill_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_documents.skill_id
      AND s.developer_id = auth.uid()
    )
  );

-- 用户可以删除自己的文档
CREATE POLICY "delete_own_documents" ON skill_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_documents.skill_id
      AND s.developer_id = auth.uid()
    )
  );

-- 管理员可以管理所有文档
CREATE POLICY "admin_manage_documents" ON skill_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- 6. 创建视图函数 - 获取 Skill 的文档列表
CREATE OR REPLACE FUNCTION get_skill_documents(p_skill_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  category VARCHAR,
  version VARCHAR,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.title::VARCHAR,
    sd.slug::VARCHAR,
    sd.category::VARCHAR,
    sd.version::VARCHAR,
    sd.view_count,
    sd.created_at
  FROM skill_documents sd
  WHERE sd.skill_id = p_skill_id
  AND sd.is_published = true
  ORDER BY sd.order_index, sd.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建视图函数 - 搜索文档
CREATE OR REPLACE FUNCTION search_documents(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  skill_id UUID,
  title VARCHAR,
  summary TEXT,
  category VARCHAR,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.skill_id,
    sd.title::VARCHAR,
    sd.summary,
    sd.category::VARCHAR,
    (
      -- 标题匹配权重 0.6
      CASE
        WHEN sd.title ILIKE '%' || p_query || '%' THEN 0.6
        ELSE 0
      END +
      -- 内容匹配权重 0.4
      CASE
        WHEN sd.content ILIKE '%' || p_query || '%' THEN 0.4
        ELSE 0
      END
    )::DECIMAL as relevance_score
  FROM skill_documents sd
  WHERE sd.is_published = true
  AND (
    sd.title ILIKE '%' || p_query || '%'
    OR sd.content ILIKE '%' || p_query || '%'
    OR sd.summary ILIKE '%' || p_query || '%'
  )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 触发器函数 - 自动更新更新时间
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器
CREATE TRIGGER trigger_update_document_updated_at
BEFORE UPDATE ON skill_documents
FOR EACH ROW
EXECUTE FUNCTION update_document_updated_at();

-- 10. 创建文档点赞表
CREATE TABLE IF NOT EXISTS document_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES skill_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  is_helpful BOOLEAN DEFAULT true, -- true=有帮助，false=没帮助
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id) -- 每个用户对每个文档只能点赞一次
);

-- 11. 创建索引
CREATE INDEX IF NOT EXISTS idx_document_likes_document_id ON document_likes(document_id);
CREATE INDEX IF NOT EXISTS idx_document_likes_user_id ON document_likes(user_id);

-- 12. 触发器函数 - 自动更新点赞计数
CREATE OR REPLACE FUNCTION update_document_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE skill_documents
    SET like_count = like_count + 1,
        help_count = CASE WHEN NEW.is_helpful THEN help_count + 1 ELSE help_count END
    WHERE id = NEW.document_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skill_documents
    SET like_count = like_count - 1,
        help_count = CASE WHEN OLD.is_helpful THEN help_count - 1 ELSE help_count END
    WHERE id = OLD.document_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 13. 创建触发器
CREATE TRIGGER trigger_update_document_like_count
AFTER INSERT OR DELETE ON document_likes
FOR EACH ROW
EXECUTE FUNCTION update_document_like_count();

-- 14. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_documents'
ORDER BY ordinal_position;
