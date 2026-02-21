import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/affiliate/analytics/clicks - 获取点击统计
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateLinkId = searchParams.get('affiliateLinkId');
    const partId = searchParams.get('partId');
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    // 构建基础查询
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

    // 添加过滤条件
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
      console.error('获取点击数据失败:', error);
      return NextResponse.json(
        { error: '获取点击数据失败' },
        { status: 500 }
      );
    }

    // 计算统计数据
    const stats = calculateClickStats(clicks || [], groupBy);

    return NextResponse.json({
      success: true,
      data: {
        totalClicks: clicks?.length || 0,
        stats,
        recentClicks: clicks?.slice(0, 50) || [] // 返回最近50条记录
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 计算点击统计数据
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
    // 按平台统计
    const platform = click.part_affiliate_links?.platform || 'unknown';
    stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;

    // 按配件统计
    const partName = click.part_affiliate_links?.part_name || 'unknown';
    stats.byPart[partName] = (stats.byPart[partName] || 0) + 1;

    // 按来源统计
    const source = click.utm_source || 'direct';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;

    // 统计唯一访客
    if (click.ip_address) {
      stats.totalUniqueVisitors.add(click.ip_address);
    }

    // 按时间分组
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
    
    // 时间分组内的平台分布
    stats.byTime[timeKey].platforms[platform] = 
      (stats.byTime[timeKey].platforms[platform] || 0) + 1;
    
    // 时间分组内的来源分布
    stats.byTime[timeKey].sources[source] = 
      (stats.byTime[timeKey].sources[source] || 0) + 1;
  });

  // 计算转化率（如果有收入数据的话）
  // 这里简化处理，实际应该关联收入表计算
  stats.conversionRate = stats.totalUniqueVisitors.size > 0 
    ? ((clicks.length * 0.02) / stats.totalUniqueVisitors.size * 100).toFixed(2)
    : 0;

  stats.totalUniqueVisitors = stats.totalUniqueVisitors.size;

  return stats;
}

// POST /api/affiliate/analytics/clicks - 批量获取多个链接的统计
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { affiliateLinkIds, startDate, endDate } = body;

    if (!affiliateLinkIds || !Array.isArray(affiliateLinkIds)) {
      return NextResponse.json(
        { error: '缺少必要参数: affiliateLinkIds数组' },
        { status: 400 }
      );
    }

    // 批量查询每个链接的统计
    const promises = affiliateLinkIds.map(async (linkId: string) => {
      const { data: clicks, error } = await supabase
        .from('affiliate_click_tracking')
        .select('id, clicked_at')
        .eq('affiliate_link_id', linkId)
        .gte('clicked_at', startDate || '2020-01-01')
        .lte('clicked_at', endDate || new Date().toISOString());

      if (error) {
        console.error(`获取链接${linkId}统计失败:`, error);
        return { affiliateLinkId: linkId, error: error.message, totalClicks: 0 };
      }

      return {
        affiliateLinkId: linkId,
        totalClicks: clicks?.length || 0,
        recentClicks: clicks?.slice(0, 10) || []
      };
    });

    const results = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('批量统计API错误:', error);
    return NextResponse.json(
      { error: '批量统计失败' },
      { status: 500 }
    );
  }
}