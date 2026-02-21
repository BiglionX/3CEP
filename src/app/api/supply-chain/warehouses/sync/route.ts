/**
 * 仓库库存同步API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';
import { SyncInventoryDTO } from '@/supply-chain/models/warehouse.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, syncType, productIds } = body;

    // 参数验证
    if (!warehouseId || !syncType) {
      return NextResponse.json(
        { error: '缺少必要参数: warehouseId, syncType' },
        { status: 400 }
      );
    }

    const dto: SyncInventoryDTO = {
      warehouseId,
      syncType,
      productIds
    };

    const warehouseService = new WarehouseService();
    const result = await warehouseService.syncInventory(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          syncRecordId: result.syncRecordId,
          message: '库存同步已启动'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '库存同步失败',
          details: result.errorMessage 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('库存同步错误:', error);
    return NextResponse.json(
      { 
        error: '同步处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}