/**
 * 智能分仓引擎数据模型
 * 支持基于地理位置、库存、运费和时效的最优发货仓选择
 */

// 分仓优化请求接口
export interface WarehouseOptimizationRequest {
  deliveryAddress: {
    country: string;
    province: string;
    city: string;
    district?: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    weight?: number; // 单位重量(kg)
    dimensions?: {
      // 尺寸(cm)
      length: number;
      width: number;
      height: number;
    };
  }>;
  deliveryPreferences?: {
    maxDeliveryTime?: number; // 最大配送时?小时)
    maxBudget?: number; // 最大预?�?
    deliveryPriority?: 'fastest' | 'cheapest' | 'balanced'; // 配送优先级
  };
  orderMetadata?: {
    orderType?: 'normal' | 'express' | 'bulk';
    customerLevel?: 'regular' | 'vip' | 'premium';
    orderValue?: number;
  };
}

// 分仓优化响应接口
export interface WarehouseOptimizationResponse {
  selectedWarehouse: WarehouseSelection;
  alternativeOptions: WarehouseSelection[];
  optimizationMetrics: OptimizationMetrics;
  costAnalysis: CostAnalysis;
  deliveryEstimates: DeliveryEstimates;
  confidenceScore: number; // 信心度分?0-100)
}

// 仓库选择结果接口
export interface WarehouseSelection {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  location: {
    country: string;
    city: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  distance: number; // 距离(km)
  estimatedDeliveryTime: number; // 预计配送时?小时)
  totalCost: number; // 总成?�?
  breakdown: {
    shippingCost: number; // 运费
    handlingCost: number; // 处理?    storageCost?: number; // 存储?如有)
    insuranceCost: number; // 保险?  };
  inventoryAvailability: {
    hasSufficientStock: boolean;
    availableQuantities: Record<string, number>; // 各商品可用库?    stockStatus: 'in_stock' | 'partial_stock' | 'out_of_stock';
  };
  serviceLevel: {
    accuracyRate: number; // 准确?%)
    onTimeRate: number; // 准时?%)
    qualityScore: number; // 服务质量?0-100)
  };
  optimizationScore: number; // 优化得分(0-100)
  selectionReasons: string[]; // 选择理由
}

// 优化指标接口
export interface OptimizationMetrics {
  algorithmVersion: string;
  processingTime: number; // 处理时间(ms)
  factorsConsidered: string[]; // 考虑的因?  scoringWeights: {
    distance: number;
    inventory: number;
    cost: number;
    deliveryTime: number;
    serviceQuality: number;
  };
  improvementRate: number; // 相比随机选择的成本改善率(%)
}

// 成本分析接口
export interface CostAnalysis {
  selectedOption: {
    totalCost: number;
    costComponents: CostComponent[];
  };
  randomBaseline: {
    averageCost: number;
    costComponents: CostComponent[];
  };
  savings: {
    absolute: number; // 绝对节省金额
    percentage: number; // 节省百分?    roi: number; // 投资回报?  };
}

// 成本组件接口
export interface CostComponent {
  type: 'shipping' | 'handling' | 'storage' | 'insurance' | 'other';
  amount: number;
  description: string;
  calculationMethod: string;
}

// 配送预估接?export interface DeliveryEstimates {
  fastestOption: {
    warehouseId: string;
    deliveryTime: number;
    cost: number;
  };
  cheapestOption: {
    warehouseId: string;
    deliveryTime: number;
    cost: number;
  };
  balancedOption: {
    warehouseId: string;
    deliveryTime: number;
    cost: number;
  };
}

// 运费规则接口
export interface ShippingRateRule {
  id: string;
  warehouseId: string;
  destinationZone: {
    countries: string[];
    provinces?: string[];
    cities?: string[];
  };
  weightBrackets: Array<{
    minWeight: number; // 最小重?kg)
    maxWeight: number; // 最大重?kg)
    baseCost: number; // 基础费用
    costPerKg: number; // 超重费用(�?kg)
  }>;
  distanceBrackets?: Array<{
    minDistance: number; // 最小距?km)
    maxDistance: number; // 最大距?km)
    rate: number; // 费率系数
  }>;
  deliveryTimeEstimate: {
    baseTime: number; // 基础时间(小时)
    timePer100km: number; // �?00公里增加时间(小时)
    processingTime: number; // 处理时间(小时)
  };
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 地理位置缓存接口
export interface LocationCache {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUpdated: Date;
  accuracy: 'precise' | 'approximate';
}

// 仓库评分因子接口
export interface WarehouseScoringFactors {
  distanceScore: number; // 距离得分(0-100)
  inventoryScore: number; // 库存得分(0-100)
  costScore: number; // 成本得分(0-100)
  deliveryTimeScore: number; // 时效得分(0-100)
  serviceScore: number; // 服务得分(0-100)
  weightedScore: number; // 加权总分(0-100)
}

// 分仓决策历史接口
export interface WarehouseDecisionHistory {
  id: string;
  requestId: string;
  optimizationRequest: WarehouseOptimizationRequest;
  selectedWarehouse: WarehouseSelection;
  alternativesConsidered: WarehouseSelection[];
  decisionTimestamp: Date;
  userFeedback?: {
    satisfaction: number; // 用户满意?1-5�?
    comments?: string;
  };
  performanceTracking?: {
    actualDeliveryTime?: number;
    actualCost?: number;
    deliverySuccess?: boolean;
  };
}
