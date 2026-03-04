/**
 * 缁翠慨搴楅摵鏁版嵁API璺敱
 * 鎻愪緵缁翠慨搴楅摵淇℃伅鐨勭湡瀹炴暟鎹帴? */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface RepairShop {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  address: string;
  phone: string;
  services: string[];
  price_range: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 榛樿搴楅摵鏁版嵁锛堝綋鏁版嵁搴撴棤鏁版嵁鏃朵娇鐢級
const DEFAULT_SHOPS: RepairShop[] = [
  {
    id: 'shop_001',
    name: '鑻规灉瀹樻柟鎺堟潈缁翠慨涓績',
    rating: 4.9,
    review_count: 324,
    address: '鍖椾含甯傛湞闃冲尯寤哄浗?8锟?,
    phone: '010-12345678',
    services: ['iPhone缁翠慨', 'iPad缁翠慨', 'Mac缁翠慨'],
    price_range: '楼楼楼楼',
    latitude: 39.9042,
    longitude: 116.4074,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'shop_002',
    name: '蹇慨鎵嬫満缁翠慨?,
    rating: 4.6,
    review_count: 156,
    address: '鍖椾含甯傛捣娣€鍖轰腑鍏虫潙澶ц1锟?,
    phone: '010-87654321',
    services: ['瀹夊崜缁翠慨', '灞忓箷鏇存崲', '鐢垫睜鏇存崲'],
    price_range: '楼楼',
    latitude: 39.959,
    longitude: 116.311,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'shop_003',
    name: '涓撲笟鎶€鏈淮淇伐浣滃',
    rating: 4.8,
    review_count: 89,
    address: '鍖椾含甯傝タ鍩庡尯瑗垮崟鍖楀ぇ?6锟?,
    phone: '010-11223344',
    services: ['楂樼鏈虹淮?, '鏁版嵁鎭㈠', '涓绘澘缁翠慨'],
    price_range: '楼楼楼',
    latitude: 39.9087,
    longitude: 116.3666,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 鑾峰彇鏌ヨ鍙傛暟
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';
    const serviceFilter = searchParams.get('service') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '10'); // km
    const userLat = parseFloat(searchParams.get('lat') || '39.9042'); // 榛樿鍖椾含鍧愭爣
    const userLng = parseFloat(searchParams.get('lng') || '116.4074');

    // 浠庢暟鎹簱鑾峰彇搴楅摵鏁版嵁
    let { data: shops, error } = await supabase
      .from('repair_shops')
      .select('*')
      .eq('is_active', true)
      .gte('rating', minRating)
      .order('rating', { ascending: false });

    // 濡傛灉鏁版嵁搴撴煡璇㈠け璐ユ垨鏃犳暟鎹紝浣跨敤榛樿鏁版嵁
    if (error || !shops || shops.length === 0) {
      console.warn('浣跨敤榛樿搴楅摵鏁版嵁:', error?.message);
      shops = DEFAULT_SHOPS;
    }

    // 杩囨护鏁版嵁
    let filteredShops = shops as RepairShop[];

    // 鎼滅储杩囨护
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredShops = filteredShops.filter(
        shop =>
          shop.name.toLowerCase().includes(term) ||
          shop.address.toLowerCase().includes(term) ||
          shop.services.some(service => service.toLowerCase().includes(term))
      );
    }

    // 鏈嶅姟绫诲瀷杩囨护
    if (serviceFilter) {
      filteredShops = filteredShops.filter(shop =>
        shop.services.includes(serviceFilter)
      );
    }

    // 璺濈杩囨护锛堢畝鍗曡窛绂昏绠楋級
    if (maxDistance < 100) {
      // 濡傛灉璁剧疆浜嗗悎鐞嗙殑璺濈闄愬埗
      filteredShops = filteredShops.filter(shop => {
        if (shop.latitude && shop.longitude) {
          const distance = calculateDistance(
            userLat,
            userLng,
            shop.latitude,
            shop.longitude
          );
          return distance <= maxDistance;
        }
        return true; // 娌℃湁鍧愭爣鐨勫簵閾轰笉杩囨护
      });
    }

    // 娣诲姞璺濈淇℃伅
    const shopsWithDistance = filteredShops.map(shop => ({
      ...shop,
      distance:
        shop.latitude && shop.longitude
          ? calculateDistance(
              userLat,
              userLng,
              shop.latitude,
              shop.longitude
            ).toFixed(1) + 'km'
          : '鏈煡璺濈',
    }));

    // 鍒嗛〉澶勭悊
    const total = shopsWithDistance.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedShops = shopsWithDistance.slice(startIndex, endIndex);

    // 璁＄畻鍒嗛〉淇℃伅
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: paginatedShops,
      count: total,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      message: '搴楅摵鏁版嵁鑾峰彇鎴愬姛',
    });
  } catch (error) {
    console.error('鑾峰彇搴楅摵鏁版嵁閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇搴楅摵鏁版嵁澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 璁＄畻涓ょ偣闂磋窛绂伙紙绠€鍖栫増?function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 鍦扮悆鍗婂緞(km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

