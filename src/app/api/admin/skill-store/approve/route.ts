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
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (
      !user?.role ||
      !['admin', 'marketplace_admin', 'content_reviewer'].includes(user.role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '权限不足：需要管理员、市场管理员或内容审核员角色',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { skillId, action, reason, metadata } = body;

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

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数：action',
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

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的操作类型：${action}，只能是 'approve' 或 'reject'`,
          code: 'INVALID_ACTION',
        },
        { status: 400 }
      );
    }

    // 拒绝操作时必须提供原因
    if (action === 'reject' && !reason) {
      return NextResponse.json(
        {
          success: false,
          error: '驳回操作必须提供原因',
          code: 'MISSING_REASON',
        },
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
        {
          success: false,
          error: `更新失败：${updateError.message}`,
          code: 'DATABASE_ERROR',
        },
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
      // 但会添加警告信息
      console.warn('审核日志记录失败，但审核操作已生效');
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
    console.error('Skill 审核 API 错误:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // 区分不同类型的错误
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
      // PostgreSQL unique violation
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
