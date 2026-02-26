// Redis缓存集成配置和工具类
const Redis = require('ioredis');
const { cacheManager: memoryCache, generateCacheKey: memGenerateKey } = require('./memory-cache');

class CacheManager {
  constructor() {
    this.redis = null;
    this.isEnabled = false;
    this.useMemoryFallback = true; // 启用内存缓存后备
    this.initRedis();
  }

  // 初始化Redis连接
  initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // 重试策略：最多重试10次，每次间隔递增
          if (times > 10) return false;
          return Math.min(times * 50, 2000);
        },
        connectTimeout: 10000,
        lazyConnect: true
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis连接成功');
        this.isEnabled = true;
      });

      this.redis.on('error', (error) => {
        console.warn('⚠️  Redis连接错误:', error.message);
        this.isEnabled = false;
      });

      this.redis.on('close', () => {
        console.log('🔒 Redis连接关闭');
        this.isEnabled = false;
      });

      // 尝试连接
      this.redis.connect().catch(err => {
        console.warn('⚠️  Redis初始化失败:', err.message);
        this.isEnabled = false;
      });

    } catch (error) {
      console.warn('⚠️  Redis初始化异常:', error.message);
      this.isEnabled = false;
    }
  }

  // 设置缓存
  async set(key, value, ttl = 3600) {
    // 首先尝试Redis
    if (this.isEnabled && this.redis) {
      try {
        const serializedValue = JSON.stringify(value);
        await this.redis.setex(key, ttl, serializedValue);
        return true;
      } catch (error) {
        console.warn(`Redis设置缓存失败 ${key}:`, error.message);
        // Redis失败时使用内存缓存
        if (this.useMemoryFallback) {
          return memoryCache.set(key, value, ttl);
        }
        return false;
      }
    }
    
    // Redis不可用时使用内存缓存
    if (this.useMemoryFallback) {
      return memoryCache.set(key, value, ttl);
    }
    
    return false;
  }

  // 获取缓存
  async get(key) {
    // 首先尝试Redis
    if (this.isEnabled && this.redis) {
      try {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value);
        }
      } catch (error) {
        console.warn(`Redis获取缓存失败 ${key}:`, error.message);
        // Redis失败时尝试内存缓存
        if (this.useMemoryFallback) {
          return memoryCache.get(key);
        }
        return null;
      }
    }
    
    // Redis不可用时使用内存缓存
    if (this.useMemoryFallback) {
      return memoryCache.get(key);
    }
    
    return null;
  }

  // 删除缓存
  async del(key) {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.warn(`删除缓存失败 ${key}:`, error.message);
      return false;
    }
  }

  // 批量删除缓存（支持通配符）
  async delPattern(pattern) {
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.warn(`批量删除缓存失败 ${pattern}:`, error.message);
      return 0;
    }
  }

  // 缓存统计信息
  async getStats() {
    if (!this.isEnabled || !this.redis) {
      return { enabled: false };
    }

    try {
      const info = await this.redis.info();
      const dbSize = await this.redis.dbsize();
      
      return {
        enabled: true,
        dbSize,
        uptime: this.extractInfoValue(info, 'uptime_in_seconds'),
        connectedClients: this.extractInfoValue(info, 'connected_clients'),
        usedMemory: this.extractInfoValue(info, 'used_memory_human'),
        keyspaceHits: this.extractInfoValue(info, 'keyspace_hits'),
        keyspaceMisses: this.extractInfoValue(info, 'keyspace_misses')
      };
    } catch (error) {
      console.warn('获取Redis统计信息失败:', error.message);
      return { enabled: true, error: error.message };
    }
  }

  // 辅助方法：从info字符串中提取值
  extractInfoValue(info, key) {
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith(`${key}:`)) {
        return line.split(':')[1].trim();
      }
    }
    return null;
  }

  // 关闭连接
  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.isEnabled = false;
    }
  }
}

// 创建全局缓存实例
const cacheManager = new CacheManager();

// 导出工具函数
module.exports = {
  cacheManager,
  
  // 缓存装饰器函数
  withCache: (cacheKey, ttl = 3600) => {
    return async (fn, ...args) => {
      // 尝试从缓存获取
      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult !== null) {
        console.log(`📦 缓存命中: ${cacheKey}`);
        return cachedResult;
      }

      // 执行原始函数
      console.log(`🔄 缓存未命中，执行函数: ${cacheKey}`);
      const result = await fn(...args);
      
      // 缓存结果
      if (result !== null && result !== undefined) {
        await cacheManager.set(cacheKey, result, ttl);
      }
      
      return result;
    };
  },

  // 生成缓存键
  generateCacheKey: (prefix, ...params) => {
    const keyParts = [prefix, ...params];
    return keyParts.join(':');
  },

  // 清除相关缓存
  invalidateRelatedCache: async (patterns) => {
    const results = [];
    for (const pattern of patterns) {
      const deletedCount = await cacheManager.delPattern(pattern);
      results.push({ pattern, deletedCount });
    }
    return results;
  }
};