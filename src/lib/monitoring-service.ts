/**
 * 系统监控服务
 * FixCycle 6.0 核心监控引擎
 */

import {
  MonitoringSnapshot,
  MetricThreshold,
  AlertEvent,
  MonitoringConfig,
  NumericMetric,
  HistogramMetric,
  CounterMetric,
  GaugeMetric,
  UserActivityMetrics,
  TransactionMetrics,
  AgentMarketMetrics,
  RevenueMetrics,
  SystemPerformanceMetrics,
  ResourceMetrics,
  ApplicationMetrics,
  UserBehaviorMetrics,
  InteractionMetrics,
  AccessSecurityMetrics,
  DataSecurityMetrics,
  ApplicationSecurityMetrics,
} from '@/types/monitoring.types';

import { logger } from '@/tech/utils/logger';

export class MonitoringService {
  private metrics: Map<string, any[]> = new Map();
  private alertRules: Map<string, MetricThreshold> = new Map();
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private config: MonitoringConfig;
  private collectionTimer: NodeJS.Timeout | null = null;
  private alertTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      collection_interval: 10000, // 10�?      retention_days: 7, // 7�?      alert_evaluation_interval: 30, // 30�?      sample_rate: 1.0, // 100%采样
      enabled_metrics: [],
      notification_config: {
        email: true,
        sms: false,
        webhook: [],
      },
      ...config,
    };

    this.startCollection();
    this.startAlertEvaluation();
  }

  /**
   * 记录数值型指标
   */
  recordNumericMetric(
    name: string,
    value: number,
    description: string,
    unit: string = '',
    labels?: Record<string, string>
  ): void {
    if (Math.random() > this.config.sample_rate) {
      return;
    }

    const metric: NumericMetric = {
      name,
      description,
      unit,
      labels,
      timestamp: Date.now(),
      value,
    };

    this.storeMetric(name, metric);
    this.checkAlertRules(name, value);
  }

  /**
   * 记录计数器指?   */
  recordCounterMetric(
    name: string,
    increment: number = 1,
    description: string = '',
    unit: string = '',
    labels?: Record<string, string>
  ): void {
    const counterKey = `counter_${name}`;
    let currentValue = 0;

    if (this.metrics.has(counterKey)) {
      const lastMetric = this.metrics.get(counterKey)!.slice(-1)[0];
      currentValue = lastMetric.count || 0;
    }

    const newCount = currentValue + increment;

    const metric: CounterMetric = {
      name,
      description,
      unit,
      labels,
      timestamp: Date.now(),
      count: newCount,
    };

    this.storeMetric(counterKey, metric);
    this.checkAlertRules(name, newCount);
  }

  /**
   * 记录直方图指?   */
  recordHistogramMetric(
    name: string,
    value: number,
    description: string = '',
    unit: string = '',
    labels?: Record<string, string>
  ): void {
    const histogramKey = `histogram_${name}`;
    let values: number[] = [];

    if (this.metrics.has(histogramKey)) {
      const storedValues = this.metrics.get(histogramKey) || [];
      values = storedValues.map((m: any) => m.value);
    }

    values.push(value);

    // 保持最?000个值用于统计计?    if (values.length > 1000) {
      values = values.slice(-1000);
    }

    const stats = this.calculateHistogramStats(values);

    const metric: HistogramMetric = {
      name,
      description,
      unit,
      labels,
      timestamp: Date.now(),
      ...stats,
    };

    this.storeMetric(histogramKey, metric);
    this.checkAlertRules(name, stats.average);
  }

  /**
   * 记录仪表盘指?   */
  recordGaugeMetric(
    name: string,
    value: number,
    description: string = '',
    unit: string = '',
    labels?: Record<string, string>
  ): void {
    const metric: GaugeMetric = {
      name,
      description,
      unit,
      labels,
      timestamp: Date.now(),
      value,
    };

    this.storeMetric(`gauge_${name}`, metric);
    this.checkAlertRules(name, value);
  }

  /**
   * 存储指标数据
   */
  private storeMetric(key: string, metric: any): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricList = this.metrics.get(key)!;
    metricList.push(metric);

    // 清理过期数据
    this.cleanupExpiredMetrics(key);
  }

  /**
   * 清理过期指标数据
   */
  private cleanupExpiredMetrics(key: string): void {
    const metrics = this.metrics.get(key);
    if (!metrics) return;

    const cutoffTime =
      Date.now() - this.config.retention_days * 24 * 60 * 60 * 1000;
    const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);

    if (filteredMetrics.length !== metrics.length) {
      this.metrics.set(key, filteredMetrics);
    }
  }

  /**
   * 计算直方图统计?   */
  private calculateHistogramStats(
    values: number[]
  ): Omit<HistogramMetric, keyof NumericMetric> {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;

    return {
      count: values.length,
      sum,
      average,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 50),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  /**
   * 计算百分位数
   */
  private percentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sortedArray[lower];
    }

    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: MetricThreshold): void {
    this.alertRules.set(rule.metric_name, rule);
    logger.info(`Added alert rule for metric: ${rule.metric_name}`);
  }

  /**
   * 检查告警规?   */
  private checkAlertRules(metricName: string, currentValue: number): void {
    for (const [ruleName, rule] of this.alertRules.entries()) {
      if (!rule.enabled || rule.metric_name !== metricName) continue;

      const shouldTrigger = this.evaluateCondition(
        currentValue,
        rule.operator,
        rule.critical_threshold
      );

      if (shouldTrigger) {
        const existingAlert = Array.from(this.activeAlerts.values()).find(
          alert =>
            alert.metric_name === metricName && alert.status === 'triggered'
        );

        if (!existingAlert) {
          this.triggerAlert(rule, currentValue);
        }
      } else {
        // 检查是否应该解除告?        this.checkAlertResolution(ruleName, currentValue);
      }
    }
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
  private triggerAlert(rule: MetricThreshold, currentValue: number): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alertEvent: AlertEvent = {
      id: alertId,
      rule_id: rule.metric_name,
      metric_name: rule.metric_name,
      current_value: currentValue,
      threshold: rule.critical_threshold,
      severity: rule.severity,
      message: `${rule.metric_name} ${rule.operator} ${rule.critical_threshold} (当前? ${currentValue})`,
      triggered_at: Date.now(),
      status: 'triggered',
    };

    this.activeAlerts.set(alertId, alertEvent);
    this.sendAlertNotification(alertEvent);
    logger.warn(`Alert triggered: ${alertEvent.message}`);
  }

  /**
   * 检查告警解?   */
  private checkAlertResolution(ruleName: string, currentValue: number): void {
    const rule = this.alertRules.get(ruleName);
    if (!rule) return;

    const shouldResolve = !this.evaluateCondition(
      currentValue,
      rule.operator,
      rule.critical_threshold
    );

    if (shouldResolve) {
      const activeAlert = Array.from(this.activeAlerts.values()).find(
        alert => alert.metric_name === ruleName && alert.status === 'triggered'
      );

      if (activeAlert) {
        activeAlert.status = 'resolved';
        activeAlert.resolved_at = Date.now();
        logger.info(`Alert resolved: ${activeAlert.metric_name}`);
      }
    }
  }

  /**
   * 发送告警通知
   */
  private async sendAlertNotification(alert: AlertEvent): Promise<void> {
    try {
      // 发送邮件通知
      if (this.config.notification_config.email) {
        await this.sendEmailNotification(alert);
      }

      // 发送到Webhook
      for (const webhook of this.config.notification_config.webhook) {
        await this.sendWebhookNotification(webhook, alert);
      }

      logger.info(`Alert notification sent for: ${alert.metric_name}`);
    } catch (error) {
      logger.error('Failed to send alert notification', error as Error);
    }
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(alert: AlertEvent): Promise<void> {
    // 实际实现中这里会调用邮件服务
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 Email Alert: ${alert.message} [${alert.severity}]`)}

  /**
   * 发送Webhook通知
   */
  private async sendWebhookNotification(
    webhookUrl: string,
    alert: AlertEvent
  ): Promise<void> {
    // 实际实现中这里会发送HTTP请求到webhook
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔗 Webhook Alert to ${webhookUrl}: ${alert.message}`)}

  /**
   * 获取监控快照
   */
  getPerformanceSnapshot(): MonitoringSnapshot {
    return {
      timestamp: Date.now(),
      business: {
        user_activity: this.getUserActivityMetrics(),
        transactions: this.getTransactionMetrics(),
        agent_market: this.getAgentMarketMetrics(),
        revenue: this.getRevenueMetrics(),
      },
      technical: {
        system_performance: this.getSystemPerformanceMetrics(),
        resources: this.getResourceMetrics(),
        application: this.getApplicationMetrics(),
      },
      user_experience: {
        behavior: this.getUserBehaviorMetrics(),
        interaction: this.getInteractionMetrics(),
      },
      security: {
        access: this.getAccessSecurityMetrics(),
        data: this.getDataSecurityMetrics(),
        application: this.getApplicationSecurityMetrics(),
      },
    };
  }

  // ==================== 各类指标获取方法 ====================

  private getUserActivityMetrics(): UserActivityMetrics {
    // 实际实现中从存储中获取真实数?    return {
      dau: this.getMetricValue('dau', 15000),
      wau: this.getMetricValue('wau', 45000),
      mau: this.getMetricValue('mau', 120000),
      retention: {
        day1: 0.65,
        day7: 0.32,
        day30: 0.18,
      },
      online_users: this.getMetricValue('online_users', 2340),
      session_duration: this.getHistogramMetric('session_duration'),
    };
  }

  private getTransactionMetrics(): TransactionMetrics {
    return {
      gmv: this.getMetricValue('gmv', 1250000),
      order_count: this.getMetricValue('order_count', 342),
      conversion_rate: 0.035,
      aov: 3654,
      repeat_purchase_rate: 0.28,
      cart_conversion_rate: 0.15,
    };
  }

  private getAgentMarketMetrics(): AgentMarketMetrics {
    return {
      total_installs: this.getMetricValue('total_installs', 89500),
      active_agents: this.getMetricValue('active_agents', 1250),
      daily_installs: this.getMetricValue('daily_installs', 450),
      total_token_consumption: this.getMetricValue(
        'token_consumption',
        1250000
      ),
      daily_token_consumption: this.getMetricValue(
        'daily_token_consumption',
        45000
      ),
      total_developer_revenue: this.getMetricValue('developer_revenue', 89000),
      platform_commission: this.getMetricValue('platform_commission', 26700),
      avg_agent_rating: 4.3,
    };
  }

  private getRevenueMetrics(): RevenueMetrics {
    return {
      total_revenue: this.getMetricValue('total_revenue', 125000),
      daily_revenue: this.getMetricValue('daily_revenue', 3200),
      monthly_revenue: this.getMetricValue('monthly_revenue', 98000),
      arpu: 8.33,
      revenue_breakdown: {
        agent_sales: 45000,
        subscription: 32000,
        token_sales: 28000,
        commission: 20000,
      },
    };
  }

  private getSystemPerformanceMetrics(): SystemPerformanceMetrics {
    return {
      api_response_time: this.getHistogramMetric('api_response_time'),
      page_load_time: this.getHistogramMetric('page_load_time'),
      db_query_time: this.getHistogramMetric('db_query_time'),
      availability: 0.998,
      error_rate: 0.008,
      server_error_rate: 0.002,
    };
  }

  private getResourceMetrics(): ResourceMetrics {
    return {
      cpu_utilization: this.getMetricValue('cpu_utilization', 45),
      memory_utilization: this.getMetricValue('memory_utilization', 62),
      disk_io_utilization: this.getMetricValue('disk_io_utilization', 28),
      network_utilization: this.getMetricValue('network_utilization', 35),
      db_connections: this.getMetricValue('db_connections', 45),
      cache_hit_rate: 0.89,
    };
  }

  private getApplicationMetrics(): ApplicationMetrics {
    return {
      qps: this.getMetricValue('qps', 125),
      tps: this.getMetricValue('tps', 89),
      concurrent_users: this.getMetricValue('concurrent_users', 1240),
      js_error_rate: 0.003,
      frontend_performance: {
        dom_ready_time: 850,
        first_paint_time: 1200,
        first_contentful_paint: 1500,
        largest_contentful_paint: 2100,
      },
    };
  }

  private getUserBehaviorMetrics(): UserBehaviorMetrics {
    return {
      avg_session_duration: 456,
      avg_page_depth: 3.2,
      feature_adoption: {
        agent_market: 0.78,
        team_management: 0.65,
        token_system: 0.52,
      },
      search_success_rate: 0.87,
      checkout_completion_rate: 0.23,
      satisfaction_score: 4.2,
    };
  }

  private getInteractionMetrics(): InteractionMetrics {
    return {
      ctr: {
        install_button: 0.12,
        buy_button: 0.08,
        search_button: 0.34,
      },
      form_submission_success: 0.92,
      bounce_rate: 0.31,
      user_journey: {
        entry_points: {
          '/': 0.45,
          '/marketplace': 0.32,
          '/agents': 0.18,
        },
        exit_points: {
          '/checkout': 0.25,
          '/agent-detail': 0.18,
          '/profile': 0.12,
        },
        popular_paths: [
          { path: '/ -> /marketplace -> /agent-detail', count: 1250 },
          { path: '/ -> /login -> /dashboard', count: 890 },
        ],
      },
    };
  }

  private getAccessSecurityMetrics(): AccessSecurityMetrics {
    return {
      login_attempts: this.getCounterMetric('login_attempts'),
      failed_logins: this.getCounterMetric('failed_logins'),
      malicious_ip_access: this.getCounterMetric('malicious_ip_access'),
      privilege_escalation_attempts: this.getCounterMetric(
        'privilege_escalation_attempts'
      ),
      anomalous_access_patterns: this.getMetricValue('anomalous_patterns', 3),
    };
  }

  private getDataSecurityMetrics(): DataSecurityMetrics {
    return {
      data_breach_incidents: this.getCounterMetric('data_breach_incidents'),
      data_integrity_failures: this.getCounterMetric('data_integrity_failures'),
      encryption_failures: this.getCounterMetric('encryption_failures'),
      sensitive_data_access: this.getCounterMetric('sensitive_data_access'),
    };
  }

  private getApplicationSecurityMetrics(): ApplicationSecurityMetrics {
    return {
      xss_attacks_detected: this.getCounterMetric('xss_attacks'),
      sql_injection_detected: this.getCounterMetric('sql_injection'),
      csrf_protection_triggers: this.getCounterMetric('csrf_protection'),
      security_scan_results: {
        vulnerabilities: 2,
        critical_issues: 0,
        high_risk_issues: 1,
      },
    };
  }

  // ==================== 辅助方法 ====================

  private getMetricValue(metricName: string, defaultValue: number): number {
    const key = `gauge_${metricName}`;
    if (this.metrics.has(key)) {
      const metrics = this.metrics.get(key)!;
      if (metrics.length > 0) {
        return metrics[metrics.length - 1].value;
      }
    }
    return defaultValue;
  }

  private getCounterMetric(metricName: string): CounterMetric {
    const key = `counter_${metricName}`;
    if (this.metrics.has(key)) {
      const metrics = this.metrics.get(key)!;
      if (metrics.length > 0) {
        return metrics[metrics.length - 1];
      }
    }
    return {
      name: metricName,
      description: '',
      unit: '',
      timestamp: Date.now(),
      count: 0,
    };
  }

  private getHistogramMetric(metricName: string): HistogramMetric {
    const key = `histogram_${metricName}`;
    if (this.metrics.has(key)) {
      const metrics = this.metrics.get(key)!;
      if (metrics.length > 0) {
        return metrics[metrics.length - 1];
      }
    }
    return {
      name: metricName,
      description: '',
      unit: '',
      timestamp: Date.now(),
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
    };
  }

  /**
   * 启动数据收集
   */
  private startCollection(): void {
    this.collectionTimer = setInterval(() => {
      // 定期收集系统指标
      this.collectSystemMetrics();
    }, this.config.collection_interval);
  }

  /**
   * 启动告警评估
   */
  private startAlertEvaluation(): void {
    this.alertTimer = setInterval(() => {
      // 定期评估告警规则
      this.evaluateAlerts();
    }, this.config.alert_evaluation_interval * 1000);
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): void {
    // 收集CPU、内存等系统指标
    // 这里可以集成系统监控工具如systeminformation
    this.recordGaugeMetric(
      'cpu_utilization',
      Math.random() * 100,
      'CPU使用?,
      '%'
    );
    this.recordGaugeMetric(
      'memory_utilization',
      Math.random() * 100,
      '内存使用?,
      '%'
    );
  }

  /**
   * 评估告警
   */
  private evaluateAlerts(): void {
    // 定期重新评估所有活跃告?    for (const alert of this.activeAlerts.values()) {
      if (alert.status === 'triggered') {
        // 可以在这里添加更复杂的告警升级逻辑
      }
    }
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values()).filter(
      alert => alert.status === 'triggered'
    );
  }

  /**
   * 获取指标历史数据
   */
  getMetricHistory(metricName: string, hours: number = 24): any[] {
    const key = `gauge_${metricName}`;
    if (!this.metrics.has(key)) {
      return [];
    }

    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return this.metrics.get(key)!.filter(m => m.timestamp > cutoffTime);
  }

  /**
   * 停止监控服务
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
    logger.info('Monitoring service stopped');
  }
}

// 导出全局监控服务实例
export const monitoringService = new MonitoringService();
