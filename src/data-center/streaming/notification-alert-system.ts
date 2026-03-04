// 消费者处理逻辑和通知机制
// 实现事件处理管道、通知系统和告警机?
import {
  EnhancedEventProcessor,
  EnhancedEvent,
  EnhancedEventType,
  EventPriority,
  enhancedRealTimeService,
} from './enhanced-realtime-service';
import { monitoringService } from '../monitoring/monitoring-service';

// 通知渠道类型
export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'webhook'
  | 'slack'
  | 'wechat'
  | 'dingtalk';

// 通知级别
export enum NotificationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// 通知配置
export interface NotificationConfig {
  channels: NotificationChannel[];
  level: NotificationLevel;
  throttleSeconds?: number; // 节流时间（秒?  template?: string;
  recipients?: string[];
}

// 告警规则
export interface AlertRule {
  id: string;
  name: string;
  condition: (event: EnhancedEvent) => boolean;
  notificationConfig: NotificationConfig;
  enabled: boolean;
  description?: string;
  lastTriggered?: string;
  triggerCount?: number;
}

// 通知模板
export interface NotificationTemplate {
  subject: string;
  content: string;
  channels: NotificationChannel[];
}

// 通知服务接口
export interface NotificationService {
  sendNotification(
    level: NotificationLevel,
    message: string,
    channels: NotificationChannel[],
    recipients?: string[],
    eventData?: EnhancedEvent
  ): Promise<void>;

  sendTemplatedNotification(
    templateId: string,
    data: Record<string, any>,
    channels: NotificationChannel[],
    recipients?: string[]
  ): Promise<void>;
}

// 邮件通知服务
export class EmailNotificationService implements NotificationService {
  async sendNotification(
    level: NotificationLevel,
    message: string,
    channels: NotificationChannel[],
    recipients: string[] = [],
    eventData?: EnhancedEvent
  ): Promise<void> {
    if (!channels.includes('email')) return;

    const emailRecipients =
      recipients.length > 0 ? recipients : ['admin@company.com'];

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送邮件通知:`, {
      level,
      recipients: emailRecipients,
      message,
      eventId: eventData?.id,
    })// 这里应该集成实际的邮件服?    // await emailService.send({
    //   to: emailRecipients,
    //   subject: `[${level.toUpperCase()}] 系统通知`,
    //   html: message
    // });
  }

  async sendTemplatedNotification(
    templateId: string,
    data: Record<string, any>,
    channels: NotificationChannel[],
    recipients: string[] = []
  ): Promise<void> {
    if (!channels.includes('email')) return;

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送模板邮? ${templateId}`, data)// 实现模板邮件发送逻辑
  }
}

