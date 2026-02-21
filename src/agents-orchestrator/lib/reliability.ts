/**
 * Agents Orchestrator 可靠性模块
 * 实现超时控制、指数退避重试、幂等性去重功能
 */

import {
  AgentInvokeRequest,
  IdempotencyStore,
  ReliabilityConfig,
  ReliabilityMiddlewareOptions,
  RetryContext,
} from '../types';

// 默认配置
const DEFAULT_CONFIG: ReliabilityConfig = {
  maxRetries: parseInt(process.env.RETRY_MAX || '3', 10),
  timeoutMs: parseInt(process.env.TIMEOUT_MS || '30000', 10),
  retryDelayMs: 1000,
  maxRetryDelayMs: 30000,
  enableIdempotency: true,
  idempotencyExpiryMs: 300000, // 5分钟
};

/**
 * 内存幂等性存储实现
 */
class InMemoryIdempotencyStore implements IdempotencyStore {
  private store: Map<string, { value: any; expiry: number }> = new Map();

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  async set(key: string, value: any, expiryMs: number): Promise<void> {
    this.store.set(key, {
      value,
      expiry: Date.now() + expiryMs,
    });
  }

  async get(key: string): Promise<any> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * 可靠性处理器类
 */
export class ReliabilityHandler {
  private config: ReliabilityConfig;
  private idempotencyStore: IdempotencyStore;
  private options: ReliabilityMiddlewareOptions;

  constructor(
    config: Partial<ReliabilityConfig> = {},
    options: ReliabilityMiddlewareOptions = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.options = options;
    this.idempotencyStore = new InMemoryIdempotencyStore();
  }

  /**
   * 执行带有可靠性的代理调用
   */
  async executeWithReliability<T>(
    request: AgentInvokeRequest,
    handler: (req: AgentInvokeRequest) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    // 幂等性检查
    if (this.config.enableIdempotency) {
      const existingResult = await this.checkIdempotency(
        request.idempotency_key
      );
      if (existingResult) {
        return existingResult;
      }
    }

    try {
      // 执行带超时的调用
      const result = await this.executeWithTimeout(request, handler, startTime);

      // 缓存成功结果
      if (this.config.enableIdempotency) {
        await this.cacheResult(request.idempotency_key, result);
      }

      return result;
    } catch (error) {
      // 重试逻辑
      const result = await this.handleRetry(
        request,
        handler,
        error as Error,
        startTime
      );
      return result;
    }
  }

  /**
   * 带超时控制的执行
   */
  private async executeWithTimeout<T>(
    request: AgentInvokeRequest,
    handler: (req: AgentInvokeRequest) => Promise<T>,
    startTime: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = Math.min(
        request.timeout * 1000, // 转换为毫秒
        this.config.timeoutMs
      );

      const timer = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        const error = new Error(`请求超时 (${elapsed}ms > ${timeout}ms)`);
        (error as any).code = 'TIMEOUT';

        if (this.options.onTimeout) {
          this.options.onTimeout(request);
        }

        reject(error);
      }, timeout);

      handler(request)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 重试处理逻辑
   */
  private async handleRetry<T>(
    request: AgentInvokeRequest,
    handler: (req: AgentInvokeRequest) => Promise<T>,
    error: Error,
    startTime: number
  ): Promise<T> {
    let lastError = error;
    const maxRetries = this.config.maxRetries;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const context: RetryContext = {
        attempt,
        error: lastError,
        lastAttemptAt: Date.now(),
      };

      // 判断是否应该重试
      const shouldRetry = this.shouldRetry(lastError, context);
      if (!shouldRetry) {
        throw lastError;
      }

      // 计算延迟时间
      const delay = this.calculateDelay(attempt);

      // 触发重试开始回调
      if (this.options.onRetryStart) {
        this.options.onRetryStart(context, request);
      }

      // 等待延迟
      await this.delay(delay);

      try {
        const result = await this.executeWithTimeout(
          request,
          handler,
          startTime
        );

        // 触发重试结束回调（成功）
        if (this.options.onRetryEnd) {
          this.options.onRetryEnd(true, context, request);
        }

        // 缓存成功结果
        if (this.config.enableIdempotency) {
          await this.cacheResult(request.idempotency_key, result);
        }

        return result;
      } catch (retryError) {
        lastError = retryError as Error;

        // 触发重试结束回调（失败）
        if (this.options.onRetryEnd) {
          this.options.onRetryEnd(false, context, request);
        }
      }
    }

    // 所有重试都失败了
    throw lastError;
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error, context: RetryContext): boolean {
    // 使用自定义重试逻辑
    if (this.options.shouldRetry) {
      return this.options.shouldRetry(error, context);
    }

    // 默认重试逻辑
    // 不重试超时错误（避免无限循环）
    if ((error as any).code === 'TIMEOUT') {
      return false;
    }

    // 不重试客户端错误（4xx）
    if (
      error.message.includes('400') ||
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('404')
    ) {
      return false;
    }

    // 重试服务器错误（5xx）和其他网络错误
    return (
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNRESET')
    );
  }

  /**
   * 计算重试延迟时间（指数退避）
   */
  private calculateDelay(attempt: number): number {
    if (this.options.calculateDelay) {
      return this.options.calculateDelay(attempt);
    }

    // 指数退避算法：delay = baseDelay * (2^(attempt-1)) + jitter
    const exponentialDelay =
      this.config.retryDelayMs * Math.pow(2, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxRetryDelayMs);

    // 添加随机抖动（±25%）避免惊群效应
    const jitter = cappedDelay * 0.25 * (Math.random() - 0.5);

    return Math.max(cappedDelay + jitter, this.config.retryDelayMs);
  }

  /**
   * 检查幂等性键
   */
  private async checkIdempotency(key: string): Promise<any> {
    return await this.idempotencyStore.get(key);
  }

  /**
   * 缓存结果
   */
  private async cacheResult(key: string, result: any): Promise<void> {
    await this.idempotencyStore.set(
      key,
      result,
      this.config.idempotencyExpiryMs
    );
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取当前配置
   */
  getConfig(): ReliabilityConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ReliabilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 清理过期的幂等性记录
   */
  async cleanupIdempotencyStore(): Promise<void> {
    await this.idempotencyStore.cleanup();
  }

  /**
   * 获取幂等性存储实例（用于测试）
   */
  getIdempotencyStore(): IdempotencyStore {
    return this.idempotencyStore;
  }
}

/**
 * 创建可靠性处理器实例的工厂函数
 */
export function createReliabilityHandler(
  config?: Partial<ReliabilityConfig>,
  options?: ReliabilityMiddlewareOptions
): ReliabilityHandler {
  return new ReliabilityHandler(config, options);
}

/**
 * 默认导出
 */
export default ReliabilityHandler;
