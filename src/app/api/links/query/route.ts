import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * @swagger
 * /api/links/query:
 *   post:
 *     summary: 鏌ヨ閾炬帴搴撲腑鐨勯摼? *     description: 鏍规嵁鍏抽敭璇嶆煡璇㈤摼鎺ュ簱锛岃繑鍥炴寜浼樺厛绾ф帓搴忕殑缁撴灉
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 鏌ヨ鍏抽敭? *                 example: "iPhone 12 鐢垫睜鏇存崲"
 *               limit:
 *                 type: integer
 *                 description: 杩斿洖缁撴灉鏁伴噺闄愬埗
 *                 default: 3
 *                 example: 5
 *               category:
 *                 type: string
 *                 description: 鎸囧畾鍒嗙被绛? *                 example: "缁翠慨鏁欑▼"
 *     responses:
 *       200:
 *         description: 鎴愬姛杩斿洖閾炬帴鍒楄〃
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         description: 閾炬帴鍦板潃
 *                       title:
 *                         type: string
 *                         description: 閾炬帴鏍囬
 *                       priority:
 *                         type: integer
 *                         description: 浼樺厛? *                       source:
 *                         type: string
 *                         description: 鏉ユ簮
 *       400:
 *         description: 璇锋眰鍙傛暟閿欒
 *       500:
 *         description: 鏈嶅姟鍣ㄥ唴閮ㄩ敊? */

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 3, category } = await req.json();

    // 鍙傛暟楠岃瘉
    if (!query) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鐨勬煡璇㈠弬? query' },
        { status: 400 }
      );
    }

    // 鏋勫缓鏌ヨ鏉′欢
    let dbQuery = supabase
      .from('unified_link_library')
      .select(
        `
        id,
        url,
        title,
        description,
        source,
        category,
        sub_category,
        image_url,
        priority,
        ai_tags,
        ai_quality_score,
        views,
        likes,
        created_at
      `
      )
      .eq('status', 'active')
      .order('priority', { ascending: false });

    // 娣诲姞鍒嗙被绛?    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // 娣诲姞鍏抽敭璇嶆悳绱紙鏀寔鏍囬鍜屾弿杩帮級
    if (query) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // 闄愬埗杩斿洖鏁伴噺
    dbQuery = dbQuery.limit(limit);

    const { data, error } = await dbQuery;

    if (error) {
      console.error('鏌ヨ閾炬帴搴撳け?', error);
      return NextResponse.json(
        { error: '鏌ヨ澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 澶勭悊杩斿洖鏁版嵁
    const links =
      data?.map(item => ({
        id: item.id,
        url: item.url,
        title: item.title,
        description: item.description,
        source: item.source,
        category: item.category,
        sub_category: item.sub_category,
        image_url: item.image_url,
        priority: item.priority,
        ai_tags: item.ai_tags,
        ai_quality_score: item.ai_quality_score,
        views: item.views,
        likes: item.likes,
        created_at: item.created_at,
      })) || [];

    return NextResponse.json({
      links,
      total: links.length,
      query: query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API澶勭悊閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/links/query:
 *   get:
 *     summary: 鑾峰彇閾炬帴搴撶粺璁′俊? *     description: 杩斿洖閾炬帴搴撶殑鍩烘湰缁熻淇℃伅
 *     responses:
 *       200:
 *         description: 鎴愬姛杩斿洖缁熻淇℃伅
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_links:
 *                   type: integer
 *                   description: 鎬婚摼鎺ユ暟
 *                 active_links:
 *                   type: integer
 *                   description: 娲昏穬閾炬帴? *                 high_priority_links:
 *                   type: integer
 *                   description: 楂樹紭鍏堢骇閾炬帴? *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       count:
 *                         type: integer
 */
export async function GET() {
  try {
    // 鑾峰彇缁熻淇℃伅
    const { data: allLinks, error: allError } = await supabase
      .from('unified_link_library')
      .select('status, priority, category');

    if (allError) {
      console.error('鑾峰彇缁熻淇℃伅澶辫触:', allError);
      return NextResponse.json({ error: '鑾峰彇缁熻淇℃伅澶辫触' }, { status: 500 });
    }

    // 璁＄畻缁熻鏁版嵁
    const totalLinks = allLinks?.length || 0;
    const activeLinks =
      allLinks?.filter(link => link.status === 'active').length || 0;
    const highPriorityLinks =
      allLinks?.filter(link => link.priority > 50).length || 0;

    // 鍒嗙被缁熻
    const categoryStats: Record<string, number> = {};
    allLinks?.forEach(link => {
      const cat = link.category || '鏈垎?;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json({
      total_links: totalLinks,
      active_links: activeLinks,
      high_priority_links: highPriorityLinks,
      categories: categories.sort((a, b) => b.count - a.count),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('缁熻API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

