// 市场数据相关接口定义

export interface MarketPrice {
  id: string;
  deviceModel: string;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  medianPrice?: number;
  sampleCount: number;
  source: 'xianyu' | 'zhuan_turn' | 'aggregate';
  freshnessScore: number;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketPriceCreateParams {
  deviceModel: string;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  medianPrice?: number;
  sampleCount?: number;
  source: 'xianyu' | 'zhuan_turn' | 'aggregate';
  freshnessScore?: number;
}

export interface MarketPriceUpdateParams {
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  medianPrice?: number;
  sampleCount?: number;
  freshnessScore?: number;
}

export interface MarketPriceQueryParams {
  deviceModel?: string;
  source?: 'xianyu' | 'zhuan_turn' | 'aggregate';
  minFreshness?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'collected_at' | 'freshness_score' | 'avg_price';
  sortOrder?: 'asc' | 'desc';
}

export interface PriceStatistics {
  deviceModel: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  sampleCount: number;
  source: 'xianyu' | 'zhuan_turn' | 'aggregate';
  freshnessScore: number;
  collectedAt: Date;
}

export interface AggregatedMarketData {
  deviceModel: string;
  xianyuData?: PriceStatistics;
  zhuanTurnData?: PriceStatistics;
  aggregateData?: PriceStatistics | null;
  bestSource: 'xianyu' | 'zhuan_turn' | 'aggregate';
  confidenceScore: number;
}

// 数据新鲜度计算相?export interface FreshnessConfig {
  maxAgeDays: number; // 最大有效天?  decayRate: number; // 衰减速率 (每天减少的分?
  minFreshness: number; // 最低新鲜度分数
}

// 默认新鲜度配?export const DEFAULT_FRESHNESS_CONFIG: FreshnessConfig = {
  maxAgeDays: 7,
  decayRate: 0.1,
  minFreshness: 0.3,
};

// 市场数据源接?export interface MarketDataSource {
  name: 'xianyu' | 'zhuan_turn';
  isEnabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  rateLimit: number; // 每分钟请求数
}

// 采集任务配置
export interface CollectionTaskConfig {
  intervalMinutes: number;
  targetModels: string[];
  sources: MarketDataSource[];
  batchSize: number;
  retryAttempts: number;
}
