/**
 * 企业服务API客户? * 统一的API调用和错误处? */

import { ErrorHandler, type ApiError, type FormError } from '@/lib/validation';

// API配置
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 请求选项接口
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// API响应类型
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// API客户端类
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers;
    this.timeout = config.timeout;
  }

  // 构建完整URL
  private buildURL(endpoint: string): string {
    // 如果已经是完整URL，直接返?    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // 确保baseURL末尾没有斜杠，endpoint开头有斜杠
    const base = this.baseURL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  // 发起请求
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = options;

    const url = this.buildURL(endpoint);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const config: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        signal: controller.signal,
      };

      // 添加请求?      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // FormData不需要设置Content-Type，浏览器会自动设?          delete (config.headers as Record<string, string>)['Content-Type'];
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // 处理响应
      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // 抛出错误让catch处理
        const apiError: any = new Error(response.statusText);
        apiError.response = {
          status: response.status,
          data,
        };
        throw apiError;
      }

      return {
        data,
        success: true,
        message: data.message || '操作成功',
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // 处理超时
      if (error.name === 'AbortError') {
        throw ErrorHandler.processError({
          message: '请求超时',
          code: 'TIMEOUT_ERROR',
        });
      }

      // 处理网络错误
      if (!error.response) {
        throw ErrorHandler.processError({
          message: '网络连接失败',
          code: 'NETWORK_ERROR',
        });
      }

      // 处理HTTP错误
      throw ErrorHandler.processError(error);
    }
  }

  // GET请求
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH请求
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  // 文件上传
  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// 创建API客户端实?export const apiClient = new ApiClient(API_CONFIG);

// 企业服务API封装
export class EnterpriseApi {
  // 获取企业仪表板数?  static async getDashboardData() {
    return apiClient.get('/enterprise/dashboard');
  }

  // 获取采购订单列表
  static async getPurchaseOrders(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }) {
    return apiClient.get('/enterprise/procurement/orders', params);
  }

  // 创建采购订单
  static async createPurchaseOrder(data: any) {
    return apiClient.post('/enterprise/procurement/orders', data);
  }

  // 获取智能体列?  static async getAgents(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    return apiClient.get('/enterprise/agents', params);
  }

  // 创建智能?  static async createAgent(data: any) {
    return apiClient.post('/enterprise/agents', data);
  }

  // 获取供应商列?  static async getSuppliers(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    return apiClient.get('/enterprise/suppliers', params);
  }

  // 用户相关API
  static async getUserProfile() {
    return apiClient.get('/enterprise/profile');
  }

  static async updateUserProfile(data: any) {
    return apiClient.put('/enterprise/profile', data);
  }

  // 通知相关API
  static async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    unread?: boolean;
  }) {
    return apiClient.get('/enterprise/notifications', params);
  }

  static async markNotificationAsRead(id: string) {
    return apiClient.put(`/enterprise/notifications/${id}/read`);
  }
}

// 导出类型
export type { ApiResponse, ApiError, FormError };
export { ErrorHandler };
