/**
 * Skill 商店管理 API - 切换上下架状态
 * POST /api/admin/skill-store/toggle-status
 */

import { getAuthUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (!user || !['admin', 'marketplace_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { skillId, shelfStatus, reason } = body;

    if (!skillId || !shelfStatus) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['on_shelf', 'off_shelf', 'suspended'].includes(shelfStatus)) {
      return NextResponse.json(
        { success: false, error: '无效的上下架状态' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 检查 Skill 是否存在
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

    // 只有已审核通过的 Skill 才能上架
    if (shelfStatus === 'on_shelf' && skill.review_status !== 'approved') {
      return NextResponse.json(
        { success: false, error: '只能上架已审核通过的 Skill' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updateData: any = {
      shelf_status: shelfStatus,
    };

    // 设置时间戳
    if (shelfStatus === 'on_shelf') {
      updateData.on_shelf_at = now;
      updateData.off_shelf_at = null;
    } else if (shelfStatus === 'off_shelf') {
      updateData.off_shelf_at = now;
    }

    // 更新状态
    const { error: updateError } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', skillId);

    if (updateError) {
      console.error('更新上下架状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 记录审核日志
    await supabase.from('skill_audit_logs').insert({
      skill_id: skillId,
      action_type: shelfStatus === 'suspended' ? 'suspend' : 'restore',
      action_by: user.id,
      action_reason: reason || null,
      previous_status: skill.shelf_status,
      new_status: shelfStatus,
    });

    return NextResponse.json({
      success: true,
      message: '状态更新成功',
      data: {
        skillId,
        shelfStatus,
      },
    });
  } catch (error: any) {
    console.error('切换上下架状态 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
