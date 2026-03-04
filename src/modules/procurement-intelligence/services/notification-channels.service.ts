// 通知渠道集成服务
// 支持多种通知渠道的统一管理和发?

import { createClient } from '@supabase/supabase-js';

// 通知渠道类型
export type NotificationChannelType =
  | 'email'
  | 'slack'
  | 'sms'
  | 'webhook'
  | 'dingtalk'
  | 'wechat'
  | 'pagerduty';

// 通知渠道配置
export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  config: ChannelConfig;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// 渠道配置接口
export interface ChannelConfig {
  // 邮件配置
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  from_email?: string;

  // Slack配置
  webhook_url?: string;
  channel?: string;
  bot_token?: string;

  // 短信配置
  provider?: 'twilio' | 'aliyun' | 'tencent';
  access_key?: string;
  secret_key?: string;
  sign_name?: string;
  template_code?: string;

  // Webhook配置
  url?: string;
  method?: 'POST' | 'GET';
  headers?: Record<string, string>;
  auth_type?: 'basic' | 'bearer' | 'none';
  auth_credentials?: string;

  // 钉钉配置
  dingtalk_webhook?: string;
  dingtalk_secret?: string;

  // 微信配置
  wechat_corp_id?: string;
  wechat_agent_id?: string;
  wechat_secret?: string;

  // PagerDuty配置
  pagerduty_integration_key?: string;
  pagerduty_api_key?: string;
}

// 通知消息接口
export interface NotificationMessage {
  id: string;
  channel_id: string;
  channel_type: NotificationChannelType;
  title: string;
  content: string;
  recipients: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
}

// 通知发送结?
export interface NotificationResult {
  success: boolean;
  messageId: string;
  channel: string;
  errorMessage?: string;
  timestamp: string;
}

