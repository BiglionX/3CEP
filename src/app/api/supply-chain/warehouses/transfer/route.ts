/**
 * 璺ㄤ粨璋冩嫧API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';
import { CreateTransferDTO } from '@/supply-chain/models/warehouse.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fromWarehouseId,
      toWarehouseId,
      items,
      priority,
      estimatedDeparture,
      logisticsProvider,
    } = body;

    // 鍙傛暟楠岃瘉
    if (
      !fromWarehouseId ||
      !toWarehouseId ||
      !items ||
      !priority ||
      !estimatedDeparture ||
      !logisticsProvider
    ) {
      return NextResponse.json(
        {
          error:
            '缂哄皯蹇呰鍙傛暟: fromWarehouseId, toWarehouseId, items, priority, estimatedDeparture, logisticsProvider',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '璋冩嫧鍟嗗搧鍒楄〃涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    const dto: CreateTransferDTO = {
      fromWarehouseId,
      toWarehouseId,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitValue: item.unitValue,
      })),
      priority,
      estimatedDeparture: new Date(estimatedDeparture),
      logisticsProvider,
    };

    const warehouseService = new WarehouseService();
    const result = await warehouseService.createInterWarehouseTransfer(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transferId: result.transferId,
          transferNumber: result.transferNumber,
          message: '璺ㄤ粨璋冩嫧鍒涘缓鎴愬姛',
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '鍒涘缓璋冩嫧澶辫触',
          details: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('璺ㄤ粨璋冩嫧閿欒:', error);
    return NextResponse.json(
      {
        error: '璋冩嫧澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

