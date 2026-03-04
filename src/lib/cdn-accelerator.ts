import { EdgeCacheStrategy, EdgeCacheClient } from './edge-cache-strategy';

/**
 * CDN加速器核心? * 负责全局CDN配置、智能路由和性能优化
 */
export class CDNAccelerator {
  private edgeStrategy: EdgeCacheStrategy;
  private clients: Map<string, EdgeCacheClient>;
  private config: CDNConfig;

  constructor(config: CDNConfig = DEFAULT_CDN_CONFIG) {
    this.config = config;
    this.edgeStrategy = new EdgeCacheStrategy();
    this.clients = new Map();
    this.initializeCDN();
  }

  /**
   * 初始化CDN配置
   */
  private initializeCDN(): void {
    // 配置边缘节点
    this.setupEdgeLocations();

    // 设置缓存规则
    this.setupCacheRules();

    // 配置智能路由
    this.setupRoutingRules();
  }

  /**
   * 设置全球边缘节点
   */
  private setupEdgeLocations(): void {
    const locations: EdgeLocation[] = [
      {
        region: 'us-east',
        coordinates: { lat: 39.0438, lng: -77.4874 },
        enabled: true,
        priority: 1,
        capacity: 10000,
        customRules: [
          {
            pattern: /^\/api\/(?!admin)/,
            ttl: 300,
            compression: true,
          },
        ],
      },
      {
        region: 'us-west',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        enabled: true,
        priority: 2,
        capacity: 8000,
        customRules: [],
      },
      {
        region: 'eu-west',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        enabled: true,
        priority: 3,
        capacity: 7000,
        customRules: [
          {
            pattern: /^\/static\//,
            ttl: 86400,
            compression: true,
          },
        ],
      },
      {
        region: 'apac',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        enabled: true,
        priority: 4,
        capacity: 6000,
        customRules: [
          {
            pattern: /^\/images\//,
            ttl: 43200,
            compression: true,
          },
        ],
      },
      {
        region: 'sa-east',
        coordinates: { lat: -23.5505, lng: -46.6333 },
        enabled: false,
        priority: 5,
        capacity: 3000,
        customRules: [],
      },
    ];

    locations.forEach(location => {
      this.edgeStrategy.updateRegionConfig(location.region, {
        enabled: location.enabled,
        priority: location.priority,
        customRules: location.customRules,
      });
    });
  }

