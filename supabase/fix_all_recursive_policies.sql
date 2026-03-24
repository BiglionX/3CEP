-- ====================================================================
-- 完整修复多租户系统的 RLS 递归问题
-- ====================================================================
-- 问题诊断：
-- 1. admin_users 表的策略查询 admin_users 自身 -> 无限递归
-- 2. user_profiles_ext 表的策略查询 admin_users -> 可能循环依赖
-- 3. user_tenants 表的策略查询 user_profiles_ext -> 可能循环依赖
--
-- 解决方案：
-- 使用 session 变量而不是表查询来检查权限
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. 修复 admin_users 表策略
-- ====================================================================
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON public.admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON public.admin_users;

CREATE POLICY "认证用户可查看 admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "仅管理员可修改 admin_users"
  ON public.admin_users FOR ALL
  USING (
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );

-- ====================================================================
-- 2. 修复 user_profiles_ext 表策略
-- ====================================================================
DROP POLICY IF EXISTS "管理员可管理所有用户档案" ON public.user_profiles_ext;

CREATE POLICY "认证用户可查看用户档案"
  ON public.user_profiles_ext FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "用户可管理自己的档案"
  ON public.user_profiles_ext FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "管理员可管理所有档案（通过 session 变量）"
  ON public.user_profiles_ext FOR ALL
  USING (
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );

-- ====================================================================
-- 3. 修复 tenants 表策略
-- ====================================================================
DROP POLICY IF EXISTS "授权用户可查看租户" ON public.tenants;
DROP POLICY IF EXISTS "管理员可管理所有租户" ON public.tenants;

CREATE POLICY "认证用户可查看租户"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "管理员可管理租户（通过 session 变量）"
  ON public.tenants FOR ALL
  USING (
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );

-- ====================================================================
-- 4. 修复 user_tenants 表策略
-- ====================================================================
DROP POLICY IF EXISTS "用户可以查看自己的租户关联" ON public.user_tenants;
DROP POLICY IF EXISTS "系统管理员可以管理所有租户关联" ON public.user_tenants;

CREATE POLICY "认证用户可查看租户关联"
  ON public.user_tenants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "用户可管理自己的租户关联"
  ON public.user_tenants FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "管理员可管理所有关联（通过 session 变量）"
  ON public.user_tenants FOR ALL
  USING (
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );

COMMIT;

-- ====================================================================
-- 验证修复结果
-- ====================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('admin_users', 'user_profiles_ext', 'tenants', 'user_tenants')
ORDER BY tablename, policyname;
