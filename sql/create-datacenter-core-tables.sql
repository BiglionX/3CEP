-- ============================================
-- 数据中心核心表创建脚本 (通用版本)
-- 用途：创建数据中心所需的 5 张核心表
-- 执行方式：可在任何 SQL 客户端执行
-- ============================================

-- 开始创建数据中心核心表

-- ============================================
-- 1. 创建 data_sources 表 (数据源表)
-- ============================================
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('database', 'api', 'file', 'stream', 'other')),
    connection_type VARCHAR(50),
    connection_config JSONB,
    credentials_id UUID,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    owner VARCHAR(100),
    department VARCHAR(100),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER, -- 同步频率 (分钟)
    is_active BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX idx_data_sources_name ON data_sources(name);
CREATE INDEX idx_data_sources_type ON data_sources(source_type);
CREATE INDEX idx_data_sources_status ON data_sources(status);
CREATE INDEX idx_data_sources_owner ON data_sources(owner);
CREATE INDEX idx_data_sources_is_active ON data_sources(is_active);

-- 添加注释
COMMENT ON TABLE data_sources IS '数据源表 - 存储各种数据源的连接信息';
COMMENT ON COLUMN data_sources.source_type IS '数据源类型：database, api, file, stream, other';
COMMENT ON COLUMN data_sources.connection_config IS '连接配置 (JSON 格式),包含 host, port, database 等信息';
COMMENT ON COLUMN data_sources.credentials_id IS '关联的凭证 ID(存储在 n8n 或其他凭证管理系统)';

-- ============================================
-- 2. 创建 data_assets 表 (数据资产表)
-- ============================================
CREATE TABLE IF NOT EXISTS data_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('table', 'view', 'api', 'file', 'stream', 'report', 'dashboard')),
    category VARCHAR(100),
    sub_category VARCHAR(100),
    source_id UUID REFERENCES data_sources(id),
    schema_name VARCHAR(100),
    table_name VARCHAR(100),
    path VARCHAR(500), -- 文件或 API 路径
    format_type VARCHAR(50), -- 文件格式或 API 类型
    size_bytes BIGINT,
    record_count BIGINT,
    sensitivity_level VARCHAR(20) DEFAULT 'internal' CHECK (sensitivity_level IN ('public', 'internal', 'confidential', 'restricted')),
    quality_score DECIMAL(5,2) DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    business_owner VARCHAR(100),
    technical_owner VARCHAR(100),
    data_steward VARCHAR(100),
    department VARCHAR(100),
    tags TEXT[],
    business_tags TEXT[],
    technical_tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_quality_check_at TIMESTAMP WITH TIME ZONE,
    last_modified_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX idx_data_assets_code ON data_assets(asset_code);
CREATE INDEX idx_data_assets_name ON data_assets(name);
CREATE INDEX idx_data_assets_type ON data_assets(asset_type);
CREATE INDEX idx_data_assets_category ON data_assets(category);
CREATE INDEX idx_data_assets_source ON data_assets(source_id);
CREATE INDEX idx_data_assets_sensitivity ON data_assets(sensitivity_level);
CREATE INDEX idx_data_assets_quality ON data_assets(quality_score);
CREATE INDEX idx_data_assets_owner ON data_assets(business_owner);
CREATE INDEX idx_data_assets_is_active ON data_assets(is_active);

-- 添加注释
COMMENT ON TABLE data_assets IS '数据资产表 - 存储企业数据资产的元数据信息';
COMMENT ON COLUMN data_assets.asset_code IS '资产编码 (唯一标识符)';
COMMENT ON COLUMN data_assets.asset_type IS '资产类型：table, view, api, file, stream, report, dashboard';
COMMENT ON COLUMN data_assets.sensitivity_level IS '敏感级别：public, internal, confidential, restricted';
COMMENT ON COLUMN data_assets.quality_score IS '质量评分 (0-100)';

-- ============================================
-- 3. 创建 metadata_registry 表 (元数据注册表)
-- ============================================
CREATE TABLE IF NOT EXISTS metadata_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_code VARCHAR(100) NOT NULL UNIQUE,
    asset_id UUID REFERENCES data_assets(id),
    field_name VARCHAR(100) NOT NULL,
    field_display_name VARCHAR(255),
    field_type VARCHAR(50) NOT NULL,
    data_type VARCHAR(50),
    max_length INTEGER,
    precision INTEGER,
    scale INTEGER,
    is_nullable BOOLEAN DEFAULT true,
    is_primary_key BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    default_value TEXT,
    check_constraint TEXT,
    description TEXT,
    business_definition TEXT,
    calculation_logic TEXT,
    data_source VARCHAR(100),
    transformation_rule TEXT,
    validation_rule TEXT,
    sample_values TEXT[],
    related_fields UUID[],
    metadata JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 创建索引
CREATE INDEX idx_metadata_registry_code ON metadata_registry(registry_code);
CREATE INDEX idx_metadata_registry_asset ON metadata_registry(asset_id);
CREATE INDEX idx_metadata_registry_field_name ON metadata_registry(field_name);
CREATE INDEX idx_metadata_registry_type ON metadata_registry(field_type);
CREATE INDEX idx_metadata_registry_version ON metadata_registry(version);

