import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/links/priority:
 *   get:
 *     summary: 鑾峰彇炬帴樺厛绾у垪 *     description: 杩斿洖鎵€鏈夐摼鎺ョ殑樺厛绾т俊鎭紝鏀寔绛涢€夊拰鎺掑簭
 *     parameters:
 *       - name: status
 *         in: query
 *         description: 炬帴鐘舵€佺瓫 *         schema:
 *           type: string
 *           enum: [active, inactive, pending_review, rejected]
 *       - name: category
 *         in: query
 *         description: 鍒嗙被绛 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: 鎺掑簭瀛楁
 *         schema:
 *           type: string
 *           enum: [priority, created_at, views, likes]
 *           default: priority
 *       - name: sortOrder
 *         in: query
 *         description: 鎺掑簭鏂瑰悜
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: 鎴愬姛杩斿洖樺厛绾у垪 *       401:
 *         description: 鏈巿鏉冭 */
export async function GET(request: NextRequest) {
  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'priority';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 鏋勫缓鏌ヨ
    let query = supabase.from('unified_link_library').select(`
        id,
        url,
        title,
        source,
        category,
        sub_category,
        priority,
        views,
        likes,
        share_count,
        status,
        review_status,
        ai_quality_score,
        created_at,
        updated_at
      `);

    // 娣诲姞绛涢€夋潯    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // 娣诲姞鎺掑簭
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data, error } = await query;

    if (error) {
      console.error('鑾峰彇樺厛绾у垪琛ㄥけ', error);
      return NextResponse.json({ error: '鑾峰彇鏁版嵁澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      links: data || [],
      total: (data as any).(data as any).length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('樺厛绾PI閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/links/priority:
 *   put:
 *     summary: 鎵归噺鏇存柊炬帴樺厛 *     description: 鎵归噺鏇存柊澶氫釜炬帴鐨勪紭鍏堢骇 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 炬帴ID
 *                     priority:
 *                       type: integer
 *                       description: 鏂扮殑樺厛绾 *     responses:
 *       200:
 *         description: 鏇存柊鎴愬姛
 *       400:
 *         description: 璇眰鍙傛暟閿欒
 *       401:
 *         description: 鏈巿鏉冭 */
export async function PUT(request: NextRequest) {
  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: '犳晥鐨勬洿鏂版暟鎹牸 },
        { status: 400 }
      );
    }

    // 鎵归噺鏇存柊
    const updatePromises = updates.map(async update => {
      const { id, priority } = update;

      if (!id || typeof priority !== 'number') {
        throw new Error('犳晥鐨勬洿鏂伴」');
      }

      return supabase
        .from('unified_link_library')
        .update({
          priority,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id);
    });

    const results = await Promise.all(updatePromises);

    // 妫€鏌ユ槸鍚︽湁閿欒
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('鎵归噺鏇存柊澶辫触:', errors);
      return NextResponse.json(
        {
          error: '閮ㄥ垎鏇存柊澶辫触',
          details: errors.map(e => e.message),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      message: `鎴愬姛鏇存柊 ${updates.length} 鏉￠摼鎺ョ殑樺厛绾,
    });
  } catch (error) {
    console.error('樺厛绾ф洿鏂伴敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/links/priority/auto-adjust:
 *   post:
 *     summary: 鑷姩璋冩暣炬帴樺厛 *     description: 鏍规嵁AI璐ㄩ噺璇勫垎銆佷簰鍔ㄦ暟鎹瓑鍥犵礌鑷姩璋冩暣炬帴樺厛 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               strategy:
 *                 type: string
 *                 description: 璋冩暣绛栫暐
 *                 enum: [quality_based, engagement_based, mixed]
 *                 default: mixed
 *     responses:
 *       200:
 *         description: 鑷姩璋冩暣鎴愬姛
 *       401:
 *         description: 鏈巿鏉冭 */
export async function POST(request: NextRequest) {
  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const { strategy = 'mixed' } = await request.json();

    // 鑾峰彇鎵€鏈夋椿璺冮摼    const { data: links, error: fetchError } = await supabase
      .from('unified_link_library')
      .select('id, priority, ai_quality_score, views, likes, source')
      .eq('status', 'active');

    if (fetchError) {
      console.error('鑾峰彇炬帴鏁版嵁澶辫触:', fetchError);
      return NextResponse.json({ error: '鑾峰彇鏁版嵁澶辫触' }, { status: 500 });
    }

    if (!links || links.length === 0) {
      return NextResponse.json({
        success: true,
        message: '娌℃湁闇€瑕佽皟鏁寸殑炬帴',
        adjusted: 0,
      });
    }

    // 璁＄畻鏂扮殑樺厛    const updates = links.map(link => {
      let newPriority = link.priority || 0;

      switch (strategy) {
        case 'quality_based':
          // 鍩轰簬AI璐ㄩ噺璇勫垎璋冩暣
          if (link.ai_quality_score) {
            newPriority = Math.round(link.ai_quality_score * 100);
          }
          break;

        case 'engagement_based':
          // 鍩轰簬浜掑姩鏁版嵁璋冩暣
          const engagementScore = Math.min(
            (link.views || 0) / 100 + (link.likes || 0) / 10,
            100
          );
          newPriority = Math.round(engagementScore);
          break;

        case 'mixed':
        default:
          // 娣峰悎绛栫暐
          let qualityComponent = 0;
          let engagementComponent = 0;
          let sourceBonus = 0;

          // AI璐ㄩ噺璇勫垎缁勪欢 (40%鏉冮噸)
          if (link.ai_quality_score) {
            qualityComponent = link.ai_quality_score * 40;
          }

          // 浜掑姩鏁版嵁缁勪欢 (30%鏉冮噸)
          engagementComponent = Math.min(
            ((link.views || 0) / 100 + (link.likes || 0) / 10) * 0.3,
            30
          );

          // 鏉ユ簮鍔犲垎 (30%鏉冮噸)
          if (link.source === 'iFixit') sourceBonus = 30;
          else if (link.source === '瀹樻柟') sourceBonus = 25;
          else if (link.includes('鐭ヤ箮')) sourceBonus = 20;
          else if (link.includes('bilibili')) sourceBonus = 15;

          newPriority = Math.round(
            qualityComponent + engagementComponent + sourceBonus
          );
          break;
      }

      // 纭繚樺厛绾у湪鍚堢悊鑼冨洿      newPriority = Math.max(0, Math.min(100, newPriority));

      return {
        id: link.id,
        priority: newPriority,
      };
    });

    // 鎵归噺鏇存柊樺厛    const updatePromises = updates.map(update =>
      supabase
        .from('unified_link_library')
        .update({
          priority: update.priority,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', update.id)
    );

    const updateResults = await Promise.all(updatePromises);
    const successfulUpdates = updateResults.filter(
      result => !result.error
    ).length;

    return NextResponse.json({
      success: true,
      adjusted: successfulUpdates,
      total: links.length,
      strategy,
      message: `鎴愬姛鑷姩璋冩暣 ${successfulUpdates}/${links.length} 鏉￠摼鎺ョ殑樺厛绾,
    });
  } catch (error) {
    console.error('鑷姩璋冩暣樺厛绾ч敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

