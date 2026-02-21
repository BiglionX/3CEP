/**
 * FCX账户余额查询API
 */

import { NextResponse } from 'next/server';
import { FcxAccountService } from '@/fcx-system';

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;

    if (!accountId) {
      return NextResponse.json(
        { error: '缺少accountId参数' },
        { status: 400 }
      );
    }

    const accountService = new FcxAccountService();
    const balance = await accountService.getBalance(accountId);

    return NextResponse.json({
      success: true,
      data: balance
    });

  } catch (error) {
    console.error('查询账户余额错误:', error);
    return NextResponse.json(
      { 
        error: '查询余额失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}