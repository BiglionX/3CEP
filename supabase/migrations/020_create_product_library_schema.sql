-- Product Library Schema - 产品库数据库设计
-- Migration: 020_create_product_library_schema.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 设计理念：
-- 1. 产品库：公开标准数据源（行业统一）
-- 2. 进销存：私有库存管理（租户隔离）
-- 3. 溯源码：独立插件（SKU级别追踪）
--
-- 并行运行策略：
-- - 保留现有 brands, products 表（不影响现有功能）
-- - 新建 product_library schema（新模块使用）
-- - 逐步迁移数据

-- ====================================================================
-- 第一部分：创建 Schema
-- ====================================================================

CREATE SCHEMA IF NOT EXISTS product_library;

-- ====================================================================
-- 第二部分：品牌库
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  contact_email VARCHAR(255),
  api_key VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第三部分：产品类目树
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_library.categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  path VARCHAR(500) NOT NULL, -- /整机/电脑/笔记本
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第四部分：整机库
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.complete_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID REFERENCES product_library.brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_library.categories(id) ON DELETE SET NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft', -- 'draft' | 'published' | 'deprecated'
  data_source VARCHAR(50) DEFAULT 'official', -- 'official' | 'imported' | 'user_contributed'
  source_reference VARCHAR(500),
  version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_product_status CHECK (status IN ('draft', 'published', 'deprecated')),
  CONSTRAINT chk_data_source CHECK (data_source IN ('official', 'imported', 'user_contributed'))
);

-- ====================================================================
-- 第五部分：配件库
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID REFERENCES product_library.brands(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  compatible_products UUID[] DEFAULT '{}', -- 兼容的产品ID列表
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第六部分：部件库
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID REFERENCES product_library.brands(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100), -- 'cpu', 'memory', 'storage', 'motherboard', etc.
  description TEXT,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第七部分：零件库
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID REFERENCES product_library.brands(id) ON DELETE SET NULL,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100), -- 'screw', 'resistor', 'capacitor', etc.
  description TEXT,
  specifications JSONB DEFAULT '{}',
  material VARCHAR(200),
  dimensions JSONB, -- {length, width, height, unit}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第八部分：产品关联关系（BOM）
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id UUID REFERENCES product_library.complete_products(id) ON DELETE CASCADE,
  child_product_id UUID NOT NULL, -- 可以指向配件、部件或零件
  relation_type VARCHAR(50) NOT NULL, -- 'includes' | 'compatible' | 'accessory' | 'component_of' | 'part_of'
  quantity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_relation_type CHECK (relation_type IN ('includes', 'compatible', 'accessory', 'component_of', 'part_of'))
);

-- ====================================================================
-- 第九部分：导入任务记录
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL, -- 'csv' | 'excel' | 'api'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  total_records INT DEFAULT 0,
  processed_records INT DEFAULT 0,
  success_records INT DEFAULT 0,
  failed_records INT DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_import_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- ====================================================================
-- 第十部分：数据审核日志
-- ====================================================================

CREATE TABLE IF NOT EXISTS product_library.data_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(50) NOT NULL, -- 'brand' | 'product' | 'accessory' | 'component' | 'part'
  product_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create' | 'update' | 'delete' | 'import' | 'publish'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID, -- 操作员ID
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第十一部分：索引优化
-- ====================================================================

-- 品牌索引
CREATE INDEX IF NOT EXISTS idx_pl_brands_slug ON product_library.brands(slug);
CREATE INDEX IF NOT EXISTS idx_pl_brands_api_key ON product_library.brands(api_key);
CREATE INDEX IF NOT EXISTS idx_pl_brands_is_active ON product_library.brands(is_active);

-- 类目索引
CREATE INDEX IF NOT EXISTS idx_pl_categories_parent_id ON product_library.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_pl_categories_path ON product_library.categories(path);

-- 整机库索引
CREATE INDEX IF NOT EXISTS idx_pl_products_sku ON product_library.complete_products(sku_code);
CREATE INDEX IF NOT EXISTS idx_pl_products_brand_id ON product_library.complete_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_pl_products_category_id ON product_library.complete_products(category_id);
CREATE INDEX IF NOT EXISTS idx_pl_products_status ON product_library.complete_products(status);
CREATE INDEX IF NOT EXISTS idx_pl_products_data_source ON product_library.complete_products(data_source);

-- 配件库索引
CREATE INDEX IF NOT EXISTS idx_pl_accessories_sku ON product_library.accessories(sku_code);
CREATE INDEX IF NOT EXISTS idx_pl_accessories_brand_id ON product_library.accessories(brand_id);

-- 部件库索引
CREATE INDEX IF NOT EXISTS idx_pl_components_sku ON product_library.components(sku_code);
CREATE INDEX IF NOT EXISTS idx_pl_components_brand_id ON product_library.components(brand_id);
CREATE INDEX IF NOT EXISTS idx_pl_components_type ON product_library.components(type);

-- 零件库索引
CREATE INDEX IF NOT EXISTS idx_pl_parts_sku ON product_library.parts(sku_code);
CREATE INDEX IF NOT EXISTS idx_pl_parts_brand_id ON product_library.parts(brand_id);
CREATE INDEX IF NOT EXISTS idx_pl_parts_type ON product_library.parts(type);

-- BOM关系索引
CREATE INDEX IF NOT EXISTS idx_pl_relations_parent ON product_library.product_relations(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_pl_relations_child ON product_library.product_relations(child_product_id);
CREATE INDEX IF NOT EXISTS idx_pl_relations_type ON product_library.product_relations(relation_type);

-- ====================================================================
-- 第十二部分：更新时间触发器
-- ====================================================================

CREATE OR REPLACE FUNCTION product_library.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pl_brands_updated_at
    BEFORE UPDATE ON product_library.brands
    FOR EACH ROW
    EXECUTE FUNCTION product_library.update_updated_at_column();

CREATE TRIGGER update_pl_products_updated_at
    BEFORE UPDATE ON product_library.complete_products
    FOR EACH ROW
    EXECUTE FUNCTION product_library.update_updated_at_column();

-- ====================================================================
-- 第十三部分：全文搜索支持（Phase 9）
-- ====================================================================

-- 为整机库添加全文搜索
ALTER TABLE product_library.complete_products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(sku_code, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS idx_pl_products_search ON product_library.complete_products USING gin(search_vector);

-- ====================================================================
-- 第十四部分：添加注释
-- ====================================================================

COMMENT ON SCHEMA product_library IS '产品库Schema - 行业标准产品主数据库';

COMMENT ON TABLE product_library.brands IS '品牌库 - 产品品牌信息';
COMMENT ON TABLE product_library.categories IS '产品类目树 - 多级分类体系';
COMMENT ON TABLE product_library.complete_products IS '整机库 - 完整产品（如电脑、手机等）';
COMMENT ON TABLE product_library.accessories IS '配件库 - 产品配件（如充电器、保护壳等）';
COMMENT ON TABLE product_library.components IS '部件库 - 产品部件（如CPU、内存、硬盘等）';
COMMENT ON TABLE product_library.parts IS '零件库 - 最小物理单元（如螺丝、电阻、电容等）';
COMMENT ON TABLE product_library.product_relations IS '产品关联关系 - BOM物料清单';
COMMENT ON TABLE product_library.import_jobs IS '导入任务记录 - 批量数据导入';
COMMENT ON TABLE product_library.data_audit_logs IS '数据审核日志 - 数据变更追踪';

-- ====================================================================
-- 完成
-- ====================================================================
