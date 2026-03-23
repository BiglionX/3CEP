/**
 * 智能体商店管理 API - 审核商品
 * POST /api/admin/agent-store/approve
 */

import { getAuthUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (
      !user ||
      !['admin', 'marketplace_admin', 'content_reviewer'].includes(user.role)
    ) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { agentId, action, reason, metadata } = body;

    if (!agentId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 开启事务
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json(
        { success: false, error: '智能体不存在' },
        { status: 404 }
      );
    }

    const previousStatus = agent.review_status;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 更新智能体状态
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        review_status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_comments: reason || null,
        // 如果通过审核，自动上架
        shelf_status: action === 'approve' ? 'on_shelf' : agent.shelf_status,
        on_shelf_at:
          action === 'approve' ? new Date().toISOString() : agent.on_shelf_at,
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('更新智能体状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 记录审核日志
    const { error: logError } = await supabase.from('agent_audit_logs').insert({
      agent_id: agentId,
      action_type: action === 'approve' ? 'approve' : 'reject',
      action_by: user.id,
      action_reason: reason || null,
      previous_status: previousStatus,
      new_status: newStatus,
      metadata: metadata || {},
    });

    if (logError) {
      console.error('记录审核日志失败:', logError);
      // 不返回错误，因为主要操作已成功
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '审核通过成功' : '审核驳回成功',
      data: {
        agentId,
        previousStatus,
        newStatus,
      },
    });
  } catch (error: any) {
    console.error('智能体审核 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
