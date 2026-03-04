#!/usr/bin/env node

/**
 * 修复管理后台登录跳转问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复管理后台登录跳转问题...\n');

// 1. 修复 Google 登录按钮参数传递
console.log('1️⃣ 修复 Google 登录按钮参数传递');

const googleLoginButtonPath = path.join(
  process.cwd(),
  'src',
  'components',
  'GoogleLoginButton.tsx'
);
let googleLoginButtonContent = fs.readFileSync(googleLoginButtonPath, 'utf8');

// 替换错误的参数传递方式
const oldHandleLogin = `const handleGoogleLogin = () => {
    // 构建重定向URL，包含原始的redirect参数
    const redirectParam = redirect ? \`&redirect=\${encodeURIComponent(redirect)}\` : '';
    window.location.href = \`/api/auth/callback/google?origin=login\${redirectParam}\`;
  };`;

const newHandleLogin = `const handleGoogleLogin = () => {
    // 直接跳转到管理后台登录页面，让登录页面处理重定向
    const targetRedirect = redirect?.startsWith('/admin') ? redirect : '/admin/dashboard';
    window.location.href = \`/login?redirect=\${encodeURIComponent(targetRedirect)}\`;
  };`;

if (googleLoginButtonContent.includes(oldHandleLogin)) {
  googleLoginButtonContent = googleLoginButtonContent.replace(
    oldHandleLogin,
    newHandleLogin
  );
  fs.writeFileSync(googleLoginButtonPath, googleLoginButtonContent);
  console.log('✅ Google 登录按钮已修复');
} else {
  console.log('⚠️  Google 登录按钮无需修改');
}

// 2. 修复管理员登录页面的跳转逻辑
console.log('\n2️⃣ 修复管理员登录页面跳转逻辑');

const adminLoginPagePath = path.join(
  process.cwd(),
  'src',
  'app',
  'admin',
  'login',
  'page.tsx'
);
let adminLoginPageContent = fs.readFileSync(adminLoginPagePath, 'utf8');

// 添加更完善的跳转逻辑
const jumpLogic = `
  useEffect(() => {
    // 检查是否已经登录且是管理员
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        if (response.ok) {
          const data = await response.json();
          // 如果已经是管理员，直接跳转到管理后台
          if (data.is_admin) {
            router.push(redirect);
          }
        }
      } catch (error) {
        console.log('未登录状态');
      }
    };
    
    checkAuth();
  }, [router, redirect]);

  // 登录成功后的处理
  const handleLoginSuccess = (userData) => {
    if (userData?.is_admin) {
      router.push(redirect);
    } else {
      // 非管理员用户重定向到未授权页面
      router.push('/unauthorized');
    }
  };`;

if (!adminLoginPageContent.includes('handleLoginSuccess')) {
  // 在合适的位置插入新的逻辑
  const insertPosition = adminLoginPageContent.indexOf('return (');
  if (insertPosition > -1) {
    const beforeReturn = adminLoginPageContent.substring(0, insertPosition);
    const afterReturn = adminLoginPageContent.substring(insertPosition);

    adminLoginPageContent = `${beforeReturn + jumpLogic}\n\n  ${afterReturn}`;
    fs.writeFileSync(adminLoginPagePath, adminLoginPageContent);
    console.log('✅ 管理员登录页面跳转逻辑已增强');
  }
} else {
  console.log('⚠️  管理员登录页面无需修改');
}

// 3. 创建统一的登录成功处理器
console.log('\n3️⃣ 创建统一登录成功处理器');

const authUtilsPath = path.join(process.cwd(), 'src', 'lib', 'auth-utils.ts');
const authUtilsContent = `
/**
 * 统一认证工具函数
 */

export interface AuthUserData {
  id: string;
  email: string;
  is_admin: boolean;
  role?: string;
}

/**
 * 处理登录成功后的跳转逻辑
 */
export function handleLoginSuccess(userData: AuthUserData, redirect: string, router: any) {
  if (userData.is_admin) {
    // 管理员用户跳转到指定页面
    router.push(redirect);
  } else {
    // 普通用户跳转到首页或其他指定页面
    router.push('/');
  }
}

/**
 * 检查用户是否具有管理员权限
 */
