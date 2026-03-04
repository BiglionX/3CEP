// 边缘缓存策略管理?
// 配置CDN和边缘节点缓存优?

interface EdgeCacheRule {
  // 缓存规则
  pattern: string | RegExp; // URL匹配模式
  ttl: number; // 缓存时间(�?
  staleWhileRevalidate: number; // 后台更新时间(�?
  cacheKey: string[]; // 缓存键组?
  varyHeaders: string[]; // Vary头部
  compression: boolean; // 是否启用压缩
}

interface EdgeLocationConfig {
  // 边缘节点配置
  region: string; // 区域标识
  enabled: boolean; // 是否启用
  priority: number; // 优先?
  customRules: EdgeCacheRule[]; // 自定义规?
}

interface CacheMetrics {
  // 缓存指标
  hits: number; // 缓存命中次数
  misses: number; // 缓存未命中次?
  hitRate: number; // 命中?
  dataSize: number; // 缓存数据大小
  requests: number; // 总请求数
}

export class EdgeCacheStrategy {
  private rules: EdgeCacheRule[] = [];
  private locations: Map<string, EdgeLocationConfig> = new Map();
  private metrics: Map<string, CacheMetrics> = new Map();
  private defaultTTL: number = 3600; // 1小时默认TTL

  constructor() {
    this.initializeDefaultRules();
    this.initializeLocations();
  }

  // 初始化默认缓存规?
  private initializeDefaultRules(): void {
    this.rules = [
      // 静态资?- 长期缓存
      {
        pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$/,
        ttl: 31536000, // 1�?
        staleWhileRevalidate: 86400, // 1�?
        cacheKey: ['url', 'query'],
        varyHeaders: ['Accept-Encoding'],
        compression: true,
      },

      // API响应 - 短期缓存
      {
        pattern: '^/api/',
        ttl: 300, // 5分钟
        staleWhileRevalidate: 60, // 1分钟
        cacheKey: ['url', 'method', 'body'],
        varyHeaders: ['Authorization', 'Accept'],
        compression: true,
      },

      // HTML页面 - 短期缓存
      {
        pattern: '\.(html|htm)$',
        ttl: 300, // 5分钟
        staleWhileRevalidate: 60,
        cacheKey: ['url'],
        varyHeaders: ['User-Agent', 'Accept'],
        compression: true,
      },

      // 用户特定内容 - 不缓?
      {
        pattern: '/api/user/|/dashboard|/profile',
        ttl: 0, // 不缓?
        staleWhileRevalidate: 0,
        cacheKey: [],
        varyHeaders: ['Authorization'],
        compression: false,
      },
    ];
  }

  // 初始化边缘节点配?
  private initializeLocations(): void {
    const locations: EdgeLocationConfig[] = [
      {
        region: 'us-east',
        enabled: true,
        priority: 1,
        customRules: [
          {
            pattern: '/api/regional/us',
            ttl: 600,
            staleWhileRevalidate: 120,
            cacheKey: ['url'],
            varyHeaders: [],
            compression: true,
          },
        ],
      },
      {
        region: 'eu-west',
        enabled: true,
        priority: 2,
        customRules: [
          {
            pattern: '/api/regional/eu',
            ttl: 600,
            staleWhileRevalidate: 120,
            cacheKey: ['url'],
            varyHeaders: [],
            compression: true,
          },
        ],
      },
      {
        region: 'apac',
        enabled: true,
        priority: 3,
        customRules: [
          {
            pattern: '/api/regional/apac',
            ttl: 600,
            staleWhileRevalidate: 120,
            cacheKey: ['url'],
            varyHeaders: [],
            compression: true,
          },
        ],
      },
    ];

    locations.forEach(location => {
      this.locations.set(location.region, location);
    });
  }

  // 添加自定义缓存规?
  addRule(rule: EdgeCacheRule): void {
    this.rules.unshift(rule); // 添加到开头，优先匹配
  }

  // 获取匹配的缓存规?
  getMatchingRule(url: string, method: string = 'GET'): EdgeCacheRule | null {
    // 检查用户特定内容（不缓存）
    const noCacheRule = this.rules.find(
      rule =>
        typeof rule.pattern === 'string' &&
        new RegExp(rule.pattern).test(url) &&
        rule.ttl === 0
    );
    if (noCacheRule) return noCacheRule;

    // 查找匹配的规?
    for (const rule of this.rules) {
      const pattern =
        typeof rule.pattern === 'string'
          ? new RegExp(rule.pattern)
          : rule.pattern;

      if (pattern.test(url)) {
        return rule;
      }
    }

    // 返回默认规则
    return {
      pattern: '.*',
      ttl: this.defaultTTL,
      staleWhileRevalidate: 60,
      cacheKey: ['url'],
      varyHeaders: [],
      compression: true,
    };
  }

  // 生成缓存?
  generateCacheKey(
    url: string,
    rule: EdgeCacheRule,
    headers: Record<string, string> = {}
  ): string {
    const keyComponents: string[] = [];

    rule.cacheKey.forEach(component => {
      switch (component) {
        case 'url':
          keyComponents.push(url);
          break;
        case 'method':
          keyComponents.push(headers['method'] || 'GET');
          break;
        case 'query':
          try {
            const urlObj = new URL(url, 'http://localhost');
            keyComponents.push(urlObj.search);
          } catch {
            keyComponents.push('');
          }
          break;
        case 'headers':
          rule.varyHeaders.forEach(header => {
            keyComponents.push(
              `${header}:${headers[header.toLowerCase()] || ''}`
            );
          });
          break;
      }
    });

    return keyComponents.join('|');
  }

