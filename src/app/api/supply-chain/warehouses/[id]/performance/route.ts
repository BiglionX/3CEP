/**
 * 仓库绩效报告API
 */

import { NextResponse } from 'next/server';
import { WarehouseService } from '@/supply-chain';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: warehouseId } = params;
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!warehouseId) {
      return NextResponse.json({ error: '缺少仓库ID参数' }, { status: 400 });
    }

    // 设置默认时间范围（最近30天）
    const endDate = endDateStr  new Date(endDateStr) : new Date();
    const startDate = startDateStr
       new Date(startDateStr)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const warehouseService = new WarehouseService();
    const performanceReport = await warehouseService.generatePerformanceReport(
      warehouseId,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: performanceReport,
    });
  } catch (error) {
    console.error('生成仓库绩效报告错误:', error);
    return NextResponse.json(
      {
        error: '生成绩效报告失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
