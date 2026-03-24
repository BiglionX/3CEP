-- 门户审批系统数据库迁移
-- 创建时间：2026-03-24
-- 版本：1.0.0

-- ============================================
-- 1. 创建审批日志表
-- ============================================
CREATE TABLE IF NOT EXISTS portal_approval_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portal_id UUID NOT NULL REFERENCES user_portals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- 审批动作
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
  
  -- 原因和条件
  reason TEXT,
  conditions JSONB DEFAULT '{}',
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_portal_approval_logs_portal_id ON portal_approval_logs(portal_id);
CREATE INDEX idx_portal_approval_logs_reviewer_id ON portal_approval_logs(reviewer_id);
CREATE INDEX idx_portal_approval_logs_action ON portal_approval_logs(action);
CREATE INDEX idx_portal_approval_logs_created_at ON portal_approval_logs(created_at DESC);

-- 添加注释
COMMENT ON TABLE portal_approval_logs IS '门户审批日志表';
COMMENT ON COLUMN portal_approval_logs.action IS '审批动作：approved=通过，rejected=拒绝';
COMMENT ON COLUMN portal_approval_logs.reason IS '审批原因（拒绝时必填）';
COMMENT ON COLUMN portal_approval_logs.conditions IS '审批条件（可选）';

-- ============================================
-- 2. 更新 user_portals 表添加审批相关字段
-- ============================================
-- 如果字段不存在则添加
DO $$ 
BEGIN
  -- 添加 reviewed_by 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'user_portals' 
                   AND column_name = 'reviewed_by') THEN
    ALTER TABLE user_portals ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  -- 添加 reviewed_at 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'user_portals' 
                   AND column_name = 'reviewed_at') THEN
    ALTER TABLE user_portals ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- 添加 rejection_reason 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'user_portals' 
                   AND column_name = 'rejection_reason') THEN
    ALTER TABLE user_portals ADD COLUMN rejection_reason TEXT;
  END IF;

  -- 添加 metadata 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'user_portals' 
                   AND column_name = 'metadata') THEN
    ALTER TABLE user_portals ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- 3. 创建审批统计视图
-- ============================================
CREATE OR REPLACE VIEW v_portal_approval_stats AS
SELECT 
  DATE_TRUNC('day', l.created_at) as approval_date,
  COUNT(*) FILTER (WHERE l.action = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE l.action = 'rejected') as rejected_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE l.action = 'approved') * 100.0 / NULLIF(COUNT(*), 0),
    2
  ) as approval_rate,
  COUNT(DISTINCT l.reviewer_id) as active_reviewers
FROM portal_approval_logs l
GROUP BY DATE_TRUNC('day', l.created_at)
ORDER BY approval_date DESC;

COMMENT ON VIEW v_portal_approval_stats IS '门户审批统计视图';

-- ============================================
-- 4. 创建触发器：自动更新审批时间
-- ============================================
CREATE OR REPLACE FUNCTION update_portal_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status != OLD.approval_status THEN
    NEW.reviewed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 user_portals 表添加触发器
DROP TRIGGER IF EXISTS trg_update_portal_review_timestamp ON user_portals;
CREATE TRIGGER trg_update_portal_review_timestamp
  BEFORE UPDATE ON user_portals
  FOR EACH ROW
  EXECUTE FUNCTION update_portal_review_timestamp();

-- ============================================
-- 5. 创建 RLS（行级安全策略）
-- ============================================

-- 启用 RLS
ALTER TABLE portal_approval_logs ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有日志
CREATE POLICY "Admins can view all approval logs"
  ON portal_approval_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- 只有管理员可以插入日志
CREATE POLICY "Admins can insert approval logs"
  ON portal_approval_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- 用户只能查看自己门户的日志
CREATE POLICY "Users can view own portal logs"
  ON portal_approval_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_portals p
      WHERE p.id = portal_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. 创建通知函数（可选，用于实时通知）
-- ============================================
CREATE OR REPLACE FUNCTION notify_portal_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- 发送通知到 PostgreSQL LISTEN/NOTIFY
  PERFORM pg_notify(
    'portal_approval_notification',
    json_build_object(
      'portal_id', NEW.portal_id,
      'action', NEW.action,
      'reviewer_id', NEW.reviewer_id,
      'timestamp', NEW.created_at
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trg_notify_portal_approval ON portal_approval_logs;
CREATE TRIGGER trg_notify_portal_approval
  AFTER INSERT ON portal_approval_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_portal_approval();

-- ============================================
-- 7. 插入测试数据（可选）
-- ============================================
-- DO $$ 
-- DECLARE
--   v_test_portal_id UUID;
--   v_test_admin_id UUID;
-- BEGIN
--   -- 获取测试门户和管理员
--   SELECT id INTO v_test_portal_id FROM user_portals LIMIT 1;
--   SELECT id INTO v_test_admin_id FROM auth.users WHERE role = 'admin' LIMIT 1;
--   
--   IF v_test_portal_id IS NOT NULL AND v_test_admin_id IS NOT NULL THEN
--     -- 插入测试日志
--     INSERT INTO portal_approval_logs (
--       portal_id, reviewer_id, action, reason
--     ) VALUES (
--       v_test_portal_id,
--       v_test_admin_id,
--       'approved',
--       '测试审批日志'
--     );
--   END IF;
-- END $$;

-- ============================================
-- 8. 性能优化索引
-- ============================================
-- 组合索引用于常用查询
CREATE INDEX IF NOT EXISTS idx_portal_approval_logs_portal_action 
ON portal_approval_logs(portal_id, action);

CREATE INDEX IF NOT EXISTS idx_portal_approval_logs_reviewer_action 
ON portal_approval_logs(reviewer_id, action);

CREATE INDEX IF NOT EXISTS idx_portal_approval_logs_date_action 
ON portal_approval_logs(created_at, action);

-- ============================================
-- 9. 清理过期数据函数（可选）
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_approval_logs(
  retention_days INTEGER DEFAULT 365
) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM portal_approval_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_approval_logs IS '清理过期的审批日志';

-- ============================================
-- 迁移完成
-- ============================================
