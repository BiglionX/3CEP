// 监控告警集成
// 集成系统监控和告警机?

import { createClient } from '@supabase/supabase-js';

interface SystemMetric {
  metric_name: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  condition: 'above' | 'below' | 'equal';
  threshold: number;
  duration: number; // 持续时间(�?
  severity: 'warning' | 'error' | 'critical';
  enabled: boolean;
  notification_channels: string[]; // ['email', 'slack', 'sms']
  recipients: string[];
  created_at: string;
  updated_at: string;
}

interface AlertEvent {
  id: string;
  rule_id: string;
  metric_name: string;
  current_value: number;
  threshold: number;
  severity: string;
  triggered_at: string;
  resolved_at?: string;
  status: 'triggered' | 'acknowledged' | 'resolved';
  notifications_sent: string[];
}

export class MonitoringAlertingSystem {
  private supabase: any;
  private metricsBuffer: SystemMetric[] = [];
  private readonly BUFFER_SIZE = 100;
  private alertCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 启动定期检?
    this.startAlertChecking();
  }

  /**
   * 记录系统指标
   */
  async recordMetric(
    metricName: string,
    value: number,
    threshold: number,
    unit: string = '',
    source: string = 'system'
  ): Promise<void> {
    const metric: SystemMetric = {
      metric_name: metricName,
      value,
      threshold,
      unit,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(value, threshold),
      source,
    };

    // 添加到缓冲区
    this.metricsBuffer.push(metric);

    // 如果缓冲区满了，批量写入数据?
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetrics();
    }

    // 实时检查告警规?
    await this.checkAlertRules(metric);
  }

  /**
   * 确定指标严重程度
   */
  private determineSeverity(
    value: number,
    threshold: number
  ): 'info' | 'warning' | 'error' | 'critical' {
    const ratio = value / threshold;

    if (ratio >= 1.5) return 'critical';
    if (ratio >= 1.2) return 'error';
    if (ratio >= 1.0) return 'warning';
    return 'info';
  }

  /**
   * 检查告警规?
   */
  private async checkAlertRules(metric: SystemMetric): Promise<void> {
    try {
      // 获取启用的告警规?
      const { data: rules, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('enabled', true)
        .eq('metric_name', metric.metric_name);

      if (error) throw error;

      // 检查每条规?
      for (const rule of rules || []) {
        if (this.shouldTriggerAlert(rule, metric)) {
          await this.triggerAlert(rule, metric);
        }
      }
    } catch (error) {
      console.error('检查告警规则失?', error);
    }
  }

  /**
   * 判断是否触发告警
   */
  private shouldTriggerAlert(rule: AlertRule, metric: SystemMetric): boolean {
    switch (rule.condition) {
      case 'above':
        return metric.value > rule.threshold;
      case 'below':
        return metric.value < rule.threshold;
      case 'equal':
        return Math.abs(metric.value - rule.threshold) < 0.001;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule,
    metric: SystemMetric
  ): Promise<void> {
    try {
      // 创建告警事件
      const alertEvent: AlertEvent = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rule_id: rule.id,
        metric_name: metric.metric_name,
        current_value: metric.value,
        threshold: rule.threshold,
        severity: rule.severity,
        triggered_at: new Date().toISOString(),
        status: 'triggered',
        notifications_sent: [],
      };

      // 保存告警事件
      const { error: insertError } = await this.supabase
        .from('alert_events')
        .insert(alertEvent);

      if (insertError) throw insertError;

      // 发送通知
      await this.sendNotifications(rule, alertEvent);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `🚨 告警已触? ${rule.name} - ${metric.metric_name} = ${metric.value}`
      )} catch (error) {
      console.error('触发告警失败:', error);
    }
  }

  /**
   * 发送通知
   */
  private async sendNotifications(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    const notifications = [];

    // 发送邮件通知
    if (rule.notification_channels.includes('email')) {
      await this.sendEmailNotification(rule, alert);
      notifications.push('email');
    }

    // 发送Slack通知
    if (rule.notification_channels.includes('slack')) {
      await this.sendSlackNotification(rule, alert);
      notifications.push('slack');
    }

    // 发送短信通知
    if (rule.notification_channels.includes('sms')) {
      await this.sendSmsNotification(rule, alert);
      notifications.push('sms');
    }

    // 更新已发送的通知记录
    if (notifications.length > 0) {
      await this.supabase
        .from('alert_events')
        .update({ notifications_sent: notifications }) as any
        .eq('id', alert.id);
    }
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    try {
      // 模拟邮件发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送邮件告警给: ${rule.recipients.join(', ')}`);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`主题: ${rule.name} 告警`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `内容: 指标 ${alert.metric_name} 当前?${alert.current_value} 超过阈?${alert.threshold}`
      )// 实际应用中应该调用邮件服务API
      // await emailService.send({
      //   to: rule.recipients,
      //   subject: `${rule.name} 告警`,
      //   html: this.generateAlertEmail(rule, alert)
      // })
    } catch (error) {
      console.error('发送邮件通知失败:', error);
    }
  }

  /**
   * 发送Slack通知
   */
  private async sendSlackNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    try {
      // 模拟Slack消息发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💬 发送Slack告警到频道`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `消息: ${rule.name} 告警 - ${alert.metric_name}: ${alert.current_value}`
      )// 实际应用中应该调用Slack API
      // await slackService.sendMessage({
      //   channel: '#alerts',
      //   text: this.generateSlackMessage(rule, alert)
      // })
    } catch (error) {
      console.error('发送Slack通知失败:', error);
    }
  }

  /**
   * 发送短信通知
   */
  private async sendSmsNotification(
    rule: AlertRule,
    alert: AlertEvent
  ): Promise<void> {
    try {
      // 模拟短信发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📱 发送短信告警给: ${rule.recipients.join(', ')}`);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `内容: ${rule.name} 告警 - ${alert.metric_name}: ${alert.current_value}`
      )// 实际应用中应该调用短信服务API
      // await smsService.send({
      //   phones: rule.recipients,
      //   message: this.generateSmsMessage(rule, alert)
      // })
    } catch (error) {
      console.error('发送短信通知失败:', error);
    }
  }

  /**
   * 批量刷新指标数据
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const { error } = await this.supabase
        .from('system_metrics')
        .insert(this.metricsBuffer);

      if (error) throw error;

      // 清空缓冲?
      this.metricsBuffer = [];
    } catch (error) {
      console.error('刷新指标数据失败:', error);
    }
  }

  /**
   * 启动定期告警检?
   */
  private startAlertChecking(): void {
    this.alertCheckInterval = setInterval(async () => {
      try {
        await this.checkPendingAlerts();
        await this.flushMetrics();
      } catch (error) {
        console.error('定期检查失?', error);
      }
    }, 30000); // �?0秒检查一?
  }

  /**
   * 检查待处理的告?
   */
  private async checkPendingAlerts(): Promise<void> {
    try {
      // 获取未解决的告警
      const { data: pendingAlerts, error } = await this.supabase
        .from('alert_events')
        .select('*')
        .eq('status', 'triggered')
        .lt('triggered_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5分钟前的告警

      if (error) throw error;

      // 自动解决已恢复的告警
      for (const alert of pendingAlerts || []) {
        const currentValue = await this.getCurrentMetricValue(
          alert.metric_name
        );
        if (
          currentValue !== null &&
          this.isAlertResolved(alert, currentValue)
        ) {
          await this.resolveAlert(alert.id);
        }
      }
    } catch (error) {
      console.error('检查待处理告警失败:', error);
    }
  }

  /**
   * 获取当前指标?
   */
  private async getCurrentMetricValue(
    metricName: string
  ): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('value')
        .eq('metric_name', metricName)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? data.value : null;
    } catch (error) {
      console.error('获取当前指标值失?', error);
      return null;
    }
  }

  /**
   * 判断告警是否已解?
   */
  private isAlertResolved(alert: AlertEvent, currentValue: number): boolean {
    // 简单的解决逻辑：当前值回到正常范围内
    return Math.abs(currentValue - alert.threshold) > 0.1;
  }

  /**
   * 解决告警
   */
  private async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('alert_events')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        }) as any
        .eq('id', alertId);

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?告警已解? ${alertId}`)} catch (error) {
      console.error('解决告警失败:', error);
    }
  }

  /**
   * 获取系统健康状?
   */
  async getSystemHealth(): Promise<any> {
    try {
      // 获取最近的指标数据
      const { data: recentMetrics, error: metricsError } = await this.supabase
        .from('system_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 最?小时
        .order('timestamp', { ascending: false })
        .limit(100);

      if (metricsError) throw metricsError;

      // 获取活跃告警
      const { data: activeAlerts, error: alertsError } = await this.supabase
        .from('alert_events')
        .select('*')
        .eq('status', 'triggered')
        .order('triggered_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      // 计算健康分数
      const totalMetrics = recentMetrics?.length || 0;
      const criticalMetrics =
        recentMetrics?.filter((m: any) => m.severity === 'critical').length ||
        0;
      const errorMetrics =
        recentMetrics?.filter((m: any) => m.severity === 'error').length || 0;

      const healthScore =
        totalMetrics > 0
          ? Math.max(0, 100 - (criticalMetrics * 20 + errorMetrics * 10))
          : 100;

      return {
        health_score: healthScore,
        status:
          healthScore >= 80
            ? 'healthy'
            : healthScore >= 60
              ? 'warning'
              : 'critical',
        total_metrics: totalMetrics,
        critical_metrics: criticalMetrics,
        error_metrics: errorMetrics,
        active_alerts: activeAlerts?.length || 0,
        recent_alerts: activeAlerts || [],
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('获取系统健康状态失?', error);
      return {
        health_score: 0,
        status: 'unknown',
        total_metrics: 0,
        critical_metrics: 0,
        error_metrics: 0,
        active_alerts: 0,
        recent_alerts: [],
        last_updated: new Date().toISOString(),
        error: (error as Error).message,
      };
    }
  }

  /**
   * 关闭监控系统
   */
  async shutdown(): Promise<void> {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
    }

    // 刷新剩余的指标数?
    await this.flushMetrics();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('监控告警系统已关?)}
}

// 导出实例
export const monitoringSystem = new MonitoringAlertingSystem();

// 健康检查API端点
export async function GET() {
  try {
    const health = await monitoringSystem.getSystemHealth();
    return new Response(
      JSON.stringify({
        success: true,
        health: health,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

// 指标上报API端点
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metric_name, value, threshold, unit, source } = body;

    await monitoringSystem.recordMetric(
      metric_name,
      value,
      threshold,
      unit || '',
      source || 'api'
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: '指标已记?,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
