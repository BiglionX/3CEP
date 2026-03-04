// API限流中间?import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';

// 限流配置
export interface RateLimitConfig {
  windowMs: number; // 时间窗口(毫秒)
  maxRequests: number; // 最大请求数
  keyGenerator?: (req: NextRequest) => string; // 自定义键生成?  skipPaths?: string[]; // 跳过限流的路?  message?: string; // 限流响应消息
}

// 限流存储接口
interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  increment(key: string, windowMs: number): Promise<void>;
  reset(key: string): Promise<void>;
}

// 内存存储实现（生产环境应使用Redis�?class MemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 定期清理过期数据
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // 每分钟清理一?  }

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async increment(key: string, windowMs: number) {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // 新的时间窗口
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      // 同一时间窗口内增加计?      entry.count++;
      this.store.set(key, entry);
    }
  }

  async reset(key: string) {
    this.store.delete(key);
  }

  private cleanupExpiredEntries() {
    const now = Date.now();
    this.store.forEach((value, key) => {
      if (now >= value.resetTime) {
        this.store.delete(key);
      }
    });
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RateLimitMiddleware {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 60000, // 默认1分钟
      maxRequests: 100, // 默认每分?00次请?      message: 'Too many requests, please try again later.',
      ...config,
    };

    // 使用内存存储（生产环境建议替换为Redis�?    this.store = new MemoryRateLimitStore();
  }

  /**
   * 默认键生成器 - 基于IP地址
   */
  private defaultKeyGenerator(req: NextRequest): string {
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  /**
   * 生成限流?   */
  private getKey(req: NextRequest): string {
    const generator = this.config.keyGenerator || this.defaultKeyGenerator;
    return generator(req);
  }

  /**
   * 检查是否应该跳过限?   */
  private shouldSkip(req: NextRequest): boolean {
    if (!this.config.skipPaths) return false;

    const url = new URL(req.url);
    return this.config.skipPaths.some(path => url.pathname.startsWith(path));
  }

  /**
   * 处理限流逻辑
   */
  async handle(req: NextRequest): Promise<NextResponse | null> {
    // 检查是否跳过限?    if (this.shouldSkip(req)) {
      return null;
    }

    const key = this.getKey(req);
    const now = Date.now();

    try {
      // 获取当前计数
      const rateLimitInfo = await this.store.get(key);

      if (rateLimitInfo && rateLimitInfo.count >= this.config.maxRequests) {
        // 超过限流阈?        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

        logger.warn('Rate limit exceeded', {
          key,
          count: rateLimitInfo.count,
          maxRequests: this.config.maxRequests,
          retryAfter,
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: this.config.message,
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.floor(
                rateLimitInfo.resetTime / 1000
              ).toString(),
            },
          }
        );
      }

      // 增加计数
      await this.store.increment(key, this.config.windowMs);

      // 获取更新后的信息
      const updatedInfo = await this.store.get(key);
      const remaining = updatedInfo
        ? Math.max(0, this.config.maxRequests - updatedInfo.count)
        : this.config.maxRequests;

      // 添加限流头信息到请求对象中（供后续中间件使用?      (req as any).rateLimit = {
        limit: this.config.maxRequests,
        remaining,
        reset: updatedInfo?.resetTime || now + this.config.windowMs,
      };

      return null;
    } catch (error) {
      logger.error('Rate limiting error', error);
      // 发生错误时不阻止请求
      return null;
    }
  }

  /**
   * 为响应添加限流头
   */
  static addRateLimitHeaders(
    response: NextResponse,
    req: NextRequest
  ): NextResponse {
    const rateLimit = (req as any).rateLimit;
    if (rateLimit) {
      response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimit.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.floor(rateLimit.reset / 1000).toString()
      );
    }
    return response;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.store instanceof MemoryRateLimitStore) {
      this.store.destroy();
    }
  }
}

// 预定义的限流配置
export const RATE_LIMIT_PRESETS = {
  // 严格的API限流
  STRICT: {
    windowMs: 60000, // 1分钟
    maxRequests: 10, // 每分钟最?0�?  },

  // 标准的API限流
  STANDARD: {
    windowMs: 60000, // 1分钟
    maxRequests: 100, // 每分钟最?00�?  },

  // 宽松的限?  LENIENT: {
    windowMs: 60000, // 1分钟
    maxRequests: 1000, // 每分钟最?000�?  },

  // 登录相关限流（防止暴力破解）
  AUTH: {
    windowMs: 900000, // 15分钟
    maxRequests: 5, // 15分钟最?次登录尝?  },
};

// 全局限流中间件实?let globalRateLimiter: RateLimitMiddleware | null = null;

export function getGlobalRateLimiter(): RateLimitMiddleware {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimitMiddleware(RATE_LIMIT_PRESETS.STANDARD);
  }
  return globalRateLimiter;
}

// 便捷函数
export async function applyRateLimit(
  req: NextRequest
): Promise<NextResponse | null> {
  const limiter = getGlobalRateLimiter();
  return limiter.handle(req);
}
