import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TestHelpers } from '../e2e-config';

test.describe('G1. 角色导航权限测试 (ROLES-NAVIGATION)', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * G1-01: 管理员角色访问受限路由
   * 验证: Admin 可以访问所有管理页面
   */
  test('G1-01: 管理员访问管理页面', async () => {
    // 1. 管理员登录
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 2. 访问管理页面
    await page.goto(TEST_CONFIG.ADMIN_URL + '/dashboard');
    await TestHelpers.waitForElement(page, '[data-testid="admin-dashboard"]');
    
    // 3. 验证页面正常加载
    const dashboardTitle = await page.$('[data-testid="dashboard-title"]');
    expect(dashboardTitle).toBeTruthy();

    // 4. 访问用户管理页面
    await page.goto(TEST_CONFIG.ADMIN_URL + '/users');
    await TestHelpers.waitForElement(page, '[data-testid="users-management"]');
    
    // 5. 验证权限管理页面
    await page.goto(TEST_CONFIG.ADMIN_URL + '/permissions');
    await TestHelpers.waitForElement(page, '[data-testid="permissions-management"]');

    await page.screenshot({ path: `test-results/g1-admin-access-success-${Date.now()}.png` });
  });

  /**
   * G1-02: 工程师角色访问受限路由
   * 验证: Engineer 无法访问管理页面，应跳转到 403 或隐藏菜单
   */
  test('G1-02: 工程师访问管理页面被拒绝', async () => {
    // 1. 工程师登录
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 2. 尝试访问管理页面
    const response = await page.goto(TEST_CONFIG.ADMIN_URL + '/dashboard');
    
    // 3. 验证访问被拒绝
    if (response?.status() === 403) {
      // 期望得到 403 状态码
      expect(response.status()).toBe(403);
    } else {
      // 或者验证页面显示权限拒绝信息
      await page.waitForTimeout(2000);
      const forbiddenMessage = await page.$('[data-testid="access-forbidden"]') ||
                              await page.$('text=权限不足') ||
                              await page.$('text=403');
      
      // 如果没有明确的权限拒绝信息，验证是否重定向到首页
      const currentUrl = page.url();
      const isRedirected = currentUrl === TEST_CONFIG.BASE_URL + '/' || 
                          currentUrl.includes('/unauthorized');
      
      expect(forbiddenMessage || isRedirected).toBeTruthy();
    }

    await page.screenshot({ path: `test-results/g1-engineer-access-denied-${Date.now()}.png` });
  });

  /**
   * G1-03: 消费者角色访问受限路由
   * 验证: Consumer 无法访问工程师和管理功能
   */
  test('G1-03: 消费者访问专业功能被拒绝', async () => {
    // 1. 消费者登录
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.consumer.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 2. 尝试访问工程师专属页面
    const engResponse = await page.goto(TEST_CONFIG.BASE_URL + '/engineer/tools');
    
    // 3. 验证工程师工具访问被拒绝
    if (engResponse?.status() === 403) {
      expect(engResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const forbiddenElements = await page.$$('text=权限不足') || 
                               await page.$$('text=需要工程师权限') ||
                               await page.$$('text=403');
      expect(forbiddenElements.length).toBeGreaterThan(0);
    }

    // 4. 尝试访问管理页面
    const adminResponse = await page.goto(TEST_CONFIG.ADMIN_URL + '/dashboard');
    
    // 5. 验证管理页面访问被拒绝
    if (adminResponse?.status() === 403) {
      expect(adminResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const redirectElements = await page.$$('text=权限不足') ||
                              await page.$$('text=访问被拒绝');
      expect(redirectElements.length).toBeGreaterThan(0);
    }

    await page.screenshot({ path: `test-results/g1-consumer-access-restricted-${Date.now()}.png` });
  });

  /**
   * G1-04: 店铺主角色访问权限验证
   * 验证: Shop Owner 只能访问相关管理功能
   */
  test('G1-04: 店铺主访问权限范围验证', async () => {
    // 1. 店铺主登录
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.shopOwner.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.shopOwner.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 2. 访问店铺管理页面（应该成功）
    await page.goto(TEST_CONFIG.BASE_URL + '/shop/manage');
    await TestHelpers.waitForElement(page, '[data-testid="shop-management"]');
    
    const shopManageTitle = await page.$('[data-testid="shop-manage-title"]');
    expect(shopManageTitle).toBeTruthy();

    // 3. 尝试访问系统管理页面（应该失败）
    const sysResponse = await page.goto(TEST_CONFIG.ADMIN_URL + '/system');
    
    if (sysResponse?.status() === 403) {
      expect(sysResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const forbiddenMsg = await page.$('text=权限不足') ||
                          await page.$('text=需要管理员权限');
      expect(forbiddenMsg).toBeTruthy();
    }

    await page.screenshot({ path: `test-results/g1-shopowner-permission-scope-${Date.now()}.png` });
  });

  /**
   * G1-05: 未授权用户访问验证
   * 验证: 未登录用户访问受保护路由的行为
   */
  test('G1-05: 未授权用户访问受保护路由', async () => {
    // 1. 不登录直接访问管理页面
    const response = await page.goto(TEST_CONFIG.ADMIN_URL + '/dashboard');
    
    // 2. 验证重定向到登录页面
    await page.waitForURL(/login/);
    const loginForm = await page.$('[data-testid="login-form"]');
    expect(loginForm).toBeTruthy();

    // 3. 不登录访问需要认证的API端点
    const apiResponse = await page.request.get(`${TEST_CONFIG.BASE_URL}/api/admin/users`);
    expect(apiResponse.status()).toBe(401); // 未认证

    await page.screenshot({ path: `test-results/g1-unauthorized-access-${Date.now()}.png` });
  });

  /**
   * G1-06: 菜单权限显示验证
   * 验证: 不同角色看到不同的导航菜单项
   */
  test('G1-06: 角色菜单权限显示', async () => {
    // 管理员菜单验证
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 验证管理员看到管理菜单
    const adminMenu = await page.$('[data-testid="admin-menu"]');
    expect(adminMenu).toBeTruthy();

    // 工程师菜单验证
    await page.goto('/logout'); // 登出
    await page.goto(TEST_CONFIG.BASE_URL + '/login');
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.engineer.password
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(TEST_CONFIG.BASE_URL + '/');

    // 验证工程师看到专业工具菜单
    const engineerToolsMenu = await page.$('[data-testid="engineer-tools-menu"]');
    expect(engineerToolsMenu).toBeTruthy();

    // 验证工程师看不到管理菜单
    const noAdminMenu = await page.$('[data-testid="admin-menu"]');
    expect(noAdminMenu).toBeFalsy();

    await page.screenshot({ path: `test-results/g1-role-menu-display-${Date.now()}.png` });
  });
});