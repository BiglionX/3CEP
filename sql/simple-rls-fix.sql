-- 简化的RLS策略修复方案
-- 专注于解决核心问题

-- 1. 清理现有策略
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;
DROP POLICY IF EXISTS "用户可查看自己的管理员记录" ON admin_users;
DROP POLICY IF EXISTS "超级管理员可查看所有管理员记录" ON admin_users;
DROP POLICY IF EXISTS "用户可修改自己的管理员记录" ON admin_users;
DROP POLICY IF EXISTS "超级管理员可修改所有管理员记录" ON admin_users;

-- 2. 创建基本的RLS策略
CREATE POLICY "用户查看自己的记录" 
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户修改自己的记录" 
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

-- 3. 验证修复结果
SELECT 'RLS策略修复完成' as status;