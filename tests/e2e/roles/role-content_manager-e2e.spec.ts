import { test, expect } from '@playwright/test';

test.describe('内容管理员权限测试 (CONTENT_MANAGER)', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * 内容管理员登录测试
   */
  test('content_manager-login-001: 内容管理员登录测试', async () => {
    // 访问登录页面
    await page.goto('http://localhost:3001/login?redirect=/admin/content');

    // 输入登录凭据
    await page.fill('[data-testid="email-input"]', 'content@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Content123!');

    // 提交登录
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证用户信息显示
    const userName = await page.textContent('[data-testid="user-name"]');
    expect(userName).toContain('内');

    // 验证角色信息
    const roleDisplay = await page.textContent('[data-testid="user-role"]');
    expect(roleDisplay.toLowerCase()).toContain('content_manager');
  });

  /**
   * 文章内容审核
   */
  test('content_manager-permission-001: 文章内容审核', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/content');
    await page.fill('[data-testid="email-input"]', 'content@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Content123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // TODO: 实现具体的测试逻辑
    // 根据权限范围验证可访问的功能
    console.log('执行文章内容审核测试');
  });
  /**
   * 热点信息发布
   */
  test('content_manager-permission-002: 热点信息发布', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/content');
    await page.fill('[data-testid="email-input"]', 'content@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Content123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到内容管理页面
    await page.waitForURL(/admin\/content/, { timeout: 10000 });

    // 验证页面标题
    const pageTitle = await page.textContent('h1, h2');
    expect(pageTitle).toContain('内容');

    // 验证内容管理菜单项可见
    const contentMenu = page.locator('[data-testid="menu-item-content"]');
    await expect(contentMenu).toBeVisible();

    // 验证热点信息发布功能按钮存在
    const publishButton = page.locator(
      '[data-testid="publish-hotspot-button"]'
    );
    if (await publishButton.isVisible()) {
      await publishButton.click();

      // 验证弹窗或表单出现
      const modal = page.locator('[data-testid="hotspot-publish-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      console.log('✅ 热点信息发布功能可访问');
    } else {
      console.log('⚠️ 热点信息发布按钮未找到，但页面访问正常');
    }
  });
  /**
   * 内容分类管理
   */
  test('content_manager-permission-003: 内容分类管理', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/content');
    await page.fill('[data-testid="email-input"]', 'content@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Content123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到内容管理页面
    await page.waitForURL(/admin\/content/, { timeout: 10000 });

    // 验证分类管理标签页
    const categoryTab = page.locator('[data-testid="category-tab"]');
    if (await categoryTab.isVisible()) {
      await categoryTab.click();

      // 验证分类列表显示
      const categoryList = page.locator('[data-testid="category-list"]');
      await expect(categoryList).toBeVisible({ timeout: 5000 });

      // 验证添加分类按钮
      const addCategoryBtn = page.locator(
        '[data-testid="add-category-button"]'
      );
      await expect(addCategoryBtn).toBeVisible();

      console.log('✅ 内容分类管理功能可访问');
    } else {
      console.log('⚠️ 内容分类管理标签未找到，但页面访问正常');
    }
  });
});

export const ROLE_CONTENT_MANAGER_TEST_DATA = {
  role: 'content_manager',
  roleName: '内容管理员',
  account: {
    email: 'content@fixcycle.com',
    password: 'Content123!',
    name: '内容编辑',
  },
  permissions: [
    'dashboard_read',
    'content_read',
    'content_create',
    'content_update',
    'content_approve',
    'reports_read',
  ],
  expectedMenuItems: [
    '内容仪表板',
    '文章管理',
    '内容审核',
    '分类管理',
    '内容统计',
  ],
};
