/**
 * 简化版WMS效能分析看板服务
 * 使用模拟数据来演示功? */

import {
  WarehouseKPI,
  WarehouseOperationData,
  AggregatedWarehouseMetrics,
  DashboardFilters,
  WarehouseDashboardData,
  WAREHOUSE_KPI_DEFINITIONS,
  TimeDimension,
} from '../models/warehouse-kpi.model';

export class SimpleWarehouseDashboardService {
  /**
   * 获取仓库效能分析看板数据（使用模拟数据）
   */
  async getDashboardData(
    filters: DashboardFilters
  ): Promise<WarehouseDashboardData> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📊 生成模拟的WMS效能分析看板数据...')// 生成模拟仓库数据
      const warehouseMetrics = this.generateMockWarehouseMetrics();

      // 生成趋势数据
      const trends = this.generateMockTrends();

      // 生成告警信息
      const alerts = this.generateMockAlerts(warehouseMetrics);

      // 计算汇总统?      const summary = this.calculateMockSummary(warehouseMetrics);

      return {
        summary,
        warehouseMetrics,
        trends,
        alerts,
        filters,
      };
    } catch (error) {
      console.error('获取仓库看板数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成模拟仓库指标数据
   */
  private generateMockWarehouseMetrics(): AggregatedWarehouseMetrics[] {
    const mockWarehouses = [
      {
        id: 'wh-us-lax-001',
        name: '美国洛杉矶海外仓',
        code: 'WH-US-LAX-001',
        location: { country: '美国', city: '洛杉?, countryCode: 'US' },
      },
      {
        id: 'wh-de-fra-001',
        name: '德国法兰克福海外?,
        code: 'WH-DE-FRA-001',
        location: { country: '德国', city: '法兰克福', countryCode: 'DE' },
      },
      {
        id: 'wh-jp-tyo-001',
        name: '日本东京海外?,
        code: 'WH-JP-TYO-001',
        location: { country: '日本', city: '东京', countryCode: 'JP' },
      },
      {
        id: 'wh-uk-lon-001',
        name: '英国伦敦海外?,
        code: 'WH-UK-LON-001',
        location: { country: '英国', city: '伦敦', countryCode: 'UK' },
      },
      {
        id: 'wh-au-syd-001',
        name: '澳大利亚悉尼海外?,
        code: 'WH-AU-SYD-001',
        location: { country: '澳大利亚', city: '悉尼', countryCode: 'AU' },
      },
    ];

    return mockWarehouses.map(warehouse => {
      // 生成随机但合理的KPI指标?      const kpiMetrics: any = {};

      // 入库时效 (目标: �?0分钟)
      const inboundTimeliness = 20 + Math.random() * 25;
      kpiMetrics[WarehouseKPI.INBOUND_TIMELINESS] = {
        currentValue: inboundTimeliness,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INBOUND_TIMELINESS]
            .targetValue,
        status:
          inboundTimeliness <= 30
            ? 'excellent'
            : inboundTimeliness <= 45
              ? 'good'
              : inboundTimeliness <= 60
                ? 'warning'
                : 'critical',
      };

      // 出库时效 (目标: �?5分钟)
      const outboundTimeliness = 35 + Math.random() * 30;
      kpiMetrics[WarehouseKPI.OUTBOUND_TIMELINESS] = {
        currentValue: outboundTimeliness,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.OUTBOUND_TIMELINESS]
            .targetValue,
        status:
          outboundTimeliness <= 45
            ? 'excellent'
            : outboundTimeliness <= 60
              ? 'good'
              : outboundTimeliness <= 90
                ? 'warning'
                : 'critical',
      };

      // 库存周转?(目标: �?2�?
      const inventoryTurnover = 8 + Math.random() * 8;
      kpiMetrics[WarehouseKPI.INVENTORY_TURNOVER] = {
        currentValue: inventoryTurnover,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INVENTORY_TURNOVER]
            .targetValue,
        status:
          inventoryTurnover >= 12
            ? 'excellent'
            : inventoryTurnover >= 8
              ? 'good'
              : inventoryTurnover >= 5
                ? 'warning'
                : 'critical',
      };

      // 异常?(目标: �?%)
      const exceptionRate = 0.5 + Math.random() * 4;
      kpiMetrics[WarehouseKPI.EXCEPTION_RATE] = {
        currentValue: exceptionRate,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.EXCEPTION_RATE].targetValue,
        status:
          exceptionRate <= 2
            ? 'excellent'
            : exceptionRate <= 5
              ? 'good'
              : exceptionRate <= 10
                ? 'warning'
                : 'critical',
      };

      // 准确?(目标: �?9.5%)
      const accuracyRate = 97 + Math.random() * 2.8;
      kpiMetrics[WarehouseKPI.ACCURACY_RATE] = {
        currentValue: accuracyRate,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ACCURACY_RATE].targetValue,
        status:
          accuracyRate >= 99.5
            ? 'excellent'
            : accuracyRate >= 98
              ? 'good'
              : accuracyRate >= 95
                ? 'warning'
                : 'critical',
      };

      // 准时?(目标: �?8%)
      const onTimeRate = 95 + Math.random() * 4.8;
      kpiMetrics[WarehouseKPI.ON_TIME_RATE] = {
        currentValue: onTimeRate,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ON_TIME_RATE].targetValue,
        status:
          onTimeRate >= 98
            ? 'excellent'
            : onTimeRate >= 95
              ? 'good'
              : onTimeRate >= 90
                ? 'warning'
                : 'critical',
      };

      // 损坏?(目标: �?.5%)
      const damageRate = 0.1 + Math.random() * 1.4;
      kpiMetrics[WarehouseKPI.DAMAGE_RATE] = {
        currentValue: damageRate,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.DAMAGE_RATE].targetValue,
        status:
          damageRate <= 0.5
            ? 'excellent'
            : damageRate <= 1
              ? 'good'
              : damageRate <= 2
                ? 'warning'
                : 'critical',
      };

      // 存储利用?(目标: 85%)
      const storageUtilization = 75 + Math.random() * 20;
      kpiMetrics[WarehouseKPI.STORAGE_UTILIZATION] = {
        currentValue: storageUtilization,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.STORAGE_UTILIZATION]
            .targetValue,
        status:
          storageUtilization >= 85
            ? 'excellent'
            : storageUtilization >= 70
              ? 'good'
              : storageUtilization >= 95
                ? 'warning'
                : 'critical',
      };

      // 劳动力效?(目标: �?5订单/�?小时)
      const laborEfficiency = 18 + Math.random() * 15;
      kpiMetrics[WarehouseKPI.LABOR_EFFICIENCY] = {
        currentValue: laborEfficiency,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.LABOR_EFFICIENCY].targetValue,
        status:
          laborEfficiency >= 25
            ? 'excellent'
            : laborEfficiency >= 20
              ? 'good'
              : laborEfficiency >= 15
                ? 'warning'
                : 'critical',
      };

      // 单订单成?(目标: �?5�?
      const costPerOrder = 12 + Math.random() * 10;
      kpiMetrics[WarehouseKPI.COST_PER_ORDER] = {
        currentValue: costPerOrder,
        targetValue:
          WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.COST_PER_ORDER].targetValue,
        status:
          costPerOrder <= 15
            ? 'excellent'
            : costPerOrder <= 20
              ? 'good'
              : costPerOrder <= 25
                ? 'warning'
                : 'critical',
      };

      // 计算综合评分
      const operationalEfficiency =
        (100 -
          Math.min(inboundTimeliness, 100) +
          (100 - Math.min(outboundTimeliness, 100)) +
          inventoryTurnover * 5 +
          (100 - laborEfficiency)) /
        4;

      const serviceQuality =
        (accuracyRate +
          onTimeRate +
          (100 - damageRate * 20) +
          (100 - exceptionRate * 5)) /
        4;

      const costControl = 100 - Math.min(costPerOrder * 4, 100);

      const overallScore =
        (operationalEfficiency + serviceQuality + costControl) / 3;

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        location: warehouse.location,
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          timeDimension: TimeDimension.MONTHLY,
        },
        kpiMetrics,
        compositeScore: {
          operationalEfficiency: Math.min(
            Math.max(operationalEfficiency, 0),
            100
          ),
          serviceQuality: Math.min(Math.max(serviceQuality, 0), 100),
          costControl: Math.min(Math.max(costControl, 0), 100),
          overallScore: Math.min(Math.max(overallScore, 0), 100),
        },
      };
    });
  }

  /**
   * 生成模拟趋势数据
   */
  private generateMockTrends() {
    // 生成时间线数据（最?0天）
    const timelineData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const metrics: Partial<Record<WarehouseKPI, number>> = {};
      Object.values(WarehouseKPI).forEach(kpi => {
        // 生成略有波动的数?        const baseValue = 80 + Math.random() * 15;
        const fluctuation = (Math.random() - 0.5) * 10;
        metrics[kpi] = Math.max(0, Math.min(100, baseValue + fluctuation));
      });

      timelineData.push({
        date: date,
        metrics,
      });
    }

    // 生成仓库排名
    const warehouseRankings = [
      {
        warehouseId: 'wh-us-lax-001',
        warehouseName: '美国洛杉矶海外仓',
        overallScore: 92.5,
        rank: 1,
        improvement: 1,
      },
      {
        warehouseId: 'wh-jp-tyo-001',
        warehouseName: '日本东京海外?,
        overallScore: 90.2,
        rank: 2,
        improvement: -1,
      },
      {
        warehouseId: 'wh-de-fra-001',
        warehouseName: '德国法兰克福海外?,
        overallScore: 87.8,
        rank: 3,
        improvement: 0,
      },
      {
        warehouseId: 'wh-uk-lon-001',
        warehouseName: '英国伦敦海外?,
        overallScore: 85.3,
        rank: 4,
        improvement: 1,
      },
      {
        warehouseId: 'wh-au-syd-001',
        warehouseName: '澳大利亚悉尼海外?,
        overallScore: 82.1,
        rank: 5,
        improvement: -1,
      },
    ];

    // 生成KPI趋势分析
    const kpiTrendAnalysis = Object.entries(WAREHOUSE_KPI_DEFINITIONS).map(
      ([kpiType, definition]) => {
        const currentValue = 82 + Math.random() * 16;
        const previousValue = currentValue + (Math.random() - 0.5) * 10;
        const variance = ((currentValue - previousValue) / previousValue) * 100;
        const trend = variance > 2 ? 'up' : variance < -2 ? 'down' : 'stable';

        return {
          kpiType: kpiType as WarehouseKPI,
          kpiName: definition.name,
          currentValue,
          previousValue,
          trend: trend as 'up' | 'down' | 'stable',
          variance,
        };
      }
    );

    return {
      timelineData,
      warehouseRankings,
      kpiTrendAnalysis,
    };
  }

  /**
   * 生成模拟告警信息
   */
  private generateMockAlerts(warehouseMetrics: AggregatedWarehouseMetrics[]) {
    const alerts: any[] = [];

    warehouseMetrics.forEach(metrics => {
      Object.entries(metrics.kpiMetrics).forEach(([kpiType, kpiData]) => {
        if (kpiData.status === 'warning' || kpiData.status === 'critical') {
          const definition = WAREHOUSE_KPI_DEFINITIONS[kpiType as WarehouseKPI];
          const severity = kpiData.status === 'critical' ? 'critical' : 'high';

          alerts.push({
            type: 'threshold_breach',
            severity,
            warehouseId: metrics.warehouseId,
            warehouseName: metrics.warehouseName,
            kpiType: kpiType as WarehouseKPI,
            message: `${definition.name}超出阈? 当前?{kpiData.currentValue.toFixed(1)}${definition.unit}`,
            currentValue: kpiData.currentValue,
            thresholdValue: definition.criticalThreshold,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    return alerts;
  }

  /**
   * 计算模拟汇总统?   */
  private calculateMockSummary(warehouseMetrics: AggregatedWarehouseMetrics[]) {
    const totalWarehouses = warehouseMetrics.length;
    const activeWarehouses = warehouseMetrics.filter(
      m => m.compositeScore.overallScore > 70
    ).length;
    const totalOperationsValue = warehouseMetrics.reduce(
      (sum, m) => sum + m.compositeScore.overallScore,
      0
    );
    const avgCompositeScore =
      totalWarehouses > 0 ? totalOperationsValue / totalWarehouses : 0;

    return {
      totalWarehouses,
      activeWarehouses,
      totalOperationsValue,
      avgCompositeScore,
      periodComparison: {
        valueChange: Math.random() * 20 - 10,
        scoreChange: Math.random() * 10 - 5,
      },
    };
  }
}
