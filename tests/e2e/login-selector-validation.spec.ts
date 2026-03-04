import { test, expect } from '@playwright/test';
import { TestHelpers } from '../test-helpers';
import { TEST_ENV } from '../test-config';

test.describe('登录元素选择器验证测试', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('验证登录页面元素选择器', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${TEST_ENV.getBaseUrl()}/login`);

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证邮箱输入框存在
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    console.log('✅ 邮箱输入框选择器验证通过');

    // 验证密码输入框存在
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toBeVisible();
    console.log('✅ 密码输入框选择器验证通过');

    // 验证登录按钮存在
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    console.log('✅ 登录按钮选择器验证通过');

    // 测试填写表单功能
    await helpers.fillForm({
      '#email': 'test@example.com',
      '#password': 'test123456',
    });

    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('test123456');
    console.log('✅ 表单填写功能验证通过');

    console.log('🎉 所有元素选择器调整验证完成');
  });

  test('验证登录流程', async ({ page }) => {
    const helpers = new TestHelpers(page);

    // 执行登录流程
    await helpers.login('admin@test.com', 'Admin123!@#');

    // 验证登录成功（检查是否跳转到非登录页面）
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    console.log('✅ 登录流程验证通过');
  });
});
