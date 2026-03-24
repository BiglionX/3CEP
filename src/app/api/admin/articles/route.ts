import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 验证管理员权限
    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 构建查询
    let query = supabase
      .from('articles')
      .select(
        `
        id,
        title,
        summary,
        status,
        view_count,
        like_count,
        comment_count,
        created_at,
        updated_at,
        authors (name),
        article_categories (name)
      `
      )
      .range((page - 1) * pageSize, page * pageSize - 1);

    // 添加搜索条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // 添加状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 添加排序
    query = query.order(sortBy, { ascending: false });

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
      { error: `服务器内部错误：${(error as Error).message}` },
      { status: 500 }
    );
  }

    },
    'content_read'
  );
