/**
 * 鐢ㄦ埛FCX璐︽埛浣欓鏌ヨAPI
 * 涓轰紬绛规敮浠樻彁渚涘疄鏃朵綑棰濅俊? */

import { supabase } from '@/lib/supabase';
import { CrowdfundingFcxPaymentService } from '@/services/crowdfunding/fcx-payment.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // 鑾峰彇鐢ㄦ埛FCX浣欓
    const balance = await CrowdfundingFcxPaymentService.getUserFcxBalance(
      user.id
    );

    // 鑾峰彇璐︽埛璇︾粏淇℃伅
    const accountService = new (
      await import('@/fcx-system')
    ).FcxAccountService();
    const account = await accountService.getAccountByUserId(user.id);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        fcxBalance: balance,
        usdValue: balance / 10, // 鍋囪10 FCX = 1 USD
        accountExists: !!account,
        accountId: account?.id || null,
        accountType: account?.accountType || null,
        frozenBalance: account?.frozenBalance || 0,
        availableBalance: balance,
      },
    });
  } catch (error) {
    console.error('鑾峰彇FCX璐︽埛淇℃伅閿欒:', error);
    return NextResponse.json(
      {
        error: '鑾峰彇璐︽埛淇℃伅澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

