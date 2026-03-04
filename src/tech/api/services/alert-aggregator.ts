// src/services/alert-aggregator.ts

/**
 * FixCycle 告警聚合服务
 * 统一管理多渠道告警通知，支持去重、抑制、升级等高级功能
 */

// 告警事件接口
export interface AlertEvent {
  id?: string;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'critical' | 'emergency';
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  dedupKey?: string; // 用于告警去重的键
  tags?: string[]; // 告警标签
}

// 通知服务接口
export interface NotificationService {
  send(event: AlertEvent): Promise<void>;
  getName(): string;
  isEnabled(): boolean;
}

// 告警规则接口
export interface AlertRule {
  id: string;
  name: string;
  condition: (event: AlertEvent) => boolean;
  enabled: boolean;
  channels: string[]; // 允许的通知渠道
  cooldownPeriod?: number; // 冷却时间（毫秒）
  escalationPolicy?: EscalationPolicy;
  description?: string;
}

// 升级策略接口
export interface EscalationPolicy {
  initialDelay: number; // 初始延迟（毫秒）
  repeatInterval: number; // 重复间隔（毫秒）
  maxNotifications: number; // 最大通知次数
  escalateTo?: string[]; // 升级到的渠道
}

// 告警抑制规则接口
export interface SuppressionRule {
  id: string;
  name: string;
  condition: (event: AlertEvent) => boolean;
  duration: number; // 抑制持续时间（毫秒）
  active: boolean;
}

// 告警聚合配置
export interface AlertAggregatorConfig {
  defaultChannels: string[];
  severityRouting: Record<string, string[]>;
  deduplicationWindow: number; // 去重窗口（毫秒）
  defaultCooldown: number; // 默认冷却时间（毫秒）
  enableEscalation: boolean;
  enableSuppression: boolean;
}

// 告警统计信息
export interface AlertStatistics {
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsBySource: Record<string, number>;
  notificationCounts: Record<string, number>;
  suppressedAlerts: number;
  escalatedAlerts: number;
}

/**
 * 告警聚合服务主类
 */
export class AlertAggregator {
  private services: Map<string, NotificationService> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private suppressionRules: Map<string, SuppressionRule> = new Map();
  private recentAlerts: Map<string, { timestamp: Date; count: number }> =
    new Map();
  private cooldowns: Map<string, Date> = new Map();
  private statistics: AlertStatistics = {
    totalAlerts: 0,
    alertsBySeverity: {},
    alertsBySource: {},
    notificationCounts: {},
    suppressedAlerts: 0,
    escalatedAlerts: 0,
  };

  private config: AlertAggregatorConfig;
  private isRunning: boolean = false;

  constructor(config?: Partial<AlertAggregatorConfig>) {
    this.config = {
      defaultChannels: ['console'],
      severityRouting: {
        info: ['console'],
        warning: ['console', 'email'],
        error: ['console', 'email', 'slack'],
        critical: ['console', 'email', 'slack', 'sms'],
        emergency: ['console', 'email', 'slack', 'sms', 'phone'],
      },
      deduplicationWindow: 5 * 60 * 1000, // 5分钟
      defaultCooldown: 10 * 60 * 1000, // 10分钟
      enableEscalation: true,
      enableSuppression: true,
      ...config,
    };
  }

