-- =====================================================
-- OPT-018 补充：为 agent_status_history 表添加 UUID 生成触发器
-- =====================================================

-- 创建扩展（如果不存在）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建触发器函数自动生成 UUID
CREATE OR REPLACE FUNCTION generate_agent_status_history_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER set_agent_status_history_id
BEFORE INSERT ON agent_status_history
FOR EACH ROW
EXECUTE FUNCTION generate_agent_status_history_id();

COMMENT ON FUNCTION generate_agent_status_history_id IS '为 agent_status_history 表自动生成 UUID 主键';
