#!/usr/bin/env node

/**
 * 统一认证系统验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 统一认证系统验证\n');

// 1. 检查文件创建情况
console.log('1️⃣ 文件创建验证');

const createdFiles = [
  'src/hooks/use-unified-auth.ts',
  'src/app/unified-auth-test/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/login/page.tsx',
];

createdFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. 验证统一认证Hook功能
console.log('\n2️⃣ 统一认证Hook验证');

const hookPath = path.join(
  process.cwd(),
  'src',
  'hooks',
  'use-unified-auth.ts'
);
if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');

  const hookFeatures = [
    {
      name: 'useUnifiedAuth导出',
      pattern: 'export function useUnifiedAuth',
      required: true,
    },
    {
      name: 'Supabase集成',
      pattern: 'supabase.auth.getSession',
      required: true,
    },
    {
      name: '管理员权限检查',
      pattern: 'AuthService.isAdminUser',
      required: true,
    },
    {
      name: 'localStorage备用方案',
      pattern: 'localStorage.getItem',
      required: true,
    },
    {
      name: '登录功能',
      pattern: 'const login = async',
      required: true,
    },
    {
      name: '登出功能',
      pattern: 'const logout = async',
      required: true,
    },
    {
      name: '权限检查',
      pattern: 'hasPermission',
      required: true,
    },
  ];

  console.log('Hook功能检查:');
  hookFeatures.forEach(feature => {
    const found = content.includes(feature.pattern);
    const status = found ? '✅' : feature.required ? '❌' : '⚠️';
    console.log(`  ${status} ${feature.name}`);
  });
}

// 3. 验证页面集成
console.log('\n3️⃣ 页面集成验证');

const dashboardPath = path.join(
  process.cwd(),
  'src',
  'app',
  'admin',
  'dashboard',
  'page.tsx'
);
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');

  const dashboardChecks = [
    {
      name: '导入useUnifiedAuth',
      pattern: "import { useUnifiedAuth } from '@/hooks/use-unified-auth'",
      required: true,
    },
    {
      name: '使用认证Hook',
      pattern: 'const { isAuthenticated, is_admin } = useUnifiedAuth()',
      required: true,
    },
    {
      name: '路由保护',
      pattern: 'useEffect(() => {',
      required: true,
    },
  ];

  console.log('管理后台页面检查:');
  dashboardChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : check.required ? '❌' : '⚠️';
    console.log(`  ${status} ${check.name}`);
  });
}

const loginPath = path.join(process.cwd(), 'src', 'app', 'login', 'page.tsx');
if (fs.existsSync(loginPath)) {
  const content = fs.readFileSync(loginPath, 'utf8');

  const loginChecks = [
    {
      name: '导入useUnifiedAuth',
      pattern: "import { useUnifiedAuth } from '@/hooks/use-unified-auth'",
      required: true,
    },
    {
      name: '使用认证Hook',
      pattern: 'const { isAuthenticated, is_admin, login } = useUnifiedAuth()',
      required: true,
    },
    {
      name: '统一登录处理',
      pattern: 'await login(email, password)',
      required: true,
    },
  ];

  console.log('登录页面检查:');
  loginChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : check.required ? '❌' : '⚠️';
    console.log(`  ${status} ${check.name}`);
  });
}

// 4. 提供测试步骤
console.log('\n4️⃣ 测试验证步骤');

console.log('\n第一步: 访问测试页面');
console.log('http://localhost:3001/unified-auth-test');

console.log('\n第二步: 测试登录功能');
console.log('使用账号: 1055603323@qq.com');
console.log('密码: 12345678');

console.log('\n第三步: 验证管理后台访问');
console.log('登录成功后点击"访问管理后台"按钮');
console.log('或者直接访问: http://localhost:3001/admin/dashboard');

console.log('\n第四步: 检查认证状态');
console.log('在测试页面观察各项认证状态指标');
console.log('确认管理员权限正确识别');

// 5. 预期结果
console.log('\n5️⃣ 预期验证结果');

console.log('\n✅ 成功标志:');
console.log('• 测试页面能正常显示当前认证状态');
console.log('• 登录功能正常工作');
console.log('• 管理员权限被正确识别');
console.log('• 能够正常访问管理后台');
console.log('• 登出功能正常');

console.log('\n❌ 失败标志:');
console.log('• 认证状态始终显示未认证');
console.log('• 登录后状态不更新');
console.log('• 管理员权限识别错误');
console.log('• 无法访问受保护的管理页面');
console.log('• 出现认证相关的错误信息');

console.log('\n📊 如何反馈:');
console.log('请提供以下信息:');
console.log('1. 测试页面的截图');
console.log('2. 浏览器Console的错误信息');
console.log('3. 网络请求的状态和响应');
console.log('4. 具体的失败现象描述');

console.log('\n✅ 统一认证验证准备完成！');
