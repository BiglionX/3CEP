import { NextResponse } from 'next/server';

// 妯℃嫙Token濂楅API绔偣
export async function GET() {
  try {
    // 妯℃嫙濂楅鏁版嵁
    const packages = [
      {
        id: 'pkg_1',
        name: '鍩虹濂楅',
        description: '傚悎鍋跺皵浣跨敤鐨勭敤,
        token_amount: 100,
        price: 9.9,
        discount_percentage: 0,
        is_popular: false,
        is_active: true,
        sort_order: 1,
      },
      {
        id: 'pkg_2',
        name: '鏍囧噯濂楅',
        description: '鎬т环姣斾箣夛紝婊¤冻ュ父闇€,
        token_amount: 500,
        price: 45.0,
        discount_percentage: 10,
        is_popular: true,
        is_active: true,
        sort_order: 2,
      },
    ];

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '鑾峰彇濂楅澶辫触' },
      { status: 500 }
    );
  }
}

