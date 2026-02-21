/**
 * 智能推荐引擎数据模型
 * 包含地理位置推荐、库存优化、供应商匹配等核心功能
 */

// 推荐类型枚举
export enum RecommendationType {
  WAREHOUSE_LOCATION = 'warehouse_location',    // 仓库位置推荐
  INVENTORY_OPTIMIZATION = 'inventory_optimization', // 库存优化推荐
  SUPPLIER_MATCHING = 'supplier_matching',      // 供应商匹配推荐
  REPLENISHMENT_SUGGESTION = 'replenishment_suggestion', // 补货建议
  PRICING_STRATEGY = 'pricing_strategy'         // 定价策略推荐
}

// 地理位置坐标接口
export interface GeoLocation {
  lat: number;    // 纬度
  lng: number;    // 经度
}

// 用户位置信息接口
export interface UserLocation {
  coordinates: GeoLocation;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
}

// 仓库推荐结果接口
export interface WarehouseRecommendation {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: GeoLocation;
  distance: number;              // 距离用户位置(km)
  estimatedDeliveryTime: number; // 预计配送时间(小时)
  shippingCost: number;          // 运费估算
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  availableQuantity: number;
  productPrices: Array<{
    productId: string;
    price: number;
    discount?: number;
  }>;
  serviceScore: number;          // 服务质量评分(0-100)
  reliabilityScore: number;      // 可靠性评分(0-100)
  recommendationScore: number;   // 综合推荐得分(0-100)
  reasons: string[];             // 推荐理由
  createdAt: Date;
}

// 库存优化建议接口
export interface InventoryOptimizationSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedStock: number;
  safetyStock: number;
  reorderPoint: number;
  maxStock: number;
  stockTurnoverRate: number;     // 库存周转率
  obsolescenceRisk: 'low' | 'medium' | 'high'; // 呆滞风险
  optimizationType: 'increase' | 'decrease' | 'maintain';
  reason: string;
  estimatedImpact: {
    costSaving: number;          // 预估节省成本
    serviceLevelImprovement: number; // 服务水平提升(%)
  };
  priority: 'high' | 'medium' | 'low';
  implementationSteps: string[];
  createdAt: Date;
}

// 供应商匹配推荐接口
export interface SupplierMatchRecommendation {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierRating: number;        // 供应商评分(0-5)
  creditLevel: 'A' | 'B' | 'C' | 'D';
  distance: number;              // 距离(km)
  leadTime: number;              // 交货周期(天)
  unitPrice: number;             // 单价
  moq: number;                   // 最小起订量
  qualityScore: number;          // 质量评分(0-100)
  deliveryReliability: number;   // 交付可靠性(0-100)
  serviceScore: number;          // 服务评分(0-100)
  totalScore: number;            // 综合得分(0-100)
  matchReasons: string[];        // 匹配理由
  riskFactors: string[];         // 风险因素
  certifications: string[];      // 拥有的认证
  createdAt: Date;
}

// 补货建议接口
export interface ReplenishmentSuggestion {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  optimalOrderQuantity: number;  // 经济订货量(EOQ)
  forecastedDemand: number;      // 预测需求
  demandVariance: number;        // 需求波动
  supplierLeadTime: number;      // 供应商交货时间(天)
  holdingCost: number;           // 持有成本
  orderingCost: number;          // 订购成本
  shortageCost: number;          // 缺货成本
  urgency: 'immediate' | 'soon' | 'planned';
  recommendationReason: string;
  costAnalysis: {
    totalAnnualCost: number;
    holdingCostComponent: number;
    orderingCostComponent: number;
    shortageCostComponent: number;
  };
  createdAt: Date;
}

