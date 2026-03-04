import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙搴楅摵鏁版嵁
const mockShops = [
  {
    id: 'shop_001',
    name: '鍖椾含鏈濋槼缁翠慨涓績',
    contact_person: '寮犲笀?,
    phone: '13800138001',
    address: '鍖椾含甯傛湞闃冲尯寤哄浗?8锟?,
    city: '鍖椾含?,
    province: '鍖椾含?,
    business_license: 'BJ20240001',
    services: JSON.stringify(['鎵嬫満缁翠慨', '鐢佃剳缁翠慨', '骞虫澘缁翠慨']),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.8,
    review_count: 128,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-20T14:22:00Z',
  },
  {
    id: 'shop_002',
    name: '涓婃捣娴︿笢鏁扮爜缁翠慨?,
    contact_person: '鏉庢妧?,
    phone: '13900139002',
    address: '涓婃捣甯傛郸涓滄柊鍖洪檰瀹跺槾鐜矾1000锟?,
    city: '涓婃捣?,
    province: '涓婃捣?,
    business_license: 'SH20240002',
    services: JSON.stringify(['鎵嬫満缁翠慨', '鏁版嵁鎭㈠']),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.5,
    review_count: 89,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-02-18T16:45:00Z',
  },
  {
    id: 'shop_003',
    name: '骞垮窞澶╂渤鐢靛瓙缁翠慨?,
    contact_person: '鐜嬬粡?,
    phone: '13700137003',
    address: '骞垮窞甯傚ぉ娌冲尯鐝犳睙鏂板煄鑺卞煄澶ч亾888锟?,
    city: '骞垮窞?,
    province: '骞夸笢?,
    business_license: 'GD20240003',
    services: JSON.stringify(['鎵嬫満缁翠慨', '鐢佃剳缁翠慨', '缃戠粶璋冭瘯']),
    logo_url: '',
    cover_image_url: '',
    status: 'disabled',
    rating: 4.2,
    review_count: 67,
    created_at: '2024-02-01T11:20:00Z',
    updated_at: '2024-02-25T09:30:00Z',
  },
  {
    id: 'shop_004',
    name: '娣卞湷鍗楀北鏅鸿兘缁翠慨?,
    contact_person: '闄堜富?,
    phone: '13600136004',
    address: '娣卞湷甯傚崡灞卞尯绉戞妧鍥崡鍖烘繁鍗楀ぇ?999锟?,
    city: '娣卞湷?,
    province: '骞夸笢?,
    business_license: 'SZ20240004',
    services: JSON.stringify(['鎵嬫満缁翠慨', '鏅鸿兘瀹跺眳缁翠慨', '鏃犱汉鏈虹淮?]),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.9,
    review_count: 203,
    created_at: '2024-01-10T08:45:00Z',
    updated_at: '2024-02-22T13:15:00Z',
  },
  {
    id: 'shop_005',
    name: '鏉窞瑗挎箹鏁扮爜蹇慨',
    contact_person: '鍒樺笀?,
    phone: '13500135005',
    address: '鏉窞甯傝タ婀栧尯鏂囦笁?55锟?,
    city: '鏉窞?,
    province: '娴欐睙?,
    business_license: 'ZJ20240005',
    services: JSON.stringify(['鎵嬫満缁翠慨', '骞虫澘缁翠慨']),
    logo_url: '',
    cover_image_url: '',
    status: 'rejected',
    rating: 3.8,
    review_count: 42,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-28T11:20:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // 杩囨护鏁版嵁
    let filteredShops = [...mockShops];

    // 鎼滅储杩囨护
    if (search) {
      filteredShops = filteredShops.filter(
        shop =>
          shop.name.toLowerCase().includes(search.toLowerCase()) ||
          shop.contact_person.toLowerCase().includes(search.toLowerCase()) ||
          shop.address.toLowerCase().includes(search.toLowerCase()) ||
          shop.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 鐘舵€佽繃?    if (status && status !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.status === status);
    }

    // 鍒嗛〉
    const total = filteredShops.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedShops = filteredShops.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedShops,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('鑾峰彇搴楅摵鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇搴楅摵鍒楄〃澶辫触',
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }
}