-- 添加注释
COMMENT ON TABLE metadata_registry IS '元数据注册表 - 存储数据资产的字段级元数据';
COMMENT ON COLUMN metadata_registry.registry_code IS '注册编码 (唯一标识符)';
COMMENT ON COLUMN metadata_registry.field_type IS '字段类型：string, number, boolean, date, json, array 等';
COMMENT ON COLUMN metadata_registry.business_definition IS '业务定义和说明';
COMMENT ON COLUMN metadata_registry.transformation_rule IS '数据转换规则';

-- ============================================
-- 4. 创建 data_quality_rules 表 (数据质量规则表)
-- ============================================
CREATE TABLE IF NOT EXISTS data_quality_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code VARCHAR(100) NOT NULL UNIQUE,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('completeness', 'accuracy', 'consistency', 'timeliness', 'uniqueness', 'validity')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    target_asset_id UUID REFERENCES data_assets(id),
    target_field VARCHAR(100),
    rule_expression TEXT NOT NULL, -- SQL 表达式或规则定义
    threshold_value DECIMAL(10,2), -- 阈值
    threshold_operator VARCHAR(10) CHECK (threshold_operator IN ('>=', '<=', '=', '>', '<')),
    execution_schedule VARCHAR(50), -- Cron 表达式
    is_active BOOLEAN DEFAULT true,
    auto_fix_enabled BOOLEAN DEFAULT false,
    auto_fix_action TEXT,
    notification_enabled BOOLEAN DEFAULT false,
    notification_recipients TEXT[],
    last_executed_at TIMESTAMP WITH TIME ZONE,
    last_execution_result VARCHAR(20),
    last_error_message TEXT,
    execution_count INTEGER DEFAULT 0,
    pass_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 创建索引
CREATE INDEX idx_data_quality_rules_code ON data_quality_rules(rule_code);
CREATE INDEX idx_data_quality_rules_name ON data_quality_rules(rule_name);
CREATE INDEX idx_data_quality_rules_type ON data_quality_rules(rule_type);
CREATE INDEX idx_data_quality_rules_severity ON data_quality_rules(severity);
CREATE INDEX idx_data_quality_rules_asset ON data_quality_rules(target_asset_id);
CREATE INDEX idx_data_quality_rules_active ON data_quality_rules(is_active);

-- 添加注释
COMMENT ON TABLE data_quality_rules IS '数据质量规则表 - 存储数据质量检查规则';
COMMENT ON COLUMN data_quality_rules.rule_type IS '规则类型：completeness(完整性), accuracy(准确性), consistency(一致性), timeliness(及时性), uniqueness(唯一性), validity(有效性)';
COMMENT ON COLUMN data_quality_rules.rule_expression IS '规则表达式 (SQL 或其他规则语言)';
COMMENT ON COLUMN data_quality_rules.threshold_value IS '通过阈值';

-- ============================================
-- 5. 创建 data_lineage 表 (数据血缘表)
-- ============================================
CREATE TABLE IF NOT EXISTS data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lineage_code VARCHAR(100) NOT NULL UNIQUE,
    source_asset_id UUID REFERENCES data_assets(id),
    source_field VARCHAR(100),
    target_asset_id UUID REFERENCES data_assets(id),
    target_field VARCHAR(100),
    transformation_type VARCHAR(50) CHECK (transformation_type IN ('direct', 'calculation', 'aggregation', 'filter', 'join', 'derive', 'other')),
    transformation_logic TEXT,
    transformation_description TEXT,
    process_name VARCHAR(255), -- ETL 任务、工作流名称
    process_type VARCHAR(50), -- etl_job, sql_script, api, manual 等
    schedule_type VARCHAR(50), -- real_time, batch, on_demand
    frequency VARCHAR(50), -- daily, hourly, weekly 等
    dependency_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- 创建索引
CREATE INDEX idx_data_lineage_code ON data_lineage(lineage_code);
CREATE INDEX idx_data_lineage_source ON data_lineage(source_asset_id);
CREATE INDEX idx_data_lineage_target ON data_lineage(target_asset_id);
CREATE INDEX idx_data_lineage_process ON data_lineage(process_name);
CREATE INDEX idx_data_lineage_type ON data_lineage(transformation_type);
CREATE INDEX idx_data_lineage_active ON data_lineage(is_active);

-- 添加注释
COMMENT ON TABLE data_lineage IS '数据血缘表 - 追踪数据在系统中的流转和转换关系';
COMMENT ON COLUMN data_lineage.transformation_type IS '转换类型：direct(直接复制), calculation(计算), aggregation(聚合), filter(过滤), join(连接), derive(推导)';
COMMENT ON COLUMN data_lineage.process_name IS '处理过程名称 (如 ETL 任务名、工作流名)';
COMMENT ON COLUMN data_lineage.dependency_order IS '依赖顺序 (用于构建血缘图)';

-- ============================================
-- 创建完成提示
-- ============================================
-- ============================================
-- 创建完成提示
-- ============================================
-- 数据中心核心表创建完成!
-- 已创建的表:
--   1. data_sources - 数据源表
--   2. data_assets - 数据资产表
--   3. metadata_registry - 元数据注册表
--   4. data_quality_rules - 数据质量规则表
--   5. data_lineage - 数据血缘表
--
-- 下一步:
--   1. 运行 RLS 策略脚本启用行级安全
--   2. 插入基础数据
--   3. 验证表结构
