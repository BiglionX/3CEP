/**
 * Skill 商店管理 API - 审核 Skill
 * POST /api/admin/skill-store/approve
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
    const { skillId, action, reason, metadata } = body;

    if (!skillId || !action) {
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
    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (fetchError || !skill) {
      return NextResponse.json(
        { success: false, error: 'Skill 不存在' },
        { status: 404 }
      );
    }

    const previousStatus = skill.review_status;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 更新 Skill 状态
    const { error: updateError } = await supabase
      .from('skills')
      .update({
        review_status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_comments: reason || null,
        // 如果通过审核，自动上架
        shelf_status: action === 'approve' ? 'on_shelf' : skill.shelf_status,
        on_shelf_at:
          action === 'approve' ? new Date().toISOString() : skill.on_shelf_at,
      })
      .eq('id', skillId);

    if (updateError) {
      console.error('更新 Skill 状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 记录审核日志
    const { error: logError } = await supabase.from('skill_audit_logs').insert({
      skill_id: skillId,
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
        skillId,
        previousStatus,
        newStatus,
      },
    });
  } catch (error: any) {
    console.error('Skill 审核 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
