/**
 * 智能缓存Hook
 * 提供React应用中的缓存管理功能
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SmartCacheManager,
  CacheStats,
  EvictionPolicy,
} from '../core/smart-cache';

export interface UseSmartCacheOptions {
  /** 缓存实例名称 */
  instanceName?: string;
  /** 是否自动清理 */
  autoCleanup?: boolean;
  /** 清理间隔 */
  cleanupInterval?: number;
  /** 缓存配置 */
  cacheConfig?: {
    defaultTTL?: number;
    maxSize?: number;
    evictionPolicy?: EvictionPolicy;
  };
}

export interface SmartCacheHookResult<T = any> {
  // 状?  data: T | null;
  loading: boolean;
  error: string | null;
  cacheStats: CacheStats;

  // 操作函数
  getData: (key: string) => T | null;
  setData: (key: string, value: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  invalidateByTag: (tag: string) => number;
  refresh: (key: string) => void;
  clearAll: () => void;

  // 批量操作
  batchGet: (keys: string[]) => Array<{ key: string; value: T | null }>;
  batchSet: (entries: Array<{ key: string; value: T; ttl?: number }>) => void;

  // 缓存包装
  withCache: <R>(
    key: string,
    fetcher: () => Promise<R>,
    options?: { ttl?: number; tags?: string[] }
  ) => Promise<R>;
}

export function useSmartCache<T = any>(
  options: UseSmartCacheOptions = {}
): SmartCacheHookResult<T> {
  const {
    instanceName = 'default',
    autoCleanup = true,
    cleanupInterval = 30000,
    cacheConfig = {},
  } = options;

  // 状态管?  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalRequests: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 1000,
    avgAccessTime: 0,
    memoryUsage: 0,
  });

  // 获取缓存管理器实?  const cacheManager = useMemo(() => {
    return SmartCacheManager.getInstance({
      defaultTTL: cacheConfig.defaultTTL || 300000,
      maxSize: cacheConfig.maxSize || 1000,
      evictionPolicy: cacheConfig.evictionPolicy || EvictionPolicy.LRU,
      enableStats: true,
      enableLRU: true,
    });
  }, [cacheConfig]);

  // 获取数据
  const getData = useCallback(
    (key: string): T | null => {
      try {
        const value = cacheManager.get<T>(key);
        setCacheStats(cacheManager.getStats());
        return value;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取缓存数据失败';
        setError(errorMessage);
        return null;
      }
    },
    [cacheManager]
  );

  // 设置数据
  const setData = useCallback(
    (key: string, value: T, ttl?: number): void => {
      try {
        cacheManager.set(key, value, { ttl });
        setCacheStats(cacheManager.getStats());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '设置缓存数据失败';
        setError(errorMessage);
      }
    },
    [cacheManager]
  );

  // 使缓存失?  const invalidate = useCallback(
    (key: string): void => {
      try {
        cacheManager.delete(key);
        setCacheStats(cacheManager.getStats());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '删除缓存失败';
        setError(errorMessage);
      }
    },
    [cacheManager]
  );

  // 按标签使缓存失效
  const invalidateByTag = useCallback(
    (tag: string): number => {
      try {
        const count = cacheManager.clearByTags([tag]);
        setCacheStats(cacheManager.getStats());
        return count;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '按标签清理缓存失?;
        setError(errorMessage);
        return 0;
      }
    },
    [cacheManager]
  );

  // 刷新缓存
  const refresh = useCallback(
    (key: string): void => {
      try {
        cacheManager.delete(key);
        setCacheStats(cacheManager.getStats());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '刷新缓存失败';
        setError(errorMessage);
      }
    },
    [cacheManager]
  );

  // 清空所有缓?  const clearAll = useCallback((): void => {
    try {
      cacheManager.clearAll();
      setCacheStats(cacheManager.getStats());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清空缓存失败';
      setError(errorMessage);
    }
  }, [cacheManager]);

  // 批量获取
  const batchGet = useCallback(
    (keys: string[]): Array<{ key: string; value: T | null }> => {
      try {
        const results = cacheManager.batchGet<T>(keys);
        setCacheStats(cacheManager.getStats());
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '批量获取缓存失败';
        setError(errorMessage);
        return keys.map(key => ({ key, value: null }));
      }
    },
    [cacheManager]
  );

  // 批量设置
  const batchSet = useCallback(
    (entries: Array<{ key: string; value: T; ttl?: number }>): void => {
      try {
        cacheManager.batchSet(entries);
        setCacheStats(cacheManager.getStats());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '批量设置缓存失败';
        setError(errorMessage);
      }
    },
    [cacheManager]
  );

  // 缓存包装?  const withCache = useCallback(
    async <R>(
      key: string,
      fetcher: () => Promise<R>,
      options: { ttl?: number; tags?: string[] } = {}
    ): Promise<R> => {
      setLoading(true);
      setError(null);

      try {
        const result = await cacheManager.cacheWrap<R>(key, fetcher, {
          ttl: options.ttl,
          tags: options.tags,
        });

        setDataState(result as unknown as T);
        setCacheStats(cacheManager.getStats());
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '缓存包装执行失败';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cacheManager]
  );

  // 自动清理
  useEffect(() => {
    if (!autoCleanup) return;

    const interval = setInterval(() => {
      try {
        setCacheStats(cacheManager.getStats());
      } catch (err) {
        console.error('更新缓存统计失败:', err);
      }
    }, cleanupInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoCleanup, cleanupInterval, cacheManager]);

  // 组件卸载时清?  useEffect(() => {
    return () => {
      // 可以在这里添加清理逻辑
    };
  }, []);

  return {
    // 状?    data,
    loading,
    error,
    cacheStats,

    // 操作函数
    getData,
    setData,
    invalidate,
    invalidateByTag,
    refresh,
    clearAll,

    // 批量操作
    batchGet,
    batchSet,

    // 缓存包装
    withCache,
  };
}
