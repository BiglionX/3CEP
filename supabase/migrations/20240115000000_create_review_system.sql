-- 审核管理系统表结构

-- 审核记录表
CREATE TABLE IF NOT EXISTS document_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES product_documents(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status review_status_type NOT NULL DEFAULT 'pending',
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 审核员权限表
CREATE TABLE IF NOT EXISTS reviewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    department VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 审核日志表
CREATE TABLE IF NOT EXISTS review_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES document_reviews(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_reviewer_id ON document_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status ON document_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviewers_user_id ON reviewers(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_review_id ON review_logs(review_id);

-- RLS策略
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

-- 审核记录策略
CREATE POLICY "审核员可以查看所有审核记录" ON document_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reviewers r 
            WHERE r.user_id = auth.uid() AND r.is_active = true
        )
    );

CREATE POLICY "审核员可以更新自己负责的审核" ON document_reviews
    FOR UPDATE USING (
        reviewer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM reviewers r 
            WHERE r.user_id = auth.uid() AND r.is_active = true
        )
    );

-- 审核员策略
CREATE POLICY "用户只能查看自己的审核员信息" ON reviewers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "管理员可以管理审核员" ON reviewers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- 审核日志策略
CREATE POLICY "审核员可以查看相关审核日志" ON review_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM document_reviews dr 
            JOIN reviewers r ON dr.reviewer_id = r.user_id
            WHERE dr.id = review_logs.review_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM reviewers r 
            WHERE r.user_id = auth.uid() AND r.is_active = true
        )
    );