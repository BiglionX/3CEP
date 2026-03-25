-- ====================================================================
-- Skill 推荐系统
-- ====================================================================
-- 说明：基于协同过滤和内容的推荐算法
-- 执行顺序：在 040_add_skill_tags_system.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 推荐记录表
CREATE TABLE IF NOT EXISTS skill_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- 推荐给用户
  skill_id UUID NOT NULL, -- 推荐的 Skill
  recommendation_type VARCHAR(50), -- 推荐类型：similar, hot, personalized
  score DECIMAL(5,4), -- 推荐分数 (0-1)
  reason TEXT, -- 推荐理由
  is_clicked BOOLEAN DEFAULT false, -- 是否被点击
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_user_id ON skill_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_skill_id ON skill_recommendations(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_type ON skill_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_score ON skill_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_created_at ON skill_recommendations(created_at DESC);

-- 3. 添加注释
COMMENT ON TABLE skill_recommendations IS 'Skill 推荐记录表';
COMMENT ON COLUMN skill_recommendations.recommendation_type IS '推荐类型：similar(相似), hot(热门), personalized(个性化)';
COMMENT ON COLUMN skill_recommendations.score IS '推荐分数 (0-1),越高越相关';
COMMENT ON COLUMN skill_recommendations.reason IS '推荐理由 (如：基于您的浏览历史)';

-- 4. 启用 RLS
ALTER TABLE skill_recommendations ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 用户可以查看自己的推荐
CREATE POLICY "view_own_recommendations" ON skill_recommendations
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- 管理员可以查看所有推荐
CREATE POLICY "admin_view_all_recommendations" ON skill_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- 系统可以创建推荐记录
CREATE POLICY "system_create_recommendations" ON skill_recommendations
  FOR INSERT
  WITH CHECK (true);

-- 6. 创建视图函数 - 获取相似 Skills
CREATE OR REPLACE FUNCTION get_similar_skills(
  p_skill_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  skill_id UUID,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id::UUID,
    (
      -- 基于分类相同
      CASE WHEN s.category = target.category THEN 0.3 ELSE 0 END +
      -- 基于标签重叠度
      (
        SELECT COUNT(*)::DECIMAL / GREATEST(jsonb_array_length(target.tags), 1) * 0.4
        FROM jsonb_array_elements(s.tags) tag
        WHERE tag IN (SELECT jsonb_array_elements(target.tags))
      ) +
      -- 基于评分接近度
      CASE
        WHEN ABS(s.rating - target.rating) <= 0.5 THEN 0.3
        WHEN ABS(s.rating - target.rating) <= 1.0 THEN 0.15
        ELSE 0
      END
    )::DECIMAL as similarity_score
  FROM skills s,
       (SELECT category, tags, rating FROM skills WHERE id = p_skill_id) target
  WHERE s.id != p_skill_id
  AND s.shelf_status = 'on_shelf'
  AND s.review_status = 'approved'
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建视图函数 - 获取热门推荐 Skills
CREATE OR REPLACE FUNCTION get_hot_skills(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  skill_id UUID,
  hot_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id::UUID,
    (
      -- 浏览量权重 0.2
      COALESCE(s.view_count, 0)::DECIMAL * 0.001 * 0.2 +
      -- 下载量权重 0.3
      COALESCE(s.download_count, 0)::DECIMAL * 0.01 * 0.3 +
      -- 使用量权重 0.3
      COALESCE(s.usage_count, 0)::DECIMAL * 0.01 * 0.3 +
      -- 评分权重 0.2
      COALESCE(s.rating, 0)::DECIMAL * 0.1 * 0.2
    )::DECIMAL as hot_score
  FROM skills s
  WHERE s.shelf_status = 'on_shelf'
  AND s.review_status = 'approved'
  ORDER BY hot_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建视图函数 - 获取个性化推荐
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  skill_id UUID,
  personal_score DECIMAL,
  reason TEXT
) AS $$
DECLARE
  v_preferred_categories TEXT[];
  v_viewed_skills UUID[];
BEGIN
  -- 获取用户浏览过的技能 ID
  SELECT ARRAY(
    SELECT DISTINCT skill_id
    FROM skill_executions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 50
  ) INTO v_viewed_skills;

  -- 获取用户偏好的分类
  SELECT ARRAY_AGG(category ORDER BY cnt DESC)
  INTO v_preferred_categories
  FROM (
    SELECT s.category, COUNT(*) as cnt
    FROM skill_executions se
    JOIN skills s ON se.skill_id = s.id
    WHERE se.user_id = p_user_id
    GROUP BY s.category
  ) t;

  RETURN QUERY
  SELECT
    s.id::UUID,
    (
      -- 基于用户偏好分类
      CASE
        WHEN s.category = ANY(v_preferred_categories) THEN 0.5
        ELSE 0
      END +
      -- 基于热门标签
      CASE WHEN EXISTS (
        SELECT 1 FROM skill_tags st
        WHERE st.is_hot = true
        AND st.name = ANY(SELECT jsonb_array_elements_text(s.tags))
      ) THEN 0.2 ELSE 0 END +
      -- 基于流行度
      (
        COALESCE(s.usage_count, 0)::DECIMAL * 0.001 +
        COALESCE(s.rating, 0)::DECIMAL * 0.1
      ) * 0.3
    )::DECIMAL as personal_score,
    CASE
      WHEN s.category = ANY(v_preferred_categories)
        THEN '基于您的浏览偏好'
      WHEN s.is_featured = true
        THEN '编辑推荐'
      ELSE '热门精选'
    END::TEXT as reason
  FROM skills s
  WHERE s.id != ALL(v_viewed_skills)
  AND s.shelf_status = 'on_shelf'
  AND s.review_status = 'approved'
  ORDER BY personal_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 触发器函数 - 记录推荐点击
CREATE OR REPLACE FUNCTION track_recommendation_click()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_clicked = true AND OLD.is_clicked = false THEN
    -- 可以在这里添加其他逻辑，如更新用户画像
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建触发器
CREATE TRIGGER trigger_track_recommendation_click
BEFORE UPDATE ON skill_recommendations
FOR EACH ROW
WHEN (NEW.is_clicked = true AND OLD.is_clicked = false)
EXECUTE FUNCTION track_recommendation_click();

-- 11. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_recommendations'
ORDER BY ordinal_position;
