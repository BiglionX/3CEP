
-- 店铺审核流程完善 - 数据库升级脚本

-- 创建审核标准配置表
CREATE TABLE IF NOT EXISTS review_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建审核记录表
CREATE TABLE IF NOT EXISTS shop_review_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES repair_shops(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES user_profiles_ext(user_id),
  review_step VARCHAR(20) NOT NULL,
  action VARCHAR(20) NOT NULL,
  score_details JSONB,
  comments TEXT,
  supporting_documents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认审核标准
INSERT INTO review_criteria (category, name, weight, description, is_required) VALUES
  ('businessLicense', '营业执照验证', 30, '验证营业执照的真实性和有效性', true),
  ('shopLocation', '店铺位置评估', 20, '评估店铺地理位置和服务覆盖能力', true),
  ('technicalCapability', '技术服务能力', 25, '评估技师资质和设备配置水平', true),
  ('reputationRisk', '声誉风险管理', 15, '核查信用记录和投诉历史', false),
  ('complianceHistory', '合规历史记录', 10, '检查法规遵守和安全记录', false)
ON CONFLICT DO NOTHING;
