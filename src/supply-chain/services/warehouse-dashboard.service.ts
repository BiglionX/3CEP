/**
 * WMS效能分析看板 - 数据聚合服务
 */
import { 
  WarehouseKPI, 
  WarehouseOperationData, 
  AggregatedWarehouseMetrics, 
  DashboardFilters, 
  WarehouseDashboardData,
  WAREHOUSE_KPI_DEFINITIONS,
  TimeDimension
} from '../models/warehouse-kpi.model';
import { WarehouseService } from './warehouse.service';
import { createClient } from '@supabase/supabase-js';

export class WarehouseDashboardService {
  private warehouseService: WarehouseService;
  private supabase: any;

  constructor() {
    this.warehouseService = new WarehouseService();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 获取仓库效能分析看板数据
   */
  async getDashboardData(filters: DashboardFilters): Promise<WarehouseDashboardData> {
    try {
      // 1. 获取符合条件的仓库列表
      const warehouses = await this.getFilteredWarehouses(filters);
      
      // 2. 获取各仓库的运营数据
      const operationDataList = await this.getWarehouseOperationData(warehouses, filters);
      
      // 3. 计算聚合指标
      const aggregatedMetrics = await this.calculateAggregatedMetrics(operationDataList, filters);
      
      // 4. 生成趋势数据
      const trends = await this.generateTrendData(warehouses, filters);
      
      // 5. 生成告警信息
      const alerts = this.generateAlerts(aggregatedMetrics);
      
      // 6. 计算汇总统计
      const summary = this.calculateSummary(aggregatedMetrics, filters);
      
      return {
        summary,
        warehouseMetrics: aggregatedMetrics,
        trends,
        alerts,
        filters
      };

    } catch (error) {
      console.error('获取仓库看板数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取筛选后的仓库列表
   */
  private async getFilteredWarehouses(filters: DashboardFilters) {
    const { warehouseIds, countries, cities } = filters;
    
    // 如果指定了仓库ID，则直接查询这些仓库
    if (warehouseIds && warehouseIds.length > 0) {
      const warehouses = [];
      for (const warehouseId of warehouseIds) {
        const warehouse = await this.warehouseService.getWarehouse(warehouseId);
        if (warehouse) {
          warehouses.push(warehouse);
        }
      }
      return warehouses;
    }
    
    // 否则查询所有海外仓
    const overseasWarehouses = await this.warehouseService.listWarehouses({
      type: 'OVERSEAS' as any
    });
    
    // 应用地理位置筛选
    return overseasWarehouses.filter(warehouse => {
      const matchesCountry = !countries || countries.includes(warehouse.location.country);
      const matchesCity = !cities || cities.includes(warehouse.location.city);
      return matchesCountry && matchesCity;
    });
  }

  /**
   * 获取仓库运营数据
   */
  private async getWarehouseOperationData(warehouses: any[], filters: DashboardFilters): Promise<WarehouseOperationData[]> {
    const { dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();
    
    const operationDataList: WarehouseOperationData[] = [];
    
    for (const warehouse of warehouses) {
      // 从数据库获取实际运营数据
      const operationData = await this.fetchWarehouseOperationData(warehouse.id, startDate, endDate);
      operationDataList.push(operationData);
    }
    
    return operationDataList;
  }

  /**
   * 从数据库获取仓库运营数据
   */
  private async fetchWarehouseOperationData(warehouseId: string, startDate: Date, endDate: Date): Promise<WarehouseOperationData> {
    try {
      // 查询入库数据
      const inboundResult = await this.supabase
        .from('warehouse_operations')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .eq('operation_type', 'inbound')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // 查询出库数据
      const outboundResult = await this.supabase
        .from('warehouse_operations')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .eq('operation_type', 'outbound')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // 查询库存数据
      const inventoryResult = await this.supabase
        .from('warehouse_inventory_summary')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .gte('report_date', startDate.toISOString().split('T')[0])
        .lte('report_date', endDate.toISOString().split('T')[0]);

      // 获取仓库基本信息
      const warehouse = await this.warehouseService.getWarehouse(warehouseId);
      
      if (!warehouse) {
        throw new Error(`仓库 ${warehouseId} 不存在`);
      }

      // 计算各项指标
      return this.calculateOperationMetrics(
        warehouse,
        inboundResult.data || [],
        outboundResult.data || [],
        inventoryResult.data || [],
        startDate,
        endDate
      );

    } catch (error) {
      console.error(`获取仓库 ${warehouseId} 运营数据失败:`, error);
      // 返回模拟数据用于演示
      return this.generateMockOperationData(warehouseId, startDate, endDate);
    }
  }

  /**
   * 计算运营指标
   */
  private calculateOperationMetrics(
    warehouse: any,
    inboundData: any[],
    outboundData: any[],
    inventoryData: any[],
    startDate: Date,
    endDate: Date
  ): WarehouseOperationData {
    
    // 计算入库指标
    const inboundMetrics = this.calculateInboundMetrics(inboundData);
    
    // 计算出库指标
    const outboundMetrics = this.calculateOutboundMetrics(outboundData);
    
    // 计算库存指标
    const inventoryMetrics = this.calculateInventoryMetrics(inventoryData);
    
    // 计算成本指标（模拟数据）
    const costMetrics = this.calculateCostMetrics(inboundData.length + outboundData.length);
    
    // 计算人力指标（模拟数据）
    const laborMetrics = this.calculateLaborMetrics(outboundData.length);

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      warehouseCode: warehouse.code,
      location: {
        country: warehouse.location.country,
        city: warehouse.location.city,
        countryCode: warehouse.location.countryCode
      },
      date: new Date(),
      
      inbound: inboundMetrics,
      outbound: outboundMetrics,
      inventory: inventoryMetrics,
      costs: costMetrics,
      labor: laborMetrics,
      quality: {
        damageRate: 0.5 + Math.random() * 1.5,
        returnRate: 1 + Math.random() * 2,
        customerSatisfaction: 90 + Math.random() * 10,
        complaintCount: Math.floor(Math.random() * 5)
      }
    };
  }

  /**
   * 计算入库指标
   */
  private calculateInboundMetrics(inboundData: any[]) {
    if (inboundData.length === 0) {
      return {
        totalShipments: 0,
        totalItems: 0,
        avgProcessingTime: 0,
        onTimeRate: 0,
        accuracyRate: 0,
        exceptionCount: 0,
        exceptionRate: 0
      };
    }

    const totalItems = inboundData.reduce((sum, op) => sum + (op.item_count || 0), 0);
    const totalTime = inboundData.reduce((sum, op) => sum + (op.processing_time || 0), 0);
    const exceptions = inboundData.filter(op => op.status === 'exception').length;
    
    return {
      totalShipments: inboundData.length,
      totalItems,
      avgProcessingTime: totalTime / inboundData.length,
      onTimeRate: ((inboundData.length - exceptions) / inboundData.length) * 100,
      accuracyRate: 95 + Math.random() * 4, // 模拟准确率
      exceptionCount: exceptions,
      exceptionRate: (exceptions / inboundData.length) * 100
    };
  }

  /**
   * 计算出库指标
   */
  private calculateOutboundMetrics(outboundData: any[]) {
    if (outboundData.length === 0) {
      return {
        totalOrders: 0,
        totalItems: 0,
        avgPickTime: 0,
        avgPackTime: 0,
        avgShipTime: 0,
        onTimeRate: 0,
        accuracyRate: 0,
        exceptionCount: 0,
        exceptionRate: 0
      };
    }

    const totalItems = outboundData.reduce((sum, op) => sum + (op.item_count || 0), 0);
    const pickTime = outboundData.reduce((sum, op) => sum + (op.pick_time || 0), 0);
    const packTime = outboundData.reduce((sum, op) => sum + (op.pack_time || 0), 0);
    const shipTime = outboundData.reduce((sum, op) => sum + (op.ship_time || 0), 0);
    const exceptions = outboundData.filter(op => op.status === 'exception').length;
    
    return {
      totalOrders: outboundData.length,
      totalItems,
      avgPickTime: pickTime / outboundData.length,
      avgPackTime: packTime / outboundData.length,
      avgShipTime: shipTime / outboundData.length,
      onTimeRate: ((outboundData.length - exceptions) / outboundData.length) * 100,
      accuracyRate: 96 + Math.random() * 3, // 模拟准确率
      exceptionCount: exceptions,
      exceptionRate: (exceptions / outboundData.length) * 100
    };
  }

  /**
   * 计算库存指标
   */
  private calculateInventoryMetrics(inventoryData: any[]) {
    if (inventoryData.length === 0) {
      return {
        totalValue: 0,
        turnoverRate: 0,
        accuracyRate: 0,
        utilizationRate: 0,
        obsolescenceRate: 0,
        safetyStockCompliance: 0
      };
    }

    const latestInventory = inventoryData[inventoryData.length - 1];
    
    return {
      totalValue: latestInventory.total_value || 0,
      turnoverRate: 8 + Math.random() * 6,
      accuracyRate: 98 + Math.random() * 2,
      utilizationRate: 75 + Math.random() * 20,
      obsolescenceRate: 2 + Math.random() * 3,
      safetyStockCompliance: 90 + Math.random() * 10
    };
  }

  /**
   * 计算成本指标
   */
  private calculateCostMetrics(totalOperations: number) {
    const baseCost = 10000 + Math.random() * 20000;
    const storageCost = baseCost * 0.3;
    const laborCost = baseCost * 0.5;
    const equipmentCost = baseCost * 0.15;
    const otherCost = baseCost * 0.05;
    const costPerOrder = totalOperations > 0 ? baseCost / totalOperations : 0;
    
    return {
      totalCost: baseCost,
      storageCost,
      laborCost,
      equipmentCost,
      otherCost,
      costPerOrder
    };
  }

  /**
   * 计算人力指标
   */
  private calculateLaborMetrics(totalOrders: number) {
    const staffCount = 10 + Math.floor(Math.random() * 15);
    const productiveHours = staffCount * 8; // 假设每天8小时工作
    const ordersPerHour = totalOrders > 0 ? totalOrders / productiveHours : 0;
    const itemsPerHour = ordersPerHour * (20 + Math.random() * 30); // 平均每单20-50件
    
    return {
      totalStaff: staffCount,
      productiveHours,
      ordersPerHour,
      itemsPerHour
    };
  }

  /**
   * 生成模拟运营数据（用于演示）
   */
  private generateMockOperationData(warehouseId: string, startDate: Date, endDate: Date): WarehouseOperationData {
    const warehouse = {
      id: warehouseId,
      name: `海外仓-${Math.floor(Math.random() * 100)}`,
      code: `WH${Math.floor(Math.random() * 1000)}`,
      location: {
        country: ['美国', '德国', '日本', '英国'][Math.floor(Math.random() * 4)],
        city: ['纽约', '柏林', '东京', '伦敦'][Math.floor(Math.random() * 4)],
        countryCode: ['US', 'DE', 'JP', 'UK'][Math.floor(Math.random() * 4)]
      }
    };

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const dailyInbound = 50 + Math.floor(Math.random() * 100);
    const dailyOutbound = 80 + Math.floor(Math.random() * 120);

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      warehouseCode: warehouse.code,
      location: warehouse.location,
      date: new Date(),
      
      inbound: {
        totalShipments: dailyInbound * days,
        totalItems: dailyInbound * days * (50 + Math.floor(Math.random() * 100)),
        avgProcessingTime: 25 + Math.random() * 20,
        onTimeRate: 92 + Math.random() * 8,
        accuracyRate: 96 + Math.random() * 4,
        exceptionCount: Math.floor(dailyInbound * days * 0.03),
        exceptionRate: 2 + Math.random() * 3
      },
      
      outbound: {
        totalOrders: dailyOutbound * days,
        totalItems: dailyOutbound * days * (30 + Math.floor(Math.random() * 50)),
        avgPickTime: 12 + Math.random() * 8,
        avgPackTime: 6 + Math.random() * 4,
        avgShipTime: 18 + Math.random() * 12,
        onTimeRate: 94 + Math.random() * 6,
        accuracyRate: 97 + Math.random() * 3,
        exceptionCount: Math.floor(dailyOutbound * days * 0.02),
        exceptionRate: 1 + Math.random() * 2
      },
      
      inventory: {
        totalValue: 500000 + Math.random() * 1000000,
        turnoverRate: 8 + Math.random() * 6,
        accuracyRate: 98 + Math.random() * 2,
        utilizationRate: 75 + Math.random() * 20,
        obsolescenceRate: 2 + Math.random() * 3,
        safetyStockCompliance: 90 + Math.random() * 10
      },
      
      costs: {
        totalCost: 80000 + Math.random() * 40000,
        storageCost: 25000 + Math.random() * 10000,
        laborCost: 40000 + Math.random() * 15000,
        equipmentCost: 10000 + Math.random() * 5000,
        otherCost: 5000 + Math.random() * 3000,
        costPerOrder: 12 + Math.random() * 8
      },
      
      labor: {
        totalStaff: 15 + Math.floor(Math.random() * 10),
        productiveHours: (15 + Math.floor(Math.random() * 10)) * 8,
        ordersPerHour: 20 + Math.random() * 10,
        itemsPerHour: 400 + Math.random() * 200
      },
      
      quality: {
        damageRate: 0.5 + Math.random() * 1.5,
        returnRate: 1 + Math.random() * 2,
        customerSatisfaction: 90 + Math.random() * 10,
        complaintCount: Math.floor(Math.random() * 5)
      }
    };
  }

  /**
   * 计算聚合指标
   */
  private async calculateAggregatedMetrics(
    operationDataList: WarehouseOperationData[], 
    filters: DashboardFilters
  ): Promise<AggregatedWarehouseMetrics[]> {
    
    const aggregatedMetrics: AggregatedWarehouseMetrics[] = [];
    
    for (const operationData of operationDataList) {
      const kpiMetrics = this.calculateKPIMetrics(operationData);
      const compositeScore = this.calculateCompositeScore(kpiMetrics);
      
      aggregatedMetrics.push({
        warehouseId: operationData.warehouseId,
        warehouseName: operationData.warehouseName,
        warehouseCode: operationData.warehouseCode,
        location: operationData.location,
        period: {
          startDate: filters.dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: filters.dateRange?.endDate || new Date(),
          timeDimension: filters.timeDimension || TimeDimension.MONTHLY
        },
        kpiMetrics,
        compositeScore
      });
    }
    
    return aggregatedMetrics;
  }

  /**
   * 计算KPI指标值
   */
  private calculateKPIMetrics(operationData: WarehouseOperationData) {
    const kpiMetrics: any = {};
    
    // 入库时效
    kpiMetrics[WarehouseKPI.INBOUND_TIMELINESS] = {
      currentValue: operationData.inbound.avgProcessingTime,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INBOUND_TIMELINESS].targetValue,
      status: this.getMetricStatus(
        operationData.inbound.avgProcessingTime,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INBOUND_TIMELINESS]
      )
    };
    
    // 出库时效
    const outboundTimeliness = operationData.outbound.avgPickTime + 
                              operationData.outbound.avgPackTime + 
                              operationData.outbound.avgShipTime;
    kpiMetrics[WarehouseKPI.OUTBOUND_TIMELINESS] = {
      currentValue: outboundTimeliness,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.OUTBOUND_TIMELINESS].targetValue,
      status: this.getMetricStatus(outboundTimeliness, WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.OUTBOUND_TIMELINESS])
    };
    
