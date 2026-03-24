/**
 * 手动触发定时任务 API
 *
 * POST /api/cron/trigger
 * Body: { jobName: 'agent-status-snapshot' | 'agent-history-cleanup' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { triggerCronJob } from '../../config/cron-jobs.config';

export async function POST(request: NextRequest) {
  try {
    // TODO: 添加权限验证（仅管理员可触发）
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '缺少认证信息',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobName } = body;

    if (!jobName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '缺少必填参数：jobName',
          },
        },
        { status: 400 }
      );
    }

    // 触发定时任务
    const result = await triggerCronJob(jobName);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '定时任务执行成功',
        result: result.result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXECUTION_FAILED',
            message: result.error,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('触发定时任务失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '触发失败',
        },
      },
      { status: 500 }
    );
  }
}
