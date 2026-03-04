-- 数据中心统一权限管理数据库迁移脚本
-- DC007 权限统一任务数据库结构更新

-- 创建角色表（支持继承）
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 50,
  is_system BOOLEAN NOT NULL DEFAULT false,
  inherits JSONB, -- 继承的角色列表
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

-- 创建角色权限映射表
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by VARCHAR(50),
  PRIMARY KEY (role_id, permission_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_role_perms_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_perms_perm ON role_permissions(permission_id);

-- 创建用户角色表
CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(50) NOT NULL,
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, role_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- 创建权限审计日志表
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  permission_id VARCHAR(100),
  action VARCHAR(20) NOT NULL, -- CHECK, GRANT, REVOKE, CONFIG_CHANGE
  resource VARCHAR(100),
  result BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_user ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_permission ON permission_audit_log(permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON permission_audit_log(created_at);

-- 创建数据访问权限表
CREATE TABLE IF NOT EXISTS data_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
  data_source VARCHAR(100) NOT NULL, -- 数据源标识
  table_name VARCHAR(100) NOT NULL,   -- 表名
  column_name VARCHAR(100),           -- 列名（可为空表示整表）
  access_type VARCHAR(20) NOT NULL,   -- READ, WRITE, EXECUTE
  row_filter JSONB,                   -- 行级过滤条件
  column_mask JSONB,                  -- 列级脱敏规则
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_data_access_role ON data_access_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_data_access_source ON data_access_permissions(data_source);

-- 插入默认角色
INSERT INTO roles (id, name, description, level, is_system) VALUES
  ('admin', '超级管理员', '系统最高权限角色，拥有所有功能访问权限', 100, true),
  ('data_center_admin', '数据中心管理员', '负责数据中心模块的管理和维护', 90, true),
  ('data_analyst', '数据分析师', '负责数据分析和报表生成', 70, true),
  ('data_viewer', '数据查看员', '仅能查看基础数据和报表', 50, true),
  ('data_engineer', '数据工程师', '负责数据接入和ETL流程管理', 80, true)
ON CONFLICT (id) DO NOTHING;

-- 插入数据中心相关权限
INSERT INTO permissions (id, name, description, category, resource, action, is_sensitive) VALUES
  ('data_center_read', '数据中心查看', '查看数据中心仪表板和基础数据', 'data_center', 'data_center', 'read', false),
  ('data_center_query', '数据中心查询', '执行数据查询操作', 'data_center', 'data_center', 'query', false),
  ('data_center_analyze', '数据分析', '执行数据分析和统计计算', 'data_center', 'data_center', 'analyze', false),
  ('data_center_manage', '数据中心管理', '管理数据中心配置和设置', 'data_center', 'data_center', 'manage', true),
  ('data_center_export', '数据导出', '导出数据中心数据', 'data_center', 'data_center', 'export', true),
  ('data_sources_manage', '数据源管理', '管理数据源连接和配置', 'data_center', 'data_sources', 'manage', true),
  ('etl_jobs_manage', 'ETL作业管理', '管理数据抽取转换加载作业', 'data_center', 'etl_jobs', 'manage', true),
  ('data_quality_manage', '数据质量管理', '管理数据质量规则和监控', 'data_center', 'data_quality', 'manage', true),
  ('reports_manage', '报表管理', '创建和管理数据分析报表', 'reports', 'reports', 'manage', false),
  ('reports_schedule', '报表调度', '设置报表自动生成和发送', 'reports', 'reports', 'schedule', false)
ON CONFLICT (id) DO NOTHING;

-- 为角色分配权限
INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES
  -- 超级管理员拥有所有权限
  ('admin', 'data_center_read', 'system'),
  ('admin', 'data_center_query', 'system'),
  ('admin', 'data_center_analyze', 'system'),
  ('admin', 'data_center_manage', 'system'),
  ('admin', 'data_center_export', 'system'),
  ('admin', 'data_sources_manage', 'system'),
  ('admin', 'etl_jobs_manage', 'system'),
  ('admin', 'data_quality_manage', 'system'),
  ('admin', 'reports_manage', 'system'),
  ('admin', 'reports_schedule', 'system'),
  
  -- 数据中心管理员
  ('data_center_admin', 'data_center_read', 'system'),
  ('data_center_admin', 'data_center_query', 'system'),
  ('data_center_admin', 'data_center_analyze', 'system'),
  ('data_center_admin', 'data_center_manage', 'system'),
  ('data_center_admin', 'data_center_export', 'system'),
  ('data_center_admin', 'data_sources_manage', 'system'),
  ('data_center_admin', 'etl_jobs_manage', 'system'),
  ('data_center_admin', 'data_quality_manage', 'system'),
  ('data_center_admin', 'reports_manage', 'system'),
  ('data_center_admin', 'reports_schedule', 'system'),
  
  -- 数据分析师
  ('data_analyst', 'data_center_read', 'system'),
  ('data_analyst', 'data_center_query', 'system'),
  ('data_analyst', 'data_center_analyze', 'system'),
  ('data_analyst', 'data_center_export', 'system'),
  ('data_analyst', 'reports_manage', 'system'),
  ('data_analyst', 'reports_schedule', 'system'),
  
  -- 数据查看员
  ('data_viewer', 'data_center_read', 'system'),
  ('data_viewer', 'reports_manage', 'system'),
  
  -- 数据工程师
  ('data_engineer', 'data_center_read', 'system'),
  ('data_engineer', 'data_center_query', 'system'),
  ('data_engineer', 'data_sources_manage', 'system'),
  ('data_engineer', 'etl_jobs_manage', 'system'),
  ('data_engineer', 'data_quality_manage', 'system')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 创建角色继承关系
UPDATE roles SET inherits = '[]'::jsonb WHERE id = 'admin';
UPDATE roles SET inherits = '["data_analyst"]'::jsonb WHERE id = 'data_center_admin';
UPDATE roles SET inherits = '["data_viewer"]'::jsonb WHERE id = 'data_analyst';
UPDATE roles SET inherits = '[]'::jsonb WHERE id = 'data_viewer';
UPDATE roles SET inherits = '["data_analyst"]'::jsonb WHERE id = 'data_engineer';

-- 创建触发器函数更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建更新时间戳触发器
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_access_permissions_updated_at 
    BEFORE UPDATE ON data_access_permissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建权限检查函数
CREATE OR REPLACE FUNCTION check_user_permission(user_id_param VARCHAR, permission_param VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    effective_roles TEXT[];
    role_record RECORD;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- 如果是超级管理员，直接返回true
    IF EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
               WHERE ur.user_id = user_id_param AND r.id = 'admin' AND ur.is_active = true) THEN
        RETURN TRUE;
    END IF;
    
    -- 获取用户的所有有效角色（包括继承角色）
    SELECT ARRAY_AGG(DISTINCT role_id) INTO effective_roles
    FROM (
        WITH RECURSIVE role_hierarchy AS (
            -- 基础角色
            SELECT ur.role_id, 1 as level
            FROM user_roles ur
            WHERE ur.user_id = user_id_param AND ur.is_active = true
              AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            
            UNION ALL
            
            -- 继承角色
            SELECT r.inherits->>i, rh.level + 1
            FROM role_hierarchy rh
            JOIN roles r ON rh.role_id = r.id,
            generate_series(0, jsonb_array_length(r.inherits) - 1) AS i
            WHERE r.inherits IS NOT NULL
        )
        SELECT DISTINCT role_id FROM role_hierarchy
    ) AS user_roles_combined;
    
    -- 检查权限
    SELECT EXISTS (
        SELECT 1 
        FROM role_permissions rp
        WHERE rp.role_id = ANY(effective_roles) 
          AND rp.permission_id = permission_param
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- 创建数据访问检查函数
CREATE OR REPLACE FUNCTION check_data_access(
    user_id_param VARCHAR,
    data_source_param VARCHAR,
    table_name_param VARCHAR,
    access_type_param VARCHAR DEFAULT 'READ'
)
RETURNS TABLE(
    allowed BOOLEAN,
    filters JSONB,
    masking JSONB
) AS $$
DECLARE
    effective_roles TEXT[];
    access_rules JSONB[];
BEGIN
    -- 获取用户有效角色
    SELECT ARRAY_AGG(DISTINCT role_id) INTO effective_roles
    FROM (
        WITH RECURSIVE role_hierarchy AS (
            SELECT ur.role_id, 1 as level
            FROM user_roles ur
            WHERE ur.user_id = user_id_param AND ur.is_active = true
              AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            
            UNION ALL
            
            SELECT jsonb_array_elements_text(r.inherits), rh.level + 1
            FROM role_hierarchy rh
            JOIN roles r ON rh.role_id = r.id
            WHERE r.inherits IS NOT NULL
        )
        SELECT DISTINCT role_id FROM role_hierarchy
    ) AS user_roles_combined;
    
    -- 查询数据访问规则
    SELECT COALESCE(json_agg(
        json_build_object(
            'filters', dap.row_filter,
            'masking', CASE 
                WHEN dap.column_mask IS NOT NULL AND dap.column_name IS NOT NULL 
                THEN json_build_object(dap.column_name, dap.column_mask)
                ELSE '{}'::jsonb
            END
        )
    ), '[]'::jsonb) INTO access_rules
    FROM data_access_permissions dap
    WHERE dap.role_id = ANY(effective_roles)
      AND dap.data_source = data_source_param
      AND dap.table_name = table_name_param
      AND dap.access_type = access_type_param;
    
    -- 返回结果
    IF jsonb_array_length(access_rules) > 0 THEN
        RETURN QUERY SELECT 
            TRUE as allowed,
            jsonb_object_agg(key, value) FILTER (WHERE key != 'masking') as filters,
            jsonb_object_agg(key, value) FILTER (WHERE key = 'masking') as masking
        FROM (
            SELECT 
                jsonb_object_keys(rule->'filters') as key,
                rule->'filters'->>jsonb_object_keys(rule->'filters') as value
            FROM jsonb_array_elements(access_rules) as rule
            WHERE rule->'filters' IS NOT NULL
            
            UNION ALL
            
            SELECT 
                jsonb_object_keys(rule->'masking') as key,
                rule->'masking'->>jsonb_object_keys(rule->'masking') as value
            FROM jsonb_array_elements(access_rules) as rule
            WHERE rule->'masking' IS NOT NULL
        ) combined_rules;
    ELSE
        RETURN QUERY SELECT FALSE, '{}'::jsonb, '{}'::jsonb;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建审计日志插入函数
CREATE OR REPLACE FUNCTION log_permission_audit(
    user_id_param VARCHAR,
    permission_id_param VARCHAR,
    action_param VARCHAR,
    result_param BOOLEAN,
    resource_param VARCHAR DEFAULT NULL,
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL,
    metadata_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO permission_audit_log (
        user_id,
        permission_id,
        action,
        resource,
        result,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        user_id_param,
        permission_id_param,
        action_param,
        resource_param,
        result_param,
        ip_address_param,
        user_agent_param,
        metadata_param
    );
END;
$$ LANGUAGE plpgsql;

-- 创建视图：用户权限概览
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT 
    ur.user_id,
    r.id as role_id,
    r.name as role_name,
    r.level as role_level,
    p.id as permission_id,
    p.name as permission_name,
    p.category,
    p.resource,
    p.action,
    ur.assigned_at,
    ur.expires_at
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());

-- 创建视图：权限使用统计
CREATE OR REPLACE VIEW permission_usage_stats AS
SELECT 
    p.id as permission_id,
    p.name as permission_name,
    p.category,
    COUNT(DISTINCT pal.user_id) as user_count,
    COUNT(*) as total_checks,
    SUM(CASE WHEN pal.result = true THEN 1 ELSE 0 END) as successful_checks,
    MAX(pal.created_at) as last_used
FROM permissions p
LEFT JOIN permission_audit_log pal ON p.id = pal.permission_id
GROUP BY p.id, p.name, p.category
ORDER BY user_count DESC, total_checks DESC;

-- 添加注释
COMMENT ON TABLE roles IS '系统角色表，支持角色继承';
COMMENT ON TABLE permissions IS '系统权限定义表';
COMMENT ON TABLE role_permissions IS '角色权限映射表';
COMMENT ON TABLE user_roles IS '用户角色分配表';
COMMENT ON TABLE permission_audit_log IS '权限操作审计日志表';
COMMENT ON TABLE data_access_permissions IS '数据访问控制权限表';
COMMENT ON FUNCTION check_user_permission IS '检查用户是否具有指定权限';
COMMENT ON FUNCTION check_data_access IS '检查用户数据访问权限';
COMMENT ON FUNCTION log_permission_audit IS '记录权限审计日志';
COMMENT ON VIEW user_permissions_view IS '用户权限概览视图';
COMMENT ON VIEW permission_usage_stats IS '权限使用统计视图';

-- 验证迁移结果
DO $$
BEGIN
    RAISE NOTICE '数据中心权限管理数据库迁移完成';
    RAISE NOTICE '创建表数量: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('roles', 'permissions', 'role_permissions', 'user_roles', 'permission_audit_log', 'data_access_permissions'));
    RAISE NOTICE '默认角色数量: %', (SELECT COUNT(*) FROM roles);
    RAISE NOTICE '数据中心权限数量: %', (SELECT COUNT(*) FROM permissions WHERE category = 'data_center');
END $$;