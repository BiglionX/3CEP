#!/usr/bin/env node

/**
 * 执行终极解决方案：重建管理员表以彻底解决RLS问题
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function ultimateSolution() {
  console.log('🚀 执行终极解决方案：重建管理员表');
  console.log('====================================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';

  try {
    console.log('\n1️⃣ 登录管理员账户获取用户ID...');

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
    console.log('✅ 获取到用户ID:', userId);

    // 登出
    await supabase.auth.signOut();

    console.log('\n2️⃣ 请通过Supabase控制台执行重建脚本...');
    console.log('📄 文件路径: sql/simple-rls-fix.sql (快速修复)');
    console.log('📄 或者: sql/rebuild-admin-tables.sql (完全重建)');
    console.log('\n建议先尝试快速修复，如果仍有问题再执行完全重建');

    // 等待用户手动执行SQL
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('SQL执行完成了吗？(按回车继续)', async () => {
      rl.close();

      console.log('\n3️⃣ 验证重建结果...');

      try {
        // 重新登录验证
        const { data: newLoginData, error: newLoginError } =
          await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: '12345678',
          });

        if (newLoginError) {
          console.log('❌ 重新登录失败:', newLoginError.message);
          return;
        }

        console.log('✅ 重新登录成功');

        // 验证表是否存在且有数据
        const { data: adminCount, error: countError } = await supabase
          .from('admin_users')
          .select('count');

        if (countError) {
          console.log('❌ 表验证失败:', countError.message);
        } else {
          console.log('✅ admin_users表存在，记录数:', adminCount.length);
        }

        const { data: permCount, error: permCountError } = await supabase
          .from('permissions')
          .select('count');

        if (permCountError) {
          console.log('❌ 权限表验证失败:', permCountError.message);
        } else {
          console.log('✅ permissions表存在，记录数:', permCount.length);
        }

        // 检查管理员记录
        const { data: adminRecord, error: recordError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', adminEmail)
          .single();

        if (recordError) {
          console.log('❌ 管理员记录查询失败:', recordError.message);
        } else {
          console.log('✅ 管理员记录存在:');
          console.log('   ID:', adminRecord.id);
          console.log(
            '   用户ID匹配:',
            adminRecord.user_id === userId ? '✅' : '❌'
          );
          console.log('   角色:', adminRecord.role);
          console.log('   状态:', adminRecord.is_active ? '激活' : '未激活');
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
          console.log('❌ 数据库权限检查失败:', permError?.message);
        }

        // 登出
        await supabase.auth.signOut();
        console.log('\n✅ 验证完成');

        console.log('\n🎉 终极解决方案执行完成！');
        console.log('\n📋 下一步操作:');
        console.log(
          '1. 访问 http://localhost:3001/login?redirect=%2Fadmin 测试登录'
        );
        console.log('2. 验证管理后台功能是否正常');
        console.log('3. 如果一切正常，可以删除备份的SQL文件');
      } catch (verifyError) {
        console.error('❌ 验证过程中发生错误:', verifyError.message);
      }
    });
  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  ultimateSolution();
}

module.exports = { ultimateSolution };
