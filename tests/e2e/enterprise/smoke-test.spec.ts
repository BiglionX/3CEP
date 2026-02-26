import { test, expect } from '@playwright/test';

test('企业首页基本访问测试', async ({ page }) => {
  // 访问企业首页
  await page.goto('http://localhost:3001/enterprise');
  
  // 验证页面标题
  await expect(page).toHaveTitle(/企业|Enterprise/);
  
  // 验证主要内容区域存在
  await expect(page.getByRole('main')).toBeVisible();
  
  console.log('✅ 企业首页访问测试通过');
});

test('基本导航测试', async ({ page }) => {
  await page.goto('http://localhost:3001/enterprise');
  
  // 验证导航链接存在
  const navLinks = page.locator('a[href]');
  expect(await navLinks.count()).toBeGreaterThan(0);
  
  console.log('✅ 导航元素测试通过');
});