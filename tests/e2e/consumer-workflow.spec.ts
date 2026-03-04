import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TestHelpers } from '../e2e-config';

test.describe('消费者核心流程测试 (E2E-CON-*)', () => {
  let consumerPage: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    consumerPage = await context.newPage();
  });

  test.afterEach(async () => {
    await consumerPage.close();
  });

  /**
   * E2E-CON-01: 消费者登录与内容浏览
   * 优先级: P0
   * 测试要点:
   * - 消费者角色登录
   * - DIY文章展示
   * - 内容筛选机制
   */
  test('E2E-CON-01: 消费者登录与内容浏览', async () => {
    // 1. 访问登录页面
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.waitForElement(consumerPage, 'text=登录');

    // 2. 输入消费者账号信息
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');

    // 3. 等待登录完成
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`, {
      timeout: TEST_CONFIG.timeouts.pageLoad,
    });

    // 4. 验证首页内容展示
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="content-feed"]'
    );

    // 5. 检查DIY文章卡片是否存在
    const diyArticleCards = await consumerPage.$$('.diy-article-card');
    expect(diyArticleCards.length).toBeGreaterThan(0);

    // 6. 验证文章难度标签显示
    const difficultyTags = await consumerPage.$$('.difficulty-tag');
    expect(difficultyTags.length).toBeGreaterThan(0);

    // 7. 验证简单难度文章优先展示
    const easyDifficultyTags = await consumerPage.$$(
      '.difficulty-tag:has-text("简单")'
    );
    expect(easyDifficultyTags.length).toBeGreaterThan(0);

    await consumerPage.screenshot({
      path: `test-results/consumer-login-feed-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-02: 故障相关搜索
   * 优先级: P0
   * 测试要点:
   * - 故障关键词搜索
   * - 相关文章优先显示
   */
  test('E2E-CON-02: 故障相关搜索', async () => {
    // 1. 登录
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 执行搜索
    await consumerPage.click('[data-testid="search-input"]');
    await consumerPage.fill('[data-testid="search-input"]', '电池不耐用');
    await consumerPage.press('[data-testid="search-input"]', 'Enter');

    // 3. 等待搜索结果
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="search-results"]'
    );

    // 4. 验证搜索结果存在
    const searchResults = await consumerPage.$$('.search-result-item');
    expect(searchResults.length).toBeGreaterThan(0);

    // 5. 验证相关文章优先显示
    const firstResultTitle = await consumerPage.$(
      '.search-result-item:first-child .result-title'
    );
    const titleText = await firstResultTitle.textContent();
    expect(titleText.toLowerCase()).toContain('电池');

    await consumerPage.screenshot({
      path: `test-results/consumer-search-battery-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-03: 文章详情与附近店铺查看
   * 优先级: P0
   * 测试要点:
   * - 文章详情页渲染
   * - 附近店铺展示
   */
  test('E2E-CON-03: 文章详情与附近店铺查看', async () => {
    // 1. 登录并访问文章详情
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 点击第一篇文章进入详情页
    const firstArticle = await TestHelpers.waitForElement(
      consumerPage,
      '.article-card:first-child'
    );
    await firstArticle.click();

    // 3. 等待详情页加载
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="article-detail"]'
    );

    // 4. 验证文章内容显示
    const articleContent = await consumerPage.$(
      '[data-testid="article-content"]'
    );
    expect(articleContent).toBeTruthy();

    // 5. 滚动到底部查看附近店铺
    await consumerPage.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );

    // 6. 验证附近店铺展示
    const nearbyShops = await consumerPage.$('[data-testid="nearby-shops"]');
    expect(nearbyShops).toBeTruthy();

    // 7. 验证店铺数量
    const shopCards = await consumerPage.$$('.shop-card');
    expect(shopCards.length).toBeGreaterThanOrEqual(2);

    await consumerPage.screenshot({
      path: `test-results/consumer-article-detail-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-04: 维修估价工具
   * 优先级: P1
   * 测试要点:
   * - 维修估价功能
   * - 配件成本计算
   * - 店铺均价展示
   */
  test('E2E-CON-04: 维修估价工具', async () => {
    // 1. 登录
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问估价工具页面
    await consumerPage.click('[data-testid="estimate-tool-link"]');

    // 3. 等待估价页面加载
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="estimate-form"]'
    );

    // 4. 选择设备和故障类型
    await consumerPage.selectOption(
      '[data-testid="device-select"]',
      'iPhone 12'
    );
    await consumerPage.selectOption('[data-testid="fault-select"]', '屏幕损坏');

    // 5. 提交估价请求
    await consumerPage.click('[data-testid="calculate-button"]');

    // 6. 等待结果展示
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="estimate-results"]'
    );

    // 7. 验证配件成本显示
    const partsCost = await consumerPage.$('[data-testid="parts-cost"]');
    expect(partsCost).toBeTruthy();

    // 8. 验证店铺均价显示
    const shopPrices = await consumerPage.$('[data-testid="shop-prices"]');
    expect(shopPrices).toBeTruthy();

    await consumerPage.screenshot({
      path: `test-results/consumer-estimate-tool-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-05: 附近店铺列表模式
   * 优先级: P0
   * 测试要点:
   * - 附近店铺列表展示
   * - 按距离排序
   */
  test('E2E-CON-05: 附近店铺列表模式', async () => {
    // 1. 登录
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问店铺页面
    await consumerPage.click('[data-testid="shops-link"]');

    // 3. 确保在列表模式
    const listViewButton = await consumerPage.$(
      '[data-testid="list-view-button"]'
    );
    if (!(await listViewButton.getAttribute('aria-pressed'))) {
      await listViewButton.click();
    }

    // 4. 等待店铺列表加载
    await TestHelpers.waitForElement(consumerPage, '[data-testid="shop-list"]');

    // 5. 验证店铺卡片显示
    const shopCards = await consumerPage.$$('.shop-card');
    expect(shopCards.length).toBeGreaterThan(0);

    // 6. 验证距离信息显示
    const distanceInfo = await consumerPage.$$('.distance-info');
    expect(distanceInfo.length).toBeGreaterThan(0);

    // 7. 验证按距离排序（第一个应该是最近的）
    const firstDistance = await shopCards[0].$('.distance-info');
    const firstDistanceText = await firstDistance.textContent();
    expect(firstDistanceText).toContain('km');

    await consumerPage.screenshot({
      path: `test-results/consumer-shop-list-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-06: 地图模式切换
   * 优先级: P0
   * 测试要点:
   * - 地图模式切换
   * - 店铺标记显示
   */
  test('E2E-CON-06: 地图模式切换', async () => {
    // 1. 登录并访问店铺页面
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    await consumerPage.click('[data-testid="shops-link"]');

    // 2. 切换到地图模式
    await consumerPage.click('[data-testid="map-view-button"]');

    // 3. 等待地图加载
    await TestHelpers.waitForElement(consumerPage, '[data-testid="shop-map"]');

    // 4. 验证地图容器存在
    const mapContainer = await consumerPage.$('[data-testid="shop-map"]');
    expect(mapContainer).toBeTruthy();

    // 5. 验证店铺标记显示
    const mapMarkers = await consumerPage.$$('.map-marker');
    expect(mapMarkers.length).toBeGreaterThan(0);

    // 6. 点击第一个标记测试弹窗
    await mapMarkers[0].click();
    await consumerPage.waitForTimeout(TEST_CONFIG.timeouts.animationComplete);

    // 7. 验证弹窗显示
    const markerPopup = await consumerPage.$('[data-testid="marker-popup"]');
    expect(markerPopup).toBeTruthy();

    await consumerPage.screenshot({
      path: `test-results/consumer-shop-map-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-07: 店铺详情查看
   * 优先级: P0
   * 测试要点:
   * - 店铺详情页展示
   * - 服务报价显示
   * - 技师信息展示
   */
  test('E2E-CON-07: 店铺详情查看', async () => {
    // 1. 登录并访问店铺列表
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    await consumerPage.click('[data-testid="shops-link"]');

    // 2. 点击第一个店铺进入详情页
    const firstShopCard = await TestHelpers.waitForElement(
      consumerPage,
      '.shop-card:first-child'
    );
    await firstShopCard.click();

    // 3. 等待详情页加载
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="shop-detail"]'
    );

    // 4. 验证店铺基本信息
    const shopName = await consumerPage.$('[data-testid="shop-name"]');
    expect(shopName).toBeTruthy();

    const shopRating = await consumerPage.$('[data-testid="shop-rating"]');
    expect(shopRating).toBeTruthy();

    // 5. 验证服务报价展示
    const servicePrices = await consumerPage.$(
      '[data-testid="service-prices"]'
    );
    expect(servicePrices).toBeTruthy();

    // 6. 验证技师信息展示
    const technicians = await consumerPage.$('[data-testid="technicians"]');
    expect(technicians).toBeTruthy();

    await consumerPage.screenshot({
      path: `test-results/consumer-shop-detail-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-08: 预约维修流程
   * 优先级: P0
   * 测试要点:
   * - 预约时间选择
   * - 预约成功状态
   */
  test('E2E-CON-08: 预约维修流程', async () => {
    // 1. 登录并访问店铺详情
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 导航到店铺详情（这里需要具体的店铺URL）
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/shops/shop-id-123`);

    // 2. 点击预约按钮
    await consumerPage.click('[data-testid="book-appointment-button"]');

    // 3. 等待预约表单加载
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="appointment-form"]'
    );

    // 4. 填写预约信息
    await consumerPage.fill('[data-testid="customer-name"]', '测试用户');
    await consumerPage.fill('[data-testid="customer-phone"]', '13800138000');
    await consumerPage.fill('[data-testid="device-model"]', 'iPhone 12');
    await consumerPage.selectOption('[data-testid="fault-type"]', '屏幕损坏');

    // 5. 选择预约时间
    await consumerPage.click('[data-testid="time-slot-1000-1100"]');

    // 6. 提交预约
    await consumerPage.click('[data-testid="submit-appointment"]');

    // 7. 等待预约确认
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="appointment-success"]'
    );

    // 8. 验证预约成功提示
    const successMessage = await consumerPage.$(
      '[data-testid="appointment-success"]'
    );
    expect(successMessage).toBeTruthy();

    // 9. 验证预约状态为待确认
    const appointmentStatus = await consumerPage.$(
      '[data-testid="appointment-status"]'
    );
    const statusText = await appointmentStatus.textContent();
    expect(statusText).toContain('待确认');

    await consumerPage.screenshot({
      path: `test-results/consumer-appointment-success-${Date.now()}.png`,
    });
  });

  /**
   * E2E-CON-09: 我的预约查看
   * 优先级: P0
   * 测试要点:
   * - 预约记录展示
   * - 预约状态跟踪
   */
  test('E2E-CON-09: 我的预约查看', async () => {
    // 1. 登录
    await consumerPage.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(consumerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await consumerPage.click('[data-testid="login-button"]');
    await consumerPage.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问个人中心
    await consumerPage.click('[data-testid="profile-link"]');

    // 3. 点击我的预约
    await consumerPage.click('[data-testid="my-appointments-link"]');

    // 4. 等待预约列表加载
    await TestHelpers.waitForElement(
      consumerPage,
      '[data-testid="appointments-list"]'
    );

    // 5. 验证预约记录显示
    const appointmentItems = await consumerPage.$$('.appointment-item');
    expect(appointmentItems.length).toBeGreaterThan(0);

    // 6. 验证预约状态显示
    const statusBadges = await consumerPage.$$('.appointment-status');
    expect(statusBadges.length).toBeGreaterThan(0);

    await consumerPage.screenshot({
      path: `test-results/consumer-my-appointments-${Date.now()}.png`,
    });
  });
});
