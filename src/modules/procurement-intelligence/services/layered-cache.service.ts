/**
 * 分层缓存服务
 * 实现多级缓存架构，支持自动降级和缓存穿透保? */

import {
  CACHE_STRATEGIES,
  CacheStrategyConfig,
  CacheInvalidationRule,
  CACHE_INVALIDATION_RULES,
} from '../config/cache-strategy.config';
import { procurementCache, CacheKey } from './redis-cache.service';

interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  layer: string;
  compressed?: boolean;
}

interface LayerStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

interface CacheMetrics {
  totalHits: number;
  totalMisses: number;
  overallHitRate: number;
  layerStats: Record<string, LayerStats>;
  memoryUsage: number;
  lastUpdated: number;
}

export class LayeredCacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private layerStats: Record<string, LayerStats> = {};
  private metrics: CacheMetrics = {
    totalHits: 0,
    totalMisses: 0,
    overallHitRate: 0,
    layerStats: {},
    memoryUsage: 0,
    lastUpdated: Date.now(),
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeLayers();
    this.startCleanupProcess();
  }

  /**
   * 初始化缓存层
   */
  private initializeLayers(): void {
    // 初始化各层统计信?    Object.values(CACHE_STRATEGIES).forEach(strategy => {
      strategy.layers.forEach(layer => {
        this.layerStats[layer.name] = {
          hits: 0,
          misses: 0,
          evictions: 0,
          size: 0,
          hitRate: 0,
        };
      });
    });
  }

  /**
   * 启动清理进程
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
      this.updateMetrics();
    }, 30000); // �?0秒清理一?  }

  /**
   * 清理过期条目
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let evictedCount = 0;

    // 清理内存缓存
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key);
        evictedCount++;
        this.incrementStat(entry.layer, 'evictions');
      }
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ocache cleanup: ${evictedCount} expired entries removed`)}

  /**
   * 更新统计指标
   */
  private updateMetrics(): void {
    const totalHits = Object.values(this.layerStats).reduce(
      (sum, stats) => sum + stats.hits,
      0
    );
    const totalMisses = Object.values(this.layerStats).reduce(
      (sum, stats) => sum + stats.misses,
      0
    );
    const totalRequests = totalHits + totalMisses;

    this.metrics = {
      totalHits,
      totalMisses,
      overallHitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      layerStats: { ...this.layerStats },
      memoryUsage: this.getMemoryUsage(),
      lastUpdated: Date.now(),
    };
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    // 简化的内存使用计算
    const entrySize = 200; // 估算每个缓存条目大小(字节)
    return this.memoryCache.size * entrySize;
  }

  /**
   * 获取指定策略的缓?   */
  async get<T = any>(
    key: string,
    strategyName: keyof typeof CACHE_STRATEGIES = 'HOT_DATA'
  ): Promise<T | null> {
    const strategy = CACHE_STRATEGIES[strategyName];
    if (!strategy) {
      throw new Error(`Unknown cache strategy: ${strategyName}`);
    }

    // 按优先级顺序检查各层缓?    for (const layer of strategy.layers.sort(
      (a, b) => a.priority - b.priority
    )) {
      const result = await this.getFromLayer<T>(key, layer, strategy);
      if (result !== null) {
        this.incrementStat(layer.name, 'hits');
        this.metrics.totalHits++;
        return result;
      }
      this.incrementStat(layer.name, 'misses');
      this.metrics.totalMisses++;
    }

    return null;
  }

  /**
   * 从指定层获取缓存
   */
  private async getFromLayer<T>(
    key: string,
    layer: any,
    strategy: CacheStrategyConfig
  ): Promise<T | null> {
    const fullKey = `${strategy.keyPrefix}${key}`;

    switch (layer.name) {
      case 'memory-local':
        return this.getFromMemory<T>(fullKey, layer);

      case 'redis-shared':
        return await this.getFromRedis<T>(fullKey, layer.ttl);

      case 'database-persistent':
        return await this.getFromDatabase<T>(fullKey);

      default:
        return null;
    }
  }

  /**
   * 从内存获?   */
  private getFromMemory<T>(key: string, layer: any): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    this.layerStats[layer.name].size = this.memoryCache.size;
    return entry.value as T;
  }

  /**
   * 从Redis获取
   */
  private async getFromRedis<T>(key: string, ttl: number): Promise<T | null> {
    try {
      const result = await procurementCache.get(
        key.replace(/^.*?:/, ''),
        CacheKey.SUPPLIER_PROFILE
      );
      return result as T;
    } catch (error) {
      console.warn('Redis cache read failed:', error);
      return null;
    }
  }

  /**
   * 从数据库获取
   */
  private async getFromDatabase<T>(key: string): Promise<T | null> {
    // 这里应该实现数据库缓存逻辑
    // 为简化示例，返回null
    return null;
  }

  /**
   * 设置缓存
   */
  async set<T>(
    key: string,
    value: T,
    strategyName: keyof typeof CACHE_STRATEGIES = 'HOT_DATA',
    customTTL?: number
  ): Promise<boolean> {
    const strategy = CACHE_STRATEGIES[strategyName];
    if (!strategy) {
      throw new Error(`Unknown cache strategy: ${strategyName}`);
    }

    const successResults: boolean[] = [];
    const fullKey = `${strategy.keyPrefix}${key}`;
    const ttl = customTTL || strategy.defaultTTL;

    // 按优先级逆序设置各层缓存（从底层到高层）
    for (const layer of strategy.layers.sort(
      (a, b) => b.priority - a.priority
    )) {
      const success = await this.setInLayer(
        fullKey,
        value,
        layer,
        ttl,
        strategy
      );
      successResults.push(success);
    }

    return successResults.some(result => result);
  }

  /**
   * 在指定层设置缓存
   */
  private async setInLayer<T>(
    key: string,
    value: T,
    layer: any,
    ttl: number,
    strategy: CacheStrategyConfig
  ): Promise<boolean> {
    switch (layer.name) {
      case 'memory-local':
        return this.setInMemory(key, value, layer, ttl);

      case 'redis-shared':
        return await this.setInRedis(key, value, ttl);

      case 'database-persistent':
        return await this.setInDatabase(key, value, ttl);

      default:
        return false;
    }
  }

  /**
   * 设置内存缓存
   */
  private setInMemory<T>(
    key: string,
    value: T,
    layer: any,
    ttl: number
  ): boolean {
    // 检查大小限?    if (layer.maxSize && this.memoryCache.size >= layer.maxSize) {
      this.evictEntries(layer.name, layer.evictionPolicy);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      layer: layer.name,
    };

    this.memoryCache.set(key, entry);
    this.layerStats[layer.name].size = this.memoryCache.size;
    return true;
  }

  /**
   * 驱逐条?   */
  private evictEntries(layerName: string, policy: string): void {
    const entries = Array.from(this.memoryCache.entries());

    switch (policy) {
      case 'LRU': // 最近最少使?        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'LFU': // 最少频繁使用（简化实现）
        // 在实际实现中应该跟踪访问频率
        entries.sort(() => Math.random() - 0.5);
        break;
      case 'FIFO': // 先进先出
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
    }

    // 删除最早的条目
    const [keyToDelete] = entries[0];
    this.memoryCache.delete(keyToDelete);
    this.incrementStat(layerName, 'evictions');
  }

  /**
   * 设置Redis缓存
   */
  private async setInRedis<T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<boolean> {
    try {
      const cacheKey = key.replace(/^.*?:/, '');
      return await procurementCache.set(
        cacheKey,
        value,
        CacheKey.SUPPLIER_PROFILE,
        ttl
      );
    } catch (error) {
      console.warn('Redis cache write failed:', error);
      return false;
    }
  }

  /**
   * 设置数据库缓?   */
  private async setInDatabase<T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<boolean> {
    // 这里应该实现数据库缓存逻辑
    return true;
  }

  /**
   * 缓存失效
   */
  async invalidate(pattern: string, cascade: boolean = true): Promise<void> {
    // 查找匹配的失效规?    const rules = CACHE_INVALIDATION_RULES.filter(rule =>
      new RegExp('^' + rule.pattern.replace('*', '.*') + '$').test(pattern)
    );

    for (const rule of rules) {
      await this.invalidateByRule(pattern, rule);

      if (cascade && rule.cascadeInvalidate) {
        await this.cascadeInvalidate(pattern, rule);
      }
    }
  }

  /**
   * 根据规则失效缓存
   */
  private async invalidateByRule(
    pattern: string,
    rule: CacheInvalidationRule
  ): Promise<void> {
    // 失效内存缓存
    if (rule.affectedLayers.includes('memory-local')) {
      for (const key of this.memoryCache.keys()) {
        if (new RegExp('^' + pattern.replace('*', '.*') + '$').test(key)) {
          this.memoryCache.delete(key);
        }
      }
    }

    // 失效Redis缓存
    if (rule.affectedLayers.includes('redis-shared')) {
      try {
        await procurementCache.invalidatePattern(pattern);
      } catch (error) {
        console.warn('Redis cache invalidation failed:', error);
      }
    }
  }

  /**
   * 级联失效
   */
  private async cascadeInvalidate(
    pattern: string,
    rule: CacheInvalidationRule
  ): Promise<void> {
    // 这里可以实现依赖关系的级联失?    // 例如：供应商信息变更时，相关的排名缓存也需要失?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Cascade invalidation triggered for pattern: ${pattern}`)}

  /**
   * 增加统计数据
   */
  private incrementStat(layerName: string, statType: keyof LayerStats): void {
    if (this.layerStats[layerName]) {
      this.layerStats[layerName][statType]++;

      // 更新命中?      const stats = this.layerStats[layerName];
      const total = stats.hits + stats.misses;
      stats.hitRate = total > 0 ? stats.hits / total : 0;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * 清空所有缓?   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();

    // 清空各层统计
    Object.keys(this.layerStats).forEach(layerName => {
      this.layerStats[layerName] = {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
        hitRate: 0,
      };
    });

    // 清空Redis缓存
    await procurementCache.flushAll();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('All cache layers cleared')}

  /**
   * 关闭服务
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    await this.clearAll();
  }
}

// 导出单例实例
export const layeredCache = new LayeredCacheService();
