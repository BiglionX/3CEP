/**
 * 订阅到期提醒定时任务
 *
 * 每日凌晨 2 点执行，扫描即将到期的订阅并发送提醒
 * 支持提前 7 天、3 天、1 天三种提醒策略
 */

import { scanAndSendExpiryReminders } from '@/services/subscription-reminder.service';

/**
 * 定时任务处理器
 */
export async function handleSubscriptionReminderJob() {
  console.log('[定时任务] 开始执行订阅到期提醒任务');

  try {
    // 执行提醒扫描
    const result = await scanAndSendExpiryReminders([
      { daysBefore: 7, reminderType: 'email', enabled: true },
      { daysBefore: 3, reminderType: 'email', enabled: true },
      { daysBefore: 1, reminderType: 'sms', enabled: true },
    ]);

    // 记录执行结果
    console.log('[定时任务] 订阅到期提醒任务执行完成:', {
      success: result.success,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      details: result.details,
    });

    return {
      success: result.success,
      message: `成功发送${result.sentCount}个提醒，失败${result.failedCount}个`,
      data: result,
    };
  } catch (error: any) {
    console.error('[定时任务] 订阅到期提醒任务执行失败:', error);
    return {
      success: false,
      message: error.message || '任务执行失败',
      error,
    };
  }
}

/**
 * 定时任务配置（用于 cron 调度）
 *
 * 在 Next.js 中，可以使用以下方式触发：
 * 1. API Route: /api/cron/subscription-reminders
 * 2. 外部 cron 服务（如 GitHub Actions、Vercel Cron 等）
 *
 * Cron 表达式：0 2 * * * (每天凌晨 2 点)
 */
export const SUBSCRIPTION_REMINDER_CRON_CONFIG = {
  name: 'subscription-reminders',
  schedule: '0 2 * * *', // 每天凌晨 2 点
  timezone: 'Asia/Shanghai',
  handler: handleSubscriptionReminderJob,
};

export default handleSubscriptionReminderJob;
