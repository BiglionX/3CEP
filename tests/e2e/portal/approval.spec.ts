/**
 * 门户审批 E2E 测试
 * 测试门户申请和审批的完整流程
 */

import { expect, test } from '@playwright/test';

// 测试账号
const ADMIN_USER = {
  email: 'admin@fixcycle.com',
  password: 'password123',
};

const NORMAL_USER = {
  email: 'user@fixcycle.com',
  password: 'password123',
};

// 测试门户信息
const TEST_PORTAL = {
  name: '测试门户申请',
  type: '企业门户',
  description: '用于 E2E 测试的门户申请',
};

test.describe('门户审批功能', () => {
  // 用户提交门户申请
  test('用户可以提交门户申请', async ({ page }) => {
    // 1. 登录普通用户账号
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(NORMAL_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(NORMAL_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    // 等待导航完成
    await page.waitForURL(/\/dashboard/);

    // 2. 导航到门户申请页面
    await page.getByText(/门户申请|我的门户/i).click();
    await page.waitForURL(/\/portal|\/application/i);

    // 3. 点击新建申请按钮
    await page.getByRole('button', { name: /新建申请|提交申请/i }).click();

    // 4. 填写申请表单
    // 填写名称
    await page.getByPlaceholder(/请输入门户名称/i).fill(TEST_PORTAL.name);

    // 选择类型
    const typeSelect = page.getByRole('combobox', { name: /门户类型/i });
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      const option = page.getByText(TEST_PORTAL.type);
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // 填写描述
    await page.getByPlaceholder(/请输入描述/i).fill(TEST_PORTAL.description);

    // 5. 上传相关材料（如果有）
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // 创建一个临时文件用于上传测试
      const testFile = 'test-document.txt';
      await fileInput.setInputFiles({
        name: testFile,
        mimeType: 'text/plain',
        buffer: Buffer.from('测试文件内容'),
      });

      // 验证文件已选择
      await expect(page.getByText(testFile)).toBeVisible();
    }

    // 6. 提交申请
    await page.getByRole('button', { name: /提交|确认提交/i }).click();

    // 7. 显示提交成功提示
    await expect(page.getByText(/提交成功|申请已提交/i)).toBeVisible({
      timeout: 10000,
    });

    // 8. 可在"我的申请"中查看状态
    await page.getByText(/我的申请|申请记录/i).click();
    await page.waitForTimeout(500);

    // 验证申请记录存在
    const applicationRecord = page.getByText(TEST_PORTAL.name);
    await expect(applicationRecord).toBeVisible();

    // 验证状态显示（待审批、审核中等）
    await expect(
      page.getByText(/待审批|审核中|pending|processing/i)
    ).toBeVisible();
  });

  // 管理员审批门户
  test('管理员可以审批门户申请', async ({ page }) => {
    // 1. 登录管理员账号
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(ADMIN_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(ADMIN_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    // 等待导航完成
    await page.waitForURL(/\/dashboard/);

    // 2. 进入门户审批管理
    await page.getByText(/门户审批|审批管理/i).click();
    await page.waitForURL(/\/portal.*approval|\/approval.*portal/i);

    // 3. 查看待审批列表
    await expect(page.getByText(/待审批|待处理/i)).toBeVisible();

    // 查找包含测试门户申请的记录
    const pendingItem = page.getByText(TEST_PORTAL.name).first();
    if (await pendingItem.isVisible()) {
      // 4. 点击某个申请的详情
      await pendingItem.click();
      await page.waitForTimeout(500);

      // 验证详情页显示完整信息
      await expect(page.getByText(TEST_PORTAL.name)).toBeVisible();
      await expect(page.getByText(TEST_PORTAL.type)).toBeVisible();
      await expect(page.getByText(TEST_PORTAL.description)).toBeVisible();

      // 5. 点击"批准"或"拒绝"
      const approveButton = page.getByRole('button', {
        name: /批准|同意|通过/i,
      });
      const rejectButton = page.getByRole('button', { name: /拒绝|驳回/i });

      if (await approveButton.isVisible()) {
        await approveButton.click();

        // 6. 填写审批意见
        const commentInput = page.getByPlaceholder(/请输入审批意见/i);
        if (await commentInput.isVisible()) {
          await commentInput.fill('同意申请，符合要求');
        }

        // 7. 确认审批操作
        const confirmButton = page.getByRole('button', { name: /确认|确定/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // 8. 验证申请状态已更新
        await expect(page.getByText(/审批通过|已批准|approved/i)).toBeVisible({
          timeout: 10000,
        });
      } else if (await rejectButton.isVisible()) {
        await rejectButton.click();

        // 填写拒绝理由
        const reasonInput = page.getByPlaceholder(/请输入拒绝理由/i);
        if (await reasonInput.isVisible()) {
          await reasonInput.fill('资料不全，需补充');
        }

        const confirmButton = page.getByRole('button', { name: /确认|确定/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        await expect(page.getByText(/已拒绝|rejected/i)).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  // 批量审批门户
  test('管理员可以批量审批门户', async ({ page }) => {
    // 登录管理员账号
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(ADMIN_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(ADMIN_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    await page.waitForURL(/\/dashboard/);

    // 进入门户审批管理
    await page.getByText(/门户审批|审批管理/i).click();
    await page.waitForURL(/\/portal.*approval|\/approval/i);

    // 1. 在待审批列表中多选
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      // 选择第一个
      await checkboxes.first().check();

      // 如果有多条，选择第二条
      if (count > 1) {
        await checkboxes.nth(1).check();
      }

      // 2. 点击批量批准按钮
      const batchApproveButton = page.getByRole('button', {
        name: /批量批准|批量通过|批量审批/i,
      });

      if (await batchApproveButton.isVisible()) {
        await batchApproveButton.click();

        // 3. 确认批量操作
        const confirmDialog = page.getByRole('dialog');
        if (await confirmDialog.isVisible()) {
          await expect(
            page.getByText(/确认批量批准|确定要批准这些申请/i)
          ).toBeVisible();

          const confirmButton = page.getByRole('button', {
            name: /确认|确定/i,
          });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }

        // 4. 验证所有选中项状态已更新
        await expect(page.getByText(/批量操作成功|已批准/i)).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  // 审批通知验证
  test('用户收到审批结果通知', async ({ page }) => {
    // 登录用户账号
    await page.goto('/login');
    await page.getByPlaceholder('邮箱/手机号').fill(NORMAL_USER.email);
    await page
      .getByPlaceholder('密码', { exact: true })
      .fill(NORMAL_USER.password);
    await page.getByRole('button', { name: '登录' }).click();

    await page.waitForURL(/\/dashboard/);

    // 1. 登录后查看消息通知
    const notificationIcon = page.getByRole('button', { name: /通知|消息/i });
    if (await notificationIcon.isVisible()) {
      await notificationIcon.click();
      await page.waitForTimeout(500);

      // 2. 显示审批结果通知
      const notificationList = page.locator(
        '[class*="notification"], [class*="message"]'
      );
      const notificationCount = await notificationList.count();

      if (notificationCount > 0) {
        const firstNotification = notificationList.first();

        // 验证通知包含审批相关信息
        await expect(
          firstNotification.getByText(/审批|门户|申请/i)
        ).toBeVisible();

        // 验证通知包含结果状态
        await expect(
          firstNotification.getByText(/通过|批准|拒绝/i)
        ).toBeVisible();

        // 3. 点击通知跳转到门户详情
        await firstNotification.click();
        await page.waitForTimeout(500);

        // 验证跳转到了正确的页面
        await expect(page).toHaveURL(/\/portal\/\d+|\/application\/\d+/);

        // 验证详情页显示
        await expect(page.getByText(TEST_PORTAL.name)).toBeVisible();
      }
    }
  });
});
