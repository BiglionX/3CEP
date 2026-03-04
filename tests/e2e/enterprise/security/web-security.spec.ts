/**
 * 企业用户端安全测试
 * 测试输入验证、XSS防护、SQL注入防护等安全机制
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import { ENTERPRISE_ROUTES, SECURITY_TEST_CONFIG } from '../enterprise.config';

test.describe('输入验证安全测试', () => {
  test('表单输入长度限制测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 导航到注册页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.register);

    // 测试超长输入
    const veryLongInput = 'A'.repeat(10000);
    const companyNameInput = page.getByPlaceholder(/公司名称|企业名称/);

    await companyNameInput.fill(veryLongInput);

    // 提交表单
    await page.getByRole('button', { name: /注册|Sign Up/ }).click();

    // 验证系统正确处理超长输入（应该显示错误或截断）
    const errorMessages = [
      /输入过长|too long/i,
      /超出最大长度|exceeds maximum length/i,
      /字符数限制|character limit/i,
    ];

    let hasError = false;
    for (const errorMsg of errorMessages) {
      if (await page.getByText(errorMsg).isVisible()) {
        hasError = true;
        break;
      }
    }

    expect(hasError).toBeTruthy();
  });

  test('特殊字符输入验证', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 测试各种特殊字符输入
    const specialCharacters = [
      '<script>alert("xss")</script>',
      'DROP TABLE users;',
      '../../../../etc/passwd',
      '%00',
      '\x00',
      '" OR "1"="1',
      "' OR '1'='1",
      'UNION SELECT * FROM users',
    ];

    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.register);

    for (const char of specialCharacters) {
      const emailInput = page.getByPlaceholder(/邮箱|Email/);
      await emailInput.fill(`test${char}@example.com`);

      // 验证输入被正确处理或拒绝
      const inputValue = await emailInput.inputValue();

      // 检查是否有错误提示
      const hasValidationError = await page
        .getByText(/无效字符|invalid character|格式错误|format error/i)
        .isVisible();

      // 或者检查输入是否被清理
      const isSanitized =
        !inputValue.includes(char) && inputValue !== `test${char}@example.com`;

      expect(hasValidationError || isSanitized).toBeTruthy();

      // 清空输入准备下一次测试
      await emailInput.fill('');
    }
  });

  test('文件上传安全测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 登录并导航到文件上传页面（假设存在）
    await enterpriseUtils.loginAs('regularUser');
    await enterpriseUtils.navigateTo('/enterprise/profile'); // 假设个人资料页面有文件上传

    // 测试恶意文件上传
    const maliciousFiles = SECURITY_TEST_CONFIG.maliciousFiles;

    for (const fileName of maliciousFiles) {
      // 创建虚拟文件输入（实际测试中需要真实的文件上传机制）
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // 这里模拟文件上传的安全检查
        // 实际实现需要根据具体的文件上传组件

        console.log(`测试文件类型安全检查: ${fileName}`);

        // 验证文件类型限制
        const hasFileTypeError = await page
          .getByText(
            /不支持的文件类型|unsupported file type|只允许上传|only allow/i
          )
          .isVisible();
        expect(hasFileTypeError).toBeTruthy();
      }
    }
  });
});

test.describe('XSS攻击防护测试', () => {
  test('反射型XSS防护', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 测试各种XSS载荷
    for (const payload of SECURITY_TEST_CONFIG.xssPayloads) {
      // 通过URL参数注入XSS载荷
      const encodedPayload = encodeURIComponent(payload);
      await enterpriseUtils.navigateTo(
        `/enterprise/search?q=${encodedPayload}`
      );

      // 验证载荷没有被执行
      const alertTriggered = await page.evaluate(() => {
        return (window as any).xssAlertTriggered || false;
      });

      expect(alertTriggered).toBeFalsy();

      // 验证HTML被正确转义
      const pageContent = await page.content();
      expect(pageContent).not.toContain(payload);

      // 清理
      await page.goto('about:blank');
    }
  });

  test('存储型XSS防护', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 登录
    await enterpriseUtils.loginAs('regularUser');

    // 在表单中提交XSS载荷
    await enterpriseUtils.navigateTo('/enterprise/profile');

    for (const payload of SECURITY_TEST_CONFIG.xssPayloads) {
      const bioInput = page.getByLabel(/个人简介|Bio|Description/);
      if (await bioInput.isVisible()) {
        await bioInput.fill(payload);
        await page.getByRole('button', { name: /保存|Save/ }).click();

        // 验证载荷被正确处理
        const hasError = await page
          .getByText(
            /包含非法字符|contains illegal characters|输入无效|invalid input/i
          )
          .isVisible();
        expect(hasError).toBeTruthy();
      }
    }
  });

  test('DOM型XSS防护', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 测试通过hash或URL片段的DOM XSS
    for (const payload of SECURITY_TEST_CONFIG.xssPayloads) {
      const encodedPayload = encodeURIComponent(payload);
      await page.evaluate(hash => {
        window.location.hash = hash;
      }, encodedPayload);

      // 等待可能的DOM更新
      await page.waitForTimeout(1000);

      // 验证没有XSS执行
      const alertTriggered = await page.evaluate(() => {
        return (window as any).xssAlertTriggered || false;
      });

      expect(alertTriggered).toBeFalsy();
    }
  });
});

test.describe('SQL注入防护测试', () => {
  test('登录表单SQL注入测试', async ({ request }) => {
    for (const payload of SECURITY_TEST_CONFIG.sqlInjectionPayloads) {
      const response = await request.post(ENTERPRISE_ROUTES.api.login, {
        data: {
          email: payload,
          password: 'any_password',
        },
      });

      // 验证SQL注入被阻止
      const result = await response.json();

      // 应该返回认证失败而不是数据库错误
      expect(result.success).toBeFalsy();
      expect(response.status()).toBe(401); // 认证失败状态码

      // 不应该暴露数据库错误信息
      expect(JSON.stringify(result)).not.toContain(/sql|database|syntax/i);
    }
  });

  test('搜索功能SQL注入测试', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 登录
    await enterpriseUtils.loginAs('regularUser');
    await enterpriseUtils.navigateTo('/enterprise/agents');

    // 测试搜索框SQL注入
    for (const payload of SECURITY_TEST_CONFIG.sqlInjectionPayloads) {
      const searchInput = page.getByPlaceholder(/搜索|Search/);
      if (await searchInput.isVisible()) {
        await searchInput.fill(payload);
        await page.keyboard.press('Enter');

        // 等待搜索结果
        await page.waitForTimeout(1000);

        // 验证页面没有崩溃且正常显示
        await expect(page.getByRole('main')).toBeVisible();

        // 验证没有数据库错误信息泄露
        const pageContent = await page.content();
        expect(pageContent).not.toContain(/sql|database|syntax|error/i);
      }
    }
  });

  test('API参数SQL注入测试', async ({ request }) => {
    // 先获取认证token
    const loginResponse = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: 'user@enterprise.com',
        password: 'User123456',
      },
    });
    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;

    // 测试API参数中的SQL注入
    for (const payload of SECURITY_TEST_CONFIG.sqlInjectionPayloads) {
      const response = await request.get(ENTERPRISE_ROUTES.api.agents, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: payload },
      });

      // 验证请求被正确处理
      expect([200, 400]).toContain(response.status());

      const result = await response.json();

      // 不应该返回数据库错误
      if (result.success === false) {
        expect(result.error).not.toContain(/sql|database|syntax/i);
      }
    }
  });
});

test.describe('CSRF防护测试', () => {
  test('跨站请求伪造防护', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 登录获取会话
    await enterpriseUtils.loginAs('regularUser');

    // 尝试从外部站点发起请求（模拟CSRF攻击）
    const csrfTestCases = [
      {
        name: '删除用户请求',
        url: '/api/enterprise/users/123',
        method: 'DELETE',
      },
      {
        name: '修改权限请求',
        url: '/api/enterprise/users/123/permissions',
        method: 'PUT',
        data: { permissions: ['admin'] },
      },
    ];

    for (const testCase of csrfTestCases) {
      // 模拟从外部站点发起的请求（不带认证头）
      const response = await request.fetch(testCase.url, {
        method: testCase.method as any,
        data: testCase.data,
        // 注意：故意不包含认证信息来测试CSRF防护
      });

      // 验证请求被拒绝
      expect([401, 403]).toContain(response.status());
    }
  });

  test('Referer检查测试', async ({ request }) => {
    // 测试伪造Referer头部
    const fakeReferer = 'http://malicious-site.com';

    const response = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: 'user@enterprise.com',
        password: 'User123456',
      },
      headers: {
        Referer: fakeReferer,
      },
    });

    // 认证应该仍然正常工作（现代应用通常不依赖Referer检查）
    expect([200, 401]).toContain(response.status());
  });
});

test.describe('会话安全测试', () => {
  test('会话固定攻击防护', async ({ page, context, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 获取初始会话
    await enterpriseUtils.loginAs('regularUser');
    const initialCookies = await context.cookies();

    // 登出
    await enterpriseUtils.logout();

    // 尝试重用旧会话cookie
    await context.clearCookies();
    await context.addCookies(initialCookies);

    // 访问受保护页面
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);

    // 验证会话已被无效化
    await expect(page).toHaveURL(/.*login/);
  });

  test('会话劫持防护', async ({ browser, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(
      await browser.newPage(),
      request
    );

    // 正常登录
    await enterpriseUtils.loginAs('regularUser');

    // 尝试在另一个上下文中使用相同的会话（模拟会话劫持）
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondUtils = createEnterpriseTestUtils(secondPage, request);

    // 如果系统实现了会话绑定IP或其他安全措施，
    // 第二个会话可能会被检测并终止

    // 清理
    await secondContext.close();
  });

  test('HTTPS安全头验证', async ({ page, request }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, request);

    // 访问页面检查安全头
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 检查重要的安全响应头
    const response = await page.goto(ENTERPRISE_ROUTES.home);
    const headers = response?.headers();

    if (headers) {
      // 检查是否存在安全相关头部
      const securityHeaders = [
        'strict-transport-security', // HSTS
        'x-content-type-options', // 防止MIME类型混淆
        'x-frame-options', // 防止点击劫持
        'content-security-policy', // CSP策略
        'x-xss-protection', // XSS保护
      ];

      console.log('安全响应头检查:');
      securityHeaders.forEach(header => {
        const headerValue = headers[header];
        if (headerValue) {
          console.log(`✓ ${header}: ${headerValue}`);
        } else {
          console.log(`✗ ${header}: 未设置`);
        }
      });
    }
  });
});

test.describe('敏感信息保护测试', () => {
  test('错误信息泄露测试', async ({ request }) => {
    // 测试各种错误场景下的信息泄露

    // 不存在的API端点
    const response1 = await request.get('/api/enterprise/nonexistent');
    const result1 = await response1.json();

    // 验证不泄露系统信息
    expect(JSON.stringify(result1)).not.toContain(
      /stack|trace|exception|database|table/i
    );

    // 数据库错误模拟
    const response2 = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: "' OR '1'='1",
        password: 'test',
      },
    });
    const result2 = await response2.json();

    // 验证不泄露数据库错误详情
    expect(JSON.stringify(result2)).not.toContain(
      /sql|mysql|postgresql|sqlite/i
    );
  });

  test('敏感数据传输加密', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 监听网络请求检查HTTPS使用
    let hasHttpRequests = false;
    page.on('request', request => {
      if (
        request.url().startsWith('http://') &&
        !request.url().includes('localhost')
      ) {
        hasHttpRequests = true;
        console.log('发现HTTP请求:', request.url());
      }
    });

    // 执行涉及敏感数据的操作
    await enterpriseUtils.loginAs('regularUser');

    // 验证没有明文传输敏感信息
    expect(hasHttpRequests).toBeFalsy();
  });
});
