/**
 * 异常告警管理服务
 * FixCycle 6.0 告警系统核心组件
 */

import { AlertEvent, MetricThreshold } from '@/types/monitoring.types';
import { logger } from '@/tech/utils/logger';

export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 指标名称 */
  metric: string;
  /** 条件操作?*/
  condition: 'above' | 'below' | 'equal' | 'change_rate';
  /** 阈?*/
  threshold: number;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** 是否启用 */
  enabled: boolean;
  /** 告警频率限制(�? */
  frequency_limit: number;
  /** 告警持续时间要求(�? */
  duration_threshold: number;
  /** 通知渠道 */
  notification_channels: ('email' | 'sms' | 'webhook' | 'slack')[];
  /** 告警模板 */
  template: {
    subject: string;
    message: string;
  };
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

export interface NotificationChannel {
  /** 渠道类型 */
  type: 'email' | 'sms' | 'webhook' | 'slack';
  /** 配置参数 */
  config: Record<string, any>;
  /** 是否启用 */
  enabled: boolean;
}

export interface AlertHistory {
  /** 历史记录ID */
  id: string;
  /** 关联告警ID */
  alert_id: string;
  /** 触发时间 */
  triggered_at: string;
  /** 解决时间 */
  resolved_at?: string;
  /** 告警?*/
  value: number;
  /** 处理状?*/
  status: 'triggered' | 'acknowledged' | 'resolved' | 'suppressed';
  /** 处理?*/
  handler?: string;
  /** 处理备注 */
  notes?: string;
}

export class AlertManager {
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private alertHistory: AlertHistory[] = [];
  private notificationChannels: NotificationChannel[] = [];
  private suppressionRules: Map<string, number> = new Map(); // 告警抑制规则

  constructor() {
    this.initializeDefaultRules();
    this.initializeNotificationChannels();
  }

  /**
   * 初始化默认告警规?   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'system_unavailable',
        name: '系统不可用告?,
        metric: 'system_availability',
        condition: 'below',
        threshold: 0.99,
        severity: 'critical',
        enabled: true,
        frequency_limit: 300, // 5分钟
        duration_threshold: 60, // 持续1分钟
        notification_channels: ['email', 'sms', 'webhook'],
        template: {
          subject: '🚨 系统可用性告?,
          message: '系统可用率低于阈?{{threshold}}%，当前值为 {{value}}%',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'high_error_rate',
        name: '高错误率告警',
        metric: 'error_rate',
        condition: 'above',
        threshold: 0.05,
        severity: 'error',
        enabled: true,
        frequency_limit: 180, // 3分钟
        duration_threshold: 120, // 持续2分钟
        notification_channels: ['email', 'webhook'],
        template: {
          subject: '⚠️ 错误率过高告?,
          message: '系统错误率超?{{threshold}}%，当前值为 {{value}}%',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'slow_response_time',
        name: '响应时间过慢告警',
        metric: 'api_response_time_avg',
        condition: 'above',
        threshold: 2000,
        severity: 'warning',
        enabled: true,
        frequency_limit: 600, // 10分钟
        duration_threshold: 300, // 持续5分钟
        notification_channels: ['email'],
        template: {
          subject: '⏱️ API响应时间过慢告警',
          message: 'API平均响应时间超过 {{threshold}}ms，当前值为 {{value}}ms',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'high_cpu_usage',
        name: 'CPU使用率过高告?,
        metric: 'cpu_utilization',
        condition: 'above',
        threshold: 85,
        severity: 'warning',
        enabled: true,
        frequency_limit: 300,
        duration_threshold: 180,
        notification_channels: ['email', 'webhook'],
        template: {
          subject: '🖥�?CPU使用率过高告?,
          message: 'CPU使用率超?{{threshold}}%，当前值为 {{value}}%',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'low_dau',
        name: '用户活跃度下降告?,
        metric: 'dau',
        condition: 'below',
        threshold: 10000,
        severity: 'warning',
        enabled: true,
        frequency_limit: 3600, // 1小时
        duration_threshold: 7200, // 持续2小时
        notification_channels: ['email'],
        template: {
          subject: '👥 用户活跃度下降告?,
          message: '日活跃用户数低于 {{threshold}}，当前值为 {{value}}',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });

    logger.info(`Initialized ${defaultRules.length} default alert rules`);
  }

  /**
   * 初始化通知渠道
   */
  private initializeNotificationChannels(): void {
    this.notificationChannels = [
      {
        type: 'email',
        config: {
          smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtp_port: parseInt(process.env.SMTP_PORT || '587'),
          username: process.env.SMTP_USERNAME || '',
          password: process.env.SMTP_PASSWORD || '',
          recipients: ['admin@fixcycle.com', 'ops@fixcycle.com'],
        },
        enabled: true,
      },
      {
        type: 'webhook',
        config: {
          urls: [
            process.env.WEBHOOK_URL_1 ||
              'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
            process.env.WEBHOOK_URL_2 ||
              'http://internal-alert-system:3000/webhook',
          ],
        },
        enabled: true,
      },
    ];

    logger.info(
      `Initialized ${this.notificationChannels.length} notification channels`
    );
  }

