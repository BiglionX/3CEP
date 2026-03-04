/**
 * 监控集成服务
 * 提供与Prometheus、Grafana等监控系统的集成
 */

import { Logger, LogLevel } from '../../../utils/logger';

// 监控指标接口
export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

// 监控配置接口
export interface MonitoringConfig {
  prometheusEndpoint: string;
  metricsPath: string;
  collectionInterval: number;
  enabled: boolean;
}

export class MonitoringIntegrationService {
  private static instance: MonitoringIntegrationService;
  private config: MonitoringConfig;
  private logger: Logger;
  private metrics: Map<string, Metric[]> = new Map();
  private collectionTimer: NodeJS.Timeout | null = null;
  private readonly MAX_METRIC_POINTS = 1000;

  private constructor(config?: Partial<MonitoringConfig>) {
    this.logger = new Logger('MonitoringIntegrationService', LogLevel.INFO);
    this.config = {
      prometheusEndpoint: 'http://localhost:9090',
      metricsPath: '/api/metrics',
      collectionInterval: 30000, // 30�?      enabled: true,
      ...config,
    };
  }

  static getInstance(
    config?: Partial<MonitoringConfig>
  ): MonitoringIntegrationService {
    if (!MonitoringIntegrationService.instance) {
      MonitoringIntegrationService.instance = new MonitoringIntegrationService(
        config
      );
    }
    return MonitoringIntegrationService.instance;
  }

  /**
   * 启动监控收集
   */
  startCollection(): void {
    if (!this.config.enabled) {
      this.logger.warn('监控收集未启?);
      return;
    }

    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }

    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval);

