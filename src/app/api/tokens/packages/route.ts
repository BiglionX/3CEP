import { NextResponse } from 'next/server';

// 模拟Token套餐API端点
export async function GET() {
  try {
    // 模拟套餐数据
    const packages = [
      {
        id: 'pkg_1',
        name: '基础套餐',
        description: '适合新手使用的用户',
        token_amount: 100,
        price: 9.9,
        discount_percentage: 0,
        is_popular: false,
        is_active: true,
        sort_order: 1,
      },
      {
        id: 'pkg_2',
        name: '标准套餐',
        description: '性价比最高，满足日常需求',
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
      { success: false, error: '获取套餐失败' },
      { status: 500 }
    );
  }
}
