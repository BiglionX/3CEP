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
      session_id,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!event_type) {
      return NextResponse.json({ error: '浜嬩欢绫诲瀷涓哄繀濉」' }, { status: 400 });
    }

    // 鍒涘缓Supabase瀹㈡埛?    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鑾峰彇瀹㈡埛绔疘P鍦板潃
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null;

    // 鎻掑叆浜嬩欢鏁版嵁
    const { error } = await supabase.from('marketing_events').insert({
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
      created_at: new Date().toISOString(),
    } as any);

    if (error) {
      console.error('璁板綍浜嬩欢澶辫触:', error);
      return NextResponse.json({ error: '璁板綍澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '浜嬩欢璁板綍鎴愬姛',
    }) as any;
  } catch (error) {
    console.error('澶勭悊浜嬩欢璁板綍閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
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

    // 鍒涘缓Supabase瀹㈡埛?    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鏋勫缓鍩虹鏌ヨ
    let query = supabase.from('marketing_events').select('*');

    // 娣诲姞杩囨护鏉′欢
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
      .limit(1000); // 闄愬埗杩斿洖鏁版嵁?
    if (error) {
      console.error('鏌ヨ浜嬩欢鏁版嵁澶辫触:', error);
      return NextResponse.json({ error: '鏌ヨ澶辫触' }, { status: 500 });
    }

    // 璁＄畻缁熻鏁版嵁
    const stats = calculateEventStats(data || [], groupBy);

    return NextResponse.json({
      success: true,
      data: {
        events: data,
        stats,
        total: (data as any)?.(data as any)?.length || 0,
      },
    });
  } catch (error) {
    console.error('澶勭悊浜嬩欢鏌ヨ閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

function calculateEventStats(events: any[], groupBy: string) {
  const stats: Record<string, any> = {
    totalEvents: events.length,
    eventTypes: {},
    roles: {},
    sources: {},
    dailyCounts: {},
  };

  events.forEach(event => {
    // 缁熻浜嬩欢绫诲瀷
    stats.eventTypes[event.event_type] =
      (stats.eventTypes[event.event_type] || 0) + 1;

    // 缁熻瑙掕壊鍒嗗竷
    if (event.role) {
      stats.roles[event.role] = (stats.roles[event.role] || 0) + 1;
    }

    // 缁熻鏉ユ簮
    if (event.source) {
      stats.sources[event.source] = (stats.sources[event.source] || 0) + 1;
    }

    // 鎸夋棩鏈熺粺?    if (event.created_at) {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      stats.dailyCounts[date] = (stats.dailyCounts[date] || 0) + 1;
    }
  });

  return stats;
}

