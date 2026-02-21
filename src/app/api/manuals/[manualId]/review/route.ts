import { NextRequest, NextResponse } from 'next/server';
import { enhancedManualsService } from '@/services/enhanced-manuals.service';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 提交审核
 * POST /api/manuals/[manualId]/review/submit
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { manualId: string } }
) {
  try {
    const manualId = params.manualId;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      );
    }

    if (!manualId) {
      return NextResponse.json(
        { success: false, error: '缺少说明书ID参数' },
        { status: 400 }
      );
    }

    const success = await enhancedManualsService.submitForReview(manualId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '提交审核失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '说明书已提交审核'
    });

  } catch (error) {
    console.error('提交审核错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '提交审核失败' 
      },
      { status: 500 }
    );
  }
}