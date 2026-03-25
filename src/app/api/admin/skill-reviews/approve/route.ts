import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, approved } = body;

    if (!reviewId || typeof approved !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: '参数错误',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取当前用户信息 (验证管理员权限)
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

    // 更新审核状态
    const { data, error } = await supabase
      .from('skill_reviews')
      .update({
        is_approved: approved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('审核评论失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: approved ? '评论已通过' : '评论已驳回',
      data,
    });
  } catch (error: any) {
    console.error('审核评论失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
