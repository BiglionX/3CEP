import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鑾峰彇鐑偣淇℃伅(绉诲姩绔紭鍖栫増
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    // 璁＄畻鍋忕Щ    const offset = (page - 1) * pageSize;

    // 鑾峰彇鐑偣炬帴鏁版嵁
    let query = supabase
      .from('hot_link_pool')
      .select(
        `
        id,
        title,
        url,
        source,
        category,
        sub_category,
        likes,
        views,
        created_at,
        status,
        article_id
      `
      )
      .eq('status', 'promoted')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // 濡傛灉鎸囧畾浜嗚澶嘔D锛岃繘琛岀瓫    if (deviceId) {
      query = query.contains('device_ids', [deviceId]);
    }

    const { data: hotLinks, error } = await query;

    if (error) {
      console.error('鑾峰彇鐑偣淇℃伅娴佸け', error);
      return NextResponse.json(
        {
          code: 50001,
          message: '鑾峰彇鏁版嵁澶辫触',
          data: null,
        },
        { status: 500 }
      );
    }

    // 澶勭悊鏁版嵁鏍煎紡杞崲
    const formattedData = (hotLinks || []).map((link: any) => ({
      id: link.id,
      type: link.article_id  'article' : 'hot_link',
      title: link.title,
      url: link.article_id  `/articles/${link.article_id}` : link.url,
      source: link.source,
      device_names: link.category  [link.category] : [],
      fault_names: link.sub_category  [link.sub_category] : [],
      like_count: link.likes || 0,
      is_liked: false, // 闇€瑕佹牴鎹敤鎴风櫥褰曠姸鎬佸垽      push_reason: deviceId  `浣犲父淇浉鍏宠澶嘸 : '鐑棬鎺ㄨ崘',
      cover_image: '',
      summary: '',
      view_count: link.views || 0,
      created_at: link.created_at,
    }));

    // 鑾峰彇鎬绘暟
    const { count } = await supabase
      .from('hot_link_pool')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list: formattedData,
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鐑偣淇℃伅娴丄PI閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        data: null,
      },
      { status: 500 }
    );
  }
}

