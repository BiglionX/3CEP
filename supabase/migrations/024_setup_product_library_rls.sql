-- Phase 6.1: 产品库RLS策略配置
-- Migration: 024_setup_product_library_rls.sql
-- 创建时间: 2026-04-09
-- 版本: 1.0.0
--
-- 目标: 为 product_library schema 配置 RLS 策略和权限

-- ====================================================================
-- 第一部分：启用 RLS
-- ====================================================================

ALTER TABLE product_library.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.complete_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.product_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_library.data_audit_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 第二部分：创建公开读取策略（产品库是公开数据）
-- ====================================================================

-- 品牌库 - 允许所有人读取
CREATE POLICY "允许所有人读取品牌" ON product_library.brands
  FOR SELECT
  TO public
  USING (true);

-- 类目树 - 允许所有人读取
CREATE POLICY "允许所有人读取类目" ON product_library.categories
  FOR SELECT
  TO public
  USING (true);

-- 整机产品 - 允许所有人读取已发布的产品
CREATE POLICY "允许所有人读取已发布产品" ON product_library.complete_products
  FOR SELECT
  TO public
  USING (status = 'published');

-- 配件 - 允许所有人读取
CREATE POLICY "允许所有人读取配件" ON product_library.accessories
  FOR SELECT
  TO public
  USING (true);

-- 部件 - 允许所有人读取
CREATE POLICY "允许所有人读取部件" ON product_library.components
  FOR SELECT
  TO public
  USING (true);

-- 零件 - 允许所有人读取
CREATE POLICY "允许所有人读取零件" ON product_library.parts
  FOR SELECT
  TO public
  USING (true);

-- BOM关系 - 允许所有人读取
CREATE POLICY "允许所有人读取BOM关系" ON product_library.product_relations
  FOR SELECT
  TO public
  USING (true);

-- 导入任务 - 仅允许认证用户读取
CREATE POLICY "允许认证用户读取导入任务" ON product_library.import_jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- 审计日志 - 仅允许认证用户读取
CREATE POLICY "允许认证用户读取审计日志" ON product_library.data_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- ====================================================================
-- 第三部分：创建管理员写入策略
-- ====================================================================

-- 注意：这里假设有一个 admin role 或者通过 auth.jwt() 验证
-- 如果需要更严格的权限控制，可以基于用户角色或租户ID

-- 品牌库 - 允许认证用户写入（后续可以细化为管理员）
CREATE POLICY "允许认证用户管理品牌" ON product_library.brands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 类目树 - 允许认证用户写入
CREATE POLICY "允许认证用户管理类目" ON product_library.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 整机产品 - 允许认证用户写入
CREATE POLICY "允许认证用户管理产品" ON product_library.complete_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 配件 - 允许认证用户写入
CREATE POLICY "允许认证用户管理配件" ON product_library.accessories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 部件 - 允许认证用户写入
CREATE POLICY "允许认证用户管理部件" ON product_library.components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 零件 - 允许认证用户写入
CREATE POLICY "允许认证用户管理零件" ON product_library.parts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- BOM关系 - 允许认证用户写入
CREATE POLICY "允许认证用户管理BOM" ON product_library.product_relations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 导入任务 - 允许认证用户写入
CREATE POLICY "允许认证用户管理导入任务" ON product_library.import_jobs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 审计日志 - 仅允许系统写入（不允许手动修改）
-- 审计日志通常由触发器自动创建，不需要手动写入策略

-- ====================================================================
-- 第四部分：授予匿名访问权限（用于公开查询）
-- ====================================================================

-- 确保 anon role 可以读取产品库数据
GRANT USAGE ON SCHEMA product_library TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA product_library TO anon;

-- 确保 authenticated role 可以读写产品库数据
GRANT USAGE ON SCHEMA product_library TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA product_library TO authenticated;

-- 授予序列权限（如果有自增ID）
GRANT USAGE ON ALL SEQUENCES IN SCHEMA product_library TO authenticated;

-- ====================================================================
-- 完成
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 产品库 RLS 策略配置完成';
    RAISE NOTICE '   - 已启用所有表的 RLS';
    RAISE NOTICE '   - 已创建公开读取策略';
    RAISE NOTICE '   - 已创建认证用户写入策略';
    RAISE NOTICE '   - 已授予 anon 和 authenticated 权限';
END $$;
