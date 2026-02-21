/**
 * 供应链库存查询API
 */

import { NextResponse } from 'next/server';
import { InventoryService } from '@/supply-chain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: any = {};
    
    // 解析查询参数
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
      count: inventoryList.length
    });

  } catch (error) {
    console.error('查询库存错误:', error);
    return NextResponse.json(
      { 
        error: '查询库存失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, warehouseId, quantityChange, reason, referenceNumber } = body;

    // 参数验证
    if (!productId || !warehouseId || quantityChange === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数: productId, warehouseId, quantityChange' },
        { status: 400 }
      );
    }

    const dto = {
      productId,
      warehouseId,
      quantityChange,
      reason: reason || '库存调整',
      referenceNumber: referenceNumber || ''
    };

    const inventoryService = new InventoryService();
    const movement = await inventoryService.adjustInventory(dto);

    return NextResponse.json({
      success: true,
      data: movement,
      message: '库存调整成功'
    });

  } catch (error) {
    console.error('调整库存错误:', error);
    return NextResponse.json(
      { 
        error: '库存调整失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}