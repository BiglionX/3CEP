// 性能监控告警系统
// 开发全站性能监控和异常告警系?
interface PerformanceMetric {
  // 性能指标定义
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  threshold?: number;
  unit: string;
}

interface AlertRule {
  // 告警规则
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equal';
  threshold: number;
  duration: number; // 持续时间(毫秒)
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[]; // 通知渠道
}

interface AlertEvent {
  // 告警事件
  id: string;
  ruleId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  triggeredAt: number;
  resolvedAt?: number;
  status: 'triggered' | 'resolved' | 'acknowledged';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface MonitoringConfig {
  // 监控配置
  samplingRate: number; // 采样?0-1
  bufferSize: number; // 缓冲区大?  alertCooldown: number; // 告警冷却时间(毫秒)
  retentionPeriod: number; // 数据保留时间(毫秒)
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private alertEvents: Map<string, AlertEvent> = new Map();
  private config: MonitoringConfig;
  private observers: ((metric: PerformanceMetric) => void)[] = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      samplingRate: 1.0,
      bufferSize: 1000,
      alertCooldown: 300000, // 5分钟
      retentionPeriod: 86400000, // 24小时
      ...config,
    };

    this.startCleanupInterval();
  }

  // 记录性能指标
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
    unit: string = ''
  ): void {
    // 应用采样?    if (Math.random() > this.config.samplingRate) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      unit,
    };

    // 存储指标
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // 保持缓冲区大?    if (metricArray.length > this.config.bufferSize) {
      metricArray.shift();
    }

    // 通知观察?    this.observers.forEach(observer => observer(metric));

    // 检查告警规?    this.checkAlertRules(metric);
  }

  // 添加观察?  addObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.push(observer);
  }

  // 移除观察?  removeObserver(observer: (metric: PerformanceMetric) => void): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // 添加告警规则
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  // 移除告警规则
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  // 检查告警规?  private checkAlertRules(metric: PerformanceMetric): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled || rule.metric !== metric.name) {
        return;
      }

      const shouldTrigger = this.evaluateCondition(
        metric.value,
        rule.condition,
        rule.threshold
      );

      if (shouldTrigger) {
        this.triggerAlert(rule, metric);
      } else {
        this.checkAlertResolution(rule, metric);
      }
    });
  }

  // 评估告警条件
  private evaluateCondition(
    value: number,
    condition: string,
    threshold: number
  ): boolean {
    switch (condition) {
      case 'above':
        return value > threshold;
      case 'below':
        return value < threshold;
      case 'equal':
        return value === threshold;
      default:
        return false;
    }
  }

  // 触发告警
  private triggerAlert(rule: AlertRule, metric: PerformanceMetric): void {
    const existingAlert = Array.from(this.alertEvents.values()).find(
      event => event.ruleId === rule.id && event.status === 'triggered'
    );

    // 避免重复告警
    if (existingAlert) {
      return;
    }

    const alertEvent: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      metricName: metric.name,
      currentValue: metric.value,
      threshold: rule.threshold,
      triggeredAt: Date.now(),
      status: 'triggered',
      severity: rule.severity,
    };

    this.alertEvents.set(alertEvent.id, alertEvent);

    // 发送通知
    this.sendNotifications(rule, alertEvent);

    console.warn(`🚨 性能告警触发: ${rule.name}`, {
      metric: metric.name,
      value: metric.value,
      threshold: rule.threshold,
      severity: rule.severity,
    });
  }

  // 检查告警解?  private checkAlertResolution(
    rule: AlertRule,
    metric: PerformanceMetric
  ): void {
    const triggeredAlert = Array.from(this.alertEvents.values()).find(
      event => event.ruleId === rule.id && event.status === 'triggered'
    );

    if (triggeredAlert) {
      // 检查是否持续满足解决条?      const isResolved = !this.evaluateCondition(
        metric.value,
        rule.condition,
        rule.threshold
      );

      if (isResolved) {
        triggeredAlert.status = 'resolved';
        triggeredAlert.resolvedAt = Date.now();

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.info(`�?性能告警已解? ${rule.name}`, {
          metric: metric.name,
          value: metric.value,
        })}
    }
  }

  // 发送通知
  private sendNotifications(rule: AlertRule, alert: AlertEvent): void {
    rule.notifications.forEach(channel => {
      switch (channel) {
        case 'console':
          this.sendConsoleNotification(rule, alert);
          break;
        case 'email':
          this.sendEmailNotification(rule, alert);
          break;
        case 'slack':
          this.sendSlackNotification(rule, alert);
          break;
        case 'webhook':
          this.sendWebhookNotification(rule, alert);
          break;
      }
    });
  }

  // 控制台通知
  private sendConsoleNotification(rule: AlertRule, alert: AlertEvent): void {
    const colors = {
      low: '\x1b[32m', // 绿色
      medium: '\x1b[33m', // 黄色
      high: '\x1b[31m', // 红色
      critical: '\x1b[35m', // 紫色
    };

    const reset = '\x1b[0m';
    const color = colors[alert.severity] || reset;

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `${color}🔔 [${alert.severity.toUpperCase()}] ${rule.name}${reset}\n` +
        `Metric: ${alert.metricName}\n` +
        `Value: ${alert.currentValue}\n` +
        `Threshold: ${alert.threshold}\n` +
        `Time: ${new Date(alert.triggeredAt).toISOString()}`
    );
  }

  // 邮件通知（模拟）
  private sendEmailNotification(rule: AlertRule, alert: AlertEvent): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送邮件告? ${rule.name}`)// 实际实现会集成邮件服?  }

  // Slack通知（模拟）
  private sendSlackNotification(rule: AlertRule, alert: AlertEvent): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💬 发送Slack告警: ${rule.name}`)// 实际实现会集成Slack API
  }

  // Webhook通知（模拟）
  private sendWebhookNotification(rule: AlertRule, alert: AlertEvent): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔗 发送Webhook告警: ${rule.name}`)// 实际实现会调用Webhook端点
  }

  // 获取指标数据
  getMetrics(
    name: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];

    if (!startTime && !endTime) {
      return [...metrics];
    }

    return metrics.filter(metric => {
      const timestamp = metric.timestamp;
      return (
        (!startTime || timestamp >= startTime) &&
        (!endTime || timestamp <= endTime)
      );
    });
  }

  // 获取统计信息
  getStatistics(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    latest: number;
  } {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, latest: 0 };
    }

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
    };
  }

  // 获取活跃告警
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.alertEvents.values()).filter(
      event => event.status === 'triggered'
    );
  }

  // 获取告警历史
  getAlertHistory(hours: number = 24): AlertEvent[] {
    const cutoffTime = Date.now() - hours * 3600 * 1000;

    return Array.from(this.alertEvents.values())
      .filter(event => event.triggeredAt >= cutoffTime)
      .sort((a, b) => b.triggeredAt - a.triggeredAt);
  }

  // 清理过期数据
  private cleanupExpiredData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    // 清理过期指标
    this.metrics.forEach((metrics, name) => {
      const filtered = metrics.filter(m => m.timestamp > cutoffTime);
      if (filtered.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, filtered);
      }
    });

    // 清理过期告警事件
    this.alertEvents.forEach((event, id) => {
      if (event.triggeredAt < cutoffTime) {
        this.alertEvents.delete(id);
      }
    });
  }

  // 启动清理间隔
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 3600000); // 每小时清理一?  }

  // 导出监控数据
  exportData(): any {
    return {
      metrics: Object.fromEntries(this.metrics),
      alerts: Object.fromEntries(this.alertEvents),
      rules: Object.fromEntries(this.alertRules),
      config: this.config,
      timestamp: Date.now(),
    };
  }
}

// 预定义的性能指标收集?export class PerformanceCollectors {
  static collectPageLoadTime(): number {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return perfData.loadEventEnd - perfData.fetchStart;
    }
    return 0;
  }

  static collectFirstContentfulPaint(): number {
    if ('performance' in window) {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return fcp ? fcp.startTime : 0;
    }
    return 0;
  }

  static collectLargestContentfulPaint(): number {
    if ('performance' in window) {
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
      return lcp ? lcp.startTime : 0;
    }
    return 0;
  }

  static collectCLS(): number {
    // 累积布局偏移
    return 0; // 需要专门的监听?  }

  static collectMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

// 默认导出实例
export const performanceMonitor = new PerformanceMonitor();

// React Hook封装
export function usePerformanceMonitoring() {
  const recordMetric = (
    name: string,
    value: number,
    tags?: Record<string, string>,
    unit?: string
  ) => {
    performanceMonitor.recordMetric(name, value, tags, unit);
  };

  const getMetrics = (name: string, startTime?: number, endTime?: number) => {
    return performanceMonitor.getMetrics(name, startTime, endTime);
  };

  const getStatistics = (name: string) => {
    return performanceMonitor.getStatistics(name);
  };

  const getActiveAlerts = () => {
    return performanceMonitor.getActiveAlerts();
  };

  const addAlertRule = (rule: AlertRule) => {
    performanceMonitor.addAlertRule(rule);
  };

  return {
    recordMetric,
    getMetrics,
    getStatistics,
    getActiveAlerts,
    addAlertRule,
  };
}
