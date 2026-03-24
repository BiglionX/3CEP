/**
 * 缓存管理器
 *
 * 基于内存的高性能缓存实现，支持多种淘汰策略和自动失效
 *
 * @example
 * // 基本使用
 * await cache.set('user:123', userData, { ttl: 300000 });
 * const user = await cache.get('user:123');
 *
 * @example
 * // 使用预定义策略
 * await cache.setWithStrategy('config:app', configData, 'CONFIGURATION');
 */

import { CacheStrategy, EvictionPolicy } from '@/config/cache.config';

/**
 * 缓存项
 */
interface CacheItem<T> {
  value: T;
  /** 创建时间戳 */
  timestamp: number;
  /** 最后访问时间戳 */
  lastAccessed: number;
  /** 访问次数（用于 LFU） */
  accessCount: number;
  /** 过期时间戳 */
  expiresAt: number;
}

/**
 * 缓存统计信息
 */
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  hitRate: number;
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  private store: Map<string, CacheItem<any>>;
  private maxSize: number;
  private defaultTtl: number;
  private evictionPolicy: EvictionPolicy;

  // 统计信息
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  // 定期清理过期项的定时器
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options?: {
    maxSize?: number;
    defaultTtl?: number;
    evictionPolicy?: EvictionPolicy;
    autoCleanup?: boolean;
    cleanupInterval?: number;
  }) {
    const {
      maxSize = 1000,
      defaultTtl = 5 * 60 * 1000, // 5 分钟
      evictionPolicy = 'LRU',
      autoCleanup = true,
      cleanupInterval = 60 * 1000, // 1 分钟
    } = options || {};

    this.store = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.evictionPolicy = evictionPolicy;

    // 启动自动清理
    if (autoCleanup) {
      this.startAutoCleanup(cleanupInterval);
    }
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新访问信息
    item.lastAccessed = Date.now();
    item.accessCount++;

    this.stats.hits++;
    this.updateHitRate();

    return item.value as T;
  }

  /**
   * 设置缓存值
   */
  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; strategy?: CacheStrategy }
  ): Promise<void> {
    const { ttl = options?.strategy?.ttl || this.defaultTtl } = options || {};

    // 如果缓存已满，执行淘汰
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evict();
    }

    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      timestamp: now,
      lastAccessed: now,
      accessCount: 0,
      expiresAt: now + ttl,
    };

    this.store.set(key, item);
    this.stats.sets++;
    this.stats.size = this.store.size;
  }

  /**
   * 使用策略设置缓存
   */
  async setWithStrategy<T>(
    key: string,
    value: T,
    strategyName: string
  ): Promise<void> {
    // 这里应该从 CacheConfig 获取策略，但为避免循环依赖，直接传策略对象
    await this.set(key, value, {
      ttl: this.defaultTtl,
    });
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.store.size;
    }
    return deleted;
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.store.clear();
    this.stats.size = 0;
    console.log('[Cache] 缓存已清空');
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return false;

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.store.size;
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.store.size,
      hitRate: 0,
    };
  }

  /**
   * 批量获取
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * 批量设置
   */
  async setMany<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<void> {
    for (const { key, value, ttl } of entries) {
      await this.set(key, value, { ttl });
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * 获取所有值
   */
  values<T>(): T[] {
    return Array.from(this.store.values()).map(item => item.value as T);
  }

  /**
   * 强制淘汰缓存项
   */
  private evict(): void {
    if (this.store.size === 0) return;

    let keyToDelete: string | null = null;

    switch (this.evictionPolicy) {
      case 'LRU': // 最近最少使用
        keyToDelete = this.findLRUKey();
        break;

      case 'LFU': // 最不经常使用
        keyToDelete = this.findLFUKey();
        break;

      case 'FIFO': // 先进先出
        keyToDelete = this.findFIFOKey();
        break;

      case 'TTL': // 即将过期
        keyToDelete = this.findTTLKey();
        break;

      default:
        keyToDelete = this.findLRUKey();
    }

    if (keyToDelete) {
      this.store.delete(keyToDelete);
      this.stats.evictions++;
      this.stats.size = this.store.size;
    }
  }

  /**
   * 查找 LRU 键
   */
  private findLRUKey(): string | null {
    let lruKey: string | null = null;
    let minAccessTime = Infinity;

    for (const [key, item] of this.store.entries()) {
      if (item.lastAccessed < minAccessTime) {
        minAccessTime = item.lastAccessed;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * 查找 LFU 键
   */
  private findLFUKey(): string | null {
    let lfuKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, item] of this.store.entries()) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount;
        lfuKey = key;
      }
    }

    return lfuKey;
  }

  /**
   * 查找 FIFO 键
   */
  private findFIFOKey(): string | null {
    let fifoKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.store.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        fifoKey = key;
      }
    }

    return fifoKey;
  }

  /**
   * 查找 TTL 键（即将过期的）
   */
  private findTTLKey(): string | null {
    let ttlKey: string | null = null;
    let soonestExpiry = Infinity;

    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt < soonestExpiry) {
        soonestExpiry = item.expiresAt;
        ttlKey = key;
      }
    }

    return ttlKey;
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(interval: number): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    this.stats.size = this.store.size;

    if (cleaned > 0) {
      console.log(`[Cache] 清理了 ${cleaned} 个过期项`);
    }
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * 导出缓存数据（用于持久化或调试）
   */
  export(): Array<{ key: string; value: any; expiresAt: number }> {
    return Array.from(this.store.entries()).map(([key, item]) => ({
      key,
      value: item.value,
      expiresAt: item.expiresAt,
    }));
  }

  /**
   * 导入缓存数据
   */
  import(data: Array<{ key: string; value: any; expiresAt: number }>): void {
    const now = Date.now();

    for (const { key, value, expiresAt } of data) {
      // 只导入未过期的数据
      if (now < expiresAt && this.store.size < this.maxSize) {
        this.store.set(key, {
          value,
          timestamp: now,
          lastAccessed: now,
          accessCount: 0,
          expiresAt,
        });
      }
    }

    this.stats.size = this.store.size;
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.store.clear();
    console.log('[Cache] 缓存管理器已销毁');
  }
}

// 创建默认缓存实例
export const cache = new CacheManager({
  maxSize: 1000,
  defaultTtl: 5 * 60 * 1000,
  evictionPolicy: 'LRU',
  autoCleanup: true,
  cleanupInterval: 60 * 1000,
});

// 创建不同用途的缓存实例
export const hotDataCache = new CacheManager({
  maxSize: 1000,
  defaultTtl: 5 * 60 * 1000,
  evictionPolicy: 'LRU',
});

export const configCache = new CacheManager({
  maxSize: 500,
  defaultTtl: 60 * 60 * 1000,
  evictionPolicy: 'LFU',
});

export const sessionCache = new CacheManager({
  maxSize: 10000,
  defaultTtl: 30 * 60 * 1000,
  evictionPolicy: 'LRU',
});

export default cache;
