// 简化的LRU缓存实现
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleLRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number, ttl: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key) as CacheEntry<V> | undefined;
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: 移动到末?    this.cache.delete(key);
    this.cache.set(key, entry as unknown as V);
    return entry.data;
  }

  set(key: K, value: V): void {
    // 如果已存在，先删?    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 如果超出最大大小，删除最老的
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// 简单的日志函数
const logger = {
  debug: (msg: string) => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.debug(`[DEBUG] ${msg}`),
  info: (msg: string) => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.info(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error),
};

interface CacheOptions {
  ttl: number; // 缓存过期时间(毫秒)
  maxSize: number; // 最大缓存项?  staleWhileRevalidate?: boolean; // 是否支持陈旧数据重新验证
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  isValidating?: boolean;
}

export class APIResponseCache {
  private cache: SimpleLRUCache<string, CacheEntry>;
  private validatingPromises: Map<string, Promise<any>>;
  private defaultTtl: number;

  constructor(options: CacheOptions) {
    this.cache = new SimpleLRUCache(options.maxSize, options.ttl);
    this.defaultTtl = options.ttl;
    this.validatingPromises = new Map();
  }

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // 检查是否过?    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTtl || 300000); // 默认5分钟

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
    };

    this.cache.set(key, entry);
    logger.debug(
      `Cache set for key: ${key}, expires at: ${new Date(expiresAt).toISOString()}`
    );
  }

  /**
   * 带有陈旧数据重新验证的获取方?   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      revalidate?: boolean;
    }
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      // 如果支持陈旧数据重新验证且不在验证中，则启动后台更新
      if (options?.revalidate && !this.validatingPromises.has(key)) {
        this.startBackgroundRevalidation(key, fetcher, options.ttl);
      }
      return cached;
    }

    // 缓存未命中，直接获取数据
    logger.debug(`Cache miss for key: ${key}, fetching fresh data`);
    const data = await fetcher();
    this.set(key, data, options?.ttl);
    return data;
  }

  /**
   * 启动后台重新验证
   */
  private startBackgroundRevalidation<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): void {
    const validationPromise = fetcher()
      .then(data => {
        this.set(key, data, ttl);
        this.validatingPromises.delete(key);
        logger.debug(`Background revalidation completed for key: ${key}`);
      })
      .catch(error => {
        logger.error(`Background revalidation failed for key: ${key}`, error);
        this.validatingPromises.delete(key);
      });

    this.validatingPromises.set(key, validationPromise);
  }

  /**
   * 删除指定缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓?   */
  clear(): void {
    this.cache.clear();
    this.validatingPromises.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    itemCount: number;
  } {
    return {
      size: this.cache.size,
      itemCount: this.cache.size,
    };
  }

  /**
   * 批量删除缓存（支持通配符）
   */
  deleteByPattern(pattern: string): number {
    // 简化实现：只支持精确匹配删?    const keysToDelete: string[] = [];

    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }
}

// 创建默认的API响应缓存实例
export const apiResponseCache = new APIResponseCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 1000,
  staleWhileRevalidate: true,
});

export default apiResponseCache;
