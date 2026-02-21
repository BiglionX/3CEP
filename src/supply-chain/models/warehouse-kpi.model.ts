/**
 * WMS效能分析看板 - 关键绩效指标(KPI)模型定义
 */

// 仓库运营KPI指标枚举
export enum WarehouseKPI {
  INBOUND_TIMELINESS = 'inbound_timeliness',        // 入库时效
  OUTBOUND_TIMELINESS = 'outbound_timeliness',      // 出库时效
  INVENTORY_TURNOVER = 'inventory_turnover',        // 库存周转率
  EXCEPTION_RATE = 'exception_rate',                // 异常率
  ACCURACY_RATE = 'accuracy_rate',                  // 准确率
  ON_TIME_RATE = 'on_time_rate',                    // 准时率
  DAMAGE_RATE = 'damage_rate',                      // 损坏率
  STORAGE_UTILIZATION = 'storage_utilization',      // 存储利用率
  LABOR_EFFICIENCY = 'labor_efficiency',            // 劳动力效率
  COST_PER_ORDER = 'cost_per_order'                 // 单订单成本
}

// 时间维度枚举
export enum TimeDimension {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

// KPI指标基础接口
export interface BaseKPI {
  id: string;
  name: string;
  description: string;
  unit: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  calculationMethod: string;
}

// 仓库KPI指标详细定义
export interface WarehouseKPIDefinition extends BaseKPI {
  kpiType: WarehouseKPI;
  category: 'efficiency' | 'quality' | 'cost' | 'service';
  isHigherBetter: boolean;
  benchmarkIndustryAverage?: number;
  benchmarkBestPractice?: number;
}

// 仓库运营数据接口
export interface WarehouseOperationData {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: {
    country: string;
    city: string;
    countryCode: string;
  };
  date: Date;
  
  // 入库相关指标
  inbound: {
    totalShipments: number;
    totalItems: number;
    avgProcessingTime: number; // 分钟
    onTimeRate: number;        // %
    accuracyRate: number;      // %
    exceptionCount: number;
    exceptionRate: number;     // %
  };
  
  // 出库相关指标
  outbound: {
    totalOrders: number;
    totalItems: number;
    avgPickTime: number;       // 分钟
    avgPackTime: number;       // 分钟
    avgShipTime: number;       // 分钟
    onTimeRate: number;        // %
    accuracyRate: number;      // %
    exceptionCount: number;
    exceptionRate: number;     // %
  };
  
  // 库存相关指标
  inventory: {
    totalValue: number;
    turnoverRate: number;
    accuracyRate: number;      // %
    utilizationRate: number;   // %
    obsolescenceRate: number;  // %
    safetyStockCompliance: number; // %
  };
  
  // 成本相关指标
  costs: {
    totalCost: number;
    storageCost: number;
    laborCost: number;
    equipmentCost: number;
    otherCost: number;
    costPerOrder: number;
  };
  
  // 人员相关指标
  labor: {
    totalStaff: number;
    productiveHours: number;
    ordersPerHour: number;
    itemsPerHour: number;
  };
  
  // 质量相关指标
  quality: {
    damageRate: number;        // %
    returnRate: number;        // %
    customerSatisfaction: number; // %
    complaintCount: number;
  };
}

// 聚合统计数据接口
export interface AggregatedWarehouseMetrics {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: {
    country: string;
    city: string;
    countryCode: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
    timeDimension: TimeDimension;
  };
  
  // 核心KPI指标
  kpiMetrics: {
    [key in WarehouseKPI]: {
      currentValue: number;
      targetValue: number;
      previousValue?: number;
      trend: 'up' | 'down' | 'stable';
      variance?: number; // 与上期对比变化率
      status: 'excellent' | 'good' | 'warning' | 'critical';
    }
  };
  