    this.logger.info('启动监控指标收集', {
      interval: this.config.collectionInterval,
      endpoint: this.config.prometheusEndpoint,
    });
  }

  /**
   * 停止监控收集
   */
  stopCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
      this.logger.info('停止监控指标收集');
    }
  }

  /**
   * 收集监控指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      // 收集系统指标
      await this.collectSystemMetrics();

      // 收集业务指标
      await this.collectBusinessMetrics();

      // 清理过期数据
      this.cleanupOldMetrics();
    } catch (error) {
      this.logger.error('监控指标收集失败', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 收集系统指标
   */
  private async collectSystemMetrics(): Promise<void> {
    // Node.js进程指标
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.recordMetric('nodejs_heap_used_bytes', memoryUsage.heapUsed);
    this.recordMetric('nodejs_heap_limit_bytes', memoryUsage.heapTotal);
    this.recordMetric('nodejs_external_bytes', memoryUsage.external);
    this.recordMetric('nodejs_array_buffers_bytes', memoryUsage.arrayBuffers);
    this.recordMetric('nodejs_cpu_user_seconds_total', cpuUsage.user / 1000000);
    this.recordMetric(
      'nodejs_cpu_system_seconds_total',
      cpuUsage.system / 1000000
    );

    // 计算CPU使用百分比（近似值）
    const cpuPercent = Math.min(
      100,
      (cpuUsage.user + cpuUsage.system) / 10000000
    );
    this.recordMetric('nodejs_cpu_usage_percentage', cpuPercent);

    // Event loop延迟
    const start = Date.now();
    setImmediate(() => {
      const eventLoopDelay = Date.now() - start;
      this.recordMetric(
        'nodejs_eventloop_delay_seconds',
        eventLoopDelay / 1000
      );
    });
  }

  /**
   * 收集业务指标
   */
  private async collectBusinessMetrics(): Promise<void> {
    // 这里应该从各个业务服务收集指?    // 示例指标
    this.recordMetric(
      'procurement_intelligence_active_users',
      Math.floor(Math.random() * 100) + 50
    );
    this.recordMetric(
      'procurement_intelligence_pending_requests',
      Math.floor(Math.random() * 20)
    );
    this.recordMetric(
      'procurement_intelligence_cache_hit_ratio',
      Math.random() * 0.3 + 0.7
    ); // 70-100%
  }

  /**
   * 记录指标数据
   */
  recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricPoints = this.metrics.get(name)!;
    metricPoints.push({
      name,
      value,
      labels,
      timestamp: new Date(),
    });

    // 保持数据点数量在限制?    if (metricPoints.length > this.MAX_METRIC_POINTS) {
      metricPoints.shift();
    }
  }

  /**
   * 记录API请求指标
   */
  recordApiRequest(
    path: string,
    method: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = { path, method, status_code: statusCode.toString() };

    this.recordMetric('procurement_intelligence_api_requests_total', 1, labels);
    this.recordMetric(
      'procurement_intelligence_api_response_time_seconds',
      duration / 1000,
      labels
    );

    if (statusCode >= 400) {
      this.recordMetric('procurement_intelligence_api_errors_total', 1, labels);
    }
  }

  /**
   * 记录业务事件指标
   */
  recordBusinessEvent(
    eventName: string,
    count: number = 1,
    labels?: Record<string, string>
  ): void {
    this.recordMetric(
      `procurement_intelligence_${eventName}_total`,
      count,
      labels
    );
  }

  /**
   * 获取Prometheus格式的指标文?   */
  getMetricsAsText(): string {
    const lines: string[] = [
      '# HELP nodejs_up 1 = up, 0 = down',
      '# TYPE nodejs_up gauge',
      'nodejs_up 1',
      '',
    ];

    for (const [name, points] of this.metrics.entries()) {
      if (points.length === 0) continue;

      // 添加HELP和TYPE注释
      lines.push(`# HELP ${name} ${this.getMetricDescription(name)}`);
      lines.push(`# TYPE ${name} ${this.getMetricType(name)}`);

      // 添加最新的指标?      const latestPoint = points[points.length - 1];
      const labelStr = latestPoint.labels
        ? `{${Object.entries(latestPoint.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',')}}`
        : '';

      lines.push(`${name}${labelStr} ${latestPoint.value}`);
    }

    return lines.join('\n');
  }

  /**
   * 获取指标描述
   */
  private getMetricDescription(name: string): string {
    const descriptions: Record<string, string> = {
      nodejs_heap_used_bytes: 'Node.js堆内存使用字节数',
      nodejs_heap_limit_bytes: 'Node.js堆内存限制字节数',
      nodejs_cpu_usage_percentage: 'Node.js CPU使用百分?,
      procurement_intelligence_api_requests_total: 'API请求总数',
      procurement_intelligence_api_response_time_seconds: 'API响应时间（秒?,
      procurement_intelligence_api_errors_total: 'API错误总数',
    };

    return descriptions[name] || name.replace(/_/g, ' ');
  }

  /**
   * 获取指标类型
   */
  private getMetricType(name: string): string {
    if (name.endsWith('_total')) return 'counter';
    if (name.includes('percentage') || name.includes('ratio')) return 'gauge';
    if (name.includes('time') || name.includes('seconds')) return 'histogram';
    return 'gauge';
  }

  /**
   * 清理过期指标数据
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1小时?
    for (const [name, points] of this.metrics.entries()) {
      const filteredPoints = points.filter(
        point => point.timestamp! > cutoffTime
      );
      this.metrics.set(name, filteredPoints);
    }
  }

  /**
   * 获取指标统计信息
   */
  getMetricsStats(): Record<string, any> {
    const stats: Record<string, any> = {
      totalMetrics: this.metrics.size,
      totalPoints: 0,
      metrics: {},
    };

    for (const [name, points] of this.metrics.entries()) {
      stats.totalPoints += points.length;
      stats.metrics[name] = {
        count: points.length,
        latestValue: points.length > 0 ? points[points.length - 1].value : null,
        labels:
          points.length > 0
            ? Object.keys(points[points.length - 1].labels || {})
            : [],
      };
    }

    return stats;
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('更新监控配置', config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * 关闭服务
   */
  async shutdown(): Promise<void> {
    this.stopCollection();
    this.metrics.clear();
    this.logger.info('监控集成服务已关?);
  }
}

// 导出默认实例
export const monitoringService = MonitoringIntegrationService.getInstance();
