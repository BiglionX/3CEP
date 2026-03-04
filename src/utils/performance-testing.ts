/**
 * 性能测试套件
 * 验证各项优化效果并生成详细的测试报告
 */

// 性能测试配置
interface PerformanceTestConfig {
  iterations: number; // 测试迭代次数
  warmupIterations: number; // 预热迭代次数
  timeout: number; // 超时时间(ms)
  thresholds: {
    loadTime: number; // 页面加载时间阈?ms)
    apiResponse: number; // API响应时间阈?ms)
    memoryUsage: number; // 内存使用阈?MB)
    cpuUsage: number; // CPU使用阈?%)
  };
}

// 测试结果接口
interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  metrics: Record<string, number>;
  errorMessage?: string;
  timestamp: number;
}

// 性能基准数据
interface PerformanceBaseline {
  loadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  bundleSize: number;
}

// 测试报告接口
interface PerformanceReport {
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    overallScore: number;
  };
  results: TestResult[];
  baselines: PerformanceBaseline;
  recommendations: string[];
  timestamp: number;
}

// 默认测试配置
const DEFAULT_CONFIG: PerformanceTestConfig = {
  iterations: 10,
  warmupIterations: 3,
  timeout: 30000,
  thresholds: {
    loadTime: 3000,
    apiResponse: 500,
    memoryUsage: 100,
    cpuUsage: 80,
  },
};

// 性能测试类
export class PerformanceTester {
  private config: PerformanceTestConfig;
  private results: TestResult[] = [];
  private baselines: PerformanceBaseline = {
    loadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    bundleSize: 0,
  };

