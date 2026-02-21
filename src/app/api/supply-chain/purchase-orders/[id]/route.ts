/**
 * 采购订单详情API路由
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { PurchaseOrderService } from '@/supply-chain/services/purchase-order.service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const purchaseOrderService = new PurchaseOrderService();
    const order = await purchaseOrderService.getPurchaseOrder(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '采购订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('获取采购订单详情错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取采购订单详情失败',
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
    const { status, remarks } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: '请提供订单状态' },
        { status: 400 }
      );
    }

    const purchaseOrderService = new PurchaseOrderService();
    const order = await purchaseOrderService.updateOrderStatus(params.id, status, remarks);

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单状态更新成功'
    });

  } catch (error) {
    console.error('更新采购订单状态错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新订单状态失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: '请提供取消原因' },
        { status: 400 }
      );
    }

    const purchaseOrderService = new PurchaseOrderService();
    const order = await purchaseOrderService.cancelOrder(params.id, reason);

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单取消成功'
    });

  } catch (error) {
    console.error('取消采购订单错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '取消订单失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}