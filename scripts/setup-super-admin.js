#!/usr/bin/env node

/**
 * 最高级管理员账号设置脚本
 * 为端到端测试创建超级管理员账户
 * 账号: 1055603323@qq.com / 12345678
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupSuperAdmin() {
  console.log('🚀 开始设置最高级管理员账号...');
  console.log('=====================================');
  
  // 使用服务角色密钥创建客户端（拥有完整数据库权限）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';
  
  try {
    console.log(`\n1️⃣ 创建管理员用户账户...`);
    
    // 直接使用Supabase Auth创建用户
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: '超级管理员',
          role: 'admin'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ 用户创建失败:', signUpError.message);
      // 如果用户已存在，继续执行
      if (signUpError.message.includes('already registered')) {
        console.log('✅ 用户已存在，继续设置权限');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✅ 用户账户创建成功');
    }
    
    console.log(`\n2️⃣ 验证用户创建...`);
    
    // 等待用户创建完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 通过邮箱查找用户
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', adminEmail)
      .single();
    
    if (userError) {
      console.error('❌ 用户查找失败:', userError.message);
      throw userError;
    }
    
    const userId = userData.id;
    console.log(`✅ 找到用户ID: ${userId}`);
    
    console.log(`\n3️⃣ 创建管理员权限记录...`);
    
    // 创建简单的管理员标记 - 使用用户元数据
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        isAdmin: true,
        role: 'admin',
        permissions: ['all']
      }
    });
    
    if (updateError) {
      console.error('❌ 管理员权限设置失败:', updateError.message);
      throw updateError;
    }
    
    console.log('✅ 管理员权限设置成功');
    
    console.log(`\n4️⃣ 验证设置结果...`);
    
    // 验证用户权限
    const { data: { user }, error: sessionError } = await supabase.auth.admin.getUserById(userId);
    
    if (sessionError) {
      console.error('❌ 权限验证失败:', sessionError.message);
      throw sessionError;
    }
    
    console.log('\n✅ 最高级管理员账号设置完成！');
    console.log('\n📋 账号信息:');
    console.log(`   邮箱: ${user.email}`);
    console.log(`   角色: ${user.user_metadata?.role || 'admin'}`);
    console.log(`   权限: ${JSON.stringify(user.user_metadata?.permissions || ['all'])}`);
    console.log(`   用户ID: ${user.id}`);
    
    console.log('\n🔐 登录信息:');
    console.log(`   登录地址: http://localhost:3001/login?redirect=%2Fadmin`);
    console.log(`   邮箱: ${adminEmail}`);
    console.log(`   密码: ${adminPassword}`);
    
    console.log('\n⚠️  安全提醒:');
    console.log('   - 请仅在测试环境中使用此账号');
    console.log('   - 生产环境中请及时修改密码');
    console.log('   - 建议设置更强的密码策略');
    
    // 测试登录验证
    console.log('\n5️⃣ 测试登录验证...');
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (loginError) {
        console.log('⚠️  登录测试失败:', loginError.message);
      } else {
        console.log('✅ 登录验证通过');
        // 登出测试用户
        await supabase.auth.signOut();
      }
    } catch (loginTestError) {
      console.log('⚠️  登录测试出现异常:', loginTestError.message);
    }
    
    console.log('\n🎉 端到端测试准备就绪！');
    
  } catch (error) {
    console.error('\n❌ 设置过程中发生错误:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 执行设置
setupSuperAdmin();