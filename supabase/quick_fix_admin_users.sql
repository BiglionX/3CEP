-- =====================================================
-- 快速修复 admin_users 表的无限递归问题
-- 执行时间：< 1 分钟
-- =====================================================

BEGIN;

-- 删除导致递归的旧策略
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON public.admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON public.admin_users;

-- 创建新的不递归的策略
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

COMMIT;

-- 验证修复
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- 测试查询（应该不再报错）
-- SELECT COUNT(*) FROM admin_users;
