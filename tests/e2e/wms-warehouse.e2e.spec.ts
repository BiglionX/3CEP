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

// 模拟WMS系统的数据结构
interface WMSSystem {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  status: 'connected' | 'disconnected' | 'syncing';
}

interface WarehouseInventory {
  sku: string;
  productName: string;
  quantity: number;
  location: string;
  warehouse: string;
  lastUpdated: string;
}

interface OutboundOrder {
  orderId: string;
  items: Array<{
    sku: string;
    quantity: number;
    warehouse: string;
  }>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  carrier?: string;
}

test.describe('E2E-WMS: WMS仓储管理端到端测试', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  /**
   * E2E-WMS-01: 仓储库存与订单履约
   * 优先级: P0
   * 测试WMS系统的库存管理和订单履行功能
   */
  test('E2E-WMS-01: 仓储管理系统集成测试', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');
    const testPart = testDataManager.getPartBySKU('IPH12SCR-001');

    const executor = new TestStepExecutor();

    // 步骤1: 店铺主登录并连接WMS系统
    executor.addStep('连接WMS系统', async () => {
      await withRetry(async () => {
        await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
      });

      await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/integration`);
      await helpers.waitForElement('[data-testid="wms-connection-panel"]');

      // 配置WMS连接参数
      await helpers.fillForm({
        '[data-testid="wms-system-name"]': 'GOODCANG',
        '[data-testid="wms-api-url"]': 'https://api.goodcang.com/v1',
        '[data-testid="wms-api-key"]': 'gc_test_api_key_123456',
      });

      // 连接WMS系统
      await helpers.clickAndWait('[data-testid="connect-wms-button"]');
      await helpers.verifyTextPresent(/连接成功|已连接/i);
      await helpers.verifyElementExists(
        '[data-testid="connection-status-connected"]'
      );
    });

    // 步骤2: 库存查询与同步
    executor.addStep('库存查询与同步', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/inventory`);

      // 手动触发库存同步
      await helpers.clickAndWait('[data-testid="sync-inventory-button"]');
      await helpers.verifyTextPresent(/同步中|正在更新/i);

      // 等待同步完成
      await page.waitForTimeout(3000);
      await helpers.verifyTextPresent(/同步完成|更新时间/i);

      // 验证库存数据显示
      const inventoryItems = page.locator('[data-testid="inventory-item"]');
      const itemCount = await inventoryItems.count();
      expect(itemCount).toBeGreaterThan(0);

      // 查找特定配件的库存信息
      const partInventory = page.locator(
        `[data-testid="inventory-item-${testPart.sku}"]`
      );
      await expect(partInventory).toBeVisible();

      // 验证库存详情
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.stock.toString());
      await helpers.verifyTextPresent(/A区|B区|仓库/); // 仓位信息
    });

    // 步骤3: 订单自动分配
    executor.addStep('订单自动分配', async () => {
      // 创建维修订单来触发库存分配
      await page.goto(`${TEST_ENV.getBaseUrl()}/shop/orders`);
      await helpers.clickAndWait('[data-testid="create-test-order-button"]');

      // 选择需要配件的维修订单
      await helpers.fillForm({
        '[data-testid="device-model"]': 'iPhone 12',
        '[data-testid="fault-type"]': 'screen_broken',
        '[data-testid="required-parts"]': testPart.sku,
      });

      await helpers.clickAndWait('[data-testid="submit-order-button"]');

      // 验证系统自动分配仓库
      await helpers.waitForElement(
        '[data-testid="warehouse-allocation-result"]'
      );
      await helpers.verifyTextPresent(/深圳仓|上海仓|北京仓/);
      await helpers.verifyTextPresent(/1-2天|预计送达/i);
    });

    // 步骤4: 出库与物流跟踪
    executor.addStep('出库与物流跟踪', async () => {
      // 处理出库订单
      await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/outbound`);

      const pendingOrders = page.locator(
        '[data-testid="outbound-order-pending"]'
      );
      const orderCount = await pendingOrders.count();

      if (orderCount > 0) {
        // 处理第一个待出库订单
        const firstOrder = pendingOrders.first();
        await firstOrder.click();

        // 确认出库
        await helpers.clickAndWait('[data-testid="process-outbound-button"]');
        await helpers.verifyTextPresent(/出库处理中/i);

        // 填写出库信息
        await page.fill('[data-testid="tracking-number"]', 'GC20240315001');
        await page.selectOption('[data-testid="carrier-select"]', '顺丰速运');

        await helpers.clickAndWait('[data-testid="confirm-shipment-button"]');
        await helpers.verifyTextPresent(/已发货|运输中/i);

        // 验证物流跟踪信息
        await helpers.verifyTextPresent('GC20240315001');
        await helpers.verifyTextPresent('顺丰速运');
      }
    });

    // 步骤5: 库存预警与补货
    executor.addStep('库存预警与补货', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/alerts`);

      // 查看库存预警
      const lowStockAlerts = page.locator('[data-testid="low-stock-alert"]');
      const alertCount = await lowStockAlerts.count();

      if (alertCount > 0) {
        // 处理第一个低库存预警
        const firstAlert = lowStockAlerts.first();
        await firstAlert.click();

        // 发起补货申请
        await helpers.clickAndWait(
          '[data-testid="create-replenishment-button"]'
        );
        await helpers.fillForm({
          '[data-testid="replenish-quantity"]': '20',
          '[data-testid="supplier-select"]': '苹果官方供应商',
        });

        await helpers.clickAndWait(
          '[data-testid="submit-replenishment-button"]'
        );
        await helpers.verifyTextPresent(/补货申请已提交|采购订单创建/i);
      }

      // 验证预警规则设置
      await helpers.clickAndWait('[data-testid="alert-settings-tab"]');
      await helpers.verifyElementExists('[data-testid="min-stock-threshold"]');
      await helpers.verifyElementExists('[data-testid="max-stock-threshold"]');
    });

    // 执行所有步骤
    const result = await executor.execute();

    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-WMS-01');
      await helpers.takeScreenshot('wms-integration-success');
    } else {
      DependencyChecker.markDependencyFailed(
        'E2E-WMS-01',
        result.failedSteps.join(', ')
      );
      await helpers.takeScreenshot('wms-integration-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-WMS-02: 多仓库协同管理
   * 优先级: P1
   * 测试多仓库之间的库存调配和协同作业
   */
  test('E2E-WMS-02: 多仓库协同管理', async ({ page }) => {
    const adminUser = testDataManager.getUserByRole('admin');

    // 步骤1: 管理员登录并配置多仓库
    await withRetry(async () => {
      await helpers.login(adminUser.email, adminUser.password);
    });

    await page.goto(`${TEST_ENV.getBaseUrl()}/admin/warehouses`);
    await helpers.waitForElement('[data-testid="warehouses-dashboard"]');

    // 步骤2: 查看仓库网络拓扑
    await helpers.clickAndWait('[data-testid="network-topology-tab"]');

    // 验证多个仓库节点显示
    const warehouseNodes = page.locator('[data-testid="warehouse-node"]');
    const nodeCount = await warehouseNodes.count();
    expect(nodeCount).toBeGreaterThanOrEqual(3); // 至少3个仓库

    // 验证仓库间连接线
    const connectionLines = page.locator(
      '[data-testid="warehouse-connection"]'
    );
    await expect(connectionLines).toHaveCount(
      (nodeCount * (nodeCount - 1)) / 2
    );

    // 步骤3: 库存调配操作
    await helpers.clickAndWait('[data-testid="inventory-transfer-tab"]');

    // 创建库存调配单
    await helpers.clickAndWait('[data-testid="create-transfer-button"]');

    await page.selectOption('[data-testid="from-warehouse"]', '深圳仓');
    await page.selectOption('[data-testid="to-warehouse"]', '上海仓');

    // 添加调配商品
    await helpers.clickAndWait('[data-testid="add-transfer-item-button"]');
    await page.fill('[data-testid="transfer-sku"]', 'IPH12SCR-001');
    await page.fill('[data-testid="transfer-quantity"]', '10');

    await helpers.clickAndWait('[data-testid="add-item-confirm-button"]');

    // 提交调配申请
    await page.fill('[data-testid="transfer-reason"]', '满足上海地区需求');
    await helpers.clickAndWait('[data-testid="submit-transfer-button"]');

    await helpers.verifyTextPresent(/调配申请已创建|等待审批/i);

    // 步骤4: 调配审批流程
    await helpers.clickAndWait('[data-testid="pending-transfers-tab"]');

    const pendingTransfer = page
      .locator('[data-testid="transfer-request"]')
      .first();
    await pendingTransfer.click();

    await helpers.clickAndWait('[data-testid="approve-transfer-button"]');
    await helpers.verifyTextPresent(/已批准|调配中/i);

    await helpers.takeScreenshot('multi-warehouse-coordination-verified');
  });

  /**
   * E2E-WMS-03: 智能仓储优化
   * 优先级: P2
   * 测试基于AI的仓储布局优化和拣货路径规划
   */
  test('E2E-WMS-03: 智能仓储优化', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');

    // 步骤1: 店铺主登录并访问智能优化模块
    await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/optimization`);
    await helpers.waitForElement('[data-testid="optimization-dashboard"]');

    // 步骤2: 查看仓储布局优化建议
    await helpers.clickAndWait('[data-testid="layout-optimization-tab"]');

    // 触发优化分析
    await helpers.clickAndWait('[data-testid="run-layout-analysis-button"]');
    await helpers.verifyTextPresent(/分析中|正在计算/i);

    await page.waitForTimeout(5000); // 等待分析完成

    // 验证优化建议显示
    const suggestions = page.locator('[data-testid="optimization-suggestion"]');
    const suggestionCount = await suggestions.count();
    expect(suggestionCount).toBeGreaterThan(0);

    await helpers.verifyTextPresent(/推荐调整|优化工位|提升效率/i);

    // 步骤3: 拣货路径规划
    await helpers.clickAndWait('[data-testid="picking-route-tab"]');

    // 创建拣货任务
    await helpers.clickAndWait('[data-testid="create-picking-task-button"]');

    // 添加多个拣货项
    const pickingItems = [
      { sku: 'IPH12SCR-001', quantity: 2 },
      { sku: 'BAT-IPH13-001', quantity: 1 },
      { sku: 'HW-P50-IC-001', quantity: 3 },
    ];

    for (const item of pickingItems) {
      await helpers.clickAndWait('[data-testid="add-picking-item-button"]');
      await page.fill('[data-testid="picking-sku"]', item.sku);
      await page.fill(
        '[data-testid="picking-quantity"]',
        item.quantity.toString()
      );
      await helpers.clickAndWait('[data-testid="confirm-picking-item-button"]');
    }

    // 生成最优拣货路径
    await helpers.clickAndWait('[data-testid="generate-optimal-route-button"]');

    // 验证路径规划结果
    await helpers.waitForElement('[data-testid="optimized-route-map"]');
    await helpers.verifyTextPresent(/最短路径|节约时间|提升效率/i);

    // 验证路径步骤显示
    const routeSteps = page.locator('[data-testid="route-step"]');
    const stepCount = await routeSteps.count();
    expect(stepCount).toBeGreaterThan(0);

    // 步骤4: 库存周转率优化
    await helpers.clickAndWait('[data-testid="turnover-optimization-tab"]');

    // 查看ABC分类分析
    await helpers.verifyTextPresent(/ABC分类|库存价值|周转次数/i);

    const abcCategories = page.locator('[data-testid="abc-category"]');
    await expect(abcCategories).toHaveCount(3); // A、B、C三类

    // 验证各类别商品分布
    for (const category of ['A', 'B', 'C']) {
      const categoryItems = page.locator(
        `[data-testid="abc-items-${category}"]`
      );
      await expect(categoryItems).toBeVisible();
    }

    await helpers.takeScreenshot('warehouse-optimization-verified');
  });

  /**
   * E2E-WMS-04: 仓储数据分析与报表
   * 优先级: P1
   * 测试仓储运营数据的分析和可视化报表
   */
  test('E2E-WMS-04: 仓储数据分析与报表', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');

    // 步骤1: 用户登录并访问数据分析模块
    await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/warehouse/analytics`);
    await helpers.waitForElement('[data-testid="analytics-dashboard"]');

    // 步骤2: 查看库存周转分析
    await helpers.clickAndWait('[data-testid="inventory-turnover-tab"]');

    // 验证关键指标显示
    await helpers.verifyTextPresent(/库存周转率|平均库存|销售成本/i);
    await helpers.verifyElementExists('[data-testid="turnover-chart"]');

    // 查看趋势分析
    await helpers.verifyElementExists('[data-testid="trend-analysis"]');
    await helpers.verifyTextPresent(/同比|环比|月度趋势/i);

    // 步骤3: 作业效率分析
    await helpers.clickAndWait('[data-testid="operation-efficiency-tab"]');

    // 验证拣货效率指标
    await helpers.verifyTextPresent(/拣货效率|人均产出|准确率/i);
    await helpers.verifyElementExists('[data-testid="efficiency-metrics"]');

    // 查看员工绩效排行
    const employeeRankings = page.locator('[data-testid="employee-ranking"]');
    const rankingCount = await employeeRankings.count();
    expect(rankingCount).toBeGreaterThan(0);

    // 步骤4: 成本分析报表
    await helpers.clickAndWait('[data-testid="cost-analysis-tab"]');

    // 验证各项成本构成
    await helpers.verifyTextPresent(/仓储成本|人工成本|设备折旧|其他费用/i);
    await helpers.verifyElementExists('[data-testid="cost-breakdown-chart"]');

    // 导出报表功能测试
    await helpers.clickAndWait('[data-testid="export-report-button"]');
    await helpers.verifyTextPresent(/报表导出中|下载链接/i);

    // 步骤5: 异常预警分析
    await helpers.clickAndWait('[data-testid="anomaly-detection-tab"]');

    // 查看系统检测到的异常
    const anomalies = page.locator('[data-testid="anomaly-alert"]');
    await expect(anomalies).toBeVisible();

    // 验证异常类型和处理建议
    await helpers.verifyTextPresent(/库存异常|作业异常|设备异常/i);
    await helpers.verifyElementExists(
      '[data-testid="anomaly-resolution-suggestions"]'
    );

    await helpers.takeScreenshot('warehouse-analytics-verified');
  });
});
