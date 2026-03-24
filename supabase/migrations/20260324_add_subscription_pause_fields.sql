-- 为 user_agent_installations 表添加订阅暂停相关字段
-- 支持订阅暂停/恢复功能

ALTER TABLE user_agent_installations
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS max_pause_count INTEGER DEFAULT 3, -- 最大暂停次数
ADD COLUMN IF NOT EXISTS current_pause_count INTEGER DEFAULT 0; -- 当前已暂停次数

-- 添加检查约束，确保暂停时间逻辑正确
ALTER TABLE user_agent_installations
ADD CONSTRAINT check_pause_dates CHECK (
  paused_at IS NULL OR
  resumed_at IS NULL OR
  paused_at <= resumed_at
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_agent_installations_paused_at
ON user_agent_installations(paused_at) WHERE paused_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_agent_installations_status_paused
ON user_agent_installations(status, paused_at)
WHERE status = 'active';

-- 添加注释
COMMENT ON COLUMN user_agent_installations.paused_at IS '订阅暂停时间';
COMMENT ON COLUMN user_agent_installations.resumed_at IS '订阅恢复时间';
COMMENT ON COLUMN user_agent_installations.pause_reason IS '暂停原因';
COMMENT ON COLUMN user_agent_installations.max_pause_count IS '最大允许暂停次数';
COMMENT ON COLUMN user_agent_installations.current_pause_count IS '当前已使用暂停次数';
