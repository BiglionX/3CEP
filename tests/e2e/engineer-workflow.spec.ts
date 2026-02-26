import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TestHelpers } from '../e2e-config';

test.describe('工程师核心流程测试 (E2E-ENG-*)', () => {
  let engineerPage: any;

  test.beforeEach(async ({ browser }) => {
    // 为每个测试创建新的浏览器上下文
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // 移动端尺寸
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    engineerPage = await context.newPage();
  });

  test.afterEach(async () => {
    await engineerPage.close();
  });

  /**
   * E2E-ENG-01: 工程师登录与信息流查看
   * 优先级: P0
   * 测试要点:
   * - 工程师角色登录功能
   * - 首页信息流展示正确性
   * - 热点链接卡片渲染
   * - 设备标签和点赞数显示
   */
  test('E2E-ENG-01: 工程师登录与信息流查看', async () => {
    // 1. 访问登录页面
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.waitForElement(engineerPage, 'text=登录');
    
    // 2. 输入工程师账号信息
    await engineerPage.fill('[data-testid="email-input"]', TEST_CONFIG.TEST_USERS.engineer.email);
    await engineerPage.fill('[data-testid="password-input"]', TEST_CONFIG.TEST_USERS.engineer.password);
    await engineerPage.click('[data-testid="login-button"]');
    
    // 3. 等待登录完成并跳转到首页
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/', { timeout: TEST_CONFIG.timeouts.pageLoad });
    
    // 4. 验证首页信息流展示
    await TestHelpers.waitForElement(engineerPage, '[data-testid="content-feed"]');
    
    // 5. 检查热点链接卡片是否存在
    const hotLinkCards = await engineerPage.$$('.hot-link-card');
    expect(hotLinkCards.length).toBeGreaterThan(0);
    
    // 6. 验证设备标签显示
    const deviceTags = await engineerPage.$$('.device-tag');
    expect(deviceTags.length).toBeGreaterThan(0);
    
    // 7. 验证点赞数显示
    const likeCounts = await engineerPage.$$('.like-count');
    expect(likeCounts.length).toBeGreaterThan(0);
    
    // 8. 截图保存测试结果
    await engineerPage.screenshot({ path: `test-results/engineer-login-feed-${Date.now()}.png` });
  });

  /**
   * E2E-ENG-02: 热点链接点赞功能
   * 优先级: P0
   * 测试要点:
   * - 单次点赞功能
   * - 点赞状态同步更新
   */
  test('E2E-ENG-02: 热点链接点赞功能', async () => {
    // 1. 先登录
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(engineerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await engineerPage.click('[data-testid="login-button"]');
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/');
    
    // 2. 找到第一个可点赞的热点链接
    const firstLikeButton = await TestHelpers.waitForElement(engineerPage, '[data-testid="like-button"]:not([disabled])');
    
    // 3. 记录点赞前的数量
    const likeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const initialLikes = await likeCountElement.textContent();
    const initialCount = parseInt(initialLikes || '0');
    
    // 4. 执行点赞操作
    await firstLikeButton.click();
    await engineerPage.waitForTimeout(TEST_CONFIG.timeouts.animationComplete);
    
    // 5. 验证点赞数增加
    const updatedLikeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const updatedLikes = await updatedLikeCountElement.textContent();
    const updatedCount = parseInt(updatedLikes || '0');
    
    expect(updatedCount).toBe(initialCount + 1);
    
    // 6. 验证按钮状态变化
    const updatedLikeButton = await engineerPage.$('[data-testid="like-button"]');
    const isDisabled = await updatedLikeButton.isDisabled();
    expect(isDisabled).toBeFalsy(); // 24小时限制测试在另一个用例中
    
    await engineerPage.screenshot({ path: `test-results/engineer-like-success-${Date.now()}.png` });
  });

  /**
   * E2E-ENG-03: 取消点赞功能
   * 优先级: P0
   * 测试要点:
   * - 取消点赞功能
   * - 点赞状态同步更新
   */
  test('E2E-ENG-03: 取消点赞功能', async () => {
    // 1. 登录并导航到内容页面
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(engineerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await engineerPage.click('[data-testid="login-button"]');
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/');
    
    // 2. 找到已点赞的内容
    const unlikeButton = await TestHelpers.waitForElement(engineerPage, '[data-testid="unlike-button"]');
    
    // 3. 记录取消点赞前的数量
    const likeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const initialLikes = await likeCountElement.textContent();
    const initialCount = parseInt(initialLikes || '0');
    
    // 4. 执行取消点赞操作
    await unlikeButton.click();
    await engineerPage.waitForTimeout(TEST_CONFIG.timeouts.animationComplete);
    
    // 5. 验证点赞数减少
    const updatedLikeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const updatedLikes = await updatedLikeCountElement.textContent();
    const updatedCount = parseInt(updatedLikes || '0');
    
    expect(updatedCount).toBe(initialCount - 1);
    
    await engineerPage.screenshot({ path: `test-results/engineer-unlike-success-${Date.now()}.png` });
  });

  /**
   * E2E-ENG-04: 24小时内重复点赞限制
   * 优先级: P0
   * 测试要点:
   * - 24小时内重复点赞限制
   * - 点赞数不变
   */
  test('E2E-ENG-04: 24小时内重复点赞限制', async () => {
    // 1. 登录
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(engineerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await engineerPage.click('[data-testid="login-button"]');
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/');
    
    // 2. 找到一个已点赞的内容
    const likedButton = await TestHelpers.waitForElement(engineerPage, '[data-testid="liked-button"]');
    
    // 3. 记录当前点赞数
    const likeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const initialLikes = await likeCountElement.textContent();
    const initialCount = parseInt(initialLikes || '0');
    
    // 4. 尝试重复点赞
    await likedButton.click();
    await engineerPage.waitForTimeout(TEST_CONFIG.timeouts.animationComplete);
    
    // 5. 验证点赞数没有变化
    const updatedLikeCountElement = await engineerPage.$('[data-testid="like-count"]');
    const updatedLikes = await updatedLikeCountElement.textContent();
    const updatedCount = parseInt(updatedLikes || '0');
    
    expect(updatedCount).toBe(initialCount);
    
    // 6. 验证错误提示显示
    const errorMessage = await engineerPage.$('[data-testid="like-limit-error"]');
    expect(errorMessage).toBeTruthy();
    
    await engineerPage.screenshot({ path: `test-results/engineer-like-limit-${Date.now()}.png` });
  });

  /**
   * E2E-ENG-05: 热点沉淀机制测试
   * 优先级: P1
   * 测试要点:
   * - 点赞数达到3的触发条件
   * - 待审核草稿自动生成
   * - 状态变更验证
   */
  test('E2E-ENG-05: 热点沉淀机制测试', async () => {
    // 1. 登录
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(engineerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await engineerPage.click('[data-testid="login-button"]');
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/');
    
    // 2. 找到接近触发条件的热点链接（假设有一个已经有2个赞）
    const targetLink = await TestHelpers.waitForElement(engineerPage, '[data-testid="hot-link-with-2-likes"]');
    
    // 3. 执行第三次点赞
    await targetLink.click('[data-testid="like-button"]');
    await engineerPage.waitForTimeout(TEST_CONFIG.timeouts.animationComplete);
    
    // 4. 验证草稿创建提示
    const draftSuccessToast = await engineerPage.$('[data-testid="draft-success-toast"]');
    expect(draftSuccessToast).toBeTruthy();
    
    // 5. 验证草稿指示器显示
    const draftIndicator = await engineerPage.$('[data-testid="draft-indicator"]');
    expect(draftIndicator).toBeTruthy();
    
    // 6. 验证点赞按钮被禁用
    const likeButton = await engineerPage.$('[data-testid="like-button"]');
    const isDisabled = await likeButton.isDisabled();
    expect(isDisabled).toBeTruthy();
    
    await engineerPage.screenshot({ path: `test-results/engineer-draft-trigger-${Date.now()}.png` });
  });

  /**
   * E2E-ENG-06: 全局搜索功能
   * 优先级: P0
   * 测试要点:
   * - 关键词搜索准确性
   * - 结果混排算法
   * - 文章/配件/店铺/热点混合展示
   */
  test('E2E-ENG-06: 全局搜索功能', async () => {
    // 1. 登录
    await engineerPage.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(engineerPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await engineerPage.click('[data-testid="login-button"]');
    await engineerPage.waitForURL(TEST_CONFIG.BASE_URL + '/');
    
    // 2. 点击搜索框
    await engineerPage.click('[data-testid="search-input"]');
    
    // 3. 输入搜索关键词
    await engineerPage.fill('[data-testid="search-input"]', 'iPhone 屏幕');
    await engineerPage.press('[data-testid="search-input"]', 'Enter');
    
    // 4. 等待搜索结果加载
    await TestHelpers.waitForElement(engineerPage, '[data-testid="search-results"]');
    
    // 5. 验证搜索结果存在
    const searchResults = await engineerPage.$$('.search-result-item');
    expect(searchResults.length).toBeGreaterThan(0);
    
    // 6. 验证结果类型多样性（文章、配件、热点链接等）
    const resultTypes = await engineerPage.$$('.result-type-badge');
    const uniqueTypes = new Set(await Promise.all(
      resultTypes.map((el: any) => el.textContent())
    ));
    expect(uniqueTypes.size).toBeGreaterThan(1);
    
    // 7. 验证搜索统计信息
    const resultStats = await engineerPage.$('[data-testid="search-stats"]');
    expect(resultStats).toBeTruthy();
    
    await engineerPage.screenshot({ path: `test-results/engineer-search-results-${Date.now()}.png` });
  });
});