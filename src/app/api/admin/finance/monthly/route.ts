import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

import { NextRequest, NextResponse } from 'next/server';

// 模拟月度数据
const mockMonthlyData = [
  { month: '2023-09', income: 25000, expense: 18000, profit: 7000 },
  { month: '2023-10', income: 28500, expense: 19200, profit: 9300 },
  { month: '2023-11', income: 32000, expense: 21000, profit: 11000 },
  { month: '2023-12', income: 45000, expense: 28000, profit: 17000 },
  { month: '2024-01', income: 38000, expense: 24500, profit: 13500 },
  { month: '2024-02', income: 31200, expense: 22800, profit: 8400 },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const months = parseInt(searchParams.get('months') || '6');

        // 返回指定月数的数据
        const resultData = mockMonthlyData.slice(-months);

        return NextResponse.json({
          success: true,
          data: resultData,
        });
      } catch (error) {
        console.error('获取月度数据失败:', error);
        return NextResponse.json(
          { success: false, error: '获取月度数据失败', data: [] },
          { status: 500 }
        );
      }
    },
    'payments_read'
  );
}
