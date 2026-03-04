/**
 * 性能指标收集和计算工具
 * 提供统一的性能数据收集、计算和分析功能
 */

class PerformanceMetricsCollector {
  constructor() {
    this.metrics = {
      navigation: {},
      resource: {},
      paint: {},
      memory: {},
      custom: {},
    };
    this.startTime = Date.now();
  }

  /**
   * 收集导航性能指标
   */
  collectNavigationMetrics() {
    if (typeof window !== 'undefined' && window.performance) {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        this.metrics.navigation = {
          dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
          tcpConnection: nav.connectEnd - nav.connectStart,
          requestTime: nav.responseStart - nav.requestStart,
          responseTime: nav.responseEnd - nav.responseStart,
          domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
          loadComplete: nav.loadEventEnd - nav.fetchStart,
          firstByte: nav.responseStart - nav.fetchStart,
        };
      }
    }
    return this.metrics.navigation;
  }

  /**
   * 收集资源加载性能指标
   */
  collectResourceMetrics() {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const imageResources = resources.filter(
        r =>
          r.name.includes('.png') ||
          r.name.includes('.jpg') ||
          r.name.includes('.webp')
      );

      this.metrics.resource = {
        totalResources: resources.length,
        jsResources: jsResources.length,
        cssResources: cssResources.length,
        imageResources: imageResources.length,
        totalJSBytes: jsResources.reduce(
          (sum, r) => sum + (r.transferSize || 0),
          0
        ),
        totalCSSBytes: cssResources.reduce(
          (sum, r) => sum + (r.transferSize || 0),
          0
        ),
        totalImageBytes: imageResources.reduce(
          (sum, r) => sum + (r.transferSize || 0),
          0
        ),
      };
    }
    return this.metrics.resource;
  }

  /**
   * 收集绘制性能指标
   */
  collectPaintMetrics() {
    if (typeof window !== 'undefined' && window.performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        this.metrics.paint[entry.name] = entry.startTime;
      });

      // 计算额外的绘制指标
      if (this.metrics.paint['first-contentful-paint']) {
        this.metrics.paint.firstMeaningfulPaint =
          this.calculateFirstMeaningfulPaint();
      }
    }
    return this.metrics.paint;
  }

  /**
   * 计算首次有意义绘制时间
   */
  calculateFirstMeaningfulPaint() {
    // 简化实现 - 实际项目中可能需要更复杂的算法
    const fcp = this.metrics.paint['first-contentful-paint'];
    return fcp ? fcp + 1000 : 0; // 假设FMP比FCP晚1秒
  }

  /**
   * 收集内存使用指标
   */
  collectMemoryMetrics() {
    if (
      typeof window !== 'undefined' &&
      window.performance &&
      window.performance.memory
    ) {
      const memory = window.performance.memory;
      this.metrics.memory = {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
        memoryPressure: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100, // 百分比
      };
    }
    return this.metrics.memory;
  }

  /**
   * 记录自定义性能指标
   */
  recordCustomMetric(name, value, metadata = {}) {
    this.metrics.custom[name] = {
      value,
      timestamp: Date.now(),
      metadata,
    };
  }

  /**
   * 记录组件渲染时间
   */
  measureComponentRender(componentName, renderFunction) {
    const start = performance.now();
    const result = renderFunction();
    const end = performance.now();

    this.recordCustomMetric(`render_${componentName}`, end - start, {
      type: 'component_render',
      componentName,
    });

    return { result, duration: end - start };
  }

  /**
   * 记录API调用性能
   */
  measureAPICall(apiName, apiFunction) {
    const start = performance.now();
    return apiFunction()
      .then(result => {
        const end = performance.now();
        this.recordCustomMetric(`api_${apiName}`, end - start, {
          type: 'api_call',
          apiName,
        });
        return result;
      })
      .catch(error => {
        const end = performance.now();
        this.recordCustomMetric(`api_${apiName}_error`, end - start, {
          type: 'api_error',
          apiName,
          error: error.message,
        });
        throw error;
      });
  }

  /**
   * 获取所有收集的指标
   */
  getAllMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      elapsedTime: Date.now() - this.startTime,
    };
  }

  /**
   * 清除收集的指标
   */
  clearMetrics() {
    this.metrics = {
      navigation: {},
      resource: {},
      paint: {},
      memory: {},
      custom: {},
    };
    this.startTime = Date.now();
  }

  /**
   * 计算性能评分
   */
  calculatePerformanceScore(thresholds) {
    const scores = {};
    let totalScore = 0;
    let scoreCount = 0;

    // 计算页面加载评分
    if (this.metrics.paint['first-contentful-paint']) {
      const fcp = this.metrics.paint['first-contentful-paint'];
      scores.fcp =
        fcp <= thresholds.pageLoad.firstContentfulPaint
          ? 100
          : Math.max(
              0,
              100 - (fcp - thresholds.pageLoad.firstContentfulPaint) / 100
            );
      totalScore += scores.fcp;
      scoreCount++;
    }

    // 计算最大内容绘制评分
    if (this.metrics.paint.firstMeaningfulPaint) {
      const lcp = this.metrics.paint.firstMeaningfulPaint;
      scores.lcp =
        lcp <= thresholds.pageLoad.largestContentfulPaint
          ? 100
          : Math.max(
              0,
              100 - (lcp - thresholds.pageLoad.largestContentfulPaint) / 100
            );
      totalScore += scores.lcp;
      scoreCount++;
    }

    // 计算累积布局偏移评分
    // 这里简化处理，实际需要专门的CLS测量
    scores.cls = 90; // 假设值

    // 计算自定义指标评分
    Object.keys(this.metrics.custom).forEach(key => {
      if (key.startsWith('render_')) {
        const renderTime = this.metrics.custom[key].value;
        const componentScore =
          renderTime <= thresholds.componentRendering.maxRenderTime
            ? 100
            : Math.max(
                0,
                100 -
                  (renderTime - thresholds.componentRendering.maxRenderTime) /
                    10
              );
        scores[`render_${key.replace('render_', '')}`] = componentScore;
        totalScore += componentScore;
        scoreCount++;
      }
    });

    return {
      scores,
      overallScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      category: this.getPerformanceCategory(
        scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
      ),
    };
  }

  /**
   * 获取性能等级分类
   */
  getPerformanceCategory(score) {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '较差';
  }
}

// Node.js环境下的性能指标收集器
class NodePerformanceCollector {
  constructor() {
    this.metrics = {
      cpu: {},
      memory: {},
      eventLoop: {},
      gc: {},
    };
  }

  /**
   * 收集Node.js进程指标
   */
  collectProcessMetrics() {
    const usage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.metrics.memory = {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };

    this.metrics.cpu = {
      user: cpuUsage.user / 1000, // microseconds to milliseconds
      system: cpuUsage.system / 1000, // microseconds to milliseconds
    };

    return this.metrics;
  }

  /**
   * 记录异步操作性能
   */
  async measureAsyncOperation(operationName, asyncFunction) {
    const start = process.hrtime.bigint();
    try {
      const result = await asyncFunction();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // 转换为毫秒

      this.metrics.eventLoop[operationName] = {
        duration,
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;

      this.metrics.eventLoop[`${operationName}_error`] = {
        duration,
        timestamp: Date.now(),
        error: error.message,
      };

      throw error;
    }
  }
}

module.exports = {
  PerformanceMetricsCollector,
  NodePerformanceCollector,
};
