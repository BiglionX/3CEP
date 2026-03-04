// 采购智能体核心功能压力测试
// 专注于关键API端点的性能验证

async function runCoreStressTest() {
  console.log('🚀 开始采购智能体核心功能压力测试...\n');

  const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    testDuration: 30, // 30秒测试
    concurrentUsers: 5, // 5个并发用户
    apiEndpoints: [
      {
        name: '缓存测试接口',
        method: 'GET',
        path: '/api/procurement-intelligence/cache-demo/test',
        expectedStatus: 200,
      },
      {
        name: '指标获取接口',
        method: 'GET',
        path: '/api/procurement-intelligence/metrics?type=realtime',
        expectedStatus: 200,
      },
      {
        name: '指标记录接口',
        method: 'POST',
        path: '/api/procurement-intelligence/metrics',
        body: {
          metricType: 'supplier_match_success_rate',
          value: 92.5,
          dimension: 'stress_test',
        },
        expectedStatus: 200,
      },
    ],
  };

  // 测试结果收集
  const testResults = {
    startTime: Date.now(),
    requests: [],
    errors: [],
    userStats: [],
  };

  // 单个请求执行函数
  async function executeRequest(endpoint, userId) {
    const startTime = Date.now();

    try {
      const url = TEST_CONFIG.baseUrl + endpoint.path;
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const result = {
        userId,
        endpoint: endpoint.name,
        method: endpoint.method,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        success: response.status === endpoint.expectedStatus,
      };

      testResults.requests.push(result);

      if (!result.success) {
        const errorBody = await response.text();
        testResults.errors.push({
          ...result,
          errorMessage: `Expected ${endpoint.expectedStatus}, got ${response.status}`,
          responseBody: errorBody.substring(0, 200),
        });
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const errorResult = {
        userId,
        endpoint: endpoint.name,
        method: endpoint.method,
        status: null,
        responseTime,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      };

      testResults.requests.push(errorResult);
      testResults.errors.push(errorResult);

      return errorResult;
    }
  }

  // 虚拟用户执行循环
  async function runVirtualUser(userId) {
    const userStartTime = Date.now();
    const userResults = {
      userId,
      requests: 0,
      successes: 0,
      failures: 0,
      totalResponseTime: 0,
    };

    console.log(`👤 虚拟用户 ${userId} 开始测试`);

    while (
      Date.now() - testResults.startTime <
      TEST_CONFIG.testDuration * 1000
    ) {
      // 随机选择一个端点进行测试
      const endpoint =
        TEST_CONFIG.apiEndpoints[
          Math.floor(Math.random() * TEST_CONFIG.apiEndpoints.length)
        ];

      const result = await executeRequest(endpoint, userId);
      userResults.requests++;
      userResults.totalResponseTime += result.responseTime;

      if (result.success) {
        userResults.successes++;
      } else {
        userResults.failures++;
      }

      // 随机等待时间模拟真实用户行为
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    }

    const userTotalTime = Date.now() - userStartTime;
    userResults.qps = (userResults.requests / (userTotalTime / 1000)).toFixed(
      2
    );
    userResults.avgResponseTime = (
      userResults.totalResponseTime / userResults.requests
    ).toFixed(2);

    testResults.userStats.push(userResults);

    console.log(
      `👤 虚拟用户 ${userId} 测试完成 - QPS: ${userResults.qps}, 成功率: ${((userResults.successes / userResults.requests) * 100).toFixed(1)}%`
    );
  }

  // 启动所有虚拟用户
  console.log(
    `🎯 启动 ${TEST_CONFIG.concurrentUsers} 个并发用户进行 ${TEST_CONFIG.testDuration} 秒压力测试`
  );

  const userPromises = [];
  for (let i = 1; i <= TEST_CONFIG.concurrentUsers; i++) {
    userPromises.push(runVirtualUser(i));
  }

  // 等待所有用户完成
  await Promise.all(userPromises);

  testResults.endTime = Date.now();
  const totalTime = (testResults.endTime - testResults.startTime) / 1000;

  // 计算总体指标
  const totalRequests = testResults.requests.length;
  const successfulRequests = testResults.requests.filter(r => r.success).length;
  const failedRequests = testResults.requests.filter(r => !r.success).length;
  const responseTimes = testResults.requests.map(r => r.responseTime);

  const metrics = {
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate: ((successfulRequests / totalRequests) * 100).toFixed(2),
    totalTime,
    overallQPS: (totalRequests / totalTime).toFixed(2),
    avgResponseTime: (
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    ).toFixed(2),
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    p50: responseTimes.sort((a, b) => a - b)[
      Math.floor(responseTimes.length * 0.5)
    ],
    p90: responseTimes[Math.floor(responseTimes.length * 0.9)],
    p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
    p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
  };

  // 按端点分类统计
  const endpointStats = {};
  TEST_CONFIG.apiEndpoints.forEach(endpoint => {
    const endpointRequests = testResults.requests.filter(
      r => r.endpoint === endpoint.name
    );
    const successes = endpointRequests.filter(r => r.success).length;

    endpointStats[endpoint.name] = {
      total: endpointRequests.length,
      successes,
      failures: endpointRequests.length - successes,
      successRate:
        endpointRequests.length > 0
          ? ((successes / endpointRequests.length) * 100).toFixed(2)
          : '0.00',
      avgResponseTime:
        endpointRequests.length > 0
          ? (
              endpointRequests.reduce((sum, r) => sum + r.responseTime, 0) /
              endpointRequests.length
            ).toFixed(2)
          : '0',
    };
  });

  // 输出测试结果
  console.log('\n📊 采购智能体压力测试结果');
  console.log('=====================================');
  console.log(`总测试时间: ${metrics.totalTime.toFixed(1)}秒`);
  console.log(`总请求数: ${metrics.totalRequests}`);
  console.log(`成功请求数: ${metrics.successfulRequests}`);
  console.log(`失败请求数: ${metrics.failedRequests}`);
  console.log(`成功率: ${metrics.successRate}%`);
  console.log(`整体QPS: ${metrics.overallQPS}`);
  console.log('');
  console.log('⏱️  响应时间统计 (毫秒)');
  console.log(`平均响应时间: ${metrics.avgResponseTime}`);
  console.log(`最小响应时间: ${metrics.minResponseTime}`);
  console.log(`最大响应时间: ${metrics.maxResponseTime}`);
  console.log(`50%响应时间: ${metrics.p50}`);
  console.log(`90%响应时间: ${metrics.p90}`);
  console.log(`95%响应时间: ${metrics.p95}`);
  console.log(`99%响应时间: ${metrics.p99}`);
  console.log('');
  console.log('📋 各端点性能统计');
  Object.entries(endpointStats).forEach(([endpoint, stats]) => {
    console.log(`${endpoint}:`);
    console.log(`  请求次数: ${stats.total}`);
    console.log(`  成功率: ${stats.successRate}%`);
    console.log(`  平均响应时间: ${stats.avgResponseTime}ms`);
  });
  console.log('');
  console.log('👥 用户并发统计');
  testResults.userStats.forEach(userStat => {
    console.log(
      `用户${userStat.userId}: QPS=${userStat.qps}, 成功率=${((userStat.successes / userStat.requests) * 100).toFixed(1)}%`
    );
  });
  console.log('');

  // 性能评估
  console.log('🏆 性能评估');
  console.log('============');

  const assessments = [];

  if (parseFloat(metrics.successRate) >= 95) {
    assessments.push('✅ 系统稳定性: 优秀');
  } else if (parseFloat(metrics.successRate) >= 90) {
    assessments.push('⚠️  系统稳定性: 良好');
  } else {
    assessments.push('❌ 系统稳定性: 需要改进');
  }

  if (parseFloat(metrics.p95) <= 500) {
    assessments.push('✅ 响应性能: 优秀');
  } else if (parseFloat(metrics.p95) <= 1000) {
    assessments.push('⚠️  响应性能: 良好');
  } else {
    assessments.push('❌ 响应性能: 需要优化');
  }

  if (parseFloat(metrics.overallQPS) >= 20) {
    assessments.push('✅ 吞吐能力: 优秀');
  } else if (parseFloat(metrics.overallQPS) >= 10) {
    assessments.push('⚠️  吞吐能力: 良好');
  } else {
    assessments.push('❌ 吞吐能力: 需要提升');
  }

  assessments.forEach(assessment => console.log(assessment));

  // 错误分析
  if (testResults.errors.length > 0) {
    console.log('\n❌ 错误分析');
    console.log('===========');
    console.log(`总错误数: ${testResults.errors.length}`);

    // 按错误类型统计
    const errorTypes = {};
    testResults.errors.forEach(error => {
      const errorKey = error.errorMessage || error.error || 'Unknown Error';
      errorTypes[errorKey] = (errorTypes[errorKey] || 0) + 1;
    });

    Object.entries(errorTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([error, count]) => {
        console.log(`${error}: ${count} 次`);
      });
  }

  console.log('\n🎉 压力测试完成！');

  return {
    config: TEST_CONFIG,
    metrics,
    endpointStats,
    userStats: testResults.userStats,
    errors: testResults.errors.slice(0, 10), // 只返回前10个错误
  };
}

// 执行测试
if (require.main === module) {
  runCoreStressTest()
    .then(results => {
      console.log('\n📋 测试已结束，结果已输出到控制台');
    })
    .catch(error => {
      console.error('❌ 压力测试执行失败:', error);
    });
}

module.exports = { runCoreStressTest };
