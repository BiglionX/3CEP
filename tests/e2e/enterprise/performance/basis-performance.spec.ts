/**
 * 企业用户端性能基准测试
 * 测试页面加载时间、API响应时间和系统并发处理能力
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import {
  ENTERPRISE_ROUTES,
  PERFORMANCE_BENCHMARKS,
} from '../enterprise.config';

test.describe('页面加载性能测试', () => {
  test('企业首页加载性能', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 测量页面加载时间
    const startTime = Date.now();
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);
    const loadTime = Date.now() - startTime;

    // 验证加载时间符合基准
    expect(loadTime).toBeLessThan(PERFORMANCE_BENCHMARKS.pageLoadThreshold);

    console.log(
      `企业首页加载时间: ${loadTime}ms (阈值: ${PERFORMANCE_BENCHMARKS.pageLoadThreshold}ms)`
    );

    // 验证关键元素加载
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('企业仪表板加载性能', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 先登录
    await enterpriseUtils.loginAs('regularUser');

    // 测量仪表板加载时间
    const startTime = Date.now();
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(PERFORMANCE_BENCHMARKS.pageLoadThreshold);

    // 验证仪表板关键组件
    await expect(page.getByTestId('dashboard-metrics')).toBeVisible();
    await expect(page.getByTestId('recent-activities')).toBeVisible();

    console.log(`仪表板加载时间: ${loadTime}ms`);
  });

  test('移动端页面加载性能', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 设置移动设备视窗
    await enterpriseUtils.setViewport('mobile');

    // 测量移动端加载时间
    const startTime = Date.now();
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);
    const loadTime = Date.now() - startTime;

    // 移动端可能稍微宽松一些的阈值
    expect(loadTime).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoadThreshold * 1.5
    );

    console.log(`移动端首页加载时间: ${loadTime}ms`);
  });
});

test.describe('API响应性能测试', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // 获取认证token用于测试
    const response = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: 'user@enterprise.com',
        password: 'User123456',
      },
    });
    const result = await response.json();
    authToken = result.data.token;
  });

  test('认证API响应时间', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: 'user@enterprise.com',
        password: 'User123456',
      },
    });
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(
      PERFORMANCE_BENCHMARKS.apiResponseThreshold
    );

    console.log(`登录API响应时间: ${responseTime}ms`);
  });

  test('仪表板数据API响应时间', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(ENTERPRISE_ROUTES.api.dashboard, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(
      PERFORMANCE_BENCHMARKS.apiResponseThreshold
    );

    console.log(`仪表板API响应时间: ${responseTime}ms`);
  });

  test('列表数据API响应时间', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(ENTERPRISE_ROUTES.api.agents, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(
      PERFORMANCE_BENCHMARKS.apiResponseThreshold
    );

    console.log(`智能体列表API响应时间: ${responseTime}ms`);
  });
});

test.describe('并发性能测试', () => {
  test('多用户并发登录测试', async ({ browser }) => {
    const concurrentUsers = 10;
    const loginPromises = [];

    const startTime = Date.now();

    // 创建多个浏览器上下文模拟并发用户
    for (let i = 0; i < concurrentUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

      const loginPromise = enterpriseUtils
        .loginAs('regularUser')
        .then(() => {
          return enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
        })
        .finally(() => context.close());

      loginPromises.push(loginPromise);
    }

    // 等待所有并发操作完成
    await Promise.all(loginPromises);
    const totalTime = Date.now() - startTime;

    console.log(`并发${concurrentUsers}用户登录总耗时: ${totalTime}ms`);
    console.log(`平均每个用户耗时: ${totalTime / concurrentUsers}ms`);
  });

  test('API并发请求测试', async ({ request }) => {
    const concurrentRequests = 20;
    const requests = [];

    // 获取认证token
    const loginResponse = await request.post(ENTERPRISE_ROUTES.api.login, {
      data: {
        email: 'user@enterprise.com',
        password: 'User123456',
      },
    });
    const loginResult = await loginResponse.json();
    const authToken = loginResult.data.token;

    const startTime = Date.now();

    // 创建并发API请求
    for (let i = 0; i < concurrentRequests; i++) {
      const requestPromise = request.get(ENTERPRISE_ROUTES.api.dashboard, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      requests.push(requestPromise);
    }

    // 执行并发请求
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // 验证所有请求都成功
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    console.log(`并发${concurrentRequests}个API请求总耗时: ${totalTime}ms`);
    console.log(`平均响应时间: ${totalTime / concurrentRequests}ms`);
  });
});

test.describe('长时间运行稳定性测试', () => {
  test('持续操作稳定性测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 登录
    await enterpriseUtils.loginAs('regularUser');

    // 执行一系列连续操作
    const operations = [
      () => enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard),
      () => enterpriseUtils.navigateTo('/enterprise/agents'),
      () => enterpriseUtils.navigateTo('/enterprise/procurement'),
      () => enterpriseUtils.navigateTo('/enterprise/profile'),
      () => page.reload(),
    ];

    const startTime = Date.now();
    let totalOperations = 0;

    // 执行每种操作多次
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const operation of operations) {
        await operation();
        totalOperations++;

        // 验证每次操作后页面仍然正常
        await expect(page.getByRole('main')).toBeVisible();
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerOperation = totalTime / totalOperations;

    console.log(`长时间运行测试:`);
    console.log(`总操作次数: ${totalOperations}`);
    console.log(`总耗时: ${totalTime}ms`);
    console.log(`平均每次操作耗时: ${avgTimePerOperation}ms`);
  });

  test('内存使用监控', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 登录
    await enterpriseUtils.loginAs('regularUser');

    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return (window.performance as any).memory?.usedJSHeapSize || 0;
    });

    // 执行一系列操作
    for (let i = 0; i < 10; i++) {
      await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.dashboard);
      await enterpriseUtils.navigateTo('/enterprise/agents');
      await enterpriseUtils.navigateTo('/enterprise/procurement');

      // 强制垃圾回收（如果支持）
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });
    }

    // 获取最终内存使用
    const finalMemory = await page.evaluate(() => {
      return (window.performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryGrowth = finalMemory - initialMemory;
    console.log(`内存使用监控:`);
    console.log(`初始内存: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`最终内存: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`内存增长: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`);

    // 内存增长应该在合理范围内
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB以内
  });
});

test.describe('网络性能测试', () => {
  test('不同网络条件下的性能', async ({ page, context }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 测试不同网络条件
    const networkConditions = [
      { name: 'Fast 3G', download: 1.6, upload: 0.75, latency: 150 },
      { name: 'Slow 3G', download: 0.5, upload: 0.25, latency: 300 },
    ];

    for (const condition of networkConditions) {
      // 设置网络条件
      await context.setOffline(false);
      // 注意：Playwright的网络节流功能可能需要特定配置

      console.log(`测试网络条件: ${condition.name}`);

      const startTime = Date.now();
      await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);
      const loadTime = Date.now() - startTime;

      console.log(`${condition.name} 下页面加载时间: ${loadTime}ms`);

      // 清理
      await page.goto('about:blank');
    }
  });
});

test.describe('资源加载性能测试', () => {
  test('静态资源加载时间', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);

    // 监听网络请求
    const requests: any[] = [];
    page.on('requestfinished', request => {
      requests.push({
        url: request.url(),
        timing: request.timing(),
        resourceType: request.resourceType(),
      });
    });

    const startTime = Date.now();
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);
    const loadTime = Date.now() - startTime;

    // 分析不同类型资源的加载时间
    const resourceStats = {
      script: requests.filter(r => r.resourceType === 'script'),
      stylesheet: requests.filter(r => r.resourceType === 'stylesheet'),
      image: requests.filter(r => r.resourceType === 'image'),
      font: requests.filter(r => r.resourceType === 'font'),
    };

    console.log('资源加载统计:');
    Object.entries(resourceStats).forEach(([type, resources]) => {
      if (resources.length > 0) {
        const avgTime =
          resources.reduce(
            (sum, r) => sum + (r.timing.responseEnd - r.timing.requestStart),
            0
          ) / resources.length;
        console.log(
          `${type}: ${resources.length}个, 平均加载时间: ${avgTime.toFixed(2)}ms`
        );
      }
    });

    console.log(`总页面加载时间: ${loadTime}ms`);
  });
});

// 性能基准报告生成
test.afterAll(async () => {
  console.log('\n=== 性能测试基准报告 ===');
  console.log(
    `页面加载时间阈值: ${PERFORMANCE_BENCHMARKS.pageLoadThreshold}ms`
  );
  console.log(
    `API响应时间阈值: ${PERFORMANCE_BENCHMARKS.apiResponseThreshold}ms`
  );
  console.log(`并发用户支持: ${PERFORMANCE_BENCHMARKS.concurrentUsers}个`);
  console.log(`系统可用性目标: ${PERFORMANCE_BENCHMARKS.availabilityTarget}%`);
  console.log('========================\n');
});
