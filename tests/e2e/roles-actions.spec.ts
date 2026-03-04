import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TestHelpers } from '../e2e-config';

test.describe('G2. 角色操作权限测试 (ROLES-ACTIONS)', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * G2-01: 管理员执行工作流回放操作
   * 验证: Admin 可以执行回放操作且有审计记录
   */
  test('G2-01: 管理员工作流回放操作', async () => {
    // 1. 管理员登录
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问工作流管理页面
    await page.goto(`${TEST_CONFIG.ADMIN_URL}/workflows`);
    await TestHelpers.waitForElement(page, '[data-testid="workflows-list"]');

    // 3. 选择一个工作流进行回放
    const workflowRow = await TestHelpers.waitForElement(
      page,
      '[data-testid="workflow-row"]:first-child'
    );
    await workflowRow.click('[data-testid="replay-button"]');

    // 4. 验证回放参数输入界面
    await TestHelpers.waitForElement(page, '[data-testid="replay-parameters"]');

    // 5. 输入回放参数
    await page.fill('[data-testid="input-parameter-1"]', 'test-value-1');
    await page.fill('[data-testid="input-parameter-2"]', 'test-value-2');

    // 6. 执行回放操作
    const startTime = Date.now();
    await page.click('[data-testid="execute-replay"]');

    // 7. 等待回放完成
    await TestHelpers.waitForElement(page, '[data-testid="replay-success"]');

    // 8. 验证成功提示
    const successMessage = await page.$('[data-testid="replay-success"]');
    expect(successMessage).toBeTruthy();

    // 9. 验证审计日志记录
    await page.goto(`${TEST_CONFIG.ADMIN_URL}/audit-logs`);
    await TestHelpers.waitForElement(page, '[data-testid="audit-log-entry"]');

    // 查找相关的审计记录
    const auditEntries = await page.$$('.audit-log-entry');
    let replayAuditFound = false;

    for (const entry of auditEntries) {
      const actionText = await entry.textContent();
      if (
        actionText?.includes('workflow_replay') &&
        actionText?.includes('admin')
      ) {
        replayAuditFound = true;
        break;
      }
    }

    expect(replayAuditFound).toBeTruthy();

    await page.screenshot({
      path: `test-results/g2-admin-replay-success-${Date.now()}.png`,
    });
  });

  /**
   * G2-02: 工程师执行工具操作权限
   * 验证: Engineer 可以执行工具但受限于权限范围
   */
  test('G2-02: 工程师工具执行权限', async () => {
    // 1. 工程师登录
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.engineer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.engineer.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问工具页面
    await page.goto(`${TEST_CONFIG.BASE_URL}/tools/diagnostic`);
    await TestHelpers.waitForElement(page, '[data-testid="diagnostic-tool"]');

    // 3. 执行诊断工具
    await page.fill('[data-testid="device-model-input"]', 'iPhone 12');
    await page.selectOption(
      '[data-testid="fault-type-select"]',
      'screen_broken'
    );
    await page.click('[data-testid="run-diagnostic"]');

    // 4. 验证工具执行成功
    await TestHelpers.waitForElement(
      page,
      '[data-testid="diagnostic-results"]'
    );
    const results = await page.$('[data-testid="diagnostic-results"]');
    expect(results).toBeTruthy();

    // 5. 尝试执行高级管理工具（应该失败）
    await page.goto(`${TEST_CONFIG.ADMIN_URL}/system/tools`);

    const response = await page.goto(`${TEST_CONFIG.ADMIN_URL}/system/tools`);
    if (response?.status() === 403) {
      expect(response.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const forbiddenMsg =
        (await page.$('text=权限不足')) ||
        (await page.$('text=需要管理员权限'));
      expect(forbiddenMsg).toBeTruthy();
    }

    await page.screenshot({
      path: `test-results/g2-engineer-tool-execution-${Date.now()}.png`,
    });
  });

  /**
   * G2-03: 消费者尝试执行受限操作
   * 验证: Consumer 无法执行专业操作，得到合理提示
   */
  test('G2-03: 消费者受限操作验证', async () => {
    // 1. 消费者登录
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.consumer.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.consumer.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 尝试访问工作流回放功能
    const replayResponse = await page.goto(
      `${TEST_CONFIG.ADMIN_URL}/workflows/replay`
    );

    // 3. 验证访问被拒绝且提示合理
    if (replayResponse?.status() === 403) {
      expect(replayResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const errorMsg =
        (await page.$('text=此功能仅限授权用户使用')) ||
        (await page.$('text=需要相应权限才能执行此操作')) ||
        (await page.$('text=权限不足'));
      expect(errorMsg).toBeTruthy();
    }

    // 4. 尝试执行工具操作
    await page.goto(`${TEST_CONFIG.BASE_URL}/tools/advanced`);

    const toolResponse = await page.goto(
      `${TEST_CONFIG.BASE_URL}/tools/advanced`
    );
    if (toolResponse?.status() === 403) {
      expect(toolResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const toolErrorMsg =
        (await page.$('text=该工具需要专业资格')) ||
        (await page.$('text=请联系专业技术人员'));
      expect(toolErrorMsg).toBeTruthy();
    }

    await page.screenshot({
      path: `test-results/g2-consumer-restricted-actions-${Date.now()}.png`,
    });
  });

  /**
   * G2-04: 店铺主设置修改权限
   * 验证: Shop Owner 可以修改店铺设置但不能修改系统设置
   */
  test('G2-04: 店铺主设置修改权限', async () => {
    // 1. 店铺主登录
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.shopOwner.email,
      '[data-testid="password-input"]':
        TEST_CONFIG.TEST_USERS.shopOwner.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 访问店铺设置页面
    await page.goto(`${TEST_CONFIG.BASE_URL}/shop/settings`);
    await TestHelpers.waitForElement(
      page,
      '[data-testid="shop-settings-form"]'
    );

    // 3. 修改店铺信息
    await page.fill('[data-testid="shop-name"]', '测试店铺-修改版');
    await page.fill('[data-testid="shop-description"]', '这是修改后的店铺描述');
    await page.click('[data-testid="save-shop-settings"]');

    // 4. 验证保存成功
    await TestHelpers.waitForElement(
      page,
      '[data-testid="settings-save-success"]'
    );
    const successMsg = await page.$('[data-testid="settings-save-success"]');
    expect(successMsg).toBeTruthy();

    // 5. 尝试访问系统设置（应该失败）
    const sysSettingsResponse = await page.goto(
      `${TEST_CONFIG.ADMIN_URL}/system/settings`
    );

    if (sysSettingsResponse?.status() === 403) {
      expect(sysSettingsResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const sysErrorMsg =
        (await page.$('text=系统设置仅限管理员访问')) ||
        (await page.$('text=需要超级管理员权限'));
      expect(sysErrorMsg).toBeTruthy();
    }

    await page.screenshot({
      path: `test-results/g2-shopowner-settings-modify-${Date.now()}.png`,
    });
  });

  /**
   * G2-05: 操作审计日志验证
   * 验证: 所有敏感操作都有审计记录
   */
  test('G2-05: 操作审计日志完整性', async () => {
    // 1. 管理员登录并执行多个操作
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': TEST_CONFIG.TEST_USERS.admin.email,
      '[data-testid="password-input"]': TEST_CONFIG.TEST_USERS.admin.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 执行一系列操作
    const operations = [
      { url: '/admin/users', action: 'view_users_list' },
      { url: '/admin/workflows', action: 'view_workflows' },
      { url: '/admin/settings', action: 'view_system_settings' },
    ];

    for (const op of operations) {
      await page.goto(TEST_CONFIG.BASE_URL + op.url);
      await page.waitForTimeout(1000); // 确保页面加载完成
    }

    // 3. 检查审计日志
    await page.goto(`${TEST_CONFIG.ADMIN_URL}/audit-logs`);
    await TestHelpers.waitForElement(page, '[data-testid="audit-logs-table"]');

    // 4. 验证审计记录完整性
    const auditRows = await page.$$('.audit-log-row');
    expect(auditRows.length).toBeGreaterThan(0);

    // 5. 验证关键信息记录
    const firstRow = auditRows[0];
    const actionCell = await firstRow.$('[data-testid="audit-action"]');
    const userCell = await firstRow.$('[data-testid="audit-user"]');
    const timestampCell = await firstRow.$('[data-testid="audit-timestamp"]');

    expect(actionCell).toBeTruthy();
    expect(userCell).toBeTruthy();
    expect(timestampCell).toBeTruthy();

    await page.screenshot({
      path: `test-results/g2-audit-log-integrity-${Date.now()}.png`,
    });
  });

  /**
   * G2-06: 权限继承与组合验证
   * 验证: 多角色用户的权限合并效果
   */
  test('G2-06: 多角色权限继承验证', async () => {
    // 假设存在一个多角色用户（同时具有工程师和店铺主权限）
    const multiRoleUser = {
      email: 'multirole@test.com',
      password: 'Multi123!@#',
      roles: ['engineer', 'shop_owner'],
    };

    // 1. 多角色用户登录
    await page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await TestHelpers.fillForm(page, {
      '[data-testid="email-input"]': multiRoleUser.email,
      '[data-testid="password-input"]': multiRoleUser.password,
    });
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${TEST_CONFIG.BASE_URL}/`);

    // 2. 验证可以看到工程师工具
    await page.goto(`${TEST_CONFIG.BASE_URL}/tools`);
    const engineerTools = await page.$(
      '[data-testid="engineer-tools-section"]'
    );
    expect(engineerTools).toBeTruthy();

    // 3. 验证可以看到店铺管理
    await page.goto(`${TEST_CONFIG.BASE_URL}/shop`);
    const shopManagement = await page.$(
      '[data-testid="shop-management-section"]'
    );
    expect(shopManagement).toBeTruthy();

    // 4. 验证无法访问系统管理
    const adminResponse = await page.goto(`${TEST_CONFIG.ADMIN_URL}/system`);
    if (adminResponse?.status() === 403) {
      expect(adminResponse.status()).toBe(403);
    } else {
      await page.waitForTimeout(2000);
      const forbiddenMsg = await page.$('text=需要管理员权限');
      expect(forbiddenMsg).toBeTruthy();
    }

    await page.screenshot({
      path: `test-results/g2-multirole-permissions-${Date.now()}.png`,
    });
  });
});
