/**
 * @file cache-service.ts
 * @description 缓存服务
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import { BaseService } from './base-service';

// 缓存?interface CacheItem<T = any> {
  value: T;
  expiry: number;
  createdAt: number;
}

/**
 * 缓存服务? */
export class CacheService extends BaseService {
  private localCache: Map<string, CacheItem> = new Map();
  private defaultTTL: number = 300;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super('CacheService');
    this.initializeLocalCache();
  }

  /**
   * 初始化本地缓?   */
  private initializeLocalCache(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000);
  }

  /**
   * 设置缓存?   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const expiry = Date.now() + ttl * 1000;
    const cacheItem: CacheItem<T> = {
      value,
      expiry,
      createdAt: Date.now(),
    };

    this.localCache.set(key, cacheItem);
    this.logOperation('设置缓存', { key, ttl });
  }

  /**
   * 获取缓存?   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.localCache.get(key);
    if (item && !this.isExpired(item)) {
      this.logOperation('缓存命中', { key });
      return item.value as T;
    }

    this.logOperation('缓存未命?, { key });
    return null;
  }

  /**
   * 删除缓存?   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.localCache.delete(key);
    if (deleted) {
      this.logOperation('删除缓存', { key });
    }
    return deleted;
  }

  /**
   * 清空所有缓?   */
  async clear(): Promise<void> {
    const count = this.localCache.size;
    this.localCache.clear();
    this.logOperation('清空所有缓?, { count });
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{ count: number; size: number }> {
    return {
      count: this.localCache.size,
      size: this.calculateCacheSize(),
    };
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const item = this.localCache.get(key);
    return item ? !this.isExpired(item) : false;
  }

  // 私有方法
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, item] of this.localCache.entries()) {
      if (now > item.expiry) {
        this.localCache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logOperation('清理过期缓存', { count: expiredCount });
    }
  }

  private calculateCacheSize(): number {
    let size = 0;
    for (const item of this.localCache.values()) {
      size += JSON.stringify(item).length;
    }
    return size;
  }

  /**
   * 销毁服?   */
  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.localCache.clear();
    await super.destroy();
  }
}
