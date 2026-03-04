#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// 配置Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAIL = '1055603323@qq.com';
const ADMIN_PASSWORD = '12345678';

async function diagnoseAdminLogin() {
  console.log('🔍 开始诊断admin登录问题...\n');

  // 1. 检查环境变量
  console.log('1️⃣ 检查环境配置...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  let envOk = true;
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.log(`❌ 缺少环境变量: ${envVar}`);
      envOk = false;
    } else {
      console.log(`✅ ${envVar}: 已配置`);
    }
  });

  if (!envOk) {
    console.log('\n❌ 环境变量配置不完整，请检查.env文件');
    return;
  }

  console.log('');

  // 2. 测试数据库连接
  console.log('2️⃣ 测试数据库连接...');
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    if (error && error.code !== '42P01') {
      // 42P01表示表不存在，这是正常的
      console.log(`❌ 数据库连接失败: ${error.message}`);
      return;
    }
    console.log('✅ 数据库连接正常');
  } catch (error) {
    console.log(`❌ 数据库连接异常: ${error.message}`);
    return;
  }

  console.log('');

  // 3. 检查管理员用户是否存在
  console.log('3️⃣ 检查管理员账户...');
  try {
    // 先尝试通过邮箱查找用户
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.log(`❌ 获取用户列表失败: ${userError.message}`);
      return;
    }

    const targetUser = users.users.find(u => u.email === ADMIN_EMAIL);

    if (!targetUser) {
      console.log(`❌ 未找到管理员账户: ${ADMIN_EMAIL}`);
      console.log('💡 建议运行: npm run setup-admin');
      return;
    }

    console.log(`✅ 找到管理员账户: ${targetUser.email}`);
    console.log(`   用户ID: ${targetUser.id}`);
    console.log(
      `   邮箱已确认: ${targetUser.email_confirmed_at ? '是' : '否'}`
    );

    // 检查用户元数据中的管理员标识
    const isAdminInMetadata = targetUser.user_metadata?.isAdmin === true;
    console.log(`   用户元数据管理员标识: ${isAdminInMetadata ? '是' : '否'}`);
  } catch (error) {
    console.log(`❌ 检查用户账户失败: ${error.message}`);
    return;
  }

  console.log('');

  // 4. 测试登录功能
  console.log('4️⃣ 测试登录功能...');
  try {
    // 先登出任何现有会话
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (error) {
      console.log(`❌ 登录失败: ${error.message}`);
      console.log(`   错误代码: ${error.code}`);
      if (error.code === 'invalid_credentials') {
        console.log('💡 密码可能不正确，请确认密码为: 12345678');
      }
      return;
    }

    console.log('✅ 登录成功');
    console.log(`   用户ID: ${data.user.id}`);
    console.log(`   用户邮箱: ${data.user.email}`);

    // 检查登录后的管理员状态
    const isAdminPostLogin = data.user.user_metadata?.isAdmin === true;
    console.log(`   登录后管理员状态: ${isAdminPostLogin ? '是' : '否'}`);

    // 测试API检查
    console.log('\n5️⃣ 测试认证API...');
    try {
      const apiResponse = await fetch(
        'http://localhost:3001/api/auth/check-session'
      );
      const apiData = await apiResponse.json();

      if (apiResponse.ok) {
        console.log('✅ 认证API响应正常');
        console.log(
          `   认证状态: ${apiData.authenticated ? '已认证' : '未认证'}`
        );
        console.log(`   管理员权限: ${apiData.is_admin ? '是' : '否'}`);
        console.log(`   用户邮箱: ${apiData.user?.email || '未知'}`);
      } else {
        console.log(`❌ 认证API响应异常: ${apiData.error || '未知错误'}`);
      }
    } catch (apiError) {
      console.log(`❌ 认证API调用失败: ${apiError.message}`);
      console.log('💡 请确认应用服务器是否正在运行 (npm run dev)');
    }

    // 登出
    await supabase.auth.signOut();
    console.log('\n✅ 测试完成并已登出');
  } catch (error) {
    console.log(`❌ 登录测试失败: ${error.message}`);
    return;
  }

  console.log('\n🎉 诊断完成！');
  console.log('\n📋 建议操作:');
  console.log('1. 如果登录成功但无管理员权限，请运行: npm run setup-admin');
  console.log('2. 如果密码错误，请重置密码或联系系统管理员');
  console.log('3. 如果API测试失败，请确认应用服务器正在运行');
  console.log(
    '4. 测试登录页面: http://localhost:3001/login?redirect=/admin/dashboard'
  );
}

// 执行诊断
diagnoseAdminLogin().catch(error => {
  console.error('\n❌ 诊断过程中发生严重错误:', error.message);
  process.exit(1);
});
