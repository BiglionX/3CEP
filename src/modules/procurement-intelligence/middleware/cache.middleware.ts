// 采购智能体缓存中间件
// 为API路由提供透明的缓存支?
import { NextRequest, NextResponse } from 'next/server';
import { procurementCache, CacheKey } from '../services/redis-cache.service';

// 缓存配置选项
interface CacheOptions {
  ttl?: number;
  key?: string;
  prefix?: CacheKey;
  skipCache?: boolean;
  bypassQueryParams?: string[];
}

// 缓存中间件类
export class ProcurementCacheMiddleware {
  /**
   * 为GET请求提供缓存支持
   */
  static async handleGetRequest(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
    options: CacheOptions = {}
  ): Promise<NextResponse> {
    // 检查是否应该跳过缓?    if (options.skipCache || !procurementCache['isEnabled']) {
      return await handler();
    }

    // 生成缓存?    const cacheKey = this.generateCacheKey(request, options);
    const prefix = options.prefix || CacheKey.SUPPLIER_PROFILE;

    try {
      // 尝试从缓存获?      const cached = await procurementCache.get(cacheKey, prefix);

      if (cached) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache hit for ${request.url}`)return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${options.ttl || 3600}`,
          },
        });
      }

      // 执行原始处理函数
      const response = await handler();

      // 如果是成功的JSON响应，则缓存结果
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseBody = await response.clone().json();

          // 缓存结果
          await procurementCache.set(
            cacheKey,
            responseBody,
            prefix,
            options.ttl
          );

          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache set for ${request.url}`)}
      }

      // 添加缓存头信?      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache', 'MISS');
      newHeaders.set('X-Cache-Key', cacheKey);

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('缓存中间件错?', error);
      // 缓存失败时直接执行原函数
      return await handler();
    }
  }

  /**
   * 为POST/PUT/PATCH请求提供缓存清除支持
   */
  static async handleMutatingRequest(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
    invalidatePatterns: CacheKey[] = []
  ): Promise<NextResponse> {
    try {
      // 先执行原始处理函?      const response = await handler();

      // 如果操作成功，清除相关缓?      if (response.status >= 200 && response.status < 300) {
        await this.invalidateCache(invalidatePatterns);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache invalidated patterns:`, invalidatePatterns)}

      return response;
    } catch (error) {
      console.error('缓存清除中间件错?', error);
      return await handler();
    }
  }

  /**
   * 生成缓存?   */
  private static generateCacheKey(
    request: NextRequest,
    options: CacheOptions
  ): string {
    // 如果指定了自定义键，直接使用
    if (options.key) {
      return options.key;
    }

    // 构建基于URL和查询参数的缓存?    const url = new URL(request.url);
    let cacheKey = url.pathname;

    // 处理查询参数
    const queryParams = new URLSearchParams();
    for (const [key, value] of url.searchParams) {
      // 跳过指定的查询参?      if (!options?.includes(key)) {
        queryParams.append(key, value);
      }
    }

    if (queryParams.toString()) {
      cacheKey += `?${queryParams.toString()}`;
    }

    // 移除特殊字符，确保键的有效?    return cacheKey.replace(/[^\w\-\/?=&]/g, '_').substring(0, 200); // 限制长度
  }

  /**
   * 批量清除缓存
   */
  private static async invalidateCache(patterns: CacheKey[]): Promise<void> {
    if (!procurementCache['isEnabled']) return;

    await Promise.all(
      patterns.map(pattern => procurementCache.deleteByPrefix(pattern))
    );
  }

  /**
   * 缓存装饰器工?   */
  static cache(options: CacheOptions = {}) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const [request] = args;

        if (!(request instanceof NextRequest)) {
          return await originalMethod.apply(this, args);
        }

        // 对于GET请求，使用缓?        if (request.method === 'GET') {
          return await ProcurementCacheMiddleware.handleGetRequest(
            request,
            () => originalMethod.apply(this, args),
            options
          );
        }

        // 对于修改请求，执行后清除缓存
        const invalidatePatterns = [
          CacheKey.SUPPLIER_PROFILE,
          CacheKey.SUPPLIER_RANKING,
          CacheKey.MARKET_INTELLIGENCE,
        ];

        return await ProcurementCacheMiddleware.handleMutatingRequest(
          request,
          () => originalMethod.apply(this, args),
          invalidatePatterns
        );
      };

      return descriptor;
    };
  }
}

// 便捷的缓存包装函?export function withProcurementCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (request.method === 'GET') {
      return await ProcurementCacheMiddleware.handleGetRequest(
        request,
        () => handler(request),
        options
      );
    }

    const invalidatePatterns = [
      CacheKey.SUPPLIER_PROFILE,
      CacheKey.SUPPLIER_RANKING,
      CacheKey.MARKET_INTELLIGENCE,
    ];

    return await ProcurementCacheMiddleware.handleMutatingRequest(
      request,
      () => handler(request),
      invalidatePatterns
    );
  };
}

// 特定用途的缓存配置
export const PROCUREMENT_CACHE_CONFIG = {
  // 供应商档案缓?  supplierProfile: {
    ttl: 3600, // 1小时
    prefix: CacheKey.SUPPLIER_PROFILE,
  },

  // 供应商排名缓?  supplierRanking: {
    ttl: 1800, // 30分钟
    prefix: CacheKey.SUPPLIER_RANKING,
  },

  // 市场情报缓存
  marketIntelligence: {
    ttl: 7200, // 2小时
    prefix: CacheKey.MARKET_INTELLIGENCE,
  },

  // 价格指数缓存
  priceIndex: {
    ttl: 300, // 5分钟
    prefix: CacheKey.PRICE_INDEX,
  },

  // 风险评估缓存
  riskAssessment: {
    ttl: 1800, // 30分钟
    prefix: CacheKey.RISK_ASSESSMENT,
  },
};
