// 多级缓存策略管理?import { apiResponseCache } from './api-response-cache';
import {
  getDefaultRedisManager,
  RedisCacheManager,
} from './redis-cache-manager';
import { logger } from '../utils/logger';

interface MultiLevelCacheConfig {
  // L1缓存配置（内存）
  l1: {
    ttl: number; // 毫秒
    maxSize: number;
  };
  // L2缓存配置（Redis�?  l2: {
    enabled: boolean;
    ttl: number; // �?  };
  // 缓存策略
  strategy: 'write-through' | 'write-behind' | 'read-through';
}

interface CacheOperationResult<T = any> {
  data: T | null;
  source: 'l1' | 'l2' | 'origin';
  hit: boolean;
  timestamp: number;
}

export class MultiLevelCacheManager {
  private config: MultiLevelCacheConfig;
  private redisManager: RedisCacheManager | null;
  private pendingWrites: Map<string, any> = new Map();

  constructor(config?: Partial<MultiLevelCacheConfig>) {
    this.config = {
      l1: {
        ttl: 300000, // 5分钟
        maxSize: 1000,
      },
      l2: {
        enabled: true,
        ttl: 3600, // 1小时
      },
      strategy: 'read-through',
      ...config,
    };

    // 初始化Redis管理器（如果启用L2缓存?    this.redisManager = this.config.l2.enabled
      ? getDefaultRedisManager()
      : null;
  }