// Webhook通知服务
export class WebhookNotificationService implements NotificationService {
  async sendNotification(
    level: NotificationLevel,
    message: string,
    channels: NotificationChannel[],
    recipients: string[] = [],
    eventData?: EnhancedEvent
  ): Promise<void> {
    if (!channels.includes('webhook')) return;

    const webhookUrls =
      recipients.length > 0
        ? recipients
        : [process.env.DEFAULT_WEBHOOK_URL || ''];

    for (const url of webhookUrls.filter(Boolean)) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level,
            message,
            timestamp: new Date().toISOString(),
            eventData,
          }),
        });

        if (!response.ok) {
          console.error(`�?Webhook发送失? ${url}`, await response.text());
        } else {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?Webhook通知已发? ${url}`)}
      } catch (error) {
        console.error(`�?Webhook请求错误: ${url}`, error);
      }
    }
  }

  async sendTemplatedNotification(
    templateId: string,
    data: Record<string, any>,
    channels: NotificationChannel[],
    recipients: string[] = []
  ): Promise<void> {
    // Webhook模板通知逻辑
    await this.sendNotification(
      NotificationLevel.INFO,
      JSON.stringify(data),
      channels,
      recipients
    );
  }
}

// Slack通知服务
export class SlackNotificationService implements NotificationService {
  async sendNotification(
    level: NotificationLevel,
    message: string,
    channels: NotificationChannel[],
    recipients: string[] = [],
    eventData?: EnhancedEvent
  ): Promise<void> {
    if (!channels.includes('slack')) return;

    const webhookUrls =
      recipients.length > 0
        ? recipients
        : [process.env.SLACK_WEBHOOK_URL || ''];

    const slackIcons: Record<NotificationLevel, string> = {
      [NotificationLevel.INFO]: ':information_source:',
      [NotificationLevel.WARNING]: ':warning:',
      [NotificationLevel.ERROR]: ':exclamation:',
      [NotificationLevel.CRITICAL]: ':rotating_light:',
    };

    const icon = slackIcons[level] || ':information_source:';

    for (const url of webhookUrls.filter(Boolean)) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `${icon} [${level.toUpperCase()}] ${message}`,
            attachments: eventData
              ? [
                  {
                    color:
                      level === NotificationLevel.CRITICAL
                        ? 'danger'
                        : level === NotificationLevel.ERROR
                          ? 'warning'
                          : 'good',
                    fields: [
                      {
                        title: '事件ID',
                        value: eventData.id,
                        short: true,
                      },
                      {
                        title: '事件类型',
                        value: eventData.type,
                        short: true,
                      },
                      {
                        title: '时间?,
                        value: eventData.timestamp,
                        short: true,
                      },
                    ],
                  },
                ]
              : [],
          }),
        });

        if (!response.ok) {
          console.error(`�?Slack通知发送失?`, await response.text());
        } else {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?Slack通知已发送`)}
      } catch (error) {
        console.error(`�?Slack通知错误:`, error);
      }
    }
  }

  async sendTemplatedNotification(
    templateId: string,
    data: Record<string, any>,
    channels: NotificationChannel[],
    recipients: string[] = []
  ): Promise<void> {
    await this.sendNotification(
      NotificationLevel.INFO,
      JSON.stringify(data),
      channels,
      recipients
    );
  }
}

