-- Phase 6.3: 创建产品库查询函数
-- Migration: 026_create_product_library_query_functions.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 原因: Supabase REST API 不暴露 product_library schema
-- 目标: 创建 SQL 函数供 API 调用

-- ====================================================================
-- 第一部分：创建通用查询函数
-- ====================================================================

-- 获取品牌列表
CREATE OR REPLACE FUNCTION get_brands(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  logo_url TEXT,
  website_url TEXT,
  contact_email VARCHAR,
  api_key VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.logo_url,
    b.website_url,
    b.contact_email,
    b.api_key,
    b.is_active,
    b.created_at,
    b.updated_at,
    COUNT(*) OVER() as total_count
  FROM product_library.brands b
  WHERE (p_search = '' OR b.name ILIKE '%' || p_search || '%')
  ORDER BY b.created_at DESC
  LIMIT p_limit
  OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 第二部分：创建其他常用查询函数（可选）
-- ====================================================================

-- 获取单个品牌
CREATE OR REPLACE FUNCTION get_brand_by_id(p_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  logo_url TEXT,
  website_url TEXT,
  contact_email VARCHAR,
  api_key VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM product_library.brands WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 获取整机产品列表（支持分页、搜索、筛选）
CREATE OR REPLACE FUNCTION get_complete_products(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_brand_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sku_code VARCHAR,
  brand_id UUID,
  category_id UUID,
  name VARCHAR,
  description TEXT,
  specifications JSONB,
  images JSONB,
  status VARCHAR,
  data_source VARCHAR,
  source_reference VARCHAR,
  version INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  brand JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id, cp.sku_code, cp.brand_id, cp.category_id,
    cp.name, cp.description, cp.specifications, cp.images,
    cp.status, cp.data_source, cp.source_reference, cp.version,
    cp.created_at, cp.updated_at,
    -- Include brand info as JSON
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'slug', b.slug,
      'logo_url', b.logo_url
    ) as brand,
    COUNT(*) OVER() as total_count
  FROM product_library.complete_products cp
  LEFT JOIN product_library.brands b ON cp.brand_id = b.id
  WHERE (p_search = '' OR cp.name ILIKE '%' || p_search || '%' OR cp.sku_code ILIKE '%' || p_search || '%')
    AND (p_brand_id IS NULL OR cp.brand_id = p_brand_id)
    AND (p_status IS NULL OR cp.status = p_status)
  ORDER BY cp.created_at DESC
  LIMIT p_limit
  OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql;

-- 获取配件列表（支持分页、搜索、筛选）
CREATE OR REPLACE FUNCTION get_accessories(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_brand_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sku_code VARCHAR,
  brand_id UUID,
  name VARCHAR,
  description TEXT,
  compatible_products UUID[],
  specifications JSONB,
  created_at TIMESTAMPTZ,
  brand JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.sku_code, a.brand_id, a.name, a.description,
    a.compatible_products, a.specifications, a.created_at,
    -- Include brand info as JSON
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'slug', b.slug,
      'logo_url', b.logo_url
    ) as brand,
    COUNT(*) OVER() as total_count
  FROM product_library.accessories a
  LEFT JOIN product_library.brands b ON a.brand_id = b.id
  WHERE (p_search = '' OR a.name ILIKE '%' || p_search || '%' OR a.sku_code ILIKE '%' || p_search || '%')
    AND (p_brand_id IS NULL OR a.brand_id = p_brand_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql;

-- 获取部件列表（支持分页、搜索、筛选）
CREATE OR REPLACE FUNCTION get_components(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_brand_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sku_code VARCHAR,
  brand_id UUID,
  name VARCHAR,
  type VARCHAR,
  description TEXT,
  specifications JSONB,
  created_at TIMESTAMPTZ,
  brand JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.sku_code, c.brand_id, c.name, c.type, c.description,
    c.specifications, c.created_at,
    -- Include brand info as JSON
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'slug', b.slug,
      'logo_url', b.logo_url
    ) as brand,
    COUNT(*) OVER() as total_count
  FROM product_library.components c
  LEFT JOIN product_library.brands b ON c.brand_id = b.id
  WHERE (p_search = '' OR c.name ILIKE '%' || p_search || '%' OR c.sku_code ILIKE '%' || p_search || '%')
    AND (p_brand_id IS NULL OR c.brand_id = p_brand_id)
    AND (p_type IS NULL OR c.type = p_type)
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql;

-- 获取零件列表（支持分页、搜索、筛选）
CREATE OR REPLACE FUNCTION get_parts(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search TEXT DEFAULT '',
  p_brand_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sku_code VARCHAR,
  brand_id UUID,
  name VARCHAR,
  type VARCHAR,
  description TEXT,
  specifications JSONB,
  material VARCHAR,
  dimensions JSONB,
  created_at TIMESTAMPTZ,
  brand JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.sku_code, p.brand_id, p.name, p.type, p.description,
    p.specifications, p.material, p.dimensions, p.created_at,
    -- Include brand info as JSON
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'slug', b.slug,
      'logo_url', b.logo_url
    ) as brand,
    COUNT(*) OVER() as total_count
  FROM product_library.parts p
  LEFT JOIN product_library.brands b ON p.brand_id = b.id
  WHERE (p_search = '' OR p.name ILIKE '%' || p_search || '%' OR p.sku_code ILIKE '%' || p_search || '%')
    AND (p_brand_id IS NULL OR p.brand_id = p_brand_id)
    AND (p_type IS NULL OR p.type = p_type)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 产品库查询函数创建完成';
    RAISE NOTICE '   - get_brands(page, limit, search)';
    RAISE NOTICE '   - get_brand_by_id(id)';
    RAISE NOTICE '   - get_complete_products(page, limit, search, brand_id, status)';
    RAISE NOTICE '   - get_accessories(page, limit, search, brand_id)';
    RAISE NOTICE '   - get_components(page, limit, search, brand_id, type)';
    RAISE NOTICE '   - get_parts(page, limit, search, brand_id, type)';
END $$;
