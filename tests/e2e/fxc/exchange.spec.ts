/**
 * FXC 兑换 E2E 测试
 * 测试 FXC 兑换 Token 的完整流程
 */

import { expect, test } from '@playwright/test';

// 测试用户账号
const TEST_USER = {
  email: 'user@fixcycle.com',
  password: 'password123',
};

// 兑换配置
const EXCHANGE_CONFIG = {
  minAmount: 10,
  maxAmount: 10000,
  testAmount: 100,
};

test.describe('FXC 兑换功能', () => {
  // 用户兑换 Token
  test('用户可以兑换 Token', async ({ page }) => {
    // 1. 登录并打开 FXC 管理页面
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(TEST_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(TEST_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    // 等待导航完成
    await page.waitForURL(/\/dashboard/);

    // 导航到 FXC 管理页面
    await page.getByText(/FXC|积分管理|我的 FXC/i).click();
    await page.waitForURL(/\/fxc|\/wallet/i);

    // 记录初始余额
    const initialFxcBalanceElement = page
      .getByText(/FXC 余额|FXC 可用/i)
      .first();
    let initialFxcBalance = 0;
    if (await initialFxcBalanceElement.isVisible()) {
      const text = await initialFxcBalanceElement.textContent();
      const match = text?.match(/(\d+)/);
      if (match) {
        initialFxcBalance = parseInt(match[1]);
      }
    }

    const initialTokenBalanceElement = page
      .getByText(/Token 余额|Token 可用/i)
      .first();
    let initialTokenBalance = 0;
    if (await initialTokenBalanceElement.isVisible()) {
      const text = await initialTokenBalanceElement.textContent();
      const match = text?.match(/(\d+)/);
      if (match) {
        initialTokenBalance = parseInt(match[1]);
      }
    }

    // 2. 输入兑换数量
    const exchangeAmount = EXCHANGE_CONFIG.testAmount;
    await page
      .getByPlaceholder(/请输入兑换数量|兑换金额/i)
      .fill(exchangeAmount.toString());

    // 3. 查看实时汇率和手续费
    await expect(page.getByText(/汇率|兑换比例/i)).toBeVisible();
    await expect(page.getByText(/手续费|费率/i)).toBeVisible();

    // 获取显示的汇率信息
    const exchangeRateText = await page
      .getByText(/汇率|兑换比例/i)
      .textContent();
    expect(exchangeRateText).toContain(/\d+/);

    // 4. 点击兑换按钮
    await page.getByRole('button', { name: /兑换|立即兑换/i }).click();

    // 5. 确认交易详情
    const confirmDialog = page.getByRole('dialog');
    if (await confirmDialog.isVisible()) {
      // 验证交易详情显示
      await expect(page.getByText(/兑换数量|兑换金额/i)).toBeVisible();
      await expect(page.getByText(/手续费/i)).toBeVisible();
      await expect(page.getByText(/实际到账/i)).toBeVisible();

      // 确认兑换
      await page.getByRole('button', { name: /确认兑换|确定/i }).click();
    }

    // 6. 验证交易成功提示
    await expect(page.getByText(/兑换成功|交易成功/i)).toBeVisible({
      timeout: 10000,
    });

    // 7. 验证 FXC 余额减少
    await page.waitForTimeout(1000); // 等待余额更新

    const finalFxcBalanceElement = page.getByText(/FXC 余额|FXC 可用/i).first();
    const finalFxcText = await finalFxcBalanceElement.textContent();
    const finalFxcMatch = finalFxcText?.match(/(\d+)/);

    if (finalFxcMatch) {
      const finalFxcBalance = parseInt(finalFxcMatch[1]);
      expect(finalFxcBalance).toBeLessThanOrEqual(
        initialFxcBalance - exchangeAmount
      );
    }

    // 8. 验证 Token 余额增加
    const finalTokenBalanceElement = page
      .getByText(/Token 余额|Token 可用/i)
      .first();
    const finalTokenText = await finalTokenBalanceElement.textContent();
    const finalTokenMatch = finalTokenText?.match(/(\d+)/);

    if (finalTokenMatch) {
      const finalTokenBalance = parseInt(finalTokenMatch[1]);
      expect(finalTokenBalance).toBeGreaterThan(initialTokenBalance);
    }

    // 9. 检查交易记录
    await page.getByText(/交易记录|兑换历史/i).click();
    await expect(page.getByText(exchangeAmount.toString())).toBeVisible();
  });

  // 兑换金额验证
  test('兑换金额必须符合限制', async ({ page }) => {
    // 登录并打开 FXC 管理页面
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(TEST_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(TEST_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    await page.waitForURL(/\/dashboard/);
    await page.getByText(/FXC|积分管理/i).click();
    await page.waitForURL(/\/fxc|\/wallet/i);

    // 1. 测试最小金额（<10 FXC 应报错）
    const minAmountInput = page.getByPlaceholder(/请输入兑换数量|兑换金额/i);
    await minAmountInput.fill('5');

    // 尝试点击兑换，应该显示错误
    await page.getByRole('button', { name: /兑换/i }).click();

    // 验证错误提示
    await expect(page.getByText(/最小金额|不能少于|至少兑换/i)).toBeVisible({
      timeout: 5000,
    });

    // 清除错误状态
    await minAmountInput.clear();

    // 2. 测试最大金额（>10000 FXC 应报错）
    await minAmountInput.fill('15000');
    await page.getByRole('button', { name: /兑换/i }).click();

    // 验证错误提示
    await expect(page.getByText(/最大金额|不能超过|单笔限额/i)).toBeVisible({
      timeout: 5000,
    });

    // 清除错误状态
    await minAmountInput.clear();

    // 3. 测试余额不足情况
    // 先获取当前 FXC 余额
    const fxcBalanceElement = page.getByText(/FXC 余额|FXC 可用/i).first();
    const balanceText = await fxcBalanceElement.textContent();
    const balanceMatch = balanceText?.match(/(\d+)/);

    if (balanceMatch) {
      const currentBalance = parseInt(balanceMatch[1]);
      // 尝试兑换超过余额的数量
      const overAmount = currentBalance + 100;
      await minAmountInput.fill(overAmount.toString());

      await page.getByRole('button', { name: /兑换/i }).click();

      // 验证余额不足提示
      await expect(
        page.getByText(/余额不足|FXC 不足|超过可用余额/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // 查看兑换历史记录
  test('用户可以查看兑换历史', async ({ page }) => {
    // 登录并导航到交易记录页面
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(TEST_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(TEST_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    await page.waitForURL(/\/dashboard/);

    // 1. 导航到交易记录页面
    await page.getByText(/交易记录|兑换历史/i).click();
    await page.waitForURL(/\/transactions|\/history/i);

    // 2. 筛选 FXC 兑换记录
    const filterButton = page.getByRole('button', { name: /筛选|过滤/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();

      // 选择 FXC 兑换类型
      const fxcOption = page.getByText(/FXC 兑换|积分兑换/i);
      if (await fxcOption.isVisible()) {
        await fxcOption.click();
      }

      // 应用筛选
      const applyButton = page.getByRole('button', { name: /应用|确定/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();
      }
    }

    // 3. 显示详细的兑换信息
    const transactionItems = page.locator(
      '[class*="transaction"], [class*="record"], tr'
    );
    const count = await transactionItems.count();
    expect(count).toBeGreaterThan(0);

    // 验证第一条记录包含必要信息
    const firstRecord = transactionItems.first();
    await expect(firstRecord.getByText(/FXC|兑换|Token/i)).toBeVisible();
    await expect(firstRecord.getByText(/\d{4}-\d{2}-\d{2}/)).toBeVisible(); // 日期
    await expect(firstRecord.getByText(/成功|已完成/i)).toBeVisible(); // 状态

    // 4. 支持导出功能
    const exportButton = page.getByRole('button', { name: /导出|下载/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 验证导出选项
      await expect(page.getByText(/CSV|Excel|PDF|JSON/i)).toBeVisible();

      // 取消导出（不真正下载）
      const cancelButton = page.getByRole('button', { name: /取消/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }
    }
  });
});
