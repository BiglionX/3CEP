/**
 * FCX璐拱API
 */

import { NextResponse } from 'next/server';
import { PaymentService } from '@/fcx-system';
import { PurchaseFcxDTO } from '@/fcx-system/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amountUSD, paymentMethod } = body;

    // 鍙傛暟楠岃瘉
    if (!userId || !amountUSD || !paymentMethod) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: userId, amountUSD, paymentMethod' },
        { status: 400 }
      );
    }

    if (amountUSD <= 0) {
      return NextResponse.json(
        { error: '璐拱閲戦蹇呴』澶т簬0' },
        { status: 400 }
      );
    }

    const dto: PurchaseFcxDTO = {
      userId,
      amountUSD,
      paymentMethod,
    };

    const paymentService = new PaymentService();
    const result = await paymentService.processFcxPurchase(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          fcxAmount: result.fcxAmount,
          message: 'FCX璐拱鎴愬姛',
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '璐拱澶辫触',
          details: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('FCX璐拱閿欒:', error);
    return NextResponse.json(
      {
        error: '璐拱澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
