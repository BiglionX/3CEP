/**
 * 性能基准设定和阈值管理
 * 定义各项性能指标的基准值和评估标准
 */

class PerformanceBaseline {
  constructor() {
    this.baselines = this.initializeBaselines();
    this.currentMetrics = {};
  }

  /**
   * 初始化性能基准
   */
  initializeBaselines() {
    return {
      // Web核心指标基准
      webVitals: {
        firstContentfulPaint: {
          excellent: 1000, // ms
          good: 1800, // ms
          poor: Infinity, // ms
          weight: 0.25,
          description: '首次内容绘制时间',
        },
        largestContentfulPaint: {
          excellent: 2500, // ms
          good: 4000, // ms
          poor: Infinity, // ms
          weight: 0.25,
          description: '最大内容绘制时间',
        },
        firstInputDelay: {
          excellent: 100, // ms
          good: 300, // ms
          poor: Infinity, // ms
          weight: 0.15,
          description: '首次输入延迟',
        },
        cumulativeLayoutShift: {
          excellent: 0.1, // score
          good: 0.25, // score
          poor: Infinity, // score
          weight: 0.15,
          description: '累积布局偏移',
        },
        speedIndex: {
          excellent: 3400, // ms
          good: 5800, // ms
          poor: Infinity, // ms
          weight: 0.2,
          description: '速度指数',
        },
      },

      // API性能基准
      apiPerformance: {
        responseTime: {
          excellent: 100, // ms
          good: 300, // ms
          poor: 1000, // ms
          weight: 0.4,
          description: 'API响应时间',
        },
        throughput: {
          excellent: 100, // requests/sec
          good: 50, // requests/sec
          poor: 10, // requests/sec
          weight: 0.3,
          description: '吞吐量',
        },
        errorRate: {
          excellent: 0.1, // percentage
          good: 1, // percentage
          poor: 5, // percentage
          weight: 0.3,
          description: '错误率',
        },
      },

      // 前端组件性能基准
      componentPerformance: {
        renderTime: {
          excellent: 16, // ms (60fps)
          good: 50, // ms
          poor: 100, // ms
          weight: 0.4,
          description: '组件渲染时间',
        },
        updateTime: {
          excellent: 8, // ms
          good: 25, // ms
          poor: 50, // ms
          weight: 0.3,
          description: '组件更新时间',
        },
        memoryGrowth: {
          excellent: 1, // MB/min
          good: 5, // MB/min
          poor: 20, // MB/min
          weight: 0.3,
          description: '内存增长速率',
        },
      },

      // 用户交互性能基准
      userInteraction: {
        clickResponse: {
          excellent: 50, // ms
          good: 100, // ms
          poor: 300, // ms
          weight: 0.35,
          description: '点击响应时间',
        },
        scrollSmoothness: {
          excellent: 55, // fps
          good: 30, // fps
          poor: 15, // fps
          weight: 0.35,
          description: '滚动平滑度',
        },
        animationFrameRate: {
          excellent: 50, // fps
          good: 30, // fps
          poor: 15, // fps
          weight: 0.3,
          description: '动画帧率',
        },
      },

      // 业务场景性能基准
      businessScenarios: {
        loginJourney: {
          excellent: 2000, // ms
          good: 3500, // ms
          poor: 6000, // ms
          weight: 0.3,
          description: '登录完整流程',
        },
        workOrderCreation: {
          excellent: 3000, // ms
          good: 5000, // ms
          poor: 10000, // ms
          weight: 0.4,
          description: '工单创建流程',
        },
        dashboardLoading: {
          excellent: 1500, // ms
          good: 3000, // ms
          poor: 5000, // ms
          weight: 0.3,
          description: '仪表板加载',
        },
      },

      // 资源加载性能基准
      resourceLoading: {
        javascriptBundle: {
          excellent: 1000, // ms
          good: 2000, // ms
          poor: 5000, // ms
          weight: 0.3,
          description: 'JavaScript包加载',
        },
        cssBundle: {
          excellent: 500, // ms
          good: 1000, // ms
          poor: 3000, // ms
          weight: 0.2,
          description: 'CSS包加载',
        },
        imageAssets: {
          excellent: 1500, // ms
          good: 3000, // ms
          poor: 8000, // ms
          weight: 0.3,
          description: '图片资源加载',
        },
        totalPageWeight: {
          excellent: 2000, // KB
          good: 5000, // KB
          poor: 10000, // KB
          weight: 0.2,
          description: '页面总重量',
        },
      },
    };
  }

  /**
   * 设置当前性能指标
   */
  setCurrentMetrics(metrics) {
    this.currentMetrics = metrics;
  }

  /**
   * 评估单个指标的性能等级
   */
  evaluateMetric(category, metricName, value) {
    const baseline = this.baselines[category]?.[metricName];
    if (!baseline) {
      return { level: 'unknown', score: 0 };
    }

    let level, score;

    if (value <= baseline.excellent) {
      level = 'excellent';
      score = 100;
    } else if (value <= baseline.good) {
      level = 'good';
      score =
        70 +
        ((baseline.good - value) / (baseline.good - baseline.excellent)) * 30;
    } else if (value <= baseline.poor) {
      level = 'poor';
      score =
        30 + ((baseline.poor - value) / (baseline.poor - baseline.good)) * 40;
    } else {
      level = 'veryPoor';
      score = Math.max(0, 30 - ((value - baseline.poor) / baseline.poor) * 30);
    }

    return {
      level,
      score: Math.round(score),
      value,
      baseline,
      description: baseline.description,
    };
  }

