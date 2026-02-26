import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取用户画像 (移动端优化版本)
export async function GET(request: Request) {
  try {
    // 获取认证信息
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '未授权访问',
          data: null,
        },
        { status: 401 }
      );
    }

    // 验证JWT令牌并获取用户信息
    const token = authHeader.substring(7);

    // 这里应该验证JWT令牌，简化实现直接使用mock数据
    // 实际应用中需要调用认证服务验证token

    // Mock用户数据 - 实际应该从认证服务获取
    const mockUserId = 'user_123'; // 应该从token中解析

    // 获取用户基本信息
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
          message: '用户不存在',
          data: null,
        },
        { status: 404 }
      );
    }

    // 获取用户副角色信息
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.id);

    const subRoles = userRoles?.map((ur: any) => ur.role_name) || [];

    // 获取用户常修设备偏好
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

    // 获取用户常购配件偏好
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

    // 获取用户收藏的店铺
    const { data: favoriteShops } = await supabase
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

    // 获取用户统计数据
    const { data: userStats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const stats = {
      articles_count: userStats?.articles_created || 0,
      uploads_count: userStats?.knowledge_uploads || 0,
      adopts_count: userStats?.adoptions_made || 0,
      total_reads: userStats?.total_reads || 0,
      total_likes: userStats?.total_likes_received || 0,
    };

    // 获取用户积分信息
    const { data: pointBalance } = await supabase
      .from('user_points')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const points = pointBalance?.balance || 0;

    // 格式化响应数据
    const userProfile = {
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
      last_active: new Date().toISOString(), // 实际应该从用户活动记录获取
    };

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: userProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取用户画像失败:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}
