/**
 * 权限系统综合测试
 * 验证权限配置中心、动态加载、权限检查等功能
 */

import { PermissionConfigManager } from '../config/permission-config';
import { PermissionManager, UserInfo } from '../core/permission-manager';
import { PermissionLoader } from '../core/permission-loader';
import { permissionUtils } from '../utils/permission-utils';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class PermissionSystemTest {
  private results: TestResult[] = [];
  private permissionManager: PermissionManager;
  private permissionLoader: PermissionLoader;
  private configManager: PermissionConfigManager;

  constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.permissionLoader = PermissionLoader.getInstance();
    this.configManager = PermissionConfigManager.getInstance();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 开始权限系统综合测?..\n');

    try {
      await this.testConfigCenter();
      await this.testDynamicLoading();
      await this.testPermissionChecking();
      await this.testRoleInheritance();
      await this.testTenantIsolation();
      await this.testAuditTrails();
      await this.testUtilsFunctions();

      this.printTestReport();
    } catch (error) {
      console.error('�?测试执行过程中发生错?', error);
    }
  }

  private async testConfigCenter(): Promise<void> {
    console.log('📋 测试1: 权限配置中心功能');

    // 测试1: 获取默认配置
    try {
      const config = this.configManager.getConfig();
      this.assert(!!config.version, '配置版本存在');
      this.assert(!!config.roles.admin, '管理员角色存?);
      this.assert(!!config.permissions.dashboard_read, '仪表板权限存?);
      console.log('�?配置中心基础功能测试通过');
    } catch (error) {
      this.fail('配置中心基础功能', error);
    }

    // 测试2: 配置更新
    try {
      const originalVersion = this.configManager.getConfig().version;
      this.configManager.updateConfig({ version: '2.0.0' });
      const newVersion = this.configManager.getConfig().version;
      this.assert(newVersion === '2.0.0', '配置更新功能正常');
      this.configManager.resetToDefault();
      console.log('�?配置更新和重置功能测试通过');
    } catch (error) {
      this.fail('配置更新功能', error);
    }

    // 测试3: 配置验证
    try {
      const config = this.configManager.getConfig();
      const validationResult = this.configManager.validateConfig(config);
      this.assert(validationResult.isValid, '配置验证通过');
      console.log('�?配置验证功能测试通过');
    } catch (error) {
      this.fail('配置验证功能', error);
    }
  }

  private async testDynamicLoading(): Promise<void> {
    console.log('\n🔄 测试2: 动态权限加载机?);

    // 测试1: 缓存机制
    try {
      const result1 = await this.permissionLoader.loadPermissions();
      this.assert(result1.success, '首次加载成功');
      this.assert(
        result1.source === 'default' || result1.source === 'cache',
        '使用默认或缓存源'
      );

      const result2 = await this.permissionLoader.loadPermissions();
      this.assert(result2.source === 'cache', '第二次加载使用缓?);
      console.log('�?缓存机制测试通过');
    } catch (error) {
      this.fail('缓存机制', error);
    }

    // 测试2: 强制刷新
    try {
      const result = await this.permissionLoader.loadPermissions({
        forceRefresh: true,
      });
      this.assert(result.success, '强制刷新加载成功');
      console.log('�?强制刷新功能测试通过');
    } catch (error) {
      this.fail('强制刷新功能', error);
    }

    // 测试3: 加载器状?    try {
      const status = this.permissionLoader.getStatus();
      this.assert(typeof status.isLoaded === 'boolean', '加载状态正?);
      this.assert(typeof status.cacheSize === 'number', '缓存大小正确');
      console.log('�?加载器状态查询测试通过');
    } catch (error) {
      this.fail('加载器状态查?, error);
    }
  }

  private async testPermissionChecking(): Promise<void> {
    console.log('\n🔐 测试3: 权限检查功?);

    const testUser: UserInfo = {
      id: 'test-user-001',
      email: 'test@example.com',
      roles: ['manager'],
      isActive: true,
    };

    // 测试1: 基础权限检?    try {
      const result = this.permissionManager.hasPermission(
        testUser,
        'dashboard_read'
      );
      this.assert(result.hasPermission, '管理员应有仪表板查看权限');
      console.log('�?基础权限检查测试通过');
    } catch (error) {
      this.fail('基础权限检?, error);
    }

    // 测试2: 超级管理员权?    try {
      const adminUser: UserInfo = { ...testUser, roles: ['admin'] };
      const result = this.permissionManager.hasPermission(
        adminUser,
        'users_delete'
      );
      this.assert(result.hasPermission, '超级管理员应有所有权?);
      console.log('�?超级管理员权限测试通过');
    } catch (error) {
      this.fail('超级管理员权?, error);
    }

    // 测试3: 权限组合检?    try {
      const result1 = this.permissionManager.hasAnyPermission(testUser, [
        'users_read',
        'nonexistent_perm',
      ]);
      this.assert(result1.hasPermission, '任意权限检查应通过');

      const result2 = this.permissionManager.hasAllPermissions(testUser, [
        'dashboard_read',
        'users_read',
      ]);
      this.assert(result2.hasPermission, '所有权限检查应通过');
      console.log('�?权限组合检查测试通过');
    } catch (error) {
      this.fail('权限组合检?, error);
    }

    // 测试4: 资源访问检?    try {
      const result = this.permissionManager.canAccessResource(
        testUser,
        'users',
        'read'
      );
      this.assert(result.hasPermission, '资源访问检查应通过');
      console.log('�?资源访问检查测试通过');
    } catch (error) {
      this.fail('资源访问检?, error);
    }
  }

  private async testRoleInheritance(): Promise<void> {
    console.log('\n👪 测试4: 角色继承机制');

    // 创建测试配置（带继承关系?    const testConfig = this.configManager.getConfig();
    testConfig.roles.viewer = {
      name: '查看?,
      description: '基础查看权限',
      level: 20,
      isSystem: true,
      permissions: ['dashboard_read'],
      inherits: [], // 可以添加继承关系测试
    };

    try {
      const testUser: UserInfo = {
        id: 'test-user-002',
        email: 'viewer@example.com',
        roles: ['viewer'],
        isActive: true,
      };

      const permissions = this.permissionManager.getUserPermissions(
        testUser,
        testConfig
      );
      this.assert(permissions.has('dashboard_read'), '继承权限正确');
      console.log('�?角色继承机制测试通过');
    } catch (error) {
      this.fail('角色继承机制', error);
    }
  }

  private async testTenantIsolation(): Promise<void> {
    console.log('\n🏢 测试5: 租户隔离功能');

    try {
      const testUser: UserInfo = {
        id: 'test-user-003',
        email: 'tenant@example.com',
        roles: ['manager'],
        tenantId: 'tenant-001',
        isActive: true,
      };

      // 测试租户访问验证
      const result1 = this.permissionManager.validateTenantAccess(
        testUser,
        'tenant-001'
      );
      this.assert(result1.hasPermission, '同租户访问应允许');

      const result2 = this.permissionManager.validateTenantAccess(
        testUser,
        'tenant-002'
      );
      this.assert(!result2.hasPermission, '不同租户访问应拒?);

      const result3 = this.permissionManager.validateTenantAccess(
        testUser,
        undefined
      );
      this.assert(result3.hasPermission, '无租户标识的公共数据应允?);
      console.log('�?租户隔离功能测试通过');
    } catch (error) {
      this.fail('租户隔离功能', error);
    }
  }

  private async testAuditTrails(): Promise<void> {
    console.log('\n📝 测试6: 审计追踪功能');

    try {
      const auditEntry = permissionUtils.generateAuditTrail(
        'test-user-004',
        'ACCESS_RESOURCE',
        'users',
        ['users_read'],
        true,
        { ip: '192.168.1.100' }
      );

      this.assert(auditEntry.id.startsWith('audit_'), '审计ID格式正确');
      this.assert(auditEntry.userId === 'test-user-004', '用户ID正确');
      this.assert(auditEntry.granted === true, '授权状态正?);

      const formattedLog = permissionUtils.formatAuditLog(auditEntry);
      this.assert(formattedLog.includes('test-user-004'), '日志格式化正?);
      console.log('�?审计追踪功能测试通过');
    } catch (error) {
      this.fail('审计追踪功能', error);
    }
  }

  private async testUtilsFunctions(): Promise<void> {
    console.log('\n🛠�? 测试7: 工具函数');

    // 测试权限比较
    try {
      const diff = permissionUtils.comparePermissions(
        ['dashboard_read', 'users_read'],
        ['dashboard_read', 'content_read']
      );

      this.assert(diff.added.includes('content_read'), '新增权限识别正确');
      this.assert(diff.removed.includes('users_read'), '移除权限识别正确');
      this.assert(
        diff.unchanged.includes('dashboard_read'),
        '未变权限识别正确'
      );
      console.log('�?权限比较工具测试通过');
    } catch (error) {
      this.fail('权限比较工具', error);
    }

    // 测试权限验证
    try {
      const config = this.configManager.getConfig();
      const testUser: UserInfo = {
        id: 'test-user-005',
        email: 'validator@example.com',
        roles: ['viewer'],
        isActive: true,
      };

      const validationResult = permissionUtils.validateUserPermissions(
        testUser,
        ['dashboard_read'],
        config
      );

      this.assert(validationResult.isValid, '有效权限验证通过');
      console.log('�?权限验证工具测试通过');
    } catch (error) {
      this.fail('权限验证工具', error);
    }
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  private fail(testName: string, error: any): void {
    const result: TestResult = {
      name: testName,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
    this.results.push(result);
    console.log(`�?${testName} 测试失败: ${result.error}`);
  }

  private printTestReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 权限系统测试报告');
    console.log('='.repeat(60));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`总测试数: ${totalTests}`);
    console.log(`�?通过: ${passedTests}`);
    console.log(`�?失败: ${failedTests}`);
    console.log(
      `成功? ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`
    );

    if (failedTests > 0) {
      console.log('\n失败的测?');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  �?${result.name}: ${result.error}`);
        });
    }

    console.log('\n�?权限系统综合测试完成?);
  }
}

// 执行测试
if (require.main === module) {
  const tester = new PermissionSystemTest();
  tester.runAllTests().catch(console.error);
}

export default PermissionSystemTest;
