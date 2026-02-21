/**
 * 缓存管理器
 * 提供统一的缓存接口，支持内存缓存和Redis缓存
 */

interface CacheOptions {
  ttl?: number; // 过期时间（秒）
  prefix?: string; // 缓存键前缀
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
  createdAt: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 300; // 默认5分钟
  private readonly CLEANUP_INTERVAL = 60000; // 1分钟清理一次过期缓存

  private constructor() {
    // 启动定期清理过期缓存
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.CLEANUP_INTERVAL);
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const cacheKey = this.buildKey(key, options.prefix);
    const entry = this.memoryCache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(cacheKey);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 设置缓存值
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl ?? this.DEFAULT_TTL;
    const cacheKey = this.buildKey(key, options.prefix);

    const entry: CacheEntry<T> = {
      value,
      expiry: Date.now() + ttl * 1000,
      createdAt: Date.now(),
    };

    this.memoryCache.set(cacheKey, entry);
  }

  /**
   * 删除缓存
   */
  async delete(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.buildKey(key, prefix);
    this.memoryCache.delete(cacheKey);
  }

  /**
   * 清空指定前缀的所有缓存
   */
  async clearPrefix(prefix: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * 清空所有缓存
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    let expiredCount = 0;
    const now = Date.now();

    for (const entry of this.memoryCache.values()) {
      if (now > entry.expiry) {
        expiredCount++;
      }
    }

    return {
      totalEntries: this.memoryCache.size,
      expiredEntries: expiredCount,
      memoryUsage: this.calculateMemoryUsage(),
    };
  }

  /**
   * 构建完整的缓存键
   */
  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * 清理过期的缓存条目
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[CacheManager] 清理了 ${cleanedCount} 个过期缓存条目`);
    }
  }

  /**
   * 计算内存使用量（近似值）
   */
  private calculateMemoryUsage(): number {
    // 这是一个简化的内存使用估算
    // 实际生产环境中可能需要更精确的方法
    return this.memoryCache.size * 1024; // 假设每个条目约1KB
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance();

// 便捷函数
export const cache = {
  get: <T>(key: string, options?: CacheOptions) =>
    cacheManager.get<T>(key, options),
  set: <T>(key: string, value: T, options?: CacheOptions) =>
    cacheManager.set(key, value, options),
  delete: (key: string, prefix?: string) => cacheManager.delete(key, prefix),
  clearPrefix: (prefix: string) => cacheManager.clearPrefix(prefix),
  clearAll: () => cacheManager.clearAll(),
  stats: () => cacheManager.getStats(),
};
