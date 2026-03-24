/**
 * 带超时控制的 fetch 封装
 *
 * 为所有外部 API 调用提供统一的超时处理和重试机制
 */

/**
 * Fetch 超时选项
 */
export interface FetchWithTimeoutOptions extends RequestInit {
  /**
   * 超时时间（毫秒），默认 30000ms (30 秒)
   */
  timeout?: number;

  /**
   * 重试次数，默认 0（不重试）
   */
  retries?: number;

  /**
   * 重试延迟（毫秒），默认 1000ms
   */
  retryDelay?: number;

  /**
   * 自定义错误消息
   */
  errorMessage?: string;
}

/**
 * 带超时控制的 fetch 函数
 *
 * @param url 请求 URL
 * @param options fetch 选项，包含超时和重试配置
 * @returns Promise<Response>
 * @throws {Error} 当请求超时或网络错误时抛出异常
 *
 * @example
 * ```typescript
 * // 基本使用（30 秒超时）
 * const response = await fetchWithTimeout('https://api.example.com/data');
 *
 * // 自定义超时时间
 * const response = await fetchWithTimeout('https://api.example.com/data', {
 *   timeout: 5000, // 5 秒超时
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' })
 * });
 *
 * // 带重试机制
 * const response = await fetchWithTimeout('https://api.example.com/data', {
 *   timeout: 10000,
 *   retries: 3,      // 失败后重试 3 次
 *   retryDelay: 2000 // 每次重试间隔 2 秒
 * });
 * ```
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 0,
    retryDelay = 1000,
    errorMessage,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  // 重试循环
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 如果是重试，等待延迟时间
      if (attempt > 0) {
        console.log(`重试 ${attempt}/${retries}, 等待 ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      // 创建 AbortController 用于取消请求
      const controller = new AbortController();

      // 设置超时定时器
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        // 发起请求
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        // 清除超时定时器
        clearTimeout(timeoutId);

        return response;
      } catch (error) {
        // 清除超时定时器
        clearTimeout(timeoutId);

        // 判断是否是超时错误
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutErrorMsg =
            errorMessage || `请求超时（${timeout}ms），请稍后重试`;
          const timeoutError = new Error(timeoutErrorMsg);
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }

        // 其他网络错误
        throw error;
      }
    } catch (error) {
      lastError = error as Error;

      // 如果不是最后一次尝试，记录日志并继续重试
      if (attempt < retries) {
        console.warn(`请求失败：${lastError.message}, 准备重试...`);
      }
    }
  }

  // 所有重试都失败后，抛出最后的错误
  throw lastError || new Error('请求失败');
}

/**
 * 安全的 JSON GET 请求封装
 *
 * @param url 请求 URL
 * @param options 请求选项
 * @returns Promise<T> 解析后的 JSON 数据
 *
 * @example
 * ```typescript
 * const data = await safeJsonGet<{ users: User[] }>('https://api.example.com/users');
 * ```
 */
export async function safeJsonGet<T>(
  url: string,
  options?: FetchWithTimeoutOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP 错误：${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * 安全的 JSON POST 请求封装
 *
 * @param url 请求 URL
 * @param data 请求体数据
 * @param options 请求选项
 * @returns Promise<T> 响应数据
 *
 * @example
 * ```typescript
 * const result = await safeJsonPost<{ success: boolean }>(
 *   'https://api.example.com/users',
 *   { name: 'John', email: 'john@example.com' }
 * );
 * ```
 */
export async function safeJsonPost<T>(
  url: string,
  data: any,
  options?: FetchWithTimeoutOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP 错误：${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * 检查服务是否可用（带超时）
 *
 * @param url 服务 URL
 * @param timeout 超时时间（毫秒）
 * @returns boolean 服务是否可用
 *
 * @example
 * ```typescript
 * const isAvailable = await checkServiceHealth('https://api.example.com/health', 5000);
 * if (!isAvailable) {
 *   console.log('服务不可用，使用备用方案');
 * }
 * ```
 */
export async function checkServiceHealth(
  url: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      timeout,
    });
    return response.ok;
  } catch {
    return false;
  }
}