  // 综合评分
  compositeScore: {
    operationalEfficiency: number; // 运营效率 0-100
    serviceQuality: number;        // 服务质量 0-100
    costControl: number;           // 成本控制 0-100
    overallScore: number;          // 综合评分 0-100
  };
}

// 看板过滤条件
export interface DashboardFilters {
  warehouseIds?: string[];
  countries?: string[];
  cities?: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  timeDimension?: TimeDimension;
  kpiTypes?: WarehouseKPI[];
}

// 看板数据响应接口
export interface WarehouseDashboardData {
  summary: {
    totalWarehouses: number;
    activeWarehouses: number;
    totalOperationsValue: number;
    avgCompositeScore: number;
    periodComparison: {
      valueChange: number; // %
      scoreChange: number; // %
    };
  };
  
  warehouseMetrics: AggregatedWarehouseMetrics[];
  
  trends: {
    timelineData: Array<{
      date: Date;
      metrics: Partial<Record<WarehouseKPI, number>>;
    }>;
    
    warehouseRankings: Array<{
      warehouseId: string;
      warehouseName: string;
      overallScore: number;
      rank: number;
      improvement: number; // 排名变化
    }>;
    
    kpiTrendAnalysis: Array<{
      kpiType: WarehouseKPI;
      kpiName: string;
      currentValue: number;
      previousValue: number;
      trend: 'up' | 'down' | 'stable';
      variance: number;
    }>;
  };
  
  alerts: Array<{
    type: 'performance_warning' | 'threshold_breach' | 'operational_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    warehouseId: string;
    warehouseName: string;
    kpiType: WarehouseKPI;
    message: string;
    currentValue: number;
    thresholdValue: number;
    timestamp: Date;
  }>;
  
