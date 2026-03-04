#!/usr/bin/env node

/**
 * 深度诊断登录问题 - 逐步骤排查
 */

const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
require('dotenv').config();

async function deepDiagnostics() {
  console.log('🔍 深度诊断登录问题');
  console.log('====================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';

  try {
    console.log('\n📊 诊断步骤一：验证基础认证');

    // 1. 测试直接认证
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (authError) {
      console.log('❌ 认证失败:', authError.message);
      return;
    }

    console.log('✅ 认证成功');
    console.log('   用户ID:', authData.user.id);
    console.log('   邮箱:', authData.user.email);
    console.log('   元数据:', authData.user.user_metadata);

    console.log('\n📊 诊断步骤二：测试API登录');

    // 2. 测试登录API
    try {
      const loginResponse = await fetch(
        'http://localhost:3001/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, password: adminPassword }),
        }
      );

      const loginResult = await loginResponse.json();
      console.log('API响应状态:', loginResponse.status);
      console.log('API响应内容:', JSON.stringify(loginResult, null, 2));

      if (loginResult.success) {
        console.log('✅ 登录API正常');
      } else {
        console.log('❌ 登录API异常:', loginResult.error);
      }
    } catch (apiError) {
      console.log('❌ 登录API调用失败:', apiError.message);
    }

    console.log('\n📊 诊断步骤三：测试会话保持');

    // 3. 测试会话检查
    try {
      const sessionResponse = await fetch(
        'http://localhost:3001/api/auth/check-session',
        {
          method: 'GET',
          headers: {
            Cookie: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${JSON.stringify(authData.session)}`,
          },
        }
      );

      const sessionResult = await sessionResponse.json();
      console.log('会话检查状态:', sessionResponse.status);
      console.log('会话检查结果:', JSON.stringify(sessionResult, null, 2));
    } catch (sessionError) {
      console.log('❌ 会话检查失败:', sessionError.message);
    }

    console.log('\n📊 诊断步骤四：测试管理后台访问');

    // 4. 直接测试管理后台访问
    try {
      // 先获取新的会话
      const freshLogin = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const freshSession = await freshLogin.json();

      if (freshSession.success) {
        // 测试管理后台访问
        const dashboardTest = await fetch(
          'http://localhost:3001/admin/dashboard',
          {
            method: 'GET',
            headers: {
              Cookie: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${JSON.stringify(freshSession.session)}`,
            },
          }
        );

        console.log('管理后台访问状态:', dashboardTest.status);
        console.log(
          '重定向地址:',
          dashboardTest.headers.get('location') || '无重定向'
        );

        const dashboardContent = await dashboardTest.text();
        console.log('页面内容长度:', dashboardContent.length);

        if (
          dashboardContent.includes('管理后台') ||
          dashboardContent.includes('admin')
        ) {
          console.log('✅ 管理后台内容检测通过');
        } else {
          console.log('❌ 未检测到管理后台内容');
          console.log('页面预览:', dashboardContent.substring(0, 300));
        }
      }
    } catch (dashboardError) {
      console.log('❌ 管理后台访问测试失败:', dashboardError.message);
    }

    console.log('\n📊 诊断步骤五：检查服务器状态');

    // 5. 检查服务器进程
    try {
      const { stdout } = await execAsync('netstat -ano | findstr :3001');
      console.log('端口3001占用情况:');
      console.log(stdout);
    } catch (portError) {
      console.log('端口检查失败:', portError.message);
    }

    console.log('\n📋 诊断总结:');
    console.log('请检查以上各项测试结果，找出具体的故障点');
    console.log('常见问题及解决方案:');
    console.log('1. 如果认证成功但API失败 - 检查API路由配置');
    console.log('2. 如果会话检查失败 - 检查Cookie设置和中间件');
    console.log('3. 如果管理后台重定向 - 检查中间件权限逻辑');
    console.log('4. 如果服务器无响应 - 检查服务器是否正常运行');
  } catch (error) {
    console.error('\n❌ 诊断过程中发生错误:', error.message);
  }
}

deepDiagnostics();
