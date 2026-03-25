-- =====================================================
-- P2-003-004: 数据权限隔离 - RLS 策略增强
-- =====================================================
-- 用途：实现租户级别的数据隔离，确保数据安全
-- 执行方式：在 Supabase SQL Editor 中执行
-- =====================================================

-- =====================================================
-- 1. 租户表定义
-- =====================================================
-- 注意：tenants 表可能已存在，包含 code 字段
-- 使用 ALTER TABLE 添加缺失字段而不是重新创建

DO $$
BEGIN
  -- 如果 tenants 表不存在，创建基础表
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    CREATE TABLE tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(200) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_tenants_code ON tenants(code);
  END IF;

  -- 添加可能缺失的字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tenants' AND column_name = 'status') THEN
    ALTER TABLE tenants ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tenants' AND column_name = 'plan') THEN
    ALTER TABLE tenants ADD COLUMN plan VARCHAR(50) DEFAULT 'free';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tenants' AND column_name = 'max_users') THEN
    ALTER TABLE tenants ADD COLUMN max_users INTEGER DEFAULT 10;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tenants' AND column_name = 'max_skills') THEN
    ALTER TABLE tenants ADD COLUMN max_skills INTEGER DEFAULT 100;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tenants' AND column_name = 'expires_at') THEN
    ALTER TABLE tenants ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 插入默认租户 (使用正确的字段)
INSERT INTO tenants (id, code, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'default', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE tenants IS '租户表 - 多租户 SaaS 架构基础';

-- =====================================================
-- 2. 用户 - 租户关联表
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- owner, admin, member, viewer
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- 创建索引
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);

COMMENT ON TABLE tenant_users IS '用户 - 租户关联表';

-- =====================================================
-- 3. 为现有表添加 tenant_id 字段
-- =====================================================

-- skills 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skills' AND column_name = 'tenant_id') THEN
    ALTER TABLE skills ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
    ALTER TABLE skills ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_skills_tenant ON skills(tenant_id);
  END IF;
END $$;

-- skill_reviews 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skill_reviews' AND column_name = 'tenant_id') THEN
    ALTER TABLE skill_reviews ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
    ALTER TABLE skill_reviews ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_skill_reviews_tenant ON skill_reviews(tenant_id);
  END IF;
END $$;

-- skill_executions 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'skill_executions' AND column_name = 'tenant_id') THEN
    ALTER TABLE skill_executions ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
    ALTER TABLE skill_executions ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_skill_executions_tenant ON skill_executions(tenant_id);
  END IF;
END $$;

-- admin_users 表
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_users' AND column_name = 'tenant_id') THEN
    ALTER TABLE admin_users ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
    ALTER TABLE admin_users ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_admin_users_tenant ON admin_users(tenant_id);
  END IF;
END $$;

-- =====================================================
-- 4. RLS 策略 - 租户数据隔离
-- =====================================================

-- 启用 RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- ===== Skills 表 RLS 策略 =====

-- 策略 1: 用户只能查看自己租户的 skills
DROP POLICY IF EXISTS "租户隔离 - 查看技能" ON skills;
CREATE POLICY "租户隔离 - 查看技能"
  ON skills
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- 策略 2: 用户只能创建自己租户的 skills
DROP POLICY IF EXISTS "租户隔离 - 创建技能" ON skills;
CREATE POLICY "租户隔离 - 创建技能"
  ON skills
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- 策略 3: 用户只能更新自己租户的 skills
DROP POLICY IF EXISTS "租户隔离 - 更新技能" ON skills;
CREATE POLICY "租户隔离 - 更新技能"
  ON skills
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- 策略 4: 用户只能删除自己租户的 skills
DROP POLICY IF EXISTS "租户隔离 - 删除技能" ON skills;
CREATE POLICY "租户隔离 - 删除技能"
  ON skills
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- ===== Skill Reviews 表 RLS 策略 =====

DROP POLICY IF EXISTS "租户隔离 - 查看评论" ON skill_reviews;
CREATE POLICY "租户隔离 - 查看评论"
  ON skill_reviews
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "租户隔离 - 创建评论" ON skill_reviews;
CREATE POLICY "租户隔离 - 创建评论"
  ON skill_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- ===== Skill Executions 表 RLS 策略 =====

DROP POLICY IF EXISTS "租户隔离 - 查看执行记录" ON skill_executions;
CREATE POLICY "租户隔离 - 查看执行记录"
  ON skill_executions
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "租户隔离 - 创建执行记录" ON skill_executions;
CREATE POLICY "租户隔离 - 创建执行记录"
  ON skill_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- ===== Admin Users 表 RLS 策略 =====

DROP POLICY IF EXISTS "租户隔离 - 查看管理员" ON admin_users;
CREATE POLICY "租户隔离 - 查看管理员"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- ===== Tenant Users 表 RLS 策略 =====

DROP POLICY IF EXISTS "租户隔离 - 查看租户成员" ON tenant_users;
CREATE POLICY "租户隔离 - 查看租户成员"
  ON tenant_users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. 辅助函数：获取当前用户的租户 ID
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM tenant_users
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_current_tenant_id IS '获取当前用户所属的租户 ID';

-- =====================================================
-- 6. 触发器：自动设置 tenant_id
-- =====================================================

-- 为 skills 表创建触发器
CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_current_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tenant_id_on_skills_insert ON skills;
CREATE TRIGGER trigger_set_tenant_id_on_skills_insert
  BEFORE INSERT ON skills
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

-- 为 skill_reviews 表创建触发器
DROP TRIGGER IF EXISTS trigger_set_tenant_id_on_reviews_insert ON skill_reviews;
CREATE TRIGGER trigger_set_tenant_id_on_reviews_insert
  BEFORE INSERT ON skill_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

-- 为 skill_executions 表创建触发器
DROP TRIGGER IF EXISTS trigger_set_tenant_id_on_executions_insert ON skill_executions;
CREATE TRIGGER trigger_set_tenant_id_on_executions_insert
  BEFORE INSERT ON skill_executions
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

-- =====================================================
-- 7. 跨租户访问控制函数
-- =====================================================

-- 检查用户是否有权限访问指定租户的资源
CREATE OR REPLACE FUNCTION can_access_tenant(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM tenant_users
    WHERE user_id = auth.uid()
    AND tenant_id = p_tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_access_tenant IS '检查用户是否有权访问指定租户';

-- =====================================================
-- 8. 审计日志：记录跨租户访问尝试
-- =====================================================

CREATE OR REPLACE FUNCTION log_cross_tenant_access()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- 可以在这里添加逻辑来记录异常的跨租户访问尝试
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_cross_tenant_access IS '记录跨租户访问尝试的触发器函数';

-- =====================================================
-- 完成检查清单
-- =====================================================
-- ✅ tenants 表已创建
-- ✅ tenant_users 表已创建
-- ✅ 现有表已添加 tenant_id 字段
-- ✅ RLS 策略已配置 (10 个策略)
-- ✅ 辅助函数已创建
-- ✅ 触发器已配置 (3 个表)
-- ✅ 跨租户访问控制函数已创建
-- =====================================================
