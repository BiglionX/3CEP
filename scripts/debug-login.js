#!/usr/bin/env node

/**
 * 深入调试登录API和会话机制
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugLoginMechanism() {
  console.log('🐛 深入调试登录机制');
  console.log('====================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';

  try {
    console.log('\n1️⃣ 分析登录API响应结构');

    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    const loginResult = await loginResponse.json();
    console.log('登录API状态码:', loginResponse.status);
    console.log('登录API响应:', JSON.stringify(loginResult, null, 2));

    if (!loginResult.success) {
      console.log('❌ 登录API调用失败');
      return;
    }

    console.log('\n2️⃣ 分析会话cookie设置');
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie头部:', setCookieHeader);

    if (setCookieHeader) {
      const cookieParts = setCookieHeader.split(',').map(part => part.trim());
      console.log('Cookie片段数量:', cookieParts.length);

      cookieParts.forEach((part, index) => {
        if (part.includes('sb-')) {
          console.log(
            `Supabase Cookie ${index + 1}:`,
            `${part.substring(0, 100)}...`
          );
        }
      });
    }

    console.log('\n3️⃣ 测试使用返回的会话访问后台');

    // 提取cookie用于后续请求
    let cookies = '';
    if (setCookieHeader) {
      const cookieParts = setCookieHeader.split(',').map(part => part.trim());
      cookies = cookieParts.join('; ');
    }

    console.log('使用的Cookie字符串:', `${cookies.substring(0, 100)}...`);

    const dashboardResponse = await fetch(
      'http://localhost:3001/admin/dashboard',
      {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'manual',
      }
    );

    console.log('管理后台访问状态:', dashboardResponse.status);
    console.log('重定向位置:', dashboardResponse.headers.get('location'));

    if (dashboardResponse.status === 200) {
      console.log('✅ 管理后台访问成功');
      const content = await dashboardResponse.text();
      console.log(
        '页面标题:',
        content.match(/<title>([^<]*)<\/title>/)?.[1] || '无标题'
      );
    } else if (dashboardResponse.status === 307) {
      console.log('❌ 仍然被重定向到登录页');
    }

    console.log('\n4️⃣ 检查用户元数据');
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(loginResult.user.id);

    if (!userError && userData?.user) {
      console.log(
        '用户元数据:',
        JSON.stringify(userData.user.user_metadata, null, 2)
      );
      console.log(
        'App元数据:',
        JSON.stringify(userData.user.app_metadata, null, 2)
      );
    }

    console.log('\n5️⃣ 手动构造测试请求');

    // 构造一个完整的测试场景
    const testScenarios = [
      {
        name: '仅带Cookie',
        headers: { Cookie: cookies },
      },
      {
        name: '带Cookie和User-Agent',
        headers: {
          Cookie: cookies,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
      {
        name: '带Authorization header',
        headers: {
          Authorization: `Bearer ${loginResult.session.access_token}`,
        },
      },
    ];

    for (const scenario of testScenarios) {
      console.log(`\n测试场景: ${scenario.name}`);

      const testResponse = await fetch(
        'http://localhost:3001/admin/dashboard',
        {
          method: 'GET',
          headers: scenario.headers,
          redirect: 'manual',
        }
      );

      console.log('  状态码:', testResponse.status);
      console.log('  重定向:', testResponse.headers.get('location') || '无');
    }

    console.log('\n📋 调试结论:');
    console.log('请根据以上测试结果分析:');
    console.log('1. Cookie是否正确设置和传递');
    console.log('2. 中间件是否正确识别会话');
    console.log('3. 是否存在其他验证机制干扰');
  } catch (error) {
    console.error('\n❌ 调试过程中发生错误:', error.message);
  }
}

debugLoginMechanism();
