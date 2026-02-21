-- V1.2__create_fault_type_dictionary.sql
-- 创建故障类型字典表
-- 创建时间: 2026-02-20
-- 版本: 1.2.0

-- 故障类型表
CREATE TABLE IF NOT EXISTS fault_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(50),
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time INTEGER, -- 分钟
  image_url TEXT,
  repair_guide_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_faults_category ON fault_types(category);
CREATE INDEX IF NOT EXISTS idx_faults_sub_category ON fault_types(sub_category);

-- 添加表注释
COMMENT ON TABLE fault_types IS '故障类型字典表';
COMMENT ON COLUMN fault_types.id IS '故障类型唯一标识符';
COMMENT ON COLUMN fault_types.name IS '故障名称';
COMMENT ON COLUMN fault_types.category IS '故障分类';
COMMENT ON COLUMN fault_types.sub_category IS '故障子分类';
COMMENT ON COLUMN fault_types.description IS '故障描述';
COMMENT ON COLUMN fault_types.difficulty_level IS '维修难度等级(1-5)';
COMMENT ON COLUMN fault_types.estimated_time IS '预估维修时间(分钟)';
COMMENT ON COLUMN fault_types.image_url IS '故障示意图URL';
COMMENT ON COLUMN fault_types.repair_guide_url IS '维修指南链接';
COMMENT ON COLUMN fault_types.status IS '故障类型状态';
COMMENT ON COLUMN fault_types.created_at IS '创建时间';

-- 启用RLS
ALTER TABLE fault_types ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "允许所有人查看故障类型" ON fault_types FOR SELECT USING (true);
CREATE POLICY "认证用户可管理故障类型" ON fault_types FOR ALL USING (auth.role() = 'authenticated');

\echo '✅ 故障类型字典表创建完成'