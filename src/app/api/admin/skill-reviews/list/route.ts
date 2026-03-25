import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 Skill ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 尝试调用数据库函数
    let { data: reviews, error } = await supabase.rpc(
      'get_skill_reviews_list',
      {
        p_skill_id: skillId,
        p_limit: limit,
        p_offset: offset,
      }
    );

    // 如果函数不存在，使用基础查询
    if (error && error.code === '42883') {
      console.warn('get_skill_reviews_list 函数不存在，使用基础查询');

      const { data } = await supabase
        .from('skill_reviews')
        .select(
          `
          *,
          admin_users:user_id (
            email
          )
        `
        )
        .eq('skill_id', skillId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      reviews =
        data?.map((r: any) => ({
          ...r,
          user_email: r.admin_users?.[0]?.email || '匿名用户',
          user_avatar: null,
          replies_count: 0,
        })) || [];
    }

    // 获取总数
    const { count } = await supabase
      .from('skill_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('skill_id', skillId)
      .eq('is_approved', true);

    // 获取平均评分
    const { data: ratingData } = await supabase
      .rpc('get_skill_average_rating', {
        p_skill_id: skillId,
      })
      .catch(() => ({ data: null }));

    return NextResponse.json({
      success: true,
      data: reviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      rating: ratingData?.[0] || {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {},
      },
    });
  } catch (error: any) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
