#!/usr/bin/env node

/**
 * 全新登录解决方案 - 简化版
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function freshSolution() {
  console.log('🚀 全新登录解决方案');
  console.log('==================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';
  
  try {
    console.log('\n1️⃣ 执行管理员登录');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.log('❌ 登录失败:', loginError.message);
      return;
    }
    
    console.log('✅ 登录成功');
    console.log('   用户ID:', loginData.user.id);
    console.log('   管理员状态:', loginData.user.user_metadata?.isAdmin);
    
    console.log('\n2️⃣ 创建简化测试页面');
    
    const testPage = `
<!DOCTYPE html>
<html>
<head>
    <title>管理员后台测试</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        #result { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 管理员后台访问测试</h1>
        <div id="status" class="info">正在检查权限...</div>
        <div id="result"></div>
        
        <div style="margin-top: 20px;">
            <button onclick="testAccess()">测试后台访问</button>
            <button onclick="goToDashboard()">直接访问后台</button>
            <button onclick="showToken()">显示访问令牌</button>
        </div>
    </div>

    <script>
        const accessToken = "${loginData.session.access_token}";
        
        async function testAccess() {
            try {
                const response = await fetch('/api/auth/check-session', {
                    headers: { 'Authorization': 'Bearer ' + accessToken }
                });
                const data = await response.json();
                
                document.getElementById('status').className = data.authenticated ? 'status success' : 'status error';
                document.getElementById('status').innerHTML = data.authenticated ? 
                    '✅ 权限验证通过' : '❌ 权限验证失败';
                
                document.getElementById('result').innerHTML = 
                    '<h3>验证结果:</h3>' +
                    '<p><strong>用户:</strong> ' + data.user?.email + '</p>' +
                    '<p><strong>管理员:</strong> ' + (data.user?.isAdmin ? '是' : '否') + '</p>' +
                    '<p><strong>角色:</strong> ' + data.user?.role + '</p>';
                    
            } catch (error) {
                document.getElementById('status').className = 'status error';
                document.getElementById('status').innerHTML = '❌ 验证失败: ' + error.message;
            }
        }
        
        function goToDashboard() {
            // 直接跳转到管理后台
            window.location.href = '/admin/dashboard';
        }
        
        function showToken() {
            alert('访问令牌:\\n' + accessToken.substring(0, 100) + '...');
        }
        
        // 页面加载后自动测试
        window.onload = testAccess;
    </script>
</body>
</html>`;
    
    // 保存测试页面
    const fs = require('fs');
    fs.writeFileSync('./public/fresh-admin-test.html', testPage);
    console.log('✅ 已创建全新测试页面: public/fresh-admin-test.html');
    
    console.log('\n3️⃣ 测试API访问');
    
    try {
      const apiResponse = await fetch('http://localhost:3001/api/auth/check-session', {
        headers: { 'Authorization': `Bearer ${loginData.session.access_token}` }
      });
      
      const apiResult = await apiResponse.json();
      console.log('API检查结果:', apiResult);
      
      if (apiResult.authenticated && apiResult.user?.isAdmin) {
        console.log('✅ API权限验证通过');
      } else {
        console.log('❌ API权限验证失败');
      }
    } catch (apiError) {
      console.log('❌ API测试失败:', apiError.message);
    }
    
    console.log('\n📋 使用说明:');
    console.log('1. 访问测试页面: http://localhost:3001/fresh-admin-test.html');
    console.log('2. 点击"测试后台访问"按钮验证权限');
    console.log('3. 点击"直接访问后台"按钮进入管理界面');
    console.log('4. 如果仍有问题，请检查浏览器控制台错误');
    
    console.log('\n🎯 核心优势:');
    console.log('- 完全绕过Cookie处理问题');
    console.log('- 直接使用访问令牌验证');
    console.log('- 简化的权限检查逻辑');
    console.log('- 实时的状态反馈');
    
  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
  }
}

freshSolution();