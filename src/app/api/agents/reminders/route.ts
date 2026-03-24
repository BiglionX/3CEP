/**
 * 订阅提醒管理 API
 *
 * GET /api/agents/reminders - 获取用户的提醒历史
 * POST /api/agents/reminders/test - 手动触发测试提醒（仅管理员）
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
} from '@/lib/api/error-handler';
import { triggerManualReminder } from '@/services/subscription-reminder.service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/agents/reminders
 * 获取用户的订阅提醒历史
 */
export async function GET(request: NextRequest) {
  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 验证用户登录
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // 构建查询
    let query = supabase
      .from('agent_subscription_reminders')
      .select(
        `
        *,
        user_agent_installations (
          agent_id,
          expiry_date,
          agents (
            name,
            description
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', session.user.id)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 应用状态过滤
    if (status && ['pending', 'sent', 'failed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: reminders, error, count } = await query;

    if (error) {
      console.error('查询提醒历史失败:', error);
      return handleSupabaseError(error, { path, requestId });
    }

    // 转换数据格式
    const formattedReminders = (reminders || []).map(r => ({
      id: r.id,
      reminderType: r.reminder_type,
      daysBeforeExpiry: r.days_before_expiry,
      sentAt: r.sent_at,
      status: r.status,
      agentId: (r.user_agent_installations as any)?.agent_id,
      agentName: (r.user_agent_installations as any)?.agents?.name,
      expiryDate: (r.user_agent_installations as any)?.expiry_date,
      metadata: r.metadata,
    }));

    return createSuccessResponse(
      {
        reminders: formattedReminders,
        pagination: {
          limit,
          offset,
          total: count || 0,
        },
      },
      {
        message: '获取提醒历史成功',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('获取提醒历史失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * POST /api/agents/reminders/test
 * 手动触发测试提醒（仅管理员）
 */
export async function POST(request: NextRequest) {
  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 验证用户登录和管理员权限
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 检查管理员权限
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '权限不足，仅管理员可操作',
      });
    }

    // 解析请求体
    const body = await request.json();
    const { installationId, daysBeforeExpiry = 7 } = body;

    if (!installationId) {
      return createErrorResponse(ErrorCode.INVALID_REQUEST, {
        path,
        requestId,
        message: '缺少安装 ID',
      });
    }

    // 触发测试提醒
    const result = await triggerManualReminder(
      installationId,
      daysBeforeExpiry
    );

    if (result.success) {
      return createSuccessResponse(result, {
        message: '测试提醒发送成功',
        path,
        requestId,
      });
    } else {
      return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
        path,
        requestId,
        message: result.message,
      });
    }
  } catch (error: unknown) {
    console.error('触发测试提醒失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}
