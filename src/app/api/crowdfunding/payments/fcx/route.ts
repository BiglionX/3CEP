/**
 * 浼楃FCX鏀粯API
 * 澶勭悊浼楃椤圭洰涓殑FCX鏀粯璇锋眰
 */

import { supabase } from '@/lib/supabase';
import {
  CrowdfundingFcxPaymentService,
  FcxPaymentRequest,
} from '@/services/crowdfunding/fcx-payment.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '鏃犳晥鐨勮璇佷护? }, { status: 401 });
    }

    const body = await request.json();
    const { pledgeId, fcxAmount, useHybridPayment, fiatAmount } = body;

    // 鍙傛暟楠岃瘉
    if (!pledgeId || fcxAmount === undefined) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: pledgeId 锟?fcxAmount' },
        { status: 400 }
      );
    }

    if (fcxAmount <= 0) {
      return NextResponse.json(
        { error: 'FCX鏀粯閲戦蹇呴』澶т簬0' },
        { status: 400 }
      );
    }

    // 鑾峰彇鐢ㄦ埛鐨凢CX璐︽埛
    const accountService = new (
      await import('@/fcx-system')
    ).FcxAccountService();
    const account = await accountService.getAccountByUserId(user.id);

    if (!account) {
      return NextResponse.json(
        { error: '鏈壘鍒癋CX璐︽埛锛岃鍏堝垱寤鸿处? },
        { status: 404 }
      );
    }

    const paymentRequest: FcxPaymentRequest = {
      pledgeId,
      userId: user.id,
      fcxAccountId: account.id,
      fcxAmount,
      fiatAmount: fiatAmount || 0,
    };

    let result;
    if (useHybridPayment) {
      // 娣峰悎鏀粯
      result =
        await CrowdfundingFcxPaymentService.processHybridPayment(
          paymentRequest
        );
    } else {
      // 绾疐CX鏀粯
      result =
        await CrowdfundingFcxPaymentService.processFcxPayment(paymentRequest);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '鏀粯澶辫触',
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('FCX鏀粯澶勭悊閿欒:', error);
    return NextResponse.json(
      {
        error: '鏀粯澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET /api/crowdfunding/payments/fcx/balance?userId=xxx
// 鑾峰彇鐢ㄦ埛FCX浣欓
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缂哄皯userId鍙傛暟' }, { status: 400 });
    }

    const balance =
      await CrowdfundingFcxPaymentService.getUserFcxBalance(userId);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        fcxBalance: balance,
        usdValue: balance / 10, // 鍋囪10 FCX = 1 USD
      },
    });
  } catch (error) {
    console.error('鑾峰彇FCX浣欓閿欒:', error);
    return NextResponse.json(
      {
        error: '鑾峰彇浣欓澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

