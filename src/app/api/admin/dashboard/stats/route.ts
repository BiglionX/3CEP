import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // 鍒涘缓Supabase瀹㈡埛?  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 寮€鍙戠幆澧冧复鏃剁粫杩囪璇佹?  if (process.env.NODE_ENV === 'development') {
    console.log('寮€鍙戠幆? 缁曡繃璁よ瘉妫€?);
  }

  try {
    // 鑾峰彇浠婂ぉ鐨勫紑濮嬪拰缁撴潫鏃堕棿
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // 鑾峰彇鏈懆鐨勫紑濮嬪拰缁撴潫鏃堕棿
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 鑾峰彇?澶╃殑鏃堕棿鑼冨洿
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. 浠婃棩鏂板鐑偣閾炬帴?    const { count: todayHotLinks } = await supabase
      .from('unified_link_library')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    // 2. 寰呭鏍搁摼鎺ユ暟
    const { count: pendingLinks } = await supabase
      .from('unified_link_library')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review');

    // 3. 鏈懆鏂板鏂囩珷?    const { count: weekArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    // 4. 鎬绘敞鍐屽伐绋嬪笀?    const { count: totalEngineers } = await supabase
      .from('user_profiles_ext')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'engineer');

    // 5. 鎬诲簵閾烘暟
    const { count: totalShops } = await supabase
      .from('repair_shops')
      .select('*', { count: 'exact', head: true });

    // 6. 锟?澶╅绾﹂噺瓒嬪娍鏁版嵁
    const { data: appointmentTrends } = await supabase
      .from('appointments')
      .select('created_at, status')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // 澶勭悊瓒嬪娍鏁版嵁锛屾寜鏃ユ湡鍒嗙粍缁熻
    const trendData = processTrendData(appointmentTrends || []);

    const stats = {
      todayHotLinks: todayHotLinks || 0,
      pendingLinks: pendingLinks || 0,
      weekArticles: weekArticles || 0,
      totalEngineers: totalEngineers || 0,
      totalShops: totalShops || 0,
      appointmentTrends: trendData,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('鑾峰彇杩愯惀鏁版嵁澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇杩愯惀鏁版嵁澶辫触' },
      { status: 500 }
    );
  }
}

// 澶勭悊棰勭害瓒嬪娍鏁版嵁
function processTrendData(appointments: any[]) {
  const trendMap = new Map();

  // 鍒濆鍖栬繎7澶╃殑鏁版嵁
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    trendMap.set(dateKey, {
      date: dateKey,
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    });
  }

  // 缁熻瀹為檯鏁版嵁
  appointments.forEach(appointment => {
    const dateKey = appointment.created_at.split('T')[0];
    if (trendMap.has(dateKey)) {
      const dayData = trendMap.get(dateKey);
      dayData.total += 1;
      if (appointment.status === 'confirmed') {
        dayData.confirmed += 1;
      } else if (appointment.status === 'pending') {
        dayData.pending += 1;
      } else if (appointment.status === 'cancelled') {
        dayData.cancelled += 1;
      }
    }
  });

  return Array.from(trendMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

