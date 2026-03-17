-- 企业二维码溯源表结构
-- 用于企业管理中心和售后管理模块的二维码溯源功能

-- 1. 溯源码批次表 (enterprise_qr_batches)
CREATE TABLE IF NOT EXISTS enterprise_qr_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) UNIQUE NOT NULL,
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  
  -- 企业内部编码和产品信息
  internal_code VARCHAR(100) NOT NULL, -- 企业内部产品编码
  product_name VARCHAR(200) NOT NULL,
  product_model VARCHAR(100),
  product_category VARCHAR(50),
  
  -- 批次信息
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  generated_count INTEGER DEFAULT 0,
  
  -- 状态管理
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- 配置信息
  config JSONB NOT NULL DEFAULT '{}',
  
  -- 时间戳
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 溯源码明细表 (enterprise_qr_codes)
CREATE TABLE IF NOT EXISTS enterprise_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) REFERENCES enterprise_qr_batches(batch_id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  
  -- 产品信息
  product_id VARCHAR(100) NOT NULL, -- 唯一产品标识
  internal_code VARCHAR(100) NOT NULL, -- 企业内部编码
  qr_content TEXT NOT NULL, -- 二维码内容（URL）
  qr_image_base64 TEXT, -- 二维码图片（Base64）
  
  -- 序列号和配置
  serial_number VARCHAR(20) NOT NULL,
  format VARCHAR(10) DEFAULT 'png',
  size INTEGER DEFAULT 300,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  -- 售后关联（移除外键,改用应用层关联）
  after_sales_ticket_id UUID,
  -- after_sales_ticket_id UUID REFERENCES after_sales_tickets(id),
  
  -- 扫描统计
  scanned_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  
  -- 地理位置追踪
  first_scan_region VARCHAR(100),
  last_scan_region VARCHAR(100),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id)
);

