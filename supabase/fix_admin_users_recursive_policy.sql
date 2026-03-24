-- ====================================================================
-- 修复 admin_users 表的无限递归 RLS 策略
-- ====================================================================

-- 1. 首先删除旧的导致递归的策略
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON public.admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON public.admin_users;

-- 2. 创建新的不递归的策略
-- 2.1 允许所有认证用户查看 admin_users 表
CREATE POLICY "认证用户可查看 admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (true);

-- 2.2 仅允许管理员修改（通过 session 变量检查）
CREATE POLICY "仅管理员可修改 admin_users"
  ON public.admin_users FOR ALL
  USING (
    -- 使用当前会话中的设置检查角色，避免查询表
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );

-- 3. 验证策略已创建
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- 4. 测试：尝试查询 admin_users 表
-- 注意：这需要您已经登录并且有适当的权限
-- SELECT * FROM admin_users LIMIT 5;
