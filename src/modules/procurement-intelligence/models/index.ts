// 采购智能体核心类型定?
export enum SupplierBusinessScale {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
}

export enum ProcurementStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface SupplierCapabilityScores {
  quality: number; // 质量能力 0-100
  delivery: number; // 交付能力 0-100
  price: number; // 价格竞争?0-100
  service: number; // 服务能力 0-100
  innovation: number; // 创新能力 0-100
}

export interface SupplierRiskProfile {
  financialRisk: RiskLevel;
  operationalRisk: RiskLevel;
  complianceRisk: RiskLevel;
  geopoliticalRisk: RiskLevel;
  supplyChainRisk: RiskLevel;
}

export interface MarketIntelligence {
  marketShare: number;
  growthRate: number;
  customerSatisfaction: number;
  industryRanking: number;
}

export interface ComplianceStatusInfo {
  certifications: string[];
  auditResults: AuditResult[];
  regulatoryCompliance: ComplianceStatus;
}

export interface AuditResult {
  auditDate: string;
  auditor: string;
  result: 'pass' | 'fail' | 'conditional';
  remarks?: string;
}

export interface SupplierIntelligenceProfile {
  // 基础信息
  supplierId: string;
  companyName: string;
  registrationCountry: string;
  businessScale: SupplierBusinessScale;

  // 能力画像
  capabilityScores: SupplierCapabilityScores;

  // 风险评估
  riskProfile: SupplierRiskProfile;

  // 市场表现
  marketIntelligence: MarketIntelligence;

  // 合规信息
  complianceStatus: ComplianceStatusInfo;

  // 时间?  createdAt: string;
  updatedAt: string;
}

export interface InternationalPriceIndex {
  id: string;
  commodityCode: string;
  commodityName: string;
  region: string;
  currency: string;
  price: number;
  unit: string;
  priceDate: string;
  source: string;
  confidenceLevel: number; // 0-1 信心指数
  trend: 'up' | 'down' | 'stable';
  volatility: number; // 波动?}

export interface ProcurementDecisionRecord {
  id: string;
  requestId: string;
  companyId: string;
  decisionType:
    | 'supplier_selection'
    | 'price_negotiation'
    | 'contract_approval'
    | 'risk_assessment';
  inputFactors: Record<string, any>;
  decisionOutput: any;
  confidenceScore: number; // 0-1 决策信心分数
  rationale: string;
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface SmartProcurementRequest {
  id: string;
  companyId: string;
  requesterId: string;
  description: string;
  parsedRequirements: ParsedRequirement[];
  urgency: UrgencyLevel;
  budget?: number;
  deadline?: string;
  status: ProcurementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedRequirement {
  productId: string;
  productName: string;
  quantity: number;
  specifications: Record<string, any>;
  preferredSuppliers?: string[];
  alternativeProducts?: string[];
}

export interface PriceOptimizationRecommendation {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  savingsPotential: number;
  confidenceLevel: number;
  timing: 'immediate' | 'short_term' | 'long_term';
  factors: string[];
}
