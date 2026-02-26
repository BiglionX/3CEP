#!/usr/bin/env node

/**
 * 测试当前管理员系统状态
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testCurrentStatus() {
  console.log('🔍 测试当前管理员系统状态...');
  console.log('============================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const adminEmail = '1055603323@qq.com';
  
  try {
    console.log('\n1️⃣ 测试登录功能...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: '12345678'
    });
    
    if (loginError) {
      console.log('❌ 登录失败:', loginError.message);
      return;
    }
    
    console.log('✅ 登录成功');
    console.log('   用户ID:', loginData.user.id);
    
    console.log('\n2️⃣ 测试会话检查API...');
    
    try {
      // 测试会话检查
      const sessionResponse = await fetch('http://localhost:3001/api/auth/check-session', {
        method: 'GET',
        headers: {
          'Cookie': `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${JSON.stringify(loginData.session)}`
        }
      });
      
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
    
    console.log('\n3️⃣ 测试登录API...');
    
    try {
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminEmail,
          password: '12345678'
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ 登录API工作正常');
        console.log('   管理员身份:', loginResult.user?.isAdmin);
        console.log('   重定向URL:', loginResult.redirectUrl);
      } else {
        console.log('❌ 登录API失败:', loginResult.error);
      }
    } catch (loginError) {
      console.log('❌ 登录API测试失败:', loginError.message);
    }
    
    console.log('\n4️⃣ 测试数据库访问...');
    
    // 测试直接数据库查询
    try {
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(5);
      
      if (adminError) {
        console.log('❌ admin_users表访问失败:', adminError.message);
      } else {
        console.log('✅ admin_users表访问正常');
        console.log('   记录数:', adminUsers.length);
        if (adminUsers.length > 0) {
          console.log('   示例记录:', adminUsers[0]);
        }
      }
    } catch (dbError) {
      console.log('❌ 数据库访问测试失败:', dbError.message);
    }
    
    // 登出
    await supabase.auth.signOut();
    console.log('\n✅ 测试完成');
    
    console.log('\n📋 当前状态总结:');
    console.log('如果以上测试都通过，说明：');
    console.log('- 基础认证功能正常');
    console.log('- API接口工作正常');
    console.log('- 数据库连接正常');
    console.log('\n现在可以测试实际的登录流程了！');
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

testCurrentStatus();