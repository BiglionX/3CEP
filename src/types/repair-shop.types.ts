/**
 * 维修店相关类型定义
 */

// 工单状态枚举
export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

// 优先级枚举
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 设备类型
export interface DeviceType {
  id: string;
  name: string;
  category: string;
  brand?: string;
  modelPattern?: string;
}

// 故障类型
export interface FaultType {
  id: string;
  name: string;
  deviceTypeId: string;
  description?: string;
  estimatedTime?: number; // 预估维修时间（分钟）
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}

// 客户信息
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  lastVisit?: string;
  totalOrders: number;
  averageRating?: number;
}

// 技师信息
export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string[];
  experienceYears: number;
  certificationLevel: number;
  isAvailable: boolean;
  currentWorkload: number;
  rating?: number;
}

// 维修工单
export interface WorkOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceInfo: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
  };
  faultDescription: string;
  faultType?: string;
  status: WorkOrderStatus;
  priority: PriorityLevel;
  technicianId?: string;
  technicianName?: string;
  assignedAt?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  price: number;
  partsCost?: number;
  laborCost?: number;
  totalPrice?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  photos?: string[]; // 照片URL数组
  createdAt: string;
  updatedAt: string;
}

// 店铺统计信息
export interface ShopStatistics {
  todayOrders: number;
  pendingOrders: number;
  completedToday: number;
  monthlyRevenue: number;
  averageCompletionTime: number; // 平均完成时间（小时）
  customerSatisfaction: number; // 客户满意度（百分比）
  technicianUtilization: number; // 技师利用率（百分比）
  topFaultTypes: { faultType: string; count: number }[];
}

// 通知类型
export interface Notification {
  id: string;
  type: 'urgent' | 'reminder' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedOrderId?: string;
  actionUrl?: string;
}

// 搜索结果
export interface SearchResult {
  type: 'customer' | 'order' | 'device';
  id: string;
  title: string;
  subtitle: string;
  highlight?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API错误响应
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// 工单过滤参数
export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  priority?: PriorityLevel;
  customerId?: string;
  technicianId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchTerm?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
