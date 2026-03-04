/**
 * 安全监控服务
 * 整合安全事件检测、异常行为分析和监控告警功能
 */

import {
  SecurityEventDetector,
  SecurityEvent,
  SecurityEventType,
  ThreatLevel,
} from './security-event-detector';
import {
  AnomalyBehaviorAnalyzer,
  BehaviorAnomalyResult,
} from './anomaly-behavior-analyzer';
import { createClient } from '@supabase/supabase-js';

// 安全监控配置
export interface SecurityMonitoringConfig {
  enabled: boolean;
  detectionEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  alertingEnabled: boolean;
  logRetentionDays: number;
  maxAlertsPerHour: number;
  samplingRate: number; // 采样?0-1
}

// 实时威胁指标
export interface RealTimeThreatMetrics {
  totalEvents: number;
  threatEvents: number;
  anomalyEvents: number;
  criticalAlerts: number;
  highRiskUsers: number;
  blockedAttacks: number;
  activeThreats: SecurityEvent[];
  topThreatSources: Array<{ source: string; count: number }>;
  threatTrend: Array<{ timestamp: Date; threatCount: number }>;
}

// 安全仪表板数?export interface SecurityDashboardData {
  threatMetrics: RealTimeThreatMetrics;
  userRiskProfiles: Array<{
    userId: string;
    riskScore: number;
    lastActivity: Date;
    threatLevel: ThreatLevel;
    recentAnomalies: number;
  }>;
  systemSecurityScore: number; // 0-100的整体安全评?  recentAlerts: SecurityEvent[];
  complianceStatus: {
    gdpr: boolean;
    hipaa: boolean;
    pci: boolean;
    soc2: boolean;
  };
  recommendations: string[];
}

export class SecurityMonitoringService {
  private securityDetector: SecurityEventDetector;
  private anomalyAnalyzer: AnomalyBehaviorAnalyzer;
  private supabase: any;
  private config: SecurityMonitoringConfig;
  private alertCounter: Map<string, number> = new Map(); // 按小时统计告警数
  private readonly HOUR_MS = 3600000;

  constructor(config?: Partial<SecurityMonitoringConfig>) {
    this.config = {
      enabled: true,
      detectionEnabled: true,
      anomalyDetectionEnabled: true,
      alertingEnabled: true,
      logRetentionDays: 90,
      maxAlertsPerHour: 100,
      samplingRate: 1.0,
      ...config,
    };

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.securityDetector = new SecurityEventDetector();
    this.anomalyAnalyzer = new AnomalyBehaviorAnalyzer();

    // 启动定时清理任务
    this.startCleanupTask();
  }

  /**
   * 处理安全事件
   */
  async processSecurityEvent(
    event: SecurityEvent
  ): Promise<SecurityEvent | null> {
    if (!this.config.enabled || !this.config.detectionEnabled) {
      return null;
    }

    // 应用采样?    if (Math.random() > this.config.samplingRate) {
      return null;
    }

