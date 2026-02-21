/**
 * 工单管理API - 创建和查询工单
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { RepairOrderService } from '@/fcx-system';
import { CreateRepairOrderDTO } from '@/fcx-system/models/fcx-account.model';

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
      factoryId
    } = body;

    // 参数验证
    if (!consumerId || !repairShopId || !deviceInfo || !faultDescription || !fcxAmount || !factoryId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const dto: CreateRepairOrderDTO = {
      consumerId,
      repairShopId,
      deviceInfo,
      faultDescription,
      fcxAmount,
      factoryId
    };

    const orderService = new RepairOrderService();
    const order = await orderService.createOrder(dto);

    return NextResponse.json({
      success: true,
      data: order,
      message: '工单创建成功'
    });

  } catch (error) {
    console.error('创建工单错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建工单失败',
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
    const consumerId = searchParams.get('consumerId') || undefined;
    const shopId = searchParams.get('shopId') || undefined;
    const status = searchParams.get('status') || undefined;

    const orderService = new RepairOrderService();
    const orders = await orderService.listOrders({
      consumerId,
      shopId,
      status: status as any
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('查询工单列表错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '查询工单失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}