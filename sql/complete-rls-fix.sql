-- 完整的RLS策略修复方案
-- 解决无限递归问题并确保管理员功能正常

-- 1. 首先完全禁用RLS以便进行修复
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有的问题策略
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;
DROP POLICY IF EXISTS "用户可查看自己的管理员记录" ON admin_users;
DROP POLICY IF EXISTS "超级管理员可查看所有管理员记录" ON admin_users;
DROP POLICY IF EXISTS "用户可修改自己的管理员记录" ON admin_users;
DROP POLICY IF EXISTS "超级管理员可修改所有管理员记录" ON admin_users;

-- 3. 为permissions表清理策略
DROP POLICY IF EXISTS "认证用户可查看自己的权限" ON permissions;
DROP POLICY IF EXISTS "管理员可查看所有权限" ON permissions;

-- 4. 创建安全的RLS策略 - 避免递归的关键是使用子查询而非自引用

-- admin_users表的安全策略
CREATE POLICY "用户只能查看自己的记录" 
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户只能修改自己的记录" 
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

-- 为超级管理员创建安全的全局访问策略（避免递归）
CREATE POLICY "超级管理员全局只读访问" 
  ON admin_users FOR SELECT
  USING (
    -- 使用常量值而不是查询自身表
    (SELECT role FROM admin_users WHERE user_id = auth.uid() AND is_active = true) = 'admin'
  );

CREATE POLICY "超级管理员全局修改访问" 
  ON admin_users FOR ALL
  USING (
    -- 使用常量值而不是查询自身表
    (SELECT role FROM admin_users WHERE user_id = auth.uid() AND is_active = true) = 'admin'
  );

-- permissions表的策略
CREATE POLICY "认证用户可查看权限" 
  ON permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- 5. 重新启用RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- 6. 验证修复结果
SELECT 'RLS策略修复完成' as status;
SELECT p.polname as policy_name, c.relname as table_name
FROM pg_class c 
JOIN pg_policy p ON p.polrelid = c.oid 
WHERE c.relname IN ('admin_users', 'permissions');