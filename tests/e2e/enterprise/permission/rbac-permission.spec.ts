/**
 * 企业用户端权限控制系统测试
 * 验证RBAC权限模型和访问控制机制
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import { ENTERPRISE_ROUTES, TEST_ENTERPRISE_USERS, PERMISSIONS } from '../enterprise.config';

test.describe('角色权限验证测试', () => {
  test('企业管理员权限验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以管理员身份登录
    await enterpriseUtils.loginAs('admin');
    
    // 测试管理员可访问的所有页面
    const adminAccessibleRoutes = [
      ENTERPRISE_ROUTES.dashboard,
      ENTERPRISE_ROUTES.adminDashboard,
      '/enterprise/admin/users',
      '/enterprise/admin/settings',
      '/enterprise/admin/permissions',
      '/enterprise/agents',
      '/enterprise/procurement'
    ];
    
    for (const route of adminAccessibleRoutes) {
      await enterpriseUtils.navigateTo(route);
      await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
      await expect(page).not.toHaveURL(/.*login|.*unauthorized/);
    }
    
    // 验证管理员权限菜单项显示
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    await expect(page.getByRole('link', { name: /用户管理|User Management/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /系统设置|System Settings/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /权限管理|Permission Management/ })).toBeVisible();
  });

  test('采购经理权限验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以采购经理身份登录
    await enterpriseUtils.loginAs('procurementManager');
    
    // 测试采购经理可访问的页面
    const procurementAccessibleRoutes = [
      ENTERPRISE_ROUTES.dashboard,
      '/enterprise/procurement/dashboard',
      '/enterprise/procurement/orders',
      '/enterprise/procurement/suppliers'
    ];
    
    for (const route of procurementAccessibleRoutes) {
      await enterpriseUtils.navigateTo(route);
      await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
    }
    
    // 测试不应该访问的页面
    const restrictedRoutes = [
      '/enterprise/admin/dashboard',
      '/enterprise/admin/users',
      '/enterprise/agents/customize' // 假设需要更高权限
    ];
    
    for (const route of restrictedRoutes) {
      await enterpriseUtils.navigateTo(route);
      // 应该显示权限拒绝或重定向
      const isDenied = await page.getByText(/403|无权限|denied/i).isVisible();
      const isRedirected = page.url().includes('login') || page.url().includes('unauthorized');
      expect(isDenied || isRedirected).toBeTruthy();
    }
    
    // 验证采购相关菜单显示
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    await expect(page.getByRole('link', { name: /采购订单|Purchase Orders/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /供应商管理|Supplier Management/ })).toBeVisible();
  });

  test('智能体操作员权限验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以智能体操作员身份登录
    await enterpriseUtils.loginAs('agentOperator');
    
    // 测试智能体操作员可访问的页面
    const agentAccessibleRoutes = [
      ENTERPRISE_ROUTES.dashboard,
      '/enterprise/agents/dashboard',
      '/enterprise/agents/workflows'
    ];
    
    for (const route of agentAccessibleRoutes) {
      await enterpriseUtils.navigateTo(route);
      await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
    }
    
    // 验证智能体相关菜单显示
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    await expect(page.getByRole('link', { name: /我的智能体|My Agents/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /工作流|Workflows/ })).toBeVisible();
  });

  test('普通用户权限验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 以普通用户身份登录
    await enterpriseUtils.loginAs('regularUser');
    
    // 测试基础访问权限
    const basicRoutes = [
      ENTERPRISE_ROUTES.dashboard,
      '/enterprise/profile'
    ];
    
    for (const route of basicRoutes) {
      await enterpriseUtils.navigateTo(route);
      await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
    }
    
    // 测试受限访问
    const adminRoutes = [
      '/enterprise/admin/dashboard',
      '/enterprise/admin/users',
      '/enterprise/admin/settings'
    ];
    
    for (const route of adminRoutes) {
      await enterpriseUtils.navigateTo(route);
      const isDenied = await page.getByText(/403|无权限|denied/i).isVisible();
      const isRedirected = page.url().includes('login') || page.url().includes('unauthorized');
      expect(isDenied || isRedirected).toBeTruthy();
    }
  });
});

test.describe('细粒度权限控制测试', () => {
  test('菜单项权限控制', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 不同角色登录测试菜单显示
    const roleMenuTests = [
      {
        role: 'admin',
        expectedMenus: ['用户管理', '系统设置', '权限管理', '智能体服务', '采购管理'],
        forbiddenMenus: []
      },
      {
        role: 'procurementManager',
        expectedMenus: ['采购订单', '供应商管理'],
        forbiddenMenus: ['用户管理', '系统设置']
      },
      {
        role: 'agentOperator',
        expectedMenus: ['我的智能体', '工作流'],
        forbiddenMenus: ['用户管理', '采购管理']
      }
    ];
    
    for (const testConfig of roleMenuTests) {
      // 登录对应角色
      await enterpriseUtils.loginAs(testConfig.role as any);
      await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
      
      // 验证期望显示的菜单
      for (const menuName of testConfig.expectedMenus) {
        await expect(page.getByRole('link', { name: menuName })).toBeVisible();
      }
      
      // 验证不应该显示的菜单（如果页面结构允许的话）
      for (const menuName of testConfig.forbiddenMenus) {
        const menuExists = await page.getByRole('link', { name: menuName }).isVisible();
        expect(menuExists).toBeFalsy();
      }
      
      // 登出准备下次测试
      await enterpriseUtils.logout();
    }
  });

  test('按钮操作权限控制', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 管理员登录
    await enterpriseUtils.loginAs('admin');
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    // 验证管理员可以看到所有操作按钮
    await expect(page.getByRole('button', { name: /添加用户|Add User/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /编辑|Edit/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /删除|Delete/ }).first()).toBeVisible();
    
    // 普通用户登录相同页面
    await enterpriseUtils.logout();
    await enterpriseUtils.loginAs('regularUser');
    
    // 普通用户应该看不到管理按钮
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    // 验证被重定向或显示权限错误
    const isDenied = await page.getByText(/403|无权限|denied/i).isVisible();
    const isRedirected = page.url().includes('login') || page.url().includes('unauthorized');
    expect(isDenied || isRedirected).toBeTruthy();
  });

  test('数据访问权限控制', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 创建测试数据
    await enterpriseUtils.loginAs('admin');
    
    // 访问用户列表
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    // 验证可以看到所有用户数据
    const userRows = page.getByTestId('users-table').locator('tbody tr');
    const userCount = await userRows.count();
    expect(userCount).toBeGreaterThan(0);
    
    // 普通用户登录
    await enterpriseUtils.logout();
    await enterpriseUtils.loginAs('regularUser');
    
    // 普通用户访问用户列表应该被拒绝
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    
    const isDenied = await page.getByText(/403|无权限|denied/i).isVisible();
    const isRedirected = page.url().includes('login') || page.url().includes('unauthorized');
    expect(isDenied || isRedirected).toBeTruthy();
  });
});

test.describe('权限继承和组合测试', () => {
  test('权限继承关系验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 测试管理员权限包含所有子权限
    const adminPermissions = PERMISSIONS.admin;
    const procurementPermissions = PERMISSIONS.procurement;
    const agentPermissions = PERMISSIONS.agent;
    
    // 验证管理员权限包含采购权限
    for (const procPerm of procurementPermissions) {
      expect(adminPermissions).toContain(procPerm);
    }
    
    // 验证管理员权限包含智能体权限
    for (const agentPerm of agentPermissions) {
      expect(adminPermissions).toContain(agentPerm);
    }
  });

  test('多重角色权限合并', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 测试同时具有多个角色的用户
    // 这里模拟一个既是采购经理又是智能体操作员的用户
    
    // 以采购经理身份登录
    await enterpriseUtils.loginAs('procurementManager');
    
    // 验证采购相关权限
    await enterpriseUtils.navigateTo('/enterprise/procurement/dashboard');
    await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
    
    // 如果系统支持角色切换，测试切换到智能体操作员角色
    // 这部分取决于具体的实现方式
  });
});

test.describe('权限边界测试', () => {
  test('越权访问尝试拦截', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 普通用户尝试直接访问管理员API
    await enterpriseUtils.loginAs('regularUser');
    
    // 直接访问管理员API端点
    const response = await request.get('/api/enterprise/admin/users');
    expect(response.status()).toBe(403); // 应该返回403 Forbidden
    
    // 尝试通过URL直接访问管理员页面
    await enterpriseUtils.navigateTo('/enterprise/admin/dashboard');
    
    // 验证被拦截
    const isDenied = await page.getByText(/403|无权限|denied/i).isVisible();
    const isRedirected = page.url().includes('login') || page.url().includes('unauthorized');
    expect(isDenied || isRedirected).toBeTruthy();
  });

  test('权限时效性测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);
    
    // 管理员登录
    await enterpriseUtils.loginAs('admin');
    
    // 验证初始权限
    await enterpriseUtils.navigateTo('/enterprise/admin/users');
    await expect(page.getByText(/403|无权限|denied/i)).not.toBeVisible();
    
    // 模拟权限变更（这需要后端支持）
    // 例如：管理员撤销了自己的某些权限
    
    // 重新验证权限状态
    // 这部分测试需要根据实际的权限刷新机制来实现
  });
});

// API权限测试
test.describe('API权限验证', () => {
  test('API端点权限控制', async ({ request }) => {
    // 测试不同角色对API的访问权限
    
    // 管理员访问
    const adminToken = await getTestUserToken(request, 'admin@enterprise.com', 'Admin123456');
    const adminResponse = await request.get('/api/enterprise/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    expect(adminResponse.status()).toBe(200);
    
    // 普通用户访问相同API
    const userToken = await getTestUserToken(request, 'user@enterprise.com', 'User123456');
    const userResponse = await request.get('/api/enterprise/admin/users', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    expect(userResponse.status()).toBe(403);
  });
});

// 辅助函数
async function getTestUserToken(request: any, email: string, password: string): Promise<string> {
  const response = await request.post('/api/enterprise/login', {
    data: { email, password }
  });
  const result = await response.json();
  return result.token || '';
}