  /**
   * 注册通知服务
   */
  registerService(name: string, service: NotificationService): void {
    this.services.set(name, service);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?注册通知服务: ${name}`)}

  /**
   * 注销通知服务
   */
  unregisterService(name: string): void {
    this.services.delete(name);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?注销通知服务: ${name}`)}

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?添加告警规则: ${rule.name}`)}

  /**
   * 移除告警规则
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?移除告警规则: ${ruleId}`)}

  /**
   * 添加抑制规则
   */
  addSuppressionRule(rule: SuppressionRule): void {
    this.suppressionRules.set(rule.id, rule);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?添加抑制规则: ${rule.name}`)}

  /**
   * 移除抑制规则
   */
  removeSuppressionRule(ruleId: string): void {
    this.suppressionRules.delete(ruleId);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?移除抑制规则: ${ruleId}`)}

  /**
   * 发送告?   */
  async sendAlert(event: AlertEvent): Promise<void> {
    // 生成唯一ID
    if (!event.id) {
      event.id = this.generateAlertId(event);
    }

    // 更新统计信息
    this.updateStatistics(event);

    // 检查抑制规?    if (this.config.enableSuppression && this.isSuppressed(event)) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔇 告警被抑? ${event.title}`)this.statistics.suppressedAlerts++;
      return;
    }

    // 检查去?    if (this.isDuplicate(event)) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔄 告警去重: ${event.title}`)return;
    }

    // 检查冷却期
    if (this.isInCooldown(event)) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`❄️  告警冷却? ${event.title}`)return;
    }

    // 应用告警规则
    const applicableRules = this.getApplicableRules(event);
    const channels = this.determineChannels(event, applicableRules);

    // 发送到各渠?    const sendPromises = channels.map(async channelName => {
      const service = this.services.get(channelName);
      if (service && service.isEnabled()) {
        try {
          await service.send(event);
          this.incrementNotificationCount(channelName);
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?通过 ${channelName} 发送告? ${event.title}`)} catch (error) {
          console.error(`�?${channelName} 发送失?`, error);
        }
      }
    });

    await Promise.all(sendPromises);

    // 设置冷却?    this.setCooldown(event, applicableRules);

    // 启动升级机制
    if (this.config.enableEscalation) {
      this.scheduleEscalation(event, applicableRules);
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📢 告警处理完成: ${event.title}`)}

  /**
   * 批量发送告?   */
  async sendAlerts(events: AlertEvent[]): Promise<void> {
    const sendPromises = events.map(event => this.sendAlert(event));
    await Promise.all(sendPromises);
  }

  /**
   * 生成告警ID
   */
  private generateAlertId(event: AlertEvent): string {
    const dedupKey = event.dedupKey || `${event.source}:${event.title}`;
    return `${dedupKey}:${event.timestamp.getTime()}`;
  }

  /**
   * 检查是否为重复告警
   */
  private isDuplicate(event: AlertEvent): boolean {
    const dedupKey = event.dedupKey || `${event.source}:${event.title}`;
    const recentAlert = this.recentAlerts.get(dedupKey);

    if (recentAlert) {
      const timeDiff = Date.now() - recentAlert.timestamp.getTime();
      if (timeDiff < this.config.deduplicationWindow) {
        recentAlert.count++;
        return true;
      }
    }

    // 更新最近告警记?    this.recentAlerts.set(dedupKey, {
      timestamp: event.timestamp,
      count: 1,
    });

    // 清理过期记录
    this.cleanupRecentAlerts();
    return false;
  }

  /**
   * 检查是否被抑制
   */
  private isSuppressed(event: AlertEvent): boolean {
    for (const rule of this.suppressionRules.values()) {
      if (rule.active && rule.condition(event)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查是否在冷却?   */
  private isInCooldown(event: AlertEvent): boolean {
    const cooldownKey = `${event.source}:${event.title}`;
    const cooldownEnd = this.cooldowns.get(cooldownKey);

    if (cooldownEnd && cooldownEnd > new Date()) {
      return true;
    }

    return false;
  }

  /**
   * 获取适用的告警规?   */
  private getApplicableRules(event: AlertEvent): AlertRule[] {
    const applicable: AlertRule[] = [];

    for (const rule of this.rules.values()) {
      if (rule.enabled && rule.condition(event)) {
        applicable.push(rule);
      }
    }

    return applicable;
  }

  /**
   * 确定通知渠道
   */
  private determineChannels(event: AlertEvent, rules: AlertRule[]): string[] {
    // 从规则中获取渠道
    const ruleChannels = rules.flatMap(rule => rule.channels);

    // 根据严重程度获取默认渠道
    const severityChannels =
      this.config.severityRouting[event.severity] ||
      this.config.defaultChannels;

    // 合并渠道并去?    const allChannels = [...new Set([...ruleChannels, ...severityChannels])];

    // 过滤掉未注册的服?    return allChannels.filter(channel => this.services.has(channel));
  }

  /**
   * 设置冷却?   */
  private setCooldown(event: AlertEvent, rules: AlertRule[]): void {
    const cooldownKey = `${event.source}:${event.title}`;
    const maxCooldown = Math.max(
      this.config.defaultCooldown,
      ...rules.map(rule => rule.cooldownPeriod || 0)
    );

    if (maxCooldown > 0) {
      this.cooldowns.set(cooldownKey, new Date(Date.now() + maxCooldown));
    }
  }

  /**
   * 安排升级
   */
  private scheduleEscalation(event: AlertEvent, rules: AlertRule[]): void {
    for (const rule of rules) {
      if (rule.escalationPolicy) {
        const policy = rule.escalationPolicy;
        const escalateTo = policy.escalateTo || [];

        if (escalateTo.length > 0) {
          setTimeout(() => {
            this.escalateAlert(event, escalateTo);
          }, policy.initialDelay);
        }
      }
    }
  }

  /**
   * 执行升级
   */
  private async escalateAlert(
    event: AlertEvent,
    channels: string[]
  ): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`⬆️  告警升级: ${event.title} -> ${channels.join(', ')}`);
    this.statistics.escalatedAlerts++;

    const escalationEvent = {
      ...event,
      title: `[升级] ${event.title}`,
      message: `${event.message}\n\n此告警已被升级处理。`,
      metadata: {
        ...event.metadata,
        escalation: true,
        escalationTime: new Date().toISOString(),
      },
    };

    const sendPromises = channels.map(async channelName => {
      const service = this.services.get(channelName);
      if (service && service.isEnabled()) {
        try {
          await service.send(escalationEvent);
          this.incrementNotificationCount(channelName);
        } catch (error) {
          console.error(`�?升级通知失败 ${channelName}:`, error);
        }
      }
    });

    await Promise.all(sendPromises);
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(event: AlertEvent): void {
    this.statistics.totalAlerts++;

    // 按严重程度统?    this.statistics.alertsBySeverity[event.severity] =
      (this.statistics.alertsBySeverity[event.severity] || 0) + 1;

    // 按来源统?    this.statistics.alertsBySource[event.source] =
      (this.statistics.alertsBySource[event.source] || 0) + 1;
  }

  /**
   * 增加通知计数
   */
  private incrementNotificationCount(channel: string): void {
    this.statistics.notificationCounts[channel] =
      (this.statistics.notificationCounts[channel] || 0) + 1;
  }

  /**
   * 清理最近告警记?   */
  private cleanupRecentAlerts(): void {
    const cutoffTime = Date.now() - this.config.deduplicationWindow;

    for (const [key, alert] of this.recentAlerts.entries()) {
      if (alert.timestamp.getTime() < cutoffTime) {
        this.recentAlerts.delete(key);
      }
    }
  }

  /**
   * 清理过期的冷却记?   */
  private cleanupCooldowns(): void {
    const now = new Date();
    for (const [key, cooldownEnd] of this.cooldowns.entries()) {
      if (cooldownEnd < now) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics(): AlertStatistics {
    return { ...this.statistics };
  }

  /**
   * 获取当前状?   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      registeredServices: Array.from(this.services.keys()),
      activeRules: Array.from(this.rules.values())
        .filter(rule => rule.enabled)
        .map(rule => ({ id: rule.id, name: rule.name })),
      suppressionRules: Array.from(this.suppressionRules.values())
        .filter(rule => rule.active)
        .map(rule => ({ id: rule.id, name: rule.name })),
      recentAlertsCount: this.recentAlerts.size,
      cooldownsCount: this.cooldowns.size,
    };
  }

  /**
   * 启动服务
   */
  start(): void {
    if (this.isRunning) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('⚠️  告警聚合服务已在运行')return;
    }

    this.isRunning = true;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚀 告警聚合服务启动')// 定期清理过期数据
    setInterval(() => {
      this.cleanupRecentAlerts();
      this.cleanupCooldowns();
    }, 60000); // 每分钟清理一?  }

  /**
   * 停止服务
   */
  stop(): void {
    if (!this.isRunning) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('⚠️  告警聚合服务未在运行')return;
    }

    this.isRunning = false;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 告警聚合服务停止')}

  /**
   * 重置统计信息
   */
  resetStatistics(): void {
    this.statistics = {
      totalAlerts: 0,
      alertsBySeverity: {},
      alertsBySource: {},
      notificationCounts: {},
      suppressedAlerts: 0,
      escalatedAlerts: 0,
    };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📊 统计信息已重?)}
}

// 默认告警规则示例
export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'high_severity_alert',
    name: '高严重性告?,
    condition: event => ['critical', 'emergency'].includes(event.severity),
    enabled: true,
    channels: ['console', 'email', 'slack', 'sms'],
    cooldownPeriod: 5 * 60 * 1000, // 5分钟冷却
    escalationPolicy: {
      initialDelay: 10 * 60 * 1000, // 10分钟后升?      repeatInterval: 30 * 60 * 1000, // �?0分钟重复
      maxNotifications: 3,
      escalateTo: ['phone'],
    },
  },
  {
    id: 'database_alert',
    name: '数据库相关告?,
    condition: event =>
      event.source.includes('database') ||
      (event.tags && event.tags.includes('database')) ||
      false,
    enabled: true,
    channels: ['console', 'email', 'slack'],
    cooldownPeriod: 10 * 60 * 1000, // 10分钟冷却
  },
  {
    id: 'repeated_alert',
    name: '重复告警检?,
    condition: event => {
      // 这个规则会在聚合服务内部处理
      return false;
    },
    enabled: true,
    channels: ['console'],
  },
];

