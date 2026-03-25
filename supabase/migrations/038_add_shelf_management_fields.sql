-- ====================================================================
-- 添加 Skill 上下架管理字段
-- ====================================================================
-- 说明：添加下架原因记录字段
-- 执行顺序：在 037_add_skill_executions_log.sql 之后执行
-- ====================================================================

-- 1. 添加下架原因字段
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS shelf_rejection_reason TEXT;

-- 2. 添加上架/下架时间字段
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS last_shelf_time TIMESTAMP WITH TIME ZONE;

-- 3. 添加注释
COMMENT ON COLUMN skills.shelf_rejection_reason IS '下架原因';
COMMENT ON COLUMN skills.last_shelf_time IS '最近上架时间';

-- 4. 为下架原因字段创建索引 (用于查询)
CREATE INDEX IF NOT EXISTS idx_skills_shelf_rejection_reason ON skills(shelf_rejection_reason)
WHERE shelf_rejection_reason IS NOT NULL;

-- 5. 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skills'
AND column_name IN ('shelf_rejection_reason', 'last_shelf_time')
ORDER BY ordinal_position;