  /**
   * 评估指标是否触发告警
   */
  evaluateMetric(
    metricName: string,
    value: number,
    timestamp: number = Date.now()
  ): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled || rule.metric !== metricName) continue;

      // 检查条件是否满?      if (this.checkCondition(value, rule.condition, rule.threshold)) {
        // 检查持续时间要?        if (
          this.checkDurationRequirement(
            rule.id,
            metricName,
            value,
            timestamp,
            rule.duration_threshold
          )
        ) {
          // 检查频率限?          if (this.checkFrequencyLimit(rule.id, rule.frequency_limit)) {
            this.triggerAlert(rule, value, timestamp);
          }
        }
      } else {
        // 条件不满足，检查是否需要解除告?        this.checkAlertResolution(rule.id, value, timestamp);
      }
    }
  }

  /**
   * 检查告警条?   */
  private checkCondition(
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
      case 'change_rate':
        // 变化率检查需要历史数?        return this.checkChangeRate(value, threshold);
      default:
        return false;
    }
  }

  /**
   * 检查变化率
   */
  private checkChangeRate(currentValue: number, threshold: number): boolean {
    // 简化实现，实际需要维护历史数据来计算变化?    return Math.abs(currentValue) > threshold;
  }

  /**
   * 检查持续时间要?   */
  private checkDurationRequirement(
    ruleId: string,
    metricName: string,
    value: number,
    timestamp: number,
    durationThreshold: number
  ): boolean {
    const key = `${ruleId}_${metricName}`;
    const lastTriggerTime = this.suppressionRules.get(key) || 0;

    if (timestamp - lastTriggerTime >= durationThreshold) {
      return true;
    }

    return false;
  }

  /**
   * 检查频率限?   */
  private checkFrequencyLimit(ruleId: string, frequencyLimit: number): boolean {
    const lastAlertTime = this.getLastAlertTime(ruleId);
    if (!lastAlertTime) return true;

    const timeSinceLastAlert = Date.now() - lastAlertTime;
    return timeSinceLastAlert >= frequencyLimit * 1000;
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule,
    value: number,
    timestamp: number
  ): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alertEvent: AlertEvent = {
      id: alertId,
      rule_id: rule.id,
      metric_name: rule.metric,
      current_value: value,
      threshold: rule.threshold,
      severity: rule.severity,
      message: this.formatAlertMessage(
        rule.template.message,
        rule.threshold,
        value
      ),
      triggered_at: timestamp,
      status: 'triggered',
    };

    this.activeAlerts.set(alertId, alertEvent);

    // 记录告警历史
    this.addToAlertHistory({
      id: `history_${alertId}`,
      alert_id: alertId,
      triggered_at: new Date(timestamp).toISOString(),
      value,
      status: 'triggered',
    });

    // 更新抑制规则
    const suppressionKey = `${rule.id}_${rule.metric}`;
    this.suppressionRules.set(suppressionKey, timestamp);

    // 发送通知
    await this.sendNotifications(rule, alertEvent);

    logger.warn(`Alert triggered: ${rule.name} - ${alertEvent.message}`);
  }

  /**
   * 检查告警解?   */
  private checkAlertResolution(
    ruleId: string,
    value: number,
    timestamp: number
  ): void {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return;

    // 查找该规则的所有活跃告?    const ruleAlerts = Array.from(this.activeAlerts.values()).filter(
      alert => alert.rule_id === ruleId && alert.status === 'triggered'
    );

    for (const alert of ruleAlerts) {
      // 如果条件不再满足，则解除告警
      if (!this.checkCondition(value, rule.condition, rule.threshold)) {
        alert.status = 'resolved';
        alert.resolved_at = timestamp;

        // 更新历史记录
        const history = this.alertHistory.find(h => h.alert_id === alert.id);
        if (history) {
          history.resolved_at = new Date(timestamp).toISOString();
          history.status = 'resolved';
        }

        logger.info(`Alert resolved: ${rule.name} - ${alert.metric_name}`);
      }
    }
  }

  /**
   * 格式化告警消?   */
  private formatAlertMessage(
    template: string,
    threshold: number,
    value: number
  ): string {
    return template
      .replace('{{threshold}}', threshold.toString())
      .replace('{{value}}', value.toString());
  }

  /**
   * 发送通知
   */
  private async sendNotifications(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    const notifications = [];

    for (const channel of rule.notification_channels) {
      switch (channel) {
        case 'email':
          notifications.push(this.sendEmailNotification(rule, alert));
          break;
        case 'sms':
          notifications.push(this.sendSmsNotification(rule, alert));
          break;
        case 'webhook':
          notifications.push(this.sendWebhookNotification(rule, alert));
          break;
        case 'slack':
          notifications.push(this.sendSlackNotification(rule, alert));
          break;
      }
    }

    try {
      await Promise.all(notifications);
      logger.info(`Notifications sent for alert: ${alert.id}`);
    } catch (error) {
      logger.error('Failed to send notifications', error as Error);
    }
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    const channel = this.notificationChannels.find(c => c.type === 'email');
    if (!channel?.enabled) return;

    const subject = this.formatAlertMessage(
      rule.template.subject,
      rule.threshold,
      alert.current_value
    );
    const message = alert.message;

    // 实际实现中会调用邮件服务
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `📧 Sending email: ${subject} to ${channel.config.recipients.join(', ')}`
    );
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   Message: ${message}`)}

  /**
   * 发送短信通知
   */
  private async sendSmsNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    // 实际实现中会调用短信服务
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📱 SMS Alert: ${alert.message} [${alert.severity}]`)}

  /**
   * 发送Webhook通知
   */
  private async sendWebhookNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    const channel = this.notificationChannels.find(c => c.type === 'webhook');
    if (!channel?.enabled) return;

    const payload = {
      alert_id: alert.id,
      rule_id: alert.rule_id,
      metric: alert.metric_name,
      value: alert.current_value,
      threshold: alert.threshold,
      severity: alert.severity,
      message: alert.message,
      triggered_at: new Date(alert.triggered_at).toISOString(),
    };

    for (const url of channel.config.urls) {
      try {
        // 实际实现中会发送HTTP POST请求
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔗 Webhook to ${url}:`, JSON.stringify(payload, null, 2));
      } catch (error) {
        logger.error(`Failed to send webhook to ${url}`, error as Error);
      }
    }
  }

  /**
   * 发送Slack通知
   */
  private async sendSlackNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    // 实际实现中会调用Slack API
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💬 Slack Alert: ${alert.message} [${alert.severity}]`)}

  /**
   * 获取最后一次告警时?   */
  private getLastAlertTime(ruleId: string): number | null {
    const recentAlerts = this.alertHistory
      .filter(h => h.alert_id.includes(ruleId))
      .sort(
        (a, b) =>
          new Date(b.triggered_at).getTime() -
          new Date(a.triggered_at).getTime()
      );

    return recentAlerts.length > 0
      ? new Date(recentAlerts[0].triggered_at).getTime()
      : null;
  }

  /**
   * 添加到告警历?   */
  private addToAlertHistory(history: AlertHistory): void {
    this.alertHistory.push(history);
    // 保持历史记录在合理范围内
    if (this.alertHistory.length > 10000) {
      this.alertHistory = this.alertHistory.slice(-5000);
    }
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'triggered')
      .sort((a, b) => b.triggered_at - a.triggered_at);
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit: number = 50): AlertHistory[] {
    return this.alertHistory
      .slice(-limit)
      .sort(
        (a, b) =>
          new Date(b.triggered_at).getTime() -
          new Date(a.triggered_at).getTime()
      );
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string, handler: string, notes?: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'triggered') {
      return false;
    }

    alert.status = 'acknowledged';

    const history = this.alertHistory.find(h => h.alert_id === alertId);
    if (history) {
      history.status = 'acknowledged';
      history.handler = handler;
      history.notes = notes;
    }

    logger.info(`Alert acknowledged: ${alertId} by ${handler}`);
    return true;
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string, handler?: string, notes?: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.status = 'resolved';
    alert.resolved_at = Date.now();

    const history = this.alertHistory.find(h => h.alert_id === alertId);
    if (history) {
      history.status = 'resolved';
      history.resolved_at = new Date().toISOString();
      if (handler) history.handler = handler;
      if (notes) history.notes = notes;
    }

    logger.info(`Alert resolved: ${alertId}`);
    return true;
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    rule.created_at = new Date().toISOString();
    rule.updated_at = new Date().toISOString();
    this.alertRules.set(rule.id, rule);
    logger.info(`Alert rule added: ${rule.name}`);
  }

  /**
   * 更新告警规则
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      return false;
    }

    Object.assign(rule, updates, { updated_at: new Date().toISOString() });
    this.alertRules.set(ruleId, rule);
    logger.info(`Alert rule updated: ${rule.name}`);
    return true;
  }

  /**
   * 删除告警规则
   */
  deleteAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      return false;
    }

    this.alertRules.delete(ruleId);
    logger.info(`Alert rule deleted: ${rule.name}`);
    return true;
  }

  /**
   * 获取所有告警规?   */
  getAllAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalRules: number;
    activeAlerts: number;
    alertHistoryCount: number;
    notificationChannels: number;
  } {
    return {
      totalRules: this.alertRules.size,
      activeAlerts: this.getActiveAlerts().length,
      alertHistoryCount: this.alertHistory.length,
      notificationChannels: this.notificationChannels.filter(c => c.enabled)
        .length,
    };
  }
}

// 导出全局告警管理器实?export const alertManager = new AlertManager();
