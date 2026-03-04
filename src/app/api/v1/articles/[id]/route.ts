import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取文章详情 (移动端优化版本)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    // 获取文章基本信息
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        content,
        summary,
        cover_image_url,
        view_count,
        like_count,
        created_at,
        updated_at,
        author_id,
        authors (id, name, avatar_url),
        article_categories (id, name, slug),
        article_devices (
          devices (id, brand, model, category)
        ),
        article_faults (
          fault_types (id, name, category)
        ),
        article_parts (
          parts (id, name, part_number, category, brand)
        )
      `
      )
      .eq('id', articleId)
      .eq('status', 'published')
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        {
          code: 40401,
          message: '文章不存在',
          data: null,
        },
        { status: 404 }
      );
    }

    // 获取关联配件的实时价格
    const partIds = article?.map((ap: any) => ap.parts.id) || [];
    let partPrices: any[] = [];

    if (partIds.length > 0) {
      // 调用配件价格API获取实时价格
      try {
        const priceResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          }/api/v1/parts/prices`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_ids: partIds }),
          }
        );

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          partPrices = priceData.data || [];
        }
      } catch (error) {
        console.warn('获取配件价格失败:', error);
        // 使用默认价格数据
        partPrices = article.article_parts.map((ap: any) => ({
          part_id: ap.parts.id,
          name: ap.parts.name,
          current_price: 0,
          platform: 'unknown',
          url: '',
        }));
      }
    }

    // 获取用户点赞状态 (如果有认证)
    const authHeader = request.headers.get('authorization');
    let isLiked = false;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        // 这里应该验证JWT并获取用户ID
        // 简化实现，实际需要完整的认证逻辑
        isLiked = false; // 待实现真实的点赞状态检查
      } catch (error) {
        console.warn('认证检查失败:', error);
      }
    }

    // 增加阅读量计数 (24小时内同一用户只计一次)
    try {
      await supabase.rpc('increment_article_views', {
        article_id: articleId,
      });
    } catch (error) {
      console.warn('增加阅读量失败:', error);
    }

    // 格式化响应数据
    const responseData = {
      id: article.id,
      title: article.title,
      content: article.content,
      cover_image: article.cover_image_url,
      summary: article.summary,
      author: article.authors
        ? {
            id: article.authors.id,
            name: article.authors.name,
            avatar: article.authors.avatar_url,
          }
        : null,
      devices: (article.article_devices || []).map((ad: any) => ({
        id: ad.devices.id,
        name: `${ad.devices.brand} ${ad.devices.model}`,
      })),
      faults: (article.article_faults || []).map((af: any) => ({
        id: af.fault_types.id,
        name: af.fault_types.name,
      })),
      parts: partPrices.map((price: any) => ({
        id: price.part_id,
        name: price.name,
        current_price: price.current_price,
        platform: price.platform,
        url: price.url,
      })),
      related_shops: [], // 待实现附近店铺推荐
      stats: {
        likes: article.like_count,
        reads: article.view_count,
        adopts: 0, // 待实现采纳统计
      },
      is_liked: isLiked,
      created_at: article.created_at,
    };

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
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
