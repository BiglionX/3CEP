/**
 * 供应商向量匹配数据模? * 用于供应商智能匹配系统的向量化表示和匹配结果
 */

import { ParsedProcurementRequest, RiskLevel } from './procurement.model';

// 向量数据库类型枚?export enum VectorDbType {
  PINECONE = 'pinecone',
  WEAVIATE = 'weaviate',
}

// 供应商向量表示接?export interface SupplierVector {
  supplierId: string;
  supplierName: string;
  vector: number[]; // 向量嵌入
  metadata: {
    // 基础信息
    supplierType: string;
    country: string;
    city: string;

    // 产品信息
    productCategories: string[]; // 产品类别向量
    productKeywords: string[]; // 产品关键?
    // 性能指标
    deliveryRate: number; // 准时交货?(0-100)
    qualityRate: number; // 合格?(0-100)
    serviceScore: number; // 服务评分 (0-5)
    creditScore: number; // 信用分数 (0-100)
    rating: number; // 综合评分 (0-5)

    // 风险评估
    riskLevel: RiskLevel;
    financialRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';

    // 商务条件
    minOrderQuantity: number;
    leadTime: number; // 交货周期(�?
    paymentTerms: string[];

    // 时间?    lastUpdated: Date;
    createdAt: Date;
  };
}

// 采购需求向量表示接?export interface ProcurementRequestVector {
  requestId: string;
  vector: number[]; // 向量嵌入
  metadata: {
    // 需求特?    productCategories: string[];
    productKeywords: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    budgetRange?: {
      min: number;
      max: number;
      currency: string;
    };
    deliveryLocation?: {
      country: string;
      city: string;
    };

    // 数量要求
    totalQuantity: number;
    itemCount: number;

    // 特殊要求
    specialRequirements: string[];

    createdAt: Date;
  };
}

// 供应商匹配结果接?export interface SupplierMatchResult {
  requestId: string;
  supplierId: string;
  supplierName: string;

  // 匹配度评?  vectorSimilarity: number; // 向量相似?(0-1)
  categoryMatchScore: number; // 品类匹配?(0-100)
  priceCompetitiveness: number; // 价格竞争?(0-100)
  reliabilityScore: number; // 可靠性评?(0-100)
  qualityScore: number; // 质量评分 (0-100)
  serviceScore: number; // 服务评分 (0-100)

  // 综合评分
  matchScore: number; // 综合匹配?(0-100)
  confidence: number; // 推荐置信?(0-100)
  riskLevel: RiskLevel;

  // 匹配详情
  matchingCriteria: string[]; // 匹配的具体条?  mismatchedCriteria: string[]; // 不匹配的条件

  // 预估信息
  estimatedPrice?: number;
  estimatedDeliveryTime?: number;
  priceDeviation?: number; // 价格偏差百分?
  // 时间?  matchedAt: Date;
}

// 多因子评分权重配?export interface ScoringWeights {
  vectorSimilarity: number; // 向量相似度权?(0-1)
  categoryMatch: number; // 品类匹配权重 (0-1)
  priceCompetitiveness: number; // 价格竞争力权?(0-1)
  reliability: number; // 可靠性权?(0-1)
  quality: number; // 质量权重 (0-1)
  service: number; // 服务质量权重 (0-1)
}

// 默认评分权重配置
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  vectorSimilarity: 0.3,
  categoryMatch: 0.25,
  priceCompetitiveness: 0.2,
  reliability: 0.1,
  quality: 0.1,
  service: 0.05,
};

// 匹配请求参数
export interface MatchSuppliersRequest {
  requestId: string;
  procurementRequest: ParsedProcurementRequest;
  topK?: number; // 返回前K个匹配结果，默认5
  minScoreThreshold?: number; // 最小匹配分数阈值，默认0
  scoringWeights?: ScoringWeights; // 自定义评分权?  includePricing?: boolean; // 是否包含价格预估
  excludeSuppliers?: string[]; // 排除的供应商ID列表
}

// 匹配响应结果
export interface MatchSuppliersResponse {
  requestId: string;
  matches: SupplierMatchResult[];
  totalMatches: number;
  processingTimeMs: number;
  scoringWeights: ScoringWeights;
  matchedAt: Date;
}

// 向量数据库配?export interface VectorDbConfig {
  type: VectorDbType;
  apiKey: string;
  environment?: string; // Pinecone专用
  host?: string; // Weaviate专用
  indexName: string;
  dimension: number; // 向量维度
  metric?: 'cosine' | 'euclidean' | 'dotproduct'; // 相似度计算方?}

// 嵌入模型配置
export interface EmbeddingConfig {
  modelName: string;
  dimension: number;
  maxTokens?: number;
  batchSize?: number;
}

// 匹配质量评估指标
export interface MatchQualityMetrics {
  precision: number; // 精确?  recall: number; // 召回?  f1Score: number; // F1分数
  top1Accuracy: number; // Top1准确?  top5Accuracy: number; // Top5准确?  averageMatchScore: number; // 平均匹配分数
  processingTimeAvg: number; // 平均处理时间(ms)
}

// 匹配统计信息
export interface MatchStatistics {
  totalRequests: number;
  successfulMatches: number;
  failedMatches: number;
  averageProcessingTime: number;
  qualityMetrics: MatchQualityMetrics;
  lastUpdated: Date;
}

// 匹配日志记录
export interface MatchLog {
  id: string;
  requestId: string;
  supplierId: string;
  action:
    | 'vector_index'
    | 'match_request'
    | 'match_result'
    | 'score_calculation';
  details: any;
  timestamp: Date;
  processingTimeMs?: number;
  success: boolean;
  errorMessage?: string;
}
