/**
 * 增强版API请求拦截器系统
 * 提供统一的认证、安全检查、日志记录和错误处理
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
// 图标导入已移除，因为它们未在当前组件中使用
// 如果需要使用图标，请取消注释以下导入
// import {
//   Shield,
//   Key,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
// } from 'lucide-react';

// 请求配置接口
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// 请求拦截器接口
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
  onResponse?: (response: Response) => Promise<Response> | Response;
  onError?: (error: Error) => Promise<void> | void;
}

// 认证拦截器配置
export interface AuthInterceptorConfig {
  tokenGetter: () => string | null;
  tokenSetter?: (token: string) => void;
  refreshToken?: () => Promise<string | null>;
  unauthorizedRedirect?: string;
}

// 安全拦截器配置
export interface SecurityInterceptorConfig {
  enableCSRF?: boolean;
  enableRateLimiting?: boolean;
  maxRequestsPerMinute?: number;
  blockedIPs?: string[];
}

// 日志拦截器配置
export interface LoggingInterceptorConfig {
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  enableErrorLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// 拦截器管理器上下文
interface InterceptorContextType {
  // 配置管理
  config: RequestConfig;
  updateConfig: (newConfig: Partial<RequestConfig>) => void;

  // 拦截器注册
  registerInterceptor: (name: string, interceptor: RequestInterceptor) => void;
  unregisterInterceptor: (name: string) => void;
  getInterceptors: () => Record<string, RequestInterceptor>;

  // 认证管理
  setAuthToken: (token: string) => void;
  getAuthToken: () => string | null;
  clearAuthToken: () => void;
  isAuthenticated: boolean;

  // 请求状态
  activeRequests: number;
  requestQueue: QueuedRequest[];

  // 统计信息
  stats: InterceptorStats;
}

// 请求队列项
interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  timestamp: number;
  retries: number;
}

// 统计信息
interface InterceptorStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeInterceptors: number;
}

// 创建上下文
const InterceptorContext = createContext<InterceptorContextType | undefined>(
  undefined
);

// 默认配置
const DEFAULT_CONFIG: RequestConfig = {
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  retryAttempts: 3,
  retryDelay: 1000,
};

export function ApiInterceptorProvider({
  children,
  initialConfig = {},
}: {
  children: React.ReactNode;
  initialConfig?: Partial<RequestConfig>;
}) {
  const [config, setConfig] = useState<RequestConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [interceptors, setInterceptors] = useState<
    Record<string, RequestInterceptor>
  >({});
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState(0);
  const [requestQueue, _setRequestQueue] = useState<QueuedRequest[]>([]);
  const [stats, setStats] = useState<InterceptorStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    activeInterceptors: 0,
  });

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<RequestConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // 注册拦截器
  const registerInterceptor = useCallback(
    (name: string, interceptor: RequestInterceptor) => {
      setInterceptors(prev => ({ ...prev, [name]: interceptor }));
      setStats(prev => ({
        ...prev,
        activeInterceptors: Object.keys({ ...prev, [name]: interceptor })
          .length,
      }));
    },
    []
  );

  // 注销拦截器
  const unregisterInterceptor = useCallback((name: string) => {
    setInterceptors(prev => {
      const newInterceptors = { ...prev };
      delete newInterceptors[name];
      return newInterceptors;
    });
    setStats(prev => ({
      ...prev,
      activeInterceptors: Math.max(0, prev.activeInterceptors - 1),
    }));
  }, []);

  // 获取所有拦截器
  const getInterceptors = useCallback(() => interceptors, [interceptors]);

  // 认证相关方法
  const setAuthTokenInternal = useCallback((token: string) => {
    setAuthToken(token);
    localStorage.setItem('auth_token', token);
  }, []);

  const getAuthTokenInternal = useCallback(() => {
    return authToken || localStorage.getItem('auth_token');
  }, [authToken]);

  const clearAuthToken = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('auth_token');
  }, []);

  // 创建增强版fetch（待实现）
  const _enhancedFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = Date.now();
      let url = input.toString();
      const options = { ...init };

      // 应用基础URL
      if (config.baseURL && !url.startsWith('http')) {
        url = config.baseURL + url;
      }

      // 应用默认headers
      let updatedHeaders = {
        ...config.headers,
        ...options.headers,
      };

      // 添加认证token
      const token = getAuthTokenInternal();
      if (token) {
        updatedHeaders = {
          ...updatedHeaders,
          Authorization: `Bearer ${token}`,
        };
      }

      // 应用请求拦截器
      let finalConfig: RequestConfig = {
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: updatedHeaders,
        withCredentials: config.withCredentials,
      };

      for (const interceptor of Object.values(interceptors)) {
        if (interceptor.onRequest) {
          try {
            finalConfig = await interceptor.onRequest(finalConfig);
          } catch (error) {
            console.error('请求拦截器错?', error);
            throw error;
          }
        }
      }

      // 更新请求配置
      updatedHeaders = finalConfig.headers || updatedHeaders;
      if (finalConfig.timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          finalConfig.timeout
        );
        options.signal = controller.signal;

        // 清理超时
        options.signal.addEventListener('abort', () => clearTimeout(timeoutId));
      }

      setActiveRequests(prev => prev + 1);
      setStats(prev => ({ ...prev, totalRequests: prev.totalRequests + 1 }));

      try {
        // 执行请求
        const response = await fetch(url, {
          ...options,
          headers: updatedHeaders,
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // 更新统计
        setStats(prev => {
          const totalTime =
            prev.averageResponseTime * prev.successfulRequests + responseTime;
          const newSuccessful = prev.successfulRequests + 1;
          return {
            ...prev,
            successfulRequests: newSuccessful,
            averageResponseTime: totalTime / newSuccessful,
          };
        });

        // 应用响应拦截器
        let finalResponse = response;
        for (const interceptor of Object.values(interceptors)) {
          if (interceptor.onResponse) {
            try {
              finalResponse = await interceptor.onResponse(finalResponse);
            } catch (error) {
              console.error('响应拦截器错?', error);
              throw error;
            }
          }
        }

        return finalResponse;
      } catch (error) {
        setStats(prev => ({
          ...prev,
          failedRequests: prev.failedRequests + 1,
        }));

        // 应用错误拦截器
        for (const interceptor of Object.values(interceptors)) {
          if (interceptor.onError) {
            try {
              await interceptor.onError(error as Error);
            } catch (interceptorError) {
              console.error('错误拦截器错?', interceptorError);
            }
          }
        }

        throw error;
      } finally {
        setActiveRequests(prev => Math.max(0, prev - 1));
      }
    },
    [config, interceptors, getAuthTokenInternal]
  );

  // 初始化时加载存储的token
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  const contextValue: InterceptorContextType = {
    config,
    updateConfig,
    registerInterceptor,
    unregisterInterceptor,
    getInterceptors,
    setAuthToken: setAuthTokenInternal,
    getAuthToken: getAuthTokenInternal,
    clearAuthToken,
    isAuthenticated: !!authToken,
    activeRequests,
    requestQueue,
    stats,
  };

  return (
    <InterceptorContext.Provider value={contextValue}>
      {children}
    </InterceptorContext.Provider>
  );
}

// Hook函数
export function useApiInterceptor() {
  const context = useContext(InterceptorContext);
  if (!context) {
    throw new Error(
      'useApiInterceptor must be used within ApiInterceptorProvider'
    );
  }
  return context;
}

// 预制拦截器
// 1. 认证拦截器
export function createAuthInterceptor(
  config: AuthInterceptorConfig
): RequestInterceptor {
  return {
    onRequest: async requestConfig => {
      const token = config.tokenGetter();
      if (token) {
        requestConfig.headers = {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return requestConfig;
    },

    onResponse: async response => {
      if (response.status === 401) {
        // Token过期，尝试刷新
        if (config.refreshToken) {
          try {
            const newToken = await config.refreshToken();
            if (newToken && config.tokenSetter) {
              config.tokenSetter(newToken);
              // 可以重新发起原请求
            }
          } catch (error) {
            console.error('Token刷新失败:', error);
            if (config.unauthorizedRedirect) {
              window.location.href = config.unauthorizedRedirect;
            }
          }
        } else if (config.unauthorizedRedirect) {
          window.location.href = config.unauthorizedRedirect;
        }
      }
      return response;
    },
  };
}

// 2. 安全拦截器
export function createSecurityInterceptor(
  config: SecurityInterceptorConfig
): RequestInterceptor {
  const requestCounts = new Map<string, number>();
  const lastResetTime = Date.now();

  return {
    onRequest: async requestConfig => {
      // CSRF保护
      if (config.enableCSRF) {
        const csrfToken = document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content');
        if (csrfToken) {
          requestConfig.headers = {
            ...requestConfig.headers,
            'X-CSRF-Token': csrfToken,
          };
        }
      }

      // 速率限制
      if (config.enableRateLimiting) {
        const now = Date.now();
        const clientId = `browser_${navigator.userAgent.hashCode()}`;

        // 每分钟重置计数
        if (now - lastResetTime > 60000) {
          requestCounts.clear();
        }

        const currentCount = requestCounts.get(clientId) || 0;
        if (currentCount >= (config.maxRequestsPerMinute || 60)) {
          throw new Error('请求频率超出限制');
        }

        requestCounts.set(clientId, currentCount + 1);
      }

      return requestConfig;
    },
  };
}

// 3. 日志拦截器
export function createLoggingInterceptor(
  config: LoggingInterceptorConfig
): RequestInterceptor {
  return {
    onRequest: async requestConfig => {
      if (config.enableRequestLogging) {
        console.debug(`[${new Date().toISOString()}] 📤 请求:`, {
          url: requestConfig.baseURL,
          headers: requestConfig.headers,
          timestamp: Date.now(),
        });
      }
      return requestConfig;
    },

    onResponse: async response => {
      if (config.enableResponseLogging) {
        console.debug(`[${new Date().toISOString()}] 📥 响应:`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          timestamp: Date.now(),
        });
      }
      return response;
    },

    onError: async error => {
      if (config.enableErrorLogging) {
        console.error(`[${new Date().toISOString()}] ❌ 请求错误:`, {
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
        });
      }
      // 错误拦截器不需要返回值
    },
  };
}

// 4. 重试拦截器
export function createRetryInterceptor(
  _maxRetries: number = 3,
  _retryDelay: number = 1000
): RequestInterceptor {
  return {
    onError: async error => {
      // 只对网络错误进行重试
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        // TODO: 移除调试日志 - console.log(`请求失败，准备重试...`);
      }
    },
  };
}

// 5. 缓存拦截器
export function createCacheInterceptor(): RequestInterceptor {
  const cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  return {
    onRequest: async requestConfig => {
      // 为GET请求添加缓存支持
      if (requestConfig.headers?.['Cache-Control']) {
        requestConfig.headers['X-Cache-Skip'] = 'true';
      }
      return requestConfig;
    },

    onResponse: async response => {
      // 缓存成功的GET响应
      if (response.ok && response.url && response.clone) {
        const clonedResponse = response.clone();
        const cacheKey = response.url;

        try {
          const data = await clonedResponse.json();
          cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: 300000, // 5分钟缓存
          });
        } catch (error) {
          // 非JSON响应不缓存
        }
      }
      return response;
    },
  };
}

// 扩展String原型用于CSRF token生成
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};
