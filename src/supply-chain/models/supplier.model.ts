/**
 * 供应商管理系统数据模? * 包含供应商资质、信用评级、审核流程等完整数据结构
 */

// 供应商状态枚?export enum SupplierStatus {
  PENDING_REVIEW = 'pending_review', // 待审?  APPROVED = 'approved', // 已批?  REJECTED = 'rejected', // 已拒?  SUSPENDED = 'suspended', // 已暂?  BLACKLISTED = 'blacklisted', // 黑名?}

// 供应商类型枚?export enum SupplierType {
  MANUFACTURER = 'manufacturer', // 制造商
  DISTRIBUTOR = 'distributor', // 分销?  WHOLESALER = 'wholesaler', // 批发?  RETAILER = 'retailer', // 零售?  AGENT = 'agent', // 代理?}

// 信用等级枚举
export enum CreditLevel {
  A = 'A', // 优秀 (90-100�?
  B = 'B', // 良好 (80-89�?
  C = 'C', // 一?(70-79�?
  D = 'D', // 较差 (0-69�?
}

// 资质认证类型枚举
export enum CertificationType {
  BUSINESS_LICENSE = 'business_license', // 营业执照
  TAX_REGISTRATION = 'tax_registration', // 税务登记?  ORGANIZATION_CODE = 'organization_code', // 组织机构代码?  ISO_CERTIFICATION = 'iso_certification', // ISO认证
  QUALITY_CERTIFICATION = 'quality_certification', // 质量认证
  ENVIRONMENTAL_CERTIFICATION = 'environmental_certification', // 环保证书
}

// 审核状态枚?export enum ReviewStatus {
  PENDING = 'pending', // 待审?  IN_REVIEW = 'in_review', // 审核?  APPROVED = 'approved', // 审核通过
  REJECTED = 'rejected', // 审核拒绝
}

// 完整供应商信息接?export interface Supplier {
  id: string;
  code: string; // 供应商编?  name: string; // 供应商名?  type: SupplierType; // 供应商类?  legalName: string; // 法人姓名
  contactPerson: string; // 联系?  phone: string; // 联系电话
  email: string; // 邮箱
  website: string; // 官网
  address: string; // 地址
  country: string; // 国家
  city: string; // 城市
  postalCode: string; // 邮编
  businessScope: string; // 经营范围
  establishedYear: number; // 成立年份
  employeeCount: number; // 员工数量
  annualRevenue: number; // 年营业额
  bankInfo: {
    bankName: string;
    accountNumber: string;
    swiftCode: string;
  }; // 银行信息
  taxId: string; // 税号
  status: SupplierStatus; // 供应商状?  creditLevel: CreditLevel; // 信用等级
  creditScore: number; // 信用分数 (0-100)
  rating: number; // 综合评分 (0-5)
  reviewCount: number; // 评价数量
  cooperationYears: number; // 合作年限
  lastReviewDate: Date | null; // 最后审核日?  nextReviewDate: Date | null; // 下次审核日期
  certifications: SupplierCertification[]; // 资质证书
  products: SupplierProduct[]; // 供应产品
  contracts: SupplierContract[]; // 合同信息
  performanceMetrics: PerformanceMetrics; // 绩效指标
  riskAssessment: RiskAssessment; // 风险评估
  isActive: boolean; // 是否激?  createdAt: Date;
  updatedAt: Date;
}

// 供应商资质认证接?export interface SupplierCertification {
  id: string;
  supplierId: string;
  type: CertificationType;
  certificateNumber: string; // 证书编号
  issuingAuthority: string; // 发证机关
  issueDate: Date; // 发证日期
  expiryDate: Date | null; // 到期日期
  documentUrl: string; // 证书文件URL
  status: 'valid' | 'expired' | 'invalid'; // 状?  verified: boolean; // 是否已验?  verifiedBy: string | null; // 验证?  verifiedAt: Date | null; // 验证时间
  createdAt: Date;
}

// 供应商产品接?export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string; // 关联的产品ID
  productName: string; // 产品名称
  productCategory: string; // 产品类别
  unitPrice: number; // 单价
  minOrderQuantity: number; // 最小起订量
  leadTime: number; // 交货周期(�?
  qualityStandard: string; // 质量标准
  certifications: string[]; // 产品认证
  isActive: boolean; // 是否有效
  createdAt: Date;
  updatedAt: Date;
}

