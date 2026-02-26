
// 增强的Supabase类型声明
declare global {
  interface Window {
    Cypress?: any;
  }
}

// Supabase客户端增强类型
interface EnhancedSupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => Promise<any>;
    insert: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: () => Promise<any>;
  };
}

// 常用业务类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 用户相关类型
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

// 市场数据类型
interface MarketPriceData {
  id?: string;
  device_model: string;
  avg_price?: number;
  min_price?: number;
  max_price?: number;
  median_price?: number;
  sample_count: number;
  source: string;
  freshness_score: number;
  created_at?: string;
  updated_at?: string;
}

// 审核相关类型
interface ReviewData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  comments?: string;
  reviewed_at?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
}

// 采购相关类型
interface ProcurementRequest {
  id: string;
  company_id: string;
  requester_id: string;
  items: ProcurementItem[];
  budget_range?: BudgetRange;
  urgency: 'low' | 'medium' | 'high';
  special_requirements?: string[];
  status: 'draft' | 'submitted' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
}

interface ProcurementItem {
  product_name: string;
  quantity: number;
  specifications?: string;
  preferred_brands?: string[];
}

interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

// 供应链相关类型
interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  warehouse_id: string;
  location?: string;
  last_updated: string;
}

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  items: PurchaseOrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  expected_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseOrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// 金融相关类型
interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// 设备生命周期类型
interface DeviceLifecycleEvent {
  id: string;
  device_id: string;
  event_type: 'purchase' | 'repair' | 'upgrade' | 'retire';
  event_data: Record<string, any>;
  timestamp: string;
  recorded_by: string;
}

// API配置类型
interface ApiConfig {
  id: string;
  service_name: string;
  base_url: string;
  api_key?: string;
  auth_type: 'none' | 'api_key' | 'oauth' | 'jwt';
  rate_limit?: number;
  timeout?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 错误处理类型
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// 健康检查类型
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: string;
  details?: any;
}

// 日志类型
interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  service?: string;
}

export type {
  ApiResponse,
  PaginationParams,
  SortParams,
  User,
  MarketPriceData,
  ReviewData,
  ProcurementRequest,
  ProcurementItem,
  BudgetRange,
  InventoryItem,
  PurchaseOrder,
  PurchaseOrderItem,
  PaymentTransaction,
  DeviceLifecycleEvent,
  ApiConfig,
  ServiceError,
  HealthCheckResult,
  LogEntry
};
