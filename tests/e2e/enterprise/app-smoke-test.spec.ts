import { test, expect } from '@playwright/test';

test('FixCycle首页功能测试', async ({ page }) => {
  // 访问应用首页
  await page.goto('http://localhost:3001/');

  // 验证页面标题
  await expect(page).toHaveTitle(/FixCycle|边界测试/);

  // 验证主要内容区域存在
  await expect(page.getByRole('main')).toBeVisible();

  // 验证导航栏存在
  await expect(page.getByRole('navigation')).toBeVisible();

  console.log('✅ FixCycle首页访问测试通过');
});

test('页面元素基本测试', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  // 验证页面包含基本元素
  const buttons = page.locator('button');
  const links = page.locator('a[href]');

  // 应该有按钮和链接
  expect(await buttons.count()).toBeGreaterThan(0);
  expect(await links.count()).toBeGreaterThan(0);

  console.log('✅ 页面元素测试通过');
  console.log(`发现按钮数量: ${await buttons.count()}`);
  console.log(`发现链接数量: ${await links.count()}`);
});

test('响应式布局测试', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  // 测试桌面端视窗
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.getByRole('main')).toBeVisible();

  // 测试移动端视窗
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByRole('main')).toBeVisible();

  console.log('✅ 响应式布局测试通过');
});
