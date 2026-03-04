import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth-service';

// 鐢ㄦ埛琛屼负绫诲瀷鏋氫妇
export type UserBehaviorType =
  | 'page_view' // 椤甸潰璁块棶
  | 'feature_use' // 鍔熻兘浣跨敤
  | 'search_action' // 鎼滅储琛屼负
  | 'click_event' // 鐐瑰嚮浜嬩欢
  | 'form_submit' // 琛ㄥ崟鎻愪氦
  | 'navigation' // 瀵艰埅璺宠浆
  | 'scroll_depth' // 婊氬姩娣卞害
  | 'session_start' // 浼氳瘽寮€?  | 'session_end' // 浼氳瘽缁撴潫
  | 'error_event' // 閿欒浜嬩欢
  | 'export_data' // 鏁版嵁瀵煎嚭
  | 'bulk_operation'; // 鎵归噺鎿嶄綔

// 鐢ㄦ埛琛屼负鏁版嵁鎺ュ彛
export interface UserBehaviorData {
  user_id: string;
  behavior_type: UserBehaviorType;
  page_url?: string;
  feature_name?: string;
  action_detail?: string;
  duration_ms?: number;
  scroll_percentage?: number;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  referrer?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
    screen_size?: string;
  };
}

// 琛屼负缁熻鏌ヨ鍙傛暟
interface BehaviorQueryParams {
  user_id?: string;
  behavior_type?: UserBehaviorType;
  start_date?: string;
  end_date?: string;
  page_url?: string;
  limit?: number;
  offset?: number;
}

// 璁板綍鐢ㄦ埛琛屼负
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const behaviorData: UserBehaviorData = await request.json();

    // 楠岃瘉蹇呭～瀛楁
    if (!behaviorData.user_id || !behaviorData.behavior_type) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鐨勮涓烘暟鎹瓧? },
        { status: 400 }
      );
    }

    // 娣诲姞鏃堕棿鎴筹紙濡傛灉鏈彁渚涳級
    if (!behaviorData.timestamp) {
      behaviorData.timestamp = new Date().toISOString();
    }

    // 鎻掑叆琛屼负鏁版嵁
    const { data, error } = await supabase
      .from('user_behavior_logs')
      .insert([behaviorData])
      .select()
      .single();

    if (error) {
      console.error('璁板綍鐢ㄦ埛琛屼负澶辫触:', error);
      return NextResponse.json(
        { error: '璁板綍琛屼负鏁版嵁澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '琛屼负鏁版嵁璁板綍鎴愬姛',
      data,
    });
  } catch (error) {
    console.error('鐢ㄦ埛琛屼负API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// 鏌ヨ鐢ㄦ埛琛屼负鏁版嵁
export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 楠岃瘉绠＄悊鍛樻潈?    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鐢ㄦ埛鏈櫥? }, { status: 401 });
    }

    const userRole = await AuthService.getUserRole(currentUser.id);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '鍙湁瓒呯骇绠＄悊鍛樺彲浠ヨ闂涓烘暟? },
        { status: 403 }
      );
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const queryParams: BehaviorQueryParams = {
      user_id: searchParams.get('user_id') || undefined,
      behavior_type:
        (searchParams.get('behavior_type') as UserBehaviorType) || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      page_url: searchParams.get('page_url') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('user_behavior_logs')
      .select('*', { count: 'exact' });

    // 娣诲姞杩囨护鏉′欢
    if (queryParams.user_id) {
      query = query.eq('user_id', queryParams.user_id);
    }

    if (queryParams.behavior_type) {
      query = query.eq('behavior_type', queryParams.behavior_type);
    }

    if (queryParams.page_url) {
      query = query.eq('page_url', queryParams.page_url);
    }

    if (queryParams.start_date) {
      query = query.gte('timestamp', queryParams.start_date);
    }

    if (queryParams.end_date) {
      query = query.lte('timestamp', queryParams.end_date);
    }

    // 鎺掑簭鍜屽垎?    const offset = queryParams.offset || 0;
    const limit = queryParams.limit || 50;
    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('鏌ヨ琛屼负鏁版嵁澶辫触:', error);
      return NextResponse.json(
        { error: '鏌ヨ琛屼负鏁版嵁澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        total: count || 0,
        limit: queryParams.limit || 50,
        offset: queryParams.offset || 0,
        has_more:
          (queryParams.offset || 0) + (queryParams.limit || 50) < (count || 0),
      },
    });
  } catch (error) {
    console.error('鐢ㄦ埛琛屼负鏌ヨAPI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// 鎵归噺鍒犻櫎杩囨湡琛屼负鏁版嵁
export async function DELETE(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 楠岃瘉绠＄悊鍛樻潈?    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鐢ㄦ埛鏈櫥? }, { status: 401 });
    }

    const userRole = await AuthService.getUserRole(currentUser.id);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '鍙湁瓒呯骇绠＄悊鍛樺彲浠ュ垹闄よ涓烘暟? },
        { status: 403 }
      );
    }

    // 鑾峰彇杩囨湡澶╂暟鍙傛暟锛堥粯?0澶╋級
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('days_old') || '90');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateString = cutoffDate.toISOString();

    // 鍒犻櫎杩囨湡鏁版嵁
    const { error } = await supabase
      .from('user_behavior_logs')
      .delete()
      .lt('timestamp', cutoffDateString);

    if (error) {
      console.error('鍒犻櫎杩囨湡琛屼负鏁版嵁澶辫触:', error);
      return NextResponse.json(
        { error: '鍒犻櫎杩囨湡鏁版嵁澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `鎴愬姛鍒犻櫎 ${daysOld} 澶╁墠鐨勮涓烘暟鎹甡,
      deleted_count: 0, // delete鎿嶄綔涓嶈繑鍥炲叿浣撳垹闄ゆ暟?    });
  } catch (error) {
    console.error('鍒犻櫎琛屼负鏁版嵁API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

