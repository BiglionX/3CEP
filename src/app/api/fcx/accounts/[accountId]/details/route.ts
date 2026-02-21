/**
 * FCX账户详情查询API
 * 包含余额、交易历史等详细信息
 */

import { NextResponse } from 'next/server';
import { EnhancedPaymentService } from '@/fcx-system';

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!accountId) {
      return NextResponse.json(
        { error: '缺少accountId参数' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const paymentService = new EnhancedPaymentService();
    const accountDetails = await paymentService.getAccountBalanceDetails(userId);

    return NextResponse.json({
      success: true,
      data: accountDetails
    });

  } catch (error) {
    console.error('查询账户详情错误:', error);
    return NextResponse.json(
      { 
        error: '查询账户详情失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}