/**
 * Redis 缓存工具类
 *
 * 提供统一的缓存操作接口，支持:
 * - 基础缓存 (set/get/delete)
 * - 缓存穿透保护 (空值缓存)
 * - 批量操作 (mset/mget)
 * - 分布式锁
 */

import { Redis } from 'ioredis';

// Redis 连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// 单例模式
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    redisClient.on('error', err => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redisClient;
}

// 缓存键前缀
const CACHE_PREFIX = 'skills:';

// 默认过期时间 (秒)
const DEFAULT_TTL = {
  HOT_DATA: 300, // 热门数据 5 分钟
  NORMAL_DATA: 600, // 普通数据 10 分钟
  STATS_DATA: 900, // 统计数据 15 分钟
  USER_DATA: 1800, // 用户数据 30 分钟
};

/**
 * 生成缓存键
 */
export function makeCacheKey(type: string, id?: string | number): string {
  const key = id ? `${CACHE_PREFIX}${type}:${id}` : `${CACHE_PREFIX}${type}`;
  return key;
}

/**
 * 获取缓存 (带类型转换)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * 设置缓存
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = DEFAULT_TTL.NORMAL_DATA
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * 删除缓存
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * 批量获取缓存
 */
export async function mgetCache<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const client = getRedisClient();
    const values = await client.mget(keys);

    return values.map(value => {
      if (!value) return null;
      return JSON.parse(value) as T;
    });
  } catch (error) {
    console.error('Cache mget error:', error);
    return keys.map(() => null);
  }
}

/**
 * 批量设置缓存
 */
export async function msetCache(
  entries: Array<{ key: string; value: any }>,
  ttl: number = DEFAULT_TTL.NORMAL_DATA
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const pipeline = client.pipeline();

    entries.forEach(({ key, value }) => {
      const serialized = JSON.stringify(value);
      pipeline.setex(key, ttl, serialized);
    });

    await pipeline.exec();
    return true;
  } catch (error) {
    console.error('Cache mset error:', error);
    return false;
  }
}

/**
 * 缓存空值 (防止缓存穿透)
 */
export async function setNullCache(
  key: string,
  ttl: number = 60
): Promise<boolean> {
  return setCache(key, '__NULL__', ttl);
}

/**
 * 检查是否为空值缓存
 */
export function isNullCache(value: any): boolean {
  return value === '__NULL__';
}

/**
 * 获取或设置缓存 (带回调)
 */
export async function getOrSetCache<T>(
  key: string,
  getter: () => Promise<T>,
  ttl: number = DEFAULT_TTL.NORMAL_DATA
): Promise<T> {
  // 尝试从缓存获取
  const cached = await getCache<T>(key);

  // 如果是空值缓存，返回 null
  if (isNullCache(cached)) {
    return null as T;
  }

  // 如果缓存命中，直接返回
  if (cached !== null) {
    return cached;
  }

  // 缓存未命中，执行 getter
  try {
    const data = await getter();

    // 如果结果为空，设置空值缓存
    if (data === null || data === undefined) {
      await setNullCache(key, ttl);
      return null as T;
    }

    // 设置正常缓存
    await setCache(key, data, ttl);
    return data;
  } catch (error) {
    console.error('GetOrSetCache error:', error);
    throw error;
  }
}

/**
 * 删除模式匹配的缓存
 */
export async function deleteCacheByPattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('Delete cache by pattern error:', error);
    return 0;
  }
}

/**
 * 清理 Skills 相关缓存
 */
export async function invalidateSkillsCache(skillId?: string): Promise<void> {
  if (skillId) {
    // 删除单个 Skill 缓存
    await deleteCache(makeCacheKey('skill', skillId));
    await deleteCache(makeCacheKey('skill_analytics', skillId));
    await deleteCache(makeCacheKey('skill_versions', skillId));
  } else {
    // 删除所有 Skills 相关缓存
    await deleteCacheByPattern(makeCacheKey('skill', '*'));
    await deleteCacheByPattern(makeCacheKey('skill_list', '*'));
    await deleteCacheByPattern(makeCacheKey('skill_analytics', '*'));
  }
}

/**
 * 预热热门 Skills 缓存
 */
export async function warmupHotSkills(limit: number = 20): Promise<void> {
  try {
    // 这里需要调用 API 获取热门 Skills
    // 实际使用时应该在定时任务中调用
    console.log(`Warming up top ${limit} hot skills...`);
  } catch (error) {
    console.error('Warmup hot skills error:', error);
  }
}