  /**
   * 计算加权综合性能分数
   */
  calculateOverallScore(evaluations) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(evaluations).forEach(categoryEvals => {
      Object.values(categoryEvals).forEach(evaluation => {
        if (evaluation.score !== undefined && evaluation.baseline?.weight) {
          totalScore += evaluation.score * evaluation.baseline.weight;
          totalWeight += evaluation.baseline.weight;
        }
      });
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * 生成性能评估报告
   */
  generateAssessmentReport(metrics) {
    this.setCurrentMetrics(metrics);

    const evaluations = {};
    let hasMetrics = false;

    // 评估Web Vitals
    if (metrics.paint) {
      evaluations.webVitals = {};
      if (metrics.paint['first-contentful-paint']) {
        evaluations.webVitals.firstContentfulPaint = this.evaluateMetric(
          'webVitals',
          'firstContentfulPaint',
          metrics.paint['first-contentful-paint']
        );
        hasMetrics = true;
      }
      if (metrics.paint.firstMeaningfulPaint) {
        evaluations.webVitals.largestContentfulPaint = this.evaluateMetric(
          'webVitals',
          'largestContentfulPaint',
          metrics.paint.firstMeaningfulPaint
        );
        hasMetrics = true;
      }
    }

    // 评估自定义指标
    if (metrics.custom) {
      evaluations.custom = {};

      Object.keys(metrics.custom).forEach(key => {
        if (key.startsWith('api_')) {
          const apiEval = this.evaluateMetric(
            'apiPerformance',
            'responseTime',
            metrics.custom[key].value
          );
          evaluations.custom[key] = { ...apiEval, type: 'api' };
          hasMetrics = true;
        } else if (key.startsWith('render_')) {
          const renderEval = this.evaluateMetric(
            'componentPerformance',
            'renderTime',
            metrics.custom[key].value
          );
          evaluations.custom[key] = { ...renderEval, type: 'component' };
          hasMetrics = true;
        }
      });
    }

    if (!hasMetrics) {
      return {
        overallScore: 0,
        level: 'insufficient_data',
        message: '没有足够的性能数据进行评估',
        evaluations: {},
      };
    }

    const overallScore = this.calculateOverallScore(evaluations);
    const level = this.getPerformanceLevel(overallScore);

    return {
      overallScore,
      level,
      evaluations,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(evaluations),
    };
  }

  /**
   * 根据综合分数获取性能等级
   */
  getPerformanceLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'poor';
    return 'veryPoor';
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(evaluations) {
    const recommendations = [];

    // 分析Web Vitals问题
    if (evaluations.webVitals) {
      Object.entries(evaluations.webVitals).forEach(([metric, evaluation]) => {
        if (evaluation.level === 'poor' || evaluation.level === 'veryPoor') {
          recommendations.push(
            this.getWebVitalsRecommendation(metric, evaluation)
          );
        }
      });
    }

    // 分析API性能问题
    if (evaluations.custom) {
      Object.entries(evaluations.custom).forEach(([key, evaluation]) => {
        if (
          evaluation.type === 'api' &&
          (evaluation.level === 'poor' || evaluation.level === 'veryPoor')
        ) {
          recommendations.push(
            `优化API端点 ${key.replace('api_', '')} 的响应时间`
          );
        } else if (
          evaluation.type === 'component' &&
          (evaluation.level === 'poor' || evaluation.level === 'veryPoor')
        ) {
          recommendations.push(
            `优化组件 ${key.replace('render_', '')} 的渲染性能`
          );
        }
      });
    }

    return recommendations;
  }

  /**
   * 获取Web Vitals优化建议
   */
  getWebVitalsRecommendation(metric, evaluation) {
    const suggestions = {
      firstContentfulPaint: '优化首屏加载，考虑代码分割和资源预加载',
      largestContentfulPaint: '减少大型资源加载时间，优化图片和字体',
      firstInputDelay: '减少主线程阻塞，优化JavaScript执行',
      cumulativeLayoutShift: '避免布局偏移，为媒体元素指定明确尺寸',
      speedIndex: '优化内容显示速度，优先加载关键资源',
    };

    return suggestions[metric] || `优化 ${evaluation.description} 性能指标`;
  }

  /**
   * 获取性能基准配置
   */
  getBaselineConfig() {
    return this.baselines;
  }

  /**
   * 更新基准值
   */
  updateBaseline(category, metric, newBaseline) {
    if (this.baselines[category] && this.baselines[category][metric]) {
      this.baselines[category][metric] = {
        ...this.baselines[category][metric],
        ...newBaseline,
      };
      return true;
    }
    return false;
  }

  /**
   * 导出基准数据
   */
  exportBaselines() {
    return {
      baselines: this.baselines,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 导入基准数据
   */
  importBaselines(baselineData) {
    if (baselineData.baselines) {
      this.baselines = baselineData.baselines;
      return true;
    }
    return false;
  }
}

module.exports = PerformanceBaseline;
