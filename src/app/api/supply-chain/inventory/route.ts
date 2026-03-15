/**
 * 渚涘簲惧簱瀛樻煡璇PI
 */

import { NextResponse } from 'next/server';
import { InventoryService } from '@/supply-chain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params: any = {};

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    if (searchParams.get('productId')) {
      params.productId = searchParams.get('productId');
    }

    if (searchParams.get('warehouseId')) {
      params.warehouseId = searchParams.get('warehouseId');
    }

    if (searchParams.get('category')) {
      params.category = searchParams.get('category');
    }

    if (searchParams.get('status')) {
      params.status = searchParams.get('status');
    }

    if (searchParams.get('minQuantity')) {
      params.minQuantity = parseInt(searchParams.get('minQuantity') || '0');
    }

    if (searchParams.get('maxQuantity')) {
      params.maxQuantity = parseInt(searchParams.get('maxQuantity') || '0');
    }

    if (searchParams.get('limit')) {
      params.limit = parseInt(searchParams.get('limit') || '50');
    }

    if (searchParams.get('offset')) {
      params.offset = parseInt(searchParams.get('offset') || '0');
    }

    const inventoryService = new InventoryService();
    const inventoryList = await inventoryService.listInventory(params);

    return NextResponse.json({
      success: true,
      data: inventoryList,
      count: inventoryList.length,
    });
  } catch (error) {
    console.error('鏌ヨ搴撳閿欒:', error);
    return NextResponse.json(
      {
        error: '鏌ヨ搴撳澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, warehouseId, quantityChange, reason, referenceNumber } =
      body;

    // 鍙傛暟楠岃瘉
    if (!productId || !warehouseId || quantityChange === undefined) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: productId, warehouseId, quantityChange' },
        { status: 400 }
      );
    }

    const dto = {
      productId,
      warehouseId,
      quantityChange,
      reason: reason || '搴撳璋冩暣',
      referenceNumber: referenceNumber || '',
    };

    const inventoryService = new InventoryService();
    const movement = await inventoryService.adjustInventory(dto);

    return NextResponse.json({
      success: true,
      data: movement,
      message: '搴撳璋冩暣鎴愬姛',
    });
  } catch (error) {
    console.error('璋冩暣搴撳閿欒:', error);
    return NextResponse.json(
      {
        error: '搴撳璋冩暣澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
