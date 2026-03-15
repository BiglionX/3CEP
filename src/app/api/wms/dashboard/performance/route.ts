/**
 * WMS鏁堣兘鍒嗘瀽鐪嬫澘API鎺ュ彛
 * 鎻愪緵撳簱杩愯惀KPI鏁版嵁銆佽秼鍔垮垎鏋愬拰鍛婅淇℃伅
 */

import { NextResponse } from 'next/server';
import { SimpleWarehouseDashboardService } from '@/supply-chain/services/simple-warehouse-dashboard.service';
import {
  DashboardFilters,
  TimeDimension,
  WarehouseKPI,
} from '@/supply-chain/models/warehouse-kpi.model';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 瑙ｆ瀽鏌ヨ鍙傛暟'
    const warehouseIdsParam = searchParams.get('warehouseIds');
    const countriesParam = searchParams.get('countries');
    const citiesParam = searchParams.get('cities');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const timeDimensionParam = searchParams.get('timeDimension');
    const kpiTypesParam = searchParams.get('kpiTypes');

    // 鏋勫缓杩囨护鏉′欢
    const filters: DashboardFilters = {};

    // 撳簱绛    if (warehouseIdsParam) {'
      filters.warehouseIds = warehouseIdsParam.split(',').map(id => id.trim());
    }

    // 鍦扮悊浣嶇疆绛    if (countriesParam) {
      filters.countries = countriesParam'
        .split(',')
        .map(country => country.trim());
    }

    if (citiesParam) {'
      filters.cities = citiesParam.split(',').map(city => city.trim());
    }

    // 堕棿鑼冨洿绛    if (startDateParam || endDateParam) {
      filters.dateRange = {
        startDate: startDateParam
           new Date(startDateParam)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDateParam  new Date(endDateParam) : new Date(),
      };
    }

    // 堕棿缁村害
    if (
      timeDimensionParam &&
      Object.values(TimeDimension).includes(timeDimensionParam as TimeDimension)
    ) {
      filters.timeDimension = timeDimensionParam as TimeDimension;
    } else {
      filters.timeDimension = TimeDimension.MONTHLY;
    }

    // KPI绫诲瀷绛    if (kpiTypesParam) {
      const kpiTypes = kpiTypesParam.split(',') as WarehouseKPI[];
      const validKpiTypes = kpiTypes.filter(type =>
        Object.values(WarehouseKPI).includes(type)
      );
      if (validKpiTypes.length > 0) {
        filters.kpiTypes = validKpiTypes;
      }
    }

    // 濡傛灉娌℃湁璁剧疆堕棿鑼冨洿锛屼娇鐢ㄩ粯璁ゅ€硷紙鏈€0澶╋級
    if (!filters.dateRange) {
      filters.dateRange = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      };
    }

    // 璋冪敤鏈嶅姟灞傝幏鍙栨暟    const dashboardService = new SimpleWarehouseDashboardService();
    const dashboardData = await dashboardService.getDashboardData(filters);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇WMS鏁堣兘鍒嗘瀽鐪嬫澘鏁版嵁澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鐪嬫澘鏁版嵁澶辫触',
        details: (error as Error).message,
      },
{ status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 楠岃瘉璇眰    const { filters } = body;

    if (!filters) {
      return NextResponse.json({ error: '缂哄皯杩囨护鏉′欢鍙傛暟' },
{ status: 400 });
    }

    // 楠岃瘉蹇呴渶鐨勬椂闂磋寖鍥村弬    if (!filters.dateRange) {
      return NextResponse.json(
        { error: '蹇呴』鎻愪緵堕棿鑼冨洿鍙傛暟' },
{ status: 400 }
      );
    }

    // 璋冪敤鏈嶅姟灞傝幏鍙栨暟    const dashboardService = new SimpleWarehouseDashboardService();
    const dashboardData = await dashboardService.getDashboardData(filters);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇WMS鏁堣兘鍒嗘瀽鐪嬫澘鏁版嵁澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鐪嬫澘鏁版嵁澶辫触',
        details: (error as Error).message,
      },
{ status: 500 }
    );
  }
}

