/**
 * 快速登录并设置 Cookie
 * 在浏览器控制台运行此脚本
 */
(function quickLogin() {
  console.log('=================================');
  console.log('🔐 快速登录工具');
  console.log('=================================\n');

  // 检查当前是否在登录页面
  if (window.location.pathname === '/login') {
    console.log('✅ 当前已在登录页面');
    console.log('请直接输入用户名和密码进行登录\n');
    console.log('登录成功后，系统会自动:');
    console.log('1. 设置正确的 Cookie: sb-hrjqzbhqueleszkvnsen-auth-token');
    console.log('2. 保存 token 到 localStorage');
    console.log('3. 自动跳转到管理页面\n');
    console.log('=================================');
    return;
  }

  // 不在登录页面，提供导航
  console.log('❌ 未找到认证 token，需要登录\n');
  console.log('📋 登录步骤:');
  console.log('1. 访问登录页面: http://localhost:3001/login');
  console.log('2. 输入用户名和密码');
  console.log('3. 点击登录按钮');
  console.log('4. 登录成功后会自动跳转\n');

  // 询问是否要跳转
  const shouldNavigate = confirm(
    '是否要立即跳转到登录页面？\n\n点击"确定"跳转，点击"取消"留在当前页面'
  );

  if (shouldNavigate) {
    console.log('🔄 正在跳转到登录页面...');
    window.location.href = '/login';
  } else {
    console.log('⏸️  已取消跳转，您可以手动访问 /login 页面');
  }

  console.log('\n=================================');
  console.log('💡 提示:');
  console.log('- 登录成功后 Cookie 会自动设置');
  console.log('- 如果仍有 401 错误，请刷新页面');
  console.log('- 查看 QUICK_FIX_401.md 获取更多帮助');
  console.log('=================================\n');
})();
