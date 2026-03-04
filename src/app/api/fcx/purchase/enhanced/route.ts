/**
 * 澧炲己鐗團CX璐拱API
 * 鏀寔澶氱鏀粯鏂瑰紡鍜屽畬鍠勭殑璐︽埛绠＄悊
 */

import { NextResponse } from 'next/server';
import { EnhancedPaymentService } from '@/fcx-system';
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

    if (amountUSD > 10000) {
      return NextResponse.json(
        { error: '鍗曠瑪璐拱閲戦涓嶈兘瓒呰繃10000缇庡厓' },
        { status: 400 }
      );
    }

    const dto: PurchaseFcxDTO = {
      userId,
      amountUSD,
      paymentMethod,
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
          message: 'FCX璐拱鎴愬姛',
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '璐拱澶辫触',
          details: result.errorMessage,
          paymentStatus: result.paymentStatus,
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

// 鑾峰彇鐢ㄦ埛鏀粯鍘嗗彶
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: '缂哄皯userId鍙傛暟' },
        { status: 400 }
      );
    }

    const paymentService = new EnhancedPaymentService();
    const paymentHistory = await paymentService.getUserPaymentHistory(
      userId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: {
        payments: paymentHistory,
        count: paymentHistory.length,
      },
    });
  } catch (error) {
    console.error('鏌ヨ鏀粯鍘嗗彶閿欒:', error);
    return NextResponse.json(
      {
        error: '鏌ヨ鏀粯鍘嗗彶澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
