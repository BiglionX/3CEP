/**
 * 订阅提醒调度服务
 * 定期检查即将到期的订阅并发送提醒
 */

import { createClient } from '@supabase/supabase-js';
import SendGridService from '../email/sendgrid.service';
import TwilioService from '../sms/twilio.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 提醒配置
 */
export interface ReminderConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  daysBeforeExpiry: number[]; // 提前多少天提醒：[30, 7, 3, 1]
}

const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  emailEnabled: true,
  smsEnabled: true,
  inAppEnabled: true,
  daysBeforeExpiry: [30, 7, 3, 1],
};

/**
 * 订阅到期信息
 */
interface ExpiringSubscription {
  installation_id: string;
  user_id: string;
  agent_name: string;
  subscription_plan: string;
  expires_at: string;
  user_email?: string;
  user_phone?: string;
  user_name?: string;
  days_until_expiry: number;
}

/**
 * 提醒记录
 */
interface ReminderRecord {
  installation_id: string;
  reminder_type: 'email' | 'sms' | 'in_app';
  days_before_expiry: number;
  status: 'pending' | 'sent' | 'failed';
  metadata?: Record<string, any>;
}

/**
 * 订阅提醒调度服务类
 */
export class SubscriptionReminderScheduler {
  private config: ReminderConfig;

  constructor(config: Partial<ReminderConfig> = {}) {
    this.config = { ...DEFAULT_REMINDER_CONFIG, ...config };
  }

