/**
 * 增强版FCX购买API
 * 支持多种支付方式和完善的账户管理
 */

import { NextResponse } from 'next/server';
import { EnhancedPaymentService } from '@/fcx-system';
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

    if (amountUSD > 10000) {
      return NextResponse.json(
        { error: '单笔购买金额不能超过10000美元' },
        { status: 400 }
      );
    }

    const dto: PurchaseFcxDTO = {
      userId,
      amountUSD,
      paymentMethod
    };

    const paymentService = new EnhancedPaymentService();
    const result = await paymentService.processFcxPurchase(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          paymentId: result.paymentId,
          fcxAmount: result.fcxAmount,
          paymentStatus: result.paymentStatus,
          message: 'FCX购买成功'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '购买失败',
          details: result.errorMessage,
          paymentStatus: result.paymentStatus
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

// 获取用户支付历史
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const paymentService = new EnhancedPaymentService();
    const paymentHistory = await paymentService.getUserPaymentHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        payments: paymentHistory,
        count: paymentHistory.length
      }
    });

  } catch (error) {
    console.error('查询支付历史错误:', error);
    return NextResponse.json(
      { 
        error: '查询支付历史失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}