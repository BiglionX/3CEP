-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) DEFAULT 'string',
  is_encrypted BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(key);
CREATE INDEX IF NOT EXISTS idx_system_configs_category ON system_configs(category);
CREATE INDEX IF NOT EXISTS idx_system_configs_updated_at ON system_configs(updated_at);

-- 添加表注释
COMMENT ON TABLE system_configs IS '系统配置管理表';
COMMENT ON COLUMN system_configs.id IS '主键ID';
COMMENT ON COLUMN system_configs.key IS '配置键名';
COMMENT ON COLUMN system_configs.value IS '配置值';
COMMENT ON COLUMN system_configs.description IS '配置描述';
COMMENT ON COLUMN system_configs.category IS '配置分类';
COMMENT ON COLUMN system_configs.type IS '值类型 (string, number, boolean, json)';
COMMENT ON COLUMN system_configs.is_encrypted IS '是否加密存储';
COMMENT ON COLUMN system_configs.is_system IS '是否为系统配置';
COMMENT ON COLUMN system_configs.updated_by IS '最后更新用户';
COMMENT ON COLUMN system_configs.updated_at IS '最后更新时间';

-- 插入默认系统配置
INSERT INTO system_configs (key, value, description, category, type, is_system) VALUES
('site_name', 'FixCycle管理系统', '站点名称', 'system', 'string', true),
('maintenance_mode', 'false', '维护模式开关', 'system', 'boolean', true),
('max_upload_size', '10MB', '最大上传文件大小', 'upload', 'string', false),
('email_smtp_host', '', 'SMTP服务器地址', 'email', 'string', false),
('email_smtp_port', '587', 'SMTP端口', 'email', 'number', false),
('email_from_address', '', '发件人邮箱地址', 'email', 'string', false),
('email_from_name', 'FixCycle系统', '发件人名称', 'email', 'string', false),
('session_timeout', '24', '会话超时时间(小时)', 'security', 'number', false),
('password_min_length', '8', '密码最小长度', 'security', 'number', false),
('enable_registration', 'true', '是否允许用户注册', 'system', 'boolean', false),
('default_timezone', 'Asia/Shanghai', '默认时区', 'system', 'string', true),
('log_retention_days', '90', '日志保留天数', 'system', 'number', false),
('max_audit_log_size', '1000000', '审计日志最大记录数', 'system', 'number', false),
('enable_api_rate_limit', 'true', '是否启用API速率限制', 'api', 'boolean', false),
('api_rate_limit_requests', '1000', 'API每小时请求限制', 'api', 'number', false)
ON CONFLICT (key) DO NOTHING;