  // 获取区域特定配置
  getRegionConfig(region: string): EdgeLocationConfig | undefined {
    return this.locations.get(region);
  }

  // 更新区域配置
  updateRegionConfig(
    region: string,
    config: Partial<EdgeLocationConfig>
  ): void {
    const existing = this.locations.get(region);
    if (existing) {
      this.locations.set(region, { ...existing, ...config });
    }
  }

  // 记录缓存指标
  recordMetrics(region: string, hit: boolean): void {
    if (!this.metrics.has(region)) {
      this.metrics.set(region, {
        hits: 0,
        misses: 0,
        hitRate: 0,
        dataSize: 0,
        requests: 0,
      });
    }

    const metrics = this.metrics.get(region)!;
    metrics.requests++;

    if (hit) {
      metrics.hits++;
    } else {
      metrics.misses++;
    }

    metrics.hitRate = metrics.hits / metrics.requests;
  }

  // 获取缓存统计
  getCacheStats(region?: string): Record<string, CacheMetrics> {
    if (region) {
      const stats = this.metrics.get(region);
      return stats ? { [region]: stats } : {};
    }
    return Object.fromEntries(this.metrics);
  }

  // 生成CDN配置
  generateCDNConfig(): any {
    const config: any = {
      rules: this.rules.map(rule => ({
        pattern: rule.pattern.toString(),
        ttl: rule.ttl,
        stale_while_revalidate: rule.staleWhileRevalidate,
        cache_key: rule.cacheKey,
        vary: rule.varyHeaders,
        compression: rule.compression,
      })),
      locations: Array.from(this.locations.values()).map(location => ({
        region: location.region,
        enabled: location.enabled,
        priority: location.priority,
        custom_rules: location.customRules,
      })),
    };

    return config;
  }

  // 清除缓存
  async purgeCache(patterns: string[]): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('清除缓存模式:', patterns)// 实际实现会调用CDN提供商的API
    // 这里只是模拟
  }

  // 预热缓存
  async warmupCache(urls: string[]): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('预热缓存URL:', urls)// 实际实现会批量请求URL来填充缓?
    // 这里只是模拟
  }

  // 获取最优边缘节?
  getOptimalEdge(requestRegion: string): string {
    // 简单的距离算法 - 实际应该基于网络延迟
    const regions = Array.from(this.locations.keys());

    // 如果请求区域有对应节点，优先使用
    if (this.locations.has(requestRegion)) {
      return requestRegion;
    }

    // 否则返回最高优先级的启用节?
    const enabledRegions = Array.from(this.locations.entries())
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority);

    return enabledRegions[0]?.[0] || regions[0];
  }
}

// 边缘缓存客户?
export class EdgeCacheClient {
  private strategy: EdgeCacheStrategy;
  private region: string;

  constructor(strategy: EdgeCacheStrategy, region: string = 'us-east') {
    this.strategy = strategy;
    this.region = region;
  }

  // 处理请求缓存
  async handleRequest(
    url: string,
    method: string = 'GET',
    headers: Record<string, string> = {}
  ): Promise<{ cached: boolean; data?: any; ttl?: number }> {
    const rule = this.strategy.getMatchingRule(url, method);
    if (!rule || rule.ttl === 0) {
      // 不缓存的内容
      this.strategy.recordMetrics(this.region, false);
      return { cached: false };
    }

    const cacheKey = this.strategy.generateCacheKey(url, rule, headers);

    // 模拟缓存查找
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData) {
      this.strategy.recordMetrics(this.region, true);
      return {
        cached: true,
        data: cachedData,
        ttl: rule.ttl,
      };
    } else {
      this.strategy.recordMetrics(this.region, false);
      return { cached: false };
    }
  }

  // 模拟从缓存获取数?
  private getFromCache(key: string): any {
    // 实际实现会连接到真实的边缘缓?
    // 这里只是模拟
    return Math.random() > 0.7 ? { mock: 'cached_data' } : null;
  }

  // 存储到缓?
  async storeInCache(
    url: string,
    data: any,
    method: string = 'GET',
    headers: Record<string, string> = {}
  ): Promise<void> {
    const rule = this.strategy.getMatchingRule(url, method);
    if (!rule || rule.ttl === 0) return;

    const cacheKey = this.strategy.generateCacheKey(url, rule, headers);
    // 实际实现会存储到边缘缓存
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`存储到缓? ${cacheKey}, TTL: ${rule.ttl}s`)}
}

// 默认导出实例
export const edgeCacheStrategy = new EdgeCacheStrategy();
export const edgeCacheClient = new EdgeCacheClient(edgeCacheStrategy);

// React Hook封装
export function useEdgeCache() {
  const getCacheRule = (url: string, method?: string) => {
    return edgeCacheStrategy.getMatchingRule(url, method);
  };

  const getCacheStats = (region?: string) => {
    return edgeCacheStrategy.getCacheStats(region);
  };

  const getOptimalEdge = (requestRegion: string) => {
    return edgeCacheStrategy.getOptimalEdge(requestRegion);
  };

  const purgeCache = async (patterns: string[]) => {
    await edgeCacheStrategy.purgeCache(patterns);
  };

  return {
    getCacheRule,
    getCacheStats,
    getOptimalEdge,
    purgeCache,
  };
}
