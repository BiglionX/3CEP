
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
  console.log('🧪 开始运行登录跳转测试...
');
  
  await testAuthCheck();
  console.log('');
  
  await testAdminPermission();
  console.log('');
  
  testLoginPageRedirect();
  
  console.log('
✅ 测试完成！');
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
