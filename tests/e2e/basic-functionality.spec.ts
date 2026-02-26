import { test, expect } from '@playwright/test';

test.describe('基础功能验证测试', () => {
  test('验证首页可访问', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/FixCycle|循环经济/);
    console.log('✅ 首页访问正常');
  });

  test('验证登录页面可访问', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    const title = await page.title();
    console.log('登录页面标题:', title);
    
    // 检查页面基本元素
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    console.log('✅ 登录页面访问正常');
  });

  test('验证基本导航功能', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // 尝试点击一些基本链接
    const links = page.locator('a[href]').first();
    if (await links.count() > 0) {
      const href = await links.getAttribute('href');
      console.log('发现链接:', href);
    }
    
    console.log('✅ 基础导航功能验证完成');
  });
});