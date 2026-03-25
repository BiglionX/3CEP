/**
 * Skill 商店管理 API - 批量切换上下架状态
 * POST /api/admin/skill-store/batch-toggle-status
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
    const { skillIds, shelfStatus } = body;

    // 参数验证
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数：skillIds 必须是非空数组',
          code: 'MISSING_PARAMETER',
        },
        { status: 400 }
      );
    }

    if (!shelfStatus || !['on_shelf', 'off_shelf'].includes(shelfStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的状态：${shelfStatus}，只能是 'on_shelf' 或 'off_shelf'`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 批量处理
    for (const skillId of skillIds) {
      try {
        // 检查 Skill 是否存在
        const { data: skill } = await supabase
          .from('skills')
          .select('*')
          .eq('id', skillId)
          .single();

        if (!skill) {
          results.failed++;
          results.errors.push(`Skill ${skillId} 不存在`);
          continue;
        }

        // 只有已审核通过的才能上架
        if (shelfStatus === 'on_shelf' && skill.review_status !== 'approved') {
          results.failed++;
          results.errors.push(`Skill "${skill.name}" 未通过审核，不能上架`);
          continue;
        }

        const updateData: any = {
          shelf_status: shelfStatus,
        };

        if (shelfStatus === 'on_shelf') {
          updateData.on_shelf_at = new Date().toISOString();
          updateData.off_shelf_at = null;
        } else {
          updateData.off_shelf_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('skills')
          .update(updateData)
          .eq('id', skillId);

        if (updateError) {
          results.failed++;
          results.errors.push(`更新 ${skillId} 失败：${updateError.message}`);
        } else {
          results.success++;

          // 记录审核日志
          await supabase.from('skill_audit_logs').insert({
            skill_id: skillId,
            action_type: shelfStatus === 'on_shelf' ? 'restore' : 'suspend',
            action_by: user.id,
            previous_status: skill.shelf_status,
            new_status: shelfStatus,
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`处理 ${skillId} 失败：${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量操作完成：成功 ${results.success} 个，失败 ${results.failed} 个`,
      data: {
        total: skillIds.length,
        successCount: results.success,
        failedCount: results.failed,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('批量切换上下架 API 错误:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

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
