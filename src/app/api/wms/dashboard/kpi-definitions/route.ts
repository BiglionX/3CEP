/**
 * WMS效能分析看板 - KPI定义API接口
 * 提供预定义的KPI指标配置信息
 */

import { NextResponse } from 'next/server';
import { WAREHOUSE_KPI_DEFINITIONS, WarehouseKPI } from '@/supply-chain/models/warehouse-kpi.model';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const kpiType = searchParams.get('kpiType');

    let kpiDefinitions: any = { ...WAREHOUSE_KPI_DEFINITIONS };

    // 按分类筛选
    if (category) {
      const filteredEntries = Object.entries(kpiDefinitions).filter(
        ([_, definition]) => (definition as any).category === category
      );
      kpiDefinitions = Object.fromEntries(filteredEntries);
    }

    // 按具体KPI类型筛选
    if (kpiType && Object.values(WarehouseKPI).includes(kpiType as WarehouseKPI)) {
      const definition = WAREHOUSE_KPI_DEFINITIONS[kpiType as WarehouseKPI];
      if (definition) {
        kpiDefinitions = { [kpiType]: definition } as any;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        kpiDefinitions,
        categories: [...new Set(Object.values(WAREHOUSE_KPI_DEFINITIONS).map(def => def.category))],
        totalCount: Object.keys(kpiDefinitions).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取KPI定义失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取KPI定义失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}