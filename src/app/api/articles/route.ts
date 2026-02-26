import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取文章列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询
    let query = supabase
      .from('articles')
      .select(
        `
        id,
        title,
        summary,
        content,
        cover_image_url,
        tags,
        view_count,
        like_count,
        status,
        created_at,
        updated_at,
        author_id,
        category_id
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')
      .range((page - 1) * pageSize, page * pageSize - 1);

    // 添加搜索条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // 添加分类筛选
    // 暂时移除分类筛选，因为缺少关联表
    // if (category) {
    //   query = query.eq('article_categories.slug', category)
    // }

    // 添加排序
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('获取文章列表失败:', error);
      return NextResponse.json(
        { error: '获取文章列表失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: articles || [],
      pagination: {
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('获取文章列表异常:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    );
  }
}
