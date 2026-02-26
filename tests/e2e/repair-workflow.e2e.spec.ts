import { test, expect } from '@playwright/test';
import { TestHelpers, BusinessFlowHelpers } from '../test-helpers';
import { testDataManager } from '../test-data-manager';
import { withRetry, withTimeout, TestStepExecutor, DependencyChecker } from '../test-execution-utils';
import { TEST_ENV } from '../test-config';

test.describe('E2E-REPAIR: 设备维修业务流程端到端测试', () => {
  let helpers: TestHelpers;
  let businessHelpers: BusinessFlowHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    businessHelpers = new BusinessFlowHelpers(page);
  });

  /**
   * E2E-REPAIR-01: 完整维修申请流程
   * 优先级: P0
   * 测试从设备扫描到维修预约的完整流程
   */
  test('E2E-REPAIR-01: 设备扫描到维修完成全流程', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    const testDevice = testDataManager.getDeviceById('DEVICE_001');

    const executor = new TestStepExecutor();

    // 步骤1: 用户登录
    executor.addStep('用户登录', async () => {
      await withRetry(async () => {
        await helpers.login(consumerUser.email, consumerUser.password);
      });
    });

    // 步骤2: 设备扫码识别
    executor.addStep('设备扫码识别', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
      await helpers.scanQRCode(testDevice.id);
      await helpers.verifyTextPresent(testDevice.model);
      await helpers.verifyTextPresent(testDevice.brand);
      await helpers.verifyTextPresent(testDevice.serial);
    });

    // 步骤3: 故障诊断与报价
    executor.addStep('故障诊断与报价', async () => {
      // 选择故障类型
      await helpers.selectFaultType('screen_broken');
      
      // 提交诊断请求
      await helpers.submitForm('[data-testid="diagnose-button"]');
      
      // 验证报价计算
      await helpers.waitForElement('[data-testid="quote-summary"]');
      await helpers.verifyTextPresent(/报价|价格|费用/i);
      await helpers.verifyTextPresent(/[2-3][0-9][0-9]/); // 价格范围 200-399
      
      // 验证费用明细
      await helpers.verifyTextPresent(/配件费|人工费|总计/i);
    });

    // 步骤4: 维修预约
    executor.addStep('维修预约', async () => {
      // 选择附近店铺
      await helpers.clickAndWait('[data-testid="select-shop-button"]');
      await helpers.waitForElement('[data-testid="shop-list"]');
      await helpers.verifyTextPresent('维修专家店');
      
      // 选择店铺
      await helpers.clickAndWait('[data-testid="shop-维修专家店"]');
      
      // 选择预约时间
      await helpers.clickAndWait('[data-testid="schedule-appointment"]');
      // 选择具体时间段
      await helpers.clickAndWait('[data-testid="time-slot-10:00"]');
      
      // 确认预约
      await helpers.clickAndWait('[data-testid="confirm-appointment"]');
      await helpers.verifyTextPresent(/预约成功|已确认/i);
    });

    // 步骤5: 维修进度跟踪
    executor.addStep('维修进度跟踪', async () => {
      // 跳转到订单页面
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);
      
      // 验证订单出现在列表中
      const orderElement = page.locator(`[data-testid="order-${testDevice.id}"]`);
      await expect(orderElement).toBeVisible();
      
      // 验证初始状态
      await helpers.verifyTextPresent(/待处理|pending/i);
      
      // 模拟状态更新
      await page.waitForTimeout(2000);
      await helpers.verifyTextPresent(/已受理|accepted/i);
      
      await page.waitForTimeout(2000);
      await helpers.verifyTextPresent(/维修中|in_progress/i);
      
      await page.waitForTimeout(2000);
      await helpers.verifyTextPresent(/已完成|completed/i);
    });

    // 执行所有步骤
    const result = await executor.execute();
    
    // 标记测试状态
    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-REPAIR-01');
      await helpers.takeScreenshot('repair-complete-flow-success');
    } else {
      DependencyChecker.markDependencyFailed('E2E-REPAIR-01', result.failedSteps.join(', '));
      await helpers.takeScreenshot('repair-complete-flow-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-REPAIR-02: 维修技师工作流程
   * 优先级: P0
   * 测试维修技师从接单到完成的完整流程
   */
  test('E2E-REPAIR-02: 维修技师接单到完成流程', async ({ page }) => {
    const engineerUser = testDataManager.getUserByRole('engineer');
    const testDevice = testDataManager.getDeviceById('DEVICE_001');
    const screenPart = testDataManager.getPartBySKU('IPH12SCR-001');

    // 等待依赖完成
    const depsReady = await DependencyChecker.waitForDependencies(['E2E-REPAIR-01'], 15000);
    if (!depsReady) {
      test.skip(true, '依赖的维修申请流程未完成');
      return;
    }

    const executor = new TestStepExecutor();

    // 步骤1: 技师登录与工单查看
    executor.addStep('技师登录', async () => {
      await withRetry(async () => {
        await helpers.login(engineerUser.email, engineerUser.password);
      });
    });

    executor.addStep('查看待处理工单', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);
      await helpers.waitForElement('[data-testid="pending-work-orders"]');
      
      // 验证有待处理工单
      const pendingOrders = page.locator('[data-testid="work-order-item"]');
      const count = await pendingOrders.count();
      expect(count).toBeGreaterThan(0);
      
      // 验证包含刚才创建的工单
      await helpers.verifyTextPresent(testDevice.id);
    });

    // 步骤2: 接受工单
    executor.addStep('接受工单', async () => {
      // 点击接受工单按钮
      await helpers.clickAndWait(`[data-testid="accept-order-${testDevice.id}"]`);
      
      // 验证工单状态更新
      await helpers.verifyTextPresent(/已接受|accepted/i);
      await helpers.verifyTextPresent(engineerUser.email.split('@')[0]);
    });

    // 步骤3: 更新维修进度
    executor.addStep('更新维修进度', async () => {
      // 开始维修
      await helpers.clickAndWait('[data-testid="start-repair-button"]');
      await helpers.verifyTextPresent(/维修中|in_progress/i);
      
      // 添加维修备注
      await page.fill('[data-testid="repair-notes"]', '开始拆机检查，发现屏幕碎裂严重');
      await helpers.clickAndWait('[data-testid="save-notes-button"]');
      
      // 上传维修照片
      const fileInput = page.locator('[data-testid="photo-upload-input"]');
      await fileInput.setInputFiles({
        name: '拆机检查.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
      await helpers.verifyTextPresent(/图片上传成功/i);
    });

    // 步骤4: 配件使用记录
    executor.addStep('记录配件使用', async () => {
      // 添加使用的配件
      await helpers.clickAndWait('[data-testid="add-parts-button"]');
      
      await page.fill('[data-testid="parts-search"]', screenPart.name);
      await helpers.clickAndWait(`[data-testid="select-part-${screenPart.sku}"]`);
      
      await page.fill('[data-testid="quantity-input"]', '1');
      await page.fill('[data-testid="cost-input"]', screenPart.price.toString());
      
      await helpers.clickAndWait('[data-testid="confirm-parts-add"]');
      
      // 验证配件已添加
      await helpers.verifyTextPresent(screenPart.name);
      await helpers.verifyTextPresent(screenPart.price.toString());
    });

    // 步骤5: 完成维修并提交报告
    executor.addStep('完成维修', async () => {
      // 标记维修完成
      await helpers.clickAndWait('[data-testid="complete-repair-button"]');
      
      // 填写质量评分
      await page.selectOption('[data-testid="quality-rating"]', '5');
      
      // 填写客户反馈
      await page.fill('[data-testid="customer-feedback"]', '维修质量很好，服务态度佳');
      
      // 确认最终费用
      await page.fill('[data-testid="final-cost"]', '430');
      
      // 提交维修报告
      await helpers.clickAndWait('[data-testid="submit-report-button"]');
      
      // 验证完成确认
      await helpers.verifyTextPresent(/维修完成|completed/i);
      await helpers.verifyTextPresent(/感谢您的评价/i);
      
      // 验证FCX奖励
      await helpers.verifyTextPresent(/获得奖励|FCX奖励/i);
      await helpers.verifyTextPresent(/[5-9][0-9]/); // 奖励金额 50-99
    });

    // 执行所有步骤
    const result = await executor.execute();
    
    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-REPAIR-02');
      await helpers.takeScreenshot('engineer-workflow-success');
    } else {
      DependencyChecker.markDependencyFailed('E2E-REPAIR-02', result.failedSteps.join(', '));
      await helpers.takeScreenshot('engineer-workflow-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-REPAIR-03: 多设备批量维修流程
   * 优先级: P1
   * 测试同时处理多个设备维修的场景
   */
  test('E2E-REPAIR-03: 多设备批量维修处理', async ({ page }) => {
    const engineerUser = testDataManager.getUserByRole('engineer');
    const devices = [
      testDataManager.getDeviceById('DEVICE_001'),
      testDataManager.getDeviceById('DEVICE_002'),
      testDataManager.getDeviceById('DEVICE_003')
    ];

    // 步骤1: 技师登录
    await withRetry(async () => {
      await helpers.login(engineerUser.email, engineerUser.password);
    });

    // 步骤2: 查看批量工单
    await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);
    await helpers.waitForElement('[data-testid="batch-orders-view"]');
    
    // 验证多个待处理工单
    const pendingOrders = page.locator('[data-testid="work-order-item"]');
    const orderCount = await pendingOrders.count();
    expect(orderCount).toBeGreaterThanOrEqual(3);

    // 步骤3: 批量接受工单
    await helpers.clickAndWait('[data-testid="batch-accept-button"]');
    await helpers.verifyTextPresent(/批量接受成功/i);

    // 步骤4: 并行处理多个维修
    for (let i = 0; i < Math.min(3, orderCount); i++) {
      const deviceId = devices[i]?.id || `DEVICE_${i + 1}`;
      await withTimeout(async () => {
        // 模拟处理每个设备
        await page.click(`[data-testid="process-order-${deviceId}"]`);
        await page.fill('[data-testid="repair-notes"]', `处理设备 ${deviceId}`);
        await page.click('[data-testid="save-progress-button"]');
      }, 15000);
    }

    await helpers.takeScreenshot('batch-repair-processing');
  });

  /**
   * E2E-REPAIR-04: 维修质量回访流程
   * 优先级: P2
   * 测试维修完成后的质量回访机制
   */
  test('E2E-REPAIR-04: 维修质量回访验证', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    
    // 步骤1: 用户登录
    await helpers.login(consumerUser.email, consumerUser.password);

    // 步骤2: 查看已完成订单
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);
    await helpers.waitForElement('[data-testid="completed-orders-tab"]');
    await helpers.clickAndWait('[data-testid="completed-orders-tab"]');

    // 步骤3: 发起质量回访
    const completedOrder = page.locator('[data-testid="order-item"]').first();
    await completedOrder.click();
    
    await helpers.clickAndWait('[data-testid="initiate-feedback-button"]');
    
    // 步骤4: 填写回访问卷
    await page.selectOption('[data-testid="service-rating"]', '5');
    await page.selectOption('[data-testid="quality-rating"]', '5');
    await page.selectOption('[data-testid="speed-rating"]', '4');
    
    await page.fill('[data-testid="feedback-comments"]', '维修师傅技术很好，服务态度也很棒！');
    
    // 提交回访
    await helpers.clickAndWait('[data-testid="submit-feedback-button"]');
    await helpers.verifyTextPresent(/感谢您的反馈/i);

    await helpers.takeScreenshot('quality-followup-completed');
  });
});