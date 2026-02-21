import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../e2e-config';

test.describe('认证接口测试', () => {
  const baseUrl = TEST_CONFIG.BASE_URL;

  /**
   * 测试用户登录接口
   */
  test('POST /api/auth/login - 用户登录', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: TEST_CONFIG.TEST_USERS.engineer.email,
        password: TEST_CONFIG.TEST_USERS.engineer.password
      }
    });

    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('email', TEST_CONFIG.TEST_USERS.engineer.email);
    expect(responseBody.user).toHaveProperty('role');
  });

  /**
   * 测试会话检查接口
   */
  test('GET /api/auth/check-session - 会话检查', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: TEST_CONFIG.TEST_USERS.consumer.email,
        password: TEST_CONFIG.TEST_USERS.consumer.password
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // 使用token检查会话
    const sessionResponse = await request.get(`${baseUrl}/api/auth/check-session`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(sessionResponse.status()).toBe(200);
    
    const sessionData = await sessionResponse.json();
    expect(sessionData).toHaveProperty('is_authenticated', true);
    expect(sessionData).toHaveProperty('user');
  });

  /**
   * 测试无效凭证登录
   */
  test('POST /api/auth/login - 无效凭证', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('error');
  });

  /**
   * 测试缺少参数的登录请求
   */
  test('POST /api/auth/login - 缺少参数', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: TEST_CONFIG.TEST_USERS.engineer.email
        // 缺少password
      }
    });

    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('error');
  });
});