  /**
   * 获取缓存数据（多级缓存）
   */
  async get<T = any>(key: string): Promise<CacheOperationResult<T>> {
    const startTime = Date.now();

    try {
      // 1. 先检查L1缓存（内存）
      const l1Result = apiResponseCache.get<T>(key);
      if (l1Result !== null) {
        logger.debug(`L1缓存命中: ${key}`);
        return {
          data: l1Result,
          source: 'l1',
          hit: true,
          timestamp: startTime,
        };
      }

      // 2. 检查L2缓存（Redis�?      if (this.redisManager && this.redisManager.isConnected()) {
        const l2Result = await this.redisManager.get<T>(key);
        if (l2Result !== null) {
          logger.debug(`L2缓存命中: ${key}`);

          // 将数据回填到L1缓存
          apiResponseCache.set(key, l2Result, this.config.l1.ttl);

          return {
            data: l2Result,
            source: 'l2',
            hit: true,
            timestamp: startTime,
          };
        }
      }

      // 3. 缓存未命?      logger.debug(`缓存未命? ${key}`);
      return {
        data: null,
        source: 'origin',
        hit: false,
        timestamp: startTime,
      };
    } catch (error) {
      logger.error(`多级缓存GET操作失败: ${key}`, error as Error);
      return {
        data: null,
        source: 'origin',
        hit: false,
        timestamp: startTime,
      };
    }
  }

  /**
   * 设置缓存数据
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    const effectiveTtl = ttl || this.config.l1.ttl;
    let success = true;

    try {
      // 1. 设置L1缓存
      apiResponseCache.set(key, data, effectiveTtl);

      // 2. 设置L2缓存（如果启用）
      if (this.redisManager && this.redisManager.isConnected()) {
        const redisSuccess = await this.redisManager.set(key, data, {
          ttl: Math.floor((ttl || this.config.l2.ttl) / 1000), // Redis TTL是秒
        });
        success = success && redisSuccess;
      }

      logger.debug(`缓存设置成功: ${key}`);
      return success;
    } catch (error) {
      logger.error(`多级缓存SET操作失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 删除缓存数据
   */
  async delete(key: string): Promise<boolean> {
    let success = true;

    try {
      // 1. 删除L1缓存
      const l1Success = apiResponseCache.delete(key);
      success = success && l1Success;

      // 2. 删除L2缓存
      if (this.redisManager && this.redisManager.isConnected()) {
        const l2Success = await this.redisManager.delete(key);
        success = success && l2Success;
      }

      logger.debug(`缓存删除成功: ${key}`);
      return success;
    } catch (error) {
      logger.error(`多级缓存DELETE操作失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 获取或设置缓存（带数据源回调?   */
  async getOrSet<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 先尝试获取缓?    const cacheResult = await this.get<T>(key);

    if (cacheResult.hit && cacheResult.data !== null) {
      return cacheResult.data;
    }

    // 缓存未命中，从数据源获取
    try {
      const data = await dataFetcher();

      // 异步设置缓存（不影响主流程响应时间）
      this.set(key, data, ttl).catch(error => {
        logger.warn(`异步缓存设置失败: ${key}`, error as Error);
      });

      return data;
    } catch (error) {
      logger.error(`数据获取失败: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * 批量获取缓存
   */
  async getMany<T = any>(
    keys: string[]
  ): Promise<Array<CacheOperationResult<T>>> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  /**
   * 批量设置缓存
   */
  async setMany<T>(
    keyValuePairs: Array<[string, T]>,
    ttl?: number
  ): Promise<boolean[]> {
    return Promise.all(
      keyValuePairs.map(([key, value]) => this.set(key, value, ttl))
    );
  }

  /**
   * 清空所有缓存层?   */
  async clearAll(): Promise<boolean> {
    try {
      // 清空L1缓存
      apiResponseCache.clear();

      // 清空L2缓存
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.flushAll();
      }

      logger.info('所有缓存层级已清空');
      return true;
    } catch (error) {
      logger.error('清空所有缓存失?, error as Error);
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    l1: ReturnType<typeof apiResponseCache.getStats>;
    l2: Awaited<ReturnType<RedisCacheManager['getStats']>> | null;
    pendingWrites: number;
  }> {
    const l2Stats =
      this.redisManager && this.redisManager.isConnected()
        ? await this.redisManager.getStats()
        : null;

    return {
      l1: apiResponseCache.getStats(),
      l2: l2Stats,
      pendingWrites: this.pendingWrites.size,
    };
  }

  /**
   * 预热缓存
   */
  async warmup<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    ttl?: number
  ): Promise<boolean> {
    try {
      const data = await dataFetcher();
      return await this.set(key, data, ttl);
    } catch (error) {
      logger.error(`缓存预热失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 批量预热缓存
   */
  async warmupMany<T>(
    items: Array<{ key: string; fetcher: () => Promise<T>; ttl?: number }>
  ): Promise<boolean[]> {
    return Promise.all(
      items.map(item => this.warmup(item.key, item.fetcher, item.ttl))
    );
  }

  /**
   * 检查缓存健康状?   */
  async healthCheck(): Promise<{
    l1: { status: 'healthy' | 'unhealthy'; message?: string };
    l2: { status: 'healthy' | 'unhealthy' | 'disabled'; message?: string };
  }> {
    const result = {
      l1: { status: 'healthy' as const },
      l2: { status: 'disabled' as const },
    };

    // 检查L1缓存
    try {
      // 简单的健康检?      apiResponseCache.get('__health_check__');
    } catch (error) {
      result.l1 = {
        status: 'unhealthy',
        message: (error as Error).message,
      };
    }

    // 检查L2缓存
    if (this.redisManager) {
      if (this.redisManager.isConnected()) {
        try {
          await this.redisManager.get('__health_check__');
          result.l2 = { status: 'healthy' };
        } catch (error) {
          result.l2 = {
            status: 'unhealthy',
            message: (error as Error).message,
          };
        }
      } else {
        result.l2 = {
          status: 'unhealthy',
          message: 'Redis连接未建?,
        };
      }
    }

    return result;
  }
}

// 创建默认的多级缓存管理器实例
let defaultManager: MultiLevelCacheManager | null = null;

export function getDefaultMultiLevelCache(): MultiLevelCacheManager {
  if (!defaultManager) {
    defaultManager = new MultiLevelCacheManager({
      l1: {
        ttl: 5 * 60 * 1000, // 5分钟
        maxSize: 1000,
      },
      l2: {
        enabled: true,
        ttl: 60 * 60, // 1小时
      },
      strategy: 'read-through',
    });
  }
  return defaultManager;
}

export default MultiLevelCacheManager;