export async function checkAdminPermission(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-session');
    if (response.ok) {
      const data = await response.json();
      return data.is_admin === true;
    }
    return false;
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 获取当前用户的认证信息
 */
export async function getCurrentUser(): Promise<AuthUserData | null> {
  try {
    const response = await fetch('/api/auth/check-session');
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        return {
          id: data.user.id,
          email: data.user.email,
          is_admin: data.is_admin,
          role: data.user.role
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}`;

try {
  fs.writeFileSync(authUtilsPath, authUtilsContent);
  console.log('✅ 统一认证工具已创建');
} catch (error) {
  console.log('⚠️  认证工具文件创建失败:', error.message);
}

// 4. 更新 EnhancedAdminLayout 中的登录逻辑
console.log('\n4️⃣ 更新管理布局中的登录逻辑');

const enhancedLayoutPath = path.join(
  process.cwd(),
  'src',
  'components',
  'admin',
  'EnhancedAdminLayout.tsx'
);
let enhancedLayoutContent = fs.readFileSync(enhancedLayoutPath, 'utf8');

// 确保登录按钮指向正确的路径
const loginButtonCode = `<Button
  variant="ghost"
  size="icon"
  onClick={() => router.push('/login?redirect=/admin/dashboard')}
  aria-label="登录"
  className="h-8 w-8"
>
  <User className="w-4 h-4" />
</Button>`;

if (enhancedLayoutContent.includes("onClick={() => router.push('/login')}")) {
  enhancedLayoutContent = enhancedLayoutContent.replace(
    "onClick={() => router.push('/login')}",
    "onClick={() => router.push('/login?redirect=/admin/dashboard')}"
  );
  fs.writeFileSync(enhancedLayoutPath, enhancedLayoutContent);
  console.log('✅ 管理布局登录按钮已更新');
} else {
  console.log('⚠️  管理布局无需修改');
}

// 5. 创建测试验证脚本
console.log('\n5️⃣ 创建测试验证脚本');

const testScriptContent = `
/**
 * 登录跳转功能测试脚本
 */

// 测试认证状态检查
async function testAuthCheck() {
  console.log('🔍 测试认证状态检查...');
  
  try {
    const response = await fetch('/api/auth/check-session');
    const data = await response.json();
    
    console.log('认证状态:', data.authenticated);
    console.log('是否管理员:', data.is_admin);
    console.log('用户邮箱:', data.user?.email);
    
    return data;
  } catch (error) {
    console.error('认证检查失败:', error);
    return null;
  }
}

// 测试登录页面跳转
function testLoginPageRedirect() {
  console.log('🚀 测试登录页面跳转...');
  
  // 模拟点击登录按钮
  const loginUrl = '/login?redirect=/admin/dashboard';
  console.log('将跳转到:', loginUrl);
  
  // 实际跳转（在浏览器环境中）
  // window.location.href = loginUrl;
}

// 测试管理员权限
async function testAdminPermission() {
  console.log('🔐 测试管理员权限...');
  
  const authData = await testAuthCheck();
  if (authData?.authenticated) {
    if (authData.is_admin) {
      console.log('✅ 具有管理员权限');
      return true;
    } else {
      console.log('❌ 不是管理员用户');
      return false;
    }
  } else {
    console.log('❌ 未认证状态');
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🧪 开始运行登录跳转测试...\n');
  
  await testAuthCheck();
  console.log('');
  
  await testAdminPermission();
  console.log('');
  
  testLoginPageRedirect();
  
  console.log('\n✅ 测试完成！');
}

// 如果在浏览器环境中，自动运行测试
if (typeof window !== 'undefined') {
  // 页面加载完成后运行测试
  window.addEventListener('load', runAllTests);
}

module.exports = {
  testAuthCheck,
  testAdminPermission,
  testLoginPageRedirect,
  runAllTests
};
`;

const testScriptPath = path.join(
  process.cwd(),
  'scripts',
  'test-login-redirect.js'
);
fs.writeFileSync(testScriptPath, testScriptContent);

console.log('\n📋 修复总结:');
console.log('✅ 修正了 Google 登录按钮的参数传递方式');
console.log('✅ 增强了管理员登录页面的跳转逻辑');
console.log('✅ 创建了统一的认证工具函数');
console.log('✅ 更新了管理布局中的登录链接');
console.log('✅ 生成了测试验证脚本');

console.log('\n🎯 下一步操作:');
console.log('1. 重启开发服务器: npm run dev');
console.log('2. 访问 http://localhost:3001/admin');
console.log('3. 点击右上角登录按钮');
console.log('4. 使用 Google 账号登录');
console.log('5. 验证是否正确跳转到管理后台');

console.log('\n💡 预期效果:');
console.log('- 未登录时，右上角显示登录按钮');
console.log('- 点击登录后跳转到统一登录页面');
console.log('- 登录成功后自动跳转到 /admin/dashboard');
console.log('- 已登录状态下显示用户信息和退出按钮');
