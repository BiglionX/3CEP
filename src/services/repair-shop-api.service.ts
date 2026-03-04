/**
 * 维修店API服务? * 用于替换模拟数据，提供真实的数据获取能力
 */

import {
  WorkOrder,
  WorkOrderStatus,
  PriorityLevel,
} from '@/types/repair-shop.types';

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10秒超?
// 错误处理?class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 请求配置接口
interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// 分页参数
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 工单过滤参数
interface WorkOrderFilters {
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

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  totalPages?: number;
  currentPage?: number;
}

export class RepairShopApiService {
  private baseUrl: string;
  private defaultOptions: RequestOptions;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      timeout: API_TIMEOUT,
      retries: 3,
      cache: false,
    };
  }

  /**
   * 通用HTTP请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultOptions.timeout,
      retries = 3,
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | undefined;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(
            response.status,
            `HTTP ${response.status}: ${response.statusText}`,
            await response.text()
          );
        }

        const data = await response.json();
        return data as ApiResponse<T>;
      } catch (error) {
        lastError = error as Error;

        // 如果是最后一次重试或者不是网络错误，则抛出异?        if (i === retries || !(error instanceof TypeError)) {
          throw new ApiError(
            (error as ApiError).status || 500,
            `请求失败: ${(error as Error).message}`,
            error
          );
        }

        // 等待后重?        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }

    throw lastError!;
  }

  /**
   * 获取维修工单列表
   */
  async getWorkOrders(
    filters: WorkOrderFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 20 }
  ): Promise<ApiResponse<WorkOrder[]>> {
    const queryParams = new URLSearchParams();

    // 添加过滤参数
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.customerId)
      queryParams.append('customerId', filters.customerId);
    if (filters.technicianId)
      queryParams.append('technicianId', filters.technicianId);
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm);

    // 添加分页参数
    queryParams.append('page', pagination.page.toString());
    queryParams.append('pageSize', pagination.pageSize.toString());
    if (pagination.sortBy) {
      queryParams.append('sortBy', pagination.sortBy);
      queryParams.append('sortOrder', pagination.sortOrder || 'desc');
    }

    if (filters.dateRange) {
      queryParams.append('dateFrom', filters.dateRange.from.toISOString());
      queryParams.append('dateTo', filters.dateRange.to.toISOString());
    }

    return this.request<WorkOrder[]>(
      `/api/repair-shop/work-orders?${queryParams}`
    );
  }

  /**
   * 获取单个工单详情
   */
  async getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>(`/api/repair-shop/work-orders/${id}`);
  }

  /**
   * 创建新工?   */
  async createWorkOrder(
    workOrder: Omit<
      WorkOrder,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'orderNumber'
      | 'status'
      | 'priority'
      | 'price'
      | 'partsCost'
      | 'laborCost'
      | 'totalPrice'
      | 'paymentStatus'
    >
  ): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>('/api/repair-shop/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrder),
    });
  }

  /**
   * 更新工单状?   */
  async updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus,
    updates: Partial<WorkOrder> = {}
  ): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>(
      `/api/repair-shop/work-orders/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, ...updates }),
      }
    );
  }

  /**
   * 获取店铺统计数据
   */
  async getShopStatistics(shopId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/repair-shop/statistics/${shopId}`);
  }

  /**
   * 获取技师列?   */
  async getTechnicians(shopId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/repair-shop/technicians?shopId=${shopId}`);
  }

  /**
   * 搜索客户
   */
  async searchCustomers(query: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/api/repair-shop/customers/search?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * 获取设备类型列表
   */
  async getDeviceTypes(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/repair-shop/device-types');
  }

  /**
   * 获取常见故障类型
   */
  async getFaultTypes(deviceTypeId?: string): Promise<ApiResponse<any[]>> {
    const url = deviceTypeId
      ? `/api/repair-shop/fault-types?deviceTypeId=${deviceTypeId}`
      : '/api/repair-shop/fault-types';
    return this.request<any[]>(url);
  }

  /**
   * 获取报价模板
   */
  async getPricingTemplates(category?: string): Promise<ApiResponse<any[]>> {
    const url = category
      ? `/api/repair-shop/pricing-templates?category=${category}`
      : '/api/repair-shop/pricing-templates';
    return this.request<any[]>(url);
  }

  /**
   * 上传文件（如照片、文档）
   */
  async uploadFile(
    file: File,
    type: string
  ): Promise<ApiResponse<{ url: string; id: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ url: string; id: string }>(
      '/api/repair-shop/upload',
      {
        method: 'POST',
        body: formData,
        headers: {}, // 让浏览器自动设置Content-Type
      }
    );
  }

  /**
   * 获取通知列表
   */
  async getNotifications(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/api/repair-shop/notifications?userId=${userId}`
    );
  }

  /**
   * 标记通知为已?   */
  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(
      `/api/repair-shop/notifications/${notificationId}/read`,
      {
        method: 'PUT',
      }
    );
  }
}

// 创建全局实例
export const repairShopApi = new RepairShopApiService();

// 导出类型定义
export type {
  WorkOrderFilters,
  PaginationParams,
  RequestOptions,
  ApiResponse,
  ApiError,
};
