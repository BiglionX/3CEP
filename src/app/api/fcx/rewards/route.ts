/**
 * FCX2濂栧姳绠＄悊API
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { Fcx2RewardService, Fcx2OptionService } from '@/fcx-system';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const { action, orderId, rating, shopId, amount } = body;

    switch (action) {
      case 'calculate':
        if (!orderId || rating === undefined) {
          return NextResponse.json(
            { success: false, error: '璁＄畻濂栧姳闇€瑕佹彁渚涘伐鍗旾D鍜岃瘎 },
            { status: 400 }
          );
        }

        // 鑾峰彇宸ュ崟淇℃伅
        const { data: orderData, error: orderError } = await supabase
          .from('repair_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError || !orderData) {
          return NextResponse.json(
            { success: false, error: '宸ュ崟涓嶅 },
            { status: 404 }
          );
        }

        const rewardService = new Fcx2RewardService();
        const rewardResult = await rewardService.calculateOrderReward(
          orderData as any,
          rating
        );

        return NextResponse.json({
          success: true,
          data: rewardResult,
          message: '濂栧姳璁＄畻鎴愬姛',
        });

      case 'grant':
        if (!orderId || rating === undefined) {
          return NextResponse.json(
            { success: false, error: '鍙戞斁濂栧姳闇€瑕佹彁渚涘伐鍗旾D鍜岃瘎 },
            { status: 400 }
          );
        }

        // 鑾峰彇宸ュ崟淇℃伅
        const { data: orderData2, error: orderError2 } = await supabase
          .from('repair_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError2 || !orderData2) {
          return NextResponse.json(
            { success: false, error: '宸ュ崟涓嶅 },
            { status: 404 }
          );
        }

        const rewardService2 = new Fcx2RewardService();
        const rewardResult2 = await rewardService2.grantOrderReward(
          orderData2 as any,
          rating
        );

        return NextResponse.json({
          success: true,
          data: rewardResult2,
          message: '濂栧姳鍙戞斁鎴愬姛',
        });

      case 'redeem':
        if (!shopId || !amount) {
          return NextResponse.json(
            { success: false, error: '鍏戞崲鏈熸潈闇€瑕佹彁渚涘簵篒D鍜岄噾 },
            { status: 400 }
          );
        }

        const optionService = new Fcx2OptionService();
        await optionService.redeemOptions(shopId, amount);

        return NextResponse.json({
          success: true,
          message: '鏈熸潈鍏戞崲鎴愬姛',
        });

      default:
        return NextResponse.json(
          { success: false, error: '犳晥鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('FCX2濂栧姳鎿嶄綔閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎿嶄綔澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const action = searchParams.get('action') || 'balance';

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: '闇€瑕佹彁渚涘簵篒D' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'balance':
        const optionService = new Fcx2OptionService();
        const balance = await optionService.getShopFcx2Balance(shopId);

        return NextResponse.json({
          success: true,
          data: { balance },
          message: '鏌ヨ浣欓鎴愬姛',
        });

      case 'options':
        const optionService2 = new Fcx2OptionService();
        const options = await optionService2.listShopOptions(shopId);

        return NextResponse.json({
          success: true,
          data: options,
          count: options.length,
          message: '鏌ヨ鏈熸潈璁板綍鎴愬姛',
        });

      case 'statistics':
        const rewardService = new Fcx2RewardService();
        const stats = await rewardService.getRewardStatistics(shopId);

        return NextResponse.json({
          success: true,
          data: stats,
          message: '鏌ヨ缁熻淇℃伅鎴愬姛',
        });

      default:
        return NextResponse.json(
          { success: false, error: '犳晥鐨勬煡璇㈢被 },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏌ヨFCX2淇℃伅閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

