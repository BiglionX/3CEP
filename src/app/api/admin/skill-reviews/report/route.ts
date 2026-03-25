import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, reason } = body;

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少评论 ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取当前用户信息
    const authHeader = request.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '未登录',
        },
        { status: 401 }
      );
    }

    // 标记为被举报
    const { data, error } = await supabase
      .from('skill_reviews')
      .update({
        is_offensive: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('举报评论失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '举报已提交，管理员将尽快处理',
      data,
    });
  } catch (error: any) {
    console.error('举报评论失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
