/**
 * 内存优化和泄漏检测工? * 监控Node.js应用内存使用情况，检测和预防内存泄漏
 */

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  cpuUsage: NodeJS.CpuUsage;
}

interface LeakDetectionConfig {
  threshold: number; // 内存增长阈?(bytes)
  checkInterval: number; // 检查间?(ms)
  historySize: number; // 历史记录大小
  alertThreshold: number; // 告警阈?(MB)
}

interface MemoryLeakReport {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentUsage: number;
  growthRate: number;
  recommendations: string[];
  timestamp: number;
}

export class MemoryOptimizer {
  private config: LeakDetectionConfig;
  private memoryHistory: MemorySnapshot[] = [];
  private leakDetected: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private gcInterval: NodeJS.Timeout | null = null;
  // 简化实现，移除WeakRef相关功能以避免兼容性问?  private trackedObjects: Map<string, any> = new Map();

  constructor(config: Partial<LeakDetectionConfig> = {}) {
    this.config = {
      threshold: config.threshold || 10 * 1024 * 1024, // 10MB
      checkInterval: config.checkInterval || 30000, // 30�?      historySize: config.historySize || 20,
      alertThreshold: config.alertThreshold || 500, // 500MB
    };
  }

  /**
   * 开始内存监?   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Memory monitoring already running')return;
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚀 开始内存监?..')this.monitoringInterval = setInterval(() => {
      this.takeMemorySnapshot();
      this.checkForLeaks();
    }, this.config.checkInterval);

    // 定期触发垃圾回收（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      this.gcInterval = setInterval(() => {
        if (global.gc) {
          global.gc();
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log("'gc triggered manually'")}
      }, 60000); // 每分钟触发一?    }
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 内存监控已停?)}

  /**
   * 拍摄内存快照
   */
  private takeMemorySnapshot(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      rss: memoryUsage.rss,
      cpuUsage,
    };

    this.memoryHistory.push(snapshot);

    // 保持历史记录大小
    if (this.memoryHistory.length > this.config.historySize) {
      this.memoryHistory.shift();
    }

