import { Page, expect } from '@playwright/test';
import { TEST_ENV, MOBILE_DEVICES } from './test-config';

/**
 * 测试工具类 - 提供通用的测试辅助方法
 */
export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector: string, timeout?: number) {
    return await this.page.waitForSelector(selector, { 
      timeout: timeout || TEST_ENV.timeouts.elementAppear 
    });
  }

  /**
   * 点击元素并等待
   */
  async clickAndWait(selector: string, waitTime?: number) {
    await this.page.click(selector);
    if (waitTime) {
      await this.page.waitForTimeout(waitTime);
    }
  }

  /**
   * 填写表单
   */
  async fillForm(formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * 获取当前时间戳
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * 用户登录
   */
  async login(email: string, password: string) {
    await this.page.goto(`${TEST_ENV.getBaseUrl()}/login`);
    
    // 等待页面完全加载
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // 额外等待确保CSR完成
    
    // 使用多种方式查找邮箱输入框
    const emailSelectors = [
      '#email',
      'input[type="email"]',
      'input[name="email"]',
      '[placeholder*="邮箱"], [placeholder*="email"]'
    ];
    
    let emailInputFound = false;
    for (const selector of emailSelectors) {
      try {
        await this.waitForElement(selector, 5000);
        emailInputFound = true;
        console.log(`✅ 找到邮箱输入框: ${selector}`);
        break;
      } catch (error) {
        console.log(`🔍 尝试选择器: ${selector} - 未找到`);
      }
    }
    
    if (!emailInputFound) {
      throw new Error('无法找到邮箱输入框');
    }
    
    // 查找密码输入框
    const passwordSelectors = [
      '#password',
      'input[type="password"]:not([id*="confirm"])',
      'input[name="password"]'
    ];
    
    let passwordInputFound = false;
    for (const selector of passwordSelectors) {
      try {
        await this.waitForElement(selector, 3000);
        passwordInputFound = true;
        console.log(`✅ 找到密码输入框: ${selector}`);
        break;
      } catch (error) {
        console.log(`🔍 尝试选择器: ${selector} - 未找到`);
      }
    }
    
    if (!passwordInputFound) {
      throw new Error('无法找到密码输入框');
    }
    
    // 填写登录表单
    await this.page.fill('#email, input[type="email"], input[name="email"]', email);
    await this.page.fill('#password, input[type="password"]:not([id*="confirm"]), input[name="password"]', password);
    
    // 查找并点击登录按钮
    const buttonSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      'button:has-text("Login")',
      '[type="submit"]'
    ];
    
    let buttonClicked = false;
    for (const selector of buttonSelectors) {
      try {
        await this.page.click(selector, { timeout: 3000 });
        console.log(`✅ 点击登录按钮: ${selector}`);
        buttonClicked = true;
        break;
      } catch (error) {
        console.log(`🔍 尝试按钮选择器: ${selector} - 未找到`);
      }
    }
    
    if (!buttonClicked) {
      throw new Error('无法找到登录按钮');
    }
    
    // 等待登录完成并跳转
    await this.page.waitForURL(/^(?!.*\/login).*$/, { 
      timeout: TEST_ENV.timeouts.navigation,
      waitUntil: 'networkidle'
    });
    
    console.log('✅ 登录流程完成');
  }

  /**
   * 验证页面包含指定文本
   */
  async verifyTextPresent(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * 验证元素存在
   */
  async verifyElementExists(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * 验证元素不存在
   */
  async verifyElementNotExists(selector: string) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  /**
   * 截图并保存
   */
  async takeScreenshot(name: string) {
    const timestamp = TestHelpers.getCurrentTimestamp();
    const filename = `test-results/screenshots/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  /**
   * 模拟设备扫描
   */
  async scanQRCode(deviceId: string) {
    // 模拟扫码过程
    await this.page.evaluate((id) => {
      // 这里可以注入模拟扫码的逻辑
      sessionStorage.setItem('scannedDeviceId', id);
    }, deviceId);
    
    // 等待扫码结果处理
    await this.page.waitForTimeout(1000);
  }

  /**
   * 选择故障类型
   */
  async selectFaultType(faultType: string) {
    await this.waitForElement('[data-testid="fault-type-selector"]');
    await this.page.selectOption('[data-testid="fault-type-selector"]', faultType);
  }

  /**
   * 提交表单
   */
  async submitForm(buttonSelector: string) {
    await this.clickAndWait(buttonSelector);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 验证API响应
   */
  async verifyApiResponse(expectedStatus: number, expectedData?: any) {
    const response = await this.page.waitForResponse(response => 
      response.status() === expectedStatus
    );
    
    if (expectedData) {
      const responseBody = await response.json();
      expect(responseBody).toMatchObject(expectedData);
    }
    
    return response;
  }

  /**
   * 等待网络空闲
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 清除浏览器存储
   */
  async clearStorage() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * 设置设备仿真
   */
  async setDevice(deviceName: keyof typeof MOBILE_DEVICES) {
    const device = MOBILE_DEVICES[deviceName];
    if (device) {
      await this.page.setViewportSize(device.viewport);
    }
  }
}

/**
 * 权限验证工具类
 */
export class PermissionHelpers {
  private page: Page;
  private helpers: TestHelpers;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);
  }

  /**
   * 验证管理员权限访问
   */
  async verifyAdminAccess(allowedPaths: string[]) {
    for (const path of allowedPaths) {
      await this.page.goto(`${TEST_ENV.getBaseUrl()}${path}`);
      await this.helpers.verifyElementExists('body');
      await this.helpers.verifyTextPresent(/管理|admin|dashboard/i);
    }
  }

  /**
   * 验证访问被拒绝
   */
  async verifyAccessDenied(restrictedPaths: string[]) {
    for (const path of restrictedPaths) {
      await this.page.goto(`${TEST_ENV.getBaseUrl()}${path}`);
      // 应该重定向到403页面或登录页面
      await Promise.race([
        this.helpers.verifyTextPresent(/403|forbidden|权限不足/i),
        this.helpers.verifyTextPresent(/login|登录/i)
      ]);
    }
  }

  /**
   * 测试管理员操作权限
   */
  async testAdminOperations(operations: {
    createUser: boolean;
    deleteUser: boolean;
    modifyPermissions: boolean;
    systemConfig: boolean;
  }) {
    // 测试创建用户
    if (operations.createUser) {
      await this.page.goto(`${TEST_ENV.getBaseUrl()}/admin/users`);
      await this.helpers.verifyElementExists('[data-testid="create-user-button"]');
    }

    // 测试删除用户
    if (operations.deleteUser) {
      await this.helpers.verifyElementExists('[data-testid="delete-user-button"]');
    }

    // 测试权限修改
    if (operations.modifyPermissions) {
      await this.helpers.verifyElementExists('[data-testid="modify-permissions-button"]');
    }

    // 测试系统配置
    if (operations.systemConfig) {
      await this.page.goto(`${TEST_ENV.getBaseUrl()}/admin/settings`);
      await this.helpers.verifyElementExists('[data-testid="system-config-form"]');
    }
  }
}

/**
 * 业务流程工具类
 */
export class BusinessFlowHelpers {
  private page: Page;
  private helpers: TestHelpers;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);
  }

  /**
   * 完整维修申请流程
   */
  async completeRepairProcess(deviceId: string, faultType: string) {
    // 1. 设备扫码
    await this.page.goto(`${TEST_ENV.getBaseUrl()}/scan/demo`);
    await this.helpers.scanQRCode(deviceId);
    await this.helpers.verifyTextPresent(deviceId);

    // 2. 选择故障类型
    await this.helpers.selectFaultType(faultType);
    await this.helpers.submitForm('[data-testid="diagnose-button"]');

    // 3. 查看报价
    await this.helpers.waitForElement('[data-testid="quote-summary"]');
    await this.helpers.verifyTextPresent(/报价|价格|费用/i);

    // 4. 选择店铺
    await this.helpers.clickAndWait('[data-testid="select-shop-button"]');
    await this.helpers.verifyElementExists('[data-testid="shop-list"]');

    // 5. 预约时间
    await this.helpers.clickAndWait('[data-testid="schedule-appointment"]');
    await this.helpers.verifyTextPresent(/预约成功|已确认/i);

    return true;
  }

  /**
   * 验证维修进度跟踪
   */
  async trackRepairProgress(orderId: string, expectedStatuses: string[]) {
    await this.page.goto(`${TEST_ENV.getBaseUrl()}/user/orders`);
    await this.helpers.waitForElement(`[data-testid="order-${orderId}"]`);
    
    for (const status of expectedStatuses) {
      await this.helpers.verifyTextPresent(new RegExp(status, 'i'));
      // 模拟状态更新间隔
      await this.page.waitForTimeout(1000);
    }
  }
}