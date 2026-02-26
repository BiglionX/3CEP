import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 收藏/取消收藏接口
export async function POST(request: Request) {
  try {
    // 获取认证信息
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '未授权访问',
          data: null,
        },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { target_id, target_type } = body;

    // 验证参数
    if (!target_id || !target_type) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缺少必要参数',
          data: null,
        },
        { status: 400 }
      );
    }

    if (!['article', 'part', 'shop'].includes(target_type)) {
      return NextResponse.json(
        {
          code: 40001,
          message: '不支持的目标类型',
          data: null,
        },
        { status: 400 }
      );
    }

    // 模拟用户ID - 实际应该从JWT中解析
    const userId = 'user_123';

    // 检查是否已经收藏
    const { data: existingFavorite, error: checkError } = await supabase
      .from('user_favorites')
      .select('id, is_favorite')
      .eq('user_id', userId)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single();

    let isFavorite = false;

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116表示未找到记录
      console.error('检查收藏状态失败:', checkError);
      return NextResponse.json(
        {
          code: 50001,
          message: '查询失败',
          data: null,
        },
        { status: 500 }
      );
    }

    if (existingFavorite) {
      // 已有收藏记录，执行取消收藏或重新收藏
      isFavorite = !existingFavorite.is_favorite;

      const { error: updateError } = await supabase
        .from('user_favorites')
        .update({
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', existingFavorite.id);

      if (updateError) {
        console.error('更新收藏状态失败:', updateError);
        return NextResponse.json(
          {
            code: 50001,
            message: '操作失败',
            data: null,
          },
          { status: 500 }
        );
      }
    } else {
      // 首次收藏
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
        console.error('创建收藏记录失败:', insertError);
        return NextResponse.json(
          {
            code: 50001,
            message: '操作失败',
            data: null,
          },
          { status: 500 }
        );
      }
    }

    // 更新统计信息
    await updateFavoriteStats(target_id, target_type, isFavorite);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        is_favorite: isFavorite,
        action: isFavorite ? '收藏成功' : '取消收藏成功',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('收藏API错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取用户收藏列表
export async function GET(request: Request) {
  try {
    // 获取认证信息
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '未授权访问',
          data: null,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    // 模拟用户ID - 实际应该从JWT中解析
    const userId = 'user_123';

    // 构建查询
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

    // 按类型筛选
    if (targetType !== 'all') {
      query = query.eq('target_type', targetType);
    }

    // 分页
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data: favorites, error, count } = await query;

    if (error) {
      console.error('获取收藏列表失败:', error);
      return NextResponse.json(
        {
          code: 50001,
          message: '获取数据失败',
          data: null,
        },
        { status: 500 }
      );
    }

    // 获取详细信息
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
          console.warn(`获取${fav.target_type}详情失败:`, error);
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
    console.error('获取收藏列表API错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 更新收藏统计
async function updateFavoriteStats(
  targetId: string,
  targetType: string,
  isAdding: boolean
) {
  try {
    const targetTable = getTargetTable(targetType);
    const statField = 'favorite_count';

    // 获取当前统计数
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
    console.warn('更新收藏统计失败:', error);
  }
}

// 获取目标表名
function getTargetTable(targetType: string): string {
  const tableMap: Record<string, string> = {
    article: 'articles',
    part: 'parts',
    shop: 'repair_shops',
  };
  return tableMap[targetType] || targetType;
}
