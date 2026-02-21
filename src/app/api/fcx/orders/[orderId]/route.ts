/**
 * 工单详情和操作API
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { RepairOrderService } from '@/fcx-system';
import { CompleteRepairOrderDTO } from '@/fcx-system/models/fcx-account.model';

interface RouteParams {
  params: {
    orderId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const orderService = new RepairOrderService();
    const order = await orderService.getOrder(params.orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('获取工单详情错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取工单详情失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const body = await request.json();
    const { action, shopId, rating, completionNotes, cancelReason } = body;

    const orderService = new RepairOrderService();

    switch (action) {
      case 'confirm':
        if (!shopId) {
          return NextResponse.json(
            { success: false, error: '确认工单需要提供维修店ID' },
            { status: 400 }
          );
        }
        const confirmedOrder = await orderService.confirmOrder(params.orderId, shopId);
        return NextResponse.json({
          success: true,
          data: confirmedOrder,
          message: '工单确认成功'
        });

      case 'complete':
        if (rating === undefined) {
          return NextResponse.json(
            { success: false, error: '完成工单需要提供评分' },
            { status: 400 }
          );
        }
        const completeDto: CompleteRepairOrderDTO = {
          orderId: params.orderId,
          rating,
          completionNotes
        };
        const completedOrder = await orderService.completeOrder(completeDto);
        return NextResponse.json({
          success: true,
          data: completedOrder,
          message: '工单完成成功'
        });

      case 'cancel':
        if (!cancelReason) {
          return NextResponse.json(
            { success: false, error: '取消工单需要提供原因' },
            { status: 400 }
          );
        }
        const cancelledOrder = await orderService.cancelOrder(params.orderId, cancelReason);
        return NextResponse.json({
          success: true,
          data: cancelledOrder,
          message: '工单取消成功'
        });

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('操作工单错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '操作工单失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}