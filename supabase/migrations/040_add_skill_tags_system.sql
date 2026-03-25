-- ====================================================================
-- Skill 标签管理系统
-- ====================================================================
-- 说明：实现标签的创建、管理、合并和热门标签功能
-- 执行顺序：在 039_add_skill_review_system.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 标签表
CREATE TABLE IF NOT EXISTS skill_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  name_en VARCHAR(50), -- 英文名称 (可选)
  description TEXT,
  category VARCHAR(50), -- 标签分类
  usage_count INTEGER DEFAULT 0, -- 使用次数
  is_hot BOOLEAN DEFAULT false, -- 是否热门
  color VARCHAR(7) DEFAULT '#3B82F6', -- 标签颜色 (HEX)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_skill_tags_name ON skill_tags(name);
CREATE INDEX IF NOT EXISTS idx_skill_tags_category ON skill_tags(category);
CREATE INDEX IF NOT EXISTS idx_skill_tags_is_hot ON skill_tags(is_hot);
CREATE INDEX IF NOT EXISTS idx_skill_tags_usage_count ON skill_tags(usage_count DESC);

-- 3. 添加注释
COMMENT ON TABLE skill_tags IS 'Skill 标签表';
COMMENT ON COLUMN skill_tags.name IS '标签名称 (唯一)';
COMMENT ON COLUMN skill_tags.name_en IS '标签英文名称';
COMMENT ON COLUMN skill_tags.category IS '标签分类 (技术/行业/功能等)';
COMMENT ON COLUMN skill_tags.usage_count IS '被引用的次数';
COMMENT ON COLUMN skill_tags.is_hot IS '是否热门推荐标签';
COMMENT ON COLUMN skill_tags.color IS '前端展示颜色';

-- 4. 启用 RLS
ALTER TABLE skill_tags ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 所有人可以查看标签
CREATE POLICY "view_tags" ON skill_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- 管理员可以管理标签
CREATE POLICY "admin_manage_tags" ON skill_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 6. 创建视图函数 - 获取热门标签
CREATE OR REPLACE FUNCTION get_hot_tags(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  usage_count INTEGER,
  color VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.id,
    st.name::VARCHAR,
    st.usage_count,
    st.color::VARCHAR
  FROM skill_tags st
  WHERE st.is_hot = true
  ORDER BY st.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建视图函数 - 搜索标签
CREATE OR REPLACE FUNCTION search_tags(p_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.id,
    st.name::VARCHAR,
    st.usage_count
  FROM skill_tags st
  WHERE st.name ILIKE '%' || p_query || '%'
  ORDER BY st.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 触发器函数 - 自动更新 usage_count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 新增技能标签关联时
  IF TG_OP = 'INSERT' THEN
    UPDATE skill_tags
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  END IF;

  -- 删除技能标签关联时
  IF TG_OP = 'DELETE' THEN
    UPDATE skill_tags
    SET usage_count = usage_count - 1,
        updated_at = NOW()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_tags'
ORDER BY ordinal_position;