  filters: DashboardFilters;
}

// 导出预定义的KPI指标配置
export const WAREHOUSE_KPI_DEFINITIONS: Record<WarehouseKPI, WarehouseKPIDefinition> = {
  [WarehouseKPI.INBOUND_TIMELINESS]: {
    id: 'kpi_inbound_timeliness',
    name: '入库时效',
    description: '平均入库处理时间',
    unit: '分钟',
    kpiType: WarehouseKPI.INBOUND_TIMELINESS,
    category: 'efficiency',
    isHigherBetter: false,
    targetValue: 30,
    warningThreshold: 45,
    criticalThreshold: 60,
    calculationMethod: '总入库处理时间 ÷ 总入库单数',
    benchmarkIndustryAverage: 35,
    benchmarkBestPractice: 25
  },
  
  [WarehouseKPI.OUTBOUND_TIMELINESS]: {
    id: 'kpi_outbound_timeliness',
    name: '出库时效',
    description: '平均出库处理时间',
    unit: '分钟',
    kpiType: WarehouseKPI.OUTBOUND_TIMELINESS,
    category: 'efficiency',
    isHigherBetter: false,
    targetValue: 45,
    warningThreshold: 60,
    criticalThreshold: 90,
    calculationMethod: '(拣货时间 + 打包时间 + 发货时间) ÷ 总出库单数',
    benchmarkIndustryAverage: 55,
    benchmarkBestPractice: 35
  },
  
  [WarehouseKPI.INVENTORY_TURNOVER]: {
    id: 'kpi_inventory_turnover',
    name: '库存周转率',
    description: '库存资金周转次数',
    unit: '次/周期',
    kpiType: WarehouseKPI.INVENTORY_TURNOVER,
    category: 'efficiency',
    isHigherBetter: true,
    targetValue: 12,
    warningThreshold: 8,
    criticalThreshold: 5,
    calculationMethod: '销售成本 ÷ 平均库存价值',
    benchmarkIndustryAverage: 10,
    benchmarkBestPractice: 15
  },
  
  [WarehouseKPI.EXCEPTION_RATE]: {
    id: 'kpi_exception_rate',
    name: '异常率',
    description: '作业异常发生比例',
    unit: '%',
    kpiType: WarehouseKPI.EXCEPTION_RATE,
    category: 'quality',
    isHigherBetter: false,
    targetValue: 2,
    warningThreshold: 5,
    criticalThreshold: 10,
    calculationMethod: '异常单数 ÷ 总作业单数 × 100%',
    benchmarkIndustryAverage: 3,
    benchmarkBestPractice: 1
  },
  
  [WarehouseKPI.ACCURACY_RATE]: {
    id: 'kpi_accuracy_rate',
    name: '准确率',
    description: '作业准确率',
    unit: '%',
    kpiType: WarehouseKPI.ACCURACY_RATE,
    category: 'quality',
    isHigherBetter: true,
    targetValue: 99.5,
    warningThreshold: 98,
    criticalThreshold: 95,
    calculationMethod: '准确作业数 ÷ 总作业数 × 100%',
    benchmarkIndustryAverage: 98.5,
    benchmarkBestPractice: 99.8
  },
  
  [WarehouseKPI.ON_TIME_RATE]: {
    id: 'kpi_on_time_rate',
    name: '准时率',
    description: '按时完成作业比例',
    unit: '%',
    kpiType: WarehouseKPI.ON_TIME_RATE,
    category: 'service',
    isHigherBetter: true,
    targetValue: 98,
    warningThreshold: 95,
    criticalThreshold: 90,
    calculationMethod: '按时完成单数 ÷ 总单数 × 100%',
    benchmarkIndustryAverage: 96,
    benchmarkBestPractice: 99
  },
  
  [WarehouseKPI.DAMAGE_RATE]: {
    id: 'kpi_damage_rate',
    name: '损坏率',
    description: '货物损坏比例',
    unit: '%',
    kpiType: WarehouseKPI.DAMAGE_RATE,
    category: 'quality',
    isHigherBetter: false,
    targetValue: 0.5,
    warningThreshold: 1,
    criticalThreshold: 2,
    calculationMethod: '损坏件数 ÷ 总处理件数 × 100%',
    benchmarkIndustryAverage: 0.8,
    benchmarkBestPractice: 0.2
  },
  
  [WarehouseKPI.STORAGE_UTILIZATION]: {
    id: 'kpi_storage_utilization',
    name: '存储利用率',
    description: '仓库空间利用效率',
    unit: '%',
    kpiType: WarehouseKPI.STORAGE_UTILIZATION,
    category: 'efficiency',
    isHigherBetter: true,
    targetValue: 85,
    warningThreshold: 70,
    criticalThreshold: 95,
    calculationMethod: '已用存储空间 ÷ 总存储空间 × 100%',
    benchmarkIndustryAverage: 75,
    benchmarkBestPractice: 90
  },
  
  [WarehouseKPI.LABOR_EFFICIENCY]: {
    id: 'kpi_labor_efficiency',
    name: '劳动力效率',
    description: '人均处理订单数',
    unit: '订单/人/小时',
    kpiType: WarehouseKPI.LABOR_EFFICIENCY,
    category: 'efficiency',
    isHigherBetter: true,
    targetValue: 25,
    warningThreshold: 20,
    criticalThreshold: 15,
    calculationMethod: '总处理订单数 ÷ (员工数 × 工作小时数)',
    benchmarkIndustryAverage: 22,
    benchmarkBestPractice: 30
  },
  
  [WarehouseKPI.COST_PER_ORDER]: {
    id: 'kpi_cost_per_order',
    name: '单订单成本',
    description: '平均每订单处理成本',
    unit: '元/订单',
    kpiType: WarehouseKPI.COST_PER_ORDER,
    category: 'cost',
    isHigherBetter: false,
    targetValue: 15,
    warningThreshold: 20,
    criticalThreshold: 25,
    calculationMethod: '总运营成本 ÷ 总处理订单数',
    benchmarkIndustryAverage: 18,
    benchmarkBestPractice: 12
  }
};