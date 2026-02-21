-- 创建API配置管理表
CREATE TABLE IF NOT EXISTS api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  category VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'inactive',
  last_tested TIMESTAMP WITH TIME ZONE,
  test_result BOOLEAN,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_api_configs_provider ON api_configs(provider);
CREATE INDEX IF NOT EXISTS idx_api_configs_category ON api_configs(category);
CREATE INDEX IF NOT EXISTS idx_api_configs_status ON api_configs(status);
CREATE INDEX IF NOT EXISTS idx_api_configs_required ON api_configs(is_required);

-- 添加表注释
COMMENT ON TABLE api_configs IS 'API配置管理表';
COMMENT ON COLUMN api_configs.id IS '主键ID';
COMMENT ON COLUMN api_configs.provider IS 'API提供商';
COMMENT ON COLUMN api_configs.category IS '配置分类';
COMMENT ON COLUMN api_configs.name IS '配置名称';
COMMENT ON COLUMN api_configs.key IS '配置键名';
COMMENT ON COLUMN api_configs.value IS '配置值';
COMMENT ON COLUMN api_configs.description IS '配置描述';
COMMENT ON COLUMN api_configs.is_encrypted IS '是否加密存储';
COMMENT ON COLUMN api_configs.is_required IS '是否必需配置';
COMMENT ON COLUMN api_configs.status IS '配置状态 (active/inactive/error)';
COMMENT ON COLUMN api_configs.last_tested IS '最后测试时间';
COMMENT ON COLUMN api_configs.test_result IS '测试结果';
COMMENT ON COLUMN api_configs.updated_by IS '最后更新用户';
COMMENT ON COLUMN api_configs.updated_at IS '最后更新时间';

-- 插入项目必需的API配置项
INSERT INTO api_configs (
  provider, category, name, key, description, is_required, status
) VALUES
-- 数据库配置
('supabase', 'database', 'Supabase服务密钥', 'supabase_service_key', '用于服务端数据库操作的服务角色密钥', true, 'inactive'),
('postgresql', 'database', 'PostgreSQL连接字符串', 'postgresql_connection_string', 'PostgreSQL数据库连接信息', true, 'inactive'),
('redis', 'database', 'Redis连接URL', 'redis_url', 'Redis缓存服务连接URL', false, 'inactive'),

-- 认证服务
('google', 'authentication', 'Google OAuth客户端ID', 'google_oauth_client_id', 'Google登录OAuth客户端ID', false, 'inactive'),

-- AI服务
('deepseek', 'ai', 'DeepSeek API密钥', 'deepseek_api_key', 'AI内容处理API密钥', true, 'inactive'),
('openai', 'ai', 'OpenAI API密钥', 'openai_api_key', 'AI对话和内容生成API密钥', false, 'inactive'),

-- 支付服务
('stripe', 'payment', 'Stripe密钥', 'stripe_secret_key', '支付处理服务密钥', true, 'inactive'),
('alipay', 'payment', '支付宝应用ID', 'alipay_app_id', '支付宝支付集成应用ID', false, 'inactive'),
('paypal', 'payment', 'PayPal客户端ID', 'paypal_client_id', 'PayPal支付集成客户端ID', false, 'inactive'),

-- 电商服务
('taobao', 'ecommerce', '淘宝联盟密钥', 'taobao_union_key', '淘宝商品推广联盟API密钥', false, 'inactive'),
('jd', 'ecommerce', '京东联盟密钥', 'jd_union_key', '京东商品推广联盟API密钥', false, 'inactive'),
('pinduoduo', 'ecommerce', '拼多多联盟密钥', 'pdd_union_key', '拼多多商品推广联盟API密钥', false, 'inactive'),
('xianyu', 'ecommerce', '闲鱼数据API密钥', 'xianyu_api_key', '闲鱼二手设备价格数据采集API密钥', false, 'inactive'),
('zhuanzhuan', 'ecommerce', '转转数据API密钥', 'zhuanzhuan_api_key', '转转二手设备价格数据采集API密钥', false, 'inactive'),

-- 供应链管理服务
('supplier_service', 'supply_chain', '供应商管理服务API', 'supplier_service_api', '供应商入驻、审核、管理相关API服务', true, 'inactive'),
('procurement_api', 'supply_chain', '采购订单管理API', 'procurement_api_url', '采购订单创建、审批、跟踪API服务', true, 'inactive'),
('inventory_api', 'supply_chain', '库存管理服务API', 'inventory_api_url', '库存查询、调配、预警API服务', true, 'inactive'),
('warehouse_api', 'supply_chain', '仓储管理服务API', 'warehouse_api_url', '仓库管理、货位分配、出入库API服务', false, 'inactive'),

-- B2B采购代理服务
('weaviate', 'ai', 'Weaviate向量数据库API', 'weaviate_api_url', '供应商向量检索和匹配服务API', true, 'inactive'),
('procurement_agent', 'procurement', 'B2B采购代理API', 'procurement_agent_api', '智能采购决策和代理服务API', true, 'inactive'),

-- 通知服务
('email_service', 'messaging', '企业邮件服务API', 'email_smtp_config', '系统通知邮件发送服务配置', true, 'inactive'),

-- 系统监控告警
('system_monitor', 'monitoring', '系统监控告警API', 'system_monitor_api', '系统健康度监控和告警服务API', false, 'inactive'),

-- 监控服务
('prometheus', 'monitoring', 'Prometheus端点', 'prometheus_endpoint', '系统监控数据收集端点', false, 'inactive'),
('grafana', 'monitoring', 'Grafana API密钥', 'grafana_api_key', '监控面板API访问密钥', false, 'inactive'),

-- 消息服务
('twilio', 'messaging', 'Twilio账户SID', 'twilio_account_sid', '短信和语音服务账户SID', false, 'inactive'),
('sendgrid', 'messaging', 'SendGrid API密钥', 'sendgrid_api_key', '邮件发送服务API密钥', false, 'inactive'),

-- 存储服务
('aws', 'storage', 'AWS访问密钥', 'aws_access_key', 'Amazon S3存储服务访问密钥', false, 'inactive'),
('aliyun', 'storage', '阿里云访问密钥', 'aliyun_access_key', '阿里云OSS存储服务访问密钥', false, 'inactive'),
('tencent', 'storage', '腾讯云访问密钥', 'tencent_secret_id', '腾讯云COS存储服务访问密钥', false, 'inactive'),

-- 分析服务
('mixpanel', 'analytics', 'Mixpanel项目令牌', 'mixpanel_token', '用户行为分析项目令牌', false, 'inactive'),
('amplitude', 'analytics', 'Amplitude API密钥', 'amplitude_api_key', '产品分析API密钥', false, 'inactive')

ON CONFLICT (key) DO NOTHING;

-- 创建视图：按状态分组的配置统计
CREATE OR REPLACE VIEW api_config_status AS
SELECT 
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN value IS NOT NULL AND LENGTH(value) > 0 THEN 1 END) as configured,
  COUNT(CASE WHEN is_required = true THEN 1 END) as required_total,
  COUNT(CASE WHEN is_required = true AND value IS NOT NULL AND LENGTH(value) > 0 THEN 1 END) as required_configured,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as healthy
FROM api_configs
GROUP BY category
ORDER BY category;

-- 创建函数：自动更新时间戳
CREATE OR REPLACE FUNCTION update_api_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER api_configs_updated_at_trigger
  BEFORE UPDATE ON api_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_api_configs_updated_at();