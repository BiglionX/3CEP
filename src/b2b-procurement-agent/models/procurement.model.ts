/**
 * B2B采购智能体数据模型定? */

// 采购需求状态枚?export enum ProcurementStatus {
  DRAFT = 'draft', // 草稿
  SUBMITTED = 'submitted', // 已提?  PROCESSING = 'processing', // 处理?  MATCHING = 'matching', // 匹配?  QUOTING = 'quoting', // 询价?  NEGOTIATING = 'negotiating', // 谈判?  ACCEPTED = 'accepted', // 已接?  REJECTED = 'rejected', // 已拒?  CANCELLED = 'cancelled', // 已取?  COMPLETED = 'completed', // 已完?}

// 紧急程度枚?export enum UrgencyLevel {
  LOW = 'low', // �?  MEDIUM = 'medium', // �?  HIGH = 'high', // �?  URGENT = 'urgent', // 紧?}

// 风险等级枚举
export enum RiskLevel {
  LOW = 'low', // 低风?  MEDIUM = 'medium', // 中风?  HIGH = 'high', // 高风?}

// 采购物品类型
export interface ProcurementItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  specifications?: string;
  requiredQuality?: string;
  estimatedUnitPrice?: number;
  totalPrice?: number;
}

// 输入类型枚举
export enum InputType {
  TEXT = 'text', // 文本输入
  IMAGE = 'image', // 图片输入
  LINK = 'link', // 链接输入
}

// 原始采购需?export interface RawProcurementRequest {
  id: string;
  companyId: string;
  requesterId: string;
  input: string; // 用户输入内容（文?图片URL/链接?  inputType: InputType; // 输入类型
  rawDescription?: string; // 原始文本描述（如果是图片或链接，这里存储OCR或抓取的文本?  imageUrl?: string; // 图片URL（如果输入是图片?  sourceUrl?: string; // 原始链接（如果输入是链接?  extractedContent?: string; // 提取的内容（OCR识别或网页抓取结果）
  attachments?: string[]; // 附件URL列表
  metadata?: Record<string, any>; // 额外的元数据
  createdAt: Date;
  updatedAt: Date;
}

// 解析后的采购需?export interface ParsedProcurementRequest {
  id: string;
  rawRequestId: string;
  companyId: string;
  requesterId: string;
  inputType: InputType; // 原始输入类型
  items: ProcurementItem[];
  urgency: UrgencyLevel;
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  deliveryDeadline?: Date;
  deliveryLocation?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  specialRequirements?: string[];
  imageUrl?: string; // 图片链接（如果原始输入是图片?  sourceUrl?: string; // 原始链接（如果原始输入是链接?  extractedContent?: string; // 提取的内?  processingContext?: {
    // 处理上下文信?    modelUsed: string; // 使用的模?    confidenceLevel: string; // 置信度等?    processingSteps: string[]; // 处理步骤
  };
  status: ProcurementStatus;
  aiConfidence: number; // AI解析置信?0-100
  parsedAt: Date;
  processingTimeMs: number; // 处理耗时
}

// 供应商匹配项
export interface SupplierMatch {
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number; // 供应商综合评?0-5
  matchScore: number; // 匹配度评?0-100
  priceQuote?: number;
  estimatedDeliveryTime: number; // 预估交付天数
  reliabilityScore: number; // 供应商可靠性评?0-100
  qualityScore: number; // 质量评分 0-100
  serviceScore: number; // 服务评分 0-100
  riskLevel: RiskLevel;
  matchingCriteria: string[]; // 匹配的具体条?  confidence: number; // 推荐置信?0-100
  createdAt: Date;
}

// 询价记录
export interface PriceInquiry {
  id: string;
  requestId: string;
  supplierId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    quotedPrice: number;
    unit: string;
    specifications?: string;
  }>;
  totalAmount: number;
  currency: string;
  validityPeriod?: Date; // 报价有效?  deliveryTerms?: string;
  paymentTerms?: string;
  status:
    | 'sent'
    | 'responded'
    | 'negotiating'
    | 'accepted'
    | 'rejected'
    | 'expired';
  sentAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
}

// 谈判轮次
export interface NegotiationRound {
  round: number;
  supplierId: string;
  offer: {
    price: number;
    deliveryTime: number;
    terms: string;
  };
  counterOffer?: {
    price: number;
    deliveryTime: number;
    terms: string;
  };
  status: 'proposed' | 'countered' | 'accepted' | 'rejected';
  timestamp: Date;
  notes?: string;
}

// 风险评估报告
export interface RiskAssessment {
  supplierId: string;
  assessmentId: string;
  overallRiskScore: number; // 综合风险评分 0-100
  riskLevel: RiskLevel;
  financialRisk: {
    score: number;
    factors: string[];
    analysis: string;
  };
  operationalRisk: {
    score: number;
    factors: string[];
    analysis: string;
  };
  qualityRisk: {
    score: number;
    factors: string[];
    analysis: string;
  };
  marketRisk: {
    score: number;
    factors: string[];
    analysis: string;
  };
  assessedAt: Date;
  validUntil: Date;
}

// 采购策略建议
export interface ProcurementStrategy {
  requestId: string;
  recommendedApproach: 'single_source' | 'multi_source' | 'competitive_bidding';
  recommendedSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    weight: number; // 推荐权重 0-1
    rationale: string;
  }>;
  timingRecommendation: {
    optimalOrderTime: Date;
    urgencyJustification: string;
  };
  budgetOptimization: {
    suggestedBudget: number;
    savingsPotential: number;
    costBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  riskMitigation: string[];
  confidence: number; // 策略置信?0-100
  generatedAt: Date;
}

// 采购历史记录
export interface ProcurementHistory {
  id: string;
  companyId: string;
  requestId: string;
  supplierId: string;
  items: ProcurementItem[];
  finalPrice: number;
  actualDeliveryTime: number; // 实际交付天数
  qualityRating?: number; // 质量评分 1-5
  supplierPerformance: {
    onTimeDelivery: boolean;
    qualitySatisfaction: boolean;
    communicationRating: number;
  };
  createdAt: Date;
  completedAt: Date;
}

// AI处理日志
export interface ProcessingLog {
  id: string;
  requestId: string;
  processingStep:
    | 'parsing'
    | 'matching'
    | 'pricing'
    | 'risk_assessment'
    | 'strategy_generation';
  input: any;
  output: any;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

// 所有接口已在上方分别导?// 可以通过 import { InterfaceName } from './procurement.model' 使用
