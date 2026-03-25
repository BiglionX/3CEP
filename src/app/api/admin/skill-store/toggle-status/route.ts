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
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!user.role || !['admin', 'marketplace_admin'].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: '权限不足：需要管理员或市场管理员角色',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { skillId, shelfStatus, reason } = body;

    // 参数验证
    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数：skillId',
          code: 'MISSING_PARAMETER',
        },
        { status: 400 }
      );
    }

    if (!shelfStatus) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数：shelfStatus',
          code: 'MISSING_PARAMETER',
        },
        { status: 400 }
      );
    }

    if (typeof skillId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '参数类型错误：skillId 必须是字符串',
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    if (typeof shelfStatus !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '参数类型错误：shelfStatus 必须是字符串',
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    if (!['on_shelf', 'off_shelf', 'suspended'].includes(shelfStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的状态：${shelfStatus}，只能是 'on_shelf', 'off_shelf', 'suspended'`,
          code: 'INVALID_STATUS',
        },
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

    if (fetchError) {
      console.error('查询 Skill 失败:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: `查询失败：${fetchError.message}`,
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: `Skill 不存在：${skillId}`,
          code: 'NOT_FOUND',
        },
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
        {
          success: false,
          error: `更新失败：${updateError.message}`,
          code: 'DATABASE_ERROR',
        },
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
    console.error('切换上下架状态 API 错误:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: `验证错误：${error.message}`,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: '数据冲突：记录已存在', code: 'CONFLICT' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `服务器内部错误：${error.message}`,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
