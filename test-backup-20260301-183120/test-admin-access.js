#!/usr/bin/env node

/**
 * 测试管理员后台访问权限
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testAdminAccess() {
  console.log('🔍 测试管理员后台访问权限...');
  console.log('================================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';

  try {
    console.log('\n1️⃣ 登录获取会话...');

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: '12345678',
      });

    if (loginError) {
      console.error('❌ 登录失败:', loginError.message);
      return;
    }

    console.log('✅ 登录成功');
    console.log('   用户ID:', loginData.user.id);
    console.log('   管理员状态:', loginData.user.user_metadata?.isAdmin);

    console.log('\n2️⃣ 测试中间件逻辑...');

    // 模拟中间件的管理员检查逻辑
    const userId = loginData.user.id;

    // 测试用户元数据检查
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (!userError && userData?.user?.user_metadata?.isAdmin === true) {
      console.log('✅ 用户元数据检查通过');
    } else {
      console.log('❌ 用户元数据检查失败');
    }

    // 测试数据库检查（应该失败，因为我们没有创建表）
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!adminError && adminData !== null) {
        console.log('✅ 数据库检查通过');
      } else {
        console.log('⚠️  数据库检查失败（预期）:', adminError?.message);
      }
    } catch (dbError) {
      console.log('⚠️  数据库检查异常（预期）:', dbError.message);
    }

    console.log('\n3️⃣ 测试权限检查逻辑...');

    // 模拟权限检查
    const hasPermission = await checkUserPermission(
      userId,
      'dashboard',
      'read',
      supabase
    );
    console.log(`权限检查结果: ${hasPermission ? '✅ 通过' : '❌ 失败'}`);

    console.log('\n4️⃣ 生成访问测试链接...');

    console.log('\n📋 测试步骤:');
    console.log('1. 打开浏览器访问: http://localhost:3001/admin/dashboard');
    console.log('2. 如果被重定向到登录页，请先登录');
    console.log('3. 登录后应该能正常访问管理后台');

    console.log('\n🔧 调试建议:');
    console.log('- 检查浏览器开发者工具的Network标签');
    console.log('- 查看是否有401或403状态码');
    console.log('- 检查cookie是否正确设置');
    console.log('- 查看控制台是否有JavaScript错误');

    // 登出清理
    await supabase.auth.signOut();
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

async function checkUserPermission(userId, resource, action, supabase) {
  try {
    // 优先检查用户元数据
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (!userError && userData?.user?.user_metadata?.isAdmin === true) {
      return true;
    }

    // 备用：检查数据库权限（会失败）
    return false;
  } catch (error) {
    return false;
  }
}

// 执行测试
testAdminAccess();
