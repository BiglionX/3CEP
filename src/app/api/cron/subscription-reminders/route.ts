/**
 * 订阅提醒调度 API
 * 用于手动触发或定时触发订阅提醒任务
 */

import { subscriptionReminderScheduler } from '@/lib/scheduler/subscription-reminder.scheduler';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cron/subscription-reminders
 * 触发订阅提醒调度任务
 */
export async function POST(request: NextRequest) {
  try {
    // 验证授权（仅允许管理员或系统调用）
    const authHeader = request.headers.get('authorization');
    const isCronJob = request.headers.get('x-cron-job') === 'true';

    if (!isCronJob && !authHeader?.includes('Bearer')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // eslint-disable-next-line no-console
    console.log('开始执行订阅提醒调度任务...');

    // 执行调度任务
    const result = await subscriptionReminderScheduler.runScheduledReminders();

    return NextResponse.json({
      success: true,
      message: '订阅提醒调度任务执行完成',
      data: result,
    });
  } catch (error) {
    console.error('执行订阅提醒调度任务失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/subscription-reminders
 * 获取调度任务状态信息
 */
export async function GET() {
  try {
    // 这里可以添加查询最近提醒发送记录的逻辑
    return NextResponse.json({
      status: 'active',
      lastRun: null,
      nextRun: null,
      config: {
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        daysBeforeExpiry: [30, 7, 3, 1],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
