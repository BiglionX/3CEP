// 实时数据监控和告警服务

// 监控指标接口
export interface MonitoringMetric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

// 通知渠道类型
export type NotificationChannel = 'console' | 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';

// 告警规则接口
export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equal' | 'change' | 'anomaly';
  threshold: number;
  duration: number; // 持续时间（秒）
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  enabled: boolean;
  notifications: NotificationChannel[]; // 通知渠道
  escalationPolicy?: EscalationPolicy;
  suppressionRules?: SuppressionRule[];
  description?: string;
}

// 告警升级策略
export interface EscalationPolicy {
  levels: EscalationLevel[];
  repeatInterval?: number; // 重复通知间隔（秒）
}

export interface EscalationLevel {
  level: number;
  channels: NotificationChannel[];
  targets: string[]; // 通知目标
  delay: number; // 延迟时间（秒）
}

// 告警抑制规则
export interface SuppressionRule {
  id: string;
  name: string;
  condition: SuppressionCondition;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export type SuppressionCondition = 'time_window' | 'maintenance_window' | 'known_issue';

// 告警事件接口
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  triggeredAt: string;
  resolvedAt?: string;
  status: 'triggered' | 'resolved' | 'acknowledged';
}

// 数据质量指标
export interface DataQualityMetric {
  tableName: string;
  metricType: 'completeness' | 'accuracy' | 'consistency' | 'timeliness';
  score: number; // 0-100
  sampleSize: number;
  issues: string[];
  lastChecked: string;
}

// 通知配置接口
export interface NotificationConfig {
  email?: EmailConfig;
  slack?: SlackConfig;
  webhook?: WebhookConfig;
  sms?: SMSConfig;
  pagerduty?: PagerDutyConfig;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromAddress: string;
  toAddresses: string[];
}

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
}

export interface WebhookConfig {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
}

export interface SMSConfig {
  provider: 'twilio' | 'aliyun';
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
  toNumbers: string[];
}

export interface PagerDutyConfig {
  integrationKey: string;
  apiUrl?: string;
}

// 监控服务类
export class MonitoringService {
  private metrics: Map<string, MonitoringMetric[]> = new Map();
  public alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private dataQualityMetrics: Map<string, DataQualityMetric> = new Map();
  private retentionPeriod: number = 24 * 60 * 60 * 1000; // 24小时
  private notificationConfig: NotificationConfig = {};
  private alertHistory: AlertEvent[] = [];
  private maxAlertHistory: number = 1000;

  // 记录监控指标
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MonitoringMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // 清理过期数据
    this.cleanupExpiredMetrics(name);
    
