/**
 * 企业管理后台功能测试
 * 测试企业仪表板和用户管理功能
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import { ENTERPRISE_ROUTES, TEST_ENTERPRISE_USERS } from '../enterprise.config';

test.describe('企业管理后台功能测试', () => {
  test('企业仪表板访问和数据显示', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以管理员身份登录
    await enterpriseUtils.loginAs('admin');
    
    // 验证仪表板页面加载
    await expect(page.getByRole('heading', { name: /仪表板|Dashboard/ })).toBeVisible();
    
    // 验证关键指标卡片存在
    const metricCards = page.locator('[data-testid="metric-card"]');
    const cardCount = await metricCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4); // 至少4个指标卡片
    
    // 验证图表容器存在
    await expect(page.getByTestId('dashboard-chart')).toBeVisible();
    
    // 验证最近活动列表
    await expect(page.getByTestId('recent-activities')).toBeVisible();
    
    // 截图保存仪表板视图
    await enterpriseUtils.takeScreenshot('admin-dashboard');
  });

  test('用户管理功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到用户管理
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    // 验证用户管理页面
    await expect(page.getByRole('heading', { name: /用户管理|User Management/ })).toBeVisible();
    
    // 验证用户列表显示
    const userTable = page.getByTestId('users-table');
    await expect(userTable).toBeVisible();
    
    // 验证搜索功能
    const searchInput = page.getByPlaceholder(/搜索用户|Search users/);
    await expect(searchInput).toBeVisible();
    
    // 测试搜索功能
    await searchInput.fill('测试');
    // 这里可以添加具体的搜索结果验证
    
    // 验证操作按钮
    await expect(page.getByRole('button', { name: /添加用户|Add User/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /导出|Export/ })).toBeVisible();
  });

  test('用户详情查看功能', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并进入用户管理
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    // 点击第一个用户查看详情
    const firstUserRow = page.getByTestId('users-table').locator('tbody tr').first();
    await firstUserRow.click();
    
    // 验证用户详情弹窗或页面
    await expect(page.getByRole('dialog').or(page.getByTestId('user-detail-panel'))).toBeVisible();
    
    // 验证用户基本信息显示
    await expect(page.getByText(/公司名称|Company/)).toBeVisible();
    await expect(page.getByText(/联系人|Contact/)).toBeVisible();
    await expect(page.getByText(/注册时间|Registration/)).toBeVisible();
  });

  test('系统设置功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到系统设置
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/settings');
    
    // 验证设置页面
    await expect(page.getByRole('heading', { name: /系统设置|System Settings/ })).toBeVisible();
    
    // 验证设置选项卡
    const settingTabs = [
      /基本设置|General/,
      /安全设置|Security/,
      /通知设置|Notifications/,
      /集成设置|Integrations/
    ];
    
    for (const tabName of settingTabs) {
      await expect(page.getByRole('tab', { name: tabName })).toBeVisible();
    }
    
    // 测试基本设置保存
    await page.getByRole('tab', { name: /基本设置|General/ }).click();
    
    // 修改某个设置项
    const companyNameInput = page.getByLabel(/公司名称|Company Name/);
    const originalValue = await companyNameInput.inputValue();
    await companyNameInput.fill('测试公司名称修改');
    
    // 保存设置
    await page.getByRole('button', { name: /保存|Save/ }).click();
    
    // 验证保存成功提示
    await expect(page.getByText(/保存成功|Saved successfully/)).toBeVisible();
    
    // 恢复原始值
    await companyNameInput.fill(originalValue);
    await page.getByRole('button', { name: /保存|Save/ }).click();
  });

  test('权限配置功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到权限管理
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/permissions');
    
    // 验证权限管理页面
    await expect(page.getByRole('heading', { name: /权限管理|Permission Management/ })).toBeVisible();
    
    // 验证角色列表
    const rolesList = page.getByTestId('roles-list');
    await expect(rolesList).toBeVisible();
    
    // 验证权限分配界面
    const permissionsPanel = page.getByTestId('permissions-panel');
    await expect(permissionsPanel).toBeVisible();
    
    // 测试权限分配
    const adminRoleItem = rolesList.getByText(/管理员|Admin/);
    await adminRoleItem.click();
    
    // 验证权限勾选框显示
    const permissionCheckboxes = permissionsPanel.locator('input[type="checkbox"]');
    expect(await permissionCheckboxes.count()).toBeGreaterThan(0);
  });

  test('数据统计和报表功能', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到报表页面
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/reports');
    
    // 验证报表页面
    await expect(page.getByRole('heading', { name: /数据报表|Reports/ })).toBeVisible();
    
    // 验证时间筛选器
    await expect(page.getByLabel(/开始时间|Start Date/)).toBeVisible();
    await expect(page.getByLabel(/结束时间|End Date/)).toBeVisible();
    
    // 验证报表类型选择
    const reportTypes = [
      /用户增长|User Growth/,
      /业务指标|Business Metrics/,
      /财务报表|Financial Reports/,
      /运营分析|Operational Analysis/
    ];
    
    for (const reportType of reportTypes) {
      await expect(page.getByRole('option', { name: reportType })).toBeVisible();
    }
    
    // 生成报表测试
    await page.getByRole('button', { name: /生成报表|Generate Report/ }).click();
    
    // 验证报表生成状态
    await expect(page.getByText(/正在生成|Generating/)).toBeVisible();
    
    // 等待报表生成完成
    await page.waitForTimeout(2000); // 等待2秒
    
    // 验证报表下载按钮
    await expect(page.getByRole('button', { name: /下载|Download/ })).toBeVisible();
  });

  test('通知中心功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到通知中心
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/notifications');
    
    // 验证通知中心页面
    await expect(page.getByRole('heading', { name: /通知中心|Notifications/ })).toBeVisible();
    
    // 验证通知列表
    const notificationsList = page.getByTestId('notifications-list');
    await expect(notificationsList).toBeVisible();
    
    // 验证通知标记为已读功能
    const unreadNotifications = notificationsList.getByTestId('unread-notification');
    if (await unreadNotifications.count() > 0) {
      const firstUnread = unreadNotifications.first();
      await firstUnread.getByRole('button', { name: /标记为已读|Mark as read/ }).click();
      
      // 验证状态变更
      await expect(firstUnread).not.toHaveClass(/unread/);
    }
    
    // 验证通知筛选功能
    const filterButtons = [
      /全部|All/,
      /未读|Unread/,
      /已读|Read/,
      /重要|Important/
    ];
    
    for (const filterName of filterButtons) {
      await expect(page.getByRole('button', { name: filterName })).toBeVisible();
    }
  });

  test('审计日志功能测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 登录并导航到审计日志
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/audit-log');
    
    // 验证审计日志页面
    await expect(page.getByRole('heading', { name: /审计日志|Audit Log/ })).toBeVisible();
    
    // 验证日志过滤器
    await expect(page.getByLabel(/操作类型|Action Type/)).toBeVisible();
    await expect(page.getByLabel(/用户|User/)).toBeVisible();
    await expect(page.getByLabel(/IP地址|IP Address/)).toBeVisible();
    
    // 验证日志表格
    const logTable = page.getByTestId('audit-log-table');
    await expect(logTable).toBeVisible();
    
    // 验证日志导出功能
    await expect(page.getByRole('button', { name: /导出日志|Export Logs/ })).toBeVisible();
    
    // 测试日志筛选
    await page.getByLabel(/操作类型|Action Type/).selectOption('login');
    await page.getByRole('button', { name: /筛选|Filter/ }).click();
    
    // 验证筛选结果
    // 这里可以添加具体的筛选结果验证逻辑
  });
});

// 管理员专属功能测试
test.describe('管理员专属功能测试', () => {
  test('管理员权限验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以普通用户身份登录
    await enterpriseUtils.loginAs('regularUser');
    
    // 尝试访问管理员页面
    await enterpriseUtils.navigateTo('/enterprise/admin/dashboard');
    
    // 验证权限拒绝
    await expect(page.getByText(/无权限访问|Access denied/)).toBeVisible();
    
    // 或者验证被重定向到登录页面
    await expect(page).toHaveURL(/.*login|.*unauthorized/);
  });

  test('系统健康状态监控', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 管理员登录
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/system-status');
    
    // 验证系统状态面板
    await expect(page.getByRole('heading', { name: /系统状态|System Status/ })).toBeVisible();
    
    // 验证各项服务状态
    const services = ['Database', 'Redis', 'API Server', 'Frontend'];
    for (const service of services) {
      await expect(page.getByTestId(`service-status-${service.toLowerCase()}`)).toBeVisible();
    }
    
    // 验证性能指标
    await expect(page.getByTestId('cpu-usage')).toBeVisible();
    await expect(page.getByTestId('memory-usage')).toBeVisible();
    await expect(page.getByTestId('disk-usage')).toBeVisible();
  });
});