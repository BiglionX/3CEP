import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/portals/batch-approve
 * 批量审批门户申请
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证管理员身份
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 2. 检查是否为管理员
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 3. 解析请求体
    const body = await req.json();
    const { portalIds, action, reason } = body;

    if (!Array.isArray(portalIds) || portalIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择要审批的门户' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '操作类型错误' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { success: false, error: '拒绝时必须填写原因' },
        { status: 400 }
      );
    }

    // 4. 批量更新门户状态
    const updateData: any = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      is_published: action === 'approve',
    };

    if (action === 'reject') {
      updateData.rejection_reason = reason;
    }

    const { data: updatedPortals, error: updateError } = await supabase
      .from('user_portals')
      .update(updateData)
      .in('id', portalIds)
      .select();

    if (updateError) {
      console.error('批量审批失败:', updateError);
      return NextResponse.json(
        { success: false, error: '批量审批失败' },
        { status: 500 }
      );
    }

    // 5. 记录审批日志
    const logs = portalIds.map((portalId: string) => ({
      portal_id: portalId,
      reviewer_id: user.id,
      action: action,
      reason: reason || null,
      created_at: new Date().toISOString(),
    }));

    await supabase.from('portal_approval_logs').insert(logs);

    // 6. 触发 n8n 批量通知（可选）
    try {
      await fetch(`${process.env.NEXT_PUBLIC_N8N_URL}/webhook/portal-batch-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalIds,
          action,
          count: portalIds.length,
          reviewerId: user.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (n8nError) {
      console.error('触发 n8n 工作流失败:', n8nError);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedPortals?.length || 0,
        portalIds: updatedPortals?.map((p: any) => p.id),
      },
      message: `成功${action === 'approve' ? '通过' : '拒绝'} ${updatedPortals?.length || 0} 个门户`,
    });
  } catch (error) {
    console.error('批量审批 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统错误',
      },
      { status: 500 }
    );
  }
}
