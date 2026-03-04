import { NextRequest, NextResponse } from 'next/server';
import { enhancedManualsService } from '@/services/enhanced-manuals.service';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取说明书评论
 * GET /api/manuals/[manualId]/comments
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

    const { data: comments, error } = await supabase
      .from('manual_comments')
      .select(
        `
        *,
        user:auth_users(email)
      `
      )
      .eq('manual_id', manualId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`获取评论失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('获取评论错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '获取评论失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 添加评论
 * POST /api/manuals/[manualId]/comments
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { manualId: string } }
) {
  try {
    const manualId = params.manualId;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录才能发表评论' },
        { status: 401 }
      );
    }

    if (!manualId) {
      return NextResponse.json(
        { success: false, error: '缺少说明书ID参数' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, rating } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '评论内容不能为空' },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: '评分必须在1-5之间' },
        { status: 400 }
      );
    }

    const comment = await enhancedManualsService.addComment(
      manualId,
      session.user.id,
      content,
      rating
    );

    return NextResponse.json({
      success: true,
      data: comment,
      message: '评论发表成功',
    });
  } catch (error) {
    console.error('发表评论错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '发表评论失败',
      },
      { status: 400 }
    );
  }
}
