/**
 * API限流中间? * 实现请求频率限制和熔断机? */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端用于存储限流数?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  banDuration?: number; // 封禁时长（毫秒）
}

interface ClientInfo {
  ip: string;
  userAgent: string;
  userId?: string;
}

class RateLimiter {
  public config: RateLimitConfig;
  private store: Map<
    string,
    { count: number; resetTime: number; bannedUntil?: number }
  > = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
    // 定期清理过期数据
    setInterval(() => this.cleanup(), 60000); // 每分钟清理一?  }

  private generateKey(clientInfo: ClientInfo, endpoint: string): string {
    return `${clientInfo.ip}:${clientInfo.userAgent}:${endpoint}`;
  }

  private getCurrentTime(): number {
    return Date.now();
  }

  private isBanned(key: string): boolean {
    const record = this.store.get(key);
    if (!record || !record.bannedUntil) return false;
    return this.getCurrentTime() < record.bannedUntil;
  }

  private banClient(key: string): void {
    const record = this.store.get(key);
    if (record) {
      record.bannedUntil =
        this.getCurrentTime() + (this.config.banDuration || 3600000); // 默认封禁1小时
    }
  }

  async checkRateLimit(
    clientInfo: ClientInfo,
    endpoint: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    banned: boolean;
  }> {
    const key = this.generateKey(clientInfo, endpoint);
    const now = this.getCurrentTime();

    // 检查是否被封禁
    if (this.isBanned(key)) {
      const record = this.store.get(key)!;
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.bannedUntil!,
        banned: true,
      };
    }

    let record = this.store.get(key);

    // 如果没有记录或者超出时间窗口，重置计数
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      this.store.set(key, record);
    }

    // 检查是否超出限?    if (record.count >= this.config.maxRequests) {
      // 超出限制，封禁客户端
      this.banClient(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.bannedUntil!,
        banned: true,
      };
    }

    // 增加计数
    record.count++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
      banned: false,
    };
  }

  private cleanup(): void {
    const now = this.getCurrentTime();
    for (const [key, record] of this.store.entries()) {
      // 清理过期的记录和解封的记?      if (
        now > record.resetTime &&
        (!record.bannedUntil || now > record.bannedUntil)
      ) {
        this.store.delete(key);
      }
    }
  }
}

// 创建不同级别的限流器
const rateLimiters = {
  // API端点通用限流（每分钟100次）
  api: new RateLimiter({ windowMs: 60000, maxRequests: 100 }),

  // 敏感操作限流（每分钟10次）
  sensitive: new RateLimiter({
    windowMs: 60000,
    maxRequests: 10,
    banDuration: 7200000,
  }), // 封禁2小时

  // 登录相关限流（每分钟5次）
  auth: new RateLimiter({
    windowMs: 60000,
    maxRequests: 5,
    banDuration: 3600000,
  }), // 封禁1小时

  // 搜索相关限流（每分钟30次）
  search: new RateLimiter({ windowMs: 60000, maxRequests: 30 }),
};

export async function rateLimitMiddleware(
  request: NextRequest,
  options: {
    type?: 'api' | 'sensitive' | 'auth' | 'search';
    customConfig?: RateLimitConfig;
  } = {}
): Promise<NextResponse | null> {
  const { type = 'api', customConfig } = options;

  // 获取客户端信?  const clientInfo: ClientInfo = {
    ip:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    userId: request.headers.get('x-user-id') || undefined,
  };

  // 确定使用的限流器
  let limiter: RateLimiter;
  if (customConfig) {
    limiter = new RateLimiter(customConfig);
  } else {
    limiter = rateLimiters[type];
  }

  // 获取请求路径作为端点标识
  const endpoint = request.nextUrl.pathname;

  try {
    const result = await limiter.checkRateLimit(clientInfo, endpoint);

    // 设置限流响应?    const headers = {
      'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(result.resetTime / 1000).toString(),
      'X-RateLimit-Banned': result.banned.toString(),
    };

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: result.banned
            ? 'Client has been temporarily banned due to rate limiting violations'
            : 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // 返回null表示允许继续处理请求
    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // 发生错误时允许请求通过，避免影响正常服?    return null;
  }
}

// 熔断器类
class CircuitBreaker {
  private failureThreshold: number;
  private timeout: number;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private halfOpenSuccesses: number = 0;

  constructor(failureThreshold: number = 5, timeout: number = 60000) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // 检查熔断器状?    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenSuccesses = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();

      // 成功处理
      if (this.state === 'HALF_OPEN') {
        this.halfOpenSuccesses++;
        if (this.halfOpenSuccesses >= 3) {
          this.state = 'CLOSED';
          this.failureCount = 0;
        }
      }

      return result;
    } catch (error) {
      // 记录失败
      this.failureCount++;
      this.lastFailureTime = now;

      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
      } else if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

// 为采购智能体API创建熔断器实?export const procurementIntelligenceBreaker = new CircuitBreaker(3, 30000); // 3次失败后熔断30�?
export { RateLimiter, CircuitBreaker };
