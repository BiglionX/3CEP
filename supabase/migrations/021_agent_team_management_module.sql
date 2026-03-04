-- 智能体团队管理模块数据库迁移
-- Agent Team Management Module Database Migration

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 第一部分：核心表结构创建
-- ====================================================================

-- 1. 团队表
CREATE TABLE IF NOT EXISTS team_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES team_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer', 'executor')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, user_id)
);

-- 3. 智能体编排表
CREATE TABLE IF NOT EXISTS team_orchestrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES team_teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow JSONB NOT NULL, -- 编排工作流定义
  trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'event')),
  schedule_config JSONB, -- 定时配置
  event_triggers JSONB,  -- 事件触发器
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00
);

-- 4. 编排执行实例表
CREATE TABLE IF NOT EXISTS team_execution_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orchestration_id UUID NOT NULL REFERENCES team_orchestrations(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- 执行时长(秒)
  triggered_by UUID NOT NULL REFERENCES auth.users(id),
  inputs JSONB,
  outputs JSONB,
  logs JSONB,
  error JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 团队活动日志表
CREATE TABLE IF NOT EXISTS team_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES team_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 团队资源使用统计表
CREATE TABLE IF NOT EXISTS team_resource_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES team_teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cpu_percentage DECIMAL(5,2) DEFAULT 0.00,
  memory_mb INTEGER DEFAULT 0,
  storage_mb INTEGER DEFAULT 0,
  network_mb INTEGER DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, date)
);

-- ====================================================================
-- 第二部分：索引创建
-- ====================================================================

-- 团队表索引
CREATE INDEX IF NOT EXISTS idx_team_teams_owner_id ON team_teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_teams_status ON team_teams(status);
CREATE INDEX IF NOT EXISTS idx_team_teams_created_at ON team_teams(created_at);

-- 团队成员表索引
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- 编排表索引
CREATE INDEX IF NOT EXISTS idx_team_orchestrations_team_id ON team_orchestrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_orchestrations_status ON team_orchestrations(status);
CREATE INDEX IF NOT EXISTS idx_team_orchestrations_trigger_type ON team_orchestrations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_team_orchestrations_created_by ON team_orchestrations(created_by);

-- 执行实例表索引
CREATE INDEX IF NOT EXISTS idx_team_execution_instances_orchestration_id ON team_execution_instances(orchestration_id);
CREATE INDEX IF NOT EXISTS idx_team_execution_instances_status ON team_execution_instances(status);
CREATE INDEX IF NOT EXISTS idx_team_execution_instances_triggered_by ON team_execution_instances(triggered_by);
CREATE INDEX IF NOT EXISTS idx_team_execution_instances_started_at ON team_execution_instances(started_at);

-- 活动日志表索引
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_team_id ON team_activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_user_id ON team_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_activity_type ON team_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_created_at ON team_activity_logs(created_at);

-- 资源使用表索引
CREATE INDEX IF NOT EXISTS idx_team_resource_usage_team_id ON team_resource_usage(team_id);
CREATE INDEX IF NOT EXISTS idx_team_resource_usage_date ON team_resource_usage(date);

-- ====================================================================
-- 第三部分：RLS安全策略
-- ====================================================================

-- 为所有表启用RLS
ALTER TABLE team_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_orchestrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_execution_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_resource_usage ENABLE ROW LEVEL SECURITY;

-- 团队表策略
CREATE POLICY "用户只能查看自己拥有的团队"
  ON team_teams FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "用户只能创建自己的团队"
  ON team_teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "用户只能更新自己拥有的团队"
  ON team_teams FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "用户只能删除自己拥有的团队"
  ON team_teams FOR DELETE
  USING (owner_id = auth.uid());

-- 团队成员表策略
CREATE POLICY "团队成员可以查看团队成员信息"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_members.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "团队管理员可以添加成员"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_members.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.role = 'admin'
    )
  );

CREATE POLICY "团队管理员可以更新成员权限"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_members.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.role = 'admin'
      AND tm2.user_id != team_members.user_id -- 不能修改自己的权限
    )
  );

CREATE POLICY "团队管理员或本人可以移除成员"
  ON team_members FOR DELETE
  USING (
    user_id = auth.uid() OR -- 可以退出团队
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_members.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.role = 'admin'
      AND tm2.user_id != team_members.user_id -- 不能移除自己
    )
  );

-- 编排表策略
CREATE POLICY "团队成员可以查看编排"
  ON team_orchestrations FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_orchestrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.permissions->'orchestrations'->>'view' = 'true'
    )
  );

CREATE POLICY "有权限的成员可以创建编排"
  ON team_orchestrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_orchestrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.permissions->'orchestrations'->>'create' = 'true'
    )
  );

CREATE POLICY "编排创建者或有权限的成员可以更新编排"
  ON team_orchestrations FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_orchestrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.permissions->'orchestrations'->>'edit' = 'true'
    )
  );

CREATE POLICY "编排创建者或有权限的成员可以删除编排"
  ON team_orchestrations FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_orchestrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.permissions->'orchestrations'->>'delete' = 'true'
    )
  );

