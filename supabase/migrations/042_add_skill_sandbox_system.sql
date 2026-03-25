-- ====================================================================
-- Skill 测试沙箱系统
-- ====================================================================
-- 说明：提供 Skills 的安全测试环境，记录测试历史和结果
-- 执行顺序：在 041_add_skill_recommendation_system.sql 之后执行
-- ====================================================================

-- 1. 创建 Skill 测试沙箱表
CREATE TABLE IF NOT EXISTS skill_sandboxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- 测试用户
  skill_id UUID NOT NULL, -- 测试的 Skill
  test_name VARCHAR(255), -- 测试名称

  -- 测试输入
  input_params JSONB DEFAULT '{}', -- 输入参数
  expected_output JSONB, -- 期望输出

  -- 测试结果
  actual_output JSONB, -- 实际输出
  execution_time DECIMAL(10,3), -- 执行时间 (毫秒)
  memory_usage INTEGER, -- 内存使用 (KB)
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'success', 'failed', 'timeout')),
  error_message TEXT, -- 错误信息

  -- 元数据
  is_public BOOLEAN DEFAULT false, -- 是否公开测试用例
  tags JSONB DEFAULT '[]', -- 测试标签
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_user_id ON skill_sandboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_skill_id ON skill_sandboxes(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_status ON skill_sandboxes(status);
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_created_at ON skill_sandboxes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_sandboxes_is_public ON skill_sandboxes(is_public);

-- 3. 添加注释
COMMENT ON TABLE skill_sandboxes IS 'Skill 测试沙箱表';
COMMENT ON COLUMN skill_sandboxes.input_params IS 'JSONB 格式的输入参数';
COMMENT ON COLUMN skill_sandboxes.expected_output IS '期望的输出结果';
COMMENT ON COLUMN skill_sandboxes.actual_output IS '实际的输出结果';
COMMENT ON COLUMN skill_sandboxes.execution_time IS '执行时间 (毫秒)';
COMMENT ON COLUMN skill_sandboxes.memory_usage IS '内存使用量 (KB)';
COMMENT ON COLUMN skill_sandboxes.status IS '测试状态';

-- 4. 启用 RLS
ALTER TABLE skill_sandboxes ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
-- 用户可以查看自己的测试
CREATE POLICY "view_own_sandboxes" ON skill_sandboxes
  FOR SELECT
  USING (user_id = auth.uid());

-- 用户可以创建自己的测试
CREATE POLICY "create_own_sandboxes" ON skill_sandboxes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 用户可以更新自己的测试
CREATE POLICY "update_own_sandboxes" ON skill_sandboxes
  FOR UPDATE
  USING (user_id = auth.uid());

-- 用户可以删除自己的测试
CREATE POLICY "delete_own_sandboxes" ON skill_sandboxes
  FOR DELETE
  USING (user_id = auth.uid());

-- 所有人可以查看公开测试
CREATE POLICY "view_public_sandboxes" ON skill_sandboxes
  FOR SELECT
  USING (is_public = true);

-- 管理员可以查看所有测试
CREATE POLICY "admin_view_all_sandboxes" ON skill_sandboxes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- 6. 创建视图函数 - 获取用户的测试统计
CREATE OR REPLACE FUNCTION get_user_sandbox_stats(p_user_id UUID)
RETURNS TABLE (
  total_tests BIGINT,
  success_count BIGINT,
  failed_count BIGINT,
  avg_execution_time DOUBLE PRECISION,
  success_rate DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'success' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'failed' THEN 1 END)::BIGINT,
    COALESCE(AVG(execution_time), 0)::DOUBLE PRECISION,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(CASE WHEN status = 'success' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100)::DOUBLE PRECISION
      ELSE 0
    END
  FROM skill_sandboxes
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建视图函数 - 获取 Skill 的测试统计
CREATE OR REPLACE FUNCTION get_skill_sandbox_stats(p_skill_id UUID)
RETURNS TABLE (
  total_tests BIGINT,
  public_tests BIGINT,
  success_rate DOUBLE PRECISION,
  avg_execution_time DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN is_public = true THEN 1 END)::BIGINT,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(CASE WHEN status = 'success' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100)::DOUBLE PRECISION
      ELSE 0
    END,
    COALESCE(AVG(execution_time), 0)::DOUBLE PRECISION
  FROM skill_sandboxes
  WHERE skill_id = p_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 触发器函数 - 自动更新测试时间
CREATE OR REPLACE FUNCTION update_sandbox_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器
CREATE TRIGGER trigger_update_sandbox_updated_at
BEFORE UPDATE ON skill_sandboxes
FOR EACH ROW
EXECUTE FUNCTION update_sandbox_updated_at();

-- 10. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_sandboxes'
ORDER BY ordinal_position;
