--
-- OPT-009: 添加并发控制（乐观锁）
-- 为 agents 表添加 version 字段，支持乐观锁机制
--
-- 创建时间：2026-03-24
-- 优先级：P1
--

-- ========================================
-- 1. 为 agents 表添加 version 字段
-- ========================================

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0 NOT NULL;

-- 添加索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_agents_version ON agents(id, version);

-- 添加注释说明
COMMENT ON COLUMN agents.version IS '乐观锁版本号，每次更新自动递增，用于防止并发冲突';

-- ========================================
-- 2. 创建版本管理函数（可选，自动化版本递增）
-- ========================================

CREATE OR REPLACE FUNCTION increment_agent_version()
RETURNS TRIGGER AS $$
BEGIN
  -- 仅在数据实际发生变化时递增版本号
  IF OLD.* IS DISTINCT FROM NEW.* THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. 创建触发器（可选，自动递增版本）
-- ========================================

-- 注意：我们推荐在应用层手动控制版本递增，以便更好地处理并发冲突
-- 因此这里不创建自动触发器，而是由 API 代码显式管理版本

-- ========================================
-- 4. 初始化现有数据的版本号为 0
-- ========================================

UPDATE agents SET version = 0 WHERE version IS NULL;

-- ========================================
-- 5. 验证迁移结果
-- ========================================

DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'agents'
      AND column_name = 'version'
  ) INTO col_exists;

  IF NOT col_exists THEN
    RAISE EXCEPTION '❌ migration failed: version column not added';
  ELSE
    RAISE NOTICE '✅ migration successful: version column added to agents table';
  END IF;
END $$;
