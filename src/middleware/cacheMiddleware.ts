import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_TTL, getCache, makeCacheKey, setCache } from './cache';

/**
 * 缓存中间件配置
 */
interface CacheConfig {
  ttl?: number; // 缓存时间 (秒)
  keyGenerator?: (request: NextRequest) => string; // 自定义缓存键生成
  shouldCache?: (response: Response) => boolean; // 是否应该缓存
  varyByHeaders?: string[]; // 根据哪些 header 变化生成不同缓存
  varyByQuery?: string[]; // 根据哪些查询参数生成不同缓存
}

/**
 * 创建缓存中间件
 *
 * @example
 * export const GET = withCache(async (request) => {
 *   // 业务逻辑
 * }, {
 *   ttl: 300,
 *   varyByQuery: ['page', 'limit']
 * });
 */
export function withCache<T extends NextRequest>(
  handler: (request: T) => Promise<NextResponse>,
  config: CacheConfig = {}
) {
  const {
    ttl = DEFAULT_TTL.NORMAL_DATA,
    keyGenerator,
    shouldCache = res => res.status === 200,
    varyByHeaders = [],
    varyByQuery = [],
  } = config;

  return async function cachedHandler(request: T): Promise<NextResponse> {
    // 如果是 POST/PUT/DELETE 等写操作，不缓存
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      return handler(request);
    }

    // 生成缓存键
    const cacheKey = generateCacheKey(
      request,
      keyGenerator,
      varyByHeaders,
      varyByQuery
    );

    // 尝试从缓存获取
    const cachedResponse = await getCache<SerializedResponse>(cacheKey);

    if (cachedResponse && !isNullCache(cachedResponse)) {
      // 缓存命中，返回缓存响应
      const response = new NextResponse(cachedResponse.body, {
        status: cachedResponse.status,
        headers: new Headers(cachedResponse.headers),
      });

      // 添加缓存命中头
      response.headers.set('X-Cache', 'HIT');
      response.headers.set(
        'X-Cache-Age',
        Math.floor((Date.now() - cachedResponse.timestamp) / 1000).toString()
      );

      return response;
    }

    // 缓存未命中，执行 handler
    const response = await handler(request);

    // 判断是否应该缓存
    if (shouldCache(response)) {
      // 序列化响应
      const serialized = await serializeResponse(response);

      // 设置缓存
      await setCache(cacheKey, serialized, ttl);
    }

    // 添加缓存头
    response.headers.set('X-Cache', 'MISS');

    return response;
  };
}

/**
 * 生成缓存键
 */
function generateCacheKey(
  request: NextRequest,
  customGenerator?: (request: NextRequest) => string,
  varyByHeaders: string[] = [],
  varyByQuery: string[] = []
): string {
  // 如果有自定义生成器，使用自定义的
  if (customGenerator) {
    return customGenerator(request);
  }

  // 默认生成规则：method + pathname + sorted_headers + sorted_queries
  const url = new URL(request.url);
  const parts = [request.method, url.pathname];

  // 添加指定的 headers
  if (varyByHeaders.length > 0) {
    const headers = varyByHeaders
      .map(header => `${header}:${request.headers.get(header) || ''}`)
      .sort();
    parts.push(headers.join('|'));
  }

  // 添加指定的 query params
  if (varyByQuery.length > 0) {
    const queries = varyByQuery
      .map(param => `${param}:${url.searchParams.get(param) || ''}`)
      .sort();
    parts.push(queries.join('|'));
  }

  return makeCacheKey('api', parts.join(':'));
}

/**
 * 序列化响应
 */
async function serializeResponse(
  response: Response
): Promise<SerializedResponse> {
  const body = await response.text();
  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    // 只缓存重要的 headers
    if (['content-type', 'x-custom-header'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  return {
    body,
    status: response.status,
    headers,
    timestamp: Date.now(),
  };
}

/**
 * 序列化的响应类型
 */
interface SerializedResponse {
  body: string;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}

/**
 * 检查是否为空值缓存
 */
function isNullCache(data: any): boolean {
  return data === '__NULL__';
}

/**
 * 清除缓存的工具函数
 */
export async function clearCache(pattern: string): Promise<number> {
  const { deleteCacheByPattern } = await import('./cache');
  return deleteCacheByPattern(pattern);
}
