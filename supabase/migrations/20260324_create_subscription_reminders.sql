-- 创建订阅提醒记录表
-- 用于跟踪发送给用户的订阅到期提醒

CREATE TABLE IF NOT EXISTS agent_subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES user_agent_installations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('email', 'sms', 'in_app')),
  days_before_expiry INTEGER NOT NULL CHECK (days_before_expiry > 0),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 索引优化查询性能
  CONSTRAINT unique_reminder_per_installation UNIQUE (installation_id, reminder_type, days_before_expiry)
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_reminders_installation_id ON agent_subscription_reminders(installation_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON agent_subscription_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON agent_subscription_reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_at ON agent_subscription_reminders(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_composite ON agent_subscription_reminders(installation_id, reminder_type, days_before_expiry, status);

-- 添加注释
COMMENT ON TABLE agent_subscription_reminders IS '智能体订阅到期提醒记录表';
COMMENT ON COLUMN agent_subscription_reminders.installation_id IS '订阅安装 ID';
COMMENT ON COLUMN agent_subscription_reminders.user_id IS '用户 ID';
COMMENT ON COLUMN agent_subscription_reminders.reminder_type IS '提醒方式：email/sms/in_app';
COMMENT ON COLUMN agent_subscription_reminders.days_before_expiry IS '提前多少天提醒';
COMMENT ON COLUMN agent_subscription_reminders.sent_at IS '发送时间';
COMMENT ON COLUMN agent_subscription_reminders.status IS '发送状态：pending/sent/failed';
COMMENT ON COLUMN agent_subscription_reminders.metadata IS '附加元数据（错误信息、模板等）';

-- 设置 RLS（Row Level Security）策略
ALTER TABLE agent_subscription_reminders ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的提醒记录（如果不存在则创建）
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'agent_subscription_reminders'
    AND policyname = 'users_can_view_own_reminders'
  ) THEN
    CREATE POLICY "users_can_view_own_reminders"
      ON agent_subscription_reminders
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 系统可以插入提醒记录（通过 service role key）
-- 管理员可以查看所有提醒记录（如果不存在则创建）
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'agent_subscription_reminders'
    AND policyname = 'admins_can_view_all_reminders'
  ) THEN
    CREATE POLICY "admins_can_view_all_reminders"
      ON agent_subscription_reminders
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'system')
        )
      );
  END IF;
END $$;
