-- Phase 6.2: 将产品库表移动到 public schema
-- Migration: 025_move_product_library_to_public.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 原因: Supabase REST API 默认只暴露 public schema
-- 目标: 将所有 product_library 表移动到 public schema

-- ====================================================================
-- 第一步：重命名表到 public schema
-- ====================================================================

-- 品牌库
ALTER TABLE product_library.brands SET SCHEMA public;
ALTER TABLE public.brands RENAME TO pl_brands;

-- 类目树
ALTER TABLE product_library.categories SET SCHEMA public;
ALTER TABLE public.categories RENAME TO pl_categories;

-- 整机产品
ALTER TABLE product_library.complete_products SET SCHEMA public;
ALTER TABLE public.complete_products RENAME TO pl_complete_products;

-- 配件
ALTER TABLE product_library.accessories SET SCHEMA public;
ALTER TABLE public.accessories RENAME TO pl_accessories;

-- 部件
ALTER TABLE product_library.components SET SCHEMA public;
ALTER TABLE public.components RENAME TO pl_components;

-- 零件
ALTER TABLE product_library.parts SET SCHEMA public;
ALTER TABLE public.parts RENAME TO pl_parts;

-- BOM关系
ALTER TABLE product_library.product_relations SET SCHEMA public;
ALTER TABLE public.product_relations RENAME TO pl_product_relations;

-- 导入任务
ALTER TABLE product_library.import_jobs SET SCHEMA public;
ALTER TABLE public.import_jobs RENAME TO pl_import_jobs;

-- 审计日志
ALTER TABLE product_library.data_audit_logs SET SCHEMA public;
ALTER TABLE public.data_audit_logs RENAME TO pl_data_audit_logs;

-- ====================================================================
-- 第二步：更新外键约束和索引（如果需要）
-- ====================================================================

-- 注意：PostgreSQL 会自动处理大部分依赖关系
-- 但可能需要手动更新一些引用

-- ====================================================================
-- 第三步：更新 RLS 策略
-- ====================================================================

-- 删除旧的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "允许所有人读取品牌" ON public.pl_brands;
DROP POLICY IF EXISTS "允许认证用户管理品牌" ON public.pl_brands;

-- 重新创建 RLS 策略
ALTER TABLE public.pl_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人读取品牌" ON public.pl_brands
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "允许认证用户管理品牌" ON public.pl_brands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 产品库表已移动到 public schema';
    RAISE NOTICE '   - 所有表现在使用 pl_ 前缀';
    RAISE NOTICE '   - brands → pl_brands';
    RAISE NOTICE '   - categories → pl_categories';
    RAISE NOTICE '   - complete_products → pl_complete_products';
    RAISE NOTICE '   - accessories → pl_accessories';
    RAISE NOTICE '   - components → pl_components';
    RAISE NOTICE '   - parts → pl_parts';
    RAISE NOTICE '   - product_relations → pl_product_relations';
    RAISE NOTICE '   - import_jobs → pl_import_jobs';
    RAISE NOTICE '   - data_audit_logs → pl_data_audit_logs';
END $$;
