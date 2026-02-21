/**
 * FCX转账API
 */

import { NextResponse } from 'next/server';
import { FcxAccountService } from '@/fcx-system';
import { FcxTransferDTO, FcxTransactionType } from '@/fcx-system/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromAccountId, toAccountId, amount, transactionType, referenceId, memo } = body;

    // 参数验证
    if (!fromAccountId || !toAccountId || !amount || !transactionType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证交易类型
    if (!Object.values(FcxTransactionType).includes(transactionType as FcxTransactionType)) {
      return NextResponse.json(
        { error: '无效的交易类型' },
        { status: 400 }
      );
    }

    const dto: FcxTransferDTO = {
      fromAccountId,
      toAccountId,
      amount,
      transactionType: transactionType as FcxTransactionType,
      referenceId,
      memo
    };

    const accountService = new FcxAccountService();
    const transaction = await accountService.transfer(dto);

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('FCX转账错误:', error);
    return NextResponse.json(
      { 
        error: '转账失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}