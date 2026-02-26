/**
 * 企业用户认证流程测试
 * 测试企业用户注册、登录和会话管理功能
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import { createTestDataManager } from '../data/test-data-manager';
import { ENTERPRISE_ROUTES, TEST_ENTERPRISE_USERS } from '../enterprise.config';

test.describe('企业用户认证流程测试', () => {
  test('企业用户注册流程测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    const testDataManager = createTestDataManager(request);
    
    // 导航到注册页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.register);
    
    // 验证注册页面元素
    await expect(page.getByRole('heading', { name: /注册|Register/ })).toBeVisible();
    await expect(page.getByPlaceholder(/公司名称|企业名称/)).toBeVisible();
    await expect(page.getByPlaceholder(/营业执照/)).toBeVisible();
    await expect(page.getByPlaceholder(/联系人/)).toBeVisible();
    await expect(page.getByPlaceholder(/手机号/)).toBeVisible();
    await expect(page.getByPlaceholder(/邮箱/)).toBeVisible();
    await expect(page.getByPlaceholder(/密码/)).toBeVisible();
    
    // 生成测试数据
    const testData = enterpriseUtils.generateRandomTestData();
    
    // 填写注册表单
    await page.getByPlaceholder(/公司名称|企业名称/).fill(testData.companyName);
    await page.getByPlaceholder(/营业执照/).fill(testData.businessLicense);
    await page.getByPlaceholder(/联系人/).fill(testData.contactPerson);
    await page.getByPlaceholder(/手机号/).fill(testData.phone);
    await page.getByPlaceholder(/邮箱/).fill(testData.email);
    await page.getByPlaceholder(/密码/).fill('Test123456');
    await page.getByPlaceholder(/确认密码/).fill('Test123456');
    
    // 提交注册
    await page.getByRole('button', { name: /注册|Sign Up/ }).click();
    
    // 等待注册完成
    await page.waitForURL(`http://localhost:3003${ENTERPRISE_ROUTES.dashboard}`);
    
    // 验证注册成功
    await expect(page.getByText(/欢迎|Welcome/)).toBeVisible();
    await expect(page.getByText(testData.companyName)).toBeVisible();
    
    // 截图保存
    await enterpriseUtils.takeScreenshot('registration-success');
  });

  test('企业用户登录流程测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 导航到登录页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.login);
    
    // 验证登录页面元素
    await expect(page.getByRole('heading', { name: /登录|Login/ })).toBeVisible();
    await expect(page.getByPlaceholder(/邮箱|Email/)).toBeVisible();
    await expect(page.getByPlaceholder(/密码|Password/)).toBeVisible();
    
    // 使用测试账户登录
    const testUser = TEST_ENTERPRISE_USERS.regularUser;
    await page.getByPlaceholder(/邮箱|Email/).fill(testUser.email);
    await page.getByPlaceholder(/密码|Password/).fill(testUser.password);
    
    // 提交登录
    await page.getByRole('button', { name: /登录|Sign In/ }).click();
    
    // 等待登录完成
    await page.waitForURL(`http://localhost:3003${ENTERPRISE_ROUTES.dashboard}`);
    
    // 验证登录成功
    await expect(page.getByText(testUser.companyName)).toBeVisible();
    await expect(page.getByRole('button', { name: /退出|Logout/ })).toBeVisible();
  });

  test('企业用户登出功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 先登录
    await enterpriseUtils.loginAs('regularUser');
    
    // 验证已登录状态
    await expect(page.getByText(TEST_ENTERPRISE_USERS.regularUser.companyName)).toBeVisible();
    
    // 执行登出
    await enterpriseUtils.logout();
    
    // 验证已登出
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /登录|Login/ })).toBeVisible();
  });

  test('忘记密码功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 导航到登录页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.login);
    
    // 点击忘记密码链接
    await page.getByRole('link', { name: /忘记密码|Forgot Password/ }).click();
    
    // 验证忘记密码页面
    await expect(page.getByRole('heading', { name: /重置密码|Reset Password/ })).toBeVisible();
    await expect(page.getByPlaceholder(/邮箱|Email/)).toBeVisible();
    
    // 填写邮箱
    await page.getByPlaceholder(/邮箱|Email/).fill(TEST_ENTERPRISE_USERS.regularUser.email);
    
    // 提交重置请求
    await page.getByRole('button', { name: /发送|Send/ }).click();
    
    // 验证提示信息
    await expect(page.getByText(/邮件已发送|sent/i)).toBeVisible();
  });

  test('登录表单验证测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 导航到登录页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.login);
    
    // 测试空表单提交
    await page.getByRole('button', { name: /登录|Sign In/ }).click();
    
    // 验证错误提示
    await expect(page.getByText(/请输入邮箱|email required/i)).toBeVisible();
    await expect(page.getByText(/请输入密码|password required/i)).toBeVisible();
    
    // 测试无效邮箱格式
    await page.getByPlaceholder(/邮箱|Email/).fill('invalid-email');
    await page.getByPlaceholder(/密码|Password/).fill('123');
    await page.getByRole('button', { name: /登录|Sign In/ }).click();
    
    // 验证格式错误提示
    await expect(page.getByText(/邮箱格式不正确|invalid email/i)).toBeVisible();
  });

  test('注册表单验证测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    const testDataManager = createTestDataManager(request);
    
    // 导航到注册页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.register);
    
    // 测试必填字段验证
    await page.getByRole('button', { name: /注册|Sign Up/ }).click();
    
    // 验证必填字段错误提示
    await expect(page.getByText(/公司名称必填|required/i)).toBeVisible();
    await expect(page.getByText(/邮箱必填|required/i)).toBeVisible();
    await expect(page.getByText(/密码必填|required/i)).toBeVisible();
    
    // 测试密码强度验证
    const testData = enterpriseUtils.generateRandomTestData();
    await page.getByPlaceholder(/公司名称|企业名称/).fill(testData.companyName);
    await page.getByPlaceholder(/邮箱/).fill(testData.email);
    await page.getByPlaceholder(/密码/).fill('123'); // 弱密码
    
    await page.getByRole('button', { name: /注册|Sign Up/ }).click();
    
    // 验证密码强度提示
    await expect(page.getByText(/密码长度至少8位|at least 8 characters/i)).toBeVisible();
  });

  test('会话管理测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录获取会话
    await enterpriseUtils.loginAs('regularUser');
    
    // 验证会话cookie存在
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'));
    expect(sessionCookie).toBeDefined();
    
    // 刷新页面验证会话保持
    await page.reload();
    await expect(page.getByText(TEST_ENTERPRISE_USERS.regularUser.companyName)).toBeVisible();
    
    // 清除cookies测试会话失效
    await page.context().clearCookies();
    await page.reload();
    
    // 应该跳转到登录页面
    await expect(page).toHaveURL(/.*login/);
  });

  test('多设备登录测试', async ({ browser, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(await browser.newPage(), request);
    
    // 在第一个设备登录
    await enterpriseUtils.loginAs('regularUser');
    
    // 在第二个设备登录同一账户
    const secondPage = await browser.newPage();
    const secondUtils = createEnterpriseTestUtils(secondPage, request);
    await secondUtils.loginAs('regularUser');
    
    // 验证两个会话都可以正常使用
    await expect(secondPage.getByText(TEST_ENTERPRISE_USERS.regularUser.companyName)).toBeVisible();
    
    // 清理
    await secondPage.close();
  });
});

// 权限相关测试
test.describe('认证权限边界测试', () => {
  test('未认证用户访问受保护页面', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 直接访问受保护页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    
    // 应该重定向到登录页面
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /登录|Login/ })).toBeVisible();
  });

  test('登录后访问权限页面', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录
    await enterpriseUtils.loginAs('regularUser');
    
    // 访问受保护页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    
    // 应该可以正常访问
    await expect(page.getByText(TEST_ENTERPRISE_USERS.regularUser.companyName)).toBeVisible();
  });
});