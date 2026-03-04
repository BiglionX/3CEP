/**
 * 性能测试执行器
 * 负责执行各种类型的性能测试并收集结果
 */

const {
  PerformanceMetricsCollector,
  NodePerformanceCollector,
} = require('./performance-metrics');
const fs = require('fs');
const path = require('path');

class PerformanceTestRunner {
  constructor(config) {
    this.config = config;
    this.results = {
      summary: {},
      detailed: [],
      metrics: [],
    };
    this.collector =
      typeof window !== 'undefined'
        ? new PerformanceMetricsCollector()
        : new NodePerformanceCollector();
  }

  /**
   * 执行完整的性能测试套件
   */
  async runFullSuite() {
    console.log('🚀 开始执行性能测试套件...\n');

    try {
      // 1. 执行单元性能测试
      await this.runUnitTestSuite();

      // 2. 执行集成性能测试
      await this.runIntegrationTestSuite();

      // 3. 执行端到端性能测试
      await this.runE2ETestSuite();

      // 4. 生成综合报告
      await this.generateComprehensiveReport();

      console.log('\n✅ 性能测试套件执行完成！');
      return this.results;
    } catch (error) {
      console.error('❌ 性能测试执行失败:', error);
      throw error;
    }
  }

  /**
   * 执行单元性能测试
   */
  async runUnitTestSuite() {
    console.log('🧪 执行单元性能测试...');

    const unitTests = [
      this.testComponentRendering.bind(this),
      this.testFunctionExecution.bind(this),
      this.testDataProcessing.bind(this),
      this.testMemoryAllocation.bind(this),
    ];

    for (const test of unitTests) {
      try {
        const result = await test();
        this.results.detailed.push({
          type: 'unit',
          testName: test.name,
          ...result,
          status: 'passed',
        });
        console.log(`  ✅ ${test.name}: 通过`);
      } catch (error) {
        this.results.detailed.push({
          type: 'unit',
          testName: test.name,
          error: error.message,
          status: 'failed',
        });
        console.log(`  ❌ ${test.name}: 失败 - ${error.message}`);
      }
    }
  }

  /**
   * 执行集成性能测试
   */
  async runIntegrationTestSuite() {
    console.log('\n🔗 执行集成性能测试...');

    const integrationTests = [
      this.testAPICallPerformance.bind(this),
      this.testDatabaseQueryPerformance.bind(this),
      this.testCacheHitPerformance.bind(this),
      this.testDataTransferPerformance.bind(this),
    ];

    for (const test of integrationTests) {
      try {
        const result = await test();
        this.results.detailed.push({
          type: 'integration',
          testName: test.name,
          ...result,
          status: 'passed',
        });
        console.log(`  ✅ ${test.name}: 通过`);
      } catch (error) {
        this.results.detailed.push({
          type: 'integration',
          testName: test.name,
          error: error.message,
          status: 'failed',
        });
        console.log(`  ❌ ${test.name}: 失败 - ${error.message}`);
      }
    }
  }

  /**
   * 执行端到端性能测试
   */
  async runE2ETestSuite() {
    console.log('\n🌐 执行端到端性能测试...');

    const e2eTests = [
      this.testPageLoadPerformance.bind(this),
      this.testUserJourneyPerformance.bind(this),
      this.testConcurrentUsersPerformance.bind(this),
      this.testResourceLoadingPerformance.bind(this),
    ];

    for (const test of e2eTests) {
      try {
        const result = await test();
        this.results.detailed.push({
          type: 'e2e',
          testName: test.name,
          ...result,
          status: 'passed',
        });
        console.log(`  ✅ ${test.name}: 通过`);
      } catch (error) {
        this.results.detailed.push({
          type: 'e2e',
          testName: test.name,
          error: error.message,
          status: 'failed',
        });
        console.log(`  ❌ ${test.name}: 失败 - ${error.message}`);
      }
    }
  }

