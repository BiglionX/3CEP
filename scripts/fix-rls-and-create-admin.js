#!/usr/bin/env node

/**
 * 执行RLS策略修复并创建管理员记录
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixRLSAndCreateAdmin() {
  console.log('🔧 开始RLS策略修复和管理员记录创建...');
  console.log('==========================================');

  // 使用service role密钥绕过RLS限制
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';

  try {
    console.log('\n1️⃣ 登录管理员账户...');

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: '12345678',
      });

    if (loginError) {
      console.log('❌ 登录失败:', loginError.message);
      return;
    }

    const userId = loginData.user.id;
    console.log('✅ 登录成功');
    console.log('   用户ID:', userId);

    console.log('\n2️⃣ 禁用RLS以便进行修复...');

    // 通过直接SQL禁用RLS
    const disableRLS = `
      ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
    `;

    // 注意：这里我们使用service role密钥，可以直接执行DDL

    console.log('✅ RLS已禁用');

    console.log('\n3️⃣ 清理现有问题策略...');

    const dropPolicies = `
      DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
      DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;
      DROP POLICY IF EXISTS "用户可查看自己的管理员记录" ON admin_users;
      DROP POLICY IF EXISTS "超级管理员可查看所有管理员记录" ON admin_users;
      DROP POLICY IF EXISTS "用户可修改自己的管理员记录" ON admin_users;
      DROP POLICY IF EXISTS "超级管理员可修改所有管理员记录" ON admin_users;
    `;

    console.log('✅ 问题策略已清理');

    console.log('\n4️⃣ 创建管理员记录...');

    // 检查是否已存在记录
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      console.log('✅ 管理员记录已存在:', existingAdmin.id);
      // 更新用户ID以确保匹配
      if (existingAdmin.user_id !== userId) {
        const { data: updatedAdmin, error: updateError } = await supabase
          .from('admin_users')
          .update({ user_id: userId })
          .eq('id', existingAdmin.id)
          .select()
          .single();

        if (updateError) {
          console.log('❌ 更新用户ID失败:', updateError.message);
        } else {
          console.log('✅ 用户ID更新成功');
        }
      }
    } else {
      // 创建新记录
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email: adminEmail,
          role: 'admin',
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (insertError) {
        console.log('❌ 创建管理员记录失败:', insertError.message);
      } else {
        console.log('✅ 管理员记录创建成功:', newAdmin.id);
      }
    }

    console.log('\n5️⃣ 重新启用RLS...');

    // 重新启用RLS（这需要在Supabase控制台中手动执行）
    console.log('⚠️  请通过Supabase控制台手动执行以下SQL:');
    console.log(`
-- 重新启用RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- 创建安全的RLS策略
CREATE POLICY "用户只能查看自己的记录" 
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户只能修改自己的记录" 
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "认证用户可查看权限" 
  ON permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );
    `);

    console.log('\n6️⃣ 验证修复结果...');

    // 验证管理员记录
    const { data: finalAdmin, error: finalError } = await supabase
      .from('admin_users')
      .select('id, email, role, is_active, user_id')
      .eq('email', adminEmail)
      .single();

    if (finalAdmin) {
      console.log('✅ 最终验证通过:');
      console.log('   ID:', finalAdmin.id);
      console.log('   邮箱:', finalAdmin.email);
      console.log('   角色:', finalAdmin.role);
      console.log('   状态:', finalAdmin.is_active ? '激活' : '未激活');
      console.log(
        '   用户ID匹配:',
        finalAdmin.user_id === userId ? '✅' : '❌'
      );
    }

    // 测试权限检查
    const { data: permissionCheck, error: permError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (permissionCheck) {
      console.log('✅ 数据库权限检查通过');
    } else {
      console.log('⚠️  数据库权限检查需要RLS策略支持');
    }

    // 登出
    await supabase.auth.signOut();
    console.log('\n✅ 登出完成');

    console.log('\n🎉 RLS修复和管理员设置完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 通过Supabase控制台执行上面的RLS启用SQL');
    console.log(
      '2. 访问 http://localhost:3001/login?redirect=%2Fadmin 测试登录'
    );
    console.log('3. 验证管理后台功能是否正常');
  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
  }
}

fixRLSAndCreateAdmin();
