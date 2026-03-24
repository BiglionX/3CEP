/**
 * 智能体手动上下架 API 端点
 *
 * 提供给管理员快速上架/下架智能体的功能
 * 用于违规处理、紧急下架等场景
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
} from '@/lib/api/error-handler';
import {
  AgentPermission,
  AgentRole,
  PermissionChecker,
} from '@/lib/auth/permissions';
import { requireAuth } from '@/lib/auth/server-auth';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

/**
 * POST /api/admin/agents/[id]/shelf
 *
 * 手动上架/下架智能体
 *
 * 请求体：
 * {
 *   action: 'on_shelf' | 'off_shelf',
 *   reason?: string  // 下架原因（可选，建议填写）
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证和权限
    const { user, roles } = await requireAuth();

    const permissionChecker = new PermissionChecker(supabase);
    const userRole = roles[0] as AgentRole;

    // 检查是否拥有上下架权限
    const hasPermission = permissionChecker.hasPermission(
      userRole,
      AgentPermission.AGENT_SHELF
    );

    if (!hasPermission) {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        details: '您没有权限执行此操作，需要 marketplace_admin 或 admin 角色',
      });
    }

    // 步骤 2: 解析请求体
    const body = await request.json();
    const { action, reason } = body;

    // 验证 action 参数
    if (!action || !['on_shelf', 'off_shelf'].includes(action)) {
      return createErrorResponse(ErrorCode.BAD_REQUEST, {
        path,
        requestId,
        details: 'action 参数必须为 on_shelf 或 off_shelf',
      });
    }

    const agentId = params.id;

    // 步骤 3: 获取智能体信息
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*, profiles(email)')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        details: '智能体不存在',
      });
    }

    // 步骤 4: 更新上下架状态
    const newShelfStatus = action === 'on_shelf' ? 'on_shelf' : 'off_shelf';

    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        shelf_status: newShelfStatus,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', agentId)
      .select()
      .single();

    if (updateError) {
      return handleSupabaseError(updateError, { path, requestId });
    }

    // 步骤 5: 记录审计日志
    const auditLogData = {
      agent_id: agentId,
      action: action === 'on_shelf' ? 'SHELF_ON' : 'SHELF_OFF',
      actor_id: user.id,
      actor_email: user.email,
      actor_role: userRole,
      details: {
        previous_status: agent.shelf_status,
        new_status: newShelfStatus,
        reason: reason || null,
      },
      created_at: new Date().toISOString(),
    };

    const { error: auditError } = await supabase
      .from('agent_audit_logs')
      .insert(auditLogData);

    if (auditError) {
      console.error('记录审计日志失败:', auditError);
      // 审计日志记录失败不影响主操作，继续执行
    }

    // 步骤 6: 如果是下架操作，发送邮件通知开发者
    if (action === 'off_shelf' && agent.profiles?.email) {
      try {
        // 异步发送通知，不阻塞响应
        sendShelfNotification(
          agent.profiles.email,
          agent.name,
          action,
          reason
        ).catch(err => {
          console.error('发送下架通知失败:', err);
        });
      } catch (error) {
        console.error('触发邮件通知失败:', error);
        // 邮件发送失败不影响主操作
      }
    }

    // 步骤 7: 返回成功响应
    return createSuccessResponse(
      {
        agent: updatedAgent,
        action,
        previousStatus: agent.shelf_status,
        newStatus: newShelfStatus,
      },
      {
        message: action === 'on_shelf' ? '智能体已上架' : '智能体已下架',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('上下架操作失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * 发送上下架通知邮件
 *
 * @param toEmail 收件人邮箱
 * @param agentName 智能体名称
 * @param action 操作类型 (on_shelf | off_shelf)
 * @param reason 原因（下架时填写）
 */
async function sendShelfNotification(
  toEmail: string,
  agentName: string,
  action: string,
  reason?: string
): Promise<void> {
  // TODO: 集成邮件发送服务
  // 这里预留邮件发送逻辑，后续可集成现有的邮件服务

  const subject =
    action === 'on_shelf'
      ? `您的智能体「${agentName}」已上架`
      : `您的智能体「${agentName}」已被下架`;

  const message =
    action === 'on_shelf'
      ? `恭喜！您的智能体「${agentName}」已通过审核并上架到市场。`
      : `很遗憾地通知您，您的智能体「${agentName}」因以下原因被下架：\n\n${reason || '未提供具体原因'}\n\n请联系平台管理员了解详细信息。`;

  console.log(`[邮件通知] 发送给：${toEmail}`);
  console.log(`[邮件主题] ${subject}`);
  console.log(`[邮件内容] ${message}`);

  // 实际实现时调用邮件服务：
  // await emailService.send({
  //   to: toEmail,
  //   subject,
  //   body: message,
  // });
}
