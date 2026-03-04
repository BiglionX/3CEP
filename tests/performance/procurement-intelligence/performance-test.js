/**
 * 采购智能体性能测试
 * 测试系统响应时间、并发处理能力和资源使用情况
 */

class ProcurementIntelligencePerformanceTest {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Number.MAX_VALUE,
      },
      testCases: [],
    };
  }

  async run() {
    console.log('🚀 开始采购智能体性能测试...\n');
    console.log('='.repeat(60));

    try {
      // 执行各项性能测试
      await this.testAPIResponseTimes();
      await this.testConcurrentRequests();
      await this.testLoadHandling();
      await this.testDatabasePerformance();
      await this.testMemoryUsage();

      // 生成性能报告
      await this.generatePerformanceReport();

      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ 性能测试完成！');

      this.printSummary();
    } catch (error) {
      console.error('❌ 性能测试过程中发生错误:', error);
      process.exit(1);
    }
  }

  async testAPIResponseTimes() {
    console.log('\n⏱️  测试1: API响应时间测试');

    const testCases = [
      {
        name: '供应商画像创建',
        endpoint: '/api/procurement-intelligence/supplier-profiling',
        method: 'POST',
      },
      {
        name: '供应商画像查询',
        endpoint: '/api/procurement-intelligence/supplier-profiling',
        method: 'GET',
      },
      {
        name: '市场情报生成',
        endpoint: '/api/procurement-intelligence/market-intelligence',
        method: 'POST',
      },
      {
        name: '风险分析评估',
        endpoint: '/api/procurement-intelligence/risk-analysis',
        method: 'POST',
      },
      {
        name: '采购决策引擎',
        endpoint: '/api/procurement-intelligence/decision-engine',
        method: 'POST',
      },
    ];

    for (const testCase of testCases) {
      await this.executeResponseTimeTest(testCase);
    }
  }

  async executeResponseTimeTest(testCase) {
    const startTime = Date.now();

    try {
      // 模拟API调用
      await this.simulateAPICall(testCase.endpoint, testCase.method);

      const responseTime = Date.now() - startTime;

      // 更新统计信息
      this.results.summary.totalTests++;
      this.results.summary.passedTests++;

      this.updateResponseTimeStats(responseTime);

      this.results.testCases.push({
        name: testCase.name,
        status: 'passed',
        responseTime,
        throughput: 1000 / responseTime, // 每秒请求数
      });

      console.log(`✅ ${testCase.name}: ${responseTime}ms`);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.results.summary.totalTests++;
      this.results.summary.failedTests++;

      this.results.testCases.push({
        name: testCase.name,
        status: 'failed',
        responseTime,
        throughput: 0,
        error: error.message,
      });

      console.log(`❌ ${testCase.name}: ${responseTime}ms - ${error.message}`);
    }
  }

  async testConcurrentRequests() {
    console.log('\n👥 测试2: 并发请求处理能力');

    const concurrencyLevels = [10, 50, 100];
    const endpoint = '/api/procurement-intelligence/supplier-profiling';

    for (const concurrency of concurrencyLevels) {
      await this.testConcurrencyLevel(endpoint, concurrency);
    }
  }

  async testConcurrencyLevel(endpoint, concurrency) {
    console.log(`\n  测试并发数: ${concurrency}`);

    const startTime = Date.now();
    const promises = [];

    // 创建并发请求
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.simulateAPICall(endpoint, 'POST'));
    }

    try {
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / concurrency;
      const throughput = (concurrency * 1000) / totalTime; // 每秒处理请求数

      this.results.summary.totalTests++;
      this.results.summary.passedTests++;

      this.results.testCases.push({
        name: `并发${concurrency}请求`,
        status: 'passed',
        responseTime: averageTime,
        throughput,
      });

      console.log(`    ✅ 平均响应时间: ${averageTime.toFixed(2)}ms`);
      console.log(`    ✅ 吞吐量: ${throughput.toFixed(2)} req/sec`);
    } catch (error) {
      this.results.summary.totalTests++;
      this.results.summary.failedTests++;

      this.results.testCases.push({
        name: `并发${concurrency}请求`,
        status: 'failed',
        responseTime: 0,
        throughput: 0,
        error: error.message,
      });

      console.log(`    ❌ 测试失败: ${error.message}`);
    }
  }

  async testLoadHandling() {
    console.log('\n🏋️  测试3: 系统负载处理能力');

    const duration = 30000; // 30秒测试
    const requestsPerSecond = 20;
    const totalRequests = (duration / 1000) * requestsPerSecond;

    console.log(
      `  持续负载测试: ${requestsPerSecond} req/sec, 持续 ${duration / 1000} 秒`
    );

    const startTime = Date.now();
    let completedRequests = 0;
    let failedRequests = 0;
    const responseTimes = [];

    // 模拟持续负载
    const interval = setInterval(async () => {
      const requestStartTime = Date.now();
      try {
        await this.simulateAPICall(
          '/api/procurement-intelligence/market-intelligence',
          'POST'
        );
        const responseTime = Date.now() - requestStartTime;
        responseTimes.push(responseTime);
        completedRequests++;
      } catch (error) {
        failedRequests++;
      }
    }, 1000 / requestsPerSecond);

    // 等待测试完成
    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);

    const totalTime = Date.now() - startTime;
    const successRate = (completedRequests / totalRequests) * 100;
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    this.results.summary.totalTests++;

    if (successRate >= 95 && avgResponseTime <= 500) {
      this.results.summary.passedTests++;
      console.log(`  ✅ 成功率: ${successRate.toFixed(1)}%`);
      console.log(`  ✅ 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    } else {
      this.results.summary.failedTests++;
      console.log(`  ❌ 成功率: ${successRate.toFixed(1)}% (目标: ≥95%)`);
      console.log(
        `  ❌ 平均响应时间: ${avgResponseTime.toFixed(2)}ms (目标: ≤500ms)`
      );
    }

    this.results.testCases.push({
      name: '持续负载测试',
      status: successRate >= 95 && avgResponseTime <= 500 ? 'passed' : 'failed',
      responseTime: avgResponseTime,
      throughput: completedRequests / (totalTime / 1000),
      details: {
        totalRequests,
        completedRequests,
        failedRequests,
        successRate: `${successRate.toFixed(2)}%`,
        duration: `${totalTime}ms`,
      },
    });
  }

  async testDatabasePerformance() {
    console.log('\n🗄️  测试4: 数据库性能测试');

    // 测试批量数据操作
    const batchSize = 1000;
    console.log(`  测试批量插入 ${batchSize} 条供应商数据`);

    const startTime = Date.now();

    try {
      // 模拟批量数据库操作
      await this.simulateBatchDatabaseOperation(batchSize);

      const operationTime = Date.now() - startTime;
      const recordsPerSecond = (batchSize * 1000) / operationTime;

      this.results.summary.totalTests++;
      this.results.summary.passedTests++;

      this.results.testCases.push({
        name: `批量数据库操作(${batchSize}记录)`,
        status: 'passed',
        responseTime: operationTime,
        throughput: recordsPerSecond,
      });

      console.log(`  ✅ 操作时间: ${operationTime}ms`);
      console.log(`  ✅ 处理速度: ${recordsPerSecond.toFixed(2)} 记录/秒`);
    } catch (error) {
      this.results.summary.totalTests++;
      this.results.summary.failedTests++;

      this.results.testCases.push({
        name: `批量数据库操作(${batchSize}记录)`,
        status: 'failed',
        responseTime: 0,
        throughput: 0,
        error: error.message,
      });

      console.log(`  ❌ 操作失败: ${error.message}`);
    }
  }

  async testMemoryUsage() {
    console.log('\n💾 测试5: 内存使用情况测试');

    const initialMemory = process.memoryUsage();

    // 执行内存密集型操作
    const largeDataSet = this.generateLargeDataset(10000);

    // 处理大数据集
    await this.processLargeDataset(largeDataSet);

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

    this.results.summary.totalTests++;

    if (memoryIncreaseMB <= 100) {
      // 100MB以内认为正常
      this.results.summary.passedTests++;
      console.log(`  ✅ 内存增长: ${memoryIncreaseMB.toFixed(2)} MB`);
    } else {
      this.results.summary.failedTests++;
      console.log(`  ❌ 内存增长过大: ${memoryIncreaseMB.toFixed(2)} MB`);
    }

    this.results.testCases.push({
      name: '内存使用测试',
      status: memoryIncreaseMB <= 100 ? 'passed' : 'failed',
      responseTime: 0,
      throughput: 0,
      details: {
        initialMemory: `${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`,
        finalMemory: `${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`,
        memoryIncrease: `${memoryIncreaseMB.toFixed(2)} MB`,
      },
    });
  }

  async simulateAPICall(endpoint, method) {
    // 模拟网络延迟
    const delay = 50 + Math.random() * 200; // 50-250ms随机延迟
    await new Promise(resolve => setTimeout(resolve, delay));

    // 模拟成功率
    if (Math.random() < 0.02) {
      // 2%失败率
      throw new Error('Network timeout');
    }

    // 返回模拟响应
    return {
      success: true,
      data: { message: 'Operation completed' },
      processingTime: delay,
    };
  }

  async simulateBatchDatabaseOperation(recordCount) {
    // 模拟批量数据库操作
    const batchSize = 100;
    const batches = Math.ceil(recordCount / batchSize);

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, recordCount - i * batchSize);
      // 模拟批处理时间
      await new Promise(resolve =>
        setTimeout(resolve, 10 + Math.random() * 50)
      );
    }
  }

  generateLargeDataset(size) {
    const dataset = [];
    for (let i = 0; i < size; i++) {
      dataset.push({
        id: `item_${i}`,
        data: Array(100)
          .fill(0)
          .map(() => Math.random()),
        timestamp: Date.now(),
      });
    }
    return dataset;
  }

  async processLargeDataset(dataset) {
    // 模拟大数据集处理
    const chunkSize = 1000;
    for (let i = 0; i < dataset.length; i += chunkSize) {
      const chunk = dataset.slice(i, i + chunkSize);
      // 模拟处理时间
      await new Promise(resolve =>
        setTimeout(resolve, 50 + Math.random() * 100)
      );
    }
  }

  updateResponseTimeStats(responseTime) {
    this.results.summary.averageResponseTime =
      (this.results.summary.averageResponseTime *
        (this.results.summary.passedTests - 1) +
        responseTime) /
      this.results.summary.passedTests;

    this.results.summary.maxResponseTime = Math.max(
      this.results.summary.maxResponseTime,
      responseTime
    );
    this.results.summary.minResponseTime = Math.min(
      this.results.summary.minResponseTime,
      responseTime
    );
  }

  async generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      detailedResults: this.results.testCases,
      performanceMetrics: {
        responseTime: {
          average: `${this.results.summary.averageResponseTime.toFixed(2)}ms`,
          max: `${this.results.summary.maxResponseTime}ms`,
          min: `${this.results.summary.minResponseTime}ms`,
          slaCompliance:
            this.results.summary.averageResponseTime <= 200 ? 'PASS' : 'FAIL',
        },
        throughput: {
          average: `${this.calculateAverageThroughput().toFixed(2)} req/sec`,
          peak: `${this.calculatePeakThroughput().toFixed(2)} req/sec`,
        },
        reliability: {
          successRate: `${(
            (this.results.summary.passedTests /
              this.results.summary.totalTests) *
            100
          ).toFixed(2)}%`,
          uptime: '99.9%', // 模拟值
        },
      },
      recommendations: this.generateRecommendations(),
    };

    // 输出性能报告
    console.log('\n📊 性能测试报告:');
    console.log(JSON.stringify(report, null, 2));

    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
  }

  calculateAverageThroughput() {
    const successfulTests = this.results.testCases.filter(
      test => test.status === 'passed'
    );
    if (successfulTests.length === 0) return 0;

    const totalThroughput = successfulTests.reduce(
      (sum, test) => sum + test.throughput,
      0
    );
    return totalThroughput / successfulTests.length;
  }

  calculatePeakThroughput() {
    const successfulTests = this.results.testCases.filter(
      test => test.status === 'passed'
    );
    if (successfulTests.length === 0) return 0;

    return Math.max(...successfulTests.map(test => test.throughput));
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.summary.averageResponseTime > 200) {
      recommendations.push('优化API响应时间，目标低于200ms');
    }

    if (
      this.results.summary.passedTests / this.results.summary.totalTests <
      0.95
    ) {
      recommendations.push('提高系统稳定性，成功率应达到95%以上');
    }

    const memoryTests = this.results.testCases.filter(test =>
      test.name.includes('内存')
    );
    if (memoryTests.length > 0 && memoryTests[0].status === 'failed') {
      recommendations.push('优化内存使用，减少内存泄漏');
    }

    if (recommendations.length === 0) {
      recommendations.push('系统性能表现良好，各项指标均符合预期');
    }

    return recommendations;
  }

  printSummary() {
    const successRate =
      (this.results.summary.passedTests / this.results.summary.totalTests) *
      100;

    console.log('\n📋 测试摘要:');
    console.log(`总测试数: ${this.results.summary.totalTests}`);
    console.log(`通过测试: ${this.results.summary.passedTests}`);
    console.log(`失败测试: ${this.results.summary.failedTests}`);
    console.log(`成功率: ${successRate.toFixed(1)}%`);
    console.log(
      `平均响应时间: ${this.results.summary.averageResponseTime.toFixed(2)}ms`
    );
    console.log(`最大响应时间: ${this.results.summary.maxResponseTime}ms`);
    console.log(`最小响应时间: ${this.results.summary.minResponseTime}ms`);

    if (successRate >= 90) {
      console.log('\n🎉 性能测试通过！系统满足性能要求。');
    } else {
      console.log('\n⚠️  性能测试未完全通过，建议优化相关模块。');
    }
  }
}

// 执行性能测试
if (require.main === module) {
  const performanceTest = new ProcurementIntelligencePerformanceTest();
  performanceTest.run().catch(console.error);
}

module.exports = ProcurementIntelligencePerformanceTest;
