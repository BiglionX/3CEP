-- 营销数据库迁移脚本
-- 执行位置: Supabase SQL Editor

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建营销线索表
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('ops', 'tech', 'biz', 'partner', 'other')),
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  use_case TEXT,
  source VARCHAR(100) DEFAULT 'landing_page',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建营销事件追踪表
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'cta_click', 'form_submit', 'lead_submit', 'demo_try')),
  role VARCHAR(50),
  page_path VARCHAR(255),
  source VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建性能监控表
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_load_time INTEGER,
  api_response_time INTEGER,
  first_contentful_paint INTEGER,
  largest_contentful_paint INTEGER,
  cumulative_layout_shift NUMERIC(6,4),
  first_input_delay INTEGER,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_role ON leads(role);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);

CREATE INDEX IF NOT EXISTS idx_events_type ON marketing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_role ON marketing_events(role);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON marketing_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON marketing_events(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_url ON performance_metrics(url);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE leads IS '营销线索信息表';
COMMENT ON TABLE marketing_events IS '营销活动事件追踪表';
COMMENT ON TABLE performance_metrics IS '前端性能监控数据表';

-- 插入测试数据
INSERT INTO leads (role, name, company, email, phone, use_case, source) VALUES
('ops', '测试用户-运营', '测试公司', 'test-ops@example.com', '13800138001', '测试运营自动化功能', 'manual_test'),
('tech', '测试用户-技术', '技术公司', 'test-tech@example.com', '13800138002', '测试技术运维功能', 'manual_test'),
('biz', '测试用户-业务', '业务公司', 'test-biz@example.com', '13800138003', '测试业务决策功能', 'manual_test'),
('partner', '测试用户-合作', '合作伙伴', 'test-partner@example.com', '13800138004', '测试合作伙伴功能', 'manual_test');

-- 验证表创建成功
SELECT '✅ 表创建成功!' as status,
       (SELECT COUNT(*) FROM leads) as leads_count,
       (SELECT COUNT(*) FROM marketing_events) as events_count,
       (SELECT COUNT(*) FROM performance_metrics) as metrics_count;