import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙撳簱浣嶇疆鏁版嵁
const mockLocations = [
  {
    id: 'loc_001',
    name: 'A鐢靛瓙浜у搧瀛樺偍,
    code: 'AREA-A',
    capacity: 500,
    current_usage: 320,
    status: 'active',
  },
  {
    id: 'loc_002',
    name: 'B閰嶄欢瀛樺偍,
    code: 'AREA-B',
    capacity: 800,
    current_usage: 650,
    status: 'active',
  },
  {
    id: 'loc_003',
    name: 'C宸ュ叿瀛樺偍,
    code: 'AREA-C',
    capacity: 300,
    current_usage: 180,
    status: 'active',
  },
  {
    id: 'loc_004',
    name: 'D璐甸噸鐗╁搧,
    code: 'AREA-D',
    capacity: 100,
    current_usage: 75,
    status: 'active',
  },
  {
    id: 'loc_005',
    name: 'E澶у畻璐х墿,
    code: 'AREA-E',
    capacity: 1200,
    current_usage: 980,
    status: 'active',
  },
  {
    id: 'loc_006',
    name: 'F妫€娴嬭澶囧尯',
    code: 'AREA-F',
    capacity: 200,
    current_usage: 120,
    status: 'active',
  },
  {
    id: 'loc_007',
    name: '涓存椂瀛樻斁,
    code: 'TEMP-01',
    capacity: 150,
    current_usage: 45,
    status: 'active',
  },
  {
    id: 'loc_008',
    name: '€璐у鐞嗗尯',
    code: 'RETURN-01',
    capacity: 100,
    current_usage: 25,
    status: 'inactive',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const minUsage = parseInt(searchParams.get('minUsage') || '0');

    // 杩囨护鏁版嵁
    let filteredLocations = [...mockLocations];

    // 鐘舵€佽繃    if (status && status !== 'all') {
      filteredLocations = filteredLocations.filter(
        location => location.status === status
      );
    }

    // 浣跨敤鐜囪繃    if (minUsage > 0) {
      filteredLocations = filteredLocations.filter(
        location =>
          (location.current_usage / location.capacity) * 100 >= minUsage
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredLocations,
    });
  } catch (error) {
    console.error('鑾峰彇撳簱浣嶇疆澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇撳簱浣嶇疆澶辫触', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呭～瀛楁
    if (!body.name || !body.code || !body.capacity) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟' },
        { status: 400 }
      );
    }

    // 妫€鏌ョ紪鐮佹槸鍚﹂噸    const existingLocation = mockLocations.find(loc => loc.code === body.code);
    if (existingLocation) {
      return NextResponse.json(
        { success: false, error: '浣嶇疆缂栫爜宸插 },
        { status: 400 }
      );
    }

    // 鐢熸垚鏂癐D
    const newId = `loc_${String(mockLocations.length + 1).padStart(3, '0')}`;

    // 鍒涘缓鏂颁綅    const newLocation = {
      id: newId,
      ...body,
      current_usage: body.current_usage || 0,
      status: body.status || 'active',
    };

    mockLocations.push(newLocation);

    return NextResponse.json({
      success: true,
      data: newLocation,
      message: '撳簱浣嶇疆鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓撳簱浣嶇疆澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓撳簱浣嶇疆澶辫触' },
      { status: 500 }
    );
  }
}

