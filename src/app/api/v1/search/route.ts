import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 全局搜索API (移动端优化版本)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    if (!query.trim()) {
      return NextResponse.json(
        {
          code: 40001,
          message: '搜索关键词不能为空',
          data: null,
        },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;
    const results: any[] = [];

    // 根据搜索类型进行不同的查询
    if (type === 'all' || type === 'article') {
      // 搜索文章
      const { data: articles, error: articleError } = await supabase
        .from('articles')
        .select(
          `
          id,
          title,
          summary,
          cover_image_url,
          like_count,
          view_count,
          created_at,
          authors (name),
          article_categories (name)
        `
        )
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .range(offset, offset + Math.floor(pageSize * 0.6) - 1); // 文章占60%

      if (!articleError && articles) {
        articles.forEach((article: any) => {
          results.push({
            id: article.id,
            type: 'article',
            title: article.title,
            description: article.summary,
            extra: {
              author: article.authors?.name || '匿名作者',
              likes: article.like_count,
              image: article.cover_image_url,
              category: article.article_categories?.name || '其他',
            },
            created_at: article.created_at,
          });
        });
      }
    }

    if (type === 'all' || type === 'part') {
      // 搜索配件
      const { data: parts, error: partError } = await supabase
        .from('parts')
        .select(
          `
          id,
          name,
          part_number,
          brand,
          category,
          description
        `
        )
        .eq('status', 'active')
        .or(
          `name.ilike.%${query}%,part_number.ilike.%${query}%,description.ilike.%${query}%`
        )
        .range(offset, offset + Math.floor(pageSize * 0.3) - 1); // 配件占30%

      if (!partError && parts) {
        // 获取配件实时价格
        const partIds = parts.map((part: any) => part.id);
        let partPrices: any = {};

        if (partIds.length > 0) {
          try {
            const priceResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
              }/api/v1/parts/prices`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ part_ids: partIds.slice(0, 10) }), // 限制请求数量
              }
            );

            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              partPrices =
                priceData.data?.reduce((acc: any, price: any) => {
                  acc[price.part_id] = price;
                  return acc;
                }, {}) || {};
            }
          } catch (error) {
            console.warn('获取配件价格失败:', error);
          }
        }

        parts.forEach((part: any) => {
          const priceInfo = partPrices[part.id] || {
            current_price: 0,
            platform: '未知',
          };
          results.push({
            id: part.id,
            type: 'part',
            title: `${part.brand} ${part.name}`,
            description: part.description || `适用于${part.category}类设备`,
            extra: {
              current_price: priceInfo.current_price,
              platform: priceInfo.platform,
              url: priceInfo.url || '',
              part_number: part.part_number,
            },
          });
        });
      }
    }

    if (type === 'all' || type === 'shop') {
      // 搜索店铺
      const { data: shops, error: shopError } = await supabase
        .from('repair_shops')
        .select(
          `
          id,
          name,
          address,
          phone,
          rating,
          review_count,
          city,
          cover_image_url
        `
        )
        .eq('status', 'approved')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .range(offset, offset + Math.floor(pageSize * 0.1) - 1); // 店铺占10%

      if (!shopError && shops) {
        shops.forEach((shop: any) => {
          results.push({
            id: shop.id,
            type: 'shop',
            title: shop.name,
            description: `${shop.address} | 评分: ${shop.rating} (${shop.review_count}条评论)`,
            extra: {
              distance: 0, // 需要地理位置信息
              address: shop.address,
              phone: shop.phone,
              rating: shop.rating,
              review_count: shop.review_count,
              image: shop.cover_image_url,
              city: shop.city,
            },
          });
        });
      }
    }

    // 搜索热点链接 (仅在'all'类型时显示)
    if (type === 'all') {
      const { data: hotLinks, error: hotLinkError } = await supabase
        .from('hot_link_pool')
        .select(
          `
          id,
          title,
          url,
          source,
          like_count,
          created_at
        `
        )
        .eq('status', 'active')
        .ilike('title', `%${query}%`)
        .range(offset, offset + Math.floor(pageSize * 0.3) - 1); // 热点链接占30%

      if (!hotLinkError && hotLinks) {
        hotLinks.forEach((link: any) => {
          results.push({
            id: link.id,
            type: 'hot_link',
            title: link.title,
            description: `来源: ${link.source}`,
            extra: {
              source: link.source,
              like_count: link.like_count,
              url: link.url,
            },
            created_at: link.created_at,
          });
        });
      }
    }

    // 按创建时间排序（最新的在前面）
    results.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    // 计算总数（简化处理）
    const total = results.length;

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        total,
        list: results.slice(0, pageSize), // 确保不超过pageSize
        page,
        page_size: pageSize,
        query_type: type,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('全局搜索API错误:', error);
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
