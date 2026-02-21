/**
 * 自动询价比价平台数据模型定义
 */

// 询价模板状态枚举
export enum QuotationTemplateStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

// 询价请求状态枚举
export enum QuotationRequestStatus {
  DRAFT = "draft", // 草稿
  SENT = "sent", // 已发送
  PARTIAL_RESPONSE = "partial_response", // 部分回复
  COMPLETED = "completed", // 已完成
  CANCELLED = "cancelled", // 已取消
}

// 供应商报价状态枚举
export enum SupplierQuoteStatus {
  RECEIVED = "received", // 已收到
  ACCEPTED = "accepted", // 已接受
  REJECTED = "rejected", // 已拒绝
  NEGOTIATING = "negotiating", // 谈判中
  EXPIRED = "expired", // 已过期
}

// 邮件发送状态枚举
export enum EmailStatus {
  PENDING = "pending", // 待发送
  SENT = "sent", // 已发送
  FAILED = "failed", // 发送失败
  DELIVERED = "delivered", // 已投递
  OPENED = "opened", // 已打开
}

// 询价模板接口
export interface QuotationTemplate {
  id: string;
  name: string; // 模板名称
  subject: string; // 邮件主题模板
  content: string; // 邮件内容模板
  contentType: "html" | "text"; // 内容类型
  language: "zh" | "en"; // 语言
  variables: Record<string, string>; // 模板变量定义
  isActive: boolean; // 是否激活
  createdBy: string; // 创建人ID
  createdAt: Date;
  updatedAt: Date;
}

// 询价商品项接口
export interface QuotationItem {
  id: string;
  productId?: string; // 商品ID
  productName: string; // 商品名称
  category: string; // 商品类别
  quantity: number; // 数量
  unit: string; // 单位
  specifications?: string; // 规格要求
  estimatedUnitPrice?: number; // 预估单价
  remarks?: string; // 备注
}

// 询价请求接口
export interface QuotationRequest {
  id: string;
  requestNumber: string; // 询价单号
  procurementRequestId: string; // 关联采购需求ID
  templateId?: string; // 使用的模板ID
  supplierIds: string[]; // 目标供应商IDs
  items: QuotationItem[]; // 询价商品列表
  deliveryDeadline?: Date; // 交货截止时间
  responseDeadline: Date; // 回复截止时间
  specialRequirements?: string; // 特殊要求
  status: QuotationRequestStatus; // 状态
  sentAt?: Date; // 发送时间
  completedAt?: Date; // 完成时间
  createdBy: string; // 创建人ID
  createdAt: Date;
  updatedAt: Date;
}

// 供应商报价接口
export interface SupplierQuote {
  id: string;
  quotationRequestId: string; // 关联询价请求ID
  supplierId: string; // 供应商ID
  quoteNumber?: string; // 报价单号
  items: QuoteItem[]; // 报价项目明细
  totalAmount: number; // 总金额
  currency: string; // 货币
  validityPeriodStart?: Date; // 有效期开始
  validityPeriodEnd?: Date; // 有效期结束
  deliveryTime?: number; // 交货时间（天）
  deliveryTerms?: string; // 交货条款
  paymentTerms?: string; // 付款条款
  warrantyTerms?: string; // 保修条款
  remarks?: string; // 备注
  status: SupplierQuoteStatus; // 状态
  receivedAt: Date; // 收到时间
  processedAt?: Date; // 处理时间
  createdAt: Date;
  updatedAt: Date;
}

// 报价项目明细接口
export interface QuoteItem {
  id: string;
  quoteId: string; // 关联报价ID
  itemId: string; // 商品ID
  itemName: string; // 商品名称
  quantity: number; // 数量
  unit: string; // 单位
  unitPrice: number; // 单价
  totalPrice: number; // 小计
  specifications?: string; // 规格说明
  remarks?: string; // 备注
  createdAt: Date;
}

// 邮件发送记录接口
export interface EmailLog {
  id: string;
  quotationRequestId: string; // 关联询价请求ID
  supplierId: string; // 供应商ID
  toAddress: string; // 收件人邮箱
  subject: string; // 邮件主题
  content: string; // 邮件内容
  status: EmailStatus; // 发送状态
  sentAt?: Date; // 发送时间
  deliveredAt?: Date; // 投递时间
  openedAt?: Date; // 打开时间
  errorMessage?: string; // 错误信息
  retryCount: number; // 重试次数
  createdAt: Date;
}

