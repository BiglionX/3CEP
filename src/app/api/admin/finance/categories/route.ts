import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

﻿import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙鍒嗙被鏁版嵁
const mockIncomeCategories = [
  { name: '缁翠慨鏈嶅姟, value: 15600, color: '#10B981' },
  { name: '閰嶄欢閿€, value: 8900, color: '#3B82F6' },
  { name: '鏁版嵁鎭㈠', value: 3200, color: '#8B5CF6' },
  { name: '鍏朵粬鏀跺叆', value: 3500, color: '#F59E0B' },
];

const mockExpenseCategories = [
  { name: '閰嶄欢閲囪喘', value: 8900, color: '#EF4444' },
  { name: '浜哄伐鎴愭湰', value: 12000, color: '#F97316' },
  { name: '鎴跨姘寸數', value: 3500, color: '#8B5CF6' },
  { name: '钀ラ攢鎺ㄥ箍', value: 2500, color: '#06B6D4' },
  { name: '鍏朵粬鏀嚭', value: 1800, color: '#64748B' },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 杩欓噷鍙互鏍规嵁澶╂暟璋冩暣鏁版嵁锛岀洰鍓嶈繑鍥炲浐瀹氭暟    return NextResponse.json({
      success: true,
      data: {
        income: mockIncomeCategories,
        expense: mockExpenseCategories,
      },
    });
  } catch (error) {
    console.error('鑾峰彇鍒嗙被鏁版嵁澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇鍒嗙被鏁版嵁澶辫触', data: null },
      { status: 500 }
    );
  }

    },
    'payments_read'
  );

