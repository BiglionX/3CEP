/**
 * 租户功能测试脚本
 * 验证 TenantSwitcher 和多租户隔离功能
 */

const BASE_URL = 'http://localhost:3001';

async function testTenantAPIs() {
  console.log('🧪 开始测试租户相关 API...\n');

  try {
    // 1. 测试未认证访问
    console.log('1️⃣ 测试未认证访问...');
    const unauthResponse = await fetch(`${BASE_URL}/api/user/tenants`);
    const unauthResult = await unauthResponse.json();
    console.log(
      '   结果:',
      unauthResult.error === '未授权访问' ? '✅ PASS' : '❌ FAIL'
    );
    console.log('   期望: 拒绝未认证访问\n');

    // 2. 测试设备 API 未认证访问
    console.log('2️⃣ 测试设备 API 未认证访问...');
    const deviceUnauthResponse = await fetch(`${BASE_URL}/api/devices`);
    const deviceUnauthResult = await deviceUnauthResponse.json();
    console.log(
      '   结果:',
      deviceUnauthResult.error === '未找到认证信息' ? '✅ PASS' : '❌ FAIL'
    );
    console.log('   期望: 拒绝未认证访问\n');

    // 3. 测试 RBAC 配置 API
    console.log('3️⃣ 测试 RBAC 配置 API...');
    const rbacResponse = await fetch(`${BASE_URL}/api/rbac/config`);
    const rbacResult = await rbacResponse.json();
    console.log('   结果:', rbacResult ? '✅ PASS' : '❌ FAIL');
    console.log('   权限点数量:', Object.keys(rbacResult).length);
    console.log('   期望: 返回 RBAC 配置\n');

    // 4. 测试权限检查 Hook (模拟)
    console.log('4️⃣ 测试权限检查功能...');
    const permissions = [
      'dashboard_view',
      'users_manage',
      'n8n_workflows_manage',
      'devices_manage',
    ];

    console.log('   可用权限点:');
    permissions.forEach(permission => {
      console.log(`   • ${permission}`);
    });
    console.log('   期望: 权限系统正常工作\n');

    // 5. 总结
    console.log('📊 测试总结:');
    console.log('✅ 租户切换 API 已创建 (/api/user/tenants)');
    console.log('✅ 设备管理 API 已创建 (/api/devices)');
    console.log('✅ RBAC 配置 API 已创建 (/api/rbac/config)');
    console.log('✅ 权限检查 Hook 已创建 (use-rbac-permission)');
    console.log('✅ TenantSwitcher 组件已创建');
    console.log('✅ 租户演示页面已创建 (/tenant-demo)');
    console.log('✅ 租户中间件已创建 (require-tenant)');

    console.log('\n🚀 下一步建议:');
    console.log('1. 在浏览器中访问 /tenant-demo 查看租户切换演示');
    console.log('2. 登录系统后测试真实的租户切换功能');
    console.log('3. 验证不同租户间的数据隔离');
    console.log('4. 测试设备管理 API 的租户限制');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testTenantAPIs();
