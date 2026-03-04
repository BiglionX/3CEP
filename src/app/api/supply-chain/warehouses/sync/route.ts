/**
 * 浠撳簱搴撳瓨鍚屾API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';
import { SyncInventoryDTO } from '@/supply-chain/models/warehouse.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, syncType, productIds } = body;

    // 鍙傛暟楠岃瘉
    if (!warehouseId || !syncType) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: warehouseId, syncType' },
        { status: 400 }
      );
    }

    const dto: SyncInventoryDTO = {
      warehouseId,
      syncType,
      productIds,
    };

    const warehouseService = new WarehouseService();
    const result = await warehouseService.syncInventory(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          syncRecordId: result.syncRecordId,
          message: '搴撳瓨鍚屾宸插惎?,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '搴撳瓨鍚屾澶辫触',
          details: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('搴撳瓨鍚屾閿欒:', error);
    return NextResponse.json(
      {
        error: '鍚屾澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

