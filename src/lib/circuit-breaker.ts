// 服务熔断器实?- 基于Hystrix模式
import { logger } from '../utils/logger';

// 熔断器状态枚?export enum CircuitState {
  CLOSED = 'CLOSED', // 关闭状?- 正常转发请求
  OPEN = 'OPEN', // 开启状?- 直接拒绝请求
  HALF_OPEN = 'HALF_OPEN', // 半开状?- 尝试放行部分请求
}

// 熔断器配?export interface CircuitBreakerConfig {
  failureThreshold: number; // 失败阈?次数)
  timeout: number; // 超时时间(ms)
  resetTimeout: number; // 重置超时时间(ms)
  successThreshold: number; // 半开状态下成功阈?  fallbackFn?: () => any; // 降级函数
}

// 请求统计信息
interface RequestStats {
  total: number;
  failures: number;
  lastFailureTime: number;
  consecutiveSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private stats: RequestStats = {
    total: 0,
    failures: 0,
    lastFailureTime: 0,
    consecutiveSuccesses: 0,
  };
  private config: CircuitBreakerConfig;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      ...{
        failureThreshold: 5,
        timeout: 3000,
        resetTimeout: 30000,
        successThreshold: 2,
      },
      ...config,
    };
  }

  /**
   * 执行受保护的操作
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // 检查是否应该直接拒绝请?    if (this.shouldReject()) {
      return this.handleRejectedRequest();
    }

    try {
      // 执行操作并记录统?      const result = await this.withTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * 带超时的执行
   */
  private async withTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * 判断是否应该拒绝请求
   */
  private shouldReject(): boolean {
    switch (this.state) {
      case CircuitState.OPEN:
        // 在开启状态下，如果超过重置时间，则进入半开状?        if (
          Date.now() - this.stats.lastFailureTime >=
          this.config.resetTimeout
        ) {
          this.transitionToHalfOpen();
          return false;
        }
        return true;

      case CircuitState.HALF_OPEN:
        // 半开状态下允许部分请求通过
        return false;

      case CircuitState.CLOSED:
        // 关闭状态下正常处理
        return false;

      default:
        return false;
    }
  }

  /**
   * 处理被拒绝的请求
   */
  private handleRejectedRequest(): any {
    logger.warn('Circuit breaker rejected request', {
      state: this.state,
      stats: this.stats,
    });

    if (this.config.fallbackFn) {
      return this.config.fallbackFn();
    }

    throw new Error(`Service unavailable - circuit breaker is ${this.state}`);
  }

  /**
   * 成功回调
   */
  private onSuccess(): void {
    this.stats.total++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.stats.consecutiveSuccesses++;

      if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    } else {
      // 重置连续成功计数
      this.stats.consecutiveSuccesses = 0;
    }
  }

  /**
   * 失败回调
   */
  private onFailure(error: Error): void {
    this.stats.total++;
    this.stats.failures++;
    this.stats.lastFailureTime = Date.now();
    this.stats.consecutiveSuccesses = 0;

    logger.error('Circuit breaker recorded failure', {
      error: error.message,
      stats: this.stats,
      state: this.state,
    });

    // 检查是否需要打开熔断?    if (
      this.state === CircuitState.CLOSED &&
      this.stats.failures >= this.config.failureThreshold
    ) {
      this.transitionToOpen();
    }
  }

  /**
   * 状态转?- 关闭到开?   */
  private transitionToOpen(): void {
    logger.info('Circuit breaker transitioning to OPEN state');
    this.state = CircuitState.OPEN;
    this.stats.failures = 0;

    // 设置重置定时?    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.transitionToHalfOpen();
    }, this.config.resetTimeout);
  }

  /**
   * 状态转?- 开启到半开
   */
  private transitionToHalfOpen(): void {
    logger.info('Circuit breaker transitioning to HALF_OPEN state');
    this.state = CircuitState.HALF_OPEN;
    this.stats.consecutiveSuccesses = 0;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * 状态转?- 半开到关?   */
  private transitionToClosed(): void {
    logger.info('Circuit breaker transitioning to CLOSED state');
    this.state = CircuitState.CLOSED;
    this.stats.failures = 0;
    this.stats.consecutiveSuccesses = 0;
  }

  /**
   * 获取当前状?   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * 获取统计信息
   */
  getStats(): RequestStats {
    return { ...this.stats };
  }

  /**
   * 强制重置熔断?   */
  reset(): void {
    logger.info('Circuit breaker manually reset');
    this.state = CircuitState.CLOSED;
    this.stats = {
      total: 0,
      failures: 0,
      lastFailureTime: 0,
      consecutiveSuccesses: 0,
    };

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * 关闭熔断?   */
  close(): void {
    this.state = CircuitState.CLOSED;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * 打开熔断?   */
  open(): void {
    this.state = CircuitState.OPEN;
    this.stats.lastFailureTime = Date.now();
  }
}

// 全局熔断器管理器
class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * 获取或创建熔断器
   */
  getOrCreate(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(config);
      this.breakers.set(name, breaker);
      logger.info(`Created circuit breaker: ${name}`);
    }
    return this.breakers.get(name)!;
  }

  /**
   * 获取所有熔断器状?   */
  getAllStates(): Record<string, { state: CircuitState; stats: RequestStats }> {
    const states: Record<string, { state: CircuitState; stats: RequestStats }> =
      {};
    this.breakers.forEach((breaker, name) => {
      states[name] = {
        state: breaker.getState(),
        stats: breaker.getStats(),
      };
    });
    return states;
  }

  /**
   * 重置所有熔断器
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
    logger.info('Reset all circuit breakers');
  }
}

// 导出全局实例
export const circuitBreakerManager = new CircuitBreakerManager();

// 便捷函数
export function withCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = circuitBreakerManager.getOrCreate(name, {
    failureThreshold: 5,
    timeout: 3000,
    resetTimeout: 30000,
    successThreshold: 2,
    ...config,
  });

  return breaker.execute(operation);
}
