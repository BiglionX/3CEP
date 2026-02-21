/**
 * 数据库查询优化器
 * 提供查询性能监控和优化建议
 */

interface QueryMetrics {
  query: string;
  executionTime: number;
  rowCount: number;
  timestamp: number;
}

interface PerformanceReport {
  slowQueries: QueryMetrics[];
  averageExecutionTime: number;
  totalQueries: number;
  recommendations: string[];
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryHistory: QueryMetrics[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1秒

  private constructor() {}

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * 记录查询执行情况
   */
  recordQuery(query: string, executionTime: number, rowCount: number): void {
    const metrics: QueryMetrics = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowCount,
      timestamp: Date.now(),
    };

    this.queryHistory.push(metrics);

    // 保持历史记录大小限制
    if (this.queryHistory.length > this.MAX_HISTORY_SIZE) {
      this.queryHistory.shift();
    }

    // 记录慢查询警告
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      console.warn(
        `[DB Optimizer] 慢查询检测: ${executionTime}ms - ${query.substring(
          0,
          100
        )}...`
      );
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    if (this.queryHistory.length === 0) {
      return {
        slowQueries: [],
        averageExecutionTime: 0,
        totalQueries: 0,
        recommendations: ['暂无查询数据'],
      };
    }

    const slowQueries = this.queryHistory.filter(
      q => q.executionTime > this.SLOW_QUERY_THRESHOLD
    );

    const totalExecutionTime = this.queryHistory.reduce(
      (sum, q) => sum + q.executionTime,
      0
    );

    const averageExecutionTime = totalExecutionTime / this.queryHistory.length;

    const recommendations = this.generateRecommendations(
      slowQueries,
      averageExecutionTime
    );

    return {
      slowQueries: slowQueries.slice(-10), // 最近10个慢查询
      averageExecutionTime,
      totalQueries: this.queryHistory.length,
      recommendations,
    };
  }

  /**
   * 清空查询历史
   */
  clearHistory(): void {
    this.queryHistory = [];
  }

  /**
   * 获取查询统计信息
   */
  getQueryStats(timeWindowMs: number = 60000): {
    totalQueries: number;
    slowQueries: number;
    averageTime: number;
    peakTime: number;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentQueries = this.queryHistory.filter(
      q => q.timestamp > cutoffTime
    );

    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageTime: 0,
        peakTime: 0,
      };
    }

    const slowCount = recentQueries.filter(
      q => q.executionTime > this.SLOW_QUERY_THRESHOLD
    ).length;

    const totalTime = recentQueries.reduce(
      (sum, q) => sum + q.executionTime,
      0
    );
    const averageTime = totalTime / recentQueries.length;
    const peakTime = Math.max(...recentQueries.map(q => q.executionTime));

    return {
      totalQueries: recentQueries.length,
      slowQueries: slowCount,
      averageTime,
      peakTime,
    };
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    slowQueries: QueryMetrics[],
    averageTime: number
  ): string[] {
    const recommendations: string[] = [];

    if (slowQueries.length > 0) {
      recommendations.push(
        `检测到 ${slowQueries.length} 个慢查询，请检查索引使用情况`
      );
    }

    if (averageTime > 500) {
      recommendations.push('平均查询时间较长，建议优化查询语句和数据库索引');
    }

    // 分析常见慢查询模式
    const queryPatterns = this.analyzeQueryPatterns(slowQueries);
    if (queryPatterns.missingJoins.length > 0) {
      recommendations.push('发现缺少JOIN优化的查询，请检查表关联关系');
    }

    if (queryPatterns.missingIndexes.length > 0) {
      recommendations.push('发现可能缺少索引的查询，请考虑添加适当索引');
    }

    return recommendations;
  }

  /**
   * 分析查询模式
   */
  private analyzeQueryPatterns(slowQueries: QueryMetrics[]): {
    missingJoins: string[];
    missingIndexes: string[];
    complexQueries: string[];
  } {
    const missingJoins: string[] = [];
    const missingIndexes: string[] = [];
    const complexQueries: string[] = [];

    slowQueries.forEach(metric => {
      const query = metric.query.toLowerCase();

      // 检查是否缺少JOIN优化
      if (
        query.includes('where') &&
        query.includes('in (') &&
        !query.includes('join')
      ) {
        missingJoins.push(metric.query.substring(0, 50));
      }

      // 检查是否可能缺少索引
      if (query.includes("like '%") || query.includes('order by')) {
        missingIndexes.push(metric.query.substring(0, 50));
      }

      // 检查复杂查询
      const selectCount = (query.match(/select/gi) || []).length;
      const joinCount = (query.match(/join/gi) || []).length;
      if (selectCount > 3 || joinCount > 2) {
        complexQueries.push(metric.query.substring(0, 50));
      }
    });

    return {
      missingJoins: [...new Set(missingJoins)],
      missingIndexes: [...new Set(missingIndexes)],
      complexQueries: [...new Set(complexQueries)],
    };
  }

  /**
   * 清理查询语句（移除敏感信息）
   */
  private sanitizeQuery(query: string): string {
    // 移除可能的敏感数据
    return query
      .replace(/'(.*?)'/g, "'***'") // 替换字符串字面量
      .replace(/\d+/g, '*') // 替换数字
      .substring(0, 200); // 限制长度
  }
}

// 导出单例实例
export const dbOptimizer = DatabaseOptimizer.getInstance();

// 便捷函数
export const queryOptimizer = {
  record: (query: string, time: number, rows: number) =>
    dbOptimizer.recordQuery(query, time, rows),
  report: () => dbOptimizer.getPerformanceReport(),
  stats: (window?: number) => dbOptimizer.getQueryStats(window),
  clear: () => dbOptimizer.clearHistory(),
};
