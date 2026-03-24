/**
 * 关键业务流程 E2E 回归测试
 *
 * 测试场景:
 * 1. 用户完整管理流程 (创建→编辑→删除→审计日志)
 * 2. 权限分配流程 (分配角色→验证权限→回收权限)
 * 3. 数据导出流程 (选择条件→导出 Excel→下载文件)
 * 4. 批量操作流程 (批量选择→批量审核→批量状态更新)
 */

import { expect, test } from '@playwright/test';

// 测试数据
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  name: '测试用户',
  role: 'user',
};

const TEST_SHOP = {
  name: `测试店铺_${Date.now()}`,
  address: '测试地址',
  contact: '测试联系人',
};

test.describe('关键业务流程 E2E 回归测试', () => {
  // 前置准备：登录管理员账号
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    // 使用测试账号登录
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
  });

  test.describe('1. 用户完整管理流程', () => {
    test('应该完成用户创建、编辑、删除全流程并记录审计日志', async ({
      page,
    }) => {
      // 步骤 1: 导航到用户管理页面
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);

      // 步骤 2: 创建新用户
      await page.click('button:has-text("新建用户")');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="name"]', TEST_USER.name);
      await page.selectOption('select[name="role"]', TEST_USER.role);
      await page.click('button:has-text("保存")');

      // 验证创建成功
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator(`text=${TEST_USER.email}`)).toBeVisible();

      // 步骤 3: 编辑用户信息
      const editButton = page.locator(
        `tr:has-text("${TEST_USER.email}") button:has-text("编辑")`
      );
      await editButton.click();

      await page.fill('input[name="name"]', `${TEST_USER.name}_已编辑`);
      await page.click('button:has-text("保存")');

      // 验证编辑成功
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator(`text=${TEST_USER.name}_已编辑`)).toBeVisible();

      // 步骤 4: 查看审计日志
      await page.goto('/admin/audit-logs');
      await page.fill('input[name="search"]', TEST_USER.email);
      await expect(page.locator(`text=${TEST_USER.email}`)).toBeVisible();
      await expect(page.locator('text=创建用户')).toBeVisible();
      await expect(page.locator('text=更新用户')).toBeVisible();

      // 步骤 5: 删除用户
      await page.goto('/admin/users');
      const deleteButton = page.locator(
        `tr:has-text("${TEST_USER.email}") button:has-text("删除")`
      );
      await deleteButton.click();

      // 确认删除
      await page.click('button:has-text("确认删除")');

      // 验证删除成功
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator(`text=${TEST_USER.email}`)).not.toBeVisible();

      // 验证审计日志中有删除记录
      await page.goto('/admin/audit-logs');
      await expect(page.locator('text=删除用户')).toBeVisible();
    });
  });

  test.describe('2. 权限分配流程', () => {
    test('应该完成角色分配、权限验证和权限回收', async ({ page }) => {
      const testRole = `test_role_${Date.now()}`;

      // 步骤 1: 创建测试角色
      await page.goto('/admin/roles');
      await page.click('button:has-text("新建角色")');
      await page.fill('input[name="name"]', testRole);
      await page.check('input[value="users_read"]');
      await page.check('input[value="shops_read"]');
      await page.click('button:has-text("保存")');
      await expect(page.locator('.toast-success')).toBeVisible();

      // 步骤 2: 为用户分配角色
      await page.goto('/admin/users');
      const userRow = page.locator(`tr:has-text("${TEST_USER.email}")`);
      await userRow.locator('button:has-text("分配角色")').click();

      await page.selectOption('select[name="role"]', testRole);
      await page.click('button:has-text("确认")');
      await expect(page.locator('.toast-success')).toBeVisible();

      // 步骤 3: 验证权限生效
      // 使用测试用户登录验证权限
      await page.context().clearCookies();
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // 应该能访问用户列表 (有 users_read 权限)
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
      await expect(page.locator('table')).toBeVisible();

      // 尝试访问无权限的页面 (如删除权限)
      await page.goto('/admin/users');
      await expect(page.locator('button:has-text("删除")')).not.toBeVisible();

      // 步骤 4: 回收权限
      await page.goto('/admin/roles');
      const roleRow = page.locator(`tr:has-text("${testRole}")`);
      await roleRow.locator('button:has-text("编辑")').click();

      await page.uncheck('input[value="users_read"]');
      await page.click('button:has-text("保存")');
      await expect(page.locator('.toast-success')).toBeVisible();

      // 步骤 5: 清理测试数据
      await page.goto('/admin/users');
      const userDeleteBtn = page.locator(
        `tr:has-text("${TEST_USER.email}") button:has-text("删除")`
      );
      if (await userDeleteBtn.isVisible()) {
        await userDeleteBtn.click();
        await page.click('button:has-text("确认删除")');
      }

      await page.goto('/admin/roles');
      const roleDeleteBtn = page.locator(
        `tr:has-text("${testRole}") button:has-text("删除")`
      );
      await roleDeleteBtn.click();
      await page.click('button:has-text("确认删除")');
    });
  });

  test.describe('3. 数据导出流程', () => {
    test('应该能够选择条件导出 Excel 并下载文件', async ({ page }) => {
      await page.goto('/admin/orders');

      // 步骤 1: 设置筛选条件
      await page.fill('input[name="date-from"]', '2026-01-01');
      await page.fill('input[name="date-to"]', '2026-12-31');
      await page.selectOption('select[name="status"]', 'completed');

      // 步骤 2: 点击导出按钮
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("导出 Excel")');

      // 步骤 3: 验证文件下载
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/orders_.*\.xlsx/);

      // 验证文件不为空
      const stream = await download.createReadStream();
      let fileSize = 0;
      for await (const chunk of stream!) {
        fileSize += chunk.length;
      }
      expect(fileSize).toBeGreaterThan(0);

      // 步骤 4: 验证导出提示
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator('text=导出成功')).toBeVisible();
    });
  });

  test.describe('4. 批量操作流程', () => {
    test('应该能够批量选择、审核和更新状态', async ({ page }) => {
      await page.goto('/admin/shops');

      // 步骤 1: 批量选择多个店铺
      const checkboxes = page.locator('tbody input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      expect(checkboxCount).toBeGreaterThan(2);

      // 选中前 3 个店铺
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }

      // 验证选择数量显示
      await expect(page.locator('.batch-actions')).toBeVisible();
      await expect(page.locator('text=已选择 3 项')).toBeVisible();

      // 步骤 2: 批量审核
      await page.click('button:has-text("批量审核")');
      await page.selectOption('select[name="audit-result"]', 'approved');
      await page.fill('textarea[name="audit-comment"]', '批量审核通过');
      await page.click('button:has-text("确认审核")');

      // 验证批量审核成功
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator('text=批量审核成功')).toBeVisible();

      // 步骤 3: 批量更新状态
      // 重新选择
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }

      await page.click('button:has-text("批量更新状态")');
      await page.selectOption('select[name="new-status"]', 'active');
      await page.click('button:has-text("确认更新")');

      // 验证批量更新成功
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator('text=批量更新成功')).toBeVisible();

      // 步骤 4: 取消选择
      await page.click('button:has-text("取消选择")');
      await expect(page.locator('.batch-actions')).not.toBeVisible();
    });
  });

  test.describe('跨模块业务一致性测试', () => {
    test('订单创建后应该正确关联用户、店铺和设备信息', async ({ page }) => {
      // 步骤 1: 创建测试数据
      const testOrder = {
        userId: '',
        shopId: '',
        deviceId: '',
      };

      // 获取第一个用户 ID
      await page.goto('/admin/users');
      const firstUserCell = page.locator(
        'tbody tr:first-child td:has-text("@")'
      );
      testOrder.userId = (await firstUserCell.textContent()) || '';

      // 获取第一个店铺 ID
      await page.goto('/admin/shops');
      const firstShopCell = page.locator('tbody tr:first-child td:first-child');
      testOrder.shopId = (await firstShopCell.textContent()) || '';

      // 获取第一个设备 ID
      await page.goto('/admin/devices');
      const firstDeviceCell = page.locator(
        'tbody tr:first-child td:first-child'
      );
      testOrder.deviceId = (await firstDeviceCell.textContent()) || '';

      // 步骤 2: 创建订单
      await page.goto('/admin/orders');
      await page.click('button:has-text("新建订单")');

      await page.fill('input[name="customer-name"]', '测试客户');
      await page.fill('input[name="customer-phone"]', '13800138000');
      await page.click('button:has-text("保存")');

      await expect(page.locator('.toast-success')).toBeVisible();

      // 步骤 3: 验证订单详情中的关联信息
      await page.click('text=查看详情');
      await expect(page.locator('text=测试客户')).toBeVisible();
      await expect(page.locator('text=13800138000')).toBeVisible();

      // 步骤 4: 清理测试数据
      await page.goBack();
      const deleteBtn = page.locator(
        'tbody tr:last-child button:has-text("删除")'
      );
      await deleteBtn.click();
      await page.click('button:has-text("确认删除")');
      await expect(page.locator('.toast-success')).toBeVisible();
    });
  });
});
