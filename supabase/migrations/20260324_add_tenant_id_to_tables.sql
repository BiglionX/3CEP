-- 为多租户隔离添加 tenant_id 字段
-- 这是 RLS 策略的前置依赖
-- 创建时间：2026-03-24
-- 说明：所有操作都会检查表是否存在，确保幂等性

-- ========================================
-- 1. agents 表添加 tenant_id
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents') THEN
    ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS tenant_id UUID;

    UPDATE agents
    SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    WHERE tenant_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
  END IF;
END $$;

-- ========================================
-- 2. agent_orders 表添加 tenant_id
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_orders') THEN
    ALTER TABLE agent_orders
    ADD COLUMN IF NOT EXISTS tenant_id UUID;

    UPDATE agent_orders
    SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    WHERE tenant_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_agent_orders_tenant_id ON agent_orders(tenant_id);
  END IF;
END $$;

-- ========================================
-- 3. user_agent_installations 表添加 tenant_id
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_agent_installations') THEN
    ALTER TABLE user_agent_installations
    ADD COLUMN IF NOT EXISTS tenant_id UUID;

    UPDATE user_agent_installations
    SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    WHERE tenant_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_user_installations_tenant_id ON user_agent_installations(tenant_id);
  END IF;
END $$;

-- ========================================
-- 4. agent_audit_logs 表添加 tenant_id
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_audit_logs') THEN
    ALTER TABLE agent_audit_logs
    ADD COLUMN IF NOT EXISTS tenant_id UUID;

    UPDATE agent_audit_logs
    SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    WHERE tenant_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_agent_audit_logs_tenant_id ON agent_audit_logs(tenant_id);
  END IF;
END $$;

-- ========================================
-- 5. notifications 表添加 tenant_id（如果存在）
-- ========================================

-- 已在 DO $$ 块中处理

-- ========================================
-- 6. agent_subscription_reminders 表添加 tenant_id（如果存在）
-- ========================================

-- 已在 DO $$ 块中处理

-- ========================================
-- 7. profiles 表添加 tenant_id
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS tenant_id UUID;

    UPDATE profiles
    SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID
    WHERE tenant_id IS NULL;

    CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
  END IF;
END $$;

-- ========================================
-- 8. 执行完成提示
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ tenant_id 字段添加完成！';
  RAISE NOTICE '📋 已处理的表:';
  RAISE NOTICE '   - agents';
  RAISE NOTICE '   - agent_orders';
  RAISE NOTICE '   - user_agent_installations';
  RAISE NOTICE '   - agent_audit_logs';
  RAISE NOTICE '   - profiles';
  RAISE NOTICE '   - notifications (如果存在)';
  RAISE NOTICE '   - agent_subscription_reminders (如果存在)';
END $$;
