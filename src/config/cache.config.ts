/**
 * 缓存配置
 *
 * 定义各类型数据的缓存策略
 */

export interface CacheStrategy {
  ttl: number; // 生存时间（秒）
  enabled: boolean; // 是否启用
  staleWhileRevalidate?: boolean; // 是否允许过期时重新验证
}

/**
 * 缓存配置映射表
 */
export const CACHE_CONFIG: Record<string, CacheStrategy> = {
  // 智能体相关
  'agent:list': {
    ttl: 300, // 5 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },
  'agent:detail': {
    ttl: 120, // 2 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },
  'agent:stats': {
    ttl: 600, // 10 分钟
    enabled: true,
    staleWhileRevalidate: false,
  },
  'agent:permissions': {
    ttl: 1800, // 30 分钟
    enabled: true,
    staleWhileRevalidate: false,
  },

  // 用户相关
  'user:profile': {
    ttl: 900, // 15 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },
  'user:permissions': {
    ttl: 1800, // 30 分钟
    enabled: true,
    staleWhileRevalidate: false,
  },

  // 告警相关
  'alert:rules': {
    ttl: 600, // 10 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },
  'alert:history': {
    ttl: 300, // 5 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },

  // 历史数据相关
  'history:agent-status': {
    ttl: 600, // 10 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },
  'history:alerts': {
    ttl: 300, // 5 分钟
    enabled: true,
    staleWhileRevalidate: true,
  },

  // 分析统计相关
  'analytics:overview': {
    ttl: 3600, // 1 小时
    enabled: true,
    staleWhileRevalidate: true,
  },
  'analytics:detailed': {
    ttl: 1800, // 30 分钟
    enabled: true,
    staleWhileRevalidate: false,
  },
};

/**
 * 获取缓存策略
 */
export function getCacheStrategy(key: string): CacheStrategy | undefined {
  // 精确匹配
  if (CACHE_CONFIG[key]) {
    return CACHE_CONFIG[key];
  }

  // 前缀匹配
  const prefix = key.split(':')[0];
  for (const [configKey, strategy] of Object.entries(CACHE_CONFIG)) {
    if (key.startsWith(configKey)) {
      return strategy;
    }
  }

  // 默认策略
  return {
    ttl: 300, // 5 分钟
    enabled: true,
    staleWhileRevalidate: false,
  };
}

/**
 * 检查缓存是否启用
 */
export function isCacheEnabled(): boolean {
  // 检查是否有 Redis 配置
  return !!(process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_HOST);
}

/**
 * 获取环境信息
 */
export function getCacheEnvironment(): 'upstash' | 'self-hosted' | 'memory' {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return 'upstash';
  }

  if (process.env.REDIS_HOST) {
    return 'self-hosted';
  }

  return 'memory';
}
