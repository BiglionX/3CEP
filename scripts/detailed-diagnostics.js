#!/usr/bin/env node

/**
 * 详细诊断登录问题 - 包含浏览器模拟
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function detailedDiagnostics() {
  console.log('🔍 详细诊断登录问题');
  console.log('==================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';

  try {
    console.log('\n1️⃣ 基础认证测试');

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
    console.log('   管理员状态:', authData.user.user_metadata?.isAdmin);

    console.log('\n2️⃣ 直接访问测试（模拟浏览器）');

    // 模拟浏览器请求 - 包含常见的浏览器headers
    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // 测试不同访问方式
    const testCases = [
      {
        name: '直接访问首页',
        url: 'http://localhost:3001/',
        method: 'GET',
      },
      {
        name: '访问登录页',
        url: 'http://localhost:3001/login',
        method: 'GET',
      },
      {
        name: '访问管理后台',
        url: 'http://localhost:3001/admin/dashboard',
        method: 'GET',
      },
    ];

    for (const testCase of testCases) {
      console.log(`\n测试: ${testCase.name}`);
      console.log(`URL: ${testCase.url}`);

      try {
        const response = await fetch(testCase.url, {
          method: testCase.method,
          headers: browserHeaders,
          redirect: 'manual',
        });

        console.log('   状态码:', response.status);
        console.log('   重定向:', response.headers.get('location') || '无');

        // 如果是200，读取部分内容
        if (response.status === 200) {
          const content = await response.text();
          console.log('   内容长度:', content.length);
          console.log(
            '   标题:',
            content.match(/<title>([^<]*)<\/title>/)?.[1] || '无标题'
          );
        }
      } catch (error) {
        console.log('   ❌ 请求失败:', error.message);
      }
    }

    console.log('\n3️⃣ Cookie设置测试');

    // 测试设置cookie后的情况
    try {
      const cookieValue = JSON.stringify(authData.session);
      const cookieHeader = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${encodeURIComponent(cookieValue)}`;

      console.log('设置Cookie:', `${cookieHeader.substring(0, 100)}...`);

      const dashboardResponse = await fetch(
        'http://localhost:3001/admin/dashboard',
        {
          method: 'GET',
          headers: {
            ...browserHeaders,
            Cookie: cookieHeader,
          },
          redirect: 'manual',
        }
      );

      console.log('带Cookie访问管理后台:');
      console.log('   状态码:', dashboardResponse.status);
      console.log(
        '   重定向:',
        dashboardResponse.headers.get('location') || '无'
      );
    } catch (cookieError) {
      console.log('Cookie测试失败:', cookieError.message);
    }

    console.log('\n4️⃣ 中间件日志检查');

    // 检查是否有中间件相关的错误日志
    console.log('请检查终端中是否有中间件相关的错误信息');
    console.log('常见问题:');
    console.log('- 中间件配置错误');
    console.log('- RLS策略阻止访问');
    console.log('- 路由处理异常');

    console.log('\n📋 建议的下一步:');
    console.log('1. 检查终端中的实时日志输出');
    console.log('2. 尝试清除浏览器缓存和Cookie');
    console.log('3. 检查是否有JavaScript错误');
    console.log('4. 验证中间件配置文件是否正确加载');
  } catch (error) {
    console.error('\n❌ 诊断过程中发生错误:', error.message);
  }
}

detailedDiagnostics();
