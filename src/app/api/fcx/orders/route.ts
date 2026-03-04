/**
 * 宸ュ崟绠＄悊API - 鍒涘缓鍜屾煡璇㈠伐? */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { RepairOrderService } from '@/fcx-system';
import { CreateRepairOrderDTO } from '@/modules/fcx-alliance/models/fcx-account.model';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const {
      consumerId,
      repairShopId,
      deviceInfo,
      faultDescription,
      fcxAmount,
      factoryId,
    } = body;

    // 鍙傛暟楠岃瘉
    if (
      !consumerId ||
      !repairShopId ||
      !deviceInfo ||
      !faultDescription ||
      !fcxAmount ||
      !factoryId
    ) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟' },
        { status: 400 }
      );
    }

    const dto: CreateRepairOrderDTO = {
      consumerId,
      repairShopId,
      deviceInfo,
      faultDescription,
      fcxAmount,
      factoryId,
    };

    const orderService = new RepairOrderService();
    const order = await orderService.createOrder(dto);

    return NextResponse.json({
      success: true,
      data: order,
      message: '宸ュ崟鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓宸ュ崟閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓宸ュ崟澶辫触',
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
    const consumerId = searchParams.get('consumerId') || undefined;
    const shopId = searchParams.get('shopId') || undefined;
    const status = searchParams.get('status') || undefined;

    const orderService = new RepairOrderService();
    const orders = await orderService.listOrders({
      consumerId,
      shopId,
      status: status as any,
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('鏌ヨ宸ュ崟鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ宸ュ崟澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
