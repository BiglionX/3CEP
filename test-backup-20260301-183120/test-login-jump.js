#!/usr/bin/env node

/**
 * 登录跳转功能测试脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 登录跳转功能测试\n');

// 1. 检查关键文件是否存在和内容
console.log('1️⃣ 检查关键文件状态');

const filesToCheck = [
  'src/app/login/page.tsx',
  'src/app/api/auth/login/route.ts',
  'src/components/GoogleLoginButton.tsx',
  'src/app/api/auth/callback/google/route.ts',
];

filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
  }
});

// 2. 验证登录页面跳转逻辑
console.log('\n2️⃣ 验证登录页面跳转逻辑');

const loginPagePath = path.join(
  process.cwd(),
  'src',
  'app',
  'login',
  'page.tsx'
);
if (fs.existsSync(loginPagePath)) {
  const content = fs.readFileSync(loginPagePath, 'utf8');

  // 检查是否包含正确的跳转逻辑
  const hasCorrectJumpLogic = content.includes(
    "const targetRedirect = redirect?.startsWith('/admin') ? redirect : '/admin/dashboard'"
  );
  const hasAdminCheck = content.includes('if (result.user?.is_admin)');

  console.log(`跳转逻辑正确: ${hasCorrectJumpLogic ? '✅' : '❌'}`);
  console.log(`管理员检查: ${hasAdminCheck ? '✅' : '❌'}`);
}

// 3. 验证Google登录按钮
console.log('\n3️⃣ 验证Google登录按钮');

const googleButtonPath = path.join(
  process.cwd(),
  'src',
  'components',
  'GoogleLoginButton.tsx'
);
if (fs.existsSync(googleButtonPath)) {
  const content = fs.readFileSync(googleButtonPath, 'utf8');

  const hasGoogleAuthUrl = content.includes('googleAuthUrl');
  const hasClientId = content.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  const hasRedirectParam = content.includes('encodeURIComponent(redirect)');

  console.log(`Google OAuth URL构建: ${hasGoogleAuthUrl ? '✅' : '❌'}`);
  console.log(`Google Client ID使用: ${hasClientId ? '✅' : '❌'}`);
  console.log(`Redirect参数传递: ${hasRedirectParam ? '✅' : '❌'}`);
}

// 4. 创建测试用例
console.log('\n4️⃣ 测试用例');

const testCases = [
  {
    name: '管理员邮箱密码登录',
    url: 'http://localhost:3001/login?redirect=/admin/dashboard',
    credentials: {
      email: '1055603323@qq.com',
      password: '12345678',
    },
    expected: '/admin/dashboard',
  },
  {
    name: '普通用户邮箱密码登录',
    url: 'http://localhost:3001/login?redirect=/profile',
    credentials: {
      email: 'test@example.com',
      password: 'password123',
    },
    expected: '/profile',
  },
  {
    name: '管理员Google登录',
    url: 'http://localhost:3001/admin/login?redirect=/admin/settings',
    method: 'Google',
    expected: '/admin/settings',
  },
];

testCases.forEach((testCase, index) => {
  console.log(`\n测试 ${index + 1}: ${testCase.name}`);
  console.log(`  登录地址: ${testCase.url}`);
  if (testCase.credentials) {
    console.log(`  凭证: ${testCase.credentials.email}`);
  }
  console.log(`  期望跳转: ${testCase.expected}`);
  console.log(`  测试方法: 手动测试`);
});

// 5. 提供验证步骤
console.log('\n5️⃣ 验证步骤');

console.log('\n📋 手动验证指南:');
console.log('1. 访问登录页面带redirect参数:');
console.log('   http://localhost:3001/login?redirect=/admin/dashboard');
console.log('2. 使用管理员账号登录:');
console.log('   邮箱: 1055603323@qq.com');
console.log('   密码: 12345678');
console.log('3. 观察是否正确跳转到 /admin/dashboard');
console.log('4. 测试Google登录按钮是否携带redirect参数');
console.log('5. 验证普通用户的跳转行为');

console.log('\n🔧 调试建议:');
console.log('- 检查浏览器开发者工具的Network标签');
console.log('- 查看Console中的错误信息');
console.log('- 确认环境变量 NEXT_PUBLIC_SITE_URL 已设置');
console.log('- 验证Google OAuth配置是否正确');

console.log('\n✅ 测试准备完成！请按上述步骤进行手动验证。');
