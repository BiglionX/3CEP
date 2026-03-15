import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鑾峰彇鐢ㄦ埛鐢诲儚 (绉诲姩绔紭鍖栫増
export async function GET(request: Request) {
  try {
    // 鑾峰彇璁よ瘉淇℃伅
    const authHeader = request.headers.get('authorization');

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭,
          data: null,
        },
        { status: 401 }
      );
    }

    // 楠岃瘉JWTょ墝骞惰幏鍙栫敤鎴蜂俊    const token = authHeader.substring(7);

    // 杩欓噷搴旇楠岃瘉JWTょ墝锛岀畝鍖栧疄鐜扮洿鎺ヤ娇鐢╩ock鏁版嵁
    // 瀹為檯搴旂敤涓渶瑕佽皟鐢ㄨ璇佹湇鍔￠獙璇乼oken

    // Mock鐢ㄦ埛鏁版嵁 - 瀹為檯搴旇庤璇佹湇鍔¤幏    const mockUserId = 'user_123'; // 搴旇巘oken涓В
    // 鑾峰彇鐢ㄦ埛鍩烘湰淇℃伅
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        name,
        avatar_url,
        role,
        created_at
      `
      )
      .eq('id', mockUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          code: 40401,
          message: '鐢ㄦ埛涓嶅,
          data: null,
        },
        { status: 404 }
      );
    }

    // 鑾峰彇鐢ㄦ埛鍓鑹蹭俊    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.id);

    const subRoles = userRoles.map((ur: any) => ur.role_name) || [];

    // 鑾峰彇鐢ㄦ埛甯镐慨璁惧鍋忓ソ
    const { data: favoriteDevices } = await supabase
      .from('user_device_preferences')
      .select(
        `
        devices (id, brand, model, category)
      `
      )
      .eq('user_id', user.id)
      .limit(10);

    const formattedDevices = (favoriteDevices || []).map((pref: any) => ({
      id: pref.devices.id,
      name: `${pref.devices.brand} ${pref.devices.model}`,
    }));

    // 鑾峰彇鐢ㄦ埛甯歌喘閰嶄欢鍋忓ソ
    const { data: favoriteParts } = await supabase
      .from('user_part_preferences')
      .select(
        `
        parts (id, name, category, brand)
      `
      )
      .eq('user_id', user.id)
      .limit(10);

    const formattedParts = (favoriteParts || []).map((pref: any) => ({
      id: pref.parts.id,
      name: `${pref.parts.brand} ${pref.parts.name}`,
    }));

    // 鑾峰彇鐢ㄦ埛鏀惰棌鐨勫簵    const { data: favoriteShops } = await supabase
      .from('user_shop_favorites')
      .select(
        `
        repair_shops (id, name, rating, city)
      `
      )
      .eq('user_id', user.id)
      .limit(10);

    const formattedShops = (favoriteShops || []).map((fav: any) => ({
      id: fav.repair_shops.id,
      name: fav.repair_shops.name,
      rating: fav.repair_shops.rating,
      city: fav.repair_shops.city,
    }));

    // 鑾峰彇鐢ㄦ埛缁熻鏁版嵁
    const { data: userStats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const stats = {
      articles_count: userStats.articles_created || 0,
      uploads_count: userStats.knowledge_uploads || 0,
      adopts_count: userStats.adoptions_made || 0,
      total_reads: userStats.total_reads || 0,
      total_likes: userStats.total_likes_received || 0,
    };

    // 鑾峰彇鐢ㄦ埛绉垎淇℃伅
    const { data: pointBalance } = await supabase
      .from('user_points')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const points = pointBalance.balance || 0;

    // 鏍煎紡鍖栧搷搴旀暟    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url,
      role: user.role || 'user',
      sub_roles: subRoles,
      favorite_devices: formattedDevices,
      favorite_parts: formattedParts,
      favorite_shops: formattedShops,
      stats,
      points,
      member_since: user.created_at,
      last_active: new Date().toISOString(), // 瀹為檯搴旇庣敤鎴椿鍔ㄨ褰曡幏    };

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: userProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛鐢诲儚澶辫触:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        data: null,
      },
      { status: 500 }
    );
  }
}

