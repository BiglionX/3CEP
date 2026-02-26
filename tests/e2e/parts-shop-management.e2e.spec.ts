import { test, expect } from '@playwright/test';
import { TestHelpers } from '../test-helpers';
import { testDataManager } from '../test-data-manager';
import { withRetry, withTimeout, TestStepExecutor, DependencyChecker } from '../test-execution-utils';
import { TEST_ENV } from '../test-config';

test.describe('E2E-PARTS-SHOP: 配件管理与店铺管理端到端测试', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  /**
   * E2E-PARTS-01: 配件搜索与比价功能
   * 优先级: P0
   * 测试配件的智能搜索和价格比较功能
   */
  test('E2E-PARTS-01: 配件智能搜索与价格比较', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    const testPart = testDataManager.getPartBySKU('IPH12SCR-001');

    const executor = new TestStepExecutor();

    // 步骤1: 用户登录
    executor.addStep('用户登录', async () => {
      await withRetry(async () => {
        await helpers.login(consumerUser.email, consumerUser.password);
      });
    });

    // 步骤2: 配件搜索功能
    executor.addStep('配件搜索', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/parts/search`);
      await helpers.waitForElement('[data-testid="parts-search-input"]');
      
      // 搜索配件
      await page.fill('[data-testid="parts-search-input"]', 'iPhone 12 屏幕');
      await helpers.clickAndWait('[data-testid="search-button"]');
      
      // 验证搜索结果
      await helpers.waitForElement('[data-testid="search-results"]');
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.supplier);
      await helpers.verifyTextPresent(testPart.price.toString());
    });

    // 步骤3: 价格趋势分析
    executor.addStep('价格趋势分析', async () => {
      // 查看价格趋势
      await helpers.clickAndWait(`[data-testid="view-trend-${testPart.sku}"]`);
      
      // 验证价格图表显示
      await helpers.waitForElement('[data-testid="price-trend-chart"]');
      await helpers.verifyTextPresent(/价格趋势|历史价格/i);
      
      // 验证统计数据
      await helpers.verifyTextPresent(/30天|平均价格|最高价|最低价/i);
      await helpers.verifyTextPresent(/[1-3][0-9][0-9]/); // 价格范围验证
    });

    // 步骤4: 供应商比价
    executor.addStep('供应商比价', async () => {
      // 打开比价功能
      await helpers.clickAndWait('[data-testid="compare-suppliers-button"]');
      
      // 验证多个供应商报价
      const supplierQuotes = page.locator('[data-testid="supplier-quote"]');
      const quoteCount = await supplierQuotes.count();
      expect(quoteCount).toBeGreaterThanOrEqual(2);
      
      // 验证最佳报价标识
      await helpers.verifyTextPresent(/最优价格|推荐/i);
      
      // 验证节省金额显示
      await helpers.verifyTextPresent(/节省|便宜|元/i);
    });

    // 步骤5: 配件详情查看
    executor.addStep('配件详情查看', async () => {
      // 查看配件详细信息
      await helpers.clickAndWait(`[data-testid="view-details-${testPart.sku}"]`);
      
      // 验证详细信息页面
      await helpers.waitForElement('[data-testid="part-details-page"]');
      await helpers.verifyTextPresent(testPart.name);
      await helpers.verifyTextPresent(testPart.category);
      await helpers.verifyTextPresent(testPart.compatibility);
      await helpers.verifyTextPresent(testPart.stock.toString());
      
      // 验证技术参数
      await helpers.verifyTextPresent(/技术规格|参数/i);
    });

    // 执行所有步骤
    const result = await executor.execute();
    
    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-PARTS-01');
      await helpers.takeScreenshot('parts-search-success');
    } else {
      DependencyChecker.markDependencyFailed('E2E-PARTS-01', result.failedSteps.join(', '));
      await helpers.takeScreenshot('parts-search-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-PARTS-02: 配件库存管理
   * 优先级: P1
   * 测试配件库存的实时管理和预警功能
   */
  test('E2E-PARTS-02: 配件库存管理与预警', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');
    const testPart = testDataManager.getPartBySKU('IPH12SCR-001');

    // 步骤1: 店铺主登录
    await withRetry(async () => {
      await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    });

    // 步骤2: 访问库存管理页面
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/inventory`);
    await helpers.waitForElement('[data-testid="inventory-dashboard"]');

    // 步骤3: 查看配件库存详情
    const inventoryItem = page.locator(`[data-testid="inventory-item-${testPart.sku}"]`);
    await expect(inventoryItem).toBeVisible();

    // 验证库存数量显示
    await helpers.verifyTextPresent(testPart.stock.toString());

    // 验证库存状态标签
    if (testPart.stock > 20) {
      await helpers.verifyTextPresent(/充足|正常/i);
    } else if (testPart.stock > 5) {
      await helpers.verifyTextPresent(/紧张|预警/i);
    } else {
      await helpers.verifyTextPresent(/短缺|紧急/i);
    }

    // 步骤4: 库存调整操作
    await helpers.clickAndWait(`[data-testid="adjust-stock-${testPart.sku}"]`);
    
    // 增加库存
    await page.fill('[data-testid="adjust-quantity"]', '10');
    await page.selectOption('[data-testid="adjust-type"]', 'increase');
    await page.fill('[data-testid="adjust-reason"]', '新进货品');
    await helpers.clickAndWait('[data-testid="confirm-adjustment"]');
    
    // 验证库存更新
    await helpers.verifyTextPresent((testPart.stock + 10).toString());

    // 步骤5: 库存预警设置
    await helpers.clickAndWait('[data-testid="inventory-alerts-button"]');
    await helpers.verifyTextPresent(/库存预警|安全库存/i);
    
    await helpers.takeScreenshot('inventory-management-verified');
  });

  /**
   * E2E-SHOP-01: 店铺入驻与审核流程
   * 优先级: P0
   * 测试新店铺的入驻申请和管理员审核流程
   */
  test('E2E-SHOP-01: 店铺入驻申请到审核通过', async ({ page }) => {
    const newShopOwner = {
      email: 'newshop@test.com',
      password: 'Test123!@#',
      shopData: {
        name: '新测试维修店',
        contactPerson: '王师傅',
        phone: '13700137000',
        address: '深圳市福田区华强北路2001号'
      }
    };

    const executor = new TestStepExecutor();

    // 步骤1: 新店铺主注册和登录
    executor.addStep('店铺主注册登录', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/register`);
      await helpers.fillForm({
        '[data-testid="email"]': newShopOwner.email,
        '[data-testid="password"]': newShopOwner.password,
        '[data-testid="confirm-password"]': newShopOwner.password
      });
      await helpers.clickAndWait('[data-testid="register-button"]');
    });

    // 步骤2: 提交店铺入驻申请
    executor.addStep('提交入驻申请', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/shops/apply`);
      
      await helpers.fillForm({
        '[data-testid="shop-name"]': newShopOwner.shopData.name,
        '[data-testid="contact-person"]': newShopOwner.shopData.contactPerson,
        '[data-testid="phone"]': newShopOwner.shopData.phone,
        '[data-testid="address"]': newShopOwner.shopData.address
      });

      // 上传必要证件
      const licenseInput = page.locator('[data-testid="business-license-upload"]');
      await licenseInput.setInputFiles({
        name: 'business_license.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-license-data')
      });

      const certInput = page.locator('[data-testid="tech-cert-upload"]');
      await certInput.setInputFiles({
        name: 'tech_certificate.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-cert-data')
      });

      // 提交申请
      await helpers.clickAndWait('[data-testid="submit-application-button"]');
      await helpers.verifyTextPresent(/申请已提交|正在审核/i);
    });

    // 步骤3: 管理员审核流程
    executor.addStep('管理员审核', async () => {
      const adminUser = testDataManager.getUserByRole('admin');
      await helpers.login(adminUser.email, adminUser.password);
      
      await page.goto(`${TEST_ENV.getBaseUrl()}/admin/shops/pending`);
      await helpers.waitForElement('[data-testid="pending-applications"]');
      
      // 查找并审核新申请
      const applicationItem = page.locator(`[data-testid="application-${newShopOwner.shopData.name}"]`);
      await expect(applicationItem).toBeVisible();
      
      await helpers.clickAndWait(`[data-testid="review-${newShopOwner.shopData.name}"]`);
      
      // 批准申请
      await page.selectOption('[data-testid="review-status"]', 'approved');
      await page.fill('[data-testid="review-notes"]', '资质齐全，技术认证有效，符合入驻标准');
      await helpers.clickAndWait('[data-testid="confirm-review-button"]');
      
      await helpers.verifyTextPresent(/审核通过|已批准/i);
    });

    // 步骤4: 店铺主查看审核结果
    executor.addStep('查看审核结果', async () => {
      // 切换回店铺主账号
      await helpers.login(newShopOwner.email, newShopOwner.password);
      
      await page.goto(`${TEST_ENV.getBaseUrl()}/shop/dashboard`);
      
      // 验证店铺状态为活跃
      await helpers.verifyTextPresent(/营业中|active/i);
      
      // 验证店铺基本信息
      await helpers.verifyTextPresent(newShopOwner.shopData.name);
      await helpers.verifyTextPresent(newShopOwner.shopData.contactPerson);
      
      // 验证管理功能可用
      await helpers.verifyElementExists('[data-testid="order-management"]');
      await helpers.verifyElementExists('[data-testid="staff-management"]');
      await helpers.verifyElementExists('[data-testid="finance-overview"]');
    });

    // 执行所有步骤
    const result = await executor.execute();
    
    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-SHOP-01');
      await helpers.takeScreenshot('shop-onboarding-success');
    } else {
      DependencyChecker.markDependencyFailed('E2E-SHOP-01', result.failedSteps.join(', '));
      await helpers.takeScreenshot('shop-onboarding-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-SHOP-02: 店铺运营管理
   * 优先级: P1
   * 测试店铺日常运营管理功能
   */
  test('E2E-SHOP-02: 店铺日常运营管理', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');

    // 步骤1: 店铺主登录
    await withRetry(async () => {
      await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    });

    // 步骤2: 查看经营数据仪表板
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/dashboard`);
    await helpers.waitForElement('[data-testid="shop-dashboard"]');

    // 验证关键指标显示
    await helpers.verifyTextPresent(/今日订单|今日收入|客户评价/i);
    await helpers.verifyElementExists('[data-testid="revenue-chart"]');
    await helpers.verifyElementExists('[data-testid="orders-chart"]');

    // 步骤3: 员工管理
    await helpers.clickAndWait('[data-testid="staff-management-tab"]');
    
    // 添加新员工
    await helpers.clickAndWait('[data-testid="add-staff-button"]');
    await helpers.fillForm({
      '[data-testid="staff-name"]': '李技工',
      '[data-testid="staff-phone"]': '13600136000',
      '[data-testid="staff-position"]': '维修技师'
    });
    await helpers.clickAndWait('[data-testid="save-staff-button"]');
    await helpers.verifyTextPresent(/添加成功/i);

    // 步骤4: 服务项目管理
    await helpers.clickAndWait('[data-testid="services-management-tab"]');
    
    // 添加新的服务项目
    await helpers.clickAndWait('[data-testid="add-service-button"]');
    await helpers.fillForm({
      '[data-testid="service-name"]': '屏幕更换服务',
      '[data-testid="service-price"]': '280',
      '[data-testid="service-duration"]': '2'
    });
    await helpers.clickAndWait('[data-testid="save-service-button"]');
    
    // 验证服务项目已添加
    await helpers.verifyTextPresent('屏幕更换服务');
    await helpers.verifyTextPresent('¥280');

    // 步骤5: 财务管理
    await helpers.clickAndWait('[data-testid="finance-tab"]');
    
    // 查看收入统计
    await helpers.verifyTextPresent(/总收入|月收入|年收入/i);
    await helpers.verifyElementExists('[data-testid="income-statistics"]');
    
    await helpers.takeScreenshot('shop-operations-verified');
  });

  /**
   * E2E-PARTS-SHOP-01: 配件采购与供应链管理
   * 优先级: P2
   * 测试店铺的配件采购和供应链协同功能
   */
  test('E2E-PARTS-SHOP-01: 配件采购与供应链协同', async ({ page }) => {
    const shopOwnerUser = testDataManager.getUserByRole('shop_owner');
    const testPart = testDataManager.getPartBySKU('IPH12SCR-001');

    // 步骤1: 店铺主登录并访问采购页面
    await helpers.login(shopOwnerUser.email, shopOwnerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/procurement`);

    // 步骤2: 创建采购订单
    await helpers.clickAndWait('[data-testid="create-po-button"]');
    
    // 添加采购项
    await helpers.clickAndWait('[data-testid="add-po-item-button"]');
    await page.fill('[data-testid="po-part-search"]', testPart.name);
    await helpers.clickAndWait(`[data-testid="select-part-${testPart.sku}"]`);
    await page.fill('[data-testid="po-quantity"]', '5');
    await page.fill('[data-testid="po-unit-price"]', testPart.price.toString());
    
    await helpers.clickAndWait('[data-testid="add-to-po-button"]');

    // 步骤3: 提交采购订单
    await page.fill('[data-testid="po-notes"]', '紧急补货需求');
    await helpers.clickAndWait('[data-testid="submit-po-button"]');
    
    // 验证订单创建成功
    await helpers.verifyTextPresent(/采购订单已创建|PO-/i);

    // 步骤4: 供应商协同
    await helpers.clickAndWait('[data-testid="supplier-coordination-tab"]');
    
    // 发送询价请求
    await helpers.clickAndWait('[data-testid="send-rfq-button"]');
    await helpers.verifyTextPresent(/询价已发送|RFQ-/i);

    // 步骤5: 库存预警联动
    await page.goto(`${TEST_ENV.getBaseUrl()}/shop/inventory`);
    
    // 模拟库存不足触发预警
    const lowStockItem = page.locator('[data-testid^="inventory-item-"]').filter({ hasText: /紧张|短缺/ }).first();
    await expect(lowStockItem).toBeVisible();
    
    await helpers.clickAndWait('[data-testid="auto-reorder-button"]');
    await helpers.verifyTextPresent(/自动补货|重新订购/i);

    await helpers.takeScreenshot('supply-chain-management-verified');
  });
});