    try {
      // 使用安全事件检测器检测威?      const detectedEvent =
        await this.securityDetector.detectSecurityEvent(event);

      if (detectedEvent) {
        // 发送告?        await this.sendSecurityAlert(detectedEvent);
        return detectedEvent;
      }

      // 进行异常行为分析
      if (this.config.anomalyDetectionEnabled && event.userId) {
        const anomalyResult =
          await this.anomalyAnalyzer.analyzeUserBehavior(event);

        if (anomalyResult.isAnomalous) {
          const anomalyEvent = this.createAnomalySecurityEvent(
            event,
            anomalyResult
          );
          await this.sendSecurityAlert(anomalyEvent);
          return anomalyEvent;
        }
      }

      return null;
    } catch (error) {
      console.error('处理安全事件时发生错?', error);
      return null;
    }
  }

  /**
   * 创建异常安全事件
   */
  private createAnomalySecurityEvent(
    originalEvent: SecurityEvent,
    anomalyResult: BehaviorAnomalyResult
  ): SecurityEvent {
    return {
      ...originalEvent,
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      threatLevel: anomalyResult.severity,
      riskScore: Math.round(anomalyResult.anomalyScore * 100),
      details: {
        ...originalEvent.details,
        anomalyAnalysis: anomalyResult,
        behavioralDetection: true,
      },
    };
  }

  /**
   * 发送安全告?   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    if (!this.config.alertingEnabled) return;

    // 检查告警频率限?    const currentHour = Math.floor(Date.now() / this.HOUR_MS);
    const hourKey = `hour_${currentHour}`;
    const currentCount = this.alertCounter.get(hourKey) || 0;

    if (currentCount >= this.config.maxAlertsPerHour) {
      console.warn(`告警频率超限，跳过事? ${event.id}`);
      return;
    }

    // 增加计数?    this.alertCounter.set(hourKey, currentCount + 1);

    try {
      // 记录告警到数据库
      await this.recordSecurityAlert(event);

      // 根据威胁等级选择通知渠道
      const channels = this.getNotificationChannels(event.threatLevel);

      // 发送通知（这里应该集成实际的通知服务?      await this.dispatchNotifications(event, channels);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `🚨 安全告警已发? ${event.eventType} [${event.threatLevel}] - ${event.riskScore}分`
      )} catch (error) {
      console.error('发送安全告警失?', error);
    }
  }

  /**
   * 记录安全告警
   */
  private async recordSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      (await this.supabase.from('security_alerts').insert({
        id: event.id,
        event_type: event.eventType,
        threat_level: event.threatLevel,
        risk_score: event.riskScore,
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        timestamp: event.timestamp.toISOString(),
        details: event.details,
        location: event.location,
        correlation_id: event.correlationId,
      })) as any;
    } catch (error) {
      console.error('记录安全告警失败:', error);
    }
  }

  /**
   * 获取通知渠道
   */
  private getNotificationChannels(threatLevel: ThreatLevel): string[] {
    switch (threatLevel) {
      case ThreatLevel.LOW:
        return ['console', 'log'];
      case ThreatLevel.MEDIUM:
        return ['console', 'log', 'email'];
      case ThreatLevel.HIGH:
        return ['console', 'log', 'email', 'slack', 'wechat'];
      case ThreatLevel.CRITICAL:
        return ['console', 'log', 'email', 'slack', 'wechat', 'sms', 'phone'];
      default:
        return ['console', 'log'];
    }
  }

  /**
   * 分发通知
   */
  private async dispatchNotifications(
    event: SecurityEvent,
    channels: string[]
  ): Promise<void> {
    const notificationPayload = {
      title: `安全威胁告警 [${event.threatLevel.toUpperCase()}]`,
      message: this.formatAlertMessage(event),
      severity: event.threatLevel,
      event: event,
      timestamp: new Date().toISOString(),
    };

    // 并行发送通知
    const promises = channels.map(channel =>
      this.sendToChannel(channel, notificationPayload)
    );

    await Promise.allSettled(promises);
  }

  /**
   * 发送到指定渠道
   */
  private async sendToChannel(channel: string, payload: any): Promise<void> {
    switch (channel) {
      case 'console':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `[${payload.severity}] ${payload.title}: ${payload.message}`
        )break;
      case 'log':
        // 写入安全日志文件
        this.writeToSecurityLog(payload);
        break;
      case 'email':
        // 发送邮件告?        await this.sendEmailAlert(payload);
        break;
      case 'slack':
        // 发送Slack通知
        await this.sendSlackAlert(payload);
        break;
      case 'wechat':
        // 发送微信通知
        await this.sendWechatAlert(payload);
        break;
      case 'sms':
        // 发送短信告?        await this.sendSMSAlert(payload);
        break;
      case 'phone':
        // 发送电话告?        await this.sendPhoneAlert(payload);
        break;
    }
  }

  /**
   * 格式化告警消?   */
  private formatAlertMessage(event: SecurityEvent): string {
    const timeStr = event.timestamp.toLocaleString('zh-CN');
    const userStr = event.userId ? `用户: ${event.userId}` : '匿名用户';
    const locationStr = event.location ? `来自: ${event.location.country}` : '';

    return `${timeStr} | ${userStr} | ${locationStr} | 风险评分: ${event.riskScore} | 事件类型: ${event.eventType}`;
  }

  /**
   * 获取实时威胁指标
   */
  async getRealTimeThreatMetrics(
    timeWindowMinutes: number = 60
  ): Promise<RealTimeThreatMetrics> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60000);

    try {
      // 从数据库查询近期安全事件
      const { data: recentEvents, error } = await this.supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', cutoffTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const events = recentEvents || [];

      // 统计各类事件
      const threatEvents = events.filter(
        (e: any) => e.threat_level === 'high' || e.threat_level === 'critical'
      );

      const anomalyEvents = events.filter(
        (e: any) => e.event_type === 'suspicious_activity'
      );

      // 统计威胁来源
      const threatSources = this.aggregateThreatSources(events);

      // 生成威胁趋势数据
      const threatTrend = this.generateThreatTrend(events, timeWindowMinutes);

      return {
        totalEvents: events.length,
        threatEvents: threatEvents.length,
        anomalyEvents: anomalyEvents.length,
        criticalAlerts: threatEvents.filter(
          (e: any) => e.threat_level === 'critical'
        ).length,
        highRiskUsers: this.calculateHighRiskUsers(events),
        blockedAttacks: this.calculateBlockedAttacks(events),
        activeThreats: threatEvents.slice(0, 10), // 最?0个威胁事?        topThreatSources: threatSources.slice(0, 5),
        threatTrend,
      };
    } catch (error) {
      console.error('获取威胁指标失败:', error);
      return this.getDefaultThreatMetrics();
    }
  }

  /**
   * 获取安全仪表板数?   */
  async getSecurityDashboardData(): Promise<SecurityDashboardData> {
    const threatMetrics = await this.getRealTimeThreatMetrics(1440); // 24小时

    try {
      // 获取用户风险档案
      const userRiskProfiles = await this.getUserRiskProfiles();

      // 计算系统安全评分
      const systemSecurityScore =
        this.calculateSystemSecurityScore(threatMetrics);

      // 获取近期告警
      const recentAlerts = await this.getRecentAlerts(20);

      // 检查合规状?      const complianceStatus = await this.checkComplianceStatus();

      // 生成建议
      const recommendations =
        this.generateSecurityRecommendations(threatMetrics);

      return {
        threatMetrics,
        userRiskProfiles,
        systemSecurityScore,
        recentAlerts,
        complianceStatus,
        recommendations,
      };
    } catch (error) {
      console.error('获取安全仪表板数据失?', error);
      return this.getDefaultDashboardData(threatMetrics);
    }
  }

  /**
   * 获取用户风险档案
   */
  private async getUserRiskProfiles(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_risk_profiles')
        .select('*')
        .order('risk_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取用户风险档案失败:', error);
      return [];
    }
  }

  /**
   * 计算系统安全评分
   */
  private calculateSystemSecurityScore(metrics: RealTimeThreatMetrics): number {
    // 基础分为100�?    let score = 100;

    // 根据威胁事件扣分
    score -= metrics.threatEvents * 2;
    score -= metrics.criticalAlerts * 5;
    score -= metrics.highRiskUsers;

    // 根据积极指标加分
    score += Math.max(0, 20 - metrics.blockedAttacks); // 成功阻止的攻击加?
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 获取近期告警
   */
  private async getRecentAlerts(limit: number): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取近期告警失败:', error);
      return [];
    }
  }

  /**
   * 检查合规状?   */
  private async checkComplianceStatus(): Promise<any> {
    // 这里应该实现具体的合规检查逻辑
    return {
      gdpr: true,
      hipaa: false,
      pci: true,
      soc2: true,
    };
  }

  /**
   * 生成安全建议
   */
  private generateSecurityRecommendations(
    metrics: RealTimeThreatMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.threatEvents > 10) {
      recommendations.push('威胁事件较多，建议加强访问控?);
    }

    if (metrics.criticalAlerts > 0) {
      recommendations.push('存在严重威胁，建议立即审查安全策?);
    }

    if (metrics.highRiskUsers > 5) {
      recommendations.push('高风险用户较多，建议审查用户权限');
    }

    if (metrics.blockedAttacks < metrics.threatEvents * 0.5) {
      recommendations.push('攻击拦截率较低，建议优化安全防护措施');
    }

    if (recommendations.length === 0) {
      recommendations.push('当前安全状况良好，继续保持监?);
    }

    return recommendations;
  }

  // 辅助方法实现
  private aggregateThreatSources(
    events: any[]
  ): Array<{ source: string; count: number }> {
    const sourceCounts: Record<string, number> = {};

    events.forEach(event => {
      const source = event.ip_address || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  private generateThreatTrend(
    events: any[],
    timeWindowMinutes: number
  ): Array<{ timestamp: Date; threatCount: number }> {
    const intervalMinutes = 10;
    const intervals = Math.ceil(timeWindowMinutes / intervalMinutes);
    const trend: Array<{ timestamp: Date; threatCount: number }> = [];

    for (let i = 0; i < intervals; i++) {
      const startTime = new Date(
        Date.now() - (timeWindowMinutes - i * intervalMinutes) * 60000
      );
      const endTime = new Date(startTime.getTime() + intervalMinutes * 60000);

      const count = events.filter(
        event =>
          new Date(event.timestamp) >= startTime &&
          new Date(event.timestamp) < endTime
      ).length;

      trend.push({
        timestamp: startTime,
        threatCount: count,
      });
    }

    return trend;
  }

  private calculateHighRiskUsers(events: any[]): number {
    const userIds = new Set(events.filter(e => e.user_id).map(e => e.user_id));
    return userIds.size;
  }

  private calculateBlockedAttacks(events: any[]): number {
    // 假设有blocked字段表示攻击是否被阻?    return events.filter(e => e.blocked === true).length;
  }

  private writeToSecurityLog(payload: any): void {
    // 写入安全日志文件的实?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('安全日志:', JSON.stringify(payload));
  }

  private async sendEmailAlert(payload: any): Promise<void> {
    // 邮件告警实现
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送邮件告?', payload.title)}

  private async sendSlackAlert(payload: any): Promise<void> {
    // Slack告警实现
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送Slack告警:', payload.title)}

  private async sendWechatAlert(payload: any): Promise<void> {
    // 微信告警实现
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送微信告?', payload.title)}

  private async sendSMSAlert(payload: any): Promise<void> {
    // 短信告警实现
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送短信告?', payload.title)}

  private async sendPhoneAlert(payload: any): Promise<void> {
    // 电话告警实现
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送电话告?', payload.title)}

  private getDefaultThreatMetrics(): RealTimeThreatMetrics {
    return {
      totalEvents: 0,
      threatEvents: 0,
      anomalyEvents: 0,
      criticalAlerts: 0,
      highRiskUsers: 0,
      blockedAttacks: 0,
      activeThreats: [],
      topThreatSources: [],
      threatTrend: [],
    };
  }

  private getDefaultDashboardData(
    metrics: RealTimeThreatMetrics
  ): SecurityDashboardData {
    return {
      threatMetrics: metrics,
      userRiskProfiles: [],
      systemSecurityScore: 85,
      recentAlerts: [],
      complianceStatus: {
        gdpr: true,
        hipaa: false,
        pci: true,
        soc2: true,
      },
      recommendations: ['系统初始化中，请稍后刷新'],
    };
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    // 每小时清理过期的告警计数?    setInterval(() => {
      const oneHourAgo = Math.floor((Date.now() - this.HOUR_MS) / this.HOUR_MS);
      for (const [key] of this.alertCounter.entries()) {
        const hour = parseInt(key.split('_')[1]);
        if (hour < oneHourAgo) {
          this.alertCounter.delete(key);
        }
      }
    }, this.HOUR_MS);
  }

  /**
   * 获取服务状?   */
  getStatus(): {
    enabled: boolean;
    detectionEnabled: boolean;
    anomalyDetectionEnabled: boolean;
    alertingEnabled: boolean;
    activeAlertCount: number;
  } {
    return {
      enabled: this.config.enabled,
      detectionEnabled: this.config.detectionEnabled,
      anomalyDetectionEnabled: this.config.anomalyDetectionEnabled,
      alertingEnabled: this.config.alertingEnabled,
      activeAlertCount: this.alertCounter.size,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<SecurityMonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