// 定价策略推荐接口
export interface PricingStrategyRecommendation {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  competitorPrices: number[];
  marketPosition: 'premium' | 'competitive' | 'discount';
  priceElasticity: number;       // 价格弹性系数
  demandForecast: number;        // 需求预测
  profitMargin: number;          // 利润率(%)
  competitiveAdvantage: string;  // 竞争优势描述
  strategyType: 'penetration' | 'skimming' | 'competitive' | 'cost_plus';
  implementationTimeline: string;// 实施时间线
  expectedOutcomes: {
    revenueIncrease: number;     // 预期收入增长(%)
    marketShareGain: number;     // 市场份额提升(%)
    customerAcquisition: number; // 客户获取数量
  };
  riskAssessment: {
    cannibalizationRisk: 'low' | 'medium' | 'high';
    competitorResponseRisk: 'low' | 'medium' | 'high';
    marginPressureRisk: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
}

// 推荐上下文接口
export interface RecommendationContext {
  userId?: string;
  userLocation?: UserLocation;
  productIds: string[];
  quantities?: Record<string, number>;
  budgetConstraints?: number;
  deliveryTimeConstraints?: number; // 小时
  qualityRequirements?: string;
  seasonalityFactors?: Record<string, number>; // 季节性因子
  historicalData?: {
    purchaseHistory?: any[];
    browsingHistory?: any[];
    searchHistory?: any[];
  };
  businessRules?: {
    minimumOrderQuantity?: number;
    maximumShippingCost?: number;
    preferredSuppliers?: string[];
    excludedSuppliers?: string[];
  };
  optimizationGoals?: Array<'cost_minimization' | 'delivery_speed' | 'quality_maximization' | 'risk_reduction'>;
}

// 推荐结果接口
export interface RecommendationResult<T> {
  type: RecommendationType;
  requestId: string;
  context: RecommendationContext;
  recommendations: T[];
  metadata: {
    generationTime: Date;
    processingTimeMs: number;
    confidenceScore: number;     // 整体置信度(0-100)
    algorithmVersion: string;
    dataFreshness: Date;         // 数据新鲜度
  };
  statistics: {
    totalCandidates: number;
    filteredCount: number;
    recommendedCount: number;
    averageScore: number;
  };
}

// 需求预测接口
export interface DemandForecast {
  productId: string;
  warehouseId: string;
  forecastPeriod: {
    start: Date;
    end: Date;
  };
  predictedDemand: number;
  confidenceInterval: [number, number];
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalPatterns: number[];
  externalFactors: Array<{
    factor: string;
    impact: number;              // 影响程度(-1到1)
    confidence: number;          // 置信度(0-1)
  }>;
}

// DTO定义

// 仓库推荐请求DTO
export interface WarehouseRecommendationRequest {
  userLocation: UserLocation;
  productIds: string[];
  quantities?: Record<string, number>;
  deliveryTimePreference?: number; // 小时
  budgetConstraint?: number;
  optimizationGoal?: 'fastest_delivery' | 'lowest_cost' | 'best_service' | 'balanced';
}

// 库存优化请求DTO
export interface InventoryOptimizationRequest {
  warehouseId: string;
  productIds?: string[];
  analysisPeriodDays?: number;
  optimizationStrategy?: 'cost_optimization' | 'service_level' | 'turnover_improvement';
}

// 供应商匹配请求DTO
export interface SupplierMatchingRequest {
  productRequirements: Array<{
    productId: string;
    quantity: number;
    qualityRequirements: string;
    deliveryDeadline?: Date;
  }>;
  locationPreferences?: GeoLocation;
  budgetConstraints?: number;
}

// 补货建议请求DTO
export interface ReplenishmentRequest {
  warehouseId: string;
  productIds?: string[];
  forecastHorizonDays?: number;
  serviceLevelTarget?: number; // 服务水平目标(0-1)
}

// 定价策略请求DTO
export interface PricingStrategyRequest {
  productId: string;
  marketAnalysis?: {
    competitorPrices: number[];
    marketSize: number;
    growthRate: number;
  };
  costStructure?: {
    productionCost: number;
    overheadCost: number;
    marketingCost: number;
  };
  strategicGoals?: Array<'market_share' | 'profitability' | 'penetration' | 'premium_positioning'>;
}