export class NotificationChannelsService {
  private supabase: any;
  private maxRetries = 3;
  private retryDelay = 5000; // 5�?

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 创建通知渠道
   */
  async createChannel(
    name: string,
    type: NotificationChannelType,
    config: ChannelConfig
  ): Promise<NotificationChannel> {
    try {
      const newChannel: any = {
        id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        config,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('notification_channels')
        .insert(newChannel)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?通知渠道创建成功: ${name} (${type})`);
      return data;
    } catch (error) {
      console.error('创建通知渠道失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有通知渠道
   */
  async getAllChannels(
    enabledOnly: boolean = false
  ): Promise<NotificationChannel[]> {
    try {
      let query = this.supabase.from('notification_channels').select('*');

      if (enabledOnly) {
        query = query.eq('enabled', true);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取通知渠道失败:', error);
      throw error;
    }
  }

  /**
   * 根据类型获取通知渠道
   */
  async getChannelsByType(
    type: NotificationChannelType
  ): Promise<NotificationChannel[]> {
    try {
      const { data, error } = await this.supabase
        .from('notification_channels')
        .select('*')
        .eq('type', type)
        .eq('enabled', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('根据类型获取通知渠道失败:', error);
      throw error;
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(
    channelId: string,
    title: string,
    content: string,
    recipients: string[],
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<NotificationResult> {
    try {
      const channel = await this.getChannelById(channelId);
      if (!channel || !channel.enabled) {
        throw new Error('通知渠道不可?);
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 记录消息
      const messageRecord: any = {
        id: messageId,
        channel_id: channelId,
        channel_type: channel.type,
        title,
        content,
        recipients,
        priority,
        status: 'pending',
        retry_count: 0,
        max_retries: this.maxRetries,
        created_at: new Date().toISOString(),
      };

      await this.supabase.from('notification_messages').insert(messageRecord);

      // 发送通知
      const result = await this.sendViaChannel(
        channel,
        title,
        content,
        recipients,
        priority
      );

      // 更新消息状?
      await this.updateMessageStatus(
        messageId,
        result.success ? 'sent' : 'failed',
        result.errorMessage
      );

      if (result.success) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?通知发送成? ${channel.name}`)} else {
        console.error(`�?通知发送失? ${channel.name}`, result.errorMessage);
      }

      return {
        ...result,
        messageId,
      };
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    }
  }

  /**
   * 通过指定渠道发送通知
   */
  private async sendViaChannel(
    channel: NotificationChannel,
    title: string,
    content: string,
    recipients: string[],
    priority: string
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      switch (channel.type) {
        case 'email':
          return await this.sendEmail(
            channel.config,
            title,
            content,
            recipients
          );
        case 'slack':
          return await this.sendSlack(
            channel.config,
            title,
            content,
            recipients
          );
        case 'sms':
          return await this.sendSMS(channel.config, title, content, recipients);
        case 'webhook':
          return await this.sendWebhook(
            channel.config,
            title,
            content,
            recipients
          );
        case 'dingtalk':
          return await this.sendDingTalk(
            channel.config,
            title,
            content,
            recipients
          );
        case 'wechat':
          return await this.sendWeChat(
            channel.config,
            title,
            content,
            recipients
          );
        case 'pagerduty':
          return await this.sendPagerDuty(
            channel.config,
            title,
            content,
            recipients
          );
        default:
          throw new Error(`不支持的通知渠道类型: ${channel.type}`);
      }
    } catch (error) {
      return {
        success: false,
        channel: channel.name,
        errorMessage: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 发送邮?
   */
  private async sendEmail(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟邮件发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送邮?`, {
        to: recipients,
        subject: title,
        content: content,
      })// 实际应用中应该使?nodemailer 或其他邮件服?
      /*
      const transporter = nodemailer.createTransporter({
        host: config.smtp_host,
        port: config.smtp_port,
        auth: {
          user: config.smtp_user,
          pass: config.smtp_password
        }
      });

      await transporter.sendMail({
        from: config.from_email,
        to: recipients.join(','),
        subject: title,
        text: content
      });
      */

      return {
        success: true,
        channel: 'email',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`邮件发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送Slack消息
   */
  private async sendSlack(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟Slack发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💬 发送Slack消息:`, {
        channel: config.channel,
        title,
        content,
      })// 实际应用中应该调用Slack API
      /*
      const slack = new WebClient(config.bot_token);
      await slack.chat.postMessage({
        channel: config.channel || '#alerts',
        text: `*${title}*\n${content}`,
        mrkdwn: true
      });
      */

      return {
        success: true,
        channel: 'slack',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Slack消息发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送短?
   */
  private async sendSMS(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟短信发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📱 发送短?`, {
        phones: recipients,
        content: `${title}: ${content}`,
      })// 实际应用中应该调用短信服务商API
      /*
      switch (config.provider) {
        case 'twilio':
          // Twilio API调用
          break;
        case 'aliyun':
          // 阿里云短信API调用
          break;
        case 'tencent':
          // 腾讯云短信API调用
          break;
      }
      */

      return {
        success: true,
        channel: 'sms',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`短信发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送Webhook
   */
  private async sendWebhook(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟Webhook发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔗 发送Webhook:`, {
        url: config.url,
        method: config.method,
        payload: { title, content, recipients },
      })// 实际应用中应该发送HTTP请求
      /*
      const response = await fetch(config.url!, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify({ title, content, recipients })
      });
      */

      return {
        success: true,
        channel: 'webhook',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Webhook发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送钉钉消?
   */
  private async sendDingTalk(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟钉钉发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`钉钉消息发?`, {
        webhook: config.dingtalk_webhook,
        title,
        content,
      })return {
        success: true,
        channel: 'dingtalk',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`钉钉消息发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送微信消?
   */
  private async sendWeChat(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟微信发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`微信消息发?`, {
        corp_id: config.wechat_corp_id,
        agent_id: config.wechat_agent_id,
        title,
        content,
      })return {
        success: true,
        channel: 'wechat',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`微信消息发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 发送PagerDuty事件
   */
  private async sendPagerDuty(
    config: ChannelConfig,
    title: string,
    content: string,
    recipients: string[]
  ): Promise<Omit<NotificationResult, 'messageId'>> {
    try {
      // 模拟PagerDuty发?
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`PagerDuty事件发?`, {
        integration_key: config.pagerduty_integration_key,
        title,
        content,
      })return {
        success: true,
        channel: 'pagerduty',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`PagerDuty事件发送失? ${(error as Error).message}`);
    }
  }

  /**
   * 根据ID获取渠道
   */
  private async getChannelById(
    id: string
  ): Promise<NotificationChannel | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_channels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('获取通知渠道失败:', error);
      throw error;
    }
  }

  /**
   * 更新消息状?
   */
  private async updateMessageStatus(
    messageId: string,
    status: 'sent' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = { status };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (status === 'failed') {
        updateData.error_message = errorMessage;
      }

      await this.supabase
        .from('notification_messages')
        .update(updateData)
        .eq('id', messageId);
    } catch (error) {
      console.error('更新消息状态失?', error);
    }
  }

  /**
   * 重试失败的通知
   */
  async retryFailedNotifications(): Promise<void> {
    try {
      const { data: failedMessages, error } = await this.supabase
        .from('notification_messages')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', this.maxRetries)
        .order('created_at');

      if (error) throw error;

      for (const message of failedMessages || []) {
        try {
          const channel = await this.getChannelById(message.channel_id);
          if (channel && channel.enabled) {
            const result = await this.sendViaChannel(
              channel,
              message.title,
              message.content,
              message.recipients,
              message.priority
            );

            if (result.success) {
              await this.updateMessageStatus(message.id, 'sent');
            } else {
              // 增加重试次数
              await this.supabase
                .from('notification_messages')
                .update({
                  retry_count: message.retry_count + 1,
                  error_message: result.errorMessage,
                }) as any
                .eq('id', message.id);
            }
          }
        } catch (error) {
          console.error(`重试消息失败 ${message.id}:`, error);
        }
      }
    } catch (error) {
      console.error('重试失败通知失败:', error);
    }
  }

  /**
   * 获取通知统计
   */
  async getNotificationStatistics(
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<any> {
    try {
      const startDate = new Date();
      switch (period) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const { data: messages, error } = await this.supabase
        .from('notification_messages')
        .select('status, channel_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total: messages?.length || 0,
        successful:
          messages?.filter((m: any) => m.status === 'sent').length || 0,
        failed: messages?.filter((m: any) => m.status === 'failed').length || 0,
        by_channel: {} as Record<
          string,
          { total: number; success: number; failed: number }
        >,
        by_status: {} as Record<string, number>,
      };

      messages?.forEach((msg: any) => {
        // 按渠道统?
        if (!stats.by_channel[msg.channel_type]) {
          stats.by_channel[msg.channel_type] = {
            total: 0,
            success: 0,
            failed: 0,
          };
        }
        stats.by_channel[msg.channel_type].total++;
        if (msg.status === 'sent') {
          stats.by_channel[msg.channel_type].success++;
        } else if (msg.status === 'failed') {
          stats.by_channel[msg.channel_type].failed++;
        }

        // 按状态统?
        stats.by_status[msg.status] = (stats.by_status[msg.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('获取通知统计失败:', error);
      throw error;
    }
  }
}

// 导出实例
export const notificationChannelsService = new NotificationChannelsService();
