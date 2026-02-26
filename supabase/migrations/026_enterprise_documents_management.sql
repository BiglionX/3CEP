-- 企业资料文档管理表结构扩展
-- Migration: 026_enterprise_documents_management.sql
-- 创建时间: 2026-02-25
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：企业资料文档表
-- ====================================================================

-- 企业资料文档表
CREATE TABLE IF NOT EXISTS enterprise_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- 存储路径
  file_size BIGINT NOT NULL, -- 文件大小(bytes)
  file_type VARCHAR(50) NOT NULL, -- 文件类型(MIME)
  file_extension VARCHAR(10), -- 文件扩展名
  category VARCHAR(50) NOT NULL, -- 文档分类: business_license, qualification, contract, report, other
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, archived
  tags TEXT[], -- 标签数组
  metadata JSONB, -- 元数据信息
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  access_level VARCHAR(20) DEFAULT 'private', -- private, internal, public
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 企业文档分类表
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES document_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  required_fields JSONB, -- 该分类需要的必填字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 企业文档审批流程表
CREATE TABLE IF NOT EXISTS document_approval_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES enterprise_documents(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approval_level INTEGER NOT NULL, -- 审批层级
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引创建
-- ====================================================================

-- 企业文档表索引
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_enterprise_id ON enterprise_documents(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_category ON enterprise_documents(category);
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_status ON enterprise_documents(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_uploaded_by ON enterprise_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_created_at ON enterprise_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_enterprise_documents_file_type ON enterprise_documents(file_type);

-- 文档分类表索引
CREATE INDEX IF NOT EXISTS idx_document_categories_code ON document_categories(code);
CREATE INDEX IF NOT EXISTS idx_document_categories_parent_id ON document_categories(parent_id);

-- 审批流程表索引
CREATE INDEX IF NOT EXISTS idx_document_approval_workflow_document_id ON document_approval_workflow(document_id);
CREATE INDEX IF NOT EXISTS idx_document_approval_workflow_approver_id ON document_approval_workflow(approver_id);
CREATE INDEX IF NOT EXISTS idx_document_approval_workflow_status ON document_approval_workflow(status);

-- ====================================================================
-- 第三部分：RLS安全策略
-- ====================================================================

-- 启用RLS
ALTER TABLE enterprise_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_approval_workflow ENABLE ROW LEVEL SECURITY;

-- 企业文档表策略
CREATE POLICY "企业用户可查看自己的文档"
  ON enterprise_documents FOR SELECT
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    ) OR access_level = 'public'
  );

CREATE POLICY "企业用户可上传文档"
  ON enterprise_documents FOR INSERT
  WITH CHECK (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可管理自己的文档"
  ON enterprise_documents FOR UPDATE
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "企业用户可删除自己的文档"
  ON enterprise_documents FOR DELETE
  USING (
    enterprise_id IN (
      SELECT id FROM enterprise_users 
      WHERE user_id = auth.uid()
    )
  );

-- 文档分类表策略（公开读取）
CREATE POLICY "所有人可查看文档分类"
  ON document_categories FOR SELECT
  USING (true);

CREATE POLICY "管理员可管理文档分类"
  ON document_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users eu 
      JOIN auth.users u ON eu.user_id = u.id
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

-- 审批流程表策略
CREATE POLICY "相关人员可查看审批流程"
  ON document_approval_workflow FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM enterprise_documents 
      WHERE enterprise_id IN (
        SELECT id FROM enterprise_users 
        WHERE user_id = auth.uid()
      )
    ) OR approver_id = auth.uid()
  );

CREATE POLICY "审批人可更新审批状态"
  ON document_approval_workflow FOR UPDATE
  USING (approver_id = auth.uid());

-- ====================================================================
-- 第四部分：触发器和函数
-- ====================================================================

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为企业文档表创建更新时间触发器
CREATE TRIGGER update_enterprise_documents_updated_at 
    BEFORE UPDATE ON enterprise_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 文档审批状态更新触发器
CREATE OR REPLACE FUNCTION update_document_status_from_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果是最终审批且通过，则更新文档状态为approved
    IF NEW.status = 'approved' THEN
        UPDATE enterprise_documents 
        SET status = 'approved', reviewed_by = NEW.approver_id, reviewed_at = NOW()
        WHERE id = NEW.document_id
        AND NOT EXISTS (
            SELECT 1 FROM document_approval_workflow 
            WHERE document_id = NEW.document_id 
            AND status = 'pending'
        );
    -- 如果有任何审批被拒绝，则更新文档状态为rejected
    ELSIF NEW.status = 'rejected' THEN
        UPDATE enterprise_documents 
        SET status = 'rejected', rejection_reason = NEW.comments,
            reviewed_by = NEW.approver_id, reviewed_at = NOW()
        WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建审批状态更新触发器
CREATE TRIGGER trigger_update_document_status
    AFTER UPDATE ON document_approval_workflow
    FOR EACH ROW
    EXECUTE FUNCTION update_document_status_from_approval();

-- ====================================================================
-- 第五部分：初始数据
-- ====================================================================

-- 插入默认文档分类
INSERT INTO document_categories (name, code, description, sort_order, required_fields) VALUES
  ('营业执照', 'business_license', '企业法人营业执照', 1, '{"valid_until": "有效期"}'),
  ('资质证书', 'qualification', '各类资质认证证书', 2, '{"certificate_number": "证书编号", "issue_date": "颁发日期"}'),
  ('合同协议', 'contract', '商务合同和合作协议', 3, '{"contract_number": "合同编号", "sign_date": "签署日期"}'),
  ('财务报告', 'report', '财务审计和经营报告', 4, '{"report_period": "报告期间", "audit_opinion": "审计意见"}'),
  ('其他文档', 'other', '其他企业相关文档', 5, '{}')
ON CONFLICT (code) DO NOTHING;

-- 插入示例文档数据
INSERT INTO enterprise_documents (
  enterprise_id, title, description, file_name, file_path, file_size, 
  file_type, file_extension, category, status, uploaded_by
) VALUES 
  (
    (SELECT id FROM enterprise_users LIMIT 1),
    '营业执照副本',
    '企业法人营业执照副本扫描件',
    'business_license_2024.pdf',
    '/documents/business_license_2024.pdf',
    2456789,
    'application/pdf',
    'pdf',
    'business_license',
    'approved',
    (SELECT user_id FROM enterprise_users LIMIT 1)
  ),
  (
    (SELECT id FROM enterprise_users LIMIT 1),
    'ISO9001认证证书',
    '质量管理体系认证证书',
    'iso9001_certificate.pdf',
    '/documents/iso9001_certificate.pdf',
    1890123,
    'application/pdf',
    'pdf',
    'qualification',
    'pending',
    (SELECT user_id FROM enterprise_users LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- 插入示例审批流程数据
INSERT INTO document_approval_workflow (
  document_id, approver_id, approval_level, status
) VALUES 
  (
    (SELECT id FROM enterprise_documents WHERE title = '营业执照副本' LIMIT 1),
    (SELECT user_id FROM enterprise_users LIMIT 1),
    1,
    'approved'
  )
ON CONFLICT DO NOTHING;

COMMENT ON TABLE enterprise_documents IS '企业资料文档管理表';
COMMENT ON TABLE document_categories IS '文档分类表';
COMMENT ON TABLE document_approval_workflow IS '文档审批流程表';