  /**
   * 设置缓存规则
   */
  private setupCacheRules(): void {
    // 静态资源缓存规?    this.edgeStrategy.addRule({
      pattern: /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i,
      ttl: 31536000, // 1�?      staleWhileRevalidate: 86400, // 1�?      cacheKey: ['url'],
      varyHeaders: [],
      compression: true,
    });

    // API缓存规则
    this.edgeStrategy.addRule({
      pattern: /^\/api\/(!?admin|auth)/,
      ttl: 300, // 5分钟
      staleWhileRevalidate: 60,
      cacheKey: ['url', 'query'],
      varyHeaders: ['Accept-Encoding'],
      compression: true,
    });

    // HTML页面缓存规则
    this.edgeStrategy.addRule({
      pattern: /\.html$/i,
      ttl: 3600, // 1小时
      staleWhileRevalidate: 300,
      cacheKey: ['url'],
      varyHeaders: ['Accept-Encoding'],
      compression: true,
    });

    // 动态内容不缓存
    this.edgeStrategy.addRule({
      pattern: /^\/(api\/admin|api\/auth|dashboard|admin)/,
      ttl: 0,
      staleWhileRevalidate: 0,
      cacheKey: [],
      varyHeaders: [],
      compression: false,
    });
  }

  /**
   * 设置智能路由规则
   */
  private setupRoutingRules(): void {
    this.config.routingRules = [
      {
        name: 'geographic-routing',
        condition: 'geoip',
        action: 'route-to-nearest',
        priority: 1,
      },
      {
        name: 'load-balancing',
        condition: 'server-load',
        action: 'distribute-evenly',
        priority: 2,
      },
      {
        name: 'failover',
        condition: 'node-unhealthy',
        action: 'route-to-backup',
        priority: 3,
      },
    ];
  }

  /**
   * 处理请求并返回最优响?   */
  async handleRequest(request: CDNRequest): Promise<CDNResponse> {
    const startTime = Date.now();

    try {
      // 1. 确定最优边缘节?      const optimalRegion = this.determineOptimalRegion(request);

      // 2. 获取或创建客户端
      let client = this.clients.get(optimalRegion);
      if (!client) {
        client = new EdgeCacheClient(this.edgeStrategy, optimalRegion);
        this.clients.set(optimalRegion, client);
      }

      // 3. 处理缓存请求
      const cacheResult = await client.handleRequest(
        request.url,
        request.method,
        request.headers
      );

      // 4. 构建响应
      const response: CDNResponse = {
        statusCode: 200,
        headers: {
          'X-CDN-Hit': cacheResult.cached ? 'HIT' : 'MISS',
          'X-CDN-Region': optimalRegion,
          'X-Processing-Time': `${Date.now() - startTime}ms`,
          'Cache-Control': this.getCacheControlHeader(request.url),
          ...request.headers,
        },
        body: cacheResult.data,
        cached: cacheResult.cached,
        region: optimalRegion,
        processingTime: Date.now() - startTime,
      };

      // 5. 如果缓存未命中，执行回源
      if (!cacheResult.cached) {
        const originResponse = await this.fetchFromOrigin(request);
        response.body = originResponse.body;
        response.statusCode = originResponse.statusCode;

        // 存储到缓?        await client.storeInCache(
          request.url,
          originResponse.body,
          request.method,
          request.headers
        );
      }

      return response;
    } catch (error) {
      console.error('CDN处理请求失败:', error);
      return {
        statusCode: 500,
        headers: {
          'X-Error': 'CDN Processing Error',
          'X-Processing-Time': `${Date.now() - startTime}ms`,
        },
        body: { error: 'Internal CDN Error' },
        cached: false,
        region: 'unknown',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 确定最优边缘节?   */
  private determineOptimalRegion(request: CDNRequest): string {
    // 基于地理位置确定最优节?    const clientIP =
      request.headers['x-forwarded-for'] || request.headers['x-real-ip'];
    if (clientIP) {
      const geoRegion = this.getGeoRegion(clientIP);
      if (geoRegion) {
        const regionConfig = this.edgeStrategy.getRegionConfig(geoRegion);
        if (regionConfig?.enabled) {
          return geoRegion;
        }
      }
    }

    // 默认使用最高优先级的启用节?    const locations = Array.from(this.edgeStrategy['locations'].values())
      .filter((loc: any) => loc.enabled)
      .sort((a: any, b: any) => a.priority - b.priority);

    return locations[0]?.region || 'us-east';
  }

  /**
   * 基于IP获取地理区域（简化实现）
   */
  private getGeoRegion(ip: string): string | null {
    // 简化的IP区域映射，实际应该使用专业的IP地理位置服务
    const ipRegions: Record<string, string> = {
      us: 'us-east',
      eu: 'eu-west',
      asia: 'apac',
      jp: 'apac',
      cn: 'apac',
    };

    const ipPrefix = ip.split('.')[0];
    return ipRegions[ipPrefix] || null;
  }

  /**
   * 从源站获取数?   */
  private async fetchFromOrigin(request: CDNRequest): Promise<OriginResponse> {
    // 实际实现应该调用真实的源站服?    // 这里使用模拟响应
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    return {
      statusCode: 200,
      body: {
        message: 'Origin response',
        timestamp: Date.now(),
        url: request.url,
      },
    };
  }

  /**
   * 生成缓存控制?   */
  private getCacheControlHeader(url: string): string {
    const rule = this.edgeStrategy.getMatchingRule(url, 'GET');
    if (!rule) return 'no-cache';

    if (rule.ttl === 0) {
      return 'no-cache, no-store, must-revalidate';
    }

    const maxAge = Math.min(rule.ttl, 31536000); // 最?�?    return `public, max-age=${maxAge}, stale-while-revalidate=${rule.staleWhileRevalidate}`;
  }

  /**
   * 获取CDN统计信息
   */
  getStatistics(): CDNStatistics {
    const locationStats = this.edgeStrategy.getCacheStats();
    const totalHits = Object.values(locationStats).reduce(
      (sum: number, stats: any) => sum + (stats.hits || 0),
      0
    );
    const totalMisses = Object.values(locationStats).reduce(
      (sum: number, stats: any) => sum + (stats.misses || 0),
      0
    );
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    return {
      totalRequests,
      totalHits,
      totalMisses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      activeNodes: Array.from(this.edgeStrategy['locations'].values()).filter(
        (loc: any) => loc.enabled
      ).length,
      locationStats,
      config: this.config,
    };
  }

  /**
   * 清除指定模式的缓?   */
  async purgeCache(patterns: string[]): Promise<void> {
    await this.edgeStrategy.purgeCache(patterns);
  }

  /**
   * 预热缓存
   */
  async warmupCache(urls: string[]): Promise<void> {
    await this.edgeStrategy.warmupCache(urls);
  }
}

// 类型定义
interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'akamai' | 'custom';
  routingRules: RoutingRule[];
  security: SecurityConfig;
  compression: CompressionConfig;
}

interface RoutingRule {
  name: string;
  condition: string;
  action: string;
  priority: number;
}

interface SecurityConfig {
  wafEnabled: boolean;
  rateLimiting: boolean;
  ddosProtection: boolean;
}

interface CompressionConfig {
  gzip: boolean;
  brotli: boolean;
  minFileSize: number;
}

interface EdgeLocation {
  region: string;
  coordinates: { lat: number; lng: number };
  enabled: boolean;
  priority: number;
  capacity: number;
  customRules: any[];
}

interface CDNRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

interface CDNResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  cached: boolean;
  region: string;
  processingTime: number;
}

interface OriginResponse {
  statusCode: number;
  body: any;
}

interface CDNStatistics {
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  activeNodes: number;
  locationStats: Record<string, any>;
  config: CDNConfig;
}

// 默认配置
const DEFAULT_CDN_CONFIG: CDNConfig = {
  provider: 'custom',
  routingRules: [],
  security: {
    wafEnabled: true,
    rateLimiting: true,
    ddosProtection: true,
  },
  compression: {
    gzip: true,
    brotli: true,
    minFileSize: 1024,
  },
};

// 导出工厂函数
export function createCDNAccelerator(config?: CDNConfig): CDNAccelerator {
  return new CDNAccelerator(config);
}