    this.logMemoryUsage(snapshot);
  }

  /**
   * 记录内存使用情况
   */
  private logMemoryUsage(snapshot: MemorySnapshot): void {
    const usageMB = (snapshot.heapUsed / 1024 / 1024).toFixed(2);
    const totalMB = (snapshot.heapTotal / 1024 / 1024).toFixed(2);
    const externalMB = (snapshot.external / 1024 / 1024).toFixed(2);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `🧠 内存使用 - Heap: ${usageMB}/${totalMB}MB, External: ${externalMB}MB`
    )}

  /**
   * 检测内存泄?   */
  private checkForLeaks(): MemoryLeakReport {
    if (this.memoryHistory.length < 2) {
      return {
        detected: false,
        severity: 'low',
        currentUsage: 0,
        growthRate: 0,
        recommendations: [],
        timestamp: Date.now(),
      };
    }

    const recentSnapshots = this.memoryHistory.slice(-5);
    const currentUsage = recentSnapshots[recentSnapshots.length - 1].heapUsed;
    const previousUsage = recentSnapshots[0].heapUsed;

    const growth = currentUsage - previousUsage;
    const growthRate = growth / (recentSnapshots.length - 1);

    // 检查是否超过阈?    const isLeaking = growth > this.config.threshold;
    const currentUsageMB = currentUsage / 1024 / 1024;
    const alertThresholdMB = this.config.alertThreshold;

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendations: string[] = [];

    if (isLeaking) {
      this.leakDetected = true;

      if (currentUsageMB > alertThresholdMB * 0.8) {
        severity = 'high';
        recommendations.push('立即检查大对象分配');
        recommendations.push('审查事件监听器是否正确移?);
      } else if (currentUsageMB > alertThresholdMB * 0.5) {
        severity = 'medium';
        recommendations.push('监控内存增长趋势');
        recommendations.push('检查缓存策?);
      } else {
        severity = 'low';
        recommendations.push('持续观察内存使用');
      }

      // 添加具体建议
      recommendations.push(...this.getLeakRecommendations());

      console.warn(
        `🚨 检测到内存增长: ${growthRate.toFixed(2)} bytes/interval`
      );
      this.sendAlert(severity, currentUsageMB, recommendations);
    }

    return {
      detected: isLeaking,
      severity,
      currentUsage: currentUsageMB,
      growthRate,
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * 获取泄漏预防建议
   */
  private getLeakRecommendations(): string[] {
    const recommendations: string[] = [];

    // 检查常见泄漏源
    recommendations.push('检查未清理的定时器和间?);
    recommendations.push('验证事件监听器是否正确移?);
    recommendations.push('审查WebSocket连接管理');
    recommendations.push('检查数据库连接池配?);
    recommendations.push('验证缓存过期策略');

    return recommendations;
  }

  /**
   * 发送告?   */
  private sendAlert(
    severity: string,
    usageMB: number,
    recommendations: string[]
  ): void {
    const alertMessage = `[内存告警 - ${severity.toUpperCase()}] 当前使用: ${usageMB.toFixed(2)}MB`;

    console.warn(alertMessage);
    recommendations.forEach(rec => console.warn(`💡 ${rec}`));

    // 这里可以集成到告警系?    // this.integrationWithAlertingSystem(alertMessage, recommendations);
  }

  /**
   * 强制垃圾回收
   */
  forceGarbageCollection(): void {
    if (global.gc) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🧹 执行强制垃圾回收')global.gc();
      this.takeMemorySnapshot();
    } else {
      console.warn('⚠️ 未启?-expose-gc标志，无法强制GC');
    }
  }

  /**
   * 注册要跟踪的对象
   */
  registerTrackedObject(obj: any, identifier: string): void {
    this.trackedObjects.set(identifier, obj);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🎯 注册跟踪对象: ${identifier}`)}

  /**
   * 清理已死的引?   */
  cleanupDeadReferences(): number {
    let cleanedCount = 0;

    for (const [key, value] of this.trackedObjects.entries()) {
      // 简单的清理逻辑
      if (value === null || value === undefined) {
        this.trackedObjects.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🧹 清理?${cleanedCount} 个死引用`)}

    return cleanedCount;
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport(): {
    current: MemorySnapshot;
    history: MemorySnapshot[];
    leakReport: MemoryLeakReport;
    statistics: {
      averageUsage: number;
      peakUsage: number;
      growthTrend: 'increasing' | 'decreasing' | 'stable';
    };
  } {
    const current = this.memoryHistory[this.memoryHistory.length - 1];
    const leakReport = this.checkForLeaks();

    // 计算统计信息
    const usages = this.memoryHistory.map(s => s.heapUsed);
    const averageUsage = usages.reduce((a, b) => a + b, 0) / usages.length;
    const peakUsage = Math.max(...usages);

    let growthTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (this.memoryHistory.length >= 2) {
      const firstHalfAvg =
        usages
          .slice(0, Math.floor(usages.length / 2))
          .reduce((a, b) => a + b, 0) / Math.floor(usages.length / 2);
      const secondHalfAvg =
        usages.slice(Math.floor(usages.length / 2)).reduce((a, b) => a + b, 0) /
        Math.ceil(usages.length / 2);

      if (secondHalfAvg > firstHalfAvg * 1.1) {
        growthTrend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        growthTrend = 'decreasing';
      }
    }

    return {
      current,
      history: [...this.memoryHistory],
      leakReport,
      statistics: {
        averageUsage: averageUsage / 1024 / 1024,
        peakUsage: peakUsage / 1024 / 1024,
        growthTrend,
      },
    };
  }

  /**
   * 优化内存使用
   */
  optimizeMemory(): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?开始内存优?..')// 清理死引?    this.cleanupDeadReferences();

    // 强制垃圾回收
    this.forceGarbageCollection();

    // 清理缓存（如果有缓存服务的话?    // this.clearStaleCache();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?内存优化完成')}

  /**
   * 关闭内存优化?   */
  shutdown(): void {
    this.stopMonitoring();
    this.optimizeMemory();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔌 内存优化器已关闭')}
}

// 导出单例实例
export const memoryOptimizer = new MemoryOptimizer({
  threshold: 10 * 1024 * 1024, // 10MB增长阈?  checkInterval: 30000, // 30秒检查间?  historySize: 20, // 保留20个历史快?  alertThreshold: 500, // 500MB告警阈?});
