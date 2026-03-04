import { NextResponse } from 'next/server';

// 妯℃嫙鐢ㄦ埛浣欓API绔偣
export async function GET() {
  try {
    // 妯℃嫙鐢ㄦ埛浣欓鏁版嵁
    const balance = {
      balance: 150,
      total_purchased: 500,
      total_consumed: 350,
    };

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '鑾峰彇浣欓澶辫触' },
      { status: 500 }
    );
  }
}
