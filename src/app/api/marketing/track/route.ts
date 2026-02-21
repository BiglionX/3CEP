import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_type,
      role,
      page_path,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent,
      session_id
    } = body;

    // 参数验证
    if (!event_type) {
      return NextResponse.json(
        { error: '事件类型为必填项' },
        { status: 400 }
      );
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 获取客户端IP地址
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null;

    // 插入事件数据
    const { error } = await supabase
      .from('marketing_events')
      .insert({
        event_type,
        role: role || null,
        page_path: page_path || null,
        source: source || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        user_agent: user_agent || null,
        ip_address: ip,
        session_id: session_id || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('记录事件失败:', error);
      return NextResponse.json(
        { error: '记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '事件记录成功'
    });

  } catch (error) {
    console.error('处理事件记录错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') || '';
    const role = searchParams.get('role') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const groupBy = searchParams.get('groupBy') || 'day';

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 构建基础查询
    let query = supabase
      .from('marketing_events')
      .select('*');

    // 添加过滤条件
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000); // 限制返回数据量

    if (error) {
      console.error('查询事件数据失败:', error);
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    // 计算统计数据
    const stats = calculateEventStats(data || [], groupBy);

    return NextResponse.json({
      success: true,
      data: {
        events: data,
        stats,
        total: data?.length || 0
      }
    });

  } catch (error) {
    console.error('处理事件查询错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

function calculateEventStats(events: any[], groupBy: string) {
  const stats: Record<string, any> = {
    totalEvents: events.length,
    eventTypes: {},
    roles: {},
    sources: {},
    dailyCounts: {}
  };

  events.forEach(event => {
    // 统计事件类型
    stats.eventTypes[event.event_type] = (stats.eventTypes[event.event_type] || 0) + 1;
    
    // 统计角色分布
    if (event.role) {
      stats.roles[event.role] = (stats.roles[event.role] || 0) + 1;
    }
    
    // 统计来源
    if (event.source) {
      stats.sources[event.source] = (stats.sources[event.source] || 0) + 1;
    }
    
    // 按日期统计
    if (event.created_at) {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      stats.dailyCounts[date] = (stats.dailyCounts[date] || 0) + 1;
    }
  });

  return stats;
}