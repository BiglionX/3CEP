import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取被举报的评论
    const { data: reviews, error } = await supabase
      .from('skill_reviews')
      .select(
        `
        *,
        admin_users:user_id (
          email
        )
      `
      )
      .eq('is_offensive', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取被举报评论失败:', error);
      throw error;
    }

    const formattedReviews = reviews.map((r: any) => ({
      ...r,
      user_email: r.admin_users?.[0]?.email || '匿名用户',
    }));

    return NextResponse.json({
      success: true,
      data: formattedReviews,
    });
  } catch (error: any) {
    console.error('获取被举报评论失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
