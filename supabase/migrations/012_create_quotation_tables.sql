-- 自动询价比价平台数据表结构

-- 询价模板表
CREATE TABLE IF NOT EXISTS quotation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                    -- 模板名称
    subject VARCHAR(200) NOT NULL,                -- 邮件主题
    content TEXT NOT NULL,                        -- 模板内容（支持HTML）
    content_type VARCHAR(10) DEFAULT 'html' CHECK (content_type IN ('html', 'text')), -- 内容类型
    language VARCHAR(10) DEFAULT 'zh' CHECK (language IN ('zh', 'en')), -- 语言
    variables JSONB,                              -- 模板变量定义
    is_active BOOLEAN DEFAULT true,               -- 是否激活
    created_by UUID REFERENCES profiles(id),      -- 创建人
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 询价请求表
CREATE TABLE IF NOT EXISTS quotation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,   -- 询价单号 QO-20240101-ABC123
    procurement_request_id UUID REFERENCES procurement_requests(id) ON DELETE CASCADE, -- 关联采购需求
    template_id UUID REFERENCES quotation_templates(id), -- 使用的模板
    supplier_ids UUID[],                          -- 目标供应商IDs
    items JSONB NOT NULL,                         -- 询价商品列表
    delivery_deadline TIMESTAMP WITH TIME ZONE,   -- 交货截止时间
    response_deadline TIMESTAMP WITH TIME ZONE,   -- 回复截止时间
    special_requirements TEXT,                    -- 特殊要求
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial_response', 'completed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,             -- 发送时间
    completed_at TIMESTAMP WITH TIME ZONE,        -- 完成时间
    created_by UUID REFERENCES profiles(id),      -- 创建人
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 供应商报价表
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE, -- 关联询价请求
    supplier_id UUID REFERENCES suppliers(id),    -- 供应商ID
    quote_number VARCHAR(100),                    -- 报价单号
    items JSONB NOT NULL,                         -- 报价项目明细
    total_amount DECIMAL(12,2) NOT NULL,          -- 总金额
    currency VARCHAR(3) DEFAULT 'CNY',            -- 货币
    validity_period_start TIMESTAMP WITH TIME ZONE, -- 有效期开始
    validity_period_end TIMESTAMP WITH TIME ZONE,   -- 有效期结束
    delivery_time INTEGER,                        -- 交货时间（天）
    delivery_terms TEXT,                          -- 交货条款
    payment_terms TEXT,                           -- 付款条款
    warranty_terms TEXT,                          -- 保修条款
    remarks TEXT,                                 -- 备注
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'accepted', 'rejected', 'negotiating', 'expired')),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 收到时间
    processed_at TIMESTAMP WITH TIME ZONE,        -- 处理时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报价项目明细表
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES supplier_quotes(id) ON DELETE CASCADE, -- 关联报价
    item_id VARCHAR(100),                         -- 商品ID
    item_name VARCHAR(200) NOT NULL,              -- 商品名称
    quantity INTEGER NOT NULL,                    -- 数量
    unit VARCHAR(20) NOT NULL,                    -- 单位
    unit_price DECIMAL(12,2) NOT NULL,            -- 单价
    total_price DECIMAL(12,2) NOT NULL,           -- 小计
    specifications TEXT,                          -- 规格要求
    remarks TEXT,                                 -- 备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邮件发送记录表
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE, -- 关联询价请求
    supplier_id UUID REFERENCES suppliers(id),    -- 供应商ID
    to_address VARCHAR(255) NOT NULL,             -- 收件人邮箱
    subject VARCHAR(200) NOT NULL,                -- 邮件主题
    content TEXT NOT NULL,                        -- 邮件内容
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'opened')),
    sent_at TIMESTAMP WITH TIME ZONE,             -- 发送时间
    delivered_at TIMESTAMP WITH TIME ZONE,        -- 投递时间
    opened_at TIMESTAMP WITH TIME ZONE,           -- 打开时间
    error_message TEXT,                           -- 错误信息
    retry_count INTEGER DEFAULT 0,                -- 重试次数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 比价报告表
CREATE TABLE IF NOT EXISTS comparison_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE, -- 关联询价请求
    report_title VARCHAR(200) NOT NULL,           -- 报告标题
    summary JSONB,                                -- 报告摘要
    price_analysis JSONB,                         -- 价格分析
    delivery_analysis JSONB,                      -- 交期分析
    risk_assessment JSONB,                        -- 风险评估
    recommendations JSONB,                        -- 推荐建议
    report_data JSONB,                            -- 完整报告数据
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 生成时间
    created_by UUID REFERENCES profiles(id),      -- 生成人
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_quotation_templates_active ON quotation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON quotation_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_procurement ON quotation_requests(procurement_request_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_request ON supplier_quotes(quotation_request_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier ON supplier_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_status ON supplier_quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_request ON email_logs(quotation_request_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_comparison_reports_request ON comparison_reports(quotation_request_id);

-- RLS策略
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_reports ENABLE ROW LEVEL SECURITY;

-- 询价模板RLS策略
CREATE POLICY "用户可以查看激活的询价模板" ON quotation_templates
    FOR SELECT USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "授权用户可以创建询价模板" ON quotation_templates
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "模板创建者可以更新自己的模板" ON quotation_templates
    FOR UPDATE USING (created_by = auth.uid());

-- 询价请求RLS策略
CREATE POLICY "用户可以查看自己的询价请求" ON quotation_requests
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

CREATE POLICY "授权用户可以创建询价请求" ON quotation_requests
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager', 'purchaser')
        )
    );

CREATE POLICY "授权用户可以更新询价请求" ON quotation_requests
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'supply_chain_manager')
        )
    );

