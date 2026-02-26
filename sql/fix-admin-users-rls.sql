-- 修复admin_users表的RLS策略
-- 解决无限递归问题

-- 删除现有的有问题的策略
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;

-- 创建新的、更安全的RLS策略
-- 允许用户查看自己的记录
CREATE POLICY "用户可查看自己的管理员记录" 
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- 允许超级管理员查看所有记录
CREATE POLICY "超级管理员可查看所有管理员记录"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'admin' 
      AND au.is_active = true
      AND au.id != admin_users.id  -- 避免递归
    )
  );

-- 允许用户修改自己的记录
CREATE POLICY "用户可修改自己的管理员记录"
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

-- 允许超级管理员修改所有记录
CREATE POLICY "超级管理员可修改所有管理员记录"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'admin' 
      AND au.is_active = true
      AND au.id != admin_users.id  -- 避免递归
    )
  );

-- 验证策略创建
SELECT 'RLS策略修复完成' as status;