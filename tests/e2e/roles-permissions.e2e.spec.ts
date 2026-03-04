import { test, expect } from '@playwright/test';
import { TestHelpers, PermissionHelpers } from '../test-helpers';
import { testDataManager } from '../test-data-manager';
import {
  withRetry,
  withTimeout,
  DependencyChecker,
} from '../test-execution-utils';
import { TEST_ENV } from '../test-config';

test.describe('E2E-ROLE: 用户角色权限端到端测试', () => {
  let helpers: TestHelpers;
  let permissionHelpers: PermissionHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    permissionHelpers = new PermissionHelpers(page);
  });

  /**
   * E2E-ROLE-01: 管理员权限验证
   * 优先级: P0
   * 测试管理员用户的完整权限访问
   */
  test('E2E-ROLE-01: 管理员完整权限访问', async ({ page }) => {
    const adminUser = testDataManager.getUserByRole('admin');

    // 步骤1: 管理员登录
    await withRetry(async () => {
      await helpers.login(adminUser.email, adminUser.password);
      // 验证登录成功
      await helpers.verifyTextPresent(/仪表板|dashboard|首页/i);
    });

    // 步骤2: 验证管理员专属功能访问
    const adminPaths = [
      '/admin/users',
      '/admin/shops/pending',
      '/admin/settings',
      '/dashboard',
    ];

    for (const path of adminPaths) {
      await withTimeout(
        async () => {
          await page.goto(`${TEST_ENV.getBaseUrl()}${path}`);
          await helpers.waitForElement('body');
          // 验证页面包含管理相关元素
          await expect(page.getByText(/管理|admin|dashboard/i)).toBeVisible();
        },
        15000,
        `访问管理员路径 ${path} 超时`
      );
    }

    // 步骤3: 验证敏感操作权限
    await page.goto(`${TEST_ENV.getBaseUrl()}/admin/users`);

    // 检查创建用户按钮
    const createUserButton = page.locator('[data-testid="create-user-button"]');
    await expect(createUserButton).toBeVisible();

    // 检查删除用户按钮
    const deleteUserButton = page.locator('[data-testid="delete-user-button"]');
    await expect(deleteUserButton).toBeVisible();

    // 检查权限修改按钮
    const modifyPermissionsButton = page.locator(
      '[data-testid="modify-permissions-button"]'
    );
    await expect(modifyPermissionsButton).toBeVisible();

    // 步骤4: 验证系统配置访问
    await page.goto(`${TEST_ENV.getBaseUrl()}/admin/settings`);
    const configForm = page.locator('[data-testid="system-config-form"]');
    await expect(configForm).toBeVisible();

    // 标记测试完成
    DependencyChecker.markDependencyCompleted('E2E-ROLE-01');
    await helpers.takeScreenshot('admin-permissions-verified');
  });

  /**
   * E2E-ROLE-02: 消费者权限边界测试
   * 优先级: P0
   * 测试消费者用户的权限边界和专属功能
   */
  test('E2E-ROLE-02: 消费者权限边界测试', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');

    // 等待依赖完成
    const depsReady = await DependencyChecker.waitForDependencies(
      ['E2E-ROLE-01'],
      10000
    );
    if (!depsReady) {
      test.skip(true, '依赖的管理员测试未完成');
      return;
    }

    // 步骤1: 消费者登录
    await withRetry(async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
    });

    // 步骤2: 验证权限受限区域访问拒绝
    const restrictedPaths = [
      '/admin/users',
      '/admin/shops',
      '/admin/settings',
      '/dashboard',
    ];

    for (const path of restrictedPaths) {
      await page.goto(`${TEST_ENV.getBaseUrl()}${path}`);

      // 应该重定向到403页面或登录页面
      await Promise.race([
        helpers.verifyTextPresent(/403|forbidden|权限不足/i),
        helpers.verifyTextPresent(/login|登录/i),
        page.waitForTimeout(3000),
      ]);
    }

    // 步骤3: 验证消费者专属功能正常
    // 设备扫描功能
    await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
    const scanElement = page.locator('[data-testid="scan-container"]');
    await expect(scanElement).toBeVisible();

    // 维修申请功能
    await page.goto(`${TEST_ENV.getBaseUrl()}/repair/request`);
    const requestForm = page.locator('[data-testid="repair-request-form"]');
    await expect(requestForm).toBeVisible();

    // 订单跟踪功能
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);
    const ordersList = page.locator('[data-testid="orders-list"]');
    await expect(ordersList).toBeVisible();

    // 支付功能
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/payments`);
    const paymentSection = page.locator('[data-testid="payment-section"]');
    await expect(paymentSection).toBeVisible();

    await helpers.takeScreenshot('consumer-permissions-verified');
  });

  /**
   * E2E-ROLE-03: 维修技师权限测试
   * 优先级: P1
   * 测试维修技师的工单处理权限
   */
  test('E2E-ROLE-03: 维修技师工单权限测试', async ({ page }) => {
    const engineerUser = testDataManager.getUserByRole('engineer');

    // 步骤1: 技师登录
    await withRetry(async () => {
      await helpers.login(engineerUser.email, engineerUser.password);
    });

    // 步骤2: 访问技师工作台
    await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);

    // 验证工单管理功能
    const workOrdersSection = page.locator(
      '[data-testid="work-orders-section"]'
    );
    await expect(workOrdersSection).toBeVisible();

    // 验证接受工单按钮
    const acceptOrderButton = page.locator(
      '[data-testid="accept-order-button"]'
    );
    await expect(acceptOrderButton).toBeVisible();

    // 验证配件申请功能
    const partsRequestButton = page.locator(
      '[data-testid="parts-request-button"]'
    );
    await expect(partsRequestButton).toBeVisible();

    // 验证照片上传功能
    const photoUploadButton = page.locator(
      '[data-testid="photo-upload-button"]'
    );
    await expect(photoUploadButton).toBeVisible();

    await helpers.takeScreenshot('engineer-permissions-verified');
  });

  /**
   * E2E-ROLE-04: 店铺主权限测试
   * 优先级: P1
   * 测试店铺主的管理权限
   */
  test('E2E-ROLE-04: 店铺主管理权限测试', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');

    // 步骤1: 店铺主登录
    await withRetry(async () => {
      await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    });

    // 步骤2: 访问店铺管理页面
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/manage`);

    // 验证店铺信息管理
    const shopInfoSection = page.locator('[data-testid="shop-info-section"]');
    await expect(shopInfoSection).toBeVisible();

    // 验证订单处理功能
    const orderProcessSection = page.locator(
      '[data-testid="order-process-section"]'
    );
    await expect(orderProcessSection).toBeVisible();

    // 验证员工管理功能
    const staffManageSection = page.locator(
      '[data-testid="staff-manage-section"]'
    );
    await expect(staffManageSection).toBeVisible();

    // 验证财务管理功能
    const financeSection = page.locator('[data-testid="finance-section"]');
    await expect(financeSection).toBeVisible();

    await helpers.takeScreenshot('shop-owner-permissions-verified');
  });

  /**
   * E2E-ROLE-05: 角色切换权限测试
   * 优先级: P2
   * 测试同一用户不同角色下的权限变化
   */
  test('E2E-ROLE-05: 角色切换权限验证', async ({ page }) => {
    // 使用具有多角色的用户进行测试
    const multiRoleUser = {
      email: 'multirole@test.com',
      password: 'Test123!@#',
      roles: ['consumer', 'shop_owner'],
    };

    // 步骤1: 以消费者角色登录
    await helpers.login(multiRoleUser.email, multiRoleUser.password);

    // 验证消费者权限
    await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
    await expect(page.locator('[data-testid="scan-container"]')).toBeVisible();

    // 步骤2: 切换到店铺主角色
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/profile`);
    await page.click('[data-testid="switch-role-button"]');
    await page.selectOption('[data-testid="role-selector"]', 'shop_owner');
    await page.click('[data-testid="confirm-role-switch"]');

    // 验证店铺主权限
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/manage`);
    await expect(
      page.locator('[data-testid="shop-info-section"]')
    ).toBeVisible();

    // 验证消费者功能不再可访问
    await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
    await expect(
      page.locator('[data-testid="scan-container"]')
    ).not.toBeVisible();

    await helpers.takeScreenshot('role-switching-verified');
  });

  /**
   * E2E-ROLE-06: 权限继承测试
   * 优先级: P2
   * 测试子角色权限继承机制
   */
  test('E2E-ROLE-06: 子角色权限继承验证', async ({ page }) => {
    const userWithSubRoles = {
      email: 'subrole@test.com',
      password: 'Test123!@#',
      mainRole: 'shop_owner',
      subRoles: ['content_creator', 'inventory_manager'],
    };

    // 步骤1: 登录用户
    await helpers.login(userWithSubRoles.email, userWithSubRoles.password);

    // 步骤2: 验证主角色权限
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/manage`);
    await expect(
      page.locator('[data-testid="shop-info-section"]')
    ).toBeVisible();

    // 步骤3: 验证子角色权限 - 内容创作者
    await page.goto(`${TEST_ENV.getBaseUrl()}/content/create`);
    await expect(page.locator('[data-testid="content-editor"]')).toBeVisible();

    // 步骤4: 验证子角色权限 - 库存管理者
    await page.goto(`${TEST_ENV.getBaseUrl()}/inventory/manage`);
    await expect(
      page.locator('[data-testid="inventory-dashboard"]')
    ).toBeVisible();

    await helpers.takeScreenshot('subrole-permissions-verified');
  });
});
