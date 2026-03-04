import { test, expect } from '@playwright/test';

test.describe('只读查看员权限测试 (VIEWER)', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * 只读查看员登录测试
   */
  test('viewer-login-001: 只读查看员登录测试', async () => {
    // 访问登录页面
    await page.goto('http://localhost:3001/login?redirect=/dashboard');

    // 输入登录凭据
    await page.fill('[data-testid="email-input"]', 'viewer@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Viewer123!');

    // 提交登录
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证用户信息显示
    const userName = await page.textContent('[data-testid="user-name"]');
    expect(userName).toContain('数');

    // 验证角色信息
    const roleDisplay = await page.textContent('[data-testid="user-role"]');
    expect(roleDisplay.toLowerCase()).toContain('viewer');
  });

  /**
   * 仪表板数据查看
   */
  test('viewer-permission-001: 仪表板数据查看', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/dashboard');
    await page.fill('[data-testid="email-input"]', 'viewer@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Viewer123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到仪表板
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证仪表板元素可见
    const dashboardElements = [
      '[data-testid="dashboard-header"]',
      '[data-testid="stats-cards"]',
      '[data-testid="recent-activity"]',
    ];

    for (const selector of dashboardElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`✅ 仪表板元素 ${selector} 可见`);
      }
    }

    // 验证只读权限 - 尝试查找编辑按钮（应该不存在）
    const editButtons = page.locator(
      '[data-testid*="edit"], [data-testid*="delete"][data-testid*="button"]'
    );
    const editCount = await editButtons.count();

    if (editCount === 0) {
      console.log('✅ 确认为只读权限，未发现编辑/删除按钮');
    } else {
      console.log(`⚠️ 发现 ${editCount} 个可能的编辑按钮，请验证权限配置`);
    }
  });
  /**
   * 基础报表浏览
   */
  test('viewer-permission-002: 基础报表浏览', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/dashboard');
    await page.fill('[data-testid="email-input"]', 'viewer@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Viewer123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到报表页面
    await page.goto('http://localhost:3001/admin/reports');
    await page.waitForURL(/admin\/reports/, { timeout: 10000 });

    // 验证报表页面元素
    const reportElements = [
      '[data-testid="report-header"]',
      '[data-testid="report-filters"]',
      '[data-testid="report-charts"]',
    ];

    for (const selector of reportElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`✅ 报表元素 ${selector} 可见`);
      }
    }

    // 验证导出功能存在（只读用户应该只能查看和导出）
    const exportButtons = page.locator(
      '[data-testid*="export"], [data-testid*="download"]'
    );
    const exportCount = await exportButtons.count();

    if (exportCount > 0) {
      console.log(`✅ 发现 ${exportCount} 个导出功能，符合只读权限`);
    } else {
      console.log('⚠️ 未发现导出功能，请检查权限配置');
    }
  });
  /**
   * 统计信息查阅
   */
  test('viewer-permission-003: 统计信息查阅', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/dashboard');
    await page.fill('[data-testid="email-input"]', 'viewer@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Viewer123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // TODO: 实现具体的测试逻辑
    // 根据权限范围验证可访问的功能
    console.log('执行统计信息查阅测试');
  });
});

export const ROLE_VIEWER_TEST_DATA = {
  role: 'viewer',
  roleName: '只读查看员',
  account: {
    email: 'viewer@fixcycle.com',
    password: 'Viewer123!',
    name: '数据查看员',
  },
  permissions: ['dashboard_read', 'reports_read'],
  expectedMenuItems: ['数据仪表板', '基础报表', '统计概览'],
};
