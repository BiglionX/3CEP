import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

import { NextRequest, NextResponse } from 'next/server';

// 模拟交易数据
const mockTransactions = [
  {
    id: 'txn_001',
    type: 'income',
    category: '维修服务',
    amount: 288.0,
    description: 'iPhone 12 Pro屏幕更换',
    status: 'completed',
    created_at: '2024-02-28T10:30:00Z',
    updated_at: '2024-02-28T10:30:00Z',
  },
  {
    id: 'txn_002',
    type: 'income',
    category: '配件销售',
    amount: 156.0,
    description: '原装电池 + 数据线套装',
    status: 'completed',
    created_at: '2024-02-28T14:15:00Z',
    updated_at: '2024-02-28T14:15:00Z',
  },
  {
    id: 'txn_003',
    type: 'expense',
    category: '配件采购',
    amount: 890.0,
    description: '采购iPhone 13系列配件',
    status: 'completed',
    created_at: '2024-02-27T09:20:00Z',
    updated_at: '2024-02-27T09:20:00Z',
  },
  {
    id: 'txn_004',
    type: 'income',
    category: '维修服务',
    amount: 420.0,
    description: 'MacBook Pro键盘维修',
    status: 'completed',
    created_at: '2024-02-27T16:45:00Z',
    updated_at: '2024-02-27T16:45:00Z',
  },
  {
    id: 'txn_005',
    type: 'expense',
    category: '人工成本',
    amount: 1200.0,
    description: '技师工资',
    status: 'completed',
    created_at: '2024-02-26T17:00:00Z',
    updated_at: '2024-02-26T17:00:00Z',
  },
  {
    id: 'txn_006',
    type: 'income',
    category: '数据恢复',
    amount: 880.0,
    description: 'iPhone数据恢复服务',
    status: 'completed',
    created_at: '2024-02-26T11:30:00Z',
    updated_at: '2024-02-26T11:30:00Z',
  },
  {
    id: 'txn_007',
    type: 'expense',
    category: '房租水电',
    amount: 3500.0,
    description: '店铺租金及水电费',
    status: 'completed',
    created_at: '2024-02-25T08:00:00Z',
    updated_at: '2024-02-25T08:00:00Z',
  },
  {
    id: 'txn_008',
    type: 'income',
    category: '维修服务',
    amount: 198.0,
    description: '华为手机充电口维修',
    status: 'pending',
    created_at: '2024-02-28T15:20:00Z',
    updated_at: '2024-02-28T15:20:00Z',
  },
  {
    id: 'txn_009',
    type: 'expense',
    category: '营销推广',
    amount: 500.0,
    description: '线上广告投放',
    status: 'completed',
    created_at: '2024-02-24T10:00:00Z',
    updated_at: '2024-02-24T10:00:00Z',
  },
  {
    id: 'txn_010',
    type: 'income',
    category: '配件销售',
    amount: 234.0,
    description: 'AirPods Pro耳机',
    status: 'completed',
    created_at: '2024-02-28T13:45:00Z',
    updated_at: '2024-02-28T13:45:00Z',
  },
];

// 模拟月度数据
const _mockMonthlyData = [
  { month: '2023-09', income: 25000, expense: 18000, profit: 7000 },
  { month: '2023-10', income: 28500, expense: 19200, profit: 9300 },
  { month: '2023-11', income: 32000, expense: 21000, profit: 11000 },
  { month: '2023-12', income: 45000, expense: 28000, profit: 17000 },
  { month: '2024-01', income: 38000, expense: 24500, profit: 13500 },
  { month: '2024-02', income: 31200, expense: 22800, profit: 8400 },
];

// 模拟分类数据
const _mockIncomeCategories = [
  { name: '维修服务', value: 15600, color: '#10B981' },
  { name: '配件销售', value: 8900, color: '#3B82F6' },
  { name: '数据恢复', value: 3200, color: '#8B5CF6' },
  { name: '其他收入', value: 3500, color: '#F59E0B' },
];

const _mockExpenseCategories = [
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
        const days = parseInt(searchParams.get('days') || '30');

        // 根据天数过滤交易数据
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filteredTransactions = mockTransactions.filter(
          txn => new Date(txn.created_at) >= cutoffDate
        );

        return NextResponse.json({
          success: true,
          data: filteredTransactions,
        });
      } catch (error) {
        console.error('获取交易列表失败:', error);
        return NextResponse.json(
          { success: false, error: '获取交易列表失败', data: [] },
          { status: 500 }
        );
      }
    },
    'payments_read'
  );
}
