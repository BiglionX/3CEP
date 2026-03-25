-- ====================================================================
-- Skill 版本历史表
-- ====================================================================
-- 说明：记录 Skill 的每次修改历史，支持版本对比和回滚
-- 执行顺序：在 034_add_skill_store_management.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 版本历史表
CREATE TABLE IF NOT EXISTS skill_version_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  old_version VARCHAR(20) NOT NULL,
  new_version VARCHAR(20) NOT NULL,
  changes JSONB, -- 记录变更的字段 {field: {from: old, to: new}}
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_skill_version_history_skill_id ON skill_version_history(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_version_history_created_at ON skill_version_history(created_at);

-- 3. 添加注释
COMMENT ON TABLE skill_version_history IS 'Skill 版本历史记录表';
COMMENT ON COLUMN skill_version_history.changes IS '变更详情，JSON 格式存储每个字段的前后值';

-- 4. 启用 RLS
ALTER TABLE skill_version_history ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 管理员可以查看所有历史记录
CREATE POLICY "admin_view_version_history" ON skill_version_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 6. 创建视图函数 - 获取 Skill 的所有版本
CREATE OR REPLACE FUNCTION get_skill_versions(p_skill_id UUID)
RETURNS TABLE (
  version VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  changed_by_email TEXT,
  changes JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vh.new_version::VARCHAR,
    vh.created_at,
    au.email::TEXT,
    vh.changes
  FROM skill_version_history vh
  LEFT JOIN admin_users au ON vh.changed_by = au.user_id
  WHERE vh.skill_id = p_skill_id
  ORDER BY vh.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 触发器函数 - 自动清理旧版本历史 (保留最近 50 条)
CREATE OR REPLACE FUNCTION cleanup_old_version_history()
RETURNS TRIGGER AS $$
BEGIN
  -- 对每个 skill_id，只保留最近的 50 条记录
  DELETE FROM skill_version_history
  WHERE skill_id = NEW.skill_id
  AND id NOT IN (
    SELECT id
    FROM skill_version_history
    WHERE skill_id = NEW.skill_id
    ORDER BY created_at DESC
    LIMIT 50
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
CREATE TRIGGER trigger_cleanup_version_history
AFTER INSERT ON skill_version_history
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_version_history();

-- 9. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_version_history'
ORDER BY ordinal_position;
