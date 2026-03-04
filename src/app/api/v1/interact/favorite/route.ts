import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鏀惰棌/鍙栨秷鏀惰棌鎺ュ彛
export async function POST(request: Request) {
  try {
    // 鑾峰彇璁よ瘉淇℃伅
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭?,
          data: null,
        },
        { status: 401 }
      );
    }

    // 鑾峰彇璇锋眰?
    const body = await request.json();
    const { target_id, target_type } = body;

    // 楠岃瘉鍙傛暟
    if (!target_id || !target_type) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缂哄皯蹇呰鍙傛暟',
          data: null,
        },
        { status: 400 }
      );
    }

    if (!['article', 'part', 'shop'].includes(target_type)) {
      return NextResponse.json(
        {
          code: 40001,
          message: '涓嶆敮鎸佺殑鐩爣绫诲瀷',
          data: null,
        },
        { status: 400 }
      );
    }

    // 妯℃嫙鐢ㄦ埛ID - 瀹為檯搴旇浠嶫WT涓В?
    const userId = 'user_123';

    // 妫€鏌ユ槸鍚﹀凡缁忔敹?
    const { data: existingFavorite, error: checkError } = await supabase
      .from('user_favorites')
      .select('id, is_favorite')
      .eq('user_id', userId)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single();

    let isFavorite = false;

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116琛ㄧず鏈壘鍒拌?
      console.error('妫€鏌ユ敹钘忕姸鎬佸け?', checkError);
      return NextResponse.json(
        {
          code: 50001,
          message: '鏌ヨ澶辫触',
          data: null,
        },
        { status: 500 }
      );
    }

    if (existingFavorite) {
      // 宸叉湁鏀惰棌璁板綍锛屾墽琛屽彇娑堟敹钘忔垨閲嶆柊鏀惰棌
      isFavorite = !existingFavorite.is_favorite;

      const { error: updateError } = await supabase
        .from('user_favorites')
        .update({
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', existingFavorite.id);

      if (updateError) {
        console.error('鏇存柊鏀惰棌鐘舵€佸け?', updateError);
        return NextResponse.json(
          {
            code: 50001,
            message: '鎿嶄綔澶辫触',
            data: null,
          },
          { status: 500 }
        );
      }
    } else {
      // 棣栨鏀惰棌
      isFavorite = true;

      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          target_id: target_id,
          target_type: target_type,
          is_favorite: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);

      if (insertError) {
        console.error('鍒涘缓鏀惰棌璁板綍澶辫触:', insertError);
        return NextResponse.json(
          {
            code: 50001,
            message: '鎿嶄綔澶辫触',
            data: null,
          },
          { status: 500 }
        );
      }
    }

    // 鏇存柊缁熻淇℃伅
    await updateFavoriteStats(target_id, target_type, isFavorite);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        is_favorite: isFavorite,
        action: isFavorite ? '鏀惰棌鎴愬姛' : '鍙栨秷鏀惰棌鎴愬姛',
      },
      timestamp: new Date().toISOString(),
    }) as any;
  } catch (error) {
    console.error('鏀惰棌API閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鐢ㄦ埛鏀惰棌鍒楄〃
export async function GET(request: Request) {
  try {
    // 鑾峰彇璁よ瘉淇℃伅
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭?,
          data: null,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    // 妯℃嫙鐢ㄦ埛ID - 瀹為檯搴旇浠嶫WT涓В?
    const userId = 'user_123';

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('user_favorites')
      .select(
        `
        id,
        target_id,
        target_type,
        is_favorite,
        created_at,
        updated_at
      `
      )
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    // 鎸夌被鍨嬬瓫?
    if (targetType !== 'all') {
      query = query.eq('target_type', targetType);
    }

    // 鍒嗛〉
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data: favorites, error, count } = await query;

    if (error) {
      console.error('鑾峰彇鏀惰棌鍒楄〃澶辫触:', error);
      return NextResponse.json(
        {
          code: 50001,
          message: '鑾峰彇鏁版嵁澶辫触',
          data: null,
        },
        { status: 500 }
      );
    }

    // 鑾峰彇璇︾粏淇℃伅
    const detailedFavorites = await Promise.all(
      (favorites || []).map(async (fav: any) => {
        let details = null;

        try {
          switch (fav.target_type) {
            case 'article':
              const { data: article } = await supabase
                .from('articles')
                .select(
                  'title, summary, cover_image_url, like_count, view_count'
                )
                .eq('id', fav.target_id)
                .single();
              details = article;
              break;

            case 'part':
              const { data: part } = await supabase
                .from('parts')
                .select('name, brand, category, description')
                .eq('id', fav.target_id)
                .single();
              details = part;
              break;

            case 'shop':
              const { data: shop } = await supabase
                .from('repair_shops')
                .select('name, address, rating, review_count')
                .eq('id', fav.target_id)
                .single();
              details = shop;
              break;
          }
        } catch (error) {
          console.warn(`鑾峰彇${fav.target_type}璇︽儏澶辫触:`, error);
        }

        return {
          ...fav,
          details,
        };
      })
    );

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list: detailedFavorites,
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇鏀惰棌鍒楄〃API閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鏇存柊鏀惰棌缁熻
async function updateFavoriteStats(
  targetId: string,
  targetType: string,
  isAdding: boolean
) {
  try {
    const targetTable = getTargetTable(targetType);
    const statField = 'favorite_count';

    // 鑾峰彇褰撳墠缁熻?
    const { data: targetData, error: targetError } = await supabase
      .from(targetTable)
      .select(statField)
      .eq('id', targetId)
      .single();

    if (!targetError && targetData) {
      const currentCount = targetData[statField] || 0;
      const newCount = isAdding
        ? currentCount + 1
        : Math.max(0, currentCount - 1);

      await supabase
        .from(targetTable)
        .update({ [statField]: newCount } as any)
        .eq('id', targetId);
    }
  } catch (error) {
    console.warn('鏇存柊鏀惰棌缁熻澶辫触:', error);
  }
}

// 鑾峰彇鐩爣琛ㄥ悕
function getTargetTable(targetType: string): string {
  const tableMap: Record<string, string> = {
    article: 'articles',
    part: 'parts',
    shop: 'repair_shops',
  };
  return tableMap[targetType] || targetType;
}

