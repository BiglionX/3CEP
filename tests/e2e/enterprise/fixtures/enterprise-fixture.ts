/**
 * 企业用户端E2E测试Fixture配置
 * 提供测试所需的上下文和前置条件
 */

import { test as base, Page, APIRequestContext } from '@playwright/test';
import {
  createEnterpriseTestUtils,
  EnterpriseTestUtils,
} from '../utils/test-utils';
import {
  createTestDataManager,
  TestDataManager,
} from '../data/test-data-manager';
import {
  TEST_ENTERPRISE_USERS,
  ENTERPRISE_ROUTES,
  PERMISSIONS,
} from '../enterprise.config';

// 扩展测试上下文类型
interface EnterpriseTestFixtures {
  enterpriseUtils: EnterpriseTestUtils;
  testDataManager: TestDataManager;
  loginAs: (role?: keyof typeof TEST_ENTERPRISE_USERS) => Promise<void>;
  setupTestEnvironment: () => Promise<void>;
  cleanupTestEnvironment: () => Promise<void>;
}

// 创建扩展的测试对象
export const enterpriseTest = base.extend<EnterpriseTestFixtures>({
  // 企业测试工具实例
  enterpriseUtils: async ({ page, request }, use) => {
    const utils = createEnterpriseTestUtils(page, request);
    await use(utils);
  },

  // 测试数据管理器实例
  testDataManager: async ({ request }, use) => {
    const manager = createTestDataManager(request);
    await use(manager);
  },

  // 登录辅助函数
  loginAs: async ({ enterpriseUtils }, use) => {
    const loginFunction = async (
      role: keyof typeof TEST_ENTERPRISE_USERS = 'regularUser'
    ) => {
      await enterpriseUtils.loginAs(role);
    };
    await use(loginFunction);
  },

  // 测试环境设置
  setupTestEnvironment: async ({ testDataManager }, use) => {
    const setupFunction = async () => {
      // 重置测试环境
      await testDataManager.resetTestEnvironment();

      // 创建基础测试数据
      console.log('Setting up test environment...');
    };
    await use(setupFunction);
  },

  // 测试环境清理
  cleanupTestEnvironment: async ({ testDataManager }, use) => {
    const cleanupFunction = async () => {
      // 清理测试数据
      await testDataManager.cleanupAllTestData();
      console.log('Test environment cleaned up');
    };
    await use(cleanupFunction);
  },

  // 测试前后钩子
  page: async ({ page, setupTestEnvironment, cleanupTestEnvironment }, use) => {
    // 测试前设置
    await setupTestEnvironment();

    // 执行测试
    await use(page);

    // 测试后清理
    await cleanupTestEnvironment();
  },
});

// 角色特定的测试组
export const enterpriseAdminTest = enterpriseTest.extend({
  page: async ({ page, loginAs }, use) => {
    // 以管理员身份登录
    await loginAs('admin');
    await use(page);
  },
});

export const procurementManagerTest = enterpriseTest.extend({
  page: async ({ page, loginAs }, use) => {
    // 以采购经理身份登录
    await loginAs('procurementManager');
    await use(page);
  },
});

export const agentOperatorTest = enterpriseTest.extend({
  page: async ({ page, loginAs }, use) => {
    // 以智能体操作员身份登录
    await loginAs('agentOperator');
    await use(page);
  },
});

export const regularUserTest = enterpriseTest.extend({
  page: async ({ page, loginAs }, use) => {
    // 以普通用户身份登录
    await loginAs('regularUser');
    await use(page);
  },
});

// 权限测试专用fixture
export const permissionTest = enterpriseTest.extend({
  // 不自动登录，用于测试权限控制
  page: async ({ page }, use) => {
    await use(page);
  },
});

// API测试专用fixture
interface ApiTestFixtures {
  testDataManager: TestDataManager;
}

export const apiTest = base.extend<ApiTestFixtures>({
  testDataManager: async ({ request }, use) => {
    const manager = createTestDataManager(request);
    await use(manager);
  },
});

// 导出常用的测试配置
export { expect } from '@playwright/test';

// 默认导出企业测试对象
export default enterpriseTest;
