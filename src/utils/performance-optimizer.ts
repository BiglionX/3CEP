/**
 * API响应时间优化工具
 * 提供性能分析和优化建议 */

interface PerformanceMetrics {
  endpoint: string;
  currentAvgResponseTime: number;
  targetResponseTime: number;
  improvementNeeded: number;
  optimizationStrategies: string[];
  expectedImprovement: number;
}

class ResponseTimeOptimizer {
  private baselines: Map<string, number> = new Map();

  // 预定义的目标响应时间（毫秒）
  private readonly TARGET_RESPONSE_TIMES = {
    'supplier-profiling': 150, // 供应商画像查询
    'market-intelligence': 200, // 市场情报分析
    'risk-analysis': 250, // 风险分析
    'decision-engine': 300, // 决策引擎
    'price-optimization': 200, // 价格优化
    'general-api': 100, // 通用API
  };

  /**
   * 分析当前API性能并生成优化建议
   */
  analyzePerformance(
    currentMetrics: Record<string, number>
  ): PerformanceMetrics[] {
    const results: PerformanceMetrics[] = [];

    Object.entries(currentMetrics).forEach(
      ([endpoint, currentResponseTime]) => {
        const targetTime = this.getTargetResponseTime(endpoint);
        const improvementNeeded = currentResponseTime - targetTime;

        if (improvementNeeded > 0) {
          const strategies = this.getSuitableOptimizationStrategies(
            endpoint,
            currentResponseTime
          );
          const expectedImprovement =
            this.calculateExpectedImprovement(strategies);

          results.push({
            endpoint,
            currentAvgResponseTime: currentResponseTime,
            targetResponseTime: targetTime,
            improvementNeeded,
            optimizationStrategies: strategies,
            expectedImprovement,
          });
        }
      }
    );

    return results;
  }

  /**
   * 获取目标响应时间
   */
  private getTargetResponseTime(endpoint: string): number {
    // 根据端点类型确定目标响应时间
    if (endpoint.includes('supplier-profiling')) {
      return this.TARGET_RESPONSE_TIMES['supplier-profiling'];
    } else if (endpoint.includes('market-intelligence')) {
      return this.TARGET_RESPONSE_TIMES['market-intelligence'];
    } else if (endpoint.includes('risk-analysis')) {
      return this.TARGET_RESPONSE_TIMES['risk-analysis'];
    } else if (endpoint.includes('decision-engine')) {
      return this.TARGET_RESPONSE_TIMES['decision-engine'];
    } else if (endpoint.includes('price-optimization')) {
      return this.TARGET_RESPONSE_TIMES['price-optimization'];
    } else {
      return this.TARGET_RESPONSE_TIMES['general-api'];
    }
  }

  /**
   * 根据当前性能状况推荐优化策略
   */
  private getSuitableOptimizationStrategies(
    endpoint: string,
    currentResponseTime: number
  ): string[] {
    const strategies: string[] = [];

    // 基于响应时间的策略推荐
    if (currentResponseTime > 500) {
      strategies.push('数据库查询优化 - 添加索引和优化 SQL');
      strategies.push('引入 Redis 缓存 - 缓存热点数据');
      strategies.push('异步处理 - 将耗时操作移至后台');
    } else if (currentResponseTime > 300) {
      strategies.push('数据库连接池优化 - 增加连接数');
      strategies.push('API响应压缩 - 启用 GZIP 压缩');
      strategies.push('代码层面优化 - 减少不必要的计算');
    } else if (currentResponseTime > 200) {
      strategies.push('缓存策略优化 - 调整缓存过期时间');
      strategies.push('批量请求处理 - 合并多个小请求');
      strategies.push('CDN加速静态资源');
    } else {
      strategies.push('微调 - 代码和配置调整');
      strategies.push('监控告警完善 - 建立性能基线');
    }

    // 基于端点的特殊处理
    if (endpoint.includes('search')) {
      strategies.push('分页查询优化 - 限制返回数据量');
    } else if (endpoint.includes('market-intelligence')) {
      strategies.push('大数据查询优化 - 使用预聚合');
    }

    return strategies;
  }

  /**
   * 计算预期改善效果
   */
  private calculateExpectedImprovement(strategies: string[]): number {
    let totalImprovement = 0;

    strategies.forEach(strategy => {
      if (strategy.includes('数据库查询优化')) {
        totalImprovement += 30; // 30% 改善
      } else if (strategy.includes('Redis 缓存')) {
        totalImprovement += 40; // 40% 改善
      } else if (strategy.includes('异步处理')) {
        totalImprovement += 25; // 25% 改善
      } else if (strategy.includes('预计')) {
        totalImprovement += 35; // 35% 改善
      } else {
        totalImprovement += 10; // 其他策略 10% 改善
      }
    });

    return Math.min(totalImprovement, 80); // 最多改善 80%
  }

  /**
   * 生成优化计划
   */
  generateOptimizationPlan(performanceAnalysis: PerformanceMetrics[]): any {
    const metrics = performanceAnalysis.map(m => ({
      endpoint: m.endpoint,
      avgResponseTime: m.currentAvgResponseTime,
      p95ResponseTime: m.currentAvgResponseTime * 1.5, // 估算
      errorRate: 0, // 暂时设为 0
    }));

    const sortedMetrics = metrics.sort((a, b) => b.avgResponseTime - a.avgResponseTime);

    const priorityTasks: any[] = [];
    sortedMetrics.forEach((metric, index) => {
      const priority = index === 0 ? '🔴' : index < 3 ? '🟡' : '🟢';
      
      priorityTasks.push({
        priority,
        endpoint: metric.endpoint,
        responseTime: metric.avgResponseTime,
        strategies: this.getSuitableOptimizationStrategies(
          metric.endpoint,
          metric.avgResponseTime
        ),
      });
    });

    return {
      priorityTasks,
      recommendedActions: [
        '1. 优先解决响应时间最长的 API',
        '2. 实施数据库查询优化',
        '3. 部署 Redis 缓存服务',
        '4. 优化API响应格式和压缩',
        '5. 实施异步处理机制',
      ],
      expectedImpact: {
        responseTime: '预计平均响应时间改善 40-60%',
        throughput: '系统吞吐量提升 30-50%',
        userExperience: '用户体验显著提升',
      },
      implementationSteps: [
        '数据库索引优化',
        'Redis 缓存服务器部署',
        '数据库连接池配置调整',
        'API响应压缩配置',
        '消息队列集成',
      ],
    };
  }

  /**
   * 比较优化前后的性能指标
   */
  compareBeforeAndAfter(
    oldMetrics: Record<string, number>,
    newMetrics: Record<string, number>
  ): any {
    const comparison: any = {};

    Object.keys(oldMetrics).forEach(key => {
      const oldValue = oldMetrics[key];
      const newValue = newMetrics[key] || 0;
      const improvement = oldValue > 0 ? ((oldValue - newValue) / oldValue) * 100 : 0;

      comparison[key] = {
        before: oldValue,
        after: newValue,
        improvement: `${improvement.toFixed(2)}%`,
        status: improvement > 0 ? '✅' : '⚠️',
      };
    });

    return {
      summary: {
        totalMetrics: Object.keys(oldMetrics).length,
        improvedMetrics: Object.values(comparison).filter(
          (c: any) => parseFloat(c.improvement) > 0
        ).length,
      },
      details: comparison,
    };
  }
}

export default ResponseTimeOptimizer;