// 通知管理?export class NotificationManager {
  private services: Map<NotificationChannel, NotificationService> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private throttleCache: Map<string, number> = new Map(); // 节流缓存

  constructor() {
    this.initializeServices();
    this.initializeTemplates();
  }

  private initializeServices(): void {
    this.services.set('email', new EmailNotificationService());
    this.services.set('webhook', new WebhookNotificationService());
    this.services.set('slack', new SlackNotificationService());
    // 可以添加更多通知服务
  }

  private initializeTemplates(): void {
    // 价格更新模板
    this.templates.set('price_update_alert', {
      subject: '价格变动通知',
      content:
        '配件 {{partId}} 价格?{{oldPrice}} 变更?{{newPrice}}，变化幅?{{changePercent}}%',
      channels: ['email', 'slack'],
    });

    // 库存预警模板
    this.templates.set('inventory_warning', {
      subject: '库存预警',
      content:
        '配件 {{partId}} 当前库存 {{newQuantity}}，低于最低库?{{minStock}}',
      channels: ['email', 'sms', 'slack'],
    });

    // 系统告警模板
    this.templates.set('system_alert', {
      subject: '系统告警',
      content: '系统 {{source}} 发生 {{severity}} 级别告警: {{message}}',
      channels: ['email', 'webhook', 'slack'],
    });
  }

  async sendNotification(
    level: NotificationLevel,
    message: string,
    config: NotificationConfig,
    eventData?: EnhancedEvent
  ): Promise<void> {
    // 检查节?    if (config.throttleSeconds) {
      const cacheKey = `${level}:${message}`;
      const lastSent = this.throttleCache.get(cacheKey) || 0;
      const now = Date.now();

      if (now - lastSent < config.throttleSeconds * 1000) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`⏱️ 通知被节? ${cacheKey}`)return;
      }

      this.throttleCache.set(cacheKey, now);
    }

    // 并行发送到所有渠?    const sendPromises = config.channels.map(channel => {
      const service = this.services.get(channel);
      if (service) {
        return service
          .sendNotification(
            level,
            message,
            [channel],
            config.recipients,
            eventData
          )
          .catch(error => {
            console.error(`�?${channel}通知发送失?`, error);
          });
      }
      return Promise.resolve();
    });

    await Promise.all(sendPromises);
  }

  async sendTemplatedNotification(
    templateId: string,
    data: Record<string, any>,
    config: NotificationConfig
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`�?未找到通知模板: ${templateId}`);
      return;
    }

    // 渲染模板
    let content = template.content;
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    await this.sendNotification(NotificationLevel.INFO, content, config);
  }

  // 获取可用的通知渠道
  getAvailableChannels(): NotificationChannel[] {
    return Array.from(this.services.keys());
  }

  // 添加自定义模?  addTemplate(id: string, template: NotificationTemplate): void {
    this.templates.set(id, template);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?添加通知模板: ${id}`)}
}

// 告警引擎
export class AlertEngine {
  private rules: Map<string, AlertRule> = new Map();
  private notificationManager: NotificationManager;
  private isRunning: boolean = false;

  constructor() {
    this.notificationManager = new NotificationManager();
    this.loadDefaultRules();
  }

  private loadDefaultRules(): void {
    // 价格大幅波动告警
    this.addRule({
      id: 'price_volatility_alert',
      name: '价格波动告警',
      condition: (event: EnhancedEvent) => {
        if (event.type !== 'price_update') return false;
        const payload = event.payload as any;
        return Math.abs(payload.changePercent) > 15;
      },
      notificationConfig: {
        channels: ['email', 'slack'],
        level: NotificationLevel.WARNING,
        throttleSeconds: 300, // 5分钟节流
        recipients: ['pricing-team@company.com'],
      },
      enabled: true,
      description: '当价格变化超?5%时触发告?,
      triggerCount: 0,
    });

    // 库存不足告警
    this.addRule({
      id: 'inventory_low_alert',
      name: '库存不足告警',
      condition: (event: EnhancedEvent) => {
        if (event.type !== 'inventory_change') return false;
        const payload = event.payload as any;
        return payload.newQuantity <= payload.minStock;
      },
      notificationConfig: {
        channels: ['email', 'sms', 'slack'],
        level: NotificationLevel.CRITICAL,
        throttleSeconds: 60, // 1分钟节流
        recipients: ['inventory-team@company.com', '+86-138-0000-0000'],
      },
      enabled: true,
      description: '当库存低于最低库存时触发紧急告?,
      triggerCount: 0,
    });

    // 系统错误告警
    this.addRule({
      id: 'system_error_alert',
      name: '系统错误告警',
      condition: (event: EnhancedEvent) => {
        return (
          event.type === 'system_alert' &&
          ['high', 'critical'].includes(event.payload.severity)
        );
      },
      notificationConfig: {
        channels: ['email', 'webhook', 'slack'],
        level: NotificationLevel.ERROR,
        throttleSeconds: 120, // 2分钟节流
        recipients: [
          'ops-team@company.com',
          process.env.OPSGENIE_WEBHOOK || '',
        ],
      },
      enabled: true,
      description: '系统高级别错误告?,
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?添加告警规则: ${rule.name}`)}

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🗑�?删除告警规则: ${ruleId}`)}

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?启用告警规则: ${rule.name}`)}
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🚫 禁用告警规则: ${rule.name}`)}
  }

  async evaluateEvent(event: EnhancedEvent): Promise<void> {
    if (!this.isRunning) return;

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(event)) {
          await this.triggerAlert(rule, event);
        }
      } catch (error) {
        console.error(`�?告警规则评估失败 ${rule.id}:`, error);
      }
    }
  }

  private async triggerAlert(
    rule: AlertRule,
    event: EnhancedEvent
  ): Promise<void> {
    rule.triggerCount = (rule.triggerCount || 0) + 1;
    rule.lastTriggered = new Date().toISOString();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🚨 触发告警: ${rule.name} (${rule.id})`);

    // 发送通知
    await this.notificationManager.sendNotification(
      rule.notificationConfig.level,
      `告警: ${rule.name}\n事件详情: ${JSON.stringify(event.payload, null, 2)}`,
      rule.notificationConfig,
      event
    );

    // 记录监控指标
    monitoringService.recordMetric('alerts_triggered', 1, {
      ruleId: rule.id,
      eventType: event.type,
      level: rule.notificationConfig.level,
    });
  }

  start(): void {
    this.isRunning = true;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?告警引擎已启?)}

  stop(): void {
    this.isRunning = false;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 告警引擎已停?)}

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getRuleStats(): Record<
    string,
    { triggerCount: number; lastTriggered?: string }
  > {
    const stats: Record<
      string,
      { triggerCount: number; lastTriggered?: string }
    > = {};
    for (const [id, rule] of this.rules.entries()) {
      stats[id] = {
        triggerCount: rule.triggerCount || 0,
        lastTriggered: rule.lastTriggered,
      };
    }
    return stats;
  }
}

