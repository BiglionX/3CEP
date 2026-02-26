// 全局类型声明文件
// 用于增强IDE的类型提示和智能感知

// Window 对象扩展
declare global {
  interface Window {
    Cypress?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
  
  // Node.js 全局变量
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      DATABASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
      [key: string]: string | undefined;
    }
  }
}

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// 排序参数
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 用户相关信息
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// 设备信息
export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

// 市场价格数据
export interface MarketPrice {
  id?: string;
  device_model: string;
  avg_price: number;
  min_price?: number;
  max_price?: number;
  source?: string;
  date: string;
}

// 订单信息
export interface Order {
  id: string;
  user_id: string;
  device_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  created_at: string;
}

// 店铺信息
export interface Shop {
  id: string;
  name: string;
  owner_id: string;
  status: 'active' | 'inactive' | 'suspended';
  rating?: number;
  created_at: string;
}

// Supabase 客户端增强类型
export interface EnhancedSupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => Promise<any>;
    insert: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: () => Promise<any>;
    eq: (column: string, value: any) => any;
  };
}

// React 组件 Props 基础类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

// 表单相关类型
export interface FormField<T = string> {
  name: string;
  label: string;
  value: T;
  error?: string;
  touched?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Redux 状态类型
export interface RootState {
  auth: AuthState;
  ui: UIState;
  data: DataState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface DataState {
  devices: Device[];
  shops: Shop[];
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

// API 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

// 文件上传类型
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

// 搜索参数
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortParams;
  pagination?: PaginationParams;
}

// 图表数据类型
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  [key: string]: any;
}

// 权限相关类型
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

// 导出空对象以满足模块系统要求
export {};