/**
 * 集成性能测试用例
 * 测试API调用、数据流、缓存等集成层面的性能
 */

const { NodePerformanceCollector } = require('../utils/performance-metrics');

class IntegrationPerformanceTests {
  constructor() {
    this.collector = new NodePerformanceCollector();
    this.apiBaseURL = 'http://localhost:3001/api';
  }

  /**
   * 测试API调用性能
   */
  async testAPICallPerformance() {
    console.log('\n🔌 测试API调用性能...');

    const apiEndpoints = [
      { path: '/health', method: 'GET', name: '健康检查' },
      { path: '/work-orders?page=1&size=20', method: 'GET', name: '工单列表' },
      { path: '/search?q=test', method: 'GET', name: '搜索接口' },
      { path: '/dashboard/stats', method: 'GET', name: '仪表板统计' },
    ];

    const results = [];

    for (const endpoint of apiEndpoints) {
      const responseTimes = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        try {
          // 模拟API调用
          await this.simulateAPICall(endpoint.path, endpoint.method);
          const end = Date.now();
          responseTimes.push(end - start);
        } catch (error) {
          responseTimes.push(-1); // 表示失败
        }
      }

      const validTimes = responseTimes.filter(t => t > 0);
      const stats = this.calculateStatistics(validTimes);
      const successRate = (validTimes.length / responseTimes.length) * 100;

      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        ...stats,
        successRate: successRate,
        iterations: iterations,
        threshold: this.getAPIThreshold(endpoint.name),
      });

      console.log(
        `  ${endpoint.name}: 平均${stats.average?.toFixed(2) || 'N/A'}ms, 成功率${successRate.toFixed(1)}%`
      );
    }

    return {
      testType: 'api_performance',
      results: results,
      overallPass: results.every(
        r => r.average <= r.threshold && r.successRate >= 95
      ),
    };
  }

  /**
   * 测试数据库查询性能
   */
  async testDatabaseQueryPerformance() {
    console.log('\n🗄️ 测试数据库查询性能...');

    const queries = [
      { type: 'simple_select', name: '简单查询', complexity: 'low' },
      { type: 'join_query', name: '连接查询', complexity: 'medium' },
      { type: 'aggregation', name: '聚合查询', complexity: 'high' },
    ];

    const results = [];

    for (const query of queries) {
      const executionTimes = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();

        // 模拟数据库查询
        await this.simulateDatabaseQuery(query.type);

        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // 转换为毫秒
        executionTimes.push(duration);
      }

      const stats = this.calculateStatistics(executionTimes);

      results.push({
        queryType: query.name,
        complexity: query.complexity,
        ...stats,
        iterations: iterations,
        threshold: this.getDBQueryThreshold(query.complexity),
      });

      console.log(`  ${query.name}: 平均${stats.average.toFixed(2)}ms`);
    }

    return {
      testType: 'database_performance',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  /**
   * 测试缓存性能
   */
  async testCachePerformance() {
    console.log('\nキャッシング 测试缓存性能...');

    const cacheScenarios = [
      { type: 'memory_cache', name: '内存缓存', hitRate: 90 },
      { type: 'redis_cache', name: 'Redis缓存', hitRate: 85 },
      { type: 'cdn_cache', name: 'CDN缓存', hitRate: 95 },
    ];

    const results = [];

    for (const scenario of cacheScenarios) {
      const responseTimes = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const isHit = Math.random() * 100 < scenario.hitRate;
        const start = Date.now();

        // 模拟缓存读取
        await this.simulateCacheRead(scenario.type, isHit);

        const end = Date.now();
        responseTimes.push(end - start);
      }

      const stats = this.calculateStatistics(responseTimes);

      results.push({
        cacheType: scenario.name,
        hitRate: scenario.hitRate,
        ...stats,
        iterations: iterations,
        threshold: this.getCacheThreshold(scenario.type),
      });

      console.log(
        `  ${scenario.name}: 平均${stats.average.toFixed(2)}ms (命中率${scenario.hitRate}%)`
      );
    }

    return {
      testType: 'cache_performance',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  /**
   * 测试数据流性能
   */
  async testDataFlowPerformance() {
    console.log('\n🔄 测试数据流性能...');

    const dataFlows = [
      { type: 'streaming', name: '流式数据处理', dataSize: '1MB' },
      { type: 'batch', name: '批处理', dataSize: '5MB' },
      { type: 'realtime', name: '实时数据同步', dataSize: '100KB' },
    ];

    const results = [];

    for (const flow of dataFlows) {
      const processingTimes = [];
      const iterations = 3;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        // 模拟数据流处理
        await this.simulateDataFlow(flow.type, flow.dataSize);

        const end = Date.now();
        processingTimes.push(end - start);
      }

      const stats = this.calculateStatistics(processingTimes);
      const throughput = this.calculateThroughput(flow.dataSize, stats.average);

      results.push({
        flowType: flow.name,
        dataSize: flow.dataSize,
        ...stats,
        throughput: throughput,
        iterations: iterations,
        threshold: this.getDataFlowThreshold(flow.type),
      });

      console.log(
        `  ${flow.name}: 平均${stats.average.toFixed(2)}ms, 吞吐量${throughput.toFixed(2)}MB/s`
      );
    }

    return {
      testType: 'data_flow_performance',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  /**
   * 测试微服务间通信性能
   */
  async testMicroserviceCommunication() {
    console.log('\n📡 测试微服务间通信性能...');

    const services = [
      { name: '用户服务', endpoint: '/users' },
      { name: '订单服务', endpoint: '/orders' },
      { name: '库存服务', endpoint: '/inventory' },
    ];

    const results = [];

    for (const service of services) {
      const communicationTimes = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        // 模拟服务间调用
        await this.simulateServiceCall(service.endpoint);

        const end = Date.now();
        communicationTimes.push(end - start);
      }

      const stats = this.calculateStatistics(communicationTimes);

      results.push({
        serviceName: service.name,
        endpoint: service.endpoint,
        ...stats,
        iterations: iterations,
        threshold: 200, // 200ms阈值
      });

      console.log(`  ${service.name}: 平均${stats.average.toFixed(2)}ms`);
    }

    return {
      testType: 'microservice_communication',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  // === 模拟方法 ===

  /**
   * 模拟API调用
   */
  async simulateAPICall(path, method) {
    // 模拟网络延迟和处理时间
    const networkDelay = 20 + Math.random() * 80;
    const processingTime = path.includes('health')
      ? 5
      : 50 + Math.random() * 100;

    await new Promise(resolve =>
      setTimeout(resolve, networkDelay + processingTime)
    );

    // 模拟95%的成功率
    if (Math.random() < 0.05) {
      throw new Error('API调用失败');
    }
  }

  /**
   * 模拟数据库查询
   */
  async simulateDatabaseQuery(queryType) {
    const baseTime =
      queryType === 'simple_select'
        ? 10
        : queryType === 'join_query'
          ? 50
          : queryType === 'aggregation'
            ? 100
            : 30;

    const variance = baseTime * 0.3;
    const actualTime = baseTime + (Math.random() * variance * 2 - variance);

    await new Promise(resolve => setTimeout(resolve, actualTime));
  }

  /**
   * 模拟缓存读取
   */
  async simulateCacheRead(cacheType, isHit) {
    let responseTime;

    if (isHit) {
      // 缓存命中
      responseTime =
        cacheType === 'memory_cache'
          ? 1 + Math.random() * 4
          : cacheType === 'redis_cache'
            ? 5 + Math.random() * 10
            : cacheType === 'cdn_cache'
              ? 2 + Math.random() * 8
              : 5;
    } else {
      // 缓存未命中，需要回源
      responseTime =
        cacheType === 'memory_cache'
          ? 20 + Math.random() * 30
          : cacheType === 'redis_cache'
            ? 50 + Math.random() * 100
            : cacheType === 'cdn_cache'
              ? 100 + Math.random() * 200
              : 50;
    }

    await new Promise(resolve => setTimeout(resolve, responseTime));
  }

  /**
   * 模拟数据流处理
   */
  async simulateDataFlow(flowType, dataSize) {
    const sizeInMB = parseFloat(dataSize);
    let processingTime;

    if (flowType === 'streaming') {
      processingTime = sizeInMB * 50 + Math.random() * 20; // 50ms/MB
    } else if (flowType === 'batch') {
      processingTime = sizeInMB * 30 + Math.random() * 50; // 30ms/MB
    } else {
      processingTime = sizeInMB * 100 + Math.random() * 30; // 100ms/MB
    }

    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  /**
   * 模拟服务调用
   */
  async simulateServiceCall(endpoint) {
    const baseTime = 50 + Math.random() * 100;
    const networkOverhead = 20 + Math.random() * 30;

    await new Promise(resolve =>
      setTimeout(resolve, baseTime + networkOverhead)
    );
  }

  // === 计算方法 ===

  /**
   * 计算统计信息
   */
  calculateStatistics(times) {
    if (times.length === 0) {
      return { average: 0, min: 0, max: 0, median: 0 };
    }

    const sorted = [...times].sort((a, b) => a - b);
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: sorted[Math.floor(sorted.length / 2)],
    };
  }

  /**
   * 计算吞吐量
   */
  calculateThroughput(dataSize, timeMs) {
    const sizeInMB = parseFloat(dataSize);
    const timeInSeconds = timeMs / 1000;
    return sizeInMB / timeInSeconds;
  }

  /**
   * 获取API阈值
   */
  getAPIThreshold(endpointName) {
    return endpointName.includes('健康') ? 100 : 500;
  }

  /**
   * 获取数据库查询阈值
   */
  getDBQueryThreshold(complexity) {
    return complexity === 'low' ? 50 : complexity === 'medium' ? 200 : 500;
  }

  /**
   * 获取缓存阈值
   */
  getCacheThreshold(cacheType) {
    return cacheType.includes('memory')
      ? 10
      : cacheType.includes('redis')
        ? 50
        : 100;
  }

  /**
   * 获取数据流阈值
   */
  getDataFlowThreshold(flowType) {
    return flowType === 'streaming' ? 100 : flowType === 'batch' ? 300 : 50;
  }
}

module.exports = IntegrationPerformanceTests;
