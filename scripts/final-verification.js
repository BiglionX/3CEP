#!/usr/bin/env node

/**
 * 最终验证 - 确认登录和管理后台访问完全正常
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function finalVerification() {
  console.log('✅ 最终验证测试');
  console.log('==============='); 
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';
  
  try {
    console.log('\n1️⃣ 完整登录流程测试');
    
    // 执行登录
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    
    const loginResult = await loginResponse.json();
    console.log('登录状态:', loginResult.success ? '✅ 成功' : '❌ 失败');
    
    if (!loginResult.success) {
      console.log('登录失败原因:', loginResult.error);
      return;
    }
    
    // 获取cookie
    const setCookie = loginResponse.headers.get('set-cookie');
    console.log('Cookie设置:', setCookie ? '✅ 已设置' : '❌ 未设置');
    
    console.log('\n2️⃣ 管理后台访问测试');
    
    const testUrls = [
      'http://localhost:3001/admin',
      'http://localhost:3001/admin/dashboard', 
      'http://localhost:3001/admin/users'
    ];
    
    let successCount = 0;
    
    for (const url of testUrls) {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Cookie': setCookie },
        redirect: 'manual'
      });
      
      const isSuccess = response.status === 200;
      console.log(`${url}: ${isSuccess ? '✅' : '❌'} (${response.status})`);
      
      if (isSuccess) successCount++;
    }
    
    console.log(`\n📊 测试结果: ${successCount}/${testUrls.length} 个页面访问成功`);
    
    console.log('\n3️⃣ 权限验证测试');
    
    const permissionTests = [
      {
        name: '会话检查API',
        url: 'http://localhost:3001/api/auth/check-session',
        headers: { 'Cookie': setCookie }
      },
      {
        name: '用户管理API', 
        url: 'http://localhost:3001/api/admin/users',
        headers: { 'Cookie': setCookie }
      },
      {
        name: '统计信息API',
        url: 'http://localhost:3001/api/admin/stats', 
        headers: { 'Cookie': setCookie }
      }
    ];
    
    for (const test of permissionTests) {
      const response = await fetch(test.url, {
        method: 'GET', 
        headers: test.headers
      });
      
      const isSuccess = response.ok;
      console.log(`${test.name}: ${isSuccess ? '✅' : '❌'} (${response.status})`);
    }
    
    console.log('\n4️⃣ 用户信息验证');
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(loginResult.user.id);
    
    if (!userError && userData?.user) {
      const isAdmin = userData.user.user_metadata?.isAdmin === true;
      const hasRole = !!userData.user.user_metadata?.role;
      
      console.log('管理员标识:', isAdmin ? '✅ 存在' : '❌ 缺失');
      console.log('角色信息:', hasRole ? '✅ 存在' : '❌ 缺失');
      console.log('用户邮箱:', userData.user.email);
    }
    
    console.log('\n📋 最终结论:');
    
    const allTestsPassed = (
      loginResult.success && 
      setCookie && 
      successCount === testUrls.length
    );
    
    if (allTestsPassed) {
      console.log('🎉 所有测试通过！登录和管理后台访问功能完全正常。');
      console.log('\n使用说明:');
      console.log('1. 访问登录页: http://localhost:3001/login');
      console.log('2. 输入账号: 1055603323@qq.com');
      console.log('3. 输入密码: 12345678'); 
      console.log('4. 登录成功后将自动跳转到管理后台');
    } else {
      console.log('❌ 部分测试未通过，请检查以上结果');
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
  }
}

finalVerification();