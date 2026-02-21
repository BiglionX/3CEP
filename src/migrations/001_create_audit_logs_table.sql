-- 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(resource, action, created_at);

-- 添加表注释
COMMENT ON TABLE audit_logs IS '系统操作审计日志表';
COMMENT ON COLUMN audit_logs.id IS '主键ID';
COMMENT ON COLUMN audit_logs.user_id IS '操作用户ID';
COMMENT ON COLUMN audit_logs.user_email IS '操作用户邮箱';
COMMENT ON COLUMN audit_logs.action IS '操作类型 (create, update, delete, view, approve, reject等)';
COMMENT ON COLUMN audit_logs.resource IS '资源类型 (user, shop, tutorial, article等)';
COMMENT ON COLUMN audit_logs.resource_id IS '资源ID';
COMMENT ON COLUMN audit_logs.old_value IS '操作前的值';
COMMENT ON COLUMN audit_logs.new_value IS '操作后的值';
COMMENT ON COLUMN audit_logs.ip_address IS '操作IP地址';
COMMENT ON COLUMN audit_logs.user_agent IS '用户代理信息';
COMMENT ON COLUMN audit_logs.session_id IS '会话ID';
COMMENT ON COLUMN audit_logs.created_at IS '创建时间';