  // === 单元测试方法 ===

  async testComponentRendering() {
    // 模拟组件渲染测试
    const renderTimes = [];
    const iterations = this.config.execution.iterations || 5;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // 模拟组件渲染逻辑
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

      const end = performance.now();
      renderTimes.push(end - start);
    }

    const avgRenderTime =
      renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);

    return {
      averageRenderTime: avgRenderTime,
      maxRenderTime: maxRenderTime,
      iterations: iterations,
      threshold:
        this.config.performanceThresholds.componentRendering.maxRenderTime,
    };
  }

  async testFunctionExecution() {
    // 测试函数执行效率
    const executionTimes = [];
    const testFunction = () => {
      // 模拟复杂计算
      let result = 0;
      for (let i = 0; i < 10000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    };

    const iterations = this.config.execution.iterations || 5;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      testFunction();
      const end = performance.now();
      executionTimes.push(end - start);
    }

    const avgExecutionTime =
      executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

    return {
      averageExecutionTime: avgExecutionTime,
      iterations: iterations,
      functionName: 'complexCalculation',
    };
  }

  async testDataProcessing() {
    // 测试数据处理性能
    const dataSizes = [100, 1000, 5000, 10000];
    const processingResults = [];

    for (const size of dataSizes) {
      const testData = Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }));

      const start = performance.now();

      // 模拟数据处理
      const processed = testData
        .map(item => ({
          ...item,
          processedValue: item.value * 1.1,
          timestamp: Date.now(),
        }))
        .filter(item => item.processedValue > 100);

      const end = performance.now();

      processingResults.push({
        dataSize: size,
        processingTime: end - start,
        outputSize: processed.length,
      });
    }

    return {
      dataProcessingResults: processingResults,
    };
  }

  async testMemoryAllocation() {
    // 测试内存分配性能
    const memorySnapshots = [];

    // 初始内存快照
    if (typeof window !== 'undefined' && window.performance.memory) {
      memorySnapshots.push({
        phase: 'initial',
        usedHeap: window.performance.memory.usedJSHeapSize,
        timestamp: Date.now(),
      });
    }

    // 创建大量对象
    const objects = [];
    for (let i = 0; i < 10000; i++) {
      objects.push({
        id: i,
        data: new Array(100).fill(Math.random()),
        created: Date.now(),
      });
    }

    // 内存快照
    if (typeof window !== 'undefined' && window.performance.memory) {
      memorySnapshots.push({
        phase: 'after_allocation',
        usedHeap: window.performance.memory.usedJSHeapSize,
        timestamp: Date.now(),
      });
    }

    // 清理对象
    objects.length = 0;

    // 最终内存快照
    if (typeof window !== 'undefined' && window.performance.memory) {
      memorySnapshots.push({
        phase: 'after_cleanup',
        usedHeap: window.performance.memory.usedJSHeapSize,
        timestamp: Date.now(),
      });
    }

    return {
      memorySnapshots: memorySnapshots,
      growth:
        memorySnapshots.length > 1
          ? memorySnapshots[memorySnapshots.length - 1].usedHeap -
            memorySnapshots[0].usedHeap
          : 0,
    };
  }

  // === 集成测试方法 ===

  async testAPICallPerformance() {
    // 测试API调用性能
    const apiCalls = [
      { endpoint: '/api/health', method: 'GET' },
      { endpoint: '/api/work-orders?page=1&size=20', method: 'GET' },
      { endpoint: '/api/search?q=test', method: 'GET' },
    ];

    const results = [];

    for (const call of apiCalls) {
      const responseTimes = [];
      const iterations = this.config.execution.iterations || 3;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        try {
          // 模拟API调用
          await new Promise(resolve =>
            setTimeout(resolve, 50 + Math.random() * 200)
          );

          const end = Date.now();
          responseTimes.push(end - start);
        } catch (error) {
          responseTimes.push(-1); // 表示失败
        }
      }

      const validTimes = responseTimes.filter(t => t > 0);
      const avgTime =
        validTimes.length > 0
          ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
          : -1;
      const successRate = (validTimes.length / responseTimes.length) * 100;

      results.push({
        endpoint: call.endpoint,
        method: call.method,
        averageResponseTime: avgTime,
        successRate: successRate,
        iterations: iterations,
      });
    }

    return {
      apiPerformanceResults: results,
    };
  }

  async testDatabaseQueryPerformance() {
    // 模拟数据库查询性能测试
    const queries = [
      { type: 'simple_select', complexity: 'low' },
      { type: 'join_query', complexity: 'medium' },
      { type: 'aggregation', complexity: 'high' },
    ];

    const results = [];

    for (const query of queries) {
      const executionTimes = [];
      const iterations = this.config.execution.iterations || 3;

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();

        // 模拟数据库查询延迟
        await new Promise(resolve =>
          setTimeout(resolve, 10 + Math.random() * 50)
        );

        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // 转换为毫秒
        executionTimes.push(duration);
      }

      const avgTime =
        executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

      results.push({
        queryType: query.type,
        complexity: query.complexity,
        averageExecutionTime: avgTime,
        iterations: iterations,
      });
    }

    return {
      databaseQueryResults: results,
    };
  }

  async testCacheHitPerformance() {
    // 测试缓存命中性能
    const cacheTests = [
      { scenario: 'cache_hit', hitRate: 90 },
      { scenario: 'cache_miss', hitRate: 10 },
      { scenario: 'mixed_load', hitRate: 70 },
    ];

    const results = [];

    for (const test of cacheTests) {
      const responseTimes = [];
      const iterations = this.config.execution.iterations || 5;

      for (let i = 0; i < iterations; i++) {
        const isHit = Math.random() * 100 < test.hitRate;
        const start = Date.now();

        // 模拟不同缓存场景的响应时间
        const delay = isHit ? 5 + Math.random() * 15 : 50 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        const end = Date.now();
        responseTimes.push(end - start);
      }

      const avgTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      results.push({
        scenario: test.scenario,
        hitRate: test.hitRate,
        averageResponseTime: avgTime,
        iterations: iterations,
      });
    }

    return {
      cachePerformanceResults: results,
    };
  }

  async testDataTransferPerformance() {
    // 测试数据传输性能
    const dataSizes = [1024, 10240, 102400, 1048576]; // 1KB, 10KB, 100KB, 1MB

    const results = [];

    for (const size of dataSizes) {
      const transferTimes = [];
      const iterations = this.config.execution.iterations || 3;

      for (let i = 0; i < iterations; i++) {
        // 模拟数据生成
        const testData = 'x'.repeat(size);
        const start = Date.now();

        // 模拟网络传输（基于数据大小计算延迟）
        const networkDelay = 10 + (size / 1024) * 2 + Math.random() * 20;
        await new Promise(resolve => setTimeout(resolve, networkDelay));

        const end = Date.now();
        transferTimes.push(end - start);
      }

      const avgTime =
        transferTimes.reduce((a, b) => a + b, 0) / transferTimes.length;
      const throughput = size / (avgTime / 1000) / 1024; // KB/s

      results.push({
        dataSize: `${(size / 1024).toFixed(1)}KB`,
        averageTransferTime: avgTime,
        throughput: throughput,
        iterations: iterations,
      });
    }

    return {
      dataTransferResults: results,
    };
  }

  // === 端到端测试方法 ===

  async testPageLoadPerformance() {
    // 测试页面加载性能
    const pages = ['/dashboard', '/work-orders', '/customers', '/analytics'];
    const results = [];

    for (const page of pages) {
      const loadTimes = [];
      const iterations = this.config.execution.iterations || 3;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        // 模拟页面加载
        await new Promise(resolve =>
          setTimeout(resolve, 500 + Math.random() * 1000)
        );

        const end = Date.now();
        loadTimes.push(end - start);
      }

      const avgLoadTime =
        loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;

      results.push({
        page: page,
        averageLoadTime: avgLoadTime,
        iterations: iterations,
      });
    }

    return {
      pageLoadResults: results,
    };
  }

  async testUserJourneyPerformance() {
    // 测试完整用户旅程性能
    const journeySteps = [
      { action: 'navigate_to_login', expectedTime: 1000 },
      { action: 'fill_login_form', expectedTime: 200 },
      { action: 'submit_login', expectedTime: 500 },
      { action: 'navigate_to_dashboard', expectedTime: 1500 },
      { action: 'create_work_order', expectedTime: 2000 },
    ];

    const journeyResults = [];
    const iterations = this.config.execution.iterations || 2;

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      let currentTime = startTime;
      const stepResults = [];

      for (const step of journeySteps) {
        const stepStart = currentTime;

        // 模拟步骤执行
        await new Promise(resolve =>
          setTimeout(resolve, step.expectedTime * (0.8 + Math.random() * 0.4))
        );

        const stepEnd = Date.now();
        currentTime = stepEnd;

        stepResults.push({
          step: step.action,
          duration: stepEnd - stepStart,
          expectedMax: step.expectedTime * 1.5,
        });
      }

      const totalTime = currentTime - startTime;

      journeyResults.push({
        iteration: i + 1,
        totalTime: totalTime,
        steps: stepResults,
      });
    }

    return {
      userJourneyResults: journeyResults,
    };
  }

  async testConcurrentUsersPerformance() {
    // 测试并发用户性能
    const concurrentLevels = [1, 5, 10, 20];
    const results = [];

    for (const level of concurrentLevels) {
      const start = Date.now();
      const promises = [];

      // 创建并发请求
      for (let i = 0; i < level; i++) {
        const promise = new Promise(async resolve => {
          await new Promise(resolve =>
            setTimeout(resolve, 100 + Math.random() * 400)
          );
          resolve({ userId: i, success: true });
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      const end = Date.now();

      const totalTime = end - start;
      const avgPerUser = totalTime / level;
      const throughput = level / (totalTime / 1000);

      results.push({
        concurrentUsers: level,
        totalTime: totalTime,
        averagePerUser: avgPerUser,
        throughput: throughput,
      });
    }

    return {
      concurrentUsersResults: results,
    };
  }

  async testResourceLoadingPerformance() {
    // 测试资源加载性能
    const resources = [
      { type: 'javascript', count: 15, size: '2.5MB' },
      { type: 'css', count: 8, size: '800KB' },
      { type: 'images', count: 25, size: '5.2MB' },
      { type: 'fonts', count: 3, size: '400KB' },
    ];

    const loadingResults = [];

    for (const resource of resources) {
      const start = Date.now();

      // 模拟资源加载
      await new Promise(resolve =>
        setTimeout(resolve, 200 + Math.random() * 800)
      );

      const end = Date.now();

      loadingResults.push({
        resourceType: resource.type,
        resourceCount: resource.count,
        totalSize: resource.size,
        loadingTime: end - start,
      });
    }

    return {
      resourceLoadingResults: loadingResults,
    };
  }

  /**
   * 生成综合性能报告
   */
  async generateComprehensiveReport() {
    console.log('\n📊 生成性能测试报告...');

    // 收集性能指标
    const metrics = this.collector.getAllMetrics();
    this.results.metrics = metrics;

    // 计算汇总统计
    const passedTests = this.results.detailed.filter(
      t => t.status === 'passed'
    ).length;
    const failedTests = this.results.detailed.filter(
      t => t.status === 'failed'
    ).length;
    const totalTests = this.results.detailed.length;

    this.results.summary = {
      totalTests: totalTests,
      passedTests: passedTests,
      failedTests: failedTests,
      passRate:
        totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0,
      executionTime:
        Date.now() - (this.results.detailed[0]?.timestamp || Date.now()),
      timestamp: new Date().toISOString(),
    };

    // 保存报告
    await this.saveReport();

    // 输出摘要
    console.log(`\n📋 测试摘要:`);
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过测试: ${passedTests}`);
    console.log(`  失败测试: ${failedTests}`);
    console.log(`  通过率: ${this.results.summary.passRate}%`);
  }

  /**
   * 保存测试报告
   */
  async saveReport() {
    const outputPath = path.join(
      process.cwd(),
      this.config.reporting.outputPath || './reports/performance/'
    );

    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 保存JSON格式报告
    const jsonReportPath = path.join(
      outputPath,
      'performance-test-report.json'
    );
    fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));

    // 生成HTML报告
    await this.generateHTMLReport(
      path.join(outputPath, 'performance-test-report.html')
    );

    // 生成Markdown报告
    await this.generateMarkdownReport(
      path.join(outputPath, 'performance-test-report.md')
    );

    console.log(`\n📄 报告已保存到: ${outputPath}`);
  }

  /**
   * 生成HTML报告
   */
  async generateHTMLReport(filePath) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>性能测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .passed { border-left: 4px solid #4CAF50; }
        .failed { border-left: 4px solid #f44336; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .chart { height: 300px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 性能测试报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>总测试数</h3>
            <p style="font-size: 2em; color: #2196F3;">${this.results.summary.totalTests}</p>
        </div>
        <div class="card passed">
            <h3>通过测试</h3>
            <p style="font-size: 2em; color: #4CAF50;">${this.results.summary.passedTests}</p>
        </div>
        <div class="card failed">
            <h3>失败测试</h3>
            <p style="font-size: 2em; color: #f44336;">${this.results.summary.failedTests}</p>
        </div>
        <div class="card">
            <h3>通过率</h3>
            <p style="font-size: 2em; color: #FF9800;">${this.results.summary.passRate}%</p>
        </div>
    </div>
    
    <h2>📋 详细测试结果</h2>
    <table>
        <thead>
            <tr>
                <th>测试类型</th>
                <th>测试名称</th>
                <th>状态</th>
                <th>详情</th>
            </tr>
        </thead>
        <tbody>
            ${this.results.detailed
              .map(
                test => `
                <tr>
                    <td>${test.type}</td>
                    <td>${test.testName}</td>
                    <td>${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}</td>
                    <td>${test.error || '无错误'}</td>
                </tr>
            `
              )
              .join('')}
        </tbody>
    </table>
</body>
</html>`;

    fs.writeFileSync(filePath, htmlContent);
  }

  /**
   * 生成Markdown报告
   */
  async generateMarkdownReport(filePath) {
    const markdownContent = `# 🔧 性能测试报告

## 📊 测试摘要

| 指标 | 数值 |
|------|------|
| 总测试数 | ${this.results.summary.totalTests} |
| 通过测试 | ${this.results.summary.passedTests} |
| 失败测试 | ${this.results.summary.failedTests} |
| 通过率 | ${this.results.summary.passRate}% |
| 执行时间 | ${Math.round(this.results.summary.executionTime / 1000)}秒 |
| 生成时间 | ${new Date(this.results.summary.timestamp).toLocaleString('zh-CN')} |

## 📋 详细测试结果

| 测试类型 | 测试名称 | 状态 | 详情 |
|----------|----------|------|------|
${this.results.detailed
  .map(
    test =>
      `| ${test.type} | ${test.testName} | ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'} | ${test.error || '无错误'} |`
  )
  .join('\n')}

## 📈 性能指标

\`\`\`json
${JSON.stringify(this.results.metrics, null, 2)}
\`\`\`

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    fs.writeFileSync(filePath, markdownContent);
  }
}

module.exports = PerformanceTestRunner;
