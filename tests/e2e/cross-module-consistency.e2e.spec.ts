import { test, expect } from '@playwright/test';
import { TestHelpers } from '../test-helpers';
import { testDataManager } from '../test-data-manager';
import {
  withRetry,
  withTimeout,
  TestStepExecutor,
  DependencyChecker,
} from '../test-execution-utils';
import { TEST_ENV } from '../test-config';

test.describe('E2E-CROSS: 跨模块数据一致性验证', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  /**
   * E2E-CROSS-01: 用户数据一致性验证
   * 优先级: P0
   * 验证用户在不同模块间的数据一致性
   */
  test('E2E-CROSS-01: 用户数据跨模块一致性验证', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');

    const executor = new TestStepExecutor();

    // 步骤1: 在用户中心更新个人信息
    executor.addStep('更新用户中心信息', async () => {
      await withRetry(async () => {
        await helpers.login(consumerUser.email, consumerUser.password);
      });

      await page.goto(`${TEST_ENV.getBaseUrl()}/user/profile`);
      await helpers.waitForElement('[data-testid="profile-edit-form"]');

      // 更新用户信息
      const updatedPhone = '13999999999';
      const updatedAddress = '深圳市南山区科技园测试地址';

      await helpers.fillForm({
        '[data-testid="phone-input"]': updatedPhone,
        '[data-testid="address-input"]': updatedAddress,
      });

      await helpers.clickAndWait('[data-testid="save-profile-button"]');
      await helpers.verifyTextPresent(/保存成功|更新完成/i);
    });

    // 步骤2: 验证维修模块中的用户信息同步
    executor.addStep('验证维修模块信息同步', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/repair/request`);
      await helpers.waitForElement('[data-testid="repair-form"]');

      // 检查联系方式是否同步更新
      const phoneInput = page.locator('[data-testid="contact-phone"]');
      await expect(phoneInput).toHaveValue('13999999999');

      // 检查地址信息是否同步
      const addressInput = page.locator('[data-testid="service-address"]');
      await expect(addressInput).toHaveValue(/南山区科技园/);
    });

    // 步骤3: 验证订单模块中的用户信息
    executor.addStep('验证订单模块信息同步', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);

      // 查看订单详情中的联系信息
      const orderItem = page.locator('[data-testid="order-item"]').first();
      await orderItem.click();

      await helpers.waitForElement('[data-testid="order-details"]');
      await helpers.verifyTextPresent('13999999999');
      await helpers.verifyTextPresent(/南山区科技园/);
    });

    // 步骤4: 验证FCX钱包中的用户信息
    executor.addStep('验证FCX钱包信息同步', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/wallet`);

      // 检查账户信息显示
      await helpers.verifyTextPresent(consumerUser.email);
      await helpers.verifyElementExists('[data-testid="user-profile-summary"]');
    });

    // 执行所有步骤
    const result = await executor.execute();

    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-CROSS-01');
      await helpers.takeScreenshot('user-data-consistency-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-CROSS-01',
        result.failedSteps.join(', ')
      );
      await helpers.takeScreenshot('user-data-consistency-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-CROSS-02: 设备数据流转一致性
   * 优先级: P0
   * 验证设备信息在扫码、诊断、维修、跟踪等模块间的一致性
   */
  test('E2E-CROSS-02: 设备数据流转一致性验证', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    const testDevice = testDataManager.getDeviceById('DEVICE_001');

    const executor = new TestStepExecutor();

    // 步骤1: 设备扫码识别
    executor.addStep('设备扫码识别', async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);

      await helpers.scanQRCode(testDevice.id);
      await helpers.verifyTextPresent(testDevice.model);
      await helpers.verifyTextPresent(testDevice.brand);
      await helpers.verifyTextPresent(testDevice.serial);
    });

    // 步骤2: 故障诊断数据传递
    executor.addStep('故障诊断数据传递', async () => {
      await helpers.selectFaultType('screen_broken');
      await helpers.submitForm('[data-testid="diagnose-button"]');

      // 验证设备信息在诊断页面正确显示
      await helpers.waitForElement('[data-testid="diagnosis-result"]');
      await helpers.verifyTextPresent(testDevice.id);
      await helpers.verifyTextPresent('screen_broken');
      await helpers.verifyTextPresent(testDevice.model);
    });

    // 步骤3: 维修订单创建与数据同步
    executor.addStep('维修订单创建', async () => {
      await helpers.clickAndWait('[data-testid="create-order-button"]');

      // 验证订单创建页面的设备信息
      await helpers.waitForElement('[data-testid="order-creation-form"]');
      await helpers.verifyTextPresent(testDevice.id);
      await helpers.verifyTextPresent(testDevice.model);
      await helpers.verifyTextPresent('screen_broken');

      // 提交订单
      await helpers.clickAndWait('[data-testid="submit-order-button"]');
      await helpers.verifyTextPresent(/订单创建成功|维修单号/i);
    });

    // 步骤4: 技师端接收订单数据验证
    executor.addStep('技师端数据验证', async () => {
      const engineerUser = testDataManager.getUserByRole('engineer');
      await helpers.login(engineerUser.email, engineerUser.password);

      await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);

      // 查找对应设备的工单
      const workOrder = page.locator(
        `[data-testid="work-order-${testDevice.id}"]`
      );
      await expect(workOrder).toBeVisible();

      // 验证工单详情中的设备信息
      await workOrder.click();
      await helpers.verifyTextPresent(testDevice.id);
      await helpers.verifyTextPresent(testDevice.model);
      await helpers.verifyTextPresent(testDevice.serial);
      await helpers.verifyTextPresent('screen_broken');
    });

    // 步骤5: 进度跟踪数据一致性
    executor.addStep('进度跟踪数据验证', async () => {
      // 切换回消费者账号查看进度
      await helpers.login(consumerUser.email, consumerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);

      const orderItem = page.locator(`[data-testid="order-${testDevice.id}"]`);
      await expect(orderItem).toBeVisible();

      // 验证订单详情中的完整设备信息
      await orderItem.click();
      await helpers.verifyTextPresent(testDevice.id);
      await helpers.verifyTextPresent(testDevice.model);
      await helpers.verifyTextPresent(testDevice.serial);
      await helpers.verifyTextPresent('screen_broken');
    });

    // 执行所有步骤
    const result = await executor.execute();

    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-CROSS-02');
      await helpers.takeScreenshot('device-data-consistency-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-CROSS-02',
        result.failedSteps.join(', ')
      );
      await helpers.takeScreenshot('device-data-consistency-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-CROSS-03: 配件库存数据一致性
   * 优先级: P1
   * 验证配件信息在搜索、采购、库存、维修等模块间的一致性
   */
  test('E2E-CROSS-03: 配件库存数据一致性验证', async ({ page }) => {
    const testPart = testDataManager.getPartBySKU('IPH12SCR-001');
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');

    const executor = new TestStepExecutor();

    // 步骤1: 配件搜索模块数据验证
    executor.addStep('配件搜索数据验证', async () => {
      await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/parts/search`);

      await page.fill('[data-testid="parts-search-input"]', testPart.name);
      await helpers.clickAndWait('[data-testid="search-button"]');

      const searchResult = page.locator(
        `[data-testid="part-result-${testPart.sku}"]`
      );
      await expect(searchResult).toBeVisible();

      // 验证搜索结果中的配件信息
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.price.toString());
      await helpers.verifyTextPresent(testPart.supplier);
    });

    // 步骤2: 库存管理模块数据同步
    executor.addStep('库存管理数据验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/shop/inventory`);

      const inventoryItem = page.locator(
        `[data-testid="inventory-item-${testPart.sku}"]`
      );
      await expect(inventoryItem).toBeVisible();

      // 验证库存数量一致性
      await helpers.verifyTextPresent(testPart.stock.toString());
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.supplier);
    });

    // 步骤3: 采购模块数据验证
    executor.addStep('采购模块数据验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/shop/procurement`);

      await helpers.clickAndWait('[data-testid="create-po-button"]');
      await page.fill('[data-testid="po-part-search"]', testPart.name);

      // 验证采购搜索结果
      const poSearchResult = page.locator(
        `[data-testid="po-part-${testPart.sku}"]`
      );
      await expect(poSearchResult).toBeVisible();

      // 验证默认价格信息
      const priceInput = page.locator('[data-testid="po-unit-price"]');
      await expect(priceInput).toHaveValue(testPart.price.toString());
    });

    // 步骤4: 维修模块配件调用验证
    executor.addStep('维修模块配件调用验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);

      // 模拟维修过程中添加配件
      await helpers.clickAndWait('[data-testid="add-parts-used-button"]');
      await page.fill('[data-testid="parts-search-modal"]', testPart.name);

      const repairPart = page.locator(
        `[data-testid="repair-part-${testPart.sku}"]`
      );
      await expect(repairPart).toBeVisible();

      // 验证配件信息正确显示
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.price.toString());

      // 验证库存数量显示
      await helpers.verifyTextPresent(`库存: ${testPart.stock}`);
    });

    // 步骤5: WMS系统数据同步验证
    executor.addStep('WMS系统数据验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/inventory`);

      const wmsItem = page.locator(`[data-testid="wms-item-${testPart.sku}"]`);
      await expect(wmsItem).toBeVisible();

      // 验证WMS系统中的配件信息
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.sku);
      await helpers.verifyTextPresent(testPart.supplier);

      // 验证库存数量同步
      await helpers.verifyTextPresent(testPart.stock.toString());
    });

    // 执行所有步骤
    const result = await executor.execute();

    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-CROSS-03');
      await helpers.takeScreenshot('parts-data-consistency-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-CROSS-03',
        result.failedSteps.join(', ')
      );
      await helpers.takeScreenshot('parts-data-consistency-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-CROSS-04: 订单状态跨模块同步
   * 优先级: P0
   * 验证订单状态在用户端、技师端、管理端的一致性
   */
  test('E2E-CROSS-04: 订单状态跨模块同步验证', async ({ page }) => {
    const testDevice = testDataManager.getDeviceById('DEVICE_001');
    const consumerUser = testDataManager.getUserByRole('consumer');
    const engineerUser = testDataManager.getUserByRole('engineer');
    const adminUser = testDataManager.getUserByRole('admin');

    // 创建测试订单
    await helpers.login(consumerUser.email, consumerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
    await helpers.scanQRCode(testDevice.id);
    await helpers.selectFaultType('screen_broken');
    await helpers.clickAndWait('[data-testid="create-order-button"]');

    const orderId = testDevice.id; // 简化处理，实际应该是系统生成的订单号

    // 步骤1: 用户端订单状态验证
    const userExecutor = new TestStepExecutor();
    userExecutor.addStep('用户端状态验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);
      const orderItem = page.locator(`[data-testid="order-${orderId}"]`);
      await expect(orderItem).toBeVisible();

      // 验证初始状态
      await helpers.verifyTextPresent(/待处理|pending/i);
    });

    // 步骤2: 技师端状态更新
    const engineerExecutor = new TestStepExecutor();
    engineerExecutor.addStep('技师端状态更新', async () => {
      await helpers.login(engineerUser.email, engineerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);

      const workOrder = page.locator(`[data-testid="work-order-${orderId}"]`);
      await workOrder.click();

      // 更新订单状态为"处理中"
      await helpers.clickAndWait('[data-testid="start-repair-button"]');
      await helpers.verifyTextPresent(/维修中|in_progress/i);
    });

    // 步骤3: 管理端状态监控
    const adminExecutor = new TestStepExecutor();
    adminExecutor.addStep('管理端状态监控', async () => {
      await helpers.login(adminUser.email, adminUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/admin/orders`);

      const adminOrder = page.locator(`[data-testid="admin-order-${orderId}"]`);
      await expect(adminOrder).toBeVisible();

      // 验证状态已更新为处理中
      await helpers.verifyTextPresent(/处理中|in_progress/i);
    });

    // 步骤4: 用户端状态同步验证
    userExecutor.addStep('用户端状态同步验证', async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);

      const updatedOrder = page.locator(`[data-testid="order-${orderId}"]`);
      await updatedOrder.click();

      // 验证状态已同步更新
      await helpers.verifyTextPresent(/维修中|处理中|in_progress/i);
    });

    // 执行各个模块的验证
    const userResult = await userExecutor.execute();
    const engineerResult = await engineerExecutor.execute();
    const adminResult = await adminExecutor.execute();
    const finalUserResult = await userExecutor.execute(); // 重新验证用户端

    const allSuccess =
      userResult.success &&
      engineerResult.success &&
      adminResult.success &&
      finalUserResult.success;

    if (allSuccess) {
      DependencyChecker.markDependencyCompleted('E2E-CROSS-04');
      await helpers.takeScreenshot('order-status-sync-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-CROSS-04',
        '订单状态同步失败'
      );
      await helpers.takeScreenshot('order-status-sync-failed');
    }

    expect(allSuccess).toBeTruthy();
  });

  /**
   * E2E-CROSS-05: 财务数据一致性验证
   * 优先级: P1
   * 验证交易金额在支付、订单、财务报表等模块间的一致性
   */
  test('E2E-CROSS-05: 财务数据一致性验证', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    const testAmount = '430.00';

    const executor = new TestStepExecutor();

    // 步骤1: 模拟支付交易
    executor.addStep('模拟支付交易', async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/payment/mock`);

      await helpers.fillForm({
        '[data-testid="payment-amount"]': testAmount,
        '[data-testid="payment-method"]': 'credit_card',
      });

      await helpers.clickAndWait('[data-testid="process-payment-button"]');
      await helpers.verifyTextPresent(/支付成功|交易完成/i);

      // 获取交易号
      const transactionId = await page
        .locator('[data-testid="transaction-id"]')
        .textContent();
      expect(transactionId).toBeTruthy();
    });

    // 步骤2: 订单模块财务数据验证
    executor.addStep('订单财务数据验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);

      const recentOrder = page.locator('[data-testid="order-item"]').first();
      await recentOrder.click();

      // 验证订单金额
      await helpers.verifyTextPresent(testAmount);
      await helpers.verifyTextPresent(/已支付|paid/i);
    });

    // 步骤3: 财务报表数据验证
    executor.addStep('财务报表数据验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/finance`);

      // 验证交易记录
      const transactionRecord = page.locator(
        `[data-testid="transaction-${testAmount}"]`
      );
      await expect(transactionRecord).toBeVisible();

      // 验证汇总数据
      await helpers.verifyTextPresent(/总收入|支出|余额/i);
    });

    // 步骤4: FCX钱包余额验证
    executor.addStep('FCX钱包余额验证', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/wallet`);

      // 如果是FCX支付，验证余额变化
      const balanceElement = page.locator('[data-testid="fcx-balance"]');
      await expect(balanceElement).toBeVisible();

      // 验证交易历史记录
      await helpers.clickAndWait('[data-testid="transaction-history-tab"]');
      await helpers.verifyTextPresent(testAmount);
    });

    // 执行所有步骤
    const result = await executor.execute();

    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-CROSS-05');
      await helpers.takeScreenshot('financial-data-consistency-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-CROSS-05',
        result.failedSteps.join(', ')
      );
      await helpers.takeScreenshot('financial-data-consistency-failed');
    }

    expect(result.success).toBeTruthy();
  });
});
