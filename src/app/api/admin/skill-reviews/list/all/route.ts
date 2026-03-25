import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取所有评论 (包括未审核的)
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取评论失败:', error);
      throw error;
    }

    const formattedReviews = reviews.map((r: any) => ({
      ...r,
      user_email: r.admin_users?.[0]?.email || '匿名用户',
    }));

    // 获取总数
    const { count } = await supabase
      .from('skill_reviews')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
