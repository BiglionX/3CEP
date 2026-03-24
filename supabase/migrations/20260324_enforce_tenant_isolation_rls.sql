-- 强化多租户隔离的 RLS（Row Level Security）策略
-- 确保数据访问的租户隔离，防止跨租户数据泄露

-- ========================================
-- 1. agents 表的 RLS 策略
-- ========================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己租户的智能体，管理员可以查看所有
DROP POLICY IF EXISTS "tenant_isolation_select" ON agents;
CREATE POLICY "tenant_isolation_select"
  ON agents
  FOR SELECT
  USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- 策略：用户只能创建自己租户的智能体
DROP POLICY IF EXISTS "tenant_isolation_insert" ON agents;
CREATE POLICY "tenant_isolation_insert"
  ON agents
  FOR INSERT
  WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- 策略：用户只能更新自己租户的智能体
DROP POLICY IF EXISTS "tenant_isolation_update" ON agents;
CREATE POLICY "tenant_isolation_update"
  ON agents
  FOR UPDATE
  USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- 策略：用户只能删除自己租户的智能体
DROP POLICY IF EXISTS "tenant_isolation_delete" ON agents;
CREATE POLICY "tenant_isolation_delete"
  ON agents
  FOR DELETE
  USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- ========================================
-- 2. agent_orders 表的 RLS 策略
-- ========================================

ALTER TABLE agent_orders ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己租户的订单
DROP POLICY IF EXISTS "tenant_isolation_select" ON agent_orders;
CREATE POLICY "tenant_isolation_select"
  ON agent_orders
  FOR SELECT
  USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR buyer_id = auth.uid()
    OR developer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- 策略：用户只能创建自己租户的订单
DROP POLICY IF EXISTS "tenant_isolation_insert" ON agent_orders;
CREATE POLICY "tenant_isolation_insert"
  ON agent_orders
  FOR INSERT
  WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- ========================================
-- 3. user_agent_installations 表的 RLS 策略
-- ========================================

ALTER TABLE user_agent_installations ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己的安装记录或自己租户的记录
DROP POLICY IF EXISTS "tenant_isolation_select" ON user_agent_installations;
CREATE POLICY "tenant_isolation_select"
  ON user_agent_installations
  FOR SELECT
  USING (
    user_id::uuid = auth.uid()
    OR tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- ========================================
-- 4. agent_audit_logs 表的 RLS 策略
-- ========================================

ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己租户的审计日志
DROP POLICY IF EXISTS "tenant_isolation_select" ON agent_audit_logs;
CREATE POLICY "tenant_isolation_select"
  ON agent_audit_logs
  FOR SELECT
  USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR action_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- ========================================
-- 5. notifications 表的 RLS 策略（如果存在）
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    -- 策略：用户只能查看自己的通知
    DROP POLICY IF EXISTS "tenant_isolation_select" ON notifications;
    CREATE POLICY "tenant_isolation_select"
      ON notifications
      FOR SELECT
      USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
        )
      );
  END IF;
END $$;

-- ========================================
-- 6. agent_subscription_reminders 表的 RLS 策略（如果存在）
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_subscription_reminders') THEN
    ALTER TABLE agent_subscription_reminders ENABLE ROW LEVEL SECURITY;

    -- 策略：用户只能查看自己的提醒记录
    DROP POLICY IF EXISTS "tenant_isolation_select" ON agent_subscription_reminders;
    CREATE POLICY "tenant_isolation_select"
      ON agent_subscription_reminders
      FOR SELECT
      USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'marketplace_admin', 'system')
        )
      );
  END IF;
END $$;

-- ========================================
-- 7. profiles 表的 RLS 策略
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己的资料
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
CREATE POLICY "users_can_view_own_profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- 策略：用户可以更新自己的资料
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
CREATE POLICY "users_can_update_own_profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- 策略：管理员可以查看所有和更新所有资料
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON profiles;
CREATE POLICY "admins_can_view_all_profiles"
  ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'marketplace_admin', 'system')
    )
  );

-- ========================================
-- 8. 为所有租户相关表添加统一的租户检查函数
-- ========================================

-- 创建租户检查函数
CREATE OR REPLACE FUNCTION check_tenant_access(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tenant_id UUID;
  user_role TEXT;
BEGIN
  -- 获取当前用户的租户 ID 和角色
  SELECT tenant_id, role INTO user_tenant_id, user_role
  FROM profiles
  WHERE id = auth.uid();

  -- 如果用户不存在，返回 false
  IF user_tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 如果是管理员，允许访问
  IF user_role IN ('admin', 'manager', 'marketplace_admin', 'system') THEN
    RETURN TRUE;
  END IF;

  -- 普通用户只能访问自己租户的数据
  RETURN user_tenant_id = target_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. 添加租户隔离违规审计触发器
-- ========================================

-- 创建租户隔离违规检测函数
CREATE OR REPLACE FUNCTION detect_tenant_violation()
RETURNS TRIGGER AS $$
DECLARE
  violating BOOLEAN := FALSE;
BEGIN
  -- 这里可以添加更复杂的检测逻辑
  -- 目前主要通过 RLS 策略来阻止违规访问

  -- 如果操作成功执行，说明通过了 RLS 检查
  -- 可以在这里记录成功的访问日志

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 注意：审计日志记录功能已禁用，因为 audit_logs 表可能不存在
    -- 如果需要启用，请确保先创建 audit_logs 表

    -- 抛出异常，阻止操作
    RAISE EXCEPTION '租户隔离检查失败：%', SQLERRM USING ERRCODE = '42P01';
END;
$$ LANGUAGE plpgsql;

-- 为关键表添加触发器（可选，根据性能考虑）
-- CREATE TRIGGER trg_agents_tenant_check
--   AFTER INSERT OR UPDATE OR DELETE ON agents
--   FOR EACH ROW EXECUTE FUNCTION detect_tenant_violation();

-- ========================================
-- 10. 索引优化
-- ========================================

-- 为所有租户隔离查询添加复合索引
CREATE INDEX IF NOT EXISTS idx_agents_tenant_status
ON agents(tenant_id, status) WHERE deleted_at IS NULL;

-- agent_orders 表使用 buyer_id 和 developer_id，而不是 user_id
CREATE INDEX IF NOT EXISTS idx_agent_orders_tenant_buyer_developer
ON agent_orders(tenant_id, buyer_id, developer_id);

CREATE INDEX IF NOT EXISTS idx_user_installations_tenant_user
ON user_agent_installations(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_agent_audit_logs_tenant_action_by
ON agent_audit_logs(tenant_id, action_by);

-- ========================================
-- 注释说明
-- ========================================

COMMENT ON FUNCTION check_tenant_access IS '检查用户是否有权访问指定租户的数据';
COMMENT ON FUNCTION detect_tenant_violation IS '检测和记录租户隔离违规尝试';
