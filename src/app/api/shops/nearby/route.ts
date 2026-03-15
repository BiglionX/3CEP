import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

// 璁＄畻涓ょ偣闂磋窛绂荤殑Haversine鍏紡
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 鍦扮悆鍗婂緞锛堝叕閲岋級
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

// GET /api/shops/nearbylat=39.9042&lng=116.4074&radius=10&limit=10
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // 榛樿10鍏噷
    const limit = parseInt(searchParams.get('limit') || '10');

    // 楠岃瘉鍙傛暟
    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: '璇彁渚涙湁鏁堢殑缁忕含搴﹀弬 },
        { status: 400 }
      );
    }

    // 楠岃瘉缁忕含搴﹁寖    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: '缁忕含搴﹀弬鏁拌秴鍑烘湁鏁堣寖 },
        { status: 400 }
      );
    }

    // 鏌ヨ闄勮繎鐨勭淮淇簵
    const { data: shops, error } = await supabase
      .from('repair_shops')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false })
      .limit(100);

    if (error) {
      console.error('鏌ヨ闄勮繎搴楅摵澶辫触:', error);
      return NextResponse.json(
        { error: '鏌ヨ闄勮繎搴楅摵澶辫触', details: error.message },
        { status: 500 }
      );
    }

    if (!shops || shops.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '闄勮繎鏆傛棤缁翠慨搴楅摵',
      });
    }

    // 璁＄畻璺濈骞惰繃    const shopsWithDistance: any[] = [];

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
            services: shop.services  JSON.parse(shop.services as string) : [],
            specialties: shop.specialties
               JSON.parse(shop.specialties as string)
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

    // 鎸夎窛绂绘帓搴忓苟闄愬埗鏁伴噺
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
      message: `鎵惧埌 ${result.length} 瀹堕檮杩戠殑缁翠慨搴楅摵`,
    });
  } catch (error) {
    console.error('闄勮繎搴楅摵API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

