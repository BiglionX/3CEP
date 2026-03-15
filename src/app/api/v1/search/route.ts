import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鍏ㄥ眬鎼滅储API (绉诲姩绔紭鍖栫増
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
          message: '鎼滅储鍏抽敭璇嶄笉鑳戒负,
          data: null,
        },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;
    const results: any[] = [];

    // 鏍规嵁鎼滅储绫诲瀷杩涜涓嶅悓鐨勬煡    if (type === 'all' || type === 'article') {
      // 鎼滅储鏂囩珷
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
        .range(offset, offset + Math.floor(pageSize * 0.6) - 1); // 鏂囩珷0%

      if (!articleError && articles) {
        articles.forEach((article: any) => {
          results.push({
            id: article.id,
            type: 'article',
            title: article.title,
            description: article.summary,
            extra: {
              author: article.name || '鍖垮悕浣,
              likes: article.like_count,
              image: article.cover_image_url,
              category: article.name || '鍏朵粬',
            },
            created_at: article.created_at,
          });
        });
      }
    }

    if (type === 'all' || type === 'part') {
      // 鎼滅储閰嶄欢
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
        .range(offset, offset + Math.floor(pageSize * 0.3) - 1); // 閰嶄欢0%

      if (!partError && parts) {
        // 鑾峰彇閰嶄欢瀹炴椂牸
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
                body: JSON.stringify({ part_ids: partIds.slice(0, 10) }), // 闄愬埗璇眰鏁伴噺
              }
            );

            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              partPrices =
                priceData.reduce((acc: any, price: any) => {
                  acc[price.part_id] = price;
                  return acc;
                }, {}) || {};
            }
          } catch (error) {
            console.warn('鑾峰彇閰嶄欢牸澶辫触:', error);
          }
        }

        parts.forEach((part: any) => {
          const priceInfo = partPrices[part.id] || {
            current_price: 0,
            platform: '鏈煡',
          };
          results.push({
            id: part.id,
            type: 'part',
            title: `${part.brand} ${part.name}`,
            description: part.description || `傜敤{part.category}绫昏澶嘸,
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
      // 鎼滅储搴楅摵
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
        .range(offset, offset + Math.floor(pageSize * 0.1) - 1); // 搴楅摵0%

      if (!shopError && shops) {
        shops.forEach((shop: any) => {
          results.push({
            id: shop.id,
            type: 'shop',
            title: shop.name,
            description: `${shop.address} | 璇勫垎: ${shop.rating} (${shop.review_count}鏉¤瘎`,
            extra: {
              distance: 0, // 闇€瑕佸湴鐞嗕綅缃俊              address: shop.address,
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

    // 鎼滅储鐑偣炬帴 (呭湪'all'绫诲瀷舵樉
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
        .range(offset, offset + Math.floor(pageSize * 0.3) - 1); // 鐑偣炬帴0%

      if (!hotLinkError && hotLinks) {
        hotLinks.forEach((link: any) => {
          results.push({
            id: link.id,
            type: 'hot_link',
            title: link.title,
            description: `鏉ユ簮: ${link.source}`,
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

    // 鎸夊垱寤烘椂闂存帓搴忥紙鏈€鏂扮殑鍦ㄥ墠闈級
    results.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    // 璁＄畻鎬绘暟锛堢畝鍖栧鐞嗭級
    const total = results.length;

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        total,
        list: results.slice(0, pageSize), // 纭繚涓嶈秴杩噋ageSize
        page,
        page_size: pageSize,
        query_type: type,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鍏ㄥ眬鎼滅储API閿欒:', error);
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

