import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙渚涘簲鍟嗘暟?const mockSuppliers = [
  {
    id: 'sup_001',
    name: '鍗庡己鍖楃數瀛愭湁闄愬叕?,
    contact_person: '寮犵粡?,
    phone: '13800138001',
    email: 'zhang@huaqiangbei.com',
    address: '娣卞湷甯傜鐢板尯鍗庡己鍖楄矾1001锟?,
    rating: 4.8,
    cooperation_since: '2023-01-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'sup_002',
    name: '娣卞湷鏁扮爜閰嶄欢?,
    contact_person: '鏉庝富?,
    phone: '13900139002',
    email: 'li@szdigital.com',
    address: '娣卞湷甯傚崡灞卞尯绉戞妧鍥崡鍖烘繁鍗楀ぇ?988锟?,
    rating: 4.5,
    cooperation_since: '2023-03-20T00:00:00Z',
    status: 'active',
  },
  {
    id: 'sup_003',
    name: '骞垮窞鐢靛瓙鍏冧欢鍏徃',
    contact_person: '鐜嬬粡?,
    phone: '13700137003',
    email: 'wang@gzelectronics.com',
    address: '骞垮窞甯傚ぉ娌冲尯鐝犳睙鏂板煄鍗庡?88锟?,
    rating: 4.2,
    cooperation_since: '2023-05-10T00:00:00Z',
    status: 'active',
  },
  {
    id: 'sup_004',
    name: '鍖椾含鏅鸿兘璁惧渚涘簲?,
    contact_person: '闄?,
    phone: '13600136004',
    email: 'chen@bj-smart.com',
    address: '鍖椾含甯傛捣娣€鍖轰腑鍏虫潙澶ц1锟?,
    rating: 4.9,
    cooperation_since: '2023-02-28T00:00:00Z',
    status: 'active',
  },
  {
    id: 'sup_005',
    name: '涓婃捣绮惧瘑浠櫒?,
    contact_person: '鍒樺伐',
    phone: '13500135005',
    email: 'liu@sh-precision.com',
    address: '涓婃捣甯傛郸涓滄柊鍖哄紶姹熼珮绉戞妧鍥尯閮畧鏁矾351锟?,
    rating: 4.7,
    cooperation_since: '2023-04-12T00:00:00Z',
    status: 'active',
  },
  {
    id: 'sup_006',
    name: '鏉窞鐢靛瓙鏉愭枡鍏徃',
    contact_person: '璧典富?,
    phone: '13400134006',
    email: 'zhao@hz-electronic.com',
    address: '鏉窞甯傛花姹熷尯姹熷崡澶ч亾3888锟?,
    rating: 3.8,
    cooperation_since: '2023-06-05T00:00:00Z',
    status: 'inactive',
  },
  {
    id: 'sup_007',
    name: '鎴愰兘鍗婂浣撴湁闄愬叕?,
    contact_person: '瀛欑粡?,
    phone: '13300133007',
    email: 'sun@cd-semiconductor.com',
    address: '鎴愰兘甯傞珮鏂板尯澶╁簻杞欢鍥璄锟?,
    rating: 4.1,
    cooperation_since: '2023-07-18T00:00:00Z',
    status: 'active',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const minRating = parseFloat(searchParams.get('minRating') || '0');

    // 杩囨护鏁版嵁
    let filteredSuppliers = [...mockSuppliers];

    // 鐘舵€佽繃?    if (status && status !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(
        supplier => supplier.status === status
      );
    }

    // 璇勫垎杩囨护
    if (minRating > 0) {
      filteredSuppliers = filteredSuppliers.filter(
        supplier => supplier.rating >= minRating
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSuppliers,
    });
  } catch (error) {
    console.error('鑾峰彇渚涘簲鍟嗗垪琛ㄥけ?', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇渚涘簲鍟嗗垪琛ㄥけ?, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 鐢熸垚鏂癐D
    const newId = `sup_${String(mockSuppliers.length + 1).padStart(3, '0')}`;

    // 鍒涘缓鏂颁緵搴斿晢
    const newSupplier = {
      id: newId,
      ...body,
      cooperation_since: new Date().toISOString(),
      rating: body.rating || 0,
      status: body.status || 'active',
    };

    mockSuppliers.push(newSupplier);

    return NextResponse.json({
      success: true,
      data: newSupplier,
      message: '渚涘簲鍟嗗垱寤烘垚?,
    });
  } catch (error) {
    console.error('鍒涘缓渚涘簲鍟嗗け?', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓渚涘簲鍟嗗け? },
      { status: 500 }
    );
  }
}