// 供应商合同接?export interface SupplierContract {
  id: string;
  supplierId: string;
  contractNumber: string; // 合同编号
  contractType: 'purchase' | 'service' | 'framework'; // 合同类型
  startDate: Date; // 开始日?  endDate: Date; // 结束日期
  amount: number; // 合同金额
  currency: string; // 货币
  terms: string; // 合同条款
  status: 'active' | 'expired' | 'terminated'; // 合同状?  renewalRequired: boolean; // 是否需要续?  createdAt: Date;
  updatedAt: Date;
}

// 绩效指标接口
export interface PerformanceMetrics {
  deliveryRate: number; // 准时交货?(%)
  qualityRate: number; // 合格?(%)
  responseTime: number; // 响应时间(小时)
  serviceScore: number; // 服务评分 (0-5)
  complaintCount: number; // 投诉次数
  returnRate: number; // 退货率 (%)
  lastUpdated: Date; // 最后更新时?}

// 风险评估接口
export interface RiskAssessment {
  financialRisk: 'low' | 'medium' | 'high'; // 财务风险
  operationalRisk: 'low' | 'medium' | 'high'; // 运营风险
  complianceRisk: 'low' | 'medium' | 'high'; // 合规风险
  marketRisk: 'low' | 'medium' | 'high'; // 市场风险
  overallRisk: 'low' | 'medium' | 'high'; // 综合风险
  riskFactors: string[]; // 风险因素
  mitigationStrategies: string[]; // 风险缓解策略
  lastAssessed: Date; // 最后评估时?}

// 供应商申请接?export interface SupplierApplication {
  id: string;
  applicantName: string; // 申请人姓?  companyName: string; // 公司名称
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  businessInfo: {
    businessLicense: string; // 营业执照?    taxId: string; // 税号
    establishedYear: number; // 成立年份
    employeeCount: number; // 员工数量
  };
  products: Array<{
    categoryName: string;
    productTypes: string[];
  }>; // 主营产品
  documents: Array<{
    type: string;
    fileName: string;
    fileUrl: string;
  }>; // 申请材料
  status: ReviewStatus; // 审核状?  reviewerId: string | null; // 审核人ID
  reviewComments: string; // 审核意见
  submittedAt: Date; // 提交时间
  reviewedAt: Date | null; // 审核时间
  createdAt: Date;
}

// 信用评分规则接口
export interface CreditScoringRule {
  id: string;
  name: string; // 规则名称
  weight: number; // 权重 (0-1)
  criteria: string; // 评分标准
  minValue: number; // 最小?  maxValue: number; // 最大?  scoreFormula: string; // 评分公式
  isActive: boolean; // 是否启用
  createdAt: Date;
  updatedAt: Date;
}

// 供应商审核记录接?export interface SupplierReviewRecord {
  id: string;
  supplierId: string;
  reviewerId: string; // 审核人ID
  reviewerName: string; // 审核人姓?  reviewType: 'initial' | 'annual' | 'special'; // 审核类型
  reviewDate: Date; // 审核日期
  reviewResult: ReviewStatus; // 审核结果
  score: number; // 审核得分
  comments: string; // 审核意见
  attachments: string[]; // 附件URL列表
  nextReviewDate: Date | null; // 下次审核日期
  createdAt: Date;
}

// DTO定义

// 创建供应商DTO
export interface CreateSupplierDTO {
  name: string;
  type: SupplierType;
  legalName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  country: string;
  city: string;
  postalCode: string;
  businessScope: string;
  establishedYear: number;
  employeeCount: number;
  annualRevenue: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    swiftCode: string;
  };
  taxId: string;
  certifications: Array<{
    type: CertificationType;
    certificateNumber: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl: string;
  }>;
}

// 供应商审核DTO
export interface ReviewSupplierDTO {
  supplierId: string;
  reviewerId: string;
  reviewResult: ReviewStatus;
  score: number;
  comments: string;
  nextReviewDate?: Date;
}

// 信用评级DTO
export interface UpdateCreditRatingDTO {
  supplierId: string;
  creditScore: number;
  creditLevel: CreditLevel;
  assessmentReason: string;
}

// 供应商查询参?export interface SupplierQueryParams {
  status?: SupplierStatus;
  type?: SupplierType;
  country?: string;
  city?: string;
  minCreditScore?: number;
  maxCreditScore?: number;
  minRating?: number;
  maxRating?: number;
  hasCertifications?: boolean;
  keyword?: string; // 搜索关键?  sortBy?: 'name' | 'creditScore' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
