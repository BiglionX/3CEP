// 采购智能体Redis缓存服务
// 提供高性能缓存解决方案，支持多种缓存策略和键空间管?
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';

// 缓存配置接口
interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  defaultTTL: number;
  connectionPool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
  };
}

// 缓存统计信息
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  memoryUsage: string;
  connectedClients: number;
}

// 缓存键枚?export enum CacheKey {
  SUPPLIER_PROFILE = 'supplier:profile:',
  SUPPLIER_RANKING = 'supplier:ranking:',
  MARKET_INTELLIGENCE = 'market:intelligence:',
  PRICE_INDEX = 'price:index:',
  RISK_ASSESSMENT = 'risk:assessment:',
  CONTRACT_ADVICE = 'contract:advice:',
  ANALYTICS_DASHBOARD = 'analytics:dashboard:',
}

export class ProcurementCacheService {
  private redis: Redis | null = null;
  private isEnabled: boolean = false;
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    hitRate: 0,
    memoryUsage: '0MB',
    connectedClients: 0,
  };

  constructor() {
    this.config = this.loadConfig();
    this.initRedis();
  }

  /**
   * 加载缓存配置
   */
  private loadConfig(): CacheConfig {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'procurement:',
      defaultTTL: 3600, // 默认1小时
      connectionPool: {
        min: 5,
        max: 20,
        acquireTimeoutMillis: 5000,
      },
    };
  }

  /**
   * 初始化Redis连接
   */
  private async initRedis(): Promise<void> {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        retryStrategy: times => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true,
      });

      // 连接事件监听
      this.redis.on('connect', () => {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?采购智能体Redis缓存连接成功')this.isEnabled = true;
        this.updateStats();
      });

      this.redis.on('error', error => {
        console.warn('⚠️ 采购智能体Redis连接错误:', error.message);
        this.isEnabled = false;
      });

      this.redis.on('close', () => {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔒 采购智能体Redis连接关闭')this.isEnabled = false;
      });

      // 尝试连接
      await this.redis.connect();
    } catch (error) {
      console.warn('⚠️ 采购智能体Redis初始化失?', (error as Error).message);
      this.isEnabled = false;
    }
  }

  /**
   * 生成完整缓存?   */
  private generateKey(key: string, prefix: CacheKey): string {
    return `${this.config.keyPrefix}${prefix}${key}`;
  }

  /**
   * 设置缓存
   */
  async set(
    key: string,
    value: any,
    prefix: CacheKey = CacheKey.SUPPLIER_PROFILE,
    ttl: number = this.config.defaultTTL
  ): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, prefix);
      const serializedValue = JSON.stringify(value);

      await this.redis.setex(cacheKey, ttl, serializedValue);
      this.stats.sets++;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache set: ${cacheKey}, TTL: ${ttl}s`)return true;
    } catch (error) {
      console.error('缓存设置失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(
    key: string,
    prefix: CacheKey = CacheKey.SUPPLIER_PROFILE
  ): Promise<T | null> {
    if (!this.isEnabled || !this.redis) {
      this.stats.misses++;
      return null;
    }

    try {
      const cacheKey = this.generateKey(key, prefix);
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        this.stats.hits++;
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache hit: ${cacheKey}`)return JSON.parse(cached) as T;
      } else {
        this.stats.misses++;
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache miss: ${cacheKey}`)return null;
      }
    } catch (error) {
      console.error('缓存获取失败:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(
    key: string,
    prefix: CacheKey = CacheKey.SUPPLIER_PROFILE
  ): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, prefix);
      await this.redis.del(cacheKey);
      this.stats.deletes++;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache deleted: ${cacheKey}`)return true;
    } catch (error) {
      console.error('缓存删除失败:', error);
      return false;
    }
  }

  /**
   * 批量删除缓存（按前缀?   */
  async deleteByPrefix(prefix: CacheKey): Promise<number> {
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      const pattern = `${this.config.keyPrefix}${prefix}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.deletes += keys.length;
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `ocache批量删除: ${keys.length} keys with pattern ${pattern}`
        )}

      return keys.length;
    } catch (error) {
      console.error('批量删除缓存失败:', error);
      return 0;
    }
  }

  /**
   * 更新统计信息
   */
  private async updateStats(): Promise<void> {
    if (!this.isEnabled || !this.redis) return;

    try {
      const info = await this.redis.info();
      const lines = info.split('\n');

      // 解析Redis信息
      const redisInfo: Record<string, string> = {};
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          redisInfo[key.trim()] = value.trim();
        }
      });

      // 更新统计信息
      this.stats.memoryUsage = redisInfo['used_memory_human'] || '0MB';
      this.stats.connectedClients = parseInt(
        redisInfo['connected_clients'] || '0'
      );

      // 计算命中?      const totalAccesses = this.stats.hits + this.stats.misses;
      this.stats.hitRate =
        totalAccesses > 0 ? (this.stats.hits / totalAccesses) * 100 : 0;
    } catch (error) {
      console.error('更新缓存统计失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    await this.updateStats();
    return { ...this.stats };
  }

  /**
   * 检查缓存健康状?   */
  async healthCheck(): Promise<{
    enabled: boolean;
    ping: string;
    memory: string;
    clients: number;
  }> {
    if (!this.isEnabled || !this.redis) {
      return {
        enabled: false,
        ping: 'failed',
        memory: '0MB',
        clients: 0,
      };
    }

    try {
      const ping = await this.redis.ping();
      const stats = await this.getStats();

      return {
        enabled: true,
        ping,
        memory: stats.memoryUsage,
        clients: stats.connectedClients,
      };
    } catch (error) {
      return {
        enabled: false,
        ping: 'failed',
        memory: '0MB',
        clients: 0,
      };
    }
  }

  /**
   * 按模式失效缓?   */
  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      // 使用SCAN命令查找匹配的键
      let cursor = '0';
      let deletedCount = 0;
      const fullPattern = `${this.config.keyPrefix}${pattern}`;

      do {
        const result = await this.redis.scan(
          cursor,
          'MATCH',
          fullPattern,
          'COUNT',
          100
        );
        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          await this.redis.del(...keys);
          deletedCount += keys.length;
          this.stats.deletes += keys.length;
        }
      } while (cursor !== '0');

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `ocache invalidated ${deletedCount} keys matching pattern: ${pattern}`
      )return deletedCount;
    } catch (error) {
      console.error('Pattern invalidation failed:', error);
      return 0;
    }
  }

  /**
   * 清空所有缓?   */
  async flushAll(): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      // 只清空当前应用的键空?      const pattern = `${this.config.keyPrefix}*`;
      await this.invalidatePattern(
        pattern.replace(`${this.config.keyPrefix}`, '')
      );
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('ocache flushed all procurement intelligence cache')} catch (error) {
      console.error('Cache flush failed:', error);
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isEnabled = false;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔒 采购智能体Redis缓存连接已关?)}
  }
}

// 导出全局实例
export const procurementCache = new ProcurementCacheService();

// 缓存装饰器工厂函?export function Cached(prefix: CacheKey, ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存?      const cacheKey = args
        .map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
        .join(':');

      // 尝试从缓存获?      const cached = await procurementCache.get(cacheKey, prefix);
      if (cached) {
        return cached;
      }

      // 执行原方?      const result = await originalMethod.apply(this, args);

      // 缓存结果
      if (result) {
        await procurementCache.set(cacheKey, result, prefix, ttl);
      }

      return result;
    };

    return descriptor;
  };
}
