/**
 * FCX杞处API
 */

import { NextResponse } from 'next/server';
import { FcxAccountService } from '@/fcx-system';
import {
  FcxTransferDTO,
  FcxTransactionType,
} from '@/modules/fcx-alliance/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fromAccountId,
      toAccountId,
      amount,
      transactionType,
      referenceId,
      memo,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!fromAccountId || !toAccountId || !amount || !transactionType) {
      return NextResponse.json({ error: '缂哄皯蹇呰鍙傛暟' }, { status: 400 });
    }

    // 楠岃瘉浜ゆ槗绫诲瀷
    if (
      !Object.values(FcxTransactionType).includes(
        transactionType as FcxTransactionType
      )
    ) {
      return NextResponse.json({ error: '鏃犳晥鐨勪氦鏄撶被? }, { status: 400 });
    }

    const dto: FcxTransferDTO = {
      fromAccountId,
      toAccountId,
      amount,
      transactionType: transactionType as FcxTransactionType,
      referenceId,
      memo,
    };

    const accountService = new FcxAccountService();
    const transaction = await accountService.transfer(dto);

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('FCX杞处閿欒:', error);
    return NextResponse.json(
      {
        error: '杞处澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

