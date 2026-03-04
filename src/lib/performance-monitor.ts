// 全站性能监控核心引擎
import { logger } from '../utils/logger';

// 监控指标类型
export enum MetricType {
  COUNTER = 'COUNTER', // 计数?  GAUGE = 'GAUGE', // 仪表?可增?
  HISTOGRAM = 'HISTOGRAM', // 直方?  SUMMARY = 'SUMMARY', // 摘要统计
}

// 监控指标定义
export interface Metric {
  name: string;
  type: MetricType;
  description: string;
  labels?: Record<string, string>;
  value: number;
  timestamp: number;
}

// 性能指标数据
export interface PerformanceMetric {
  // 响应时间相关
  responseTime: number;
  throughput: number;
  errorRate: number;

  // 资源使用相关
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;

  // 业务指标
  activeUsers: number;
  requestsPerSecond: number;
  databaseConnections: number;

  // 时间?  timestamp: number;
}

// 告警规则定义
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  duration: number; // 持续时间(�?
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  notifications: string[]; // 通知渠道
}

// 告警事件
export interface AlertEvent {
  id: string;
  ruleId: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: string;
  triggeredAt: number;
  resolvedAt?: number;
  status: 'TRIGGERED' | 'RESOLVED' | 'ACKNOWLEDGED';
  annotations?: Record<string, any>;
}

// 监控配置
export interface MonitoringConfig {
  collectionInterval: number; // 数据收集间隔(毫秒)
  retentionPeriod: number; // 数据保留时间(�?
  alertEvaluationInterval: number; // 告警评估间隔(�?
  sampleRate: number; // 采样?0-1)
}

