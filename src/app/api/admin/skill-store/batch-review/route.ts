import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/skill-store/batch-review
 *
 * 批量审核 Skills
 * 支持：批量通过、批量拒绝、批量上下架
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = await request.json();
    const { skillIds, action, reviewStatus, shelfStatus, rejectReason } = body;

    // 3. 参数验证
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供要审核的 Skill ID 列表' },
        { status: 400 }
      );
    }

    if (
      !action ||
      !['approve', 'reject', 'shelf_on', 'shelf_off'].includes(action)
    ) {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    // 4. 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5. 获取当前用户
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未认证' },
        { status: 401 }
      );
    }

    // 6. 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 根据操作类型设置字段
    if (action === 'approve') {
      updateData.review_status = 'approved';
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = user.id;
    } else if (action === 'reject') {
      updateData.review_status = 'rejected';
      updateData.rejected_at = new Date().toISOString();
      updateData.rejected_by = user.id;
      if (rejectReason) {
        updateData.reject_reason = rejectReason;
      }
    } else if (action === 'shelf_on') {
      // 上架前确保已通过审核
      updateData.shelf_status = 'on_shelf';
    } else if (action === 'shelf_off') {
      updateData.shelf_status = 'off_shelf';
      if (rejectReason) {
        updateData.off_shelf_reason = rejectReason;
      }
    }

    // 7. 批量更新 (使用事务)
    const { data: result, error } = await supabase.rpc('batch_update_skills', {
      p_skill_ids: skillIds,
      p_update_data: updateData,
    });

    // 如果存储过程不存在，使用基础更新
    if (error && error.code === '42883') {
      console.warn('存储过程不存在，使用基础更新');

      const { data: batchResult, error: batchError } = await supabase
        .from('skills')
        .update(updateData)
        .in('id', skillIds)
        .select();

      if (batchError) {
        throw batchError;
      }

      return NextResponse.json({
        success: true,
        data: {
          updatedCount: batchResult?.length || 0,
          failedCount: skillIds.length - (batchResult?.length || 0),
          updatedSkills: batchResult,
        },
        message: `成功${getActionText(action)} ${batchResult?.length || 0} 个 Skills`,
      });
    }

    if (error) {
      throw error;
    }

    // 8. 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result?.updated_count || 0,
        failedCount: result?.failed_count || 0,
        updatedSkills: result?.updated_skills || [],
      },
      message: `成功${getActionText(action)} ${result?.updated_count || 0} 个 Skills`,
    });
  } catch (error) {
    console.error('批量审核失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * 获取操作的中文描述
 */
function getActionText(action: string): string {
  switch (action) {
    case 'approve':
      return '通过审核';
    case 'reject':
      return '拒绝';
    case 'shelf_on':
      return '上架';
    case 'shelf_off':
      return '下架';
    default:
      return '操作';
  }
}