// 默认抑制规则示例
export const DEFAULT_SUPPRESSION_RULES: SuppressionRule[] = [
  {
    id: 'maintenance_window',
    name: '维护窗口抑制',
    condition: event => {
      const now = new Date();
      const hour = now.getHours();
      // 在凌?-4点抑制非紧急告?      return hour >= 2 && hour < 4 && !['emergency'].includes(event.severity);
    },
    duration: 2 * 60 * 60 * 1000, // 2小时
    active: true,
  },
  {
    id: 'known_issues',
    name: '已知问题抑制',
    condition: event => {
      // 可以根据告警内容匹配已知问题
      const knownIssues = ['timeout', 'connection refused'];
      return knownIssues.some(issue =>
        event.message.toLowerCase().includes(issue.toLowerCase())
      );
    },
    duration: 30 * 60 * 1000, // 30分钟
    active: true,
  },
];

// 使用示例
/*
import { AlertAggregator, DEFAULT_ALERT_RULES } from './alert-aggregator';
import { EmailAlert } from '../../scripts/alert-email';
import { SlackAlert } from '../../scripts/alert-slack';

// 创建聚合服务
const aggregator = new AlertAggregator({
  defaultChannels: ['console', 'email'],
  severityRouting: {
    'info': ['console'],
    'warning': ['console', 'email'],
    'error': ['console', 'email', 'slack'],
    'critical': ['console', 'email', 'slack', 'sms'],
    'emergency': ['console', 'email', 'slack', 'sms', 'phone']
  }
});

// 注册通知服务
const emailService = new EmailAlert({...});
const slackService = new SlackAlert({...});

aggregator.registerService('email', emailService);
aggregator.registerService('slack', slackService);

// 添加告警规则
DEFAULT_ALERT_RULES.forEach(rule => aggregator.addRule(rule));

// 启动服务
aggregator.start();

// 发送告?await aggregator.sendAlert({
  source: 'database-monitor',
  severity: 'critical',
  title: '数据库连接失?,
  message: '无法连接到主数据库服务器',
  timestamp: new Date(),
  metadata: {
    host: 'db-primary.example.com',
    port: 5432
  }
});
*/
