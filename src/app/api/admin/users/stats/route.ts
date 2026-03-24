import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

// 鐢ㄦ埛缁熻API - 鑾峰彇鐢ㄦ埛绠＄悊鐩稿叧缁熻鏁版嵁
export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 榛樿30
    // 璁＄畻堕棿鑼冨洿
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // 1. 鍩虹鐢ㄦ埛缁熻
    const { data: users, error: usersError } = await supabase
      .from('user_profiles_ext')
      .select('*');

    if (usersError) throw usersError;

    // 2. 娲昏穬鐢ㄦ埛缁熻0澶╁唴鏈夋椿鍔級
    const { data: activeUsers, error: activeError } = await supabase
      .from('user_profiles_ext')
      .select('*')
      .gte('updated_at', startDate.toISOString());

    if (activeError) throw activeError;

    // 3. 鏂板鐢ㄦ埛缁熻锛堟寜堕棿娈碉級
    const { data: newUsers, error: newUsersError } = await supabase
      .from('user_profiles_ext')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (newUsersError) throw newUsersError;

    // 4. 鎸夎鑹茬粺    const roleStats: Record<string, number> = {};
    users.forEach((user: any) => {
      const role = user.role || 'unknown';
      roleStats[role] = (roleStats[role] || 0) + 1;
    });

    // 5. 鎸夌姸鎬佺粺    const statusStats: Record<string, number> = {};
    users.forEach((user: any) => {
      const status = user.status || 'unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    // 6. 鐢ㄦ埛澧為暱瓒嬪娍鏁版嵁
    const growthData = await getUserGrowthTrend(supabase, startDate, endDate);

    // 7. 娲昏穬搴﹀垎    const activityStats = await getUserActivityStats(supabase, startDate);

    // 鏋勯€犲搷搴旀暟    const stats = {
      // 鍩虹缁熻
      totalUsers: users.length || 0,
      activeUsers: activeUsers.length || 0,
      newUsers: newUsers.length || 0,
      bannedUsers: statusStats['banned'] || 0,

      // 鐧惧垎姣旂粺      activeRate: users.length
         Math.round(((activeUsers.length || 0) / users.length) * 100)
        : 0,
      newUsersRate: users.length
         Math.round(((newUsers.length || 0) / users.length) * 100)
        : 0,

      // 鍒嗙被缁熻
      byRole: roleStats,
      byStatus: statusStats,

      // 瓒嬪娍鏁版嵁
      growthTrend: growthData,
      activityDistribution: activityStats,

      // 堕棿淇℃伅
      period,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛缁熻澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鐢ㄦ埛缁熻澶辫触',
        details: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }

    },
    'users_read'
  );

// 鑾峰彇鐢ㄦ埛澧為暱瓒嬪娍鏁版嵁
async function getUserGrowthTrend(
  supabase: any,
  startDate: Date,
  endDate: Date
) {
  try {
    // 鎸夊懆缁熻鏂板鐢ㄦ埛
    const { data: weeklyData, error } = await supabase
      .from('user_profiles_ext')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    // 鎸夊懆鍒嗙粍缁熻
    const weeks: Record<string, number> = {};
    weeklyData.forEach((user: any) => {
      const date = new Date(user.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // 鑾峰彇鍛ㄤ竴寮€濮嬫棩      const weekKey = weekStart.toISOString().split('T')[0];
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    // 杞崲涓哄浘琛ㄦ暟鎹牸    return Object.entries(weeks).map(([date, count]) => ({
      date,
      newUsers: count,
      cumulative: 0, // 绱鐢ㄦ埛鏁伴渶瑕侀澶栬    }));
  } catch (error) {
    console.error('鑾峰彇澧為暱瓒嬪娍澶辫触:', error);
    return [];
  }
}

// 鑾峰彇鐢ㄦ埛娲昏穬搴﹀垎async function getUserActivityStats(supabase: any, startDate: Date) {
  try {
    // 鑾峰彇鐢ㄦ埛鏈€杩戞椿鍔ㄦ椂    const { data: userActivities, error } = await supabase
      .from('user_profiles_ext')
      .select('updated_at, created_at')
      .gte('updated_at', startDate.toISOString());

    if (error) throw error;

    // 鍒嗘瀽娲昏穬    const activityLevels = {
      daily: 0, // 姣忔棩娲昏穬
      weekly: 0, // 姣忓懆娲昏穬
      monthly: 0, // 姣忔湀娲昏穬
      inactive: 0, // 涓嶆椿    };

    const now = new Date();
    userActivities.forEach((user: any) => {
      const lastActive = new Date(user.updated_at);
      const daysSinceActive =
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceActive <= 1) {
        activityLevels.daily++;
      } else if (daysSinceActive <= 7) {
        activityLevels.weekly++;
      } else if (daysSinceActive <= 30) {
        activityLevels.monthly++;
      } else {
        activityLevels.inactive++;
      }
    });

    return activityLevels;
  } catch (error) {
    console.error('鑾峰彇娲昏穬搴︾粺璁″け', error);
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
      inactive: 0,
    };
  }
}

