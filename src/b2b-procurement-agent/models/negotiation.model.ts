/**
 * 智能议价引擎数据模型定义
 */

// 议价策略类型枚举
export enum StrategyType {
  PRICE_BASED = 'price_based', // 价格基础策略
  QUALITY_BASED = 'quality_based', // 质量基础策略
  RELATIONSHIP_BASED = 'relationship_based', // 关系基础策略
  URGENCY_BASED = 'urgency_based', // 紧急程度基础策略
}

// 议价状态枚?export enum NegotiationStatus {
  SUCCESS = 'success', // 成功
  FAILED = 'failed', // 失败
  ONGOING = 'ongoing', // 进行?  CANCELLED = 'cancelled', // 已取?}

// 议价会话状态枚?export enum SessionStatus {
  PENDING = 'pending', // 待处?  NEGOTIATING = 'negotiating', // 谈判?  SUCCESS = 'success', // 成功
  FAILED = 'failed', // 失败
  CANCELLED = 'cancelled', // 已取?}

// 策略触发条件接口
export interface StrategyConditions {
  minDiscountRate?: number; // 最小折扣率 (%)
  maxPriceDeviation?: number; // 最大价格偏?(%)
  supplierRatingThreshold?: number; // 供应商评分阈?  transactionCountThreshold?: number; // 交易次数阈?  urgencyLevel?: string; // 紧急程?  maxRounds?: number; // 最大议价轮?  successfulNegotiationsRatio?: number; // 成功议价比例阈?  priceCompetitivenessThreshold?: number; // 价格竞争力阈?}

// 策略执行动作接口
export interface StrategyActions {
  priceAdjustment?: number; // 价格调整幅度 (%)
  deliveryTimeFlexibility?: number; // 交期灵活?(�?
  paymentTerms?: string; // 付款条件
  additionalServices?: string[]; // 附加服务
  qualityGuarantee?: string; // 质量保证
  fastDelivery?: boolean; // 快速交?  longTermContract?: boolean; // 长期合同
  extendedWarranty?: boolean; // 延长保修
}

// 议价策略模型
export interface NegotiationStrategy {
  id: string;
  name: string;
  description?: string;
  strategyType: StrategyType;
  conditions: StrategyConditions;
  actions: StrategyActions;
  priority: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 议价会话模型
export interface NegotiationSession {
  id: string;
  sessionId: string;
  procurementRequestId: string;
  supplierId: string;
  quotationRequestId?: string;
  targetPrice: number;
  initialQuote: number;
  currentRound: number;
  maxRounds: number;
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  finalDiscountRate?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 议价回合记录
export interface NegotiationRound {
  round: number;
  timestamp: Date;
  ourInitialOffer: number;
  supplierQuote: number;
  ourCounterOffer: number;
  strategyUsed: string;
  confidenceLevel: number;
  remarks?: string;
}

// 议价历史记录模型
export interface NegotiationHistory {
  id: string;
  procurementRequestId?: string;
  supplierId: string;
  quotationRequestId?: string;
  sessionId: string;
  roundNumber: number;
  ourInitialOffer?: number;
  supplierQuote?: number;
  ourCounterOffer?: number;
  finalPrice?: number;
  negotiationStatus: NegotiationStatus;
  discountRate?: number;
  negotiationDuration?: number;
  strategyUsed?: string;
  confidenceLevel?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 供应商评分模?export interface SupplierRating {
  id: string;
  supplierId: string;
  transactionCount: number;
  successfulNegotiations: number;
  averageDiscountRate: number;
  afterSalesRate: number;
  priceCompetitiveness: number;
  deliveryReliability: number;
  qualityScore: number;
  overallRating: number;
  lastTransactionDate?: Date;
  lastUpdated: Date;
}

// 供应商综合信息（包含评分?export interface SupplierWithRating {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  rating?: SupplierRating;
}

// 议价启动请求DTO
export interface StartNegotiationDTO {
  procurementRequestId: string;
  supplierId: string;
  quotationRequestId?: string;
  targetPrice: number;
  initialQuote: number;
  maxRounds?: number;
  strategyPreferences?: string[]; // 偏好策略类型
}

// 议价回合请求DTO
export interface NegotiationRoundDTO {
  sessionId: string;
  supplierQuote: number;
  roundRemarks?: string;
}

// 议价结果响应
export interface NegotiationResult {
  sessionId: string;
  status: NegotiationStatus;
  finalPrice?: number;
  discountRate?: number;
  totalRounds: number;
  totalTimeMinutes?: number;
  strategyUsed?: string;
  success: boolean;
  message: string;
}

// 供应商推荐结?export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  score: number; // 推荐得分 0-100
  transactionCount: number;
  averageDiscountRate: number;
  afterSalesRate: number;
  priceCompetitiveness: number;
  reasons: string[]; // 推荐理由
}

// 议价统计数据
export interface NegotiationStats {
  totalSessions: number;
  successfulSessions: number;
  successRate: number;
  averageDiscountRate: number;
  averageDuration: number;
  strategyUsage: Record<string, number>; // 策略使用统计
  supplierPerformance: Record<
    string,
    {
      sessions: number;
      successRate: number;
      avgDiscount: number;
    }
  >;
}

// 议价策略评估结果
export interface StrategyEvaluation {
  strategyId: string;
  strategyName: string;
  matchScore: number; // 匹配度得?0-100
  recommendedActions: StrategyActions;
  confidence: number; // 置信?0-100
  reasoning: string; // 推荐理由
}

// 议价建议
export interface NegotiationAdvice {
  recommendedPrice: number;
  confidence: number;
  strategyToUse: string;
  alternativeStrategies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  expectedDiscount: number;
  timeEstimate: number; // 预估所需时间(分钟)
}
