/**
 * FCX2奖励管理API
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
            { success: false, error: '计算奖励需要提供工单ID和评分' },
            { status: 400 }
          );
        }

        // 获取工单信息
        const { data: orderData, error: orderError } = await supabase
          .from('repair_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError || !orderData) {
          return NextResponse.json(
            { success: false, error: '工单不存在' },
            { status: 404 }
          );
        }

        const rewardService = new Fcx2RewardService();
        const rewardResult = await rewardService.calculateOrderReward(orderData as any, rating);

        return NextResponse.json({
          success: true,
          data: rewardResult,
          message: '奖励计算成功'
        });

      case 'grant':
        if (!orderId || rating === undefined) {
          return NextResponse.json(
            { success: false, error: '发放奖励需要提供工单ID和评分' },
            { status: 400 }
          );
        }

        // 获取工单信息
        const { data: orderData2, error: orderError2 } = await supabase
          .from('repair_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError2 || !orderData2) {
          return NextResponse.json(
            { success: false, error: '工单不存在' },
            { status: 404 }
          );
        }

        const rewardService2 = new Fcx2RewardService();
        const rewardResult2 = await rewardService2.grantOrderReward(orderData2 as any, rating);

        return NextResponse.json({
          success: true,
          data: rewardResult2,
          message: '奖励发放成功'
        });

      case 'redeem':
        if (!shopId || !amount) {
          return NextResponse.json(
            { success: false, error: '兑换期权需要提供店铺ID和金额' },
            { status: 400 }
          );
        }

        const optionService = new Fcx2OptionService();
        await optionService.redeemOptions(shopId, amount);

        return NextResponse.json({
          success: true,
          message: '期权兑换成功'
        });

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('FCX2奖励操作错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '操作失败',
        details: (error as Error).message 
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
        { success: false, error: '需要提供店铺ID' },
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
          message: '查询余额成功'
        });

      case 'options':
        const optionService2 = new Fcx2OptionService();
        const options = await optionService2.listShopOptions(shopId);

        return NextResponse.json({
          success: true,
          data: options,
          count: options.length,
          message: '查询期权记录成功'
        });

      case 'statistics':
        const rewardService = new Fcx2RewardService();
        const stats = await rewardService.getRewardStatistics(shopId);

        return NextResponse.json({
          success: true,
          data: stats,
          message: '查询统计信息成功'
        });

      default:
        return NextResponse.json(
          { success: false, error: '无效的查询类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('查询FCX2信息错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '查询失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}