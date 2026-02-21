/**
 * 跨仓调拨API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';
import { CreateTransferDTO } from '@/supply-chain/models/warehouse.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromWarehouseId, toWarehouseId, items, priority, estimatedDeparture, logisticsProvider } = body;

    // 参数验证
    if (!fromWarehouseId || !toWarehouseId || !items || !priority || !estimatedDeparture || !logisticsProvider) {
      return NextResponse.json(
        { error: '缺少必要参数: fromWarehouseId, toWarehouseId, items, priority, estimatedDeparture, logisticsProvider' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '调拨商品列表不能为空' },
        { status: 400 }
      );
    }

    const dto: CreateTransferDTO = {
      fromWarehouseId,
      toWarehouseId,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitValue: item.unitValue
      })),
      priority,
      estimatedDeparture: new Date(estimatedDeparture),
      logisticsProvider
    };

    const warehouseService = new WarehouseService();
    const result = await warehouseService.createInterWarehouseTransfer(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transferId: result.transferId,
          transferNumber: result.transferNumber,
          message: '跨仓调拨创建成功'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '创建调拨失败',
          details: result.errorMessage 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('跨仓调拨错误:', error);
    return NextResponse.json(
      { 
        error: '调拨处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}