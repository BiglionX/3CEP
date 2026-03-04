/**
 * FixCycle Agent SDK HTTP客户? * 用于与FixCycle平台进行API通信
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AgentConfig, NetworkError, AgentError } from '../types';

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export class HttpClient {
  private client: AxiosInstance;
  private config: AgentConfig;
  private baseURL: string;

  constructor(config: AgentConfig) {
    this.config = config;
    this.baseURL = config.apiUrl || 'https://api.fixcycle.com/v1';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'User-Agent': 'FixCycle-Agent-SDK/1.0.0',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        if (this.config.debug) {
          // TODO: 移除调试日志
          // TODO: 移除调试日志 - console.debug('HTTP Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: config.headers,
            data: config.data,
          });
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      response => {
        if (this.config.debug) {
          // TODO: 移除调试日志
          // TODO: 移除调试日志 - console.debug('HTTP Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
          })
        }
        return response;
      },
      error => {
        if (this.config.debug) {
          console.error('HTTP Error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 发送GET请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, { params }, options);
  }

  /**
   * 发送POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, { data }, options);
  }

  /**
   * 发送PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, { data }, options);
  }

  /**
   * 发送DELETE请求
   */
  async delete<T = any>(
    url: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, {}, options);
  }

  /**
   * 通用请求方法
   */
  private async makeRequest<T>(
    method: string,
    url: string,
    config: AxiosRequestConfig = {},
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const retryCount = options?.retries ?? this.config.maxRetries ?? 3;
    const timeout = options?.timeout ?? this.config.timeout ?? 30000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const requestConfig: AxiosRequestConfig = {
          ...config,
          method,
          url,
          timeout,
          headers: {
            ...this.client.defaults.headers.common,
            ...(options?.headers || {}),
          },
        };

        const response = await this.client.request<T>(requestConfig);

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error: any) {
        lastError = error;

        // 如果是最后一次尝试或者不是网络错误，则抛出异常
        if (attempt === retryCount || !this.isRetryableError(error)) {
          throw this.handleError(error);
        }

        // 计算延迟时间（指数退避）
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        if (this.config.debug) {
          // TODO: 移除调试日志
          // TODO: 移除调试日志 - console.debug(
            `Request failed, retrying in ${delay}ms... (${attempt + 1}/${retryCount + 1})`
          );
        }

        await this.sleep(delay);
      }
    }

    throw this.handleError(lastError!);
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    // 网络错误可以重试
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return true;
    }

    // 5xx服务器错误可以重试
    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }

    // 429限流错误可以重试
    if (error.response?.status === 429) {
      return true;
    }

    return false;
  }

  /**
   * 统一错误处理
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 服务器返回错误响应
        return new NetworkError(
          `HTTP ${error.response.status}: ${error.response.statusText}`,
          {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          }
        );
      } else if (error.request) {
        // 网络错误
        return new NetworkError(`Network Error: ${error.message}`, {
          code: error.code,
          message: error.message,
          url: error.config?.url,
        });
      } else {
        // 其他错误
        return new AgentError(
          `Request Error: ${error.message}`,
          'REQUEST_ERROR',
          { message: error.message }
        );
      }
    }

    // 非Axios错误
    return new AgentError(
      `Unknown Error: ${error.message || 'Unknown error occurred'}`,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取基础URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.timeout !== undefined) {
      this.client.defaults.timeout = newConfig.timeout;
    }

    if (newConfig.apiKey !== undefined) {
      this.client.defaults.headers.common['Authorization'] =
        `Bearer ${newConfig.apiKey}`;
    }
  }
}
