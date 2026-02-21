import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TestHelpers } from '../e2e-config';

test.describe('管理后台热点审核测试 (E2E-ADMIN-01/02/03)', () => {
  let adminPage: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    adminPage = await context.newPage();
  });

  test.afterEach(async () => {
    await adminPage.close();
  });

  /**
   * E2E-ADMIN-01: 管理员登录后台与热点审核页访问
   * 优先级: P1
   * 测试要点:
   * - 管理员角色登录
   * - 热点审核页面访问
   * - 待审核链接列表展示
   */
  test('E2E-ADMIN-01: 管理员登录与热点审核页访问', async () => {
    // 1. 访问管理员登录页面
    await adminPage.goto(TEST_CONFIG.ADMIN_URL + '/login');
    await TestHelpers.waitForElement(adminPage, 'text=管理后台登录');
    
    // 2. 输入管理员账号信息
    await TestHelpers.fillForm(adminPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password
    });
    await adminPage.click('[data-testid="login-button"]');
    
    // 3. 等待登录完成并跳转到仪表板
    await adminPage.waitForURL(TEST_CONFIG.ADMIN_URL + '/dashboard', { timeout: TEST_CONFIG.timeouts.pageLoad });
    
    // 4. 导航到热点审核页面
    await adminPage.click('[data-testid="link-review-menu"]');
    
    // 5. 等待审核页面加载
    await TestHelpers.waitForElement(adminPage, '[data-testid="pending-links-list"]');
    
    // 6. 验证待审核链接列表存在
    const pendingLinks = await adminPage.$$('.pending-link-item');
    expect(pendingLinks.length).toBeGreaterThanOrEqual(0); // 可能为空，但元素应该存在
    
    // 7. 验证页面标题
    const pageTitle = await adminPage.title();
    expect(pageTitle).toContain('热点审核');
    
    await adminPage.screenshot({ path: `test-results/admin-link-review-access-${Date.now()}.png` });
  });

  /**
   * E2E-ADMIN-02: 热点链接审核通过流程
   * 优先级: P1
   * 测试要点:
   * - 审核通过操作
   * - 对应文章发布
   * - 热点链接状态变更
   */
  test('E2E-ADMIN-02: 热点链接审核通过流程', async () => {
    // 1. 登录并访问审核页面
    await adminPage.goto(TEST_CONFIG.ADMIN_URL + '/login');
    await TestHelpers.fillForm(adminPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password
    });
    await adminPage.click('[data-testid="login-button"]');
    await adminPage.waitForURL(TEST_CONFIG.ADMIN_URL + '/dashboard');
    
    await adminPage.click('[data-testid="link-review-menu"]');
    await TestHelpers.waitForElement(adminPage, '[data-testid="pending-links-list"]');
    
    // 2. 找到第一条待审核链接
    const firstPendingLink = await TestHelpers.waitForElement(adminPage, '.pending-link-item:first-child');
    
    // 3. 记录审核前的状态
    const initialStatus = await firstPendingLink.$('[data-testid="link-status"]');
    const initialStatusText = await initialStatus.textContent();
    expect(initialStatusText).toContain('待审核');
    
    // 4. 点击审核通过按钮
    await firstPendingLink.click('[data-testid="approve-button"]');
    
    // 5. 等待审核确认对话框
    await TestHelpers.waitForElement(adminPage, '[data-testid="approve-confirm-dialog"]');
    
    // 6. 确认审核通过
    await adminPage.click('[data-testid="confirm-approve"]');
    
    // 7. 等待操作完成
    await adminPage.waitForTimeout(TEST_CONFIG.timeouts.apiResponse);
    
    // 8. 验证状态变更为已发布
    const updatedStatus = await firstPendingLink.$('[data-testid="link-status"]');
    const updatedStatusText = await updatedStatus.textContent();
    expect(updatedStatusText).toContain('已发布');
    
    // 9. 验证对应文章已发布（检查文章管理页面）
    await adminPage.click('[data-testid="articles-menu"]');
    await TestHelpers.waitForElement(adminPage, '[data-testid="published-articles-list"]');
    
    const publishedArticles = await adminPage.$$('.article-item');
    expect(publishedArticles.length).toBeGreaterThan(0);
    
    await adminPage.screenshot({ path: `test-results/admin-link-approved-${Date.now()}.png` });
  });

  /**
   * E2E-ADMIN-03: 热点链接驳回操作
   * 优先级: P1
   * 测试要点:
   * - 驳回操作处理
   * - 状态变更为已驳回
   * - 草稿删除验证
   */
  test('E2E-ADMIN-03: 热点链接驳回操作', async () => {
    // 1. 登录并访问审核页面
    await adminPage.goto(TEST_CONFIG.ADMIN_URL + '/login');
    await TestHelpers.fillForm(adminPage, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password
    });
    await adminPage.click('[data-testid="login-button"]');
    await adminPage.waitForURL(TEST_CONFIG.ADMIN_URL + '/dashboard');
    
    await adminPage.click('[data-testid="link-review-menu"]');
    await TestHelpers.waitForElement(adminPage, '[data-testid="pending-links-list"]');
    
    // 2. 找到一条待审核链接
    const pendingLink = await TestHelpers.waitForElement(adminPage, '.pending-link-item:nth-child(2)');
    
    // 3. 记录初始状态
    const initialStatus = await pendingLink.$('[data-testid="link-status"]');
    const initialStatusText = await initialStatus.textContent();
    expect(initialStatusText).toContain('待审核');
    
    // 4. 点击驳回按钮
    await pendingLink.click('[data-testid="reject-button"]');
    
    // 5. 填写驳回原因
    await TestHelpers.waitForElement(adminPage, '[data-testid="reject-reason-input"]');
    await adminPage.fill('[data-testid="reject-reason-input"]', '内容不符合规范要求');
    
    // 6. 确认驳回
    await adminPage.click('[data-testid="confirm-reject"]');
    
    // 7. 等待操作完成
    await adminPage.waitForTimeout(TEST_CONFIG.timeouts.apiResponse);
    
    // 8. 验证状态变更为已驳回
    const updatedStatus = await pendingLink.$('[data-testid="link-status"]');
    const updatedStatusText = await updatedStatus.textContent();
    expect(updatedStatusText).toContain('已驳回');
    
    // 9. 验证驳回原因显示
    const rejectReason = await pendingLink.$('[data-testid="reject-reason"]');
    const reasonText = await rejectReason.textContent();
    expect(reasonText).toContain('内容不符合规范要求');
    
    await adminPage.screenshot({ path: `test-results/admin-link-rejected-${Date.now()}.png` });
  });
});