/**
 * 采购订单API路由 - 列表和创建
 */
import { NextResponse } from 'next/server';
import { PurchaseOrderService } from '@/supply-chain/services/purchase-order.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId') || undefined;
    const warehouseId = searchParams.get('warehouseId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const purchaseOrderService = new PurchaseOrderService();
    const orders = await purchaseOrderService.listPurchaseOrders({
      supplierId,
      warehouseId,
      status,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('查询采购订单列表错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '查询采购订单列表失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, warehouseId } = body;

    // 参数验证
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供有效的采购商品列表' },
        { status: 400 }
      );
    }

    if (!warehouseId) {
      return NextResponse.json(
        { success: false, error: '请选择目标仓库' },
        { status: 400 }
      );
    }

    // 验证每个商品项
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.supplierId || !item.unitPrice) {
        return NextResponse.json(
          { success: false, error: '商品信息不完整' },
          { status: 400 }
        );
      }
    }

    const purchaseOrderService = new PurchaseOrderService();
    const order = await purchaseOrderService.createPurchaseOrder(items, warehouseId);

    return NextResponse.json({
      success: true,
      data: order,
      message: '采购订单创建成功'
    });

  } catch (error) {
    console.error('创建采购订单错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建采购订单失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}