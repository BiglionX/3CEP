import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/affiliate/analytics/clicks - 鑾峰彇鐐瑰嚮缁熻
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateLinkId = searchParams.get('affiliateLinkId');
    const partId = searchParams.get('partId');
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    // 鏋勫缓鍩虹鏌ヨ
    let query = supabase
      .from('affiliate_click_tracking')
      .select(`
        id,
        affiliate_link_id,
        part_id,
        utm_source,
        utm_medium,
        utm_campaign,
        clicked_at,
        part_affiliate_links(part_name, platform)
      `);

    // 娣诲姞杩囨护鏉′欢
    if (affiliateLinkId) {
      query = query.eq('affiliate_link_id', affiliateLinkId);
    }

    if (partId) {
      query = query.eq('part_id', partId);
    }

    if (platform) {
      query = query.eq('part_affiliate_links.platform', platform);
    }

    if (startDate) {
      query = query.gte('clicked_at', startDate);
    }

    if (endDate) {
      query = query.lte('clicked_at', endDate);
    }

    const { data: clicks, error } = await query.order('clicked_at', { ascending: false });

    if (error) {
      console.error('鑾峰彇鐐瑰嚮鏁版嵁澶辫触:', error);
      return NextResponse.json(
        { error: '鑾峰彇鐐瑰嚮鏁版嵁澶辫触' },
        { status: 500 }
      );
    }

    // 璁＄畻缁熻鏁版嵁
    const stats = calculateClickStats(clicks || [], groupBy);

    return NextResponse.json({
      success: true,
      data: {
        totalClicks: clicks.length || 0,
        stats,
        recentClicks: clicks.slice(0, 50) || [] // 杩斿洖鏈€0鏉¤
      }
    });

  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

// 璁＄畻鐐瑰嚮缁熻鏁版嵁
function calculateClickStats(clicks: any[], groupBy: string) {
  const stats: any = {
    byPlatform: {},
    byPart: {},
    bySource: {},
    byTime: {},
    totalUniqueVisitors: new Set(),
    conversionRate: 0
  };

  clicks.forEach(click => {
    // 鎸夊钩鍙扮粺
    const platform = click.platform || 'unknown';
    stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;

    // 鎸夐厤剁粺
    const partName = click.part_name || 'unknown';
    stats.byPart[partName] = (stats.byPart[partName] || 0) + 1;

    // 鎸夋潵婧愮粺
    const source = click.utm_source || 'direct';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;

    // 缁熻鍞竴璁垮
    if (click.ip_address) {
      stats.totalUniqueVisitors.add(click.ip_address);
    }

    // 鎸夋椂闂村垎
    const date = new Date(click.clicked_at);
    let timeKey: string;
    
    switch (groupBy) {
      case 'hour':
        timeKey = date.toISOString().slice(0, 13) + ':00:00';
        break;
      case 'day':
        timeKey = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        timeKey = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        timeKey = date.toISOString().slice(0, 7);
        break;
      default:
        timeKey = date.toISOString().slice(0, 10);
    }

    if (!stats.byTime[timeKey]) {
      stats.byTime[timeKey] = {
        count: 0,
        platforms: {},
        sources: {}
      };
    }
    
    stats.byTime[timeKey].count++;
    
    // 堕棿鍒嗙粍鍐呯殑骞冲彴鍒嗗竷
    stats.byTime[timeKey].platforms[platform] = 
      (stats.byTime[timeKey].platforms[platform] || 0) + 1;
    
    // 堕棿鍒嗙粍鍐呯殑鏉ユ簮鍒嗗竷
    stats.byTime[timeKey].sources[source] = 
      (stats.byTime[timeKey].sources[source] || 0) + 1;
  });

  // 璁＄畻杞寲鐜囷紙濡傛灉鏈夋敹鍏ユ暟鎹殑璇濓級
  // 杩欓噷绠€鍖栧鐞嗭紝瀹為檯搴旇鍏宠仈鏀跺叆琛ㄨ
  stats.conversionRate = stats.totalUniqueVisitors.size > 0 
     ((clicks.length * 0.02) / stats.totalUniqueVisitors.size * 100).toFixed(2)
    : 0;

  stats.totalUniqueVisitors = stats.totalUniqueVisitors.size;

  return stats;
}

// POST /api/affiliate/analytics/clicks - 鎵归噺鑾峰彇澶氫釜炬帴鐨勭粺
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { affiliateLinkIds, startDate, endDate } = body;

    if (!affiliateLinkIds || !Array.isArray(affiliateLinkIds)) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: affiliateLinkIds鏁扮粍' },
        { status: 400 }
      );
    }

    // 鎵归噺鏌ヨ姣忎釜炬帴鐨勭粺
    const promises = affiliateLinkIds.map(async (linkId: string) => {
      const { data: clicks, error } = await supabase
        .from('affiliate_click_tracking')
        .select('id, clicked_at')
        .eq('affiliate_link_id', linkId)
        .gte('clicked_at', startDate || '2020-01-01')
        .lte('clicked_at', endDate || new Date().toISOString());

      if (error) {
        console.error(`鑾峰彇炬帴${linkId}缁熻澶辫触:`, error);
        return { affiliateLinkId: linkId, error: error.message, totalClicks: 0 };
      }

      return {
        affiliateLinkId: linkId,
        totalClicks: clicks.length || 0,
        recentClicks: clicks.slice(0, 10) || []
      };
    });

    const results = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('鎵归噺缁熻API閿欒:', error);
    return NextResponse.json(
      { error: '鎵归噺缁熻澶辫触' },
      { status: 500 }
    );
  }
}
