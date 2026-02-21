-- 营销数据表结构
-- 创建时间: 2026-02-21
-- 版本: 1.0.0

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

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE leads IS '营销线索信息表';
COMMENT ON TABLE marketing_events IS '营销活动事件追踪表';

COMMENT ON COLUMN leads.role IS '用户角色：ops(运营/客服)、tech(技术/运维)、biz(业务负责人)、partner(合作伙伴)';
COMMENT ON COLUMN leads.status IS '线索状态：new(新线索)、contacted(已联系)、converted(已转化)、rejected(已拒绝)';
COMMENT ON COLUMN marketing_events.event_type IS '事件类型：page_view(页面浏览)、cta_click(CTA点击)、form_submit(表单提交)、lead_submit(线索提交)、demo_try(演示尝试)';

-- 插入初始数据示例
INSERT INTO leads (role, name, company, email, phone, use_case, source, status) VALUES
('ops', '张经理', '科技有限公司', 'zhang@example.com', '13800138000', '希望通过自动化提升客服响应效率', 'landing_page', 'new'),
('tech', '李工程师', '互联网公司', 'li@example.com', '13900139000', '需要集成多个第三方API', 'landing_page', 'new'),
('biz', '王总监', '制造企业', 'wang@example.com', '13700137000', '寻求降本增效的数字化解决方案', 'landing_page', 'new')
ON CONFLICT DO NOTHING;