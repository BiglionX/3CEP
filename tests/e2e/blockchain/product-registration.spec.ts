/**
 * 区块链功能 E2E 测试
 * 测试产品注册到区块链的完整流程
 */

import { expect, test } from '@playwright/test';

// 测试管理员账号
const ADMIN_USER = {
  email: 'admin@fixcycle.com',
  password: 'password123',
};

// 测试产品信息
const TEST_PRODUCT = {
  name: '区块链测试产品',
  batchNumber: 'BATCH-20260323-001',
  category: '电子产品',
  description: '用于区块链溯源测试的产品',
};

test.describe('区块链溯源功能', () => {
  // 管理员批量注册产品到区块链
  test('管理员可以批量注册产品到区块链', async ({ page }) => {
    // 1. 登录管理员账号
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(ADMIN_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(ADMIN_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    // 等待导航完成
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByText('欢迎回来')).toBeVisible();

    // 2. 导航到溯源管理页面
    await page.getByText('溯源管理').click();
    await page.waitForURL(/\/blockchain/);

    // 3. 选择产品批次
    await page.getByRole('button', { name: '产品列表' }).click();
    await page.waitForTimeout(500);

    // 4. 选择多个产品
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.check();

    const secondCheckbox = checkboxes.nth(1);
    if (await secondCheckbox.isVisible()) {
      await secondCheckbox.check();
    }

    // 5. 点击批量上链按钮
    await page.getByRole('button', { name: /批量上链|上链/ }).click();

    // 6. 确认上链操作
    const confirmButton = page.getByRole('button', { name: /确认|确定/ });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // 7. 验证交易成功提示
    await expect(
      page.getByText(/上链成功|交易成功|已添加到区块链/)
    ).toBeVisible({ timeout: 10000 });

    // 8. 检查区块链浏览器链接
    const blockchainLink = page.getByRole('link', {
      name: /查看区块链|区块链浏览器|交易详情/i,
    });
    if (await blockchainLink.isVisible()) {
      expect(await blockchainLink.getAttribute('href')).toContain('http');
    }
  });

  // 消费者验证产品真伪
  test('消费者可以通过扫码验证产品真伪', async ({ page }) => {
    // 1. 打开产品验证页面（无需登录）
    await page.goto('/verify');

    // 2. 输入产品溯源码
    const traceCode = TEST_PRODUCT.batchNumber;
    await page.getByPlaceholder(/请输入溯源码|扫码验证/).fill(traceCode);

    // 3. 点击验证按钮
    await page.getByRole('button', { name: /验证|查询/ }).click();

    // 4. 显示产品详细信息
    await expect(page.getByText(TEST_PRODUCT.name)).toBeVisible({
      timeout: 5000,
    });

    // 验证产品信息展示
    await expect(page.getByText(TEST_PRODUCT.batchNumber)).toBeVisible();
    await expect(page.getByText(TEST_PRODUCT.category)).toBeVisible();

    // 5. 显示区块链存证标识
    await expect(page.getByText(/区块链存证|已上链|区块链认证/i)).toBeVisible();

    // 检查是否有区块链哈希值显示
    const txHashElement = page.getByText(/0x[a-fA-F0-9]{64}/);
    if (await txHashElement.isVisible()) {
      const txHash = await txHashElement.textContent();
      expect(txHash).toMatch(/0x[a-fA-F0-9]{64}/);
    }
  });

  // 查看产品溯源历史
  test('用户可以查看产品完整溯源历史', async ({ page }) => {
    // 1. 访问产品详情页
    await page.goto(`/products/${TEST_PRODUCT.batchNumber}`);

    // 或者通过验证后跳转
    // await page.goto('/verify');
    // await page.getByPlaceholder(/请输入溯源码/).fill(TEST_PRODUCT.batchNumber);
    // await page.getByRole('button', { name: /验证/ }).click();

    // 2. 点击溯源历史标签
    const historyTab = page.getByRole('tab', {
      name: /溯源历史|流转记录|节点信息/i,
    });

    if (await historyTab.isVisible()) {
      await historyTab.click();
    } else {
      // 如果没有 tab，直接查找历史记录区域
      const historySection = page.getByText(/溯源历史|流转记录/i);
      if (await historySection.isVisible()) {
        await historySection.scrollIntoViewIfNeeded();
      }
    }

    // 3. 显示所有流转节点信息
    const timelineItems = page.locator(
      '[class*="timeline"], [class*="step"], [class*="node"]'
    );
    const count = await timelineItems.count();
    expect(count).toBeGreaterThan(0);

    // 4. 时间线展示清晰
    // 验证至少包含以下信息
    const expectedInfo = [/时间|日期/, /操作|动作/, /节点|位置/];

    for (const info of expectedInfo) {
      await expect(page.getByText(info)).toBeVisible();
    }

    // 检查节点状态图标
    const statusIcons = page.locator(
      '[class*="status"], [class*="icon-check"]'
    );
    expect(await statusIcons.count()).toBeGreaterThan(0);
  });
});
