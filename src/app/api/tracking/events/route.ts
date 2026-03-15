// 鍩嬬偣鏁版嵁鎺ユ敹API璺敱

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鍩嬬偣浜嬩欢鏁版嵁缁撴瀯
interface TrackingEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  pageContext: {
    pageName: string;
    pagePath: string;
    referrer: string;
    url: string;
    title: string;
  };
  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    deviceType: string;
    browser: string;
    os: string;
  };
  eventData: Record<string, any>;
  metadata: {
    collectorVersion: string;
    collectedAt: string;
    processingTime: number;
    isValid: boolean;
    validationErrors: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉璇眰鏁版嵁
    if (!body.appId || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { appId, sessionId, events } = body;

    // 鎵归噺鎻掑叆浜嬩欢鏁版嵁
    const trackingEvents = events.map((event: any) => ({
      app_id: appId,
      session_id: sessionId,
      event_id: event.eventId,
      event_type: event.eventType,
      timestamp: event.timestamp,
      user_id: event.userId,
      page_name: event.pageName,
      page_path: event.pagePath,
      referrer: event.referrer,
      url: event.url,
      title: event.title,
      user_agent: event.userAgent,
      screen_width: event.screenWidth,
      screen_height: event.screenHeight,
      device_type: event.deviceType,
      browser: event.browser,
      os: event.os,
      event_data: event.eventData,
      metadata: event.metadata,
      created_at: new Date().toISOString(),
    }));

    // 鎻掑叆鍒版暟鎹簱
    const { data, error } = await supabase
      .from('tracking_events')
      .insert(trackingEvents);

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to store tracking events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${events.length} events`,
      processedEvents: events.length,
      appId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇缁熻鏁版嵁鐨凣ET鎺ュ彛
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 鏋勫缓鏌ヨ鏉′欢
    let query = supabase.from('tracking_events').select('*');

    if (appId) {
      query = query.eq('app_id', appId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve tracking data' },
        { status: 500 }
      );
    }

    // 璁＄畻缁熻淇℃伅
    const stats = {
      totalEvents: (data as any).length || 0,
      eventTypeDistribution: {} as Record<string, number>,
      deviceTypeDistribution: {} as Record<string, number>,
      pageViews: 0,
      uniqueUsers: 0,
      uniqueSessions: 0,
    };

    if (data) {
      const users = new Set<string>();
      const sessions = new Set<string>();

      data.forEach((event: any) => {
        // 浜嬩欢绫诲瀷鍒嗗竷
        stats.eventTypeDistribution[event.event_type] =
          (stats.eventTypeDistribution[event.event_type] || 0) + 1;

        // 璁惧绫诲瀷鍒嗗竷
        stats.deviceTypeDistribution[event.device_type] =
          (stats.deviceTypeDistribution[event.device_type] || 0) + 1;

        // 椤甸潰娴忚缁熻
        if (event.event_type === 'page_view') {
          stats.pageViews++;
        }

        // 鍞竴鐢ㄦ埛鍜屼細璇濈粺        if (event.user_id) users.add(event.user_id);
        if (event.session_id) sessions.add(event.session_id);
      });

      stats.uniqueUsers = users.size;
      stats.uniqueSessions = sessions.size;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Tracking stats API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