    // 库存周转率
    kpiMetrics[WarehouseKPI.INVENTORY_TURNOVER] = {
      currentValue: operationData.inventory.turnoverRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INVENTORY_TURNOVER].targetValue,
      status: this.getMetricStatus(
        operationData.inventory.turnoverRate,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.INVENTORY_TURNOVER]
      )
    };
    
    // 异常率
    const exceptionRate = (operationData.inbound.exceptionRate + operationData.outbound.exceptionRate) / 2;
    kpiMetrics[WarehouseKPI.EXCEPTION_RATE] = {
      currentValue: exceptionRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.EXCEPTION_RATE].targetValue,
      status: this.getMetricStatus(exceptionRate, WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.EXCEPTION_RATE])
    };
    
    // 准确率
    const accuracyRate = (operationData.inbound.accuracyRate + operationData.outbound.accuracyRate) / 2;
    kpiMetrics[WarehouseKPI.ACCURACY_RATE] = {
      currentValue: accuracyRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ACCURACY_RATE].targetValue,
      status: this.getMetricStatus(accuracyRate, WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ACCURACY_RATE])
    };
    
    // 准时率
    const onTimeRate = (operationData.inbound.onTimeRate + operationData.outbound.onTimeRate) / 2;
    kpiMetrics[WarehouseKPI.ON_TIME_RATE] = {
      currentValue: onTimeRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ON_TIME_RATE].targetValue,
      status: this.getMetricStatus(onTimeRate, WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.ON_TIME_RATE])
    };
    
    // 损坏率
    kpiMetrics[WarehouseKPI.DAMAGE_RATE] = {
      currentValue: operationData.quality.damageRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.DAMAGE_RATE].targetValue,
      status: this.getMetricStatus(
        operationData.quality.damageRate,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.DAMAGE_RATE]
      )
    };
    
    // 存储利用率
    kpiMetrics[WarehouseKPI.STORAGE_UTILIZATION] = {
      currentValue: operationData.inventory.utilizationRate,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.STORAGE_UTILIZATION].targetValue,
      status: this.getMetricStatus(
        operationData.inventory.utilizationRate,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.STORAGE_UTILIZATION]
      )
    };
    
    // 劳动力效率
    kpiMetrics[WarehouseKPI.LABOR_EFFICIENCY] = {
      currentValue: operationData.labor.ordersPerHour,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.LABOR_EFFICIENCY].targetValue,
      status: this.getMetricStatus(
        operationData.labor.ordersPerHour,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.LABOR_EFFICIENCY]
      )
    };
    
    // 单订单成本
    kpiMetrics[WarehouseKPI.COST_PER_ORDER] = {
      currentValue: operationData.costs.costPerOrder,
      targetValue: WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.COST_PER_ORDER].targetValue,
      status: this.getMetricStatus(
        operationData.costs.costPerOrder,
        WAREHOUSE_KPI_DEFINITIONS[WarehouseKPI.COST_PER_ORDER]
      )
    };
    
    return kpiMetrics;
  }

  /**
   * 获取指标状态
   */
  private getMetricStatus(value: number, kpiDefinition: any) {
    const { targetValue, warningThreshold, criticalThreshold, isHigherBetter } = kpiDefinition;
    
    if (isHigherBetter) {
      if (value >= targetValue) return 'excellent';
      if (value >= warningThreshold) return 'good';
      if (value >= criticalThreshold) return 'warning';
      return 'critical';
    } else {
      if (value <= targetValue) return 'excellent';
      if (value <= warningThreshold) return 'good';
      if (value <= criticalThreshold) return 'warning';
      return 'critical';
    }
  }

  /**
   * 计算综合评分
   */
  private calculateCompositeScore(kpiMetrics: any) {
    // 简化计算，实际应该根据不同权重计算
    const operationalEfficiency = (
      (100 - Math.min(kpiMetrics[WarehouseKPI.INBOUND_TIMELINESS].currentValue, 100)) +
      (100 - Math.min(kpiMetrics[WarehouseKPI.OUTBOUND_TIMELINESS].currentValue, 100)) +
      kpiMetrics[WarehouseKPI.INVENTORY_TURNOVER].currentValue * 5 +
      (100 - kpiMetrics[WarehouseKPI.LABOR_EFFICIENCY].currentValue)
    ) / 4;
    
    const serviceQuality = (
      kpiMetrics[WarehouseKPI.ACCURACY_RATE].currentValue +
      kpiMetrics[WarehouseKPI.ON_TIME_RATE].currentValue +
      (100 - kpiMetrics[WarehouseKPI.DAMAGE_RATE].currentValue * 20) +
      (100 - kpiMetrics[WarehouseKPI.EXCEPTION_RATE].currentValue * 5)
    ) / 4;
    
    const costControl = 100 - Math.min(kpiMetrics[WarehouseKPI.COST_PER_ORDER].currentValue * 4, 100);
    
    const overallScore = (operationalEfficiency + serviceQuality + costControl) / 3;
    
    return {
      operationalEfficiency: Math.min(Math.max(operationalEfficiency, 0), 100),
      serviceQuality: Math.min(Math.max(serviceQuality, 0), 100),
      costControl: Math.min(Math.max(costControl, 0), 100),
      overallScore: Math.min(Math.max(overallScore, 0), 100)
    };
  }

  /**
   * 生成趋势数据
   */
  private async generateTrendData(warehouses: any[], filters: DashboardFilters) {
    // 生成时间线数据（模拟）
    const timelineData = [];
    const days = Math.min(30, Math.ceil(
      ((filters.dateRange?.endDate.getTime() || Date.now()) - 
       (filters.dateRange?.startDate.getTime() || (Date.now() - 30 * 24 * 60 * 60 * 1000))) / 
      (24 * 60 * 60 * 1000)
    ));
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const metrics: Partial<Record<WarehouseKPI, number>> = {};
      Object.values(WarehouseKPI).forEach(kpi => {
        metrics[kpi] = 80 + Math.random() * 20; // 模拟数据
      });
      
      timelineData.push({ date, metrics });
    }
    
    // 生成仓库排名
    const warehouseRankings = warehouses.map((warehouse, index) => ({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      overallScore: 85 + Math.random() * 15,
      rank: index + 1,
      improvement: Math.floor(Math.random() * 5) - 2
    })).sort((a, b) => b.overallScore - a.overallScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    
    // 生成KPI趋势分析
    const kpiTrendAnalysis = Object.entries(WAREHOUSE_KPI_DEFINITIONS).map(([kpiType, definition]) => ({
      kpiType: kpiType as WarehouseKPI,
      kpiName: definition.name,
      currentValue: 85 + Math.random() * 15,
      previousValue: 80 + Math.random() * 15,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      variance: (Math.random() * 20) - 10
    }));
    
    return {
      timelineData,
      warehouseRankings,
      kpiTrendAnalysis
    };
  }

  /**
   * 生成告警信息
   */
  private generateAlerts(aggregatedMetrics: AggregatedWarehouseMetrics[]) {
    const alerts: any[] = [];
    
    aggregatedMetrics.forEach(metrics => {
      Object.entries(metrics.kpiMetrics).forEach(([kpiType, kpiData]) => {
        const definition = WAREHOUSE_KPI_DEFINITIONS[kpiType as WarehouseKPI];
        if (kpiData.status === 'warning' || kpiData.status === 'critical') {
          alerts.push({
            type: 'threshold_breach',
            severity: kpiData.status === 'critical' ? 'critical' : 'high',
            warehouseId: metrics.warehouseId,
            warehouseName: metrics.warehouseName,
            kpiType: kpiType as WarehouseKPI,
            message: `${definition.name}超出阈值: 当前值${kpiData.currentValue}${definition.unit}`,
            currentValue: kpiData.currentValue,
            thresholdValue: definition.criticalThreshold,
            timestamp: new Date()
          });
        }
      });
    });
    
    return alerts;
  }

  /**
   * 计算汇总统计
   */
  private calculateSummary(aggregatedMetrics: AggregatedWarehouseMetrics[], filters: DashboardFilters) {
    const totalWarehouses = aggregatedMetrics.length;
    const activeWarehouses = aggregatedMetrics.filter(m => m.compositeScore.overallScore > 70).length;
    const totalOperationsValue = aggregatedMetrics.reduce((sum, m) => sum + m.compositeScore.overallScore, 0);
    const avgCompositeScore = totalWarehouses > 0 ? totalOperationsValue / totalWarehouses : 0;
    
    return {
      totalWarehouses,
      activeWarehouses,
      totalOperationsValue,
      avgCompositeScore,
      periodComparison: {
        valueChange: (Math.random() * 20) - 10,
        scoreChange: (Math.random() * 10) - 5
      }
    };
  }
}