-- 执行实例表策略
CREATE POLICY "团队成员可以查看执行实例"
  ON team_execution_instances FOR SELECT
  USING (
    triggered_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_orchestrations tor
      JOIN team_members tm ON tm.team_id = tor.team_id
      WHERE tor.id = team_execution_instances.orchestration_id
      AND tm.user_id = auth.uid()
      AND tm.permissions->'orchestrations'->>'view' = 'true'
    )
  );

CREATE POLICY "有执行权限的成员可以创建执行实例"
  ON team_execution_instances FOR INSERT
  WITH CHECK (
    triggered_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM team_orchestrations tor
      JOIN team_members tm ON tm.team_id = tor.team_id
      WHERE tor.id = team_execution_instances.orchestration_id
      AND tm.user_id = auth.uid()
      AND tm.permissions->'orchestrations'->>'execute' = 'true'
    )
  );

-- 活动日志表策略
CREATE POLICY "团队成员可以查看活动日志"
  ON team_activity_logs FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_activity_logs.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_activity_logs.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "用户可以创建自己的活动日志"
  ON team_activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 资源使用表策略
CREATE POLICY "团队成员可以查看资源使用情况"
  ON team_resource_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_teams
      WHERE team_teams.id = team_resource_usage.team_id
      AND team_teams.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_resource_usage.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- ====================================================================
-- 第四部分：触发器函数
-- ====================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新时间戳触发器
CREATE TRIGGER update_team_teams_updated_at
    BEFORE UPDATE ON team_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_resource_usage_updated_at
    BEFORE UPDATE ON team_resource_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新成员最后活跃时间触发器
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE team_members
    SET last_active_at = NOW()
    WHERE user_id = NEW.triggered_by
    AND team_id = (
        SELECT team_id FROM team_orchestrations
        WHERE id = NEW.orchestration_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_activity_on_execution
    AFTER INSERT ON team_execution_instances
    FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

-- 计算编排成功率触发器
CREATE OR REPLACE FUNCTION calculate_orchestration_success_rate()
RETURNS TRIGGER AS $$
DECLARE
    total_count INTEGER;
    success_count INTEGER;
    rate DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM team_execution_instances
    WHERE orchestration_id = NEW.orchestration_id;

    SELECT COUNT(*) INTO success_count
    FROM team_execution_instances
    WHERE orchestration_id = NEW.orchestration_id
    AND status = 'completed';

    IF total_count > 0 THEN
        rate := (success_count::DECIMAL / total_count::DECIMAL) * 100;
    ELSE
        rate := 100.00;
    END IF;

    UPDATE team_orchestrations
    SET success_rate = rate
    WHERE id = NEW.orchestration_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_success_rate_on_execution
    AFTER INSERT OR UPDATE ON team_execution_instances
    FOR EACH ROW EXECUTE FUNCTION calculate_orchestration_success_rate();

-- 记录活动日志触发器
CREATE OR REPLACE FUNCTION log_team_activity()
RETURNS TRIGGER AS $$
DECLARE
    activity_desc TEXT;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN
            activity_desc := '创建了新的' || TG_TABLE_NAME;
        WHEN 'UPDATE' THEN
            activity_desc := '更新了' || TG_TABLE_NAME;
        WHEN 'DELETE' THEN
            activity_desc := '删除了' || TG_TABLE_NAME;
    END CASE;

    INSERT INTO team_activity_logs (team_id, user_id, activity_type, description)
    VALUES (
        COALESCE(NEW.team_id, OLD.team_id),
        auth.uid(),
        TG_TABLE_NAME || '.' || LOWER(TG_OP),
        activity_desc
    );

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为关键表创建活动日志触发器
CREATE TRIGGER log_team_creation
    AFTER INSERT ON team_teams
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();

CREATE TRIGGER log_orchestration_creation
    AFTER INSERT ON team_orchestrations
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();

-- ====================================================================
-- 第五部分：初始数据和注释
-- ====================================================================

-- 添加表注释
COMMENT ON TABLE team_teams IS '智能体团队信息表';
COMMENT ON TABLE team_members IS '团队成员关系表';
COMMENT ON TABLE team_orchestrations IS '智能体编排定义表';
COMMENT ON TABLE team_execution_instances IS '编排执行实例表';
COMMENT ON TABLE team_activity_logs IS '团队活动日志表';
COMMENT ON TABLE team_resource_usage IS '团队资源使用统计表';

-- 添加列注释
COMMENT ON COLUMN team_teams.settings IS '团队配置设置，包含通知、安全、协作等配置';
COMMENT ON COLUMN team_members.permissions IS '成员权限设置，JSON格式存储细粒度权限';
COMMENT ON COLUMN team_orchestrations.workflow IS '编排工作流定义，包含节点、连接、变量等信息';
COMMENT ON COLUMN team_execution_instances.logs IS '执行过程中的详细日志信息';
COMMENT ON COLUMN team_resource_usage.cpu_percentage IS 'CPU使用百分比';

-- 验证表创建
DO $$
BEGIN
    RAISE NOTICE '智能体团队管理模块数据库迁移完成';
    RAISE NOTICE '创建的表: team_teams, team_members, team_orchestrations, team_execution_instances, team_activity_logs, team_resource_usage';
END $$;
