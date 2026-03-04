/**
 * WMS鏁堣兘鍒嗘瀽鐪嬫澘 - KPI瀹氫箟API鎺ュ彛
 * 鎻愪緵棰勫畾涔夌殑KPI鎸囨爣閰嶇疆淇℃伅
 */

import { NextResponse } from 'next/server';
import {
  WAREHOUSE_KPI_DEFINITIONS,
  WarehouseKPI,
} from '@/supply-chain/models/warehouse-kpi.model';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const kpiType = searchParams.get('kpiType');

    let kpiDefinitions: any = { ...WAREHOUSE_KPI_DEFINITIONS };

    // 鎸夊垎绫荤瓫?    if (category) {
      const filteredEntries = Object.entries(kpiDefinitions).filter(
        ([_, definition]) => (definition as any).category === category
      );
      kpiDefinitions = Object.fromEntries(filteredEntries);
    }

    // 鎸夊叿浣揔PI绫诲瀷绛?    if (
      kpiType &&
      Object.values(WarehouseKPI).includes(kpiType as WarehouseKPI)
    ) {
      const definition = WAREHOUSE_KPI_DEFINITIONS[kpiType as WarehouseKPI];
      if (definition) {
        kpiDefinitions = { [kpiType]: definition } as any;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        kpiDefinitions,
        categories: [
          ...new Set(
            Object.values(WAREHOUSE_KPI_DEFINITIONS).map(def => def.category)
          ),
        ],
        totalCount: Object.keys(kpiDefinitions).length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇KPI瀹氫箟澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇KPI瀹氫箟澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

