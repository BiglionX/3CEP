import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js';
// cookies() 已移除，不再需要此导入
import { NextResponse } from 'next/server';

// 计算两点间距离的 Haversine 公式
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/shops/nearby?lat=39.9042&lng=116.4074&radius=10&limit=10
export async function GET(request: Request) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // 默认10公里
    const limit = parseInt(searchParams.get('limit') || '10');

    // 验证参数
    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: '请提供有效的经纬度参数' },
        { status: 400 }
      );
    }

    // 验证经纬度范围
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: '经纬度参数超出有效范围' },
        { status: 400 }
      );
    }

    // 查询附近的维修店
    const { data: shops, error } = await supabase
      .from('repair_shops')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false })
      .limit(100);

    if (error) {
      console.error('查询附近维修店失败:', error);
      return NextResponse.json(
        { error: '查询附近维修店失败', details: error.message },
        { status: 500 }
      );
    }

    if (!shops || shops.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '附近暂无维修店',
      });
    }

    // 计算距离并过滤
    const shopsWithDistance: any[] = [];

    for (const shop of shops) {
      if (shop.latitude && shop.longitude) {
        const distance = calculateDistance(
          lat,
          lng,
          shop.latitude,
          shop.longitude
        );

        if (distance <= radius) {
          shopsWithDistance.push({
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            contact_person: shop.contact_person,
            phone: shop.phone,
            address: shop.address,
            city: shop.city,
            province: shop.province,
            postal_code: shop.postal_code,
            latitude: shop.latitude,
            longitude: shop.longitude,
            logo_url: shop.logo_url,
            cover_image_url: shop.cover_image_url,
            services: shop.services ? JSON.parse(shop.services as string) : [],
            specialties: shop.specialities
              ? JSON.parse(shop.specialities as string)
              : [],
            rating: shop.rating,
            review_count: shop.review_count,
            service_count: shop.service_count,
            certification_level: shop.certification_level,
            is_verified: shop.is_verified,
            status: shop.status,
            created_at: shop.created_at,
            updated_at: shop.updated_at,
            distance: parseFloat(distance.toFixed(2)),
          });
        }
      }
    }

    // 按距离排序并限制数量
    shopsWithDistance.sort((a, b) => a.distance - b.distance);
    const result = shopsWithDistance.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        total: result.length,
        limit,
        radius,
        center: { lat, lng },
      },
      message: `找到 ${result.length} 家附近的维修店`,
    });
  } catch (error) {
    console.error('附近维修店API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
