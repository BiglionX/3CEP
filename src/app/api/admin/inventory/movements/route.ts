import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙搴撳娴佹按鏁版嵁
const mockMovements = [
  {
    id: 'move_001',
    item_id: 'inv_001',
    movement_type: 'in',
    quantity: 30,
    from_location: null,
    to_location: 'A01璐ф灦',
    reason: '閲囪喘鍏ュ簱',
    operator: '寮犻噰,
    created_at: '2024-02-25T09:30:00Z',
  },
  {
    id: 'move_002',
    item_id: 'inv_002',
    movement_type: 'out',
    quantity: 15,
    from_location: 'B03璐ф灦',
    to_location: null,
    reason: '缁翠慨棰嗙敤',
    operator: '鏉庢妧,
    created_at: '2024-02-26T14:20:00Z',
  },
  {
    id: 'move_003',
    item_id: 'inv_003',
    movement_type: 'in',
    quantity: 50,
    from_location: null,
    to_location: 'C02璐ф灦',
    reason: '渚涘簲鍟嗛€佽揣',
    operator: '鐜嬩粨,
    created_at: '2024-02-27T10:15:00Z',
  },
  {
    id: 'move_004',
    item_id: 'inv_001',
    movement_type: 'out',
    quantity: 5,
    from_location: 'A01璐ф灦',
    to_location: null,
    reason: '瀹㈡埛璁㈠崟',
    operator: '闄堥攢,
    created_at: '2024-02-27T16:45:00Z',
  },
  {
    id: 'move_005',
    item_id: 'inv_004',
    movement_type: 'transfer',
    quantity: 10,
    from_location: 'D01璐ф灦',
    to_location: '涓存椂瀛樻斁,
    reason: '璐ㄦ杞Щ',
    operator: '鍒樿川妫€',
    created_at: '2024-02-28T09:30:00Z',
  },
  {
    id: 'move_006',
    item_id: 'inv_006',
    movement_type: 'adjustment',
    quantity: -5,
    from_location: 'A05璐ф灦',
    to_location: 'A05璐ф灦',
    reason: '鐩樼偣宸紓璋冩暣',
    operator: '璧典細,
    created_at: '2024-02-28T11:20:00Z',
  },
  {
    id: 'move_007',
    item_id: 'inv_005',
    movement_type: 'in',
    quantity: 100,
    from_location: null,
    to_location: 'E04璐ф灦',
    reason: '澶у畻閲囪喘',
    operator: '瀛欓噰,
    created_at: '2024-02-28T14:15:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id') || '';
    const movementType = searchParams.get('type') || '';
    const days = parseInt(searchParams.get('days') || '30');

    // 杩囨护鏁版嵁
    let filteredMovements = [...mockMovements];

    // 鎸夊晢鍝両D杩囨护
    if (itemId) {
      filteredMovements = filteredMovements.filter(
        move => move.item_id === itemId
      );
    }

    // 鎸夋搷浣滅被鍨嬭繃    if (movementType && movementType !== 'all') {
      filteredMovements = filteredMovements.filter(
        move => move.movement_type === movementType
      );
    }

    // 鎸夋椂闂磋寖鍥磋繃    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredMovements = filteredMovements.filter(
        move => new Date(move.created_at) >= cutoffDate
      );
    }

    // 鎸夋椂闂村€掑簭鎺掑垪
    filteredMovements.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredMovements,
    });
  } catch (error) {
    console.error('鑾峰彇搴撳娴佹按澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇搴撳娴佹按澶辫触', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呭～瀛楁
    if (!body.item_id || !body.movement_type || !body.quantity) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟' },
        { status: 400 }
      );
    }

    // 鐢熸垚鏂癐D
    const newId = `move_${String(mockMovements.length + 1).padStart(3, '0')}`;

    // 鍒涘缓鏂版祦姘磋    const newMovement = {
      id: newId,
      ...body,
      created_at: new Date().toISOString(),
    };

    mockMovements.push(newMovement);

    return NextResponse.json({
      success: true,
      data: newMovement,
      message: '搴撳娴佹按璁板綍鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓搴撳娴佹按璁板綍澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓搴撳娴佹按璁板綍澶辫触' },
      { status: 500 }
    );
  }
}

