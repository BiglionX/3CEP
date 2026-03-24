/**
 * 订阅暂停/恢复 API
 *
 * PUT /api/agents/[id]/subscription/pause - 暂停订阅
 * POST /api/agents/[id]/subscription/resume - 恢复订阅
 * GET /api/agents/[id]/subscription/status - 获取订阅状态
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
} from '@/lib/api/error-handler';
import {
  authenticateAndGetUser,
  PermissionValidator,
} from '@/lib/auth/permissions';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PUT /api/agents/[id]/subscription/pause
 * 暂停订阅
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.url;
  const requestId = crypto.randomUUID();
  const agentId = params.id;

  try {
    // 步骤 1: 验证用户认证
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

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any
    );

    if (authResult.error || !authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error || '用户认证失败',
      });
    }

    const user = authResult.user;

    // 步骤 3: 验证订阅所有者权限（用于后续检查）
    const validator = new PermissionValidator(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isOwner = await validator.isAgentOwner(agentId, user.id);

    // 检查是否为订阅用户（通过 user_agent_installations 表）
    const { data: subscriptionCheck } = await supabase
      .from('user_agent_installations')
      .select('user_id')
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!subscriptionCheck && user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限操作此订阅，仅订阅所有者或管理员可操作',
      });
    }

    // 步骤 4: 解析请求体
    const body = await request.json();
    const { reason } = body;

    // 步骤 5: 获取当前订阅状态
    const { data: installation, error: fetchError } = await supabase
      .from('user_agent_installations')
      .select('*')
      .eq('user_id', user.id) // 使用认证用户的 ID
      .eq('agent_id', agentId)
      .single();

    if (fetchError || !installation) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '未找到订阅记录',
      });
    }

    // 检查是否已暂停
    if (installation.paused_at && !installation.resumed_at) {
      return createErrorResponse(ErrorCode.INVALID_OPERATION, {
        path,
        requestId,
        message: '订阅已在暂停状态',
      });
    }

    // 检查是否已达到最大暂停次数
    const currentPauseCount = installation.current_pause_count || 0;
    const maxPauseCount = installation.max_pause_count || 3;

    if (currentPauseCount >= maxPauseCount) {
      return createErrorResponse(ErrorCode.QUOTA_EXCEEDED, {
        path,
        requestId,
        message: `已达到最大暂停次数限制（${maxPauseCount}次/年）`,
        details: {
          usedCount: currentPauseCount,
          maxCount: maxPauseCount,
        },
      });
    }

    // 执行暂停操作
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('user_agent_installations')
      .update({
        paused_at: now,
        pause_reason: reason || null,
        current_pause_count: currentPauseCount + 1,
        status: 'paused', // 更新状态为暂停
      })
      .eq('id', installation.id)
      .select()
      .single();

    if (updateError) {
      console.error('暂停订阅失败:', updateError);
      return handleSupabaseError(updateError, { path, requestId });
    }

    // 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'subscription_paused',
      resource_type: 'agent_subscription',
      resource_id: installation.id,
      details: {
        agent_id: agentId,
        reason: reason || null,
        pauseCount: currentPauseCount + 1,
      },
    });

    return createSuccessResponse(
      {
        subscription: {
          id: updated.id,
          status: updated.status,
          pausedAt: updated.paused_at,
          pauseReason: updated.pause_reason,
          remainingPauses: maxPauseCount - (currentPauseCount + 1),
        },
        message: '订阅已暂停，暂停期间不计费',
      },
      {
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('暂停订阅失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * POST /api/agents/[id]/subscription/resume
 * 恢复订阅
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.url;
  const requestId = crypto.randomUUID();
  const agentId = params.id;

  try {
    // 步骤 1: 验证用户认证
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

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any
    );

    if (authResult.error || !authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error || '用户认证失败',
      });
    }

    const user = authResult.user;

    // 步骤 3: 验证订阅所有者权限
    const { data: subscriptionCheck } = await supabase
      .from('user_agent_installations')
      .select('user_id')
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!subscriptionCheck && user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限操作此订阅，仅订阅所有者或管理员可操作',
      });
    }

    // 步骤 4: 获取当前订阅状态
    const { data: installation, error: fetchError } = await supabase
      .from('user_agent_installations')
      .select('*')
      .eq('user_id', user.id) // 使用认证用户的 ID
      .eq('agent_id', agentId)
      .single();

    if (fetchError || !installation) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '未找到订阅记录',
      });
    }

    // 检查是否处于暂停状态
    if (!installation.paused_at || installation.resumed_at) {
      return createErrorResponse(ErrorCode.INVALID_OPERATION, {
        path,
        requestId,
        message: '订阅不在暂停状态',
      });
    }

    // 计算暂停时长
    const pausedDate = new Date(installation.paused_at);
    const resumedDate = new Date();
    const pauseDurationDays = Math.floor(
      (resumedDate.getTime() - pausedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 执行恢复操作
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('user_agent_installations')
      .update({
        resumed_at: now,
        status: 'active', // 恢复为活跃状态
      })
      .eq('id', installation.id)
      .select()
      .single();

    if (updateError) {
      console.error('恢复订阅失败:', updateError);
      return handleSupabaseError(updateError, { path, requestId });
    }

    // 如果订阅有有效期，需要顺延
    let newExpiryDate = installation.expiry_date;
    if (installation.expiry_date) {
      const expiryDate = new Date(installation.expiry_date);
      // 有效期顺延暂停天数
      expiryDate.setDate(expiryDate.getDate() + pauseDurationDays);
      newExpiryDate = expiryDate.toISOString();

      // 更新有效期
      await supabase
        .from('user_agent_installations')
        .update({
          expiry_date: newExpiryDate,
        })
        .eq('id', installation.id);
    }

    // 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: user.id, // 使用认证用户的 ID
      action: 'subscription_resumed',
      resource_type: 'agent_subscription',
      resource_id: installation.id,
      details: {
        agent_id: agentId,
        pauseDurationDays,
        newExpiryDate: newExpiryDate,
      },
    });

    return createSuccessResponse(
      {
        subscription: {
          id: updated.id,
          status: updated.status,
          resumedAt: now,
          pauseDurationDays,
          newExpiryDate,
        },
        message: `订阅已恢复，有效期已顺延${pauseDurationDays}天`,
      },
      {
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('恢复订阅失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * GET /api/agents/[id]/subscription/status
 * 获取订阅状态（包括暂停信息）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证
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

    // 步骤 2: 获取用户信息
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any
    );

    if (authResult.error || !authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error || '用户认证失败',
      });
    }

    const user = authResult.user;

    // 步骤 3: 验证订阅所有者权限
    const { data: subscriptionCheck } = await supabase
      .from('user_agent_installations')
      .select('user_id')
      .eq('agent_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!subscriptionCheck && user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限查看此订阅，仅订阅所有者或管理员可操作',
      });
    }

    // 步骤 4: 获取订阅状态
    const { data: installation, error } = await supabase
      .from('user_agent_installations')
      .select(
        `
        *,
        agents (
          name,
          description
        )
      `
      )
      .eq('user_id', user.id) // 使用认证用户的 ID
      .eq('agent_id', params.id)
      .single();

    if (error || !installation) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '未找到订阅记录',
      });
    }

    // 计算暂停相关信息
    const isPaused = !!(installation.paused_at && !installation.resumed_at);
    let pauseDurationDays = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const estimatedResumeDate = null; // 预留字段，用于未来实现

    if (isPaused && installation.paused_at) {
      const pausedDate = new Date(installation.paused_at);
      const now = new Date();
      pauseDurationDays = Math.floor(
        (now.getTime() - pausedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // 计算剩余暂停次数
    const remainingPauses =
      (installation.max_pause_count || 3) -
      (installation.current_pause_count || 0);

    return createSuccessResponse(
      {
        subscription: {
          id: installation.id,
          agentId: installation.agent_id,
          agentName: (installation.agents as any)?.name,
          status: installation.status,
          startDate: installation.created_at,
          expiryDate: installation.expiry_date,
          isPaused,
          pausedAt: installation.paused_at,
          resumedAt: installation.resumed_at,
          pauseReason: installation.pause_reason,
          pauseDurationDays,
          maxPauseCount: installation.max_pause_count || 3,
          currentPauseCount: installation.current_pause_count || 0,
          remainingPauses,
          canPause: remainingPauses > 0 && !isPaused,
          canResume: isPaused,
        },
        pausePolicy: {
          maxPausesPerYear: installation.max_pause_count || 3,
          pauseDuringPeriod: '暂停期间不计费，有效期冻结',
          resumeBenefit: '恢复后有效期自动顺延',
        },
      },
      {
        message: '获取订阅状态成功',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('获取订阅状态失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}