    // 检查告警规则
    this.checkAlertRules(name, value);
  }

  // 添加告警规则
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`✅ 添加告警规则: ${rule.name}`);
  }

  // 检查告警规则
  private checkAlertRules(metricName: string, currentValue: number): void {
    for (const [ruleId, rule] of this.alertRules.entries()) {
      if (!rule.enabled || rule.metric !== metricName) continue;

      const shouldTrigger = this.evaluateCondition(currentValue, rule.condition, rule.threshold);
      
      if (shouldTrigger) {
        const existingAlert = Array.from(this.activeAlerts.values())
          .find(alert => alert.ruleId === ruleId && alert.status === 'triggered');

        if (!existingAlert) {
          this.triggerAlert(rule, currentValue);
        }
      } else {
        // 检查是否应该解除告警
        this.checkAlertResolution(ruleId, currentValue);
      }
    }
  }

  // 评估告警条件
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
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
  private triggerAlert(rule: AlertRule, currentValue: number): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alertEvent: AlertEvent = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      triggeredAt: new Date().toISOString(),
      status: 'triggered'
    };

    this.activeAlerts.set(alertId, alertEvent);
    console.log(`🚨 告警触发: ${rule.name} (${currentValue} ${rule.condition} ${rule.threshold})`);
    
    // 发送通知
    this.sendNotifications(alertEvent);
  }

  // 检查告警解除
  private checkAlertResolution(ruleId: string, currentValue: number): void {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return;

    const alertsToResolve = Array.from(this.activeAlerts.values())
      .filter(alert => 
        alert.ruleId === ruleId && 
        alert.status === 'triggered' &&
        !this.evaluateCondition(currentValue, rule.condition, rule.threshold)
      );

    alertsToResolve.forEach(alert => {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
      console.log(`✅ 告警解除: ${alert.ruleName}`);
    });
  }

  // 配置通知渠道
  configureNotifications(config: NotificationConfig): void {
    this.notificationConfig = { ...this.notificationConfig, ...config };
    console.log('✅ 通知渠道配置已更新');
  }

  // 发送通知
  private async sendNotifications(alert: AlertEvent): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) return;

    // 检查抑制规则
    if (this.shouldSuppressAlert(alert, rule)) {
      console.log(`🔇 告警被抑制: ${alert.ruleName}`);
      return;
    }

    // 处理升级策略
    if (rule.escalationPolicy) {
      await this.handleEscalation(alert, rule);
    } else {
      // 默认通知
      for (const channel of rule.notifications) {
        await this.sendNotificationToChannel(channel, alert, rule);
      }
    }

    // 记录告警历史
    this.addToAlertHistory(alert);
  }

  // 检查是否应该抑制告警
  private shouldSuppressAlert(alert: AlertEvent, rule: AlertRule): boolean {
    if (!rule.suppressionRules || rule.suppressionRules.length === 0) {
      return false;
    }

    const now = new Date();
    return rule.suppressionRules.some(rule => {
      if (!rule.enabled) return false;
      
      const start = new Date(rule.startTime);
      const end = new Date(rule.endTime);
      return now >= start && now <= end;
    });
  }

  // 处理告警升级
  private async handleEscalation(alert: AlertEvent, rule: AlertRule): Promise<void> {
    if (!rule.escalationPolicy) return;
    
    const sortedLevels = [...rule.escalationPolicy.levels].sort((a, b) => a.level - b.level);
    
    for (const level of sortedLevels) {
      // 延迟发送
      if (level.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, level.delay * 1000));
      }
      
      // 发送到该级别的所有渠道
      for (const channel of level.channels) {
        await this.sendNotificationToChannel(channel, alert, rule, level.targets);
      }
    }
  }

  // 发送到指定渠道
  private async sendNotificationToChannel(
    channel: NotificationChannel, 
    alert: AlertEvent, 
    rule: AlertRule,
    targets?: string[]
  ): Promise<void> {
    try {
      switch (channel) {
        case 'console':
          this.sendConsoleNotification(alert);
          break;
        case 'email':
          await this.sendEmailNotification(alert, targets);
          break;
        case 'slack':
          await this.sendSlackNotification(alert);
          break;
        case 'webhook':
          await this.sendWebhookNotification(alert);
          break;
        case 'sms':
          await this.sendSMSNotification(alert, targets);
          break;
        case 'pagerduty':
          await this.sendPagerDutyNotification(alert);
          break;
      }
    } catch (error) {
      console.error(`❌ ${channel}通知发送失败:`, error);
    }
  }

  // 控制台通知
  private sendConsoleNotification(alert: AlertEvent): void {
    const severityEmoji = {
      'info': 'ℹ️',
      'warning': '⚠️',
      'critical': '🚨',
      'emergency': '🆘'
    }[alert.severity] || '📢';
    
    console.log(`${severityEmoji} [${alert.severity.toUpperCase()}] ${alert.ruleName}: ${alert.currentValue}`);
  }

  // 邮件通知
  private async sendEmailNotification(alert: AlertEvent, targets?: string[]): Promise<void> {
    if (!this.notificationConfig.email) {
      console.warn('⚠️ 邮件配置未设置');
      return;
    }
    
    const recipients = targets || this.notificationConfig.email.toAddresses;
    console.log(`📧 发送邮件告警到: ${recipients.join(', ')}`);
    // 这里应该集成实际的邮件服务
  }

  // Slack通知
  private async sendSlackNotification(alert: AlertEvent): Promise<void> {
    if (!this.notificationConfig.slack) {
      console.warn('⚠️ Slack配置未设置');
      return;
    }
    
    console.log(`💬 发送Slack告警到: ${this.notificationConfig.slack.channel || '默认频道'}`);
    // 这里应该发送HTTP请求到Slack webhook
  }

  // Webhook通知
  private async sendWebhookNotification(alert: AlertEvent): Promise<void> {
    if (!this.notificationConfig.webhook) {
      console.warn('⚠️ Webhook配置未设置');
      return;
    }
    
    console.log(`🔗 发送Webhook告警到: ${this.notificationConfig.webhook.url}`);
    // 这里应该发送HTTP请求到webhook地址
  }

  // SMS通知
  private async sendSMSNotification(alert: AlertEvent, targets?: string[]): Promise<void> {
    if (!this.notificationConfig.sms) {
      console.warn('⚠️ SMS配置未设置');
      return;
    }
    
    const recipients = targets || this.notificationConfig.sms.toNumbers;
    console.log(`📱 发送短信告警到: ${recipients.join(', ')}`);
    // 这里应该集成SMS服务提供商API
  }

  // PagerDuty通知
  private async sendPagerDutyNotification(alert: AlertEvent): Promise<void> {
    if (!this.notificationConfig.pagerduty) {
      console.warn('⚠️ PagerDuty配置未设置');
      return;
    }
    
    console.log(`📟 发送PagerDuty告警`);
    // 这里应该集成PagerDuty API
  }

  // 记录告警历史
  private addToAlertHistory(alert: AlertEvent): void {
    this.alertHistory.push(alert);
    // 保持历史记录在限制范围内
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory.shift();
    }
  }

  // 获取告警历史
  getAlertHistory(limit: number = 50): AlertEvent[] {
    return this.alertHistory.slice(-limit);
  }

  // 获取统计信息
  getMonitoringStats(): {
    totalMetrics: number;
    totalAlertRules: number;
    activeAlerts: number;
    alertHistoryCount: number;
  } {
    return {
      totalMetrics: this.metrics.size,
      totalAlertRules: this.alertRules.size,
      activeAlerts: this.getActiveAlerts().length,
      alertHistoryCount: this.alertHistory.length
    };
  }

  // 记录数据质量指标
  recordDataQuality(metric: DataQualityMetric): void {
    const key = `${metric.tableName}_${metric.metricType}`;
    this.dataQualityMetrics.set(key, metric);
    console.log(`📊 数据质量记录: ${key} = ${metric.score}%`);
  }

  // 获取监控指标
  getMetrics(metricName?: string, limit: number = 100): MonitoringMetric[] {
    if (metricName) {
      return this.metrics.get(metricName)?.slice(-limit) || [];
    }
    
    // 返回所有指标的最新值
    const allMetrics: MonitoringMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics.slice(-10)); // 每个指标最多10个最新值
    }
    return allMetrics.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  }

  // 获取活跃告警
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'triggered')
      .sort((a, b) => 
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
      );
  }

  // 获取数据质量报告
  getDataQualityReport(): {
    overallScore: number;
    metrics: DataQualityMetric[];
    issues: string[];
  } {
    const metrics = Array.from(this.dataQualityMetrics.values());
    const overallScore = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length || 0;
    
    const issues = metrics
      .filter(m => m.score < 80)
      .flatMap(m => m.issues);

    return {
      overallScore: Math.round(overallScore),
      metrics,
      issues
    };
  }

  // 清理过期指标
  private cleanupExpiredMetrics(metricName: string): void {
    const metrics = this.metrics.get(metricName);
    if (!metrics) return;

    const cutoffTime = Date.now() - this.retentionPeriod;
    const filteredMetrics = metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    );

    if (filteredMetrics.length !== metrics.length) {
      this.metrics.set(metricName, filteredMetrics);
    }
  }

  // 添加预设的监控规则
  setupDefaultAlerts(): void {
    // 查询响应时间告警
    this.addAlertRule({
      id: 'query_response_time',
      name: '查询响应时间过高',
      metric: 'query_response_time',
      condition: 'above',
      threshold: 2000, // 2秒
      duration: 300, // 5分钟
      severity: 'warning',
      enabled: true,
      notifications: ['console', 'email']
    });

    // 缓存命中率告警
    this.addAlertRule({
      id: 'cache_hit_rate',
      name: '缓存命中率过低',
      metric: 'cache_hit_rate',
      condition: 'below',
      threshold: 70, // 70%
      duration: 600, // 10分钟
      severity: 'warning',
      enabled: true,
      notifications: ['console']
    });

    // 数据库连接数告警
    this.addAlertRule({
      id: 'db_connections',
      name: '数据库连接数过多',
      metric: 'db_active_connections',
      condition: 'above',
      threshold: 50,
      duration: 300,
      severity: 'critical',
      enabled: true,
      notifications: ['console', 'email', 'webhook']
    });

    // 数据质量综合告警
    this.addAlertRule({
      id: 'data_quality_overall',
      name: '数据质量综合评分过低',
      metric: 'data_quality_overall_score',
      condition: 'below',
      threshold: 70,
      duration: 900, // 15分钟
      severity: 'critical',
      enabled: true,
      notifications: ['console', 'email', 'slack'],
      description: '整体数据质量评分低于阈值'
    });

    // 特定表数据质量告警
    this.addAlertRule({
      id: 'data_quality_parts',
      name: '配件数据质量异常',
      metric: 'data_quality_parts_score',
      condition: 'below',
      threshold: 80,
      duration: 600,
      severity: 'warning',
      enabled: true,
      notifications: ['console', 'email'],
      description: '配件相关数据质量评分异常'
    });

    // 实时处理错误率告警
    this.addAlertRule({
      id: 'realtime_error_rate',
      name: '实时处理错误率过高',
      metric: 'realtime_error_rate',
      condition: 'above',
      threshold: 5, // 5%
      duration: 300,
      severity: 'warning',
      enabled: true,
      notifications: ['console', 'pagerduty'],
      description: '实时数据处理错误率超过阈值'
    });

    // 系统健康状态告警
    this.addAlertRule({
      id: 'system_health',
      name: '系统健康状态异常',
      metric: 'system_health_status',
      condition: 'below',
      threshold: 80, // 80分
      duration: 600,
      severity: 'critical',
      enabled: true,
      notifications: ['console', 'email', 'sms'],
      description: '系统整体健康评分低于阈值'
    });
  }
}

// 导出实例
export const monitoringService = new MonitoringService();

// 设置默认告警规则
monitoringService.setupDefaultAlerts();