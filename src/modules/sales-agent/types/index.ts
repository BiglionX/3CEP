// 销售智能体模块类型定义文件

/**
 * 客户等级枚举
 */
export type CustomerGrade = 'A' | 'B' | 'C' | 'D';

/**
 * 客户规模枚举
 */
export type CustomerScale = 'small' | 'medium' | 'large' | 'enterprise';

/**
 * 客户状态枚? */
export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';

/**
 * 客户来源枚举
 */
export type CustomerSource =
  | 'referral'
  | 'website'
  | 'cold_call'
  | 'exhibition'
  | 'social_media'
  | 'other';

/**
 * 客户信息接口
 */
export interface Customer {
  id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  industry?: string;
  scale?: CustomerScale;
  grade?: CustomerGrade;
  source?: CustomerSource;
  status: CustomerStatus;
  total_revenue: number;
  last_order_date?: Date;
  credit_score?: number;
  payment_terms?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 客户创建输入
 */
export interface CreateCustomerInput {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  industry?: string;
  scale?: CustomerScale;
  source?: CustomerSource;
  payment_terms?: string;
}

/**
 * 客户更新输入
 */
export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  grade?: CustomerGrade;
  status?: CustomerStatus;
  credit_score?: number;
}

/**
 * 报价状态枚? */
export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired';

/**
 * 报价产品? */
export interface QuotationItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

/**
 * 报价单接? */
export interface Quotation {
  id: string;
  quote_number: string;
  customer_id: string;
  customer?: Customer;
  product_items: QuotationItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  valid_until: Date;
  status: QuotationStatus;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 报价创建输入
 */
export interface CreateQuotationInput {
  customer_id: string;
  product_items: Omit<QuotationItem, 'subtotal'>[];
  tax_rate: number;
  valid_until: Date;
  notes?: string;
}

/**
 * 报价更新输入
 */
export interface UpdateQuotationInput extends Partial<CreateQuotationInput> {
  status?: QuotationStatus;
}

/**
 * 合同状态枚? */
export type ContractStatus =
  | 'draft'
  | 'negotiating'
  | 'signed'
  | 'completed'
  | 'terminated';

/**
 * 支付条款接口
 */
export interface PaymentTerm {
  milestone: string;
  percentage: number;
  amount: number;
  due_date: Date;
  description?: string;
}

/**
 * 交付条款接口
 */
export interface DeliveryTerm {
  location: string;
  method: string;
  cost_bearer: 'seller' | 'buyer';
  expected_date: Date;
  special_requirements?: string;
}

/**
 * 合同接口
 */
export interface Contract {
  id: string;
  contract_number: string;
  quotation_id?: string;
  customer_id: string;
  customer?: Customer;
  title: string;
  content?: string;
  amount: number;
  start_date: Date;
  end_date: Date;
  payment_terms: PaymentTerm[];
  delivery_terms: DeliveryTerm[];
  status: ContractStatus;
  signed_at?: Date;
  signed_by_customer?: string;
  signed_by_company?: string;
  document_url?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 合同创建输入
 */
export interface CreateContractInput {
  quotation_id?: string;
  customer_id: string;
  title: string;
  content?: string;
  amount: number;
  start_date: Date;
  end_date: Date;
  payment_terms: PaymentTerm[];
  delivery_terms: DeliveryTerm[];
}

/**
 * 合同更新输入
 */
export interface UpdateContractInput extends Partial<CreateContractInput> {
  status?: ContractStatus;
  signed_at?: Date;
  signed_by_customer?: string;
  signed_by_company?: string;
  document_url?: string;
}

/**
 * 订单状态枚? */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

/**
 * 订单? */
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

/**
 * 收货地址接口
 */
export interface ShippingAddress {
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail_address: string;
  postal_code?: string;
}

/**
 * 订单接口
 */
export interface Order {
  id: string;
  order_number: string;
  contract_id?: string;
  customer_id: string;
  customer?: Customer;
  items: OrderItem[];
  total_amount: number;
  paid_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  tracking_number?: string;
  expected_delivery_date?: Date;
  actual_delivery_date?: Date;
  customer_feedback?: string;
  satisfaction_score?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * 订单创建输入
 */
export interface CreateOrderInput {
  contract_id?: string;
  customer_id: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  expected_delivery_date?: Date;
}

/**
 * 订单更新输入
 */
export interface UpdateOrderInput {
  status?: OrderStatus;
  tracking_number?: string;
  actual_delivery_date?: Date;
  paid_amount?: number;
  customer_feedback?: string;
  satisfaction_score?: number;
}

/**
 * 订单跟踪记录
 */
export interface OrderTrackingRecord {
  id: string;
  order_id: string;
  timestamp: Date;
  status: OrderStatus;
  location?: string;
  description: string;
  operator?: string;
}

/**
 * 客户评估指标
 */
export interface CustomerMetrics {
  totalRevenue: number;
  orderFrequency: number;
  avgOrderValue: number;
  paymentSpeed: number;
  growthRate: number;
  cooperationYears: number;
}

/**
 * 定价因子
 */
export interface PricingFactors {
  baseCost: number;
  marketPrice: number;
  competitorPrice: number;
  customerGrade: CustomerGrade;
  orderVolume: number;
  profitMargin: number;
}

/**
 * 销售统计接? */
export interface SalesStatistics {
  totalCustomers: number;
  activeCustomers: number;
  totalQuotations: number;
  pendingQuotations: number;
  totalContracts: number;
  signingContracts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

/**
 * 客户分级结果
 */
export interface CustomerGradeResult {
  customerId: string;
  currentGrade: CustomerGrade;
  suggestedGrade: CustomerGrade;
  score: number;
  metrics: CustomerMetrics;
  shouldUpgrade: boolean;
  shouldDowngrade: boolean;
}