  /**
   * 主调度方法 - 定期执行
   */
  async runScheduledReminders(): Promise<{
    totalProcessed: number;
    remindersSent: number;
    errors: number;
  }> {
    console.log('开始执行订阅提醒调度任务...');

    try {
      // 获取所有即将到期的订阅
      const expiringSubscriptions = await this.getExpiringSubscriptions();

      console.log(`找到 ${expiringSubscriptions.length} 个即将到期的订阅`);

      let remindersSent = 0;
      let errors = 0;

      // 为每个订阅发送提醒
      for (const subscription of expiringSubscriptions) {
        try {
          await this.sendRemindersForSubscription(subscription);
          remindersSent++;
        } catch (error) {
          console.error(
            `处理订阅 ${subscription.installation_id} 失败:`,
            error
          );
          errors++;
        }
      }

      console.log(
        `调度任务完成：处理 ${expiringSubscriptions.length} 个订阅，发送 ${remindersSent} 个提醒，${errors} 个错误`
      );

      return {
        totalProcessed: expiringSubscriptions.length,
        remindersSent,
        errors,
      };
    } catch (error) {
      console.error('执行调度任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取即将到期的订阅列表
   */
  private async getExpiringSubscriptions(): Promise<ExpiringSubscription[]> {
    const today = new Date().toISOString().split('T')[0];

    // 构建日期条件
    const dateConditions = this.config.daysBeforeExpiry.map(days => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      return targetDate.toISOString().split('T')[0];
    });

    const { data, error } = await supabase
      .from('user_agent_installations')
      .select(
        `
        id,
        user_id,
        agent_name,
        subscription_plan,
        expires_at,
        user_profiles:user_id (
          email,
          phone,
          full_name
        )
      `
      )
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .in(
        'expires_at',
        dateConditions.map(date => `${date}T00:00:00.000Z`)
      );

    if (error) {
      console.error('获取即将到期的订阅失败:', error);
      return [];
    }

    // 格式化数据
    return (data || []).map((item: any) => {
      const expiryDate = new Date(item.expires_at);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        installation_id: item.id,
        user_id: item.user_id,
        agent_name: item.agent_name,
        subscription_plan: item.subscription_plan,
        expires_at: item.expires_at,
        user_email: item.user_profiles?.email,
        user_phone: item.user_profiles?.phone,
        user_name: item.user_profiles?.full_name,
        days_until_expiry: daysUntilExpiry,
      };
    });
  }

  /**
   * 为单个订阅发送所有类型的提醒
   */
  private async sendRemindersForSubscription(
    subscription: ExpiringSubscription
  ): Promise<void> {
    const reminderPromises: Promise<void>[] = [];

    // 邮件提醒
    if (this.config.emailEnabled && subscription.user_email) {
      reminderPromises.push(this.sendEmailReminder(subscription));
    }

    // 短信提醒
    if (this.config.smsEnabled && subscription.user_phone) {
      reminderPromises.push(this.sendSMSReminder(subscription));
    }

    // 应用内通知
    if (this.config.inAppEnabled) {
      reminderPromises.push(this.sendInAppNotification(subscription));
    }

    await Promise.all(reminderPromises);
  }

  /**
   * 发送邮件提醒
   */
  private async sendEmailReminder(
    subscription: ExpiringSubscription
  ): Promise<void> {
    // 检查是否已经发送过相同天数的提醒
    const alreadySent = await this.hasReminderBeenSent(
      subscription.installation_id,
      'email',
      subscription.days_until_expiry
    );

    if (alreadySent) {
      console.log(`邮件提醒已发送过，跳过：${subscription.installation_id}`);
      return;
    }

    const success = await SendGridService.sendTemplateEmail(
      subscription.days_until_expiry <= 3
        ? 'subscription_expiring_soon'
        : 'subscription_reminder',
      subscription.user_email!,
      {
        userName: subscription.user_name,
        agentName: subscription.agent_name,
        subscriptionPlan: subscription.subscription_plan,
        expiryDate: new Date(subscription.expires_at).toLocaleDateString(
          'zh-CN'
        ),
        daysUntilExpiry: subscription.days_until_expiry,
      }
    );

    // 记录提醒发送状态
    await this.recordReminder({
      installation_id: subscription.installation_id,
      reminder_type: 'email',
      days_before_expiry: subscription.days_until_expiry,
      status: success ? 'sent' : 'failed',
      metadata: {
        recipient: subscription.user_email,
        timestamp: new Date().toISOString(),
      },
    });

    if (!success) {
      throw new Error('邮件提醒发送失败');
    }
  }

  /**
   * 发送短信提醒
   */
  private async sendSMSReminder(
    subscription: ExpiringSubscription
  ): Promise<void> {
    // 检查是否已经发送过相同天数的提醒
    const alreadySent = await this.hasReminderBeenSent(
      subscription.installation_id,
      'sms',
      subscription.days_until_expiry
    );

    if (alreadySent) {
      console.log(`短信提醒已发送过，跳过：${subscription.installation_id}`);
      return;
    }

    // 格式化电话号码
    const formattedPhone = TwilioService.formatPhoneNumber(
      subscription.user_phone!
    );

    if (!TwilioService.validatePhoneNumber(formattedPhone)) {
      console.error('无效的电话号码:', subscription.user_phone);
      await this.recordReminder({
        installation_id: subscription.installation_id,
        reminder_type: 'sms',
        days_before_expiry: subscription.days_until_expiry,
        status: 'failed',
        metadata: { error: '无效的电话号码' },
      });
      return;
    }

    const success = await TwilioService.sendTemplateSMS(
      subscription.days_until_expiry <= 3
        ? 'subscription_expiring_soon'
        : 'subscription_reminder',
      formattedPhone,
      {
        userName: subscription.user_name,
        agentName: subscription.agent_name,
        expiryDate: new Date(subscription.expires_at).toLocaleDateString(
          'zh-CN'
        ),
        daysUntilExpiry: subscription.days_until_expiry,
      }
    );

    // 记录提醒发送状态
    await this.recordReminder({
      installation_id: subscription.installation_id,
      reminder_type: 'sms',
      days_before_expiry: subscription.days_until_expiry,
      status: success ? 'sent' : 'failed',
      metadata: {
        recipient: formattedPhone,
        timestamp: new Date().toISOString(),
      },
    });

    if (!success) {
      throw new Error('短信提醒发送失败');
    }
  }

  /**
   * 发送应用内通知
   */
  private async sendInAppNotification(
    subscription: ExpiringSubscription
  ): Promise<void> {
    // 检查是否已经发送过相同天数的提醒
    const alreadySent = await this.hasReminderBeenSent(
      subscription.installation_id,
      'in_app',
      subscription.days_until_expiry
    );

    if (alreadySent) {
      console.log(`应用内通知已发送过，跳过：${subscription.installation_id}`);
      return;
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: subscription.user_id,
      type: 'subscription_reminder',
      title: '订阅到期提醒',
      message: `您的 ${subscription.agent_name} 智能体订阅将在 ${subscription.days_until_expiry} 天后到期`,
      data: {
        installation_id: subscription.installation_id,
        agent_name: subscription.agent_name,
        expires_at: subscription.expires_at,
        days_until_expiry: subscription.days_until_expiry,
      },
      read: false,
    });

    // 记录提醒发送状态
    await this.recordReminder({
      installation_id: subscription.installation_id,
      reminder_type: 'in_app',
      days_before_expiry: subscription.days_until_expiry,
      status: error ? 'failed' : 'sent',
      metadata: error ? { error: error.message } : undefined,
    });

    if (error) {
      throw new Error('应用内通知发送失败');
    }
  }

  /**
   * 检查是否已经发送过指定类型的提醒
   */
  private async hasReminderBeenSent(
    installationId: string,
    reminderType: 'email' | 'sms' | 'in_app',
    daysBeforeExpiry: number
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('agent_subscription_reminders')
      .select('id')
      .eq('installation_id', installationId)
      .eq('reminder_type', reminderType)
      .eq('days_before_expiry', daysBeforeExpiry)
      .eq('status', 'sent')
      .single();

    return !!data;
  }

  /**
   * 记录提醒发送状态
   */
  private async recordReminder(reminder: ReminderRecord): Promise<void> {
    const { error } = await supabase
      .from('agent_subscription_reminders')
      .insert({
        installation_id: reminder.installation_id,
        reminder_type: reminder.reminder_type,
        days_before_expiry: reminder.days_before_expiry,
        status: reminder.status,
        metadata: reminder.metadata,
      });

    if (error) {
      console.error('记录提醒状态失败:', error);
    }
  }
}

// 导出单例
export const subscriptionReminderScheduler =
  new SubscriptionReminderScheduler();

export default SubscriptionReminderScheduler;
