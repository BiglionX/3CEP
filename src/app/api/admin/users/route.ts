import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/lib/database.types'
import { AuthService } from '@/lib/auth-service';
import { cache } from '@/lib/cache-manager';

// 鑾峰彇鐢ㄦ埛鍒楄〃
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
        { error: '鍙湁瓒呯骇绠＄悊鍛樺彲浠ヨ闂敤鎴风? },
        { status: 403 }
      );
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const dateStart = searchParams.get('date_start') || '';
    const dateEnd = searchParams.get('date_end') || '';
    const lastActive = searchParams.get('last_active') || '';
    const regSource = searchParams.get('reg_source') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 鐢熸垚缂撳瓨?    const cacheKey = `admin_users:${search}:${role}:${status}:${dateStart}:${dateEnd}:${lastActive}:${regSource}:${page}:${limit}`;

    // 灏濊瘯浠庣紦瀛樿幏?    const cachedResult = await cache.get<{ data: any[]; meta: any }>(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        meta: cachedResult.meta,
        fromCache: true,
      });
    }

    // 鏋勫缓鏌ヨ鏉′欢
    let query = supabase
      .from('user_management_view')
      .select('*', { count: 'exact' });

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(`email.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    // 娣诲姞瑙掕壊绛?    if (role) {
      query = query.eq('role', role);
    }

    // 娣诲姞鐘舵€佺瓫?    if (status) {
      query = query.eq('status', status);
    }

    // 娣诲姞娉ㄥ唽鏃堕棿鑼冨洿绛?    if (dateStart) {
      query = query.gte('created_at', dateStart);
    }
    if (dateEnd) {
      query = query.lte('created_at', dateEnd);
    }

    // 娣诲姞鏈€鍚庢椿璺冩椂闂寸瓫?    if (lastActive) {
      const now = new Date();
      let activeDate: Date;

      switch (lastActive) {
        case '24h':
          activeDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          activeDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          activeDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          activeDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'inactive_30d':
          activeDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          query = query.lt('updated_at', activeDate.toISOString());
          break;
        case 'inactive_90d':
          activeDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          query = query.lt('updated_at', activeDate.toISOString());
          break;
        default:
          activeDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (!lastActive.includes('inactive')) {
        query = query.gte('updated_at', activeDate.toISOString());
      }
    }

    // 娣诲姞娉ㄥ唽鏉ユ簮绛涢€夛紙鍋囪鍦╱ser_profiles_ext琛ㄤ腑鏈塻ource瀛楁?    if (regSource) {
      // 杩欓噷鍙互鏍规嵁瀹為檯鐨勬敞鍐屾潵婧愬瓧娈佃繘琛岀瓫?      // 绀轰緥锛歲uery = query.eq('registration_source', regSource);
    }

    // 鍒嗛〉
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('鑾峰彇鐢ㄦ埛鍒楄〃澶辫触:', error);
      return NextResponse.json({ error: '鑾峰彇鐢ㄦ埛鍒楄〃澶辫触' }, { status: 500 });
    }

    // 缂撳瓨缁撴灉锛堜粎缂撳瓨闈炴悳绱㈢粨鏋滐紝閬垮厤缂撳瓨姹℃煋?    const shouldCache =
      !search &&
      !role &&
      !status &&
      !dateStart &&
      !dateEnd &&
      !lastActive &&
      !regSource;
    const result = {
      success: true,
      data: data || [],
      meta: {
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNextPage: page < Math.ceil((count || 0) / limit),
          hasPreviousPage: page > 1,
        },
      },
    };

    if (shouldCache) {
      await cache.set(cacheKey, result, { ttl: 300 }); // 缂撳瓨5鍒嗛挓
    }

    return NextResponse.json({
      ...result,
      fromCache: false,
    });
  } catch (error) {
    console.error('鐢ㄦ埛绠＄悊API閿欒:', error);
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

// 鏇存柊鐢ㄦ埛淇℃伅
export async function PUT(request: Request) {
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
        { error: '鍙湁瓒呯骇绠＄悊鍛樺彲浠ヤ慨鏀圭敤鎴蜂俊? },
        { status: 403 }
      );
    }

    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '缂哄皯鐢ㄦ埛ID' }, { status: 400 });
    }

    // 鍑嗗鏇存柊鏁版嵁
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 澶勭悊瑙掕壊鏇存柊
    if (updates.role) {
      updateData.role = updates.role;
    }

    // 澶勭悊瀛愯鑹叉洿?    if (updates.sub_roles !== undefined) {
      updateData.sub_roles = updates.sub_roles;
    }

    // 澶勭悊婵€娲荤姸鎬佹洿?    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }

    // 澶勭悊灏佺鐘舵€佹洿?    if (updates.status) {
      updateData.status = updates.status;

      if (updates.status === 'banned') {
        updateData.banned_at = new Date().toISOString();
        updateData.banned_reason = updates.banned_reason || '绠＄悊鍛樺皝?;
      } else if (updates.status === 'active') {
        updateData.unbanned_at = new Date().toISOString();
        updateData.banned_reason = null;
        updateData.banned_at = null;
      }
    }

    const { data, error } = await supabase
      .from('user_profiles_ext')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('鏇存柊鐢ㄦ埛淇℃伅澶辫触:', error);
      return NextResponse.json(
        { error: '鏇存柊鐢ㄦ埛淇℃伅澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '鐢ㄦ埛淇℃伅鏇存柊鎴愬姛',
      data,
    });
  } catch (error) {
    console.error('鏇存柊鐢ㄦ埛API閿欒:', error);
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

// 鎵归噺鎿嶄綔鐢ㄦ埛
export async function POST(request: Request) {
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
        { error: '鍙湁瓒呯骇绠＄悊鍛樺彲浠ユ墽琛屾壒閲忔搷? },
        { status: 403 }
      );
    }

    const { action, userIds, reason } = await request.json();

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: '缂哄皯蹇呰鍙傛暟' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'ban':
        updateData = {
          status: 'banned',
          banned_at: new Date().toISOString(),
          banned_reason: reason || '鎵归噺灏佺鎿嶄綔',
          updated_at: new Date().toISOString(),
        };
        break;

      case 'unban':
        updateData = {
          status: 'active',
          unbanned_at: new Date().toISOString(),
          banned_reason: null,
          banned_at: null,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'activate':
        updateData = {
          is_active: true,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'deactivate':
        updateData = {
          is_active: false,
          updated_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: '涓嶆敮鎸佺殑鎿嶄綔绫诲瀷' },
          { status: 400 }
        );
    }

    // 鎵归噺鏇存柊鐢ㄦ埛鐘?    const { data, error } = await supabase
      .from('user_profiles_ext')
      .update(updateData)
      .in('id', userIds);

    if (error) {
      console.error('鎵归噺鎿嶄綔澶辫触:', error);
      return NextResponse.json(
        { error: '鎵归噺鎿嶄綔澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `鎵归噺${
        action === 'ban'
          ? '灏佺'
          : action === 'unban'
            ? '瑙ｅ皝'
            : action === 'activate'
              ? '婵€?
              : '鍋滅敤'
      }鎿嶄綔鎴愬姛`,
      affected: userIds.length,
    });
  } catch (error) {
    console.error('鎵归噺鎿嶄綔API閿欒:', error);
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

