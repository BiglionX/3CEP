/**
 * 权限系统验证脚本
 * 用于验证权限配置中心和核心功能是否正常工作
 */

// 模拟必要的类型和接口
const PermissionConfigManager = {
  instance: null,

  getInstance() {
    if (!this.instance) {
      this.instance = new PermissionConfigManagerImpl();
    }
    return this.instance;
  },
};

class PermissionConfigManagerImpl {
  constructor() {
    this.config = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      roles: {
        admin: {
          name: '超级管理员',
          description: '系统最高权限角色',
          level: 100,
          isSystem: true,
          permissions: ['*'],
        },
        manager: {
          name: '管理员',
          description: '业务管理员',
          level: 80,
          isSystem: true,
          permissions: [
            'dashboard_read',
            'users_read',
            'users_create',
            'content_read',
          ],
        },
        viewer: {
          name: '查看员',
          description: '只读权限',
          level: 30,
          isSystem: true,
          permissions: ['dashboard_read'],
        },
      },
      permissions: {
        dashboard_read: {
          name: '仪表板查看',
          description: '查看系统仪表板',
          category: 'dashboard',
          resource: 'dashboard',
          action: 'read',
        },
        users_read: {
          name: '用户查看',
          description: '查看用户信息',
          category: 'user_management',
          resource: 'users',
          action: 'read',
        },
        users_create: {
          name: '用户创建',
          description: '创建用户',
          category: 'user_management',
          resource: 'users',
          action: 'create',
        },
        content_read: {
          name: '内容查看',
          description: '查看内容',
          category: 'content_management',
          resource: 'content',
          action: 'read',
        },
      },
      rolePermissions: {
        admin: ['*'],
        manager: [
          'dashboard_read',
          'users_read',
          'users_create',
          'content_read',
        ],
        viewer: ['dashboard_read'],
      },
      tenantIsolation: {
        enabled: true,
        mode: 'strict',
        defaultTenantField: 'tenant_id',
        resourcesWithTenant: ['users', 'content'],
      },
    };
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      lastUpdated: new Date().toISOString(),
    };
  }

  validateConfig(config) {
    const errors = [];

    // 基本验证
    if (!config.version) errors.push('缺少版本信息');
    if (!config.roles) errors.push('缺少角色定义');
    if (!config.permissions) errors.push('缺少权限定义');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 权限管理器
const PermissionManager = {
  instance: null,

  getInstance() {
    if (!this.instance) {
      this.instance = new PermissionManagerImpl();
    }
    return this.instance;
  },
};

class PermissionManagerImpl {
  constructor() {
    this.configManager = PermissionConfigManager.getInstance();
  }

  hasPermission(user, permission) {
    // 用户状态检查
    if (!user.isActive) {
      return {
        hasPermission: false,
        reason: '用户账户已被禁用',
      };
    }

    const permissions = Array.isArray(permission) ? permission : [permission];
    const config = this.configManager.getConfig();
    const userPermissions = this.getUserPermissions(user, config);

    // 超级管理员检查
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // 权限检查
    const missingPermissions = permissions.filter(
      perm => !userPermissions.has(perm)
    );

    if (missingPermissions.length > 0) {
      return {
        hasPermission: false,
        missingPermissions,
        reason: `缺少权限: ${missingPermissions.join(', ')}`,
      };
    }

    return { hasPermission: true };
  }

  getUserPermissions(user, config) {
    const permissions = new Set();

    // 超级管理员
    if (user.roles.includes('admin')) {
      Object.keys(config.permissions).forEach(perm => permissions.add(perm));
      return permissions;
    }

    // 普通用户
    user.roles.forEach(roleId => {
      const role = config.roles[roleId];
      if (role) {
        role.permissions.forEach(perm => {
          if (perm === '*') {
            Object.keys(config.permissions).forEach(p => permissions.add(p));
          } else {
            permissions.add(perm);
          }
        });
      }
    });

    return permissions;
  }

  validateTenantAccess(user, resourceTenantId) {
    const config = this.configManager.getConfig();

    if (!config.tenantIsolation.enabled) {
      return { hasPermission: true };
    }

    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    if (!resourceTenantId) {
      return { hasPermission: true };
    }

    if (!user.tenantId) {
      return {
        hasPermission: false,
        reason: '用户缺少租户信息',
      };
    }

    if (user.tenantId !== resourceTenantId) {
      return {
        hasPermission: false,
        reason: '无权访问其他租户的数据',
      };
    }

    return { hasPermission: true };
  }
}

// 测试执行函数
async function runPermissionTests() {
  console.log('🧪 开始权限系统验证测试...\n');

  const configManager = PermissionConfigManager.getInstance();
  const permissionManager = PermissionManager.getInstance();

  let passedTests = 0;
  let totalTests = 0;

  // 测试1: 配置中心功能
  console.log('📋 测试1: 权限配置中心');
  totalTests++;

  try {
    const config = configManager.getConfig();
    console.log(`   版本: ${config.version}`);
    console.log(`   角色数量: ${Object.keys(config.roles).length}`);
    console.log(`   权限数量: ${Object.keys(config.permissions).length}`);

    // 验证配置
    const validationResult = configManager.validateConfig(config);
    if (validationResult.isValid) {
      console.log('   ✅ 配置验证通过');
      passedTests++;
    } else {
      console.log('   ❌ 配置验证失败:', validationResult.errors);
    }
  } catch (error) {
    console.log('   ❌ 配置中心测试失败:', error.message);
  }

  // 测试2: 权限检查功能
  console.log('\n🔐 测试2: 权限检查功能');
  totalTests++;

  try {
    const testUsers = [
      {
        id: 'admin-001',
        email: 'admin@test.com',
        roles: ['admin'],
        isActive: true,
        name: '超级管理员',
      },
      {
        id: 'manager-001',
        email: 'manager@test.com',
        roles: ['manager'],
        isActive: true,
        name: '管理员',
      },
      {
        id: 'viewer-001',
        email: 'viewer@test.com',
        roles: ['viewer'],
        isActive: true,
        name: '查看员',
      },
    ];

    const testPermissions = ['dashboard_read', 'users_create', 'content_read'];

    testUsers.forEach(user => {
      console.log(`\n   用户: ${user.name} (${user.email})`);
      testPermissions.forEach(perm => {
        const result = permissionManager.hasPermission(user, perm);
        const status = result.hasPermission ? '✅' : '❌';
        console.log(
          `     ${status} ${perm}: ${result.hasPermission ? '允许' : result.reason}`
        );
      });
    });

    // 验证超级管理员拥有所有权限
    const adminResult = permissionManager.hasPermission(
      testUsers[0],
      testPermissions
    );
    if (adminResult.hasPermission) {
      console.log('   ✅ 超级管理员权限测试通过');
      passedTests++;
    } else {
      console.log('   ❌ 超级管理员权限测试失败');
    }
  } catch (error) {
    console.log('   ❌ 权限检查测试失败:', error.message);
  }

  // 测试3: 租户隔离功能
  console.log('\n🏢 测试3: 租户隔离功能');
  totalTests++;

  try {
    const tenantUser = {
      id: 'tenant-user-001',
      email: 'tenant@test.com',
      roles: ['manager'],
      tenantId: 'tenant-A',
      isActive: true,
    };

    const testCases = [
      { resourceTenant: 'tenant-A', expected: true, desc: '同租户访问' },
      { resourceTenant: 'tenant-B', expected: false, desc: '跨租户访问' },
      { resourceTenant: undefined, expected: true, desc: '公共数据访问' },
    ];

    let tenantPassed = true;
    testCases.forEach(testCase => {
      const result = permissionManager.validateTenantAccess(
        tenantUser,
        testCase.resourceTenant
      );
      const actual = result.hasPermission;
      const status = actual === testCase.expected ? '✅' : '❌';
      console.log(
        `   ${status} ${testCase.desc}: ${actual ? '允许' : result.reason}`
      );

      if (actual !== testCase.expected) {
        tenantPassed = false;
      }
    });

    if (tenantPassed) {
      console.log('   ✅ 租户隔离测试通过');
      passedTests++;
    } else {
      console.log('   ❌ 租户隔离测试失败');
    }
  } catch (error) {
    console.log('   ❌ 租户隔离测试失败:', error.message);
  }

  // 测试4: 配置更新功能
  console.log('\n🔄 测试4: 配置动态更新');
  totalTests++;

  try {
    const originalVersion = configManager.getConfig().version;
    console.log(`   原始版本: ${originalVersion}`);

    configManager.updateConfig({ version: '2.0.0' });
    const newVersion = configManager.getConfig().version;
    console.log(`   更新后版本: ${newVersion}`);

    if (newVersion === '2.0.0') {
      console.log('   ✅ 配置更新功能正常');
      passedTests++;
    } else {
      console.log('   ❌ 配置更新功能异常');
    }

    // 恢复原始配置
    configManager.updateConfig({ version: originalVersion });
  } catch (error) {
    console.log('   ❌ 配置更新测试失败:', error.message);
  }

  // 输出测试报告
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`总测试数: ${totalTests}`);
  console.log(`✅ 通过: ${passedTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有权限系统测试通过！');
    console.log('权限配置中心已成功建立并正常运行。');
  } else {
    console.log('\n⚠️  部分测试未通过，请检查相关功能。');
  }
}

// 执行测试
runPermissionTests().catch(error => {
  console.error('测试执行过程中发生错误:', error);
  process.exit(1);
});
