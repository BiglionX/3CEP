/**
 * FCX购买API
 */

import { NextResponse } from 'next/server';
import { PaymentService } from '@/fcx-system';
import { PurchaseFcxDTO } from '@/fcx-system/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amountUSD, paymentMethod } = body;

    // 参数验证
    if (!userId || !amountUSD || !paymentMethod) {
      return NextResponse.json(
        { error: '缺少必要参数: userId, amountUSD, paymentMethod' },
        { status: 400 }
      );
    }

    if (amountUSD <= 0) {
      return NextResponse.json(
        { error: '购买金额必须大于0' },
        { status: 400 }
      );
    }

    const dto: PurchaseFcxDTO = {
      userId,
      amountUSD,
      paymentMethod
    };

    const paymentService = new PaymentService();
    const result = await paymentService.processFcxPurchase(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          fcxAmount: result.fcxAmount,
          message: 'FCX购买成功'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '购买失败',
          details: result.errorMessage 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('FCX购买错误:', error);
    return NextResponse.json(
      { 
        error: '购买处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}