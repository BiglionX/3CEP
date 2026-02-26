/**
 * 企业用户端E2E测试工具类
 * 提供常用的企业服务测试辅助方法
 */

import { Page, expect, APIRequestContext } from '@playwright/test';
import { 
  ENTERPRISE_TEST_CONFIG, 
  TEST_ENTERPRISE_USERS, 
  ENTERPRISE_ROUTES,
  TEST_DATA
} from '../enterprise.config';

export class EnterpriseTestUtils {
  private page: Page;
  private apiContext: APIRequestContext;

  constructor(page: Page, apiContext: APIRequestContext) {
    this.page = page;
    this.apiContext = apiContext;
  }

  /**
   * 导航到指定的企业服务页面
   */
  async navigateTo(path: string): Promise<void> {
    const baseUrl = ENTERPRISE_TEST_CONFIG.getBaseUrl();
    const fullPath = path.startsWith('http') ? path : `${baseUrl}${path}`;
    
    await this.page.goto(fullPath, {
      waitUntil: 'networkidle',
      timeout: ENTERPRISE_TEST_CONFIG.timeouts.pageLoad
    });
  }

  /**
   * 企业用户登录
   */
  async loginAs(role: keyof typeof TEST_ENTERPRISE_USERS = 'regularUser'): Promise<void> {
    const user = TEST_ENTERPRISE_USERS[role];
    
    // 导航到登录页面
    await this.navigateTo(ENTERPRISE_ROUTES.login);
    
    // 填写登录表单
    await this.page.getByPlaceholder('请输入邮箱').fill(user.email);
    await this.page.getByPlaceholder('请输入密码').fill(user.password);
    
    // 提交登录
    await this.page.getByRole('button', { name: '登录' }).click();
    
    // 等待登录完成
    await this.page.waitForURL(`${ENTERPRISE_TEST_CONFIG.getBaseUrl()}${ENTERPRISE_ROUTES.dashboard}`, {
      timeout: ENTERPRISE_TEST_CONFIG.timeouts.pageLoad
    });
    
    // 验证登录成功
    await expect(this.page.getByText(user.companyName)).toBeVisible();
  }

  /**
   * 企业用户登出
   */
  async logout(): Promise<void> {
    // 点击用户菜单
    await this.page.getByRole('button', { name: '用户菜单' }).click();
    
    // 点击登出按钮
    await this.page.getByRole('menuitem', { name: '退出登录' }).click();
    
    // 等待回到登录页面
    await this.page.waitForURL(`${ENTERPRISE_TEST_CONFIG.getBaseUrl()}${ENTERPRISE_ROUTES.login}`);
  }

  /**
   * 创建测试企业账户
   */
  async createTestEnterprise(): Promise<any> {
    const enterpriseData = TEST_DATA.enterpriseInfo;
    
    const response = await this.apiContext.post(ENTERPRISE_ROUTES.api.register, {
      data: {
        companyName: enterpriseData.companyName,
        businessLicense: enterpriseData.businessLicense,
        contactPerson: enterpriseData.contactPerson,
        phone: enterpriseData.phone,
        email: enterpriseData.email,
        password: 'Test123456'
      }
    });
    
    return await response.json();
  }

  /**
   * 获取认证Token
   */
  async getAuthToken(email: string, password: string): Promise<string> {
    const response = await this.apiContext.post(ENTERPRISE_ROUTES.api.login, {
      data: { email, password }
    });
    
    const result = await response.json();
    return result.token || '';
  }

  /**
   * 设置认证头
   */
  async setAuthHeader(token: string): Promise<void> {
    await this.page.addInitScript((tokenValue) => {
      window.localStorage.setItem('auth-token', tokenValue);
    }, token);
  }

  /**
   * 等待元素可见
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout || ENTERPRISE_TEST_CONFIG.timeouts.elementWait
    });
  }

  /**
   * 等待元素不可见
   */
  async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'hidden',
      timeout: timeout || ENTERPRISE_TEST_CONFIG.timeouts.elementWait
    });
  }

  /**
   * 等待加载状态消失
   */
  async waitForLoadingComplete(): Promise<void> {
    // 等待常见的加载指示器消失
    const loadingSelectors = [
      '[data-testid="loading-spinner"]',
      '.loading',
      '[aria-busy="true"]',
      '.skeleton'
    ];
    
    for (const selector of loadingSelectors) {
      try {
        await this.waitForElementHidden(selector, 2000);
      } catch (error) {
        // 忽略找不到元素的错误
      }
    }
  }

  /**
   * 截图并保存
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `enterprise-${name}-${timestamp}.png`;
    
    await this.page.screenshot({
      path: `./test-results/screenshots/${filename}`,
      fullPage: true
    });
  }

  /**
   * 性能监控
   */
  async measurePerformance(): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  }> {
    const metrics = await this.page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    return metrics;
  }

  /**
   * 验证页面性能指标
   */
  async validatePerformanceMetrics(metrics: any): Promise<void> {
    const thresholds = {
      loadTime: 3000, // 3秒
      domContentLoaded: 2000, // 2秒
      firstPaint: 1000 // 1秒
    };
    
    expect(metrics.loadTime).toBeLessThan(thresholds.loadTime);
    expect(metrics.domContentLoaded).toBeLessThan(thresholds.domContentLoaded);
    expect(metrics.firstPaint).toBeLessThan(thresholds.firstPaint);
  }

  /**
   * 清理测试数据
   */
  async cleanupTestData(): Promise<void> {
    // 清理localStorage
    await this.page.evaluate(() => {
      localStorage.clear();
    });
    
    // 清理会话存储
    await this.page.evaluate(() => {
      sessionStorage.clear();
    });
    
    // 删除cookies
    const cookies = await this.page.context().cookies();
    const cookieNames = cookies.map(cookie => cookie.name);
    await this.page.context().clearCookies();
  }

  /**
   * 模拟不同设备视窗
   */
  async setViewport(device: 'desktop' | 'tablet' | 'mobile'): Promise<void> {
    const viewport = ENTERPRISE_TEST_CONFIG.viewports[device];
    await this.page.setViewportSize(viewport);
  }

  /**
   * 验证权限访问
   */
  async verifyAccessDenied(path: string): Promise<void> {
    await this.navigateTo(path);
    
    // 应该重定向到登录页面或显示无权限提示
    const currentUrl = this.page.url();
    const isLoginPage = currentUrl.includes(ENTERPRISE_ROUTES.login);
    const hasPermissionDenied = await this.page.getByText(/(无权限|access denied|权限不足)/i).isVisible();
    
    expect(isLoginPage || hasPermissionDenied).toBeTruthy();
  }

  /**
   * 生成随机测试数据
   */
  generateRandomTestData(): any {
    const timestamp = Date.now();
    return {
      companyName: `测试公司_${timestamp}`,
      businessLicense: `91310000MA${Math.random().toString().substr(2, 8)}`,
      contactPerson: `联系人_${timestamp}`,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      email: `test_${timestamp}@example.com`
    };
  }
}

// 导出工厂函数
export function createEnterpriseTestUtils(page: Page, apiContext: APIRequestContext): EnterpriseTestUtils {
  return new EnterpriseTestUtils(page, apiContext);
}

export default EnterpriseTestUtils;