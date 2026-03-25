-- 为当前用户添加 Skill 商店访问权限
-- 创建时间：2026-03-25
-- 用途：快速修复权限问题

-- 方法 1: 为特定邮箱添加 admin 角色
-- 请将 'your-email@example.com' 替换为您的实际邮箱
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{roles}',
  '["admin", "manager", "marketplace_admin"]'::jsonb
)
WHERE email = 'your-email@example.com';

-- 方法 2: 如果使用的是测试账号或开发环境
-- 可以直接更新第一个找到的用户
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{roles}',
--   '["admin", "manager", "marketplace_admin"]'::jsonb
-- )
-- WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- 验证更新结果
SELECT
  id,
  email,
  raw_user_meta_data->'roles' as roles,
  updated_at
FROM auth.users
WHERE email = 'your-email@example.com';
