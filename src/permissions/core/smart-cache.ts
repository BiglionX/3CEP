/**
 * 智能缓存管理? * 实现多级缓存策略，优化系统性能
 */

export interface CacheEntry<T = any> {
  /** 缓存?*/
  value: T;
  /** 创建时间?*/
  createdAt: number;
  /** 最后访问时间戳 */
  lastAccessed: number;
  /** 过期时间?*/
  expiresAt: number;
  /** 访问次数 */
  accessCount: number;
  /** 缓存?*/
  key: string;
  /** 缓存标签 */
  tags: string[];
}

export interface CacheConfig {
  /** 默认过期时间（毫秒） */
  defaultTTL: number;
  /** 最大缓存项?*/
  maxSize: number;
  /** 清理策略 */
  evictionPolicy: EvictionPolicy;
  /** 是否启用LRU */
  enableLRU: boolean;
  /** 是否启用统计 */
  enableStats: boolean;
  /** 预热策略 */
  warmupStrategy?: WarmupStrategy;
}

export enum EvictionPolicy {
  /** 最近最少使?*/
  LRU = 'LRU',
  /** 最近最久未使用 */
  LFU = 'LFU',
  /** 先进先出 */
  FIFO = 'FIFO',
  /** 时间优先 */
  TTL = 'TTL',
}

export interface WarmupStrategy {
  /** 预热函数 */
  warmer: () => Promise<void>;
  /** 预热间隔 */
  interval: number;
  /** 是否立即预热 */
  immediate: boolean;
}

export interface CacheStats {
  /** 总请求数 */
  totalRequests: number;
  /** 缓存命中?*/
  hits: number;
  /** 缓存未命中数 */
  misses: number;
  /** 命中?*/
  hitRate: number;
  /** 当前缓存大小 */
  size: number;
  /** 最大大?*/
  maxSize: number;
  /** 平均访问时间 */
  avgAccessTime: number;
  /** 内存使用?*/
  memoryUsage: number;
}

export class SmartCacheManager {
  private static instance: SmartCacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    totalRequests: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 0,
    avgAccessTime: 0,
    memoryUsage: 0,
  };
  private accessTimes: number[] = [];
  private warmupTimer: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 30000; // 30秒清理一?
  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5分钟
      maxSize: 1000,
      evictionPolicy: EvictionPolicy.LRU,
      enableLRU: true,
      enableStats: true,
      ...config,
    };

    this.stats.maxSize = this.config.maxSize;
    this.startCleanupProcess();
    this.setupWarmup();
  }

  static getInstance(config?: Partial<CacheConfig>): SmartCacheManager {
    if (!SmartCacheManager.instance) {
      SmartCacheManager.instance = new SmartCacheManager(config);
    }
    return SmartCacheManager.instance;
  }

  /**
   * 设置缓存?   */
  set<T>(
    key: string,
    value: T,
    options: {
      ttl?: number;
      tags?: string[];
    } = {}
  ): void {
    const { ttl = this.config.defaultTTL, tags = [] } = options;

    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + ttl,
      accessCount: 0,
      key,
      tags,
    };

    // 检查是否需要驱逐项
    if (this.cache.size >= this.config.maxSize) {
      this.evictEntries();
    }

    this.cache.set(key, entry);
    this.updateStats('set');
  }

  /**
   * 获取缓存?   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    this.stats.totalRequests++;

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过?    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新访问信息
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.stats.hits++;
    this.updateHitRate();
    this.recordAccessTime();

    return entry.value as T;
  }

  /**
   * 删除缓存?   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 根据标签清除缓存
   */
  clearByTags(tags: string[]): number {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 清空所有缓?   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 预热缓存
   */
  async warmup(): Promise<void> {
    if (this.config.warmupStrategy) {
      try {
        await this.config.warmupStrategy.warmer();
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?缓存预热完成')} catch (error) {
        console.error('�?缓存预热失败:', error);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * 获取缓存键列?   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取带标签的缓存?   */
  getKeysByTag(tag: string): string[] {
    return Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.tags.includes(tag))
      .map(([key, _]) => key);
  }

  /**
   * 检查键是否存在且未过期
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return entry.expiresAt > Date.now();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    // 清理过期项后再返回大?    this.cleanupExpired();
    return this.cache.size;
  }

  /**
   * 批量设置缓存
   */
  batchSet<T>(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ): void {
    entries.forEach(entry => {
      this.set(entry.key, entry.value, {
        ttl: entry.ttl,
        tags: entry.tags,
      });
    });
  }

  /**
   * 批量获取缓存
   */
  batchGet<T>(keys: string[]): Array<{ key: string; value: T | null }> {
    return keys.map(key => ({
      key,
      value: this.get<T>(key),
    }));
  }

  /**
   * 缓存包装?- 为函数调用添加缓?   */
  async cacheWrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const { forceRefresh = false, ttl, tags } = options;

    // 检查现有缓?    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // 执行函数并缓存结?    const result = await fn();
    this.set(key, result, { ttl, tags });

    return result;
  }

  /**
   * 启动清理进程
   */
  private startCleanupProcess(): void {
    setInterval(() => {
      this.cleanupExpired();
      this.enforceSizeLimit();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 设置预热
   */
  private setupWarmup(): void {
    if (this.config.warmupStrategy) {
      if (this.config.warmupStrategy.immediate) {
        this.warmup();
      }

      if (this.config.warmupStrategy.interval > 0) {
        this.warmupTimer = setInterval(() => {
          this.warmup();
        }, this.config.warmupStrategy!.interval);
      }
    }
  }

  /**
   * 清理过期?   */
  private cleanupExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🧹 清理?${expiredCount} 个过期缓存项`)}
  }

  /**
   * 强制大小限制
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) return;

    const excess = this.cache.size - this.config.maxSize;
    this.evictEntries(excess);
  }

  /**
   * 驱逐缓存项
   */
  private evictEntries(count: number = 1): void {
    const entries = Array.from(this.cache.entries());

    // 根据策略排序
    switch (this.config.evictionPolicy) {
      case EvictionPolicy.LRU:
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case EvictionPolicy.LFU:
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case EvictionPolicy.FIFO:
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
      case EvictionPolicy.TTL:
        entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
        break;
    }

    // 删除排在前面的项
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(operation: string): void {
    if (!this.config.enableStats) return;

    // 这里可以添加更详细的统计逻辑
    if (operation === 'set') {
      // 设置操作统计
    }
  }

  /**
   * 更新命中?   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    }
  }

  /**
   * 记录访问时间
   */
  private recordAccessTime(): void {
    this.accessTimes.push(Date.now());

    // 保持最?000次访问记?    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-1000);
    }

    // 计算平均访问时间
    if (this.accessTimes.length > 1) {
      const intervals = [];
      for (let i = 1; i < this.accessTimes.length; i++) {
        intervals.push(this.accessTimes[i] - this.accessTimes[i - 1]);
      }
      this.stats.avgAccessTime =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }
  }

  /**
   * 估算内存使用?   */
  private estimateMemoryUsage(): number {
    // 简单估算：每个缓存项约占用200字节
    return this.cache.size * 200;
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.warmupTimer) {
      clearInterval(this.warmupTimer);
      this.warmupTimer = null;
    }
    this.cache.clear();
    this.accessTimes = [];
  }
}
