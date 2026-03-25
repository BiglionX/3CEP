-- ====================================================================
-- Skill 执行日志表
-- ====================================================================
-- 说明：记录 Skill 的每次调用，用于统计分析和性能监控
-- 执行顺序：在 036_add_skill_version_history.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 执行日志表
CREATE TABLE IF NOT EXISTS skill_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  execution_time INTEGER, -- 毫秒
  status VARCHAR(20) CHECK (status IN ('success', 'error', 'timeout')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_skill_executions_skill_id ON skill_executions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_executions_user_id ON skill_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_executions_created_at ON skill_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_skill_executions_status ON skill_executions(status);

-- 3. 添加注释
COMMENT ON TABLE skill_executions IS 'Skill 执行日志表';
COMMENT ON COLUMN skill_executions.execution_time IS '执行耗时 (毫秒)';
COMMENT ON COLUMN skill_executions.status IS '执行状态：success/error/timeout';
COMMENT ON COLUMN skill_executions.input_data IS '输入数据';
COMMENT ON COLUMN skill_executions.output_data IS '输出数据';
COMMENT ON COLUMN skill_executions.error_message IS '错误信息';

-- 4. 启用 RLS
ALTER TABLE skill_executions ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 管理员可以查看所有执行记录
CREATE POLICY "admin_view_all_executions" ON skill_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 普通用户只能查看自己的执行记录
CREATE POLICY "user_view_own_executions" ON skill_executions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 允许写入执行记录 (通过 API)
CREATE POLICY "insert_executions" ON skill_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. 创建视图函数 - 获取 Skill 使用统计
CREATE OR REPLACE FUNCTION get_skill_usage_stats(p_skill_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_executions BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  timeout_count BIGINT,
  avg_execution_time DOUBLE PRECISION,
  min_execution_time BIGINT,
  max_execution_time BIGINT,
  success_rate DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'success' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'error' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'timeout' THEN 1 END)::BIGINT,
    AVG(execution_time)::DOUBLE PRECISION,
    MIN(execution_time)::BIGINT,
    MAX(execution_time)::BIGINT,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2)
      ELSE 0
    END::DOUBLE PRECISION
  FROM skill_executions
  WHERE skill_id = p_skill_id
  AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建视图函数 - 获取每日执行趋势
CREATE OR REPLACE FUNCTION get_skill_daily_trend(p_skill_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_executions BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  avg_execution_time DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at)::DATE,
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'success' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'error' THEN 1 END)::BIGINT,
    AVG(execution_time)::DOUBLE PRECISION
  FROM skill_executions
  WHERE skill_id = p_skill_id
  AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 触发器函数 - 自动清理旧执行记录 (保留最近 1000 条)
CREATE OR REPLACE FUNCTION cleanup_old_executions()
RETURNS TRIGGER AS $$
BEGIN
  -- 对每个 skill_id，只保留最近的 1000 条记录
  DELETE FROM skill_executions
  WHERE skill_id = NEW.skill_id
  AND id NOT IN (
    SELECT id
    FROM skill_executions
    WHERE skill_id = NEW.skill_id
    ORDER BY created_at DESC
    LIMIT 1000
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器
CREATE TRIGGER trigger_cleanup_executions
AFTER INSERT ON skill_executions
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_executions();

-- 10. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_executions'
ORDER BY ordinal_position;
