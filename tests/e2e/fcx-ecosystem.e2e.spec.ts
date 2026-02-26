import { test, expect } from '@playwright/test';
import { TestHelpers } from '../test-helpers';
import { testDataManager } from '../test-data-manager';
import { withRetry, withTimeout, TestStepExecutor, DependencyChecker } from '../test-execution-utils';
import { TEST_ENV } from '../test-config';

// 模拟FCX通证相关的API和数据结构
interface FCXReward {
  amount: number;
  reason: string;
  timestamp: string;
  transactionId: string;
}

interface FCXBalance {
  total: number;
  available: number;
  locked: number;
  currency: string;
}

test.describe('E2E-FCX: FCX生态系统集成端到端测试', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  /**
   * E2E-FCX-01: Token经济激励机制
   * 优先级: P0
   * 测试FCX通证的奖励发放和消费场景
   */
  test('E2E-FCX-01: FCX通证奖励与消费流程', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');
    const engineerUser = testDataManager.getUserByRole('engineer');

    const executor = new TestStepExecutor();

    // 步骤1: 设备激活奖励
    executor.addStep('设备激活奖励', async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
      
      // 模拟设备激活
      await page.goto(`${TEST_ENV.getBaseUrl()}/scan/DEVICE_ACTIVATION_TEST`);
      
      // 验证激活奖励
      await helpers.waitForElement('[data-testid="activation-reward-modal"]');
      await helpers.verifyTextPresent(/设备激活奖励|恭喜获得/i);
      await helpers.verifyTextPresent(/100\s*FCX/);
      
      // 确认奖励领取
      await helpers.clickAndWait('[data-testid="claim-reward-button"]');
      await helpers.verifyTextPresent(/奖励已到账|余额更新/i);
    });

    // 步骤2: 维修质量奖励
    executor.addStep('维修质量奖励', async () => {
      // 切换到技师账号
      await helpers.login(engineerUser.email, engineerUser.password);
      await page.goto(`${TEST_ENV.getBaseUrl()}/repair-shop/dashboard`);
      
      // 模拟完成高质量维修
      await helpers.clickAndWait('[data-testid="complete-high-quality-repair"]');
      
      // 填写维修报告
      await page.selectOption('[data-testid="quality-score"]', '5');
      await page.fill('[data-testid="customer-feedback"]', '非常满意的服务体验');
      await page.fill('[data-testid="repair-cost"]', '430');
      
      await helpers.clickAndWait('[data-testid="submit-quality-report"]');
      
      // 验证质量奖励
      await helpers.waitForElement('[data-testid="quality-reward-notification"]');
      await helpers.verifyTextPresent(/质量奖励|优秀评价奖励/i);
      await helpers.verifyTextPresent(/50\s*FCX/);
    });

    // 步骤3: Token消费场景 - 配件购买
    executor.addStep('Token配件购买', async () => {
      // 切换回消费者账号
      await helpers.login(consumerUser.email, consumerUser.password);
      
      // 进入配件商城
      await page.goto(`${TEST_ENV.getBaseUrl()}/parts/store`);
      
      // 选择配件加入购物车
      const partItem = page.locator('[data-testid="part-item"]').first();
      await partItem.click();
      await helpers.clickAndWait('[data-testid="add-to-cart-button"]');
      
      // 进入结算页面
      await helpers.clickAndWait('[data-testid="checkout-button"]');
      
      // 选择FCX支付
      await helpers.clickAndWait('[data-testid="fcx-payment-option"]');
      
      // 确认支付金额
      await helpers.verifyTextPresent(/应付金额|总计/i);
      await helpers.verifyTextPresent(/[1-5][0-9][0-9]\s*FCX/);
      
      // 完成支付
      await helpers.clickAndWait('[data-testid="confirm-payment-button"]');
      await helpers.verifyTextPresent(/支付成功|交易完成/i);
      
      // 验证余额扣减
      await helpers.verifyTextPresent(/余额|剩余/i);
    });

    // 步骤4: FCX钱包管理
    executor.addStep('FCX钱包管理', async () => {
      await page.goto(`${TEST_ENV.getBaseUrl()}/user/wallet`);
      
      // 验证钱包余额显示
      await helpers.waitForElement('[data-testid="fcx-balance"]');
      await helpers.verifyTextPresent(/FCX余额|我的资产/i);
      
      // 查看交易记录
      await helpers.clickAndWait('[data-testid="transaction-history-tab"]');
      const transactions = page.locator('[data-testid="transaction-item"]');
      const transactionCount = await transactions.count();
      expect(transactionCount).toBeGreaterThan(0);
      
      // 验证奖励和消费记录
      await helpers.verifyTextPresent(/奖励发放|消费支出|充值/i);
    });

    // 执行所有步骤
    const result = await executor.execute();
    
    if (result.success) {
      DependencyChecker.markDependencyCompleted('E2E-FCX-01');
      await helpers.takeScreenshot('fcx-token-economy-success');
    } else {
      DependencyChecker.markDependencyFailed('E2E-FCX-01', result.failedSteps.join(', '));
      await helpers.takeScreenshot('fcx-token-economy-failed');
    }

    expect(result.success).toBeTruthy();
  });

  /**
   * E2E-FCX-02: FCX质押与收益机制
   * 优先级: P1
   * 测试FCX通证的质押和收益生成功能
   */
  test('E2E-FCX-02: FCX质押与收益机制', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');

    // 步骤1: 用户登录并进入质押页面
    await withRetry(async () => {
      await helpers.login(consumerUser.email, consumerUser.password);
    });

    await page.goto(`${TEST_ENV.getBaseUrl()}/user/staking`);
    await helpers.waitForElement('[data-testid="staking-dashboard"]');

    // 步骤2: 查看质押产品
    const stakingProducts = page.locator('[data-testid="staking-product"]');
    const productCount = await stakingProducts.count();
    expect(productCount).toBeGreaterThan(0);

    // 选择一个质押产品
    const firstProduct = stakingProducts.first();
    await firstProduct.click();

    // 步骤3: 执行质押操作
    await helpers.fillForm({
      '[data-testid="staking-amount"]': '1000',
      '[data-testid="staking-period"]': '30'
    });

    // 确认质押
    await helpers.clickAndWait('[data-testid="confirm-staking-button"]');
    await helpers.verifyTextPresent(/质押成功|锁仓确认/i);

    // 验证质押记录
    await helpers.clickAndWait('[data-testid="my-stakes-tab"]');
    const stakeRecords = page.locator('[data-testid="stake-record"]');
    await expect(stakeRecords.first()).toBeVisible();

    // 步骤4: 收益查询
    await helpers.clickAndWait('[data-testid="earnings-tab"]');
    await helpers.verifyTextPresent(/累计收益|预期收益|APY/i);
    
    await helpers.takeScreenshot('staking-operation-verified');
  });

  /**
   * E2E-FCX-03: FCX治理投票机制
   * 优先级: P2
   * 测试FCX通证参与平台治理的功能
   */
  test('E2E-FCX-03: FCX治理投票机制', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');

    // 步骤1: 用户登录并进入治理页面
    await helpers.login(consumerUser.email, consumerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/governance`);
    await helpers.waitForElement('[data-testid="governance-dashboard"]');

    // 步骤2: 查看提案列表
    const proposals = page.locator('[data-testid="proposal-item"]');
    const proposalCount = await proposals.count();
    expect(proposalCount).toBeGreaterThan(0);

    // 查看第一个提案详情
    const firstProposal = proposals.first();
    await firstProposal.click();
    await helpers.waitForElement('[data-testid="proposal-details"]');

    // 步骤3: 参与投票
    await helpers.clickAndWait('[data-testid="vote-yes-button"]');
    
    // 确认投票权重
    await helpers.verifyTextPresent(/投票权重|持币数量/i);
    await helpers.verifyTextPresent(/[0-9,]+\.?[0-9]*\s*FCX/);

    // 提交投票
    await helpers.clickAndWait('[data-testid="submit-vote-button"]');
    await helpers.verifyTextPresent(/投票成功|已投票/i);

    // 步骤4: 查看投票结果
    await helpers.clickAndWait('[data-testid="results-tab"]');
    await helpers.verifyTextPresent(/赞成票|反对票|弃权票/i);
    await helpers.verifyTextPresent(/投票率|参与度/i);

    await helpers.takeScreenshot('governance-voting-verified');
  });

  /**
   * E2E-FCX-04: FCX跨链转账功能
   * 优先级: P2
   * 测试FCX通证的跨链转移能力
   */
  test('E2E-FCX-04: FCX跨链转账功能', async ({ page }) => {
    const user1 = testDataManager.getUserByRole('consumer');
    const user2 = testDataManager.getUserByRole('engineer');

    // 步骤1: 第一个用户登录并发起转账
    await helpers.login(user1.email, user1.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/wallet`);
    
    await helpers.clickAndWait('[data-testid="transfer-button"]');
    
    // 填写转账信息
    await helpers.fillForm({
      '[data-testid="recipient-address"]': user2.email,
      '[data-testid="transfer-amount"]': '50',
      '[data-testid="transfer-memo"]': '测试转账'
    });

    // 确认转账
    await helpers.clickAndWait('[data-testid="confirm-transfer-button"]');
    await helpers.verifyTextPresent(/转账已发起|交易提交成功/i);

    // 验证交易记录
    await helpers.clickAndWait('[data-testid="transaction-history-tab"]');
    const transferRecord = page.locator('[data-testid="transaction-item"]').filter({ hasText: '转账' }).first();
    await expect(transferRecord).toBeVisible();

    // 步骤2: 第二个用户接收转账并验证
    await helpers.login(user2.email, user2.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/user/wallet`);
    
    // 验证余额增加
    const balanceElement = page.locator('[data-testid="fcx-balance"]');
    await expect(balanceElement).toContainText(/[5-9][0-9]/); // 应该显示50左右的余额
    
    // 验证收款记录
    await helpers.clickAndWait('[data-testid="transaction-history-tab"]');
    const receiveRecord = page.locator('[data-testid="transaction-item"]').filter({ hasText: '收款' }).first();
    await expect(receiveRecord).toBeVisible();
    await helpers.verifyTextPresent(user1.email.split('@')[0]); // 显示发送方信息

    await helpers.takeScreenshot('cross-chain-transfer-verified');
  });

  /**
   * E2E-FCX-05: FCX生态应用集成
   * 优先级: P1
   * 测试FCX通证在不同应用场景中的集成
   */
  test('E2E-FCX-05: FCX生态应用集成', async ({ page }) => {
    const consumerUser = testDataManager.getUserByRole('consumer');

    // 步骤1: 用户登录并访问生态应用市场
    await helpers.login(consumerUser.email, consumerUser.password);
    await page.goto(`${TEST_ENV.getBaseUrl()}/ecosystem/apps`);
    await helpers.waitForElement('[data-testid="apps-marketplace"]');

    // 步骤2: 浏览和筛选应用
    // 按类别筛选
    await page.selectOption('[data-testid="category-filter"]', '维修工具');
    const filteredApps = page.locator('[data-testid="app-card"]');
    const filteredCount = await filteredApps.count();
    expect(filteredCount).toBeGreaterThan(0);

    // 步骤3: 使用FCX兑换应用服务
    const premiumApp = page.locator('[data-testid="app-card"]').filter({ hasText: '高级维修诊断' }).first();
    await premiumApp.click();
    
    await helpers.clickAndWait('[data-testid="subscribe-with-fcx-button"]');
    
    // 确认订阅费用
    await helpers.verifyTextPresent(/订阅费用|月费/i);
    await helpers.verifyTextPresent(/[1-9][0-9]\s*FCX/);
    
    await helpers.clickAndWait('[data-testid="confirm-subscription-button"]');
    await helpers.verifyTextPresent(/订阅成功|服务已开通/i);

    // 步骤4: 验证应用内FCX消费
    await helpers.clickAndWait('[data-testid="launch-app-button"]');
    
    // 在应用内进行付费操作
    await helpers.clickAndWait('[data-testid="premium-feature-button"]');
    await helpers.verifyTextPresent(/消耗|使用/i);
    await helpers.verifyTextPresent(/[5-9]\s*FCX/);
    
    await helpers.clickAndWait('[data-testid="confirm-consumption-button"]');
    await helpers.verifyTextPresent(/操作成功|已解锁/i);

    await helpers.takeScreenshot('ecosystem-integration-verified');
  });
});