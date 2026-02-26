// 内存缓存实现（作为Redis的替代方案）
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // 定期清理过期数据
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // 每分钟清理一次
  }

  // 设置缓存
  set(key, value, ttl = 3600) {
    // 清除已存在的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // 存储数据和过期时间
    this.cache.set(key, {
      value: value,
      expiresAt: Date.now() + (ttl * 1000)
    });

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.del(key);
    }, ttl * 1000);
    
    this.timers.set(key, timer);
    this.stats.sets++;

    return true;
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.del(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  // 删除缓存
  del(key) {
    // 清除定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // 删除数据
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.deletes++;
    }
    
    return existed;
  }

  // 批量删除（支持前缀匹配）
  delPattern(pattern) {
    let deletedCount = 0;
    const keysToDelete = [];
    
    // 收集匹配的键
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern.replace('*', ''))) {
        keysToDelete.push(key);
      }
    }
    
    // 删除匹配的键
    for (const key of keysToDelete) {
      this.del(key);
      deletedCount++;
    }
    
    return deletedCount;
  }

  // 清理过期数据
  cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.del(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 清理了 ${cleaned} 条过期缓存`);
    }
  }

  // 获取统计信息
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      enabled: true,
      type: 'memory',
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      sets: this.stats.sets,
      deletes: this.stats.deletes
    };
  }

  // 清空所有缓存
  clear() {
    // 清除所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    
    // 重置统计
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }
}

// 创建全局内存缓存实例
const memoryCache = new InMemoryCache();

// 导出兼容Redis接口的缓存管理器
module.exports = {
  cacheManager: memoryCache,
  
  // 缓存装饰器函数
  withCache: (cacheKey, ttl = 3600) => {
    return async (fn, ...args) => {
      // 尝试从缓存获取
      const cachedResult = memoryCache.get(cacheKey);
      if (cachedResult !== null) {
        console.log(`📦 内存缓存命中: ${cacheKey}`);
        return cachedResult;
      }

      // 执行原始函数
      console.log(`🔄 缓存未命中，执行函数: ${cacheKey}`);
      const result = await fn(...args);
      
      // 缓存结果
      if (result !== null && result !== undefined) {
        memoryCache.set(cacheKey, result, ttl);
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
      const deletedCount = memoryCache.delPattern(pattern);
      results.push({ pattern, deletedCount });
    }
    return results;
  }
};