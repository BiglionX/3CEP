import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/portals/approve
 * 审批门户申请
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
    const { portalId, action, reason, conditions } = body;

    if (!portalId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { success: false, error: '拒绝时必须填写原因' },
        { status: 400 }
      );
    }

    // 4. 获取门户信息
    const { data: portal, error: portalError } = await supabase
      .from('user_portals')
      .select('*')
      .eq('id', portalId)
      .single();

    if (portalError || !portal) {
      return NextResponse.json(
        { success: false, error: '门户不存在' },
        { status: 404 }
      );
    }

    // 5. 执行审批操作
    const updateData: any = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      is_published: action === 'approve',
    };

    if (action === 'reject') {
      updateData.rejection_reason = reason;
    }

    if (conditions && Array.isArray(conditions)) {
      updateData.metadata = {
        ...(portal.metadata || {}),
        approval_conditions: conditions,
      };
    }

    const { data: updatedPortal, error: updateError } = await supabase
      .from('user_portals')
      .update(updateData)
      .eq('id', portalId)
      .select()
      .single();

    if (updateError) {
      console.error('更新门户状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: '审批失败' },
        { status: 500 }
      );
    }

    // 6. 记录审批日志
    await supabase.from('portal_approval_logs').insert({
      portal_id: portalId,
      reviewer_id: user.id,
      action: action,
      reason: reason || null,
      conditions: conditions || null,
      created_at: new Date().toISOString(),
    });

    // 7. 触发 n8n 通知工作流（异步）
    try {
      await fetch(`${process.env.NEXT_PUBLIC_N8N_URL}/webhook/portal-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalId,
          userId: portal.user_id,
          userName: portal.portal_name,
          action,
          reason,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (n8nError) {
      console.error('触发 n8n 工作流失败:', n8nError);
      // n8n 失败不影响主流程
    }

    return NextResponse.json({
      success: true,
      data: {
        portal: updatedPortal,
        action,
      },
      message: action === 'approve' ? '已通过审批' : '已拒绝审批',
    });
  } catch (error) {
    console.error('门户审批 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/portals/pending
 * 获取待审批门户列表
 */
export async function GET(req: NextRequest) {
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

    // 3. 获取查询参数
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 4. 获取待审批门户列表
    const { data: portals, error } = await supabase
      .from('user_portals')
      .select(`
        *,
        user_profile:user_profiles!inner (
          full_name,
          avatar_url
        )
      `)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取待审批门户失败:', error);
      return NextResponse.json(
        { success: false, error: '获取数据失败' },
        { status: 500 }
      );
    }

    // 5. 获取统计信息
    const { count } = await supabase
      .from('user_portals')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending');

    return NextResponse.json({
      success: true,
      data: {
        portals: portals || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      },
    });
  } catch (error) {
    console.error('获取待审批门户 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统错误',
      },
      { status: 500 }
    );
  }
}
