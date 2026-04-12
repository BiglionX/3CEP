import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

import { NextRequest, NextResponse } from 'next/server';

// 模拟分类数据
const mockIncomeCategories = [
  { name: '维修服务', value: 15600, color: '#10B981' },
  { name: '配件销售', value: 8900, color: '#3B82F6' },
  { name: '数据恢复', value: 3200, color: '#8B5CF6' },
  { name: '其他收入', value: 3500, color: '#F59E0B' },
];

const mockExpenseCategories = [
  { name: '配件采购', value: 8900, color: '#EF4444' },
  { name: '人工成本', value: 12000, color: '#F97316' },
  { name: '房租水电', value: 3500, color: '#8B5CF6' },
  { name: '营销推广', value: 2500, color: '#06B6D4' },
  { name: '其他支出', value: 1800, color: '#64748B' },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const _days = parseInt(searchParams.get('days') || '30');

        // 这里可以根据天数调整数据，目前返回固定数据
        return NextResponse.json({
          success: true,
          data: {
            income: mockIncomeCategories,
            expense: mockExpenseCategories,
          },
        });
      } catch (error) {
        console.error('获取分类数据失败:', error);
        return NextResponse.json(
          { success: false, error: '获取分类数据失败', data: null },
          { status: 500 }
        );
      }
    },
    'payments_read'
  );
}
