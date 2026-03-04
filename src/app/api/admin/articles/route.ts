import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 楠岃瘉绠＄悊鍛樻潈?    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 鏋勫缓鏌ヨ
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

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // 娣诲姞鐘舵€佺瓫?    if (status) {
      query = query.eq('status', status);
    }

    // 娣诲姞鎺掑簭
    query = query.order(sortBy, { ascending: false });

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('鑾峰彇鏂囩珷鍒楄〃澶辫触:', error);
      return NextResponse.json(
        { error: '鑾峰彇鏂囩珷鍒楄〃澶辫触', details: error.message },
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
    console.error('鑾峰彇鏂囩珷鍒楄〃寮傚父:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?, details: (error as Error).message },
      { status: 500 }
    );
  }
}

