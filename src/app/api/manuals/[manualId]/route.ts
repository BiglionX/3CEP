import { NextRequest, NextResponse } from 'next/server';
import { enhancedManualsService } from '@/services/enhanced-manuals.service';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取说明书详情
 * GET /api/manuals/[manualId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { manualId: string } }
) {
  try {
    const manualId = params.manualId;
    
    if (!manualId) {
      return NextResponse.json(
        { success: false, error: '缺少说明书ID参数' },
        { status: 400 }
      );
    }

    const manual = await enhancedManualsService.getManualById(manualId);
    
    if (!manual) {
      return NextResponse.json(
        { success: false, error: '说明书未找到' },
        { status: 404 }
      );
    }

    // 增加查看次数
    await enhancedManualsService.incrementViewCount(manualId);

    return NextResponse.json({
      success: true,
      data: manual
    });

  } catch (error) {
    console.error('获取说明书详情错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '获取说明书详情失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 更新说明书
 * PUT /api/manuals/[manualId]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { manualId: string } }
) {
  try {
    const manualId = params.manualId;
    const body = await request.json();
    
    if (!manualId) {
      return NextResponse.json(
        { success: false, error: '缺少说明书ID参数' },
        { status: 400 }
      );
    }

    // 验证权限（这里简化处理，实际应检查用户身份）
    const manual = await enhancedManualsService.getManualById(manualId);
    if (!manual) {
      return NextResponse.json(
        { success: false, error: '说明书未找到' },
        { status: 404 }
      );
    }

    const updatedManual = await enhancedManualsService.updateManual(manualId, body);

    return NextResponse.json({
      success: true,
      data: updatedManual,
      message: '说明书更新成功'
    });

  } catch (error) {
    console.error('更新说明书错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '更新说明书失败' 
      },
      { status: 400 }
    );
  }
}

/**
 * 删除说明书
 * DELETE /api/manuals/[manualId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { manualId: string } }
) {
  try {
    const manualId = params.manualId;
    
    if (!manualId) {
      return NextResponse.json(
        { success: false, error: '缺少说明书ID参数' },
        { status: 400 }
      );
    }

    // 验证权限（仅管理员可删除）
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    const { data: userProfile } = await supabase
      .from('user_profiles_ext')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile || (userProfile as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无删除权限' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('product_manuals')
      .delete()
      .eq('id', manualId);

    if (error) {
      throw new Error(`删除说明书失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '说明书删除成功'
    });

  } catch (error) {
    console.error('删除说明书错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '删除说明书失败' 
      },
      { status: 500 }
    );
  }
}