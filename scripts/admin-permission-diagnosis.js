#!/usr/bin/env node

/**
 * 管理员权限诊断脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 管理员权限诊断\n');

// 1. 检查数据库中的管理员用户
console.log('1️⃣ 数据库管理员用户检查');

const adminUsersQuery = `
SELECT 
  id,
  user_id,
  email,
  role,
  is_active,
  created_at,
  updated_at
FROM admin_users 
WHERE email = '1055603323@qq.com' OR user_id IS NOT NULL;
`;

console.log('需要执行的SQL查询:');
console.log(adminUsersQuery);

// 2. 检查Supabase用户信息
console.log('\n2️⃣ Supabase用户信息检查');

const supabaseUserInfo = `
-- 获取Supabase用户信息
SELECT 
  id,
  email,
  created_at,
  updated_at
FROM auth.users 
WHERE email = '1055603323@qq.com';
`;

console.log('Supabase用户查询:');
console.log(supabaseUserInfo);

// 3. 创建诊断指南
console.log('\n3️⃣ 诊断步骤指南');

const diagnosisGuide = `
管理员权限问题诊断步骤:

1. 检查数据库表结构:
   - 确认 admin_users 表存在
   - 确认字段: id, user_id, email, role, is_active

2. 检查数据关联:
   - 用户在 auth.users 表中的 id 是否与 admin_users.user_id 匹配
   - 如果 user_id 为空，需要手动关联

3. 常见问题解决方案:
   ✅ 方案A: 手动插入管理员记录
      INSERT INTO admin_users (email, role, is_active, user_id) 
      VALUES ('1055603323@qq.com', 'admin', true, '用户ID');

   ✅ 方案B: 更新现有记录
      UPDATE admin_users SET is_active = true WHERE email = '1055603323@qq.com';

   ✅ 方案C: 使用管理API创建
      POST /api/admin/users 创建管理员用户

4. 验证修复:
   - 重新登录测试
   - 访问统一认证测试页面验证
`;

console.log(diagnosisGuide);

// 4. 提供快速修复命令
console.log('\n4️⃣ 快速修复命令');

console.log('如果确定用户应该为管理员，可以运行以下SQL:');
console.log(`
-- 快速修复: 确保用户是管理员
INSERT INTO admin_users (email, role, is_active, user_id)
SELECT 
  '1055603323@qq.com',
  'admin',
  true,
  id
FROM auth.users 
WHERE email = '1055603323@qq.com'
ON CONFLICT (email) DO UPDATE 
SET 
  is_active = true,
  role = 'admin',
  updated_at = NOW();
`);

console.log('\n5️⃣ 预期修复效果');
console.log('• 管理员权限应显示为 ✅ 管理员');
console.log('• 权限检查应返回有权限');
console.log('• 可正常访问管理后台');

console.log('\n✅ 管理员权限诊断准备完成！');
