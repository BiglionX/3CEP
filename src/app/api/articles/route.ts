import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鑾峰彇鏂囩珷鍒楄〃
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 鏋勫缓鏌ヨ
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

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // 娣诲姞鍒嗙被绛?    // 鏆傛椂绉婚櫎鍒嗙被绛涢€夛紝鍥犱负缂哄皯鍏宠仈?    // if (category) {
    //   query = query.eq('article_categories.slug', category)
    // }

    // 娣诲姞鎺掑簭
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

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

