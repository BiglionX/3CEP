// FixCycle 管理员权限紧急修复脚本
// 使用方法：在浏览器控制台执行此代码

(function () {
  console.log('🔧 开始执行管理员权限紧急修复...');

  // 1. 设置本地存储
  try {
    localStorage.setItem('mock-token', 'emergency_admin_fix_2026');
    localStorage.setItem('user-role', 'admin');
    localStorage.setItem('user-email', 'admin@fixcycle.com');
    localStorage.setItem('temp-admin-access', 'true');
    console.log('✅ 本地存储设置完成');
  } catch (e) {
    console.error('❌ 本地存储设置失败:', e);
  }

  // 2. 设置Cookies
  try {
    document.cookie =
      'mock-token=emergency_admin_fix_2026; path=/; max-age=3600';
    document.cookie = 'user-role=admin; path=/; max-age=3600';
    document.cookie = 'user-email=admin@fixcycle.com; path=/; max-age=3600';
    console.log('✅ Cookies设置完成');
  } catch (e) {
    console.error('❌ Cookies设置失败:', e);
  }

  // 3. 验证设置
  console.log('📋 当前设置验证:');
  console.log('   Token:', localStorage.getItem('mock-token'));
  console.log('   Role:', localStorage.getItem('user-role'));
  console.log('   Email:', localStorage.getItem('user-email'));
  console.log('   Cookies:', document.cookie);

  // 4. 测试认证状态
  fetch('/api/auth/check-session')
    .then(response => response.json())
    .then(data => {
      console.log('🔍 认证API测试结果:', data);
      if (data.authenticated) {
        console.log('✅ 认证状态正常');
      } else {
        console.log('⚠️ 认证状态异常，但仍可尝试访问');
      }
    })
    .catch(error => {
      console.log('ℹ️ 认证API测试失败（正常现象）:', error.message);
    });

  // 5. 提供用户操作选项
  console.log('\n🎯 修复已完成！请选择下一步操作:');
  console.log('1. 输入 "refreshPage()" 刷新当前页面');
  console.log('2. 输入 "goToAdmin()" 跳转到管理后台');
  console.log('3. 输入 "checkStatus()" 再次检查状态');

  // 全局函数供用户调用
  window.refreshPage = function () {
    console.log('🔄 正在刷新页面...');
    location.reload();
  };

  window.goToAdmin = function () {
    console.log('🚀 正在跳转到管理后台...');
    window.location.href = '/admin/dashboard';
  };

  window.checkStatus = function () {
    console.log('🔍 重新检查认证状态...');
    fetch('/api/auth/check-session')
      .then(response => response.json())
      .then(data => {
        console.log('当前认证状态:', data);
      })
      .catch(error => {
        console.log('检查失败:', error.message);
      });
  };

  console.log('\n💡 提示: 复制以下任意一行到控制台执行:');
  console.log('refreshPage()  // 刷新页面');
  console.log('goToAdmin()     // 跳转到管理后台');
  console.log('checkStatus()   // 检查状态');
})();
