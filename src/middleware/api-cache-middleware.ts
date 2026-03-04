// API响应缓存中间?
import { NextRequest, NextResponse } from 'next/server';
import { apiResponseCache } from './api-response-cache';

interface CacheMiddlewareOptions {
  ttl?: number;
  cacheKeyPrefix?: string;
  skipCacheHeaders?: string[];
  cacheControlHeader?: string;
}

export class APICacheMiddleware {
  private options: CacheMiddlewareOptions;

  constructor(options: CacheMiddlewareOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 默认5分钟
      cacheKeyPrefix: options.cacheKeyPrefix || 'api_cache',
      skipCacheHeaders: options.skipCacheHeaders || ['cache-control'],
      cacheControlHeader: options.cacheControlHeader || 'public, max-age=300',
    };
  }

  /**
   * 生成缓存?
   */
  private generateCacheKey(request: NextRequest): string {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.search;

    // 基于URL、查询参数和请求方法生成缓存?
    return `${this.options.cacheKeyPrefix}:${request.method}:${pathname}${searchParams}`;
  }

  /**
   * 检查是否应该跳过缓?
   */
  private shouldSkipCache(request: NextRequest): boolean {
    // 检查请求头
    for (const header of this.options.skipCacheHeaders || []) {
      if (request.headers.get(header.toLowerCase())) {
        return true;
      }
    }

    // 非GET请求通常不缓?
    if (request.method !== 'GET') {
      return true;
    }

    // 检查URL参数中的nocache标志
    const url = new URL(request.url);
    if (url.searchParams.get('nocache') !== null) {
      return true;
    }

    return false;
  }

  /**
   * 处理缓存逻辑
   */
  async handle<T = any>(
    request: NextRequest,
    handler: () => Promise<NextResponse<T>>
  ): Promise<NextResponse<T>> {
    // 检查是否应该跳过缓?
    if (this.shouldSkipCache(request)) {
      const response = await handler();
      this.addCacheControlHeaders(response, 'no-cache');
      return response;
    }

    // 生成缓存?
    const cacheKey = this.generateCacheKey(request);

    try {
      // 尝试从缓存获?
      const cachedData = apiResponseCache.get<T>(cacheKey);

      if (cachedData) {
        // 缓存命中，返回缓存数?
        const cachedResponse = NextResponse.json(cachedData);
        this.addCacheControlHeaders(
          cachedResponse,
          this.options.cacheControlHeader!
        );
        cachedResponse.headers.set('X-Cache', 'HIT');
        return cachedResponse;
      }

      // 缓存未命中，执行处理?
      const response = await handler();

      // 如果响应成功，缓存结?
      if (response.status >= 200 && response.status < 300) {
        const responseData = await response.json();
        apiResponseCache.set(cacheKey, responseData, this.options.ttl);

        // 返回带有缓存标记的响?
        const newResponse = NextResponse.json(responseData);
        this.addCacheControlHeaders(
          newResponse,
          this.options.cacheControlHeader!
        );
        newResponse.headers.set('X-Cache', 'MISS');
        return newResponse;
      }

      return response;
    } catch (error) {
      console.error('Cache middleware error:', error);
      // 发生错误时，直接执行处理?
      return handler();
    }
  }

  /**
   * 添加缓存控制?
   */
  private addCacheControlHeaders(
    response: NextResponse,
    cacheControl: string
  ): void {
    response.headers.set('Cache-Control', cacheControl);
    response.headers.set(
      'Expires',
      new Date(Date.now() + this.options.ttl!).toUTCString()
    );
  }

  /**
   * 手动清除特定缓存
   */
  invalidateCache(pattern: string): number {
    return apiResponseCache.deleteByPattern(pattern);
  }

  /**
   * 清除所有缓?
   */
  clearAllCache(): void {
    apiResponseCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number;
    itemCount: number;
  } {
    return apiResponseCache.getStats();
  }
}

// 创建默认的API缓存中间件实?
export const defaultAPICache = new APICacheMiddleware({
  ttl: 5 * 60 * 1000,
  cacheKeyPrefix: 'api_v1',
});

// 便捷的导出函?
export function withAPICache<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest) => {
    return defaultAPICache.handle(request, () => handler(request));
  };
}

export default APICacheMiddleware;
