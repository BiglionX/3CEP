/**
 * 仓库容量规划API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: warehouseId } = params;

    if (!warehouseId) {
      return NextResponse.json({ error: '缺少仓库ID参数' }, { status: 400 });
    }

    const warehouseService = new WarehouseService();
    const capacityPlan =
      await warehouseService.getWarehouseCapacityPlan(warehouseId);

    if (!capacityPlan) {
      return NextResponse.json(
        { error: '仓库不存在或无法生成容量规划' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: capacityPlan,
    });
  } catch (error) {
    console.error('查询仓库容量规划错误:', error);
    return NextResponse.json(
      {
        error: '查询容量规划失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
