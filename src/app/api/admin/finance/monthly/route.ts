import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙鏈堝害鏁版嵁
const mockMonthlyData = [
  { month: '2023-09', income: 25000, expense: 18000, profit: 7000 },
  { month: '2023-10', income: 28500, expense: 19200, profit: 9300 },
  { month: '2023-11', income: 32000, expense: 21000, profit: 11000 },
  { month: '2023-12', income: 45000, expense: 28000, profit: 17000 },
  { month: '2024-01', income: 38000, expense: 24500, profit: 13500 },
  { month: '2024-02', income: 31200, expense: 22800, profit: 8400 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');

    // 杩斿洖鎸囧畾鏈堟暟鐨勬暟    const resultData = mockMonthlyData.slice(-months);

    return NextResponse.json({
      success: true,
      data: resultData,
    });
  } catch (error) {
    console.error('鑾峰彇鏈堝害鏁版嵁澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇鏈堝害鏁版嵁澶辫触', data: [] },
      { status: 500 }
    );
  }
}