// 事件处理管道
export class EventProcessingPipeline {
  private processors: EnhancedEventProcessor[] = [];
  private alertEngine: AlertEngine;

  constructor() {
    this.alertEngine = new AlertEngine();
    this.initializeCoreProcessors();
  }

  private initializeCoreProcessors(): void {
    // 注册核心处理器到增强服务
    enhancedRealTimeService.registerProcessor(new CacheUpdateProcessor());
    enhancedRealTimeService.registerProcessor(
      new NotificationProcessor(this.alertEngine)
    );
    enhancedRealTimeService.registerProcessor(new AnalyticsProcessor());
    enhancedRealTimeService.registerProcessor(new AuditProcessor());
  }

  start(): void {
    this.alertEngine.start();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?事件处理管道已启?)}

  stop(): void {
    this.alertEngine.stop();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 事件处理管道已停?)}

  getAlertEngine(): AlertEngine {
    return this.alertEngine;
  }
}

// 核心处理器实?
// 缓存更新处理?export class CacheUpdateProcessor implements EnhancedEventProcessor {
  getType(): EnhancedEventType {
    return 'price_update';
  }

  getPriority(): EventPriority {
    return EventPriority.HIGH;
  }

  async process(event: EnhancedEvent): Promise<void> {
    const payload = event.payload as any;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔄 更新缓存: ${payload.partId} 价格`)// 这里实现实际的缓存更新逻辑
    // await cacheService.set(`price:${payload.partId}`, payload.newPrice);
    // await cacheService.invalidate(`product:${payload.partId}`);
  }
}

// 通知处理?export class NotificationProcessor implements EnhancedEventProcessor {
  constructor(private alertEngine: AlertEngine) {}

  getType(): EnhancedEventType {
    return 'system_alert';
  }

  getPriority(): EventPriority {
    return EventPriority.HIGH;
  }

  async process(event: EnhancedEvent): Promise<void> {
    await this.alertEngine.evaluateEvent(event);
  }
}

// 分析处理?export class AnalyticsProcessor implements EnhancedEventProcessor {
  getType(): EnhancedEventType {
    return 'user_action';
  }

  getPriority(): EventPriority {
    return EventPriority.NORMAL;
  }

  async process(event: EnhancedEvent): Promise<void> {
    const payload = event.payload as any;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📊 记录用户行为: ${payload.userId} -> ${payload.actionType}`)// 发送到分析服务
    // await analyticsService.track({
    //   userId: payload.userId,
    //   event: payload.actionType,
    //   properties: payload.additionalData,
    //   timestamp: payload.timestamp
    // });
  }
}

// 审计处理?export class AuditProcessor implements EnhancedEventProcessor {
  getType(): EnhancedEventType {
    return 'transaction_commit';
  }

  getPriority(): EventPriority {
    return EventPriority.NORMAL;
  }

  async process(event: EnhancedEvent): Promise<void> {
    const payload = event.payload as any;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📝 记录事务审计: ${payload.transactionId}`)// 记录到审计日?    // await auditService.log({
    //   transactionId: payload.transactionId,
    //   operation: payload.operationType,
    //   entities: payload.entitiesAffected,
    //   userId: payload.userId,
    //   timestamp: payload.timestamp
    // });
  }
}

// 导出默认实例
// 导出默认实例
export const notificationManager = new NotificationManager();
export const alertEngine = new AlertEngine();
export const eventProcessingPipeline = new EventProcessingPipeline();
