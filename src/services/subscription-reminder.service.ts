/**
 * 订阅到期提醒服务
 *
 * 提供订阅到期提醒功能，支持提前 7 天、3 天、1 天自动发送提醒
 * 通过定时任务每日执行扫描
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 提醒策略配置
 */
export interface ReminderPolicy {
  daysBefore: number; // 提前几天
  reminderType: 'email' | 'sms' | 'in_app'; // 提醒方式
  enabled: boolean; // 是否启用
}

/**
 * 默认提醒策略：提前 7 天、3 天、1 天
 */
const DEFAULT_REMINDER_POLICIES: ReminderPolicy[] = [
  { daysBefore: 7, reminderType: 'email', enabled: true },
  { daysBefore: 3, reminderType: 'email', enabled: true },
  { daysBefore: 1, reminderType: 'sms', enabled: true },
];

/**
 * 提醒结果
 */
export interface ReminderResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  details: Array<{
    userId: string;
    agentId: string;
    expiryDate: string;
    daysBefore: number;
    reminderType: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
}

/**
 * 扫描并发送即将到期的订阅提醒
 *
 * @param policies 提醒策略配置，默认为 DEFAULT_REMINDER_POLICIES
 * @returns 提醒执行结果
 */
export async function scanAndSendExpiryReminders(
  policies: ReminderPolicy[] = DEFAULT_REMINDER_POLICIES
): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    sentCount: 0,
    failedCount: 0,
    details: [],
  };

  try {
    // 遍历每个提醒策略
    for (const policy of policies) {
      if (!policy.enabled) continue;

      // 计算目标日期范围（今天 + policy.daysBefore 天后的日期）
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + policy.daysBefore);

      // 格式化日期为 ISO 字符串
      const todayStr = today.toISOString();
      const targetDateStr = targetDate.toISOString();

      // eslint-disable-next-line no-console
      console.log(
        `[订阅提醒] 扫描策略：提前${policy.daysBefore}天，目标日期范围：${todayStr} ~ ${targetDateStr}`
      );

      // 查询即将到期的订阅
      const { data: expiringSubscriptions, error } = await supabase
        .from('user_agent_installations')
        .select(
          `
          id,
          user_id,
          agent_id,
          expiry_date,
          status,
          users (
            id,
            email,
            phone
          ),
          agents (
            id,
            name,
            description
          )
        `
        )
        .eq('status', 'active')
        .not('expiry_date', 'is', null)
        .gte('expiry_date', todayStr)
        .lte('expiry_date', targetDateStr);

      if (error) {
        console.error('[订阅提醒] 查询即将到期的订阅失败:', error);
        result.success = false;
        continue;
      }

      if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
        // eslint-disable-next-line no-console
        console.log(`[订阅提醒] 未发现提前${policy.daysBefore}天到期的订阅`);
        continue;
      }

      // eslint-disable-next-line no-console
      console.log(
        `[订阅提醒] 发现${expiringSubscriptions.length}个即将到期的订阅`
      );

      // 为每个订阅发送提醒
      for (const subscription of expiringSubscriptions) {
        try {
          // 检查是否已经发送过相同类型的提醒
          const { data: existingReminder } = await supabase
            .from('agent_subscription_reminders')
            .select('id')
            .eq('user_id', subscription.user_id)
            .eq('agent_id', subscription.agent_id)
            .eq('reminder_type', policy.reminderType)
            .eq('days_before_expiry', policy.daysBefore)
            .single();

          if (existingReminder) {
            // eslint-disable-next-line no-console
            console.log(
              `[订阅提醒] 用户${subscription.user_id}已发送过提前${policy.daysBefore}天的${policy.reminderType}提醒，跳过`
            );
            continue;
          }

          // 发送提醒
          const reminderResult = await sendReminder(
            subscription,
            policy.daysBefore,
            policy.reminderType
          );

          if (reminderResult.success) {
            result.sentCount++;
            result.details.push({
              userId: subscription.user_id,
              agentId: subscription.agent_id,
              expiryDate: subscription.expiry_date,
              daysBefore: policy.daysBefore,
              reminderType: policy.reminderType,
              status: 'sent',
            });
          } else {
            result.failedCount++;
            result.details.push({
              userId: subscription.user_id,
              agentId: subscription.agent_id,
              expiryDate: subscription.expiry_date,
              daysBefore: policy.daysBefore,
              reminderType: policy.reminderType,
              status: 'failed',
              error: reminderResult.error,
            });
          }
        } catch (error: any) {
          console.error('[订阅提醒] 发送提醒失败:', error);
          result.failedCount++;
          result.details.push({
            userId: subscription.user_id,
            agentId: subscription.agent_id,
            expiryDate: subscription.expiry_date,
            daysBefore: policy.daysBefore,
            reminderType: policy.reminderType,
            status: 'failed',
            error: error.message,
          });
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error('[订阅提醒] 执行失败:', error);
    result.success = false;
    return result;
  }
}