-- 供应商报价RLS策略
CREATE POLICY "用户可以查看相关询价的供应商报价" ON supplier_quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotation_requests qr 
            WHERE qr.id = quotation_request_id 
            AND (
                qr.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'supply_chain_manager')
                )
            )
        )
    );

-- 邮件日志RLS策略
CREATE POLICY "用户可以查看相关询价的邮件记录" ON email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotation_requests qr 
            WHERE qr.id = quotation_request_id 
            AND (
                qr.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'supply_chain_manager')
                )
            )
        )
    );

-- 比价报告RLS策略
CREATE POLICY "用户可以查看相关询价的比价报告" ON comparison_reports
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM quotation_requests qr 
            WHERE qr.id = quotation_request_id 
            AND (
                qr.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'supply_chain_manager')
                )
            )
        )
    );

-- 触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_quotation_templates_updated_at 
    BEFORE UPDATE ON quotation_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_requests_updated_at 
    BEFORE UPDATE ON quotation_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_quotes_updated_at 
    BEFORE UPDATE ON supplier_quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化示例数据
INSERT INTO quotation_templates (name, subject, content, language, variables, created_by) VALUES
('标准询价模板-中文', '【询价】关于{{productName}}的采购询价', 
'<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .important { color: #d9534f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>采购询价函</h2>
        <p>询价单号：{{quotationNumber}}</p>
        <p>发送日期：{{sendDate}}</p>
    </div>
    
    <div class="content">
        <p>尊敬的{{supplierName}}：</p>
        
        <p>我们是{{companyName}}，现就以下商品进行采购询价：</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>商品名称</th>
                    <th>规格型号</th>
                    <th>数量</th>
                    <th>单位</th>
                    <th>期望交期</th>
                </tr>
            </thead>
            <tbody>
                {{#each items}}
                <tr>
                    <td>{{this.name}}</td>
                    <td>{{this.specifications}}</td>
                    <td>{{this.quantity}}</td>
                    <td>{{this.unit}}</td>
                    <td>{{../deliveryDeadline}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        
        <p><strong>特殊要求：</strong></p>
        <ul>
            <li>请提供含税价格</li>
            <li>报价有效期：收到询价后{{validityDays}}天</li>
            <li>回复截止时间：{{responseDeadline}}</li>
            {{#if specialRequirements}}
            <li>{{specialRequirements}}</li>
            {{/if}}
        </ul>
        
        <p class="important">请在截止时间前回复，谢谢配合！</p>
    </div>
    
    <div class="footer">
        <p>{{companyName}}</p>
        <p>联系人：{{contactPerson}}</p>
        <p>联系电话：{{contactPhone}}</p>
        <p>邮箱：{{contactEmail}}</p>
    </div>
</body>
</html>', 
'zh', 
'{
    "quotationNumber": "询价单号",
    "sendDate": "发送日期", 
    "supplierName": "供应商名称",
    "companyName": "公司名称",
    "deliveryDeadline": "期望交期",
    "validityDays": "报价有效期天数",
    "responseDeadline": "回复截止时间",
    "specialRequirements": "特殊要求",
    "contactPerson": "联系人",
    "contactPhone": "联系电话",
    "contactEmail": "联系邮箱"
}'::jsonb,
'00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

INSERT INTO quotation_templates (name, subject, content, language, variables, created_by) VALUES
('Standard Quotation Template-English', '[RFQ] Request for Quotation - {{productName}}', 
'<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .important { color: #d9534f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Request for Quotation</h2>
        <p>RFQ Number: {{quotationNumber}}</p>
        <p>Date: {{sendDate}}</p>
    </div>
    
    <div class="content">
        <p>Dear {{supplierName}},</p>
        
        <p>We are {{companyName}} and would like to request a quotation for the following products:</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>Product Name</th>
                    <th>Specifications</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Delivery Date</th>
                </tr>
            </thead>
            <tbody>
                {{#each items}}
                <tr>
                    <td>{{this.name}}</td>
                    <td>{{this.specifications}}</td>
                    <td>{{this.quantity}}</td>
                    <td>{{this.unit}}</td>
                    <td>{{../deliveryDeadline}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        
        <p><strong>Special Requirements:</strong></p>
        <ul>
            <li>Please provide prices including tax</li>
            <li>Quotation validity: {{validityDays}} days from receipt</li>
            <li>Response deadline: {{responseDeadline}}</li>
            {{#if specialRequirements}}
            <li>{{specialRequirements}}</li>
            {{/if}}
        </ul>
        
        <p class="important">Please respond before the deadline. Thank you for your cooperation!</p>
    </div>
    
    <div class="footer">
        <p>{{companyName}}</p>
        <p>Contact: {{contactPerson}}</p>
        <p>Phone: {{contactPhone}}</p>
        <p>Email: {{contactEmail}}</p>
    </div>
</body>
</html>',
'en',
'{
    "quotationNumber": "Quotation Number",
    "sendDate": "Send Date",
    "supplierName": "Supplier Name",
    "companyName": "Company Name",
    "deliveryDeadline": "Expected Delivery Date",
    "validityDays": "Validity Days",
    "responseDeadline": "Response Deadline",
    "specialRequirements": "Special Requirements",
    "contactPerson": "Contact Person",
    "contactPhone": "Contact Phone",
    "contactEmail": "Contact Email"
}'::jsonb,
'00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;