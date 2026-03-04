/**
 * 分层缓存策略配置
 * 实现多级缓存架构，包括内存缓存、Redis缓存和数据库缓存
 */

export interface CacheLayerConfig {
  name: string;
  priority: number;
  ttl: number;
  maxSize?: number;
  evictionPolicy?: 'LRU' | 'LFU' | 'FIFO';
  compression?: boolean;
  fallbackToNextLayer?: boolean;
}

export interface CacheStrategyConfig {
  layers: CacheLayerConfig[];
  defaultTTL: number;
  keyPrefix: string;
  compressionThreshold: number;
  enableMetrics: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface CacheInvalidationRule {
  pattern: string;
  affectedLayers: string[];
  cascadeInvalidate: boolean;
  notifyDependents: boolean;
}

export const CACHE_STRATEGIES = {
  // 热点数据缓存策略 - 最高级别优先级
  HOT_DATA: {
    layers: [
      {
        name: 'memory-local',
        priority: 1,
        ttl: 300, // 5分钟
        maxSize: 1000,
        evictionPolicy: 'LRU' as const,
        compression: false,
        fallbackToNextLayer: true,
      },
      {
        name: 'redis-shared',
        priority: 2,
        ttl: 1800, // 30分钟
        evictionPolicy: 'LRU' as const,
        compression: true,
        fallbackToNextLayer: true,
      },
      {
        name: 'database-persistent',
        priority: 3,
        ttl: 86400, // 24小时
        fallbackToNextLayer: false,
      },
    ],
    defaultTTL: 300,
    keyPrefix: 'hot:',
    compressionThreshold: 1024,
    enableMetrics: true,
    autoRefresh: true,
    refreshInterval: 240,
  },

  // 配置数据缓存策略 - 中等优先?  CONFIGURATION: {
    layers: [
      {
        name: 'memory-local',
        priority: 1,
        ttl: 3600, // 1小时
        maxSize: 500,
        evictionPolicy: 'LFU' as const,
        compression: false,
        fallbackToNextLayer: true,
      },
      {
        name: 'redis-shared',
        priority: 2,
        ttl: 21600, // 6小时
        evictionPolicy: 'LFU' as const,
        compression: true,
        fallbackToNextLayer: false,
      },
    ],
    defaultTTL: 3600,
    keyPrefix: 'config:',
    compressionThreshold: 512,
    enableMetrics: true,
    autoRefresh: false,
    refreshInterval: 0,
  },

  // 用户会话缓存策略 - 高安全性要?  USER_SESSION: {
    layers: [
      {
        name: 'memory-local',
        priority: 1,
        ttl: 1800, // 30分钟
        maxSize: 10000,
        evictionPolicy: 'LRU' as const,
        compression: false,
        fallbackToNextLayer: false,
      },
    ],
    defaultTTL: 1800,
    keyPrefix: 'session:',
    compressionThreshold: 0,
    enableMetrics: true,
    autoRefresh: true,
    refreshInterval: 900,
  },

  // 计算结果缓存策略 - CPU密集型操?  COMPUTATION: {
    layers: [
      {
        name: 'memory-local',
        priority: 1,
        ttl: 7200, // 2小时
        maxSize: 2000,
        evictionPolicy: 'LRU' as const,
        compression: true,
        fallbackToNextLayer: true,
      },
      {
        name: 'redis-shared',
        priority: 2,
        ttl: 86400, // 24小时
        evictionPolicy: 'LRU' as const,
        compression: true,
        fallbackToNextLayer: false,
      },
    ],
    defaultTTL: 7200,
    keyPrefix: 'compute:',
    compressionThreshold: 2048,
    enableMetrics: true,
    autoRefresh: false,
    refreshInterval: 0,
  },
};

// 缓存失效规则
export const CACHE_INVALIDATION_RULES: CacheInvalidationRule[] = [
  {
    pattern: 'supplier:*',
    affectedLayers: ['memory-local', 'redis-shared'],
    cascadeInvalidate: true,
    notifyDependents: true,
  },
  {
    pattern: 'market:*',
    affectedLayers: ['memory-local', 'redis-shared'],
    cascadeInvalidate: true,
    notifyDependents: false,
  },
  {
    pattern: 'config:*',
    affectedLayers: ['memory-local', 'redis-shared'],
    cascadeInvalidate: true,
    notifyDependents: true,
  },
  {
    pattern: 'user:*',
    affectedLayers: ['memory-local'],
    cascadeInvalidate: false,
    notifyDependents: false,
  },
];

// 缓存键命名规?export const CACHE_KEY_PATTERNS = {
  SUPPLIER_PROFILE: 'supplier:profile:{id}',
  SUPPLIER_RANKING: 'supplier:ranking:{category}:{region}',
  MARKET_PRICE: 'market:price:{product}:{date}',
  USER_PERMISSIONS: 'user:permissions:{userId}',
  CONFIG_SETTINGS: 'config:settings:{module}',
  COMPUTATION_RESULT: 'compute:result:{operation}:{params}',
};

// 缓存监控指标
export const CACHE_METRICS = {
  HIT_RATE_THRESHOLD: 0.8,
  MISS_RATE_THRESHOLD: 0.2,
  EVICTION_RATE_THRESHOLD: 0.1,
  MEMORY_USAGE_THRESHOLD: 0.8,
  LATENCY_THRESHOLD_MS: 10,
};