/**
 * 发送单个提醒
 */
async function sendReminder(
  subscription: any,
  daysBefore: number,
  reminderType: string
): Promise<{ success: boolean; error?: string }> {
  const userId = subscription.user_id;
  const agentId = subscription.agent_id;
  const agentName = subscription.agents?.name;
  const expiryDate = subscription.expiry_date;
  const userEmail = subscription.users?.email;
  const userPhone = subscription.users?.phone;

  try {
    // 根据提醒类型选择发送方式
    let messageContent = '';
    let sendSuccess = false;

    if (reminderType === 'email') {
      messageContent = generateEmailContent(agentName, expiryDate, daysBefore);
      sendSuccess = await sendEmail(userEmail, messageContent);
    } else if (reminderType === 'sms') {
      messageContent = generateSmsContent(agentName, expiryDate, daysBefore);
      sendSuccess = await sendSms(userPhone, messageContent);
    } else if (reminderType === 'in_app') {
      messageContent = generateInAppContent(agentName, expiryDate, daysBefore);
      sendSuccess = await sendInAppNotification(userId, messageContent);
    }

    if (!sendSuccess) {
      throw new Error(`${reminderType}发送失败`);
    }

    // 记录提醒历史
    await supabase.from('agent_subscription_reminders').insert({
      user_id: userId,
      agent_id: agentId,
      installation_id: subscription.id,
      reminder_type: reminderType,
      days_before_expiry: daysBefore,
      sent_at: new Date().toISOString(),
      status: 'sent',
      metadata: {
        agentName,
        expiryDate,
        userEmail,
        userPhone,
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      `[订阅提醒] 成功发送${reminderType}提醒给用户${userId}，智能体${agentName}，将于${daysBefore}天后到期`
    );

    return { success: true };
  } catch (error: any) {
    console.error('[订阅提醒] 发送提醒失败:', error);

    // 记录失败的提醒
    await supabase.from('agent_subscription_reminders').insert({
      user_id: userId,
      agent_id: agentId,
      installation_id: subscription.id,
      reminder_type: reminderType,
      days_before_expiry: daysBefore,
      sent_at: new Date().toISOString(),
      status: 'failed',
      metadata: {
        error: error.message,
        agentName,
        expiryDate,
      },
    });

    return { success: false, error: error.message };
  }
}

/**
 * 生成邮件内容
 */
function generateEmailContent(
  agentName: string,
  expiryDate: string,
  daysBefore: number
): string {
  const expiryDateStr = new Date(expiryDate).toLocaleDateString('zh-CN');

  return `
尊敬的用户：

您的智能体「${agentName}」订阅将于${expiryDateStr}到期（还剩${daysBefore}天）。

为了避免影响您的正常使用，请及时续费。

点击以下链接立即续费：
https://your-domain.com/agents/renewal

如有任何问题，请随时联系我们的客服团队。

祝好！
BigLionX 团队
  `.trim();
}

/**
 * 生成短信内容
 */
function generateSmsContent(
  agentName: string,
  expiryDate: string,
  daysBefore: number
): string {
  const expiryDateStr = new Date(expiryDate).toLocaleDateString('zh-CN');
  return `【BigLionX】您的智能体"${agentName}"订阅将于${expiryDateStr}到期（还剩${daysBefore}天），请及时续费以免中断服务。`;
}

/**
 * 生成站内信内容
 */
function generateInAppContent(
  agentName: string,
  expiryDate: string,
  daysBefore: number
): string {
  const expiryDateStr = new Date(expiryDate).toLocaleDateString('zh-CN');
  return `您的智能体「${agentName}」订阅将于${expiryDateStr}到期，还剩${daysBefore}天。点击立即续费 >>`;
}

/**
 * 发送邮件（需要集成邮件服务）
 */
async function sendEmail(to: string, content: string): Promise<boolean> {
  try {
    // TODO: 集成邮件发送服务（如 SendGrid、Amazon SES 等）
    // 这里仅做示例，实际应用中需要替换为真实的邮件发送逻辑
    // eslint-disable-next-line no-console
    console.log(`[邮件发送] 收件人：${to}`);
    // eslint-disable-next-line no-console
    console.log(`[邮件发送] 内容：${content}`);

    // 示例：使用 fetch 调用邮件服务 API
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: 'noreply@your-domain.com' },
    //     subject: '订阅到期提醒',
    //     content: [{ type: 'text/plain', value: content }],
    //   }),
    // });

    // return response.ok;

    // 开发环境直接返回成功
    return true;
  } catch (error) {
    console.error('[邮件发送] 失败:', error);
    return false;
  }
}

/**
 * 发送短信（需要集成短信服务）
 */
async function sendSms(to: string, content: string): Promise<boolean> {
  try {
    // TODO: 集成短信发送服务（如 Twilio、阿里云短信等）
    // 这里仅做示例，实际应用中需要替换为真实的短信发送逻辑
    // eslint-disable-next-line no-console
    console.log(`[短信发送] 收件人：${to}`);
    // eslint-disable-next-line no-console
    console.log(`[短信发送] 内容：${content}`);

    // 示例：使用 fetch 调用短信服务 API
    // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64')}`,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     To: to,
    //     From: '+1234567890',
    //     Body: content,
    //   }),
    // });

    // return response.ok;

    // 开发环境直接返回成功
    return true;
  } catch (error) {
    console.error('[短信发送] 失败:', error);
    return false;
  }
}

/**
 * 发送站内信通知
 */
async function sendInAppNotification(
  userId: string,
  content: string
): Promise<boolean> {
  try {
    // 插入站内信通知记录
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '订阅到期提醒',
      content: content,
      type: 'subscription_reminder',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('[站内信发送] 失败:', error);
    return false;
  }
}

/**
 * 手动触发提醒（用于测试或管理员手动操作）
 */
export async function triggerManualReminder(
  installationId: string,
  daysBeforeExpiry: number = 7
): Promise<{ success: boolean; message: string }> {
  try {
    // 获取安装信息
    const { data: installation, error } = await supabase
      .from('user_agent_installations')
      .select(
        `
        *,
        users (email, phone),
        agents (name)
      `
      )
      .eq('id', installationId)
      .single();

    if (error || !installation) {
      return {
        success: false,
        message: '未找到有效的订阅记录',
      };
    }

    // 发送提醒
    const result = await sendReminder(installation, daysBeforeExpiry, 'email');

    if (result.success) {
      return {
        success: true,
        message: '测试提醒发送成功',
      };
    } else {
      return {
        success: false,
        message: '测试提醒发送失败',
      };
    }
  } catch (error: any) {
    console.error('[手动提醒] 失败:', error);
    return {
      success: false,
      message: error.message || '手动提醒发送失败',
    };
  }
}

/**
 * 导出服务
 */
export const SubscriptionReminderService = {
  scanAndSendExpiryReminders,
  triggerManualReminder,
};

export default SubscriptionReminderService;
