#!/usr/bin/env node

/**
 * 完整的管理员表结构修复和验证脚本
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function completeAdminSetup() {
  console.log('🔧 开始完整的管理员表结构修复...');
  console.log('=====================================');

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
    console.log('   邮箱:', adminEmail);

    console.log('\n2️⃣ 检查现有管理员记录...');

    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      console.log('✅ 找到现有管理员记录:', existingAdmin.id);
      console.log('   角色:', existingAdmin.role);
      console.log('   状态:', existingAdmin.is_active ? '激活' : '未激活');

      // 更新用户ID（如果需要）
      if (existingAdmin.user_id !== userId) {
        console.log('\n3️⃣ 更新用户ID匹配...');
        const { data: updatedAdmin, error: updateError } = await supabase
          .from('admin_users')
          .update({ user_id: userId })
          .eq('id', existingAdmin.id)
          .select()
          .single();

        if (updateError) {
          console.log('❌ 更新失败:', updateError.message);
        } else {
          console.log('✅ 用户ID更新成功');
        }
      }
    } else {
      console.log('❌ 未找到管理员记录，创建新记录...');

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
        console.log('❌ 创建记录失败:', insertError.message);
      } else {
        console.log('✅ 新管理员记录创建成功:', newAdmin.id);
      }
    }

    console.log('\n4️⃣ 验证权限检查功能...');

    // 测试会话检查API
    try {
      const sessionResponse = await fetch(
        'http://localhost:3001/api/auth/check-session',
        {
          method: 'GET',
          headers: {
            Cookie: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${JSON.stringify(loginData.session)}`,
          },
        }
      );

      const sessionData = await sessionResponse.json();

      if (sessionData.authenticated) {
        console.log('✅ 会话检查API工作正常');
        console.log('   管理员身份:', sessionData.user.isAdmin);
        console.log('   角色:', sessionData.user.role);
      } else {
        console.log('❌ 会话检查API返回未认证');
      }
    } catch (apiError) {
      console.log('❌ 会话检查API测试失败:', apiError.message);
    }

    console.log('\n5️⃣ 测试登录重定向...');

    // 测试登录API
    try {
      const loginResponse = await fetch(
        'http://localhost:3001/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: adminEmail,
            password: '12345678',
          }),
        }
      );

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        console.log('✅ 登录API工作正常');
        console.log('   管理员身份:', loginResult.user?.isAdmin);
      } else {
        console.log('❌ 登录API失败:', loginResult.error);
      }
    } catch (loginError) {
      console.log('❌ 登录API测试失败:', loginError.message);
    }

    // 登出
    await supabase.auth.signOut();
    console.log('\n✅ 登出完成');

    console.log('\n🎉 管理员表结构修复完成！');
    console.log('\n📋 下一步建议:');
    console.log(
      '1. 访问 http://localhost:3001/login?redirect=%2Fadmin 测试登录'
    );
    console.log('2. 验证能否正常进入管理后台');
    console.log(
      '3. 如果仍有RLS问题，需要通过Supabase控制台执行sql/fix-admin-users-rls.sql'
    );
  } catch (error) {
    console.error('\n❌ 修复过程中发生错误:', error.message);
  }
}

completeAdminSetup();
