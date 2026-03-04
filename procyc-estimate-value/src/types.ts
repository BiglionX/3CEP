/**
 * ProCyc Estimate Value Skill - 设备估价技能
 */

export interface EstimateValueInput {
  deviceQrcodeId: string;
  includeBreakdown?: boolean;
  useMarketData?: boolean;
  currency?: 'CNY' | 'FCX' | 'USD';
}

export interface DeviceInfo {
  qrcodeId: string;
  productModel: string;
  brandName: string;
  productCategory: string;
  manufacturingDate?: string;
  purchasePrice?: number;
}

export interface Valuation {
  baseValue: number;
  componentScore: number;
  conditionMultiplier: number;
  finalValue: number;
  currency: string;
}

export interface ValuationBreakdown {
  originalPrice: number;
  depreciation: number;
  componentAdjustment: number;
  conditionAdjustment: number;
  brandAdjustment: number;
  ageAdjustment: number;
  repairAdjustment: number;
}

export interface MarketComparison {
  marketAveragePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  confidence: number;
}

export interface EstimateValueOutput {
  success: boolean;
  data: {
    deviceInfo: DeviceInfo;
    valuation: Valuation;
    breakdown?: ValuationBreakdown;
    marketComparison?: MarketComparison;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
    dataSource: string;
    algorithmVersion: string;
  };
}

export interface SkillHandler {
  execute(input: EstimateValueInput): Promise<EstimateValueOutput>;
}
