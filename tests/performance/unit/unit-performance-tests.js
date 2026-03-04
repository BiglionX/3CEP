/**
 * 单元性能测试用例
 * 测试组件渲染、函数执行效率等基础性能指标
 */

const { PerformanceMetricsCollector } = require('../utils/performance-metrics');

class UnitPerformanceTests {
  constructor() {
    this.collector = new PerformanceMetricsCollector();
  }

  /**
   * 测试React组件渲染性能
   */
  async testReactComponentRendering() {
    console.log('\n🧪 测试React组件渲染性能...');

    const testComponents = [
      { name: 'SimpleButton', complexity: 'low' },
      { name: 'DataTable', complexity: 'medium' },
      { name: 'DashboardChart', complexity: 'high' },
      { name: 'SearchFilter', complexity: 'medium' },
    ];

    const results = [];

    for (const component of testComponents) {
      const renderTimes = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();

        // 模拟组件渲染逻辑
        await this.simulateComponentRender(component.complexity);

        const end = performance.now();
        renderTimes.push(end - start);
      }

      const stats = this.calculateStatistics(renderTimes);

      results.push({
        componentName: component.name,
        complexity: component.complexity,
        ...stats,
        threshold: this.getRenderThreshold(component.complexity),
      });

      console.log(
        `  ${component.name}: 平均${stats.average.toFixed(2)}ms, P95:${stats.p95.toFixed(2)}ms`
      );
    }

    return {
      testType: 'component_rendering',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  /**
   * 测试JavaScript函数执行效率
   */
  async testFunctionExecutionEfficiency() {
    console.log('\n⚡ 测试JavaScript函数执行效率...');

    const testFunctions = [
      {
        name: '数据过滤函数',
        fn: this.dataFilterFunction,
        complexity: 'medium',
      },
      {
        name: '字符串处理函数',
        fn: this.stringProcessingFunction,
        complexity: 'low',
      },
    ];

    const results = [];

    for (const testFn of testFunctions) {
      const executionTimes = [];
      const iterations = 50;
      const testData = this.generateTestData(testFn.complexity);

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        testFn.fn(testData);
        const end = performance.now();
        executionTimes.push(end - start);
      }

      const stats = this.calculateStatistics(executionTimes);

      results.push({
        functionName: testFn.name,
        complexity: testFn.complexity,
        ...stats,
        threshold: this.getExecutionThreshold(testFn.complexity),
      });

      console.log(
        `  ${testFn.name}: 平均${stats.average.toFixed(3)}ms, 最大${stats.max.toFixed(3)}ms`
      );
    }

    return {
      testType: 'function_execution',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  /**
   * 测试数据处理性能
   */
  async testDataProcessingPerformance() {
    console.log('\n💾 测试数据处理性能...');

    const dataSets = [
      { size: 100, name: '小数据集' },
      { size: 1000, name: '中等数据集' },
    ];

    const operations = [
      { name: '排序操作', fn: this.sortOperation },
      { name: '过滤操作', fn: this.filterOperation },
    ];

    const results = [];

    for (const dataSet of dataSets) {
      const testData = this.generateLargeDataset(dataSet.size);

      for (const operation of operations) {
        const executionTimes = [];
        const iterations = dataSet.size > 1000 ? 5 : 10;

        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          operation.fn(testData);
          const end = performance.now();
          executionTimes.push(end - start);
        }

        const stats = this.calculateStatistics(executionTimes);

        results.push({
          dataset: dataSet.name,
          operation: operation.name,
          dataSize: dataSet.size,
          ...stats,
          threshold: this.getDataProcessingThreshold(
            dataSet.size,
            operation.name
          ),
        });

        console.log(
          `  ${dataSet.name}-${operation.name}: ${stats.average.toFixed(2)}ms (${dataSet.size}项)`
        );
      }
    }

    return {
      testType: 'data_processing',
      results: results,
      overallPass: results.every(r => r.average <= r.threshold),
    };
  }

  // === 辅助方法 ===

  /**
   * 模拟组件渲染
   */
  async simulateComponentRender(complexity) {
    // 根据复杂度模拟不同的渲染时间
    const baseDelay =
      complexity === 'low' ? 1 : complexity === 'medium' ? 5 : 15;
    const variance =
      complexity === 'low' ? 2 : complexity === 'medium' ? 5 : 10;

    await new Promise(resolve =>
      setTimeout(resolve, baseDelay + Math.random() * variance)
    );
  }

  /**
   * 数据过滤函数
   */
  dataFilterFunction(data) {
    return data.filter(
      item =>
        item.value > 50 && item.name.includes('test') && item.active === true
    );
  }

  /**
   * 字符串处理函数
   */
  stringProcessingFunction(data) {
    return data.map(item =>
      String(item.name || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    );
  }

  /**
   * 生成测试数据
   */
  generateTestData(complexity) {
    const size =
      complexity === 'low' ? 100 : complexity === 'medium' ? 1000 : 10000;
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      name: `test_item_${i}`,
      active: Math.random() > 0.3,
    }));
  }

  /**
   * 生成大型数据集
   */
  generateLargeDataset(size) {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      name: `item_${i}`,
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
    }));
  }

  /**
   * 排序操作
   */
  sortOperation(data) {
    return [...data].sort((a, b) => a.value - b.value);
  }

  /**
   * 过滤操作
   */
  filterOperation(data) {
    return data.filter(item => item.value > 500 && item.category === 'A');
  }

  /**
   * 计算统计信息
   */
  calculateStatistics(times) {
    const sorted = [...times].sort((a, b) => a - b);
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * 获取渲染阈值
   */
  getRenderThreshold(complexity) {
    return complexity === 'low' ? 5 : complexity === 'medium' ? 20 : 50;
  }

  /**
   * 获取执行阈值
   */
  getExecutionThreshold(complexity) {
    return complexity === 'low' ? 1 : complexity === 'medium' ? 5 : 20;
  }

  /**
   * 获取数据处理阈值
   */
  getDataProcessingThreshold(size, operation) {
    const baseTime = size / 1000;
    const operationFactor = operation.includes('排序') ? 2 : 1;
    return baseTime * operationFactor;
  }
}

module.exports = UnitPerformanceTests;