// 比价报告接口
export interface ComparisonReport {
  id: string;
  quotationRequestId: string; // 关联询价请求ID
  reportTitle: string; // 报告标题
  summary: ReportSummary; // 报告摘要
  priceAnalysis: PriceAnalysis; // 价格分析
  deliveryAnalysis: DeliveryAnalysis; // 交期分析
  riskAssessment: RiskAssessment; // 风险评估
  recommendations: Recommendation[]; // 推荐建议
  reportData: any; // 完整报告数据
  generatedAt: Date; // 生成时间
  createdBy: string; // 生成人ID
  createdAt: Date;
}

// 报告摘要接口
export interface ReportSummary {
  totalSuppliers: number; // 总供应商数
  respondedSuppliers: number; // 已回复供应商数
  averagePrice: number; // 平均价格
  lowestPrice: number; // 最低价格
  highestPrice: number; // 最高价格
  currency: string; // 货币
}

// 价格分析接口
export interface PriceAnalysis {
  priceComparison: Array<{
    supplierId: string;
    supplierName: string;
    totalPrice: number;
    priceDeviation: number; // 与平均价格的偏差百分比
    competitiveness: "high" | "medium" | "low"; // 竞争力等级
  }>;
  priceTrends: Array<{
    itemId: string;
    itemName: string;
    prices: Array<{
      supplierId: string;
      supplierName: string;
      price: number;
    }>;
  }>;
}

// 交期分析接口
export interface DeliveryAnalysis {
  deliveryTimeComparison: Array<{
    supplierId: string;
    supplierName: string;
    deliveryTime: number;
    deliveryTerms: string;
    riskLevel: "low" | "medium" | "high";
  }>;
  onTimeDeliveryRate: number; // 准时交货率
}

// 风险评估接口
export interface RiskAssessment {
  supplierRisks: Array<{
    supplierId: string;
    supplierName: string;
    riskScore: number; // 风险评分 0-100
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[]; // 风险因素
  }>;
  overallRisk: {
    score: number;
    level: "low" | "medium" | "high";
    summary: string;
  };
}

// 推荐建议接口
export interface Recommendation {
  type: "supplier" | "price" | "delivery" | "risk"; // 建议类型
  priority: "high" | "medium" | "low"; // 优先级
  content: string; // 建议内容
  rationale: string; // 建议理由
}

// 创建询价模板DTO
export interface CreateQuotationTemplateDTO {
  name: string;
  subject: string;
  content: string;
  contentType: "html" | "text";
  language: "zh" | "en";
  variables: Record<string, string>;
}

// 更新询价模板DTO
export interface UpdateQuotationTemplateDTO {
  name?: string;
  subject?: string;
  content?: string;
  contentType?: "html" | "text";
  language?: "zh" | "en";
  variables?: Record<string, string>;
  isActive?: boolean;
}

// 创建询价请求DTO
export interface CreateQuotationRequestDTO {
  procurementRequestId: string;
  templateId?: string;
  supplierIds: string[];
  items: Array<{
    productId?: string;
    productName: string;
    category: string;
    quantity: number;
    unit: string;
    specifications?: string;
    estimatedUnitPrice?: number;
  }>;
  deliveryDeadline?: Date;
  responseDeadline: Date;
  specialRequirements?: string;
}

// 发送询价DTO
export interface SendQuotationDTO {
  quotationRequestId: string;
  senderInfo: {
    companyName: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
  };
}

// 创建供应商报价DTO
export interface CreateSupplierQuoteDTO {
  quotationRequestId: string;
  supplierId: string;
  quoteNumber?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    specifications?: string;
    remarks?: string;
  }>;
  currency: string;
  validityPeriodStart?: Date;
  validityPeriodEnd?: Date;
  deliveryTime?: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  remarks?: string;
}

// 查询参数接口
export interface QuotationQueryParams {
  status?: QuotationRequestStatus;
  createdBy?: string;
  procurementRequestId?: string;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
  sortBy?: "createdAt" | "updatedAt" | "responseDeadline";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// 模板变量上下文接口
export interface TemplateVariables {
  quotationNumber: string;
  sendDate: string;
  supplierName: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  deliveryDeadline: string;
  responseDeadline: string;
  validityDays: number;
  specialRequirements?: string;
  items: Array<{
    name: string;
    specifications: string;
    quantity: number;
    unit: string;
  }>;
}

// 报价解析结果接口
export interface QuoteParseResult {
  success: boolean;
  quoteData?: {
    quoteNumber?: string;
    items: Array<{
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      specifications?: string;
    }>;
    totalAmount: number;
    currency: string;
    deliveryTime?: number;
    validityDays?: number;
  };
  confidence: number; // 解析置信度 0-100
  warnings?: string[];
  errors?: string[];
}
