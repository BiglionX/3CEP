/**
 * GitHub 数据缓存? *
 * 用于缓存 GitHub API 响应，减少速率限制影响
 * 缓存策略：内存缓存（TTL: 5 分钟? *
 * @module lib/github/cache
 */

import { GitHubRepoData, fetchRepoData } from './api';

/**
 * 缓存项接? */
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * 默认缓存时间（毫秒）
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

/**
 * 内存缓存存储
 */
const cache = new Map<string, CacheItem<GitHubRepoData>>();

/**
 * 检查缓存是否过? */
function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * 从缓存获取仓库数? *
 * @param repo - 仓库名称
 * @param ttl - 缓存时间（毫秒），默?5 分钟
 * @returns 缓存的仓库数据，如果缓存不存在或已过期则返回 null
 */
export function getCachedRepoData(
  repo: string,
  ttl: number = DEFAULT_CACHE_TTL
): GitHubRepoData | null {
  const item = cache.get(repo);

  if (!item) {
    return null;
  }

  if (isCacheExpired(item.timestamp, ttl)) {
    cache.delete(repo);
    return null;
  }

  return item.data;
}

/**
 * 将仓库数据存入缓? *
 * @param repo - 仓库名称
 * @param data - 仓库元数? */
export function setCachedRepoData(repo: string, data: GitHubRepoData): void {
  cache.set(repo, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * 获取或刷新仓库数据（带缓存）
 *
 * 优先从缓存读取，如果缓存不存在或已过期，则从 GitHub API 获取并更新缓? *
 * @param repo - 仓库名称
 * @param ttl - 缓存时间（毫秒），默?5 分钟
 * @returns 仓库元数? */
export async function getOrFetchRepoData(
  repo: string,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<GitHubRepoData> {
  // 尝试从缓存读?  const cached = getCachedRepoData(repo, ttl);
  if (cached) {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?使用缓存数据?{repo}`)return cached;
  }

  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔄 �?GitHub API 获取?{repo}`)// 缓存不存在或已过期，�?API 获取
  try {
    const data = await fetchRepoData(repo);
    setCachedRepoData(repo, data);
    return data;
  } catch (error) {
    // API 调用失败时，如果有过期的缓存数据，降级使?    const expiredCache = cache.get(repo);
    if (expiredCache) {
      console.warn(`⚠️  GitHub API 调用失败，使用过期缓存数据：${repo}`);
      return expiredCache.data;
    }

    throw error;
  }
}

/**
 * 批量获取或刷新多个仓库数据（带缓存）
 *
 * @param repos - 仓库名称列表
 * @param ttl - 缓存时间（毫秒），默?5 分钟
 * @returns 仓库元数据映射表
 */
export async function getOrFetchMultipleRepoData(
  repos: string[],
  ttl: number = DEFAULT_CACHE_TTL
): Promise<Record<string, GitHubRepoData>> {
  const results: Record<string, GitHubRepoData> = {};

  const promises = repos.map(async repo => {
    try {
      const data = await getOrFetchRepoData(repo, ttl);
      results[repo] = data;
    } catch (error) {
      console.error(`�?获取 ${repo} 数据失败:`, error);
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * 清除指定仓库的缓? *
 * @param repo - 仓库名称，如果不传则清除所有缓? */
export function clearCache(repo?: string): void {
  if (repo) {
    cache.delete(repo);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🗑�? 已清除缓存：${repo}`)} else {
    cache.clear();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🗑�? 已清除所有缓?)}
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  size: number;
  items: string[];
} {
  const now = Date.now();
  const validItems: string[] = [];

  cache.forEach((item, repo) => {
    if (!isCacheExpired(item.timestamp, DEFAULT_CACHE_TTL)) {
      validItems.push(repo);
    }
  });

  return {
    size: validItems.length,
    items: validItems,
  };
}

/**
 * 清理过期的缓存项
 */
export function cleanupExpiredCache(): number {
  let count = 0;

  cache.forEach((item, repo) => {
    if (isCacheExpired(item.timestamp, DEFAULT_CACHE_TTL)) {
      cache.delete(repo);
      count++;
    }
  });

  if (count > 0) {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🧹 清理?${count} 个过期缓存项`)}

  return count;
}

// 定期清理过期缓存（每 10 分钟?if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      cleanupExpiredCache();
    },
    10 * 60 * 1000
  );
}
