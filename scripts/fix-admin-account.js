#!/usr/bin/env node

/**
 * 修复管理员账户邮箱确认问题
 * 直接通过Supabase管理API设置已存在的用户为管理员
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixAdminAccount() {
  console.log('🔧 修复管理员账户邮箱确认问题...');
  console.log('=====================================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';

  try {
    console.log(`\n1️⃣ 查找用户: ${adminEmail}`);

    // 通过邮箱查找用户
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ 获取用户列表失败:', listError.message);
      throw listError;
    }

    const targetUser = users.users.find(user => user.email === adminEmail);

    if (!targetUser) {
      console.log('❌ 未找到目标用户，尝试重新创建...');

      // 重新创建用户并直接确认邮箱
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: '12345678',
          email_confirm: true,
          user_metadata: {
            name: '超级管理员',
            role: 'admin',
            isAdmin: true,
          },
        });

      if (createError) {
        console.error('❌ 创建用户失败:', createError.message);
        throw createError;
      }

      console.log('✅ 用户已创建并邮箱已确认');
      console.log('用户ID:', newUser.user.id);
    } else {
      console.log('✅ 找到用户:', targetUser.id);
      console.log(
        '当前邮箱确认状态:',
        targetUser.email_confirmed_at ? '已确认' : '未确认'
      );

      // 更新用户为管理员并确认邮箱
      const { data: updatedUser, error: updateError } =
        await supabase.auth.admin.updateUserById(targetUser.id, {
          email_confirm: true,
          user_metadata: {
            name: '超级管理员',
            role: 'admin',
            isAdmin: true,
          },
        });

      if (updateError) {
        console.error('❌ 更新用户失败:', updateError.message);
        throw updateError;
      }

      console.log('✅ 用户已更新为管理员，邮箱已确认');
    }

    console.log(`\n2️⃣ 验证修复结果...`);

    // 再次获取用户信息验证
    const { data: finalUsers, error: finalError } =
      await supabase.auth.admin.listUsers();

    if (finalError) {
      console.error('❌ 验证失败:', finalError.message);
      return;
    }

    const verifiedUser = finalUsers.users.find(
      user => user.email === adminEmail
    );

    if (verifiedUser) {
      console.log('\n✅ 修复验证成功！');
      console.log('📋 用户信息:');
      console.log(`   邮箱: ${verifiedUser.email}`);
      console.log(`   ID: ${verifiedUser.id}`);
      console.log(
        `   邮箱确认: ${verifiedUser.email_confirmed_at ? '✅ 已确认' : '❌ 未确认'}`
      );
      console.log(`   角色: ${verifiedUser.user_metadata?.role || '未设置'}`);
      console.log(
        `   管理员: ${verifiedUser.user_metadata?.isAdmin ? '✅ 是' : '❌ 否'}`
      );

      console.log('\n🔐 登录信息:');
      console.log(`   登录地址: http://localhost:3001/login?redirect=%2Fadmin`);
      console.log(`   邮箱: ${adminEmail}`);
      console.log(`   密码: 12345678`);

      console.log('\n🧪 测试登录...');

      // 测试登录
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: '12345678',
        });

        if (error) {
          console.log('⚠️  登录测试失败:', error.message);
          if (error.message.includes('email_not_confirmed')) {
            console.log('💡 可能需要手动在Supabase控制台确认邮箱');
          }
        } else {
          console.log('✅ 登录测试成功！');
          console.log('用户会话已建立');

          // 登出测试用户
          await supabase.auth.signOut();
          console.log('✅ 已安全登出测试用户');
        }
      } catch (loginError) {
        console.log('⚠️  登录测试异常:', loginError.message);
      }
    } else {
      console.log('❌ 验证失败：用户未找到');
    }

    console.log('\n🎉 管理员账户修复完成！');
    console.log('现在可以正常使用管理员账户进行端到端测试。');
  } catch (error) {
    console.error('\n❌ 修复过程中发生错误:', error.message);
    console.error('详细错误:', error);

    console.log('\n💡 备用解决方案:');
    console.log('1. 登录Supabase控制台');
    console.log('2. 进入Authentication > Users');
    console.log('3. 找到用户 1055603323@qq.com');
    console.log('4. 点击"Confirm email"按钮');
    console.log('5. 或删除该用户后重新创建');

    process.exit(1);
  }
}

// 执行修复
fixAdminAccount();
