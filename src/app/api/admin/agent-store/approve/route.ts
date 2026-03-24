/**
 * 智能体商店管理 API - 审核商品
 * POST /api/admin/agent-store/approve
 */

import { getAuthUser } from '@/lib/auth/utils';
import { approveAgentWithTransaction } from '@/lib/db/transaction';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (
      !user ||
      !user.role ||
      !['admin', 'marketplace_admin', 'content_reviewer'].includes(user.role)
    ) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { agentId, action, reason } = body; // eslint-disable-line @typescript-eslint/no-unused-vars

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

    // 使用事务处理审核流程（不需要 supabase 客户端，因为 approveAgentWithTransaction 内部会创建）
    const result = await approveAgentWithTransaction(
      agentId,
      user.id,
      action === 'approve' ? reason : `驳回：${reason || '不符合要求'}`
    );

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        message: action === 'approve' ? '审核通过成功' : '审核驳回成功',
        data: {
          agentId,
          newStatus: result.data.status,
        },
      });
    } else {
      console.error('审核事务失败:', result.error);
      return NextResponse.json(
        { success: false, error: result.error?.message || '审核失败' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('智能体审核 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
