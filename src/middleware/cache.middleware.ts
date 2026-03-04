/**
 * Redis缓存中间件示? */
import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

export async function cacheMiddleware(
  request: NextRequest,
  handler: Function,
  cacheKey: string,
  ttl: number = 3600
) {
  try {
    // 尝试从缓存获?    const cached = await redis.get(cacheKey);
    if (cached) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('ocache hit for key:', cacheKey)return NextResponse.json(JSON.parse(cached));
    }

    // 执行原始处理函数
    const result = await handler();

    // 缓存结果
    if (result && result.status === 200) {
      const responseBody = await result.clone().json();
      await redis.setex(cacheKey, ttl, JSON.stringify(responseBody));
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('ocache set for key:', cacheKey)}

    return result;
  } catch (error) {
    console.error('Cache middleware error:', error);
    // 缓存失败时直接执行原函数
    return handler();
  }
}

// 缓存键生成函?export function generateCacheKey(
  endpoint: string,
  params: Record<string, any>
): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `procurement:${endpoint}?${paramString}`;
}
