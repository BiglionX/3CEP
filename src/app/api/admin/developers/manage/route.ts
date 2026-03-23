/**
 * 开发者管理 API - 开发者管理
 * POST /api/admin/developers/manage
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
    const { developerId, action, role, reason, metadata } = body;

    if (!developerId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 支持的操作类型
    const validActions = ['update_role', 'suspend', 'restore', 'ban', 'unban'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 检查开发者是否存在
    const { data: developer, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', developerId)
      .single();

    if (fetchError || !developer) {
      return NextResponse.json(
        { success: false, error: '开发者不存在' },
        { status: 404 }
      );
    }

    // 确保目标是开发者角色
    if (
      !['developer', 'enterprise_developer'].includes(developer.role) &&
      action !== 'ban'
    ) {
      return NextResponse.json(
        { success: false, error: '只能管理开发者角色的用户' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    let logAction = action;

    // 根据操作类型构建更新数据
    switch (action) {
      case 'update_role':
        if (!role || !['developer', 'enterprise_developer'].includes(role)) {
          return NextResponse.json(
            { success: false, error: '无效的角色类型' },
            { status: 400 }
          );
        }
        updateData.role = role;
        logAction = 'change_role';
        break;

      case 'suspend':
        updateData.is_suspended = true;
        updateData.suspended_at = new Date().toISOString();
        updateData.suspended_by = user.id;
        updateData.suspension_reason = reason || null;
        break;

      case 'restore':
        updateData.is_suspended = false;
        updateData.suspended_at = null;
        updateData.suspended_by = null;
        updateData.suspension_reason = null;
        break;

      case 'ban':
        updateData.is_banned = true;
        updateData.banned_at = new Date().toISOString();
        updateData.banned_by = user.id;
        updateData.ban_reason = reason || null;
        break;

      case 'unban':
        updateData.is_banned = false;
        updateData.banned_at = null;
        updateData.banned_by = null;
        updateData.ban_reason = null;
        break;
    }

    // 更新开发者状态
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', developerId);

    if (updateError) {
      console.error('更新开发者状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 记录操作日志
    await supabase.from('agent_audit_logs').insert({
      agent_id: null, // 不是针对特定智能体
      skill_id: null, // 不是针对特定 Skill
      action_type: logAction,
      action_by: user.id,
      action_reason: reason || null,
      previous_status: developer.role,
      new_status: updateData.role || developer.role,
      metadata: {
        ...metadata,
        targetUserId: developerId,
        targetUserEmail: developer.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: '操作成功',
      data: {
        developerId,
        action,
        updates: updateData,
      },
    });
  } catch (error: any) {
    console.error('开发者管理 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
