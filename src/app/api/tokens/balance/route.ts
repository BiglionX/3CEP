import { NextResponse } from 'next/server';

// 模拟用户余额API端点
export async function GET() {
  try {
    // 模拟用户余额数据
    const balance = {
      balance: 150,
      total_purchased: 500,
      total_consumed: 350
    };

    return NextResponse.json({
      success: true,
      data: balance
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取余额失败' },
      { status: 500 }
    );
  }
}