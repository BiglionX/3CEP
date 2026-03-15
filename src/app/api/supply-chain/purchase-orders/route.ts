/**
 * 閲囪喘璁㈠崟API璺敱 - 鍒楄〃鍜屽垱 */
import { NextResponse } from 'next/server';
import { PurchaseOrderService } from '@/supply-chain/services/purchase-order.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId') || undefined;
    const warehouseId = searchParams.get('warehouseId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit')
       parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
       parseInt(searchParams.get('offset')!)
      : undefined;

    const purchaseOrderService = new PurchaseOrderService();
    const orders = await purchaseOrderService.listPurchaseOrders({
      supplierId,
      warehouseId,
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('鏌ヨ閲囪喘璁㈠崟鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ閲囪喘璁㈠崟鍒楄〃澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, warehouseId } = body;

    // 鍙傛暟楠岃瘉
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涙湁鏁堢殑閲囪喘鍟嗗搧鍒楄〃' },
        { status: 400 }
      );
    }

    if (!warehouseId) {
      return NextResponse.json(
        { success: false, error: '璇烽€夋嫨鐩爣撳簱' },
        { status: 400 }
      );
    }

    // 楠岃瘉姣忎釜鍟嗗搧    for (const item of items) {
      if (
        !item.productId ||
        !item.quantity ||
        !item.supplierId ||
        !item.unitPrice
      ) {
        return NextResponse.json(
          { success: false, error: '鍟嗗搧淇℃伅涓嶅畬 },
          { status: 400 }
        );
      }
    }

    const purchaseOrderService = new PurchaseOrderService();
    const order = await purchaseOrderService.createPurchaseOrder(
      items,
      warehouseId
    );

    return NextResponse.json({
      success: true,
      data: order,
      message: '閲囪喘璁㈠崟鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓閲囪喘璁㈠崟閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓閲囪喘璁㈠崟澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

