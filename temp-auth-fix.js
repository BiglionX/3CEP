// 临时认证修复脚本
// 在浏览器Console中运行

console.log('🚀 执行临时认证修复...');

// 设置临时管理员权限
localStorage.setItem('temp-admin-access', 'true');
localStorage.setItem('is-admin', 'true');
localStorage.setItem('user-role', 'admin');

// 设置临时用户信息
const tempUser = {
  id: `temp-user-${Date.now()}`,
  email: 'admin@temporary.local',
  roles: ['admin'],
  is_admin: true,
};
localStorage.setItem('temp-user-info', JSON.stringify(tempUser));

console.log('✅ 临时认证已设置');
console.log('🔄 页面将在3秒后刷新...');

setTimeout(() => {
  window.location.reload();
}, 3000);
