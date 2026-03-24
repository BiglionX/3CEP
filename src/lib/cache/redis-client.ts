/**
 * Redis 客户端配置
 *
 * 支持多种部署模式：
 * - Upstash (Serverless)
 * - 自建 Redis
 * - 内存缓存 (开发环境降级方案)
 */

import { Redis } from 'ioredis';

/**
 * Redis 配置接口
 */
interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  tls?: boolean;
  maxRetriesPerRequest?: number;
  keyPrefix?: string;
}

/**
 * 缓存服务接口
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * 内存缓存实现（开发环境降级方案）
 */
class MemoryCache implements CacheService {
  private cache = new Map<string, { value: any; expiry?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expiry });
    console.log(`[MemoryCache] SET ${key}, TTL: ${ttl || '∞'}`);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    console.log(`[MemoryCache] DEL ${key}`);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    console.log('[MemoryCache] CLEAR all');
  }
}

/**
 * Redis 缓存实现
 */
class RedisCache implements CacheService {
  private client: Redis;
  private defaultTTL: number;

  constructor(config: RedisConfig, defaultTTL: number = 300) {
    this.client = new Redis({
      host: config.host,
      port: config.port || 6379,
      password: config.password,
      tls: config.tls ? {} : undefined,
      maxRetriesPerRequest: config.maxRetriesPerRequest || 1,
      keyPrefix: config.keyPrefix || 'prodcycle:',
      retryStrategy: times => {
        if (times > 3) {
          console.warn('[Redis] 连接失败，降级为内存缓存');
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });

    this.defaultTTL = defaultTTL;

    this.client.on('connect', () => {
      console.log('✅ [Redis] 连接成功');
    });

    this.client.on('error', err => {
      console.error('❌ [Redis] 错误:', err.message);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // 检查是否过期
      if (parsed.expiry && Date.now() > parsed.expiry) {
        await this.del(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      console.error(`[Redis] GET ${key} 失败:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const actualTTL = ttl || this.defaultTTL;
      const data = {
        value,
        expiry: actualTTL > 0 ? Date.now() + actualTTL * 1000 : undefined,
      };

      if (actualTTL > 0) {
        await this.client.setex(key, actualTTL, JSON.stringify(data));
      } else {
        await this.client.set(key, JSON.stringify(data));
      }

      console.log(`[Redis] SET ${key}, TTL: ${actualTTL}s`);
    } catch (error) {
      console.error(`[Redis] SET ${key} 失败:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      console.log(`[Redis] DEL ${key}`);
    } catch (error) {
      console.error(`[Redis] DEL ${key} 失败:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`[Redis] EXISTS ${key} 检查失败:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.client.options.keyPrefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      console.log(`[Redis] CLEAR ${keys.length} keys`);
    } catch (error) {
      console.error('[Redis] CLEAR 失败:', error);
    }
  }

  /**
   * 关闭连接
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('[Redis] 断开连接');
  }
}

/**
 * 创建缓存实例
 */
export function createCache(): CacheService {
  // 检查是否有 Redis 配置
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisHost = process.env.REDIS_HOST;

  // 优先使用 Upstash
  if (redisUrl) {
    console.log('🚀 [Cache] 使用 Upstash Redis');
    const url = new URL(redisUrl);
    return new RedisCache({
      host: url.hostname,
      port: parseInt(url.port),
      password: url.password,
      tls: true,
      keyPrefix: 'prodcycle:',
    });
  }

  // 其次使用自建 Redis
  if (redisHost) {
    console.log('🚀 [Cache] 使用自建 Redis');
    return new RedisCache({
      host: redisHost,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true',
      keyPrefix: 'prodcycle:',
    });
  }

  // 降级为内存缓存
  console.warn('⚠️  [Cache] 未检测到 Redis 配置，使用内存缓存（仅开发环境）');
  return new MemoryCache();
}

// 导出单例
export const cache = createCache();