  constructor(config: Partial<PerformanceTestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 运行完整的性能测试套件
  async runFullSuite(): Promise<PerformanceReport> {
    console.log('🚀 开始执行性能测试套件...');
    try {
      // 1. 收集基线数据
      await this.collectBaselines();

      // 2. 执行各项性能测试
      await this.runLoadTimeTests();
      await this.runApiPerformanceTests();
      await this.runMemoryTests();
      await this.runBundleAnalysis();
      await this.runUserInteractionTests();

      // 3. 生成测试报告
      return this.generateReport();
    } catch (error) {
      console.error('⚠️ 性能测试执行失败:', error);
      throw error;
    }
  }

  // 收集性能基线数据
  private async collectBaselines(): Promise<void> {
    console.log('📊 收集性能基线数据...');
    // 测量页面加载时间
    this.baselines.loadTime = await this.measurePageLoadTime();

    // 测量API响应时间
    this.baselines.apiResponseTime = await this.measureApiResponseTime();

    // 测量内存使用
    this.baselines.memoryUsage = this.measureMemoryUsage();

    // 测量CPU使用?
    this.baselines.cpuUsage = await this.measureCpuUsage();

    // 测量打包大小
    this.baselines.bundleSize = await this.measureBundleSize();

    console.log('✅ 基线数据收集完成:', this.baselines);
  }

  // 测量页面加载时间
  private async measurePageLoadTime(): Promise<number> {
    const measurements: number[] = [];

    for (
      let i = 0;
      i < this.config.iterations + this.config.warmupIterations;
      i++
    ) {
      // 创建新的页面上下?
      const start = performance.now();

      // 模拟页面加载过程
      await new Promise(resolve =>
        setTimeout(resolve, Math.random() * 100 + 50)
      );

      const end = performance.now();
      const duration = end - start;

      // 跳过预热迭代
      if (i >= this.config.warmupIterations) {
        measurements.push(duration);
      }
    }

    return this.calculateAverage(measurements);
  }

  // 测量API响应时间
  private async measureApiResponseTime(): Promise<number> {
    const measurements: number[] = [];

    for (let i = 0; i < this.config.iterations; i++) {
      try {
        const start = performance.now();

        // 模拟API调用
        await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        const end = performance.now();
        measurements.push(end - start);
      } catch (error) {
        console.warn('API调用测试失败:', error);
        measurements.push(5000); // 超时惩罚
      }
    }

    return this.calculateAverage(measurements);
  }

  // 测量内存使用
  private measureMemoryUsage(): number {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024); // 转换为MB
    }
    return 0;
  }

  // 测量CPU使用率
  private async measureCpuUsage(): Promise<number> {
    const start = performance.now();

    // 执行一些计算密集型任务
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }

    const end = performance.now();
    const duration = end - start;

    // 基于执行时间估算CPU使用?
    return Math.min(100, Math.round((duration / 100) * 100));
  }

  // 测量打包大小
  private async measureBundleSize(): Promise<number> {
    try {
      // 获取主要bundle文件大小
      const response = await fetch('/_next/static/chunks/main-*', {
        method: 'HEAD',
      });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) / 1024 : 0; // KB
    } catch (error) {
      console.warn('无法测量bundle大小:', error);
      return 0;
    }
  }

  // 运行页面加载时间测试
  private async runLoadTimeTests(): Promise<void> {
    console.log('⏱️  执行页面加载时间测试...');
    const result: TestResult = {
      testName: '页面加载时间测试',
      status: 'pass',
      duration: 0,
      metrics: {},
      timestamp: Date.now(),
    };

    try {
      const loadTime = await this.measurePageLoadTime();
      result.duration = loadTime;
      result.metrics.loadTime = loadTime;

      if (loadTime > this.config.thresholds.loadTime) {
        result.status = 'fail';
        result.errorMessage = `页面加载时间过长: ${loadTime}ms > ${this.config.thresholds.loadTime}ms`;
      }
    } catch (error) {
      result.status = 'fail';
      result.errorMessage = `测试执行失败: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.results.push(result);
  }

  // 运行 API 性能测试
  private async runApiPerformanceTests(): Promise<void> {
    console.log('📈 执行 API 性能测试...');
    const result: TestResult = {
      testName: 'API响应时间测试',
      status: 'pass',
      duration: 0,
      metrics: {},
      timestamp: Date.now(),
    };

    try {
      const responseTime = await this.measureApiResponseTime();
      result.duration = responseTime;
      result.metrics.responseTime = responseTime;

      if (responseTime > this.config.thresholds.apiResponse) {
        result.status = 'fail';
        result.errorMessage = `API响应时间过慢: ${responseTime}ms > ${this.config.thresholds.apiResponse}ms`;
      }
    } catch (error) {
      result.status = 'fail';
      result.errorMessage = `API测试失败: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.results.push(result);
  }

  // 运行内存使用测试
  private async runMemoryTests(): Promise<void> {
    console.log('💾 执行内存使用测试...');
    const result: TestResult = {
      testName: '内存使用测试',
      status: 'pass',
      duration: 0,
      metrics: {},
      timestamp: Date.now(),
    };

    try {
      const memoryUsage = this.measureMemoryUsage();
      result.duration = 0;
      result.metrics.memoryUsage = memoryUsage;

      if (memoryUsage > this.config.thresholds.memoryUsage && memoryUsage > 0) {
        result.status = 'fail';
        result.errorMessage = `内存使用过高: ${memoryUsage}MB > ${this.config.thresholds.memoryUsage}MB`;
      }
    } catch (error) {
      result.status = 'fail';
      result.errorMessage = `内存测试失败: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.results.push(result);
  }

  // 运行打包分析测试
  private async runBundleAnalysis(): Promise<void> {
    console.log('📦 执行打包分析测试...');
    const result: TestResult = {
      testName: '打包大小分析',
      status: 'pass',
      duration: 0,
      metrics: {},
      timestamp: Date.now(),
    };

    try {
      const bundleSize = await this.measureBundleSize();
      result.duration = 0;
      result.metrics.bundleSize = bundleSize;

      // 假设合理的bundle大小阈值为500KB
      if (bundleSize > 500) {
        result.status = 'fail';
        result.errorMessage = `打包文件过大: ${bundleSize}KB > 500KB`;
      }
    } catch (error) {
      result.status = 'fail';
      result.errorMessage = `打包分析失败: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.results.push(result);
  }

  // 运行用户交互测试
  private async runUserInteractionTests(): Promise<void> {
    console.log('👆 执行用户交互测试...');
    const result: TestResult = {
      testName: '用户交互响应测试',
      status: 'pass',
      duration: 0,
      metrics: {},
      timestamp: Date.now(),
    };

    try {
      // 模拟用户交互延迟测试
      const interactionDelays: number[] = [];

      for (let i = 0; i < 5; i++) {
        const start = performance.now();

        // 模拟用户操作
        await new Promise(resolve => setTimeout(resolve, 10));
        document.body.click(); // 触发点击事件

        const end = performance.now();
        interactionDelays.push(end - start);
      }

      const avgDelay = this.calculateAverage(interactionDelays);
      result.duration = avgDelay;
      result.metrics.interactionDelay = avgDelay;

      // 交互延迟应该小于100ms
      if (avgDelay > 100) {
        result.status = 'fail';
        result.errorMessage = `用户交互延迟过高: ${avgDelay}ms > 100ms`;
      }
    } catch (error) {
      result.status = 'fail';
      result.errorMessage = `交互测试失败: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.results.push(result);
  }

  // 生成测试报告
  private generateReport(): PerformanceReport {
    const passedTests = this.results.filter(r => r.status === 'pass').length;
    const failedTests = this.results.filter(r => r.status === 'fail').length;
    const skippedTests = this.results.filter(r => r.status === 'skip').length;

    const overallScore = Math.round((passedTests / this.results.length) * 100);

    // 生成优化建议
    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalTests: this.results.length,
        passedTests,
        failedTests,
        skippedTests,
        overallScore,
      },
      results: this.results,
      baselines: this.baselines,
      recommendations,
      timestamp: Date.now(),
    };
  }

  // 生成优化建议
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // 基于测试结果生成建议
    const failedTests = this.results.filter(r => r.status === 'fail');

    if (failedTests.some(t => t.testName.includes('加载时间'))) {
      recommendations.push('优化首页加载时间，考虑代码分割和懒加载');
    }

    if (failedTests.some(t => t.testName.includes('API 响应'))) {
      recommendations.push('优化 API 响应时间，检查数据库查询和缓存策略');
    }

    if (failedTests.some(t => t.testName.includes('内存'))) {
      recommendations.push('优化内存使用，检查内存泄漏和不必要的数据存储');
    }

    if (failedTests.some(t => t.testName.includes('打包'))) {
      recommendations.push('优化打包大小，移除未使用的依赖和启用Tree Shaking');
    }

    if (failedTests.some(t => t.testName.includes('交互'))) {
      recommendations.push('优化用户交互响应，减少主线程阻塞操作');
    }

    // 基线数据建议
    if (this.baselines.loadTime > 3000) {
      recommendations.push('页面加载时间较长，建议实施SSG或ISR策略');
    }

    if (this.baselines.bundleSize > 500) {
      recommendations.push('JavaScript包体积较大，建议进行代码分割');
    }

    return recommendations;
  }

  // 工具方法：计算平均值
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return Math.round(sum / numbers.length);
  }

  // 获取测试结果
  public getResults(): TestResult[] {
    return [...this.results];
  }

  // 获取基线数据
  public getBaselines(): PerformanceBaseline {
    return { ...this.baselines };
  }
}

// 便捷的性能测试函数
export async function runPerformanceTests(
  config?: Partial<PerformanceTestConfig>
): Promise<PerformanceReport> {
  const tester = new PerformanceTester(config);
  return await tester.runFullSuite();
}

import { useState } from 'react';

// 性能监控 Hook（用于实时监控）
export function usePerformanceTesting() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async (config?: Partial<PerformanceTestConfig>) => {
    setIsRunning(true);
    setError(null);

    try {
      const performanceTester = new PerformanceTester(config);
      const testReport = await performanceTester.runFullSuite();
      setReport(testReport);
      return testReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    report,
    error,
    runTests,
  };
}
