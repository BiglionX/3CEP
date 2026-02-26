#!/usr/bin/env node

/**
 * 使用curl模拟完整登录流程测试
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testLoginWithCurl() {
  console.log('🧪 使用curl测试完整登录流程...');
  console.log('==============================');
  
  try {
    // 1. 先获取CSRF token或其他必要信息
    console.log('\n1️⃣ 获取登录页面信息...');
    const { stdout: pageOutput } = await execAsync('curl -s http://localhost:3001/login?redirect=%2Fadmin');
    console.log('✅ 登录页面访问成功');
    
    // 2. 执行登录请求
    console.log('\n2️⃣ 执行登录请求...');
    const loginCommand = `curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"1055603323@qq.com\\",\\"password\\":\\"12345678\\"}" -c cookies.txt`;
    
    const { stdout: loginOutput } = await execAsync(loginCommand);
    console.log('✅ 登录请求发送成功');
    
    const loginResult = JSON.parse(loginOutput);
    console.log('登录响应:', JSON.stringify(loginResult, null, 2));
    
    if (loginResult.success) {
      console.log('✅ 登录认证成功');
      
      // 3. 使用获得的会话测试受保护的路由
      console.log('\n3️⃣ 测试访问管理后台...');
      const dashboardCommand = `curl -s -b cookies.txt http://localhost:3001/admin/dashboard`;
      
      try {
        const { stdout: dashboardOutput } = await execAsync(dashboardCommand);
        if (dashboardOutput.includes('管理后台') || dashboardOutput.includes('admin')) {
          console.log('🎉 成功访问管理后台！');
          console.log('页面标题或内容包含管理后台标识');
        } else {
          console.log('⚠️  访问了页面但可能不是管理后台');
          console.log('页面长度:', dashboardOutput.length);
          // 显示页面前500个字符
          console.log('页面预览:', dashboardOutput.substring(0, 500));
        }
      } catch (dashboardError) {
        console.log('❌ 访问管理后台失败:', dashboardError.message);
      }
      
      // 4. 测试API访问
      console.log('\n4️⃣ 测试管理API访问...');
      const apiCommand = `curl -s -b cookies.txt http://localhost:3001/api/admin/users`;
      
      try {
        const { stdout: apiOutput } = await execAsync(apiCommand);
        const apiResult = JSON.parse(apiOutput);
        if (apiResult.success || apiResult.users) {
          console.log('✅ 管理API访问成功');
        } else {
          console.log('⚠️  API响应:', JSON.stringify(apiResult, null, 2));
        }
      } catch (apiError) {
        console.log('❌ 管理API访问失败:', apiError.message);
      }
      
    } else {
      console.log('❌ 登录认证失败:', loginResult.error);
    }
    
    // 5. 清理临时文件
    try {
      await execAsync('del cookies.txt');
    } catch (cleanupError) {
      // 忽略清理错误
    }
    
    console.log('\n📋 测试总结:');
    console.log('如果能看到管理后台内容或API响应，说明登录功能正常工作');
    console.log('如果遇到重定向或权限问题，可能需要检查中间件配置');
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

testLoginWithCurl();