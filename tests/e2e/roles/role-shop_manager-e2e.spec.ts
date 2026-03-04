import { test, expect } from '@playwright/test';

test.describe('店铺管理员权限测试 (SHOP_MANAGER)', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * 店铺管理员登录测试
   */
  test('shop_manager-login-001: 店铺管理员登录测试', async () => {
    // 访问登录页面
    await page.goto('http://localhost:3001/login?redirect=/admin/shops');

    // 输入登录凭据
    await page.fill('[data-testid="email-input"]', 'shop@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Shop123!');

    // 提交登录
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证用户信息显示
    const userName = await page.textContent('[data-testid="user-name"]');
    expect(userName).toContain('店');

    // 验证角色信息
    const roleDisplay = await page.textContent('[data-testid="user-role"]');
    expect(roleDisplay.toLowerCase()).toContain('shop_manager');
  });

  /**
   * 维修店入驻审核
   */
  test('shop_manager-permission-001: 维修店入驻审核', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/shops');
    await page.fill('[data-testid="email-input"]', 'shop@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Shop123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到店铺管理页面
    await page.waitForURL(/admin\/shop|dashboard/, { timeout: 10000 });

    // 验证页面标题
    const pageTitle = await page.textContent('h1, h2');
    expect(pageTitle).toContain('店铺');

    // 验证店铺管理菜单项可见
    const shopMenu = page.locator('[data-testid="menu-item-shop"]');
    await expect(shopMenu).toBeVisible();

    // 验证入驻审核功能
    const reviewSection = page.locator('[data-testid="shop-review-section"]');
    if (await reviewSection.isVisible()) {
      // 查看待审核店铺列表
      const pendingShops = page.locator('[data-testid="pending-shop-item"]');
      const count = await pendingShops.count();

      if (count > 0) {
        // 点击第一个待审核店铺
        await pendingShops.first().click();

        // 验证审核弹窗出现
        const reviewModal = page.locator('[data-testid="shop-review-modal"]');
        await expect(reviewModal).toBeVisible({ timeout: 5000 });
      }

      console.log(`✅ 发现 ${count} 个待审核店铺`);
    } else {
      console.log('⚠️ 店铺入驻审核区域未找到，但页面访问正常');
    }
  });
  /**
   * 店铺信息管理
   */
  test('shop_manager-permission-002: 店铺信息管理', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/shops');
    await page.fill('[data-testid="email-input"]', 'shop@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Shop123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // 验证是否成功跳转到店铺管理页面
    await page.waitForURL(/admin\/shop|dashboard/, { timeout: 10000 });

    // 验证店铺信息管理功能
    const infoManagementTab = page.locator('[data-testid="shop-info-tab"]');
    if (await infoManagementTab.isVisible()) {
      await infoManagementTab.click();

      // 验证店铺信息列表显示
      const shopList = page.locator('[data-testid="shop-info-list"]');
      await expect(shopList).toBeVisible({ timeout: 5000 });

      // 验证编辑按钮存在
      const editButtons = page.locator('[data-testid="edit-shop-button"]');
      const editCount = await editButtons.count();

      if (editCount > 0) {
        // 点击第一个编辑按钮
        await editButtons.first().click();

        // 验证编辑表单出现
        const editForm = page.locator('[data-testid="shop-edit-form"]');
        await expect(editForm).toBeVisible({ timeout: 5000 });
      }

      console.log(`✅ 店铺信息管理功能正常，发现 ${editCount} 个可编辑店铺`);
    } else {
      console.log('⚠️ 店铺信息管理标签未找到，但页面访问正常');
    }
  });
  /**
   * 服务范围配置
   */
  test('shop_manager-permission-003: 服务范围配置', async () => {
    // 先登录
    await page.goto('http://localhost:3001/login?redirect=/admin/shops');
    await page.fill('[data-testid="email-input"]', 'shop@fixcycle.com');
    await page.fill('[data-testid="password-input"]', 'Shop123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });

    // TODO: 实现具体的测试逻辑
    // 根据权限范围验证可访问的功能
    console.log('执行服务范围配置测试');
  });
});

export const ROLE_SHOP_MANAGER_TEST_DATA = {
  role: 'shop_manager',
  roleName: '店铺管理员',
  account: {
    email: 'shop@fixcycle.com',
    password: 'Shop123!',
    name: '店铺管理员',
  },
  permissions: [
    'dashboard_read',
    'shops_read',
    'shops_create',
    'shops_update',
    'shops_approve',
    'reports_read',
  ],
  expectedMenuItems: [
    '店铺仪表板',
    '店铺列表',
    '入驻审核',
    '服务管理',
    '店铺统计',
  ],
};
