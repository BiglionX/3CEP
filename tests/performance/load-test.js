#!/usr/bin/env node

/**
 * API负载测试和性能基准测试脚本
 * 测试采购智能体API在高并发下的性能表现
 */

const http = require('http');
const https = require('https');
const os = require('os');

class LoadTest {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.testResults = {
      summary: {},
      detailed: [],
    };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
    };
  }

  async run() {
    console.log('🏋️ 开始API负载测试和性能基准测试...\n');
    console.log('='.repeat(70));

    try {
      // 测试1: 基准性能测试
      await this.baselinePerformanceTest();

      // 测试2: 并发负载测试
      await this.concurrentLoadTest();

      // 测试3: 压力测试
      await this.stressTest();

      // 测试4: 稳定性测试
      await this.stabilityTest();

      // 生成测试报告
      await this.generateReport();
    } catch (error) {
      console.error('❌ 负载测试执行失败:', error.message);
      process.exit(1);
    }
  }

  async baselinePerformanceTest() {
    console.log('\n📋 测试1: 基准性能测试');
    console.log('-'.repeat(50));

    const testEndpoints = [
      {
        path: '/api/procurement-intelligence/rate-limit-demo?supplierId=S001&action=profile',
        method: 'GET',
        name: '供应商画像查询',
      },
      {
        path: '/api/procurement-intelligence/rate-limit-demo?supplierId=S002&action=market',
        method: 'GET',
        name: '市场趋势分析',
      },
      {
        path: '/api/procurement-intelligence/rate-limit-demo',
        method: 'POST',
        name: '创建供应商画像',
        body: { action: 'create_profile', data: { supplierId: 'S003' } },
      },
    ];

    const baselineResults = [];

    for (const endpoint of testEndpoints) {
      console.log(`\n测试 ${endpoint.name}:`);

      const times = [];
      // 每个端点执行10次请求获取基准数据
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        try {
          const response = await this.makeRequest(
            endpoint.method,
            endpoint.path,
            endpoint.body
          );
          const responseTime = Date.now() - startTime;

          times.push(responseTime);
          this.metrics.totalRequests++;
          this.metrics.successfulRequests++;
          this.metrics.totalResponseTime += responseTime;
          this.metrics.responseTimes.push(responseTime);

          if (responseTime < this.metrics.minResponseTime)
            this.metrics.minResponseTime = responseTime;
          if (responseTime > this.metrics.maxResponseTime)
            this.metrics.maxResponseTime = responseTime;
        } catch (error) {
          this.metrics.totalRequests++;
          this.metrics.failedRequests++;
          console.log(`  ❌ 请求 ${i + 1}: 失败 - ${error.message}`);
        }

        // 短暂延迟避免过于密集
        await this.delay(100);
      }

      // 计算统计数据
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const sortedTimes = [...times].sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

      const result = {
        endpoint: endpoint.name,
        averageResponseTime: Math.round(avgTime),
        median: p50,
        p95: p95,
        p99: p99,
        successRate: `${((times.length / 10) * 100).toFixed(1)}%`,
        sampleSize: times.length,
      };

      baselineResults.push(result);
      console.log(`  📊 平均响应时间: ${Math.round(avgTime)}ms`);
      console.log(`  📊 P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
      console.log(`  📊 成功率: ${result.successRate}`);
    }

    this.testResults.detailed.push({
      testName: '基准性能测试',
      results: baselineResults,
      status: 'completed',
    });
  }

  async concurrentLoadTest() {
    console.log('\n📋 测试2: 并发负载测试');
    console.log('-'.repeat(50));

    const concurrencyLevels = [5, 10, 20, 50];
    const testResults = [];

    for (const concurrency of concurrencyLevels) {
      console.log(`\n测试并发数: ${concurrency}`);

      const startTime = Date.now();
      const promises = [];

      // 创建并发请求
      for (let i = 0; i < concurrency; i++) {
        const promise = this.makeRequest(
          'GET',
          `/api/procurement-intelligence/rate-limit-demo?supplierId=C${i}&action=profile`
        )
          .then(() => ({ success: true }))
          .catch(error => ({ success: false, error: error.message }));
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const throughput = (successful / (totalTime / 1000)).toFixed(2); // 请求/秒

      const result = {
        concurrency: concurrency,
        totalRequests: concurrency,
        successfulRequests: successful,
        failedRequests: failed,
        totalTime: totalTime,
        throughput: parseFloat(throughput),
        successRate: `${((successful / concurrency) * 100).toFixed(1)}%`,
      };

      testResults.push(result);
      console.log(`  ✅ 成功: ${successful}, 失败: ${failed}`);
      console.log(`  📊 吞吐量: ${throughput} req/s`);
      console.log(`  📊 成功率: ${result.successRate}`);

      // 等待一段时间让系统恢复
      await this.delay(2000);
    }

    this.testResults.detailed.push({
      testName: '并发负载测试',
      results: testResults,
      status: 'completed',
    });
  }

  async stressTest() {
    console.log('\n📋 测试3: 压力测试');
    console.log('-'.repeat(50));

    console.log('开始高压负载测试...');

    const startTime = Date.now();
    const duration = 30000; // 30秒测试
    const interval = 100; // 每100ms发送请求
    const requests = [];

    const testInterval = setInterval(() => {
      const promise = this.makeRequest(
        'GET',
        `/api/procurement-intelligence/rate-limit-demo?supplierId=STRESS${Date.now()}&action=profile`
      )
        .then(() => ({ success: true, timestamp: Date.now() }))
        .catch(error => ({
          success: false,
          error: error.message,
          timestamp: Date.now(),
        }));
      requests.push(promise);
    }, interval);

    // 等待测试完成
    await this.delay(duration);
    clearInterval(testInterval);

    // 等待所有请求完成
    const results = await Promise.all(requests);
    const endTime = Date.now();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = endTime - startTime;
    const totalRequests = results.length;
    const throughput = (totalRequests / (totalTime / 1000)).toFixed(2);

    console.log(`\n压力测试结果:`);
    console.log(`  总请求数: ${totalRequests}`);
    console.log(`  成功请求数: ${successful}`);
    console.log(`  失败请求数: ${failed}`);
    console.log(`  总测试时间: ${totalTime}ms`);
    console.log(`  平均吞吐量: ${throughput} req/s`);
    console.log(
      `  成功率: ${((successful / totalRequests) * 100).toFixed(1)}%`
    );

    // 分析响应时间分布
    const responseTimes = results
      .filter(r => r.success)
      .map(r => Date.now() - r.timestamp);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sortedTimes = [...responseTimes].sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

      console.log(`  平均响应时间: ${Math.round(avgResponseTime)}ms`);
      console.log(`  P50响应时间: ${p50}ms`);
      console.log(`  P95响应时间: ${p95}ms`);
      console.log(`  P99响应时间: ${p99}ms`);
    }

    this.testResults.detailed.push({
      testName: '压力测试',
      results: {
        totalRequests,
        successfulRequests: successful,
        failedRequests: failed,
        totalTime,
        throughput: parseFloat(throughput),
        successRate: `${((successful / totalRequests) * 100).toFixed(1)}%`,
      },
      status: 'completed',
    });
  }

  async stabilityTest() {
    console.log('\n📋 测试4: 稳定性测试');
    console.log('-'.repeat(50));

    console.log('开始长时间稳定性测试...');

    const testDuration = 60000; // 1分钟
    const startTime = Date.now();
    let requestCount = 0;
    let errorCount = 0;

    while (Date.now() - startTime < testDuration) {
      try {
        await this.makeRequest(
          'GET',
          `/api/procurement-intelligence/rate-limit-demo?supplierId=STABILITY${requestCount}&action=profile`
        );
        requestCount++;
      } catch (error) {
        errorCount++;
      }

      // 每秒发送10个请求
      await this.delay(100);
    }

    const totalTime = Date.now() - startTime;
    const successRate = (
      (requestCount / (requestCount + errorCount)) *
      100
    ).toFixed(1);

    console.log(`\n稳定性测试结果:`);
    console.log(`  总请求数: ${requestCount + errorCount}`);
    console.log(`  成功请求数: ${requestCount}`);
    console.log(`  错误请求数: ${errorCount}`);
    console.log(`  测试时长: ${totalTime}ms`);
    console.log(`  成功率: ${successRate}%`);

    this.testResults.detailed.push({
      testName: '稳定性测试',
      results: {
        totalRequests: requestCount + errorCount,
        successfulRequests: requestCount,
        failedRequests: errorCount,
        testDuration: totalTime,
        successRate: `${successRate}%`,
      },
      status: 'completed',
    });
  }

  async makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTestClient/1.0',
        },
      };

      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, body: data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    console.log(`\n${'='.repeat(70)}`);
    console.log('📈 API负载测试和性能基准测试报告');
    console.log('='.repeat(70));

    // 计算总体统计
    const totalRequests = this.metrics.totalRequests;
    const successfulRequests = this.metrics.successfulRequests;
    const failedRequests = this.metrics.failedRequests;
    const successRate = ((successfulRequests / totalRequests) * 100).toFixed(1);
    const avgResponseTime =
      this.metrics.totalRequests > 0
        ? (
            this.metrics.totalResponseTime / this.metrics.successfulRequests
          ).toFixed(2)
        : 'N/A';

    const sortedResponseTimes = [...this.metrics.responseTimes].sort(
      (a, b) => a - b
    );
    const p50 =
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
    const p95 =
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
    const p99 =
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;

    this.testResults.summary = {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: `${successRate}%`,
      averageResponseTime: `${avgResponseTime}ms`,
      minResponseTime:
        this.metrics.minResponseTime === Infinity
          ? 0
          : `${this.metrics.minResponseTime}ms`,
      maxResponseTime: `${this.metrics.maxResponseTime}ms`,
      p50ResponseTime: `${p50}ms`,
      p95ResponseTime: `${p95}ms`,
      p99ResponseTime: `${p99}ms`,
      testTimestamp: new Date().toISOString(),
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
      },
    };

    console.log(`\n📊 测试概要:`);
    console.log(`  总请求数: ${totalRequests}`);
    console.log(`  成功请求数: ${successfulRequests}`);
    console.log(`  失败请求数: ${failedRequests}`);
    console.log(`  成功率: ${successRate}%`);
    console.log(`  平均响应时间: ${avgResponseTime}ms`);
    console.log(`  响应时间分布: P50=${p50}ms, P95=${p95}ms, P99=${p99}ms`);

    console.log(`\n🖥️  系统信息:`);
    console.log(`  平台: ${os.platform()} ${os.arch()}`);
    console.log(`  CPU核心数: ${os.cpus().length}`);
    console.log(
      `  总内存: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`
    );

    // 输出详细测试结果
    console.log(`\n📋 详细测试结果:`);
    this.testResults.detailed.forEach((test, index) => {
      console.log(
        `  ${index + 1}. ${test.testName}: ${test.status.toUpperCase()}`
      );
      if (Array.isArray(test.results)) {
        test.results.forEach(result => {
          console.log(`     - ${JSON.stringify(result)}`);
        });
      } else {
        console.log(`     - ${JSON.stringify(test.results)}`);
      }
    });

    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(
      process.cwd(),
      'reports',
      'api-load-test-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📝 详细报告已保存: ${reportPath}`);

    // 性能评估
    console.log(`\n🎯 性能评估:`);
    const performanceRating = this.evaluatePerformance();
    console.log(`  综合评级: ${performanceRating.rating}`);
    console.log(`  评估说明: ${performanceRating.description}`);

    if (parseFloat(successRate) >= 95 && p95 <= 500) {
      console.log('\n🎉 负载测试通过！API性能表现良好');
      process.exit(0);
    } else {
      console.log('\n⚠️  性能有待优化，建议进行性能调优');
      process.exit(1);
    }
  }

  evaluatePerformance() {
    const successRate = parseFloat(this.testResults.summary.successRate);
    const avgResponseTime = parseFloat(
      this.testResults.summary.averageResponseTime
    );
    const p95Time = parseFloat(this.testResults.summary.p95ResponseTime);

    if (successRate >= 99 && p95Time <= 200) {
      return {
        rating: '优秀',
        description: 'API性能表现卓越，完全满足生产环境要求',
      };
    } else if (successRate >= 95 && p95Time <= 500) {
      return {
        rating: '良好',
        description: 'API性能表现良好，基本满足生产环境要求',
      };
    } else if (successRate >= 90 && p95Time <= 1000) {
      return {
        rating: '一般',
        description: 'API性能尚可，但需要进一步优化',
      };
    } else {
      return {
        rating: '较差',
        description: 'API性能不佳，急需优化改进',
      };
    }
  }
}

// 执行测试
if (require.main === module) {
  const tester = new LoadTest();
  tester.run().catch(error => {
    console.error('测试执行异常:', error);
    process.exit(1);
  });
}

module.exports = LoadTest;
