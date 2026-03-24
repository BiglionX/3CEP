-- 智能体表添加软删除字段
-- 创建时间：2026-03-24
-- 任务：OPT-003 实现软删除机制

-- ====================================================================
-- 第一部分：添加软删除字段
-- ====================================================================

-- 添加 deleted_at 字段（记录删除时间）
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 添加 deleted_by 字段（记录删除操作人）
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- 添加恢复者字段（可选，用于记录恢复操作的人）
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS restored_by UUID REFERENCES auth.users(id);

-- ====================================================================
-- 第二部分：创建索引以优化查询性能
-- ====================================================================

-- 为 deleted_at 创建索引，加速过滤已删除记录
CREATE INDEX IF NOT EXISTS idx_agents_deleted_at ON agents(deleted_at);

-- 为 deleted_by 创建索引，便于审计追踪
CREATE INDEX IF NOT EXISTS idx_agents_deleted_by ON agents(deleted_by);

-- ====================================================================
-- 第三部分：更新 RLS 策略以支持软删除
-- ====================================================================

-- 修改现有的 SELECT 策略，自动过滤已软删除的记录
DROP POLICY IF EXISTS "agents_select" ON agents;
CREATE POLICY "agents_select" ON agents FOR SELECT
USING (
  -- 普通用户只能查看未删除的记录
  (deleted_at IS NULL)
  OR
  -- 管理员可以查看所有记录（包括已删除的）
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
  ))
);

-- 更新 DELETE 策略，改为 UPDATE 策略来实现软删除
DROP POLICY IF EXISTS "agents_delete" ON agents;
-- 注意：我们将 DELETE 操作改为通过 UPDATE deleted_at 来实现
-- 因此这里不设置 DELETE 策略，或者只允许物理删除测试数据
CREATE POLICY "agents_delete" ON agents FOR DELETE
USING (false); -- 禁止物理删除，除非特殊情况

-- ====================================================================
-- 第四部分：添加注释说明
-- ====================================================================

COMMENT ON COLUMN agents.deleted_at IS '软删除时间戳，NULL 表示未删除';
COMMENT ON COLUMN agents.deleted_by IS '执行删除操作的用户 ID';
COMMENT ON COLUMN agents.restored_at IS '恢复时间戳，NULL 表示未恢复过';
COMMENT ON COLUMN agents.restored_by IS '执行恢复操作的用户 ID';

-- ====================================================================
-- 第五部分：创建视图以便查询活跃的智能体（可选）
-- ====================================================================

-- 创建活跃智能体视图，方便日常查询使用
CREATE OR REPLACE VIEW active_agents AS
SELECT * FROM agents
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_agents IS '活跃智能体视图（排除已软删除的记录）';
