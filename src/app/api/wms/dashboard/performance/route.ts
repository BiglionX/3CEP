/**
 * WMS效能分析看板API接口
 * 提供仓库运营KPI数据、趋势分析和告警信息
 */

import { NextResponse } from 'next/server';
import { SimpleWarehouseDashboardService } from '@/supply-chain/services/simple-warehouse-dashboard.service';
import { 
  DashboardFilters, 
  TimeDimension,
  WarehouseKPI
} from '@/supply-chain/models/warehouse-kpi.model';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const warehouseIdsParam = searchParams.get('warehouseIds');
    const countriesParam = searchParams.get('countries');
    const citiesParam = searchParams.get('cities');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const timeDimensionParam = searchParams.get('timeDimension');
    const kpiTypesParam = searchParams.get('kpiTypes');

    // 构建过滤条件
    const filters: DashboardFilters = {};

    // 仓库筛选
    if (warehouseIdsParam) {
      filters.warehouseIds = warehouseIdsParam.split(',').map(id => id.trim());
    }

    // 地理位置筛选
    if (countriesParam) {
      filters.countries = countriesParam.split(',').map(country => country.trim());
    }

    if (citiesParam) {
      filters.cities = citiesParam.split(',').map(city => city.trim());
    }

    // 时间范围筛选
    if (startDateParam || endDateParam) {
      filters.dateRange = {
        startDate: startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDateParam ? new Date(endDateParam) : new Date()
      };
    }

    // 时间维度
    if (timeDimensionParam && Object.values(TimeDimension).includes(timeDimensionParam as TimeDimension)) {
      filters.timeDimension = timeDimensionParam as TimeDimension;
    } else {
      filters.timeDimension = TimeDimension.MONTHLY;
    }

    // KPI类型筛选
    if (kpiTypesParam) {
      const kpiTypes = kpiTypesParam.split(',') as WarehouseKPI[];
      const validKpiTypes = kpiTypes.filter(type => Object.values(WarehouseKPI).includes(type));
      if (validKpiTypes.length > 0) {
        filters.kpiTypes = validKpiTypes;
      }
    }

    // 如果没有设置时间范围，使用默认值（最近30天）
    if (!filters.dateRange) {
      filters.dateRange = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };
    }

    // 调用服务层获取数据
    const dashboardService = new SimpleWarehouseDashboardService();
    const dashboardData = await dashboardService.getDashboardData(filters);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取WMS效能分析看板数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取看板数据失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证请求体
    const { filters } = body;
    
    if (!filters) {
      return NextResponse.json(
        { error: '缺少过滤条件参数' },
        { status: 400 }
      );
    }

    // 验证必需的时间范围参数
    if (!filters.dateRange) {
      return NextResponse.json(
        { error: '必须提供时间范围参数' },
        { status: 400 }
      );
    }

    // 调用服务层获取数据
    const dashboardService = new SimpleWarehouseDashboardService();
    const dashboardData = await dashboardService.getDashboardData(filters);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取WMS效能分析看板数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取看板数据失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}