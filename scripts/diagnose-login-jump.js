#!/usr/bin/env node

/**
 * 登录跳转问题深度诊断脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 登录跳转问题深度诊断\n');

// 1. 检查环境变量配置
console.log('1️⃣ 环境变量检查');

const envFiles = ['.env.local', '.env'];
const envConfig = {};

envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ 找到环境文件: ${envFile}`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.includes('NEXT_PUBLIC_SITE_URL')) {
        const [, value] = line.split('=');
        envConfig.NEXT_PUBLIC_SITE_URL = value;
        console.log(`   NEXT_PUBLIC_SITE_URL: ${value}`);
      }
      if (line.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID')) {
        const [, value] = line.split('=');
        envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID = value;
        console.log(
          `   NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${value ? '已配置' : '未配置'}`
        );
      }
    });
  } else {
    console.log(`❌ 环境文件不存在: ${envFile}`);
  }
});

// 2. 检查登录API响应格式
console.log('\n2️⃣ 登录API响应格式检查');

const loginApiPath = path.join(
  process.cwd(),
  'src',
  'app',
  'api',
  'auth',
  'login',
  'route.ts'
);
if (fs.existsSync(loginApiPath)) {
  const content = fs.readFileSync(loginApiPath, 'utf8');

  // 检查响应结构
  const hasUserResponse = content.includes('user: {');
  const hasIsAdminField = content.includes('is_admin:');
  const hasSessionField = content.includes('session:');

  console.log(`用户响应结构: ${hasUserResponse ? '✅' : '❌'}`);
  console.log(`管理员字段: ${hasIsAdminField ? '✅' : '❌'}`);
  console.log(`会话字段: ${hasSessionField ? '✅' : '❌'}`);

  // 检查管理员判断逻辑
  const hasMetadataCheck = content.includes('user_metadata?.isAdmin');
  const hasDatabaseCheck = content.includes('admin_users');

  console.log(`用户元数据检查: ${hasMetadataCheck ? '✅' : '❌'}`);
  console.log(`数据库检查: ${hasDatabaseCheck ? '✅' : '❌'}`);
}

// 3. 检查前端跳转逻辑
console.log('\n3️⃣ 前端跳转逻辑详细检查');

const loginPagePath = path.join(
  process.cwd(),
  'src',
  'app',
  'login',
  'page.tsx'
);
if (fs.existsSync(loginPagePath)) {
  const content = fs.readFileSync(loginPagePath, 'utf8');

  // 检查关键跳转逻辑
  const checks = [
    {
      name: '获取redirect参数',
      pattern: "const redirect = searchParams.get('redirect')",
    },
    {
      name: '管理员检查',
      pattern: 'if (result.user?.is_admin)',
    },
    {
      name: '管理员跳转逻辑',
      pattern: "router.push('/admin/dashboard')",
    },
    {
      name: 'redirect参数使用',
      pattern: 'router.push(targetRedirect)',
    },
    {
      name: '错误处理',
      pattern: "setError(result.error || '登录失败')",
    },
  ];

  checks.forEach(check => {
    const found = content.includes(check.pattern);
    console.log(`${check.name}: ${found ? '✅' : '❌'}`);
  });

  // 显示实际的跳转逻辑
  console.log('\n📋 实际跳转逻辑代码片段:');
  const jumpSection = content.match(
    /if \(response\.ok\) \{[\s\S]*?\n\s*\} else \{/
  );
  if (jumpSection) {
    console.log(jumpSection[0]);
  }
}

// 4. 检查Cookie设置
console.log('\n4️⃣ Cookie设置检查');

if (fs.existsSync(loginApiPath)) {
  const content = fs.readFileSync(loginApiPath, 'utf8');

  const hasCookieSetting = content.includes('response.cookies.set');
  const hasAuthCookie = content.includes('auth-token');
  const hasSecureFlag = content.includes('secure:');
  const hasHttpOnlyFlag = content.includes('httpOnly:');

  console.log(`Cookie设置: ${hasCookieSetting ? '✅' : '❌'}`);
  console.log(`认证Cookie: ${hasAuthCookie ? '✅' : '❌'}`);
  console.log(`Secure标志: ${hasSecureFlag ? '✅' : '❌'}`);
  console.log(`HttpOnly标志: ${hasHttpOnlyFlag ? '✅' : '❌'}`);
}

// 5. 创建调试测试
console.log('\n5️⃣ 调试测试用例');

const debugTests = [
  {
    name: '基础登录测试',
    url: 'http://localhost:3001/login',
    steps: [
      '打开开发者工具(F12)',
      '切换到Network标签',
      '输入账号: 1055603323@qq.com',
      '输入密码: 12345678',
      '点击登录按钮',
      '观察Network中的POST /api/auth/login请求',
      '检查响应数据格式',
      '观察是否发生页面跳转',
    ],
  },
  {
    name: '带redirect参数测试',
    url: 'http://localhost:3001/login?redirect=/admin/dashboard',
    steps: [
      '访问带redirect参数的登录页',
      '执行登录操作',
      '检查是否跳转到指定页面',
      '验证URL是否包含redirect参数',
    ],
  },
  {
    name: 'Cookie验证测试',
    url: 'http://localhost:3001/login',
    steps: [
      '登录成功后',
      '打开Application标签',
      '查看Cookies中的认证信息',
      '检查是否有is_admin标记',
    ],
  },
];

debugTests.forEach((test, index) => {
  console.log(`\n🧪 调试测试 ${index + 1}: ${test.name}`);
  console.log(`   测试地址: ${test.url}`);
  console.log('   测试步骤:');
  test.steps.forEach((step, stepIndex) => {
    console.log(`     ${stepIndex + 1}. ${step}`);
  });
});

// 6. 常见问题排查清单
console.log('\n6️⃣ 常见问题排查清单');

const troubleshooting = [
  '检查浏览器控制台是否有JavaScript错误',
  '确认NEXT_PUBLIC_SITE_URL环境变量已正确设置',
  '验证数据库中用户是否确实具有管理员权限',
  '检查Supabase认证配置是否正确',
  '确认没有跨域问题',
  '验证Cookie是否被正确设置和读取',
  '检查是否有网络拦截或防火墙阻止',
  '确认服务器时间和客户端时间同步',
];

console.log('\n📋 排查步骤:');
troubleshooting.forEach((item, index) => {
  console.log(`   ${index + 1}. ${item}`);
});

// 7. 提供修复建议
console.log('\n7️⃣ 修复建议');

if (!envConfig.NEXT_PUBLIC_SITE_URL) {
  console.log('⚠️  建议: 设置NEXT_PUBLIC_SITE_URL环境变量');
  console.log('   示例: NEXT_PUBLIC_SITE_URL=http://localhost:3001');
}

console.log('\n🔧 立即可执行的修复步骤:');
console.log('1. 检查并设置环境变量');
console.log('2. 重启开发服务器');
console.log('3. 清除浏览器缓存和Cookie');
console.log('4. 按照调试测试步骤逐一验证');
console.log('5. 查看浏览器开发者工具中的详细信息');

console.log('\n📈 如果问题持续存在，请提供:');
console.log('- 浏览器控制台的完整错误信息');
console.log('- Network标签中的请求/响应详情');
console.log('- 登录时的具体操作步骤');
console.log('- 期望的结果 vs 实际的结果');

console.log('\n✅ 诊断完成！请根据上述建议进行排查。');
