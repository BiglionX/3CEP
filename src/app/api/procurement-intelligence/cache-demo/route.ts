// 閲囪喘鏅鸿兘浣撶紦瀛樻祴璇旳PI

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 妯℃嫙涓€浜涜€楁椂鎿嶄綔
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: '缂撳婕旂ずAPI姝ｅ父宸ヤ綔',
      timestamp: new Date().toISOString(),
      cacheStatus: '婕旂ず妯″紡',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: '缂撳娓呴櫎婕旂ず',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