export class PerformanceMonitor {
  private metrics: Map<string, Metric[]> = new Map();
  private alertRules: AlertRule[] = [];
  private alertEvents: AlertEvent[] = [];
  private config: MonitoringConfig;
  private collectionTimer: NodeJS.Timeout | null = null;
  private alertTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      collectionInterval: 10000, // 10�?      retentionPeriod: 7, // 7�?      alertEvaluationInterval: 30, // 30�?      sampleRate: 1.0, // 100%采样
      ...config,
    };

    this.startCollection();
    this.startAlertEvaluation();
  }

  /**
   * 记录指标数据
   */
  recordMetric(
    name: string,
    value: number,
    type: MetricType = MetricType.GAUGE,
    labels?: Record<string, string>
  ): void {
    // 应用采样?    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const metric: Metric = {
      name,
      type,
      description: '',
      labels,
      value,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricList = this.metrics.get(name)!;
    metricList.push(metric);

    // 保持数据在保留期?    this.cleanupOldMetrics(name);
  }

  /**
   * 记录响应时间
   */
  recordResponseTime(
    endpoint: string,
    duration: number,
    statusCode: number = 200
  ): void {
    this.recordMetric(
      `http_response_time_${endpoint}`,
      duration,
      MetricType.HISTOGRAM,
      {
        endpoint,
        status: statusCode.toString(),
      }
    );

    this.recordMetric(
      `http_requests_total_${endpoint}`,
      1,
      MetricType.COUNTER,
      {
        endpoint,
        status: statusCode.toString(),
      }
    );
  }

  /**
   * 记录错误
   */
  recordError(
    type: string,
    message: string,
    context?: Record<string, any>
  ): void {
    this.recordMetric(`errors_total_${type}`, 1, MetricType.COUNTER, {
      type,
      message,
      ...context,
    });

    logger.error(`Performance Monitor recorded error: ${type}`, {
      message,
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取指标统计数据
   */
  getMetricStats(name: string, timeframe: number = 300000): any {
    const metrics = this.metrics.get(name) || [];
    const cutoffTime = Date.now() - timeframe;
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return null;
    }

    const values = recentMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: values.length,
      sum,
      avg,
      min,
      max,
      latest: values[values.length - 1],
    };
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
    logger.info(`Added alert rule: ${rule.name}`, { ruleId: rule.id });
  }

  /**
   * 评估告警规则
   */
  private evaluateAlerts(): void {
    this.alertRules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        try {
          const stats = this.getMetricStats(rule.metric);
          if (!stats) return;

          const currentValue = stats.latest;
          const shouldTrigger = this.evaluateCondition(
            currentValue,
            rule.operator,
            rule.threshold
          );

          if (shouldTrigger) {
            this.triggerAlert(rule, currentValue);
          } else {
            this.resolveAlert(rule, currentValue);
          }
        } catch (error) {
          logger.error(
            `Error evaluating alert rule ${rule.id}`,
            error as Error
          );
        }
      });
  }

  /**
   * 评估告警条件
   */
  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(rule: AlertRule, currentValue: number): void {
    const existingAlert = this.alertEvents.find(
      event => event.ruleId === rule.id && event.status === 'TRIGGERED'
    );

    if (existingAlert) {
      // 更新现有告警
      existingAlert.currentValue = currentValue;
      return;
    }

    // 创建新告?    const alertEvent: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      triggeredAt: Date.now(),
      status: 'TRIGGERED',
    };

    this.alertEvents.push(alertEvent);
    this.sendNotifications(alertEvent, rule.notifications);

    logger.warn(`Alert triggered: ${rule.name}`, {
      alertId: alertEvent.id,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
    });
  }

  /**
   * 解决告警
   */
  private resolveAlert(rule: AlertRule, currentValue: number): void {
    const triggeredAlert = this.alertEvents.find(
      event => event.ruleId === rule.id && event.status === 'TRIGGERED'
    );

    if (triggeredAlert) {
      triggeredAlert.status = 'RESOLVED';
      triggeredAlert.resolvedAt = Date.now();
      triggeredAlert.currentValue = currentValue;

      logger.info(`Alert resolved: ${rule.name}`, {
        alertId: triggeredAlert.id,
        duration: triggeredAlert.resolvedAt - triggeredAlert.triggeredAt,
      });
    }
  }

  /**
   * 发送通知
   */
  private sendNotifications(alert: AlertEvent, channels: string[]): void {
    channels.forEach(channel => {
      try {
        // 这里应该集成实际的通知服务
        logger.info(`Sending notification via ${channel}`, {
          alertId: alert.id,
          severity: alert.severity,
          metric: alert.metric,
        });
      } catch (error) {
        logger.error(
          `Failed to send notification via ${channel}`,
          error as Error
        );
      }
    });
  }

  /**
   * 启动数据收集
   */
  private startCollection(): void {
    this.collectionTimer = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.collectionInterval);
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): void {
    try {
      // 模拟系统指标收集
      const timestamp = Date.now();

      // CPU使用?(模拟数据)
      this.recordMetric(
        'system_cpu_usage',
        Math.random() * 100,
        MetricType.GAUGE
      );

      // 内存使用?(模拟数据)
      this.recordMetric(
        'system_memory_usage',
        Math.random() * 100,
        MetricType.GAUGE
      );

      // 磁盘IO (模拟数据)
      this.recordMetric(
        'system_disk_io',
        Math.random() * 1000,
        MetricType.GAUGE
      );

      // 网络IO (模拟数据)
      this.recordMetric(
        'system_network_io',
        Math.random() * 10000,
        MetricType.GAUGE
      );
    } catch (error) {
      logger.error('Error collecting system metrics', error as Error);
    }
  }

  /**
   * 启动告警评估
   */
  private startAlertEvaluation(): void {
    this.alertTimer = setInterval(() => {
      this.evaluateAlerts();
    }, this.config.alertEvaluationInterval * 1000);
  }

  /**
   * 清理过期指标数据
   */
  private cleanupOldMetrics(metricName: string): void {
    const metrics = this.metrics.get(metricName);
    if (!metrics) return;

    const cutoffTime =
      Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000;
    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    this.metrics.set(metricName, filteredMetrics);
  }

  /**
   * 获取所有活跃告?   */
  getActiveAlerts(): AlertEvent[] {
    return this.alertEvents.filter(event => event.status === 'TRIGGERED');
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit: number = 100): AlertEvent[] {
    return this.alertEvents
      .sort((a, b) => b.triggeredAt - a.triggeredAt)
      .slice(0, limit);
  }

  /**
   * 获取性能快照
   */
  getPerformanceSnapshot(): PerformanceMetric {
    return {
      responseTime: this.getMetricStats('http_response_time')?.avg || 0,
      throughput: this.getMetricStats('http_requests_total')?.count || 0,
      errorRate:
        ((this.getMetricStats('errors_total')?.count || 0) /
          (this.getMetricStats('http_requests_total')?.count || 1)) *
        100,
      cpuUsage: this.getMetricStats('system_cpu_usage')?.latest || 0,
      memoryUsage: this.getMetricStats('system_memory_usage')?.latest || 0,
      diskIO: this.getMetricStats('system_disk_io')?.latest || 0,
      networkIO: this.getMetricStats('system_network_io')?.latest || 0,
      activeUsers: 0, // 需要从会话管理获取
      requestsPerSecond: 0, // 需要计?      databaseConnections: 0, // 需要从数据库连接池获取
      timestamp: Date.now(),
    };
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    if (this.alertTimer) {
      clearInterval(this.alertTimer);
      this.alertTimer = null;
    }

    logger.info('Performance monitor stopped');
  }
}

// 导出全局实例
export const performanceMonitor = new PerformanceMonitor();

// 便捷的装饰器函数
export function monitorPerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;

      performanceMonitor.recordResponseTime(propertyKey, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordResponseTime(propertyKey, duration, 500);
      performanceMonitor.recordError(
        'business_error',
        (error as Error).message,
        {
          method: propertyKey,
        }
      );
      throw error;
    }
  };

  return descriptor;
}