-- 3. 扫描统计表 (enterprise_qr_scan_statistics)
CREATE TABLE IF NOT EXISTS enterprise_qr_scan_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(100) REFERENCES enterprise_qr_batches(batch_id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES enterprise_qr_codes(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  
  -- 扫描统计
  scan_count INTEGER DEFAULT 0,
  unique_scans INTEGER DEFAULT 0,
  first_scan_time TIMESTAMP WITH TIME ZONE,
  last_scan_time TIMESTAMP WITH TIME ZONE,
  
  -- 每日统计（JSON格式存储）
  daily_stats JSONB DEFAULT '{}',
  
  -- 区域统计（JSON格式存储）
  regional_stats JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 扫描历史记录表 (enterprise_qr_scan_logs)
CREATE TABLE IF NOT EXISTS enterprise_qr_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES enterprise_qr_codes(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  batch_id VARCHAR(100),
  product_id VARCHAR(100) NOT NULL,
  
  -- 扫描者信息
  user_id UUID REFERENCES auth.users(id),
  device_id VARCHAR(100),
  
  -- 位置信息
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- 时间戳
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 额外信息
  user_agent TEXT,
  referrer TEXT
);

-- 5. 售后工单表 (after_sales_tickets) - 售后管理模块
CREATE TABLE IF NOT EXISTS after_sales_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(100) UNIQUE NOT NULL,

  -- 企业关联
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  
  -- 客户信息
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  
  -- 产品信息
  qr_code_id UUID,
  -- qr_code_id UUID REFERENCES enterprise_qr_codes(id),
  product_id VARCHAR(100),
  internal_code VARCHAR(100),
  product_name VARCHAR(200),
  product_model VARCHAR(100),
  
  -- 问题信息
  issue_type VARCHAR(50) NOT NULL,
  issue_description TEXT,
  
  -- 优先级和状态
  priority VARCHAR(20) DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' 
    CHECK (status IN ('open', 'processing', 'resolved', 'closed')),
  
  -- 处理信息
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. 售后活动记录表 (after_sales_activities)
CREATE TABLE IF NOT EXISTS after_sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES after_sales_tickets(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES enterprise_users(id) ON DELETE CASCADE,
  
  -- 活动信息
  activity_type VARCHAR(50) NOT NULL, -- comment, status_change, assignment, etc.
  activity_description TEXT,
  
  -- 操作者
  performed_by UUID REFERENCES auth.users(id),

  -- 附件
  attachments JSONB DEFAULT '[]',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能

-- enterprise_qr_batches 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_batches_enterprise ON enterprise_qr_batches(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_batches_status ON enterprise_qr_batches(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_batches_internal_code ON enterprise_qr_batches(internal_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_batches_created_at ON enterprise_qr_batches(created_at DESC);

-- enterprise_qr_codes 表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_batch ON enterprise_qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_enterprise ON enterprise_qr_codes(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_product ON enterprise_qr_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_internal_code ON enterprise_qr_codes(internal_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_qr_code_id ON enterprise_qr_codes(id);
CREATE INDEX IF NOT EXISTS idx_enterprise_qr_codes_ticket ON enterprise_qr_codes(after_sales_ticket_id);

-- enterprise_qr_scan_statistics 表索引
CREATE INDEX IF NOT EXISTS idx_qr_stats_batch ON enterprise_qr_scan_statistics(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_stats_qr_code ON enterprise_qr_scan_statistics(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_stats_enterprise ON enterprise_qr_scan_statistics(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_qr_stats_product ON enterprise_qr_scan_statistics(product_id);

-- enterprise_qr_scan_logs 表索引
CREATE INDEX IF NOT EXISTS idx_qr_logs_qr_code ON enterprise_qr_scan_logs(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_logs_enterprise ON enterprise_qr_scan_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_qr_logs_scanned_at ON enterprise_qr_scan_logs(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_logs_region ON enterprise_qr_scan_logs(region);

-- after_sales_tickets 表索引
CREATE INDEX IF NOT EXISTS idx_tickets_enterprise ON after_sales_tickets(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON after_sales_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON after_sales_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON after_sales_tickets(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON after_sales_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_phone ON after_sales_tickets(customer_phone);

-- after_sales_activities 表索引
CREATE INDEX IF NOT EXISTS idx_activities_ticket ON after_sales_activities(ticket_id);
CREATE INDEX IF NOT EXISTS idx_activities_enterprise ON after_sales_activities(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON after_sales_activities(created_at DESC);

-- 创建视图用于快速查询

-- 批次概览视图
CREATE OR REPLACE VIEW v_enterprise_qr_batch_summary AS
SELECT 
  b.id,
  b.batch_id,
  b.enterprise_id,
  b.internal_code,
  b.product_name,
  b.product_model,
  b.product_category,
  b.quantity,
  b.generated_count,
  b.status,
  b.created_at,
  b.completed_at,
  COUNT(DISTINCT c.id) as total_codes,
  SUM(c.scanned_count) as total_scans,
  COUNT(DISTINCT CASE WHEN c.scanned_count > 0 THEN c.id END) as scanned_codes,
  COUNT(DISTINCT c.last_scan_region) as regions_covered
FROM enterprise_qr_batches b
LEFT JOIN enterprise_qr_codes c ON b.batch_id = c.batch_id
GROUP BY b.id;

-- 扫码热力图数据视图
CREATE OR REPLACE VIEW v_enterprise_qr_scan_heatmap AS
SELECT 
  s.enterprise_id,
  s.batch_id,
  l.region,
  l.city,
  COUNT(DISTINCT l.user_id) as unique_users,
  COUNT(*) as total_scans,
  MAX(l.scanned_at) as last_scan_at
FROM enterprise_qr_scan_logs l
JOIN enterprise_qr_codes c ON l.qr_code_id = c.id
JOIN enterprise_qr_scan_statistics s ON c.id = s.qr_code_id
GROUP BY s.enterprise_id, s.batch_id, l.region, l.city
ORDER BY total_scans DESC;

-- 售后统计视图
CREATE OR REPLACE VIEW v_after_sales_summary AS
SELECT 
  t.enterprise_id,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE t.status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE t.status = 'processing') as processing_tickets,
  COUNT(*) FILTER (WHERE t.status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE t.status = 'closed') as closed_tickets,
  COUNT(*) FILTER (WHERE t.priority = 'urgent') as urgent_tickets,
  COUNT(*) FILTER (WHERE t.priority = 'high') as high_tickets,
  COUNT(*) FILTER (WHERE c.id IS NOT NULL) as tickets_with_qr,
  AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600) FILTER (WHERE t.resolved_at IS NOT NULL) as avg_resolution_hours
FROM after_sales_tickets t
LEFT JOIN enterprise_qr_codes c ON t.qr_code_id = c.id
GROUP BY t.enterprise_id;

-- 添加注释
COMMENT ON TABLE enterprise_qr_batches IS '企业二维码批次表';
COMMENT ON TABLE enterprise_qr_codes IS '企业二维码明细表';
COMMENT ON TABLE enterprise_qr_scan_statistics IS '二维码扫描统计表';
COMMENT ON TABLE enterprise_qr_scan_logs IS '二维码扫描日志表';
COMMENT ON TABLE after_sales_tickets IS '售后工单表';
COMMENT ON TABLE after_sales_activities IS '售后活动记录表';

COMMENT ON COLUMN enterprise_qr_batches.internal_code IS '企业内部产品编码';
COMMENT ON COLUMN enterprise_qr_codes.after_sales_ticket_id IS '关联的售后工单ID';
COMMENT ON COLUMN enterprise_qr_codes.first_scan_region IS '首次扫描区域';
COMMENT ON COLUMN enterprise_qr_codes.last_scan_region IS '最后扫描区域';
COMMENT ON COLUMN after_sales_tickets.qr_code_id IS '扫码关联的二维码';
