// 数据中心API网关核心服务
// 实现统一的API路由、权限验证、监控和转发功能

import { NextRequest, NextResponse } from 'next/server';

// API路由配置
interface RouteConfig {
  serviceName: string;
  basePath: string;
  authRequired: boolean;
  rateLimit?: string;
  timeout?: number;
  healthCheck?: string;
}

// 路由映射?const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  // 设备管理服务
  devices: {
    serviceName: 'device-service',
    basePath: '/api/devices',
    authRequired: true,
    rateLimit: '1000/hour',
    timeout: 5000,
    healthCheck: '/api/devices/health',
  },

  // 供应链服?  'supply-chain': {
    serviceName: 'supply-chain-service',
    basePath: '/api/supply-chain',
    authRequired: true,
    rateLimit: '2000/hour',
    timeout: 5000,
    healthCheck: '/api/supply-chain/health',
  },

  // 维修服务
  wms: {
    serviceName: 'wms-service',
    basePath: '/api/wms',
    authRequired: true,
    rateLimit: '1500/hour',
    timeout: 5000,
    healthCheck: '/api/wms/health',
  },

  // 报价服务
  fcx: {
    serviceName: 'fcx-service',
    basePath: '/api/fcx',
    authRequired: true,
    rateLimit: '1000/hour',
    timeout: 5000,
    healthCheck: '/api/fcx/health',
  },

  // 数据质量服务
  'data-quality': {
    serviceName: 'data-quality-service',
    basePath: '/api/data-quality',
    authRequired: true,
    rateLimit: '500/hour',
    timeout: 10000,
    healthCheck: '/api/data-quality/health',
  },

  // 监控服务
  monitoring: {
    serviceName: 'monitoring-service',
    basePath: '/api/monitoring',
    authRequired: true,
    rateLimit: '2000/hour',
    timeout: 3000,
    healthCheck: '/api/monitoring/health',
  },

  // 分析服务
  analytics: {
    serviceName: 'analytics-service',
    basePath: '/api/analytics',
    authRequired: true,
    rateLimit: '500/hour',
    timeout: 10000,
    healthCheck: '/api/analytics/health',
  },

  // 企业服务
  enterprise: {
    serviceName: 'enterprise-service',
    basePath: '/api/enterprise',
    authRequired: true,
    rateLimit: '1000/hour',
    timeout: 5000,
    healthCheck: '/api/enterprise/health',
  },

  // 采购智能服务
  'procurement-intelligence': {
    serviceName: 'procurement-intelligence-service',
    basePath: '/api/procurement-intelligence',
    authRequired: true,
    rateLimit: '500/hour',
    timeout: 15000,
    healthCheck: '/api/procurement-intelligence/health',
  },

  // 外贸服务
  'foreign-trade': {
    serviceName: 'foreign-trade-service',
    basePath: '/api/foreign-trade',
    authRequired: true,
    rateLimit: '1000/hour',
    timeout: 5000,
    healthCheck: '/api/foreign-trade/health',
  },
};

// 健康检查端点映?const HEALTH_CHECK_ENDPOINTS: Record<string, string> = {
  devices: '/api/devices/health',
  'supply-chain': '/api/supply-chain/health',
  wms: '/api/wms/health',
  fcx: '/api/fcx/health',
  'data-quality': '/api/data-quality/health',
  monitoring: '/api/monitoring/health',
  analytics: '/api/analytics/health',
  enterprise: '/api/enterprise/health',
  'procurement-intelligence': '/api/procurement-intelligence/health',
  'foreign-trade': '/api/foreign-trade/health',
};

// API响应接口
interface ApiResponse {
  data: any;
  status: number;
  message?: string;
  timestamp: string;
  source: string;
  requestId?: string;
}

// 权限检查结?interface AuthResult {
  authorized: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
}

// 监控指标
interface Metrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  avgResponseTime: number;
  serviceMetrics: Record<string, ServiceMetrics>;
}

interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  avgResponseTime: number;
}

// 速率限制记录
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class ApiGatewayService {
  private metrics: Metrics;
  private rateLimits: Map<string, RateLimitRecord>;
  private readonly RATE_LIMIT_WINDOW = 3600000; // 1小时
  private readonly DEFAULT_RATE_LIMIT = 1000;

  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      avgResponseTime: 0,
      serviceMetrics: {},
    };
    this.rateLimits = new Map();
    this.initializeMetrics();
  }

  /**
   * 处理API请求的主要入口点
   */
  async handleRequest(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 解析请求参数
      const { searchParams } = new URL(request.url);
      const module = searchParams.get('module');
      const endpoint = searchParams.get('endpoint');
      const action = searchParams.get('action') || 'overview';

      // 记录请求
      this.recordRequest(module || 'gateway');

      // 统一健康检?      if (action === 'health') {
        return await this.handleHealthCheck();
      }

      // 聚合数据查询
      if (action === 'aggregate') {
        return await this.handleAggregateRequest(request, searchParams);
      }

      // 单模块查?      if (module && endpoint) {
        return await this.handleModuleRequest(
          request,
          module,
          endpoint,
          requestId
        );
      }

      // 默认返回API目录
      return this.handleApiDirectory();
    } catch (error: any) {
      console.error('API网关处理错误:', error);
      this.recordError((module as unknown as string) || 'gateway');
      return NextResponse.json(
        {
          error: error.message || '内部服务器错?,
          timestamp: new Date().toISOString(),
          requestId,
        },
        { status: 500 }
      );
    } finally {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(
        (module as unknown as string) || 'gateway',
        responseTime
      );
    }
  }

  /**
   * 处理健康检查请?   */
  private async handleHealthCheck(): Promise<NextResponse> {
    const modules = Object.keys(HEALTH_CHECK_ENDPOINTS);
    const healthStatus = await this.checkModuleHealth(modules);

    const overallHealthy = Object.values(healthStatus).every(
      (status: any) => status.status === 'healthy' || status.status === 'online'
    );

    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      modules: healthStatus,
      metrics: this.getMetricsSummary(),
      overall: overallHealthy ? 'operational' : 'degraded',
    });
  }

  /**
   * 处理聚合数据请求
   */
  private async handleAggregateRequest(
    request: NextRequest,
    searchParams: URLSearchParams
  ): Promise<NextResponse> {
    const modulesParam = searchParams.get('modules');
    const modules = modulesParam
      ? modulesParam.split(',')
      : Object.keys(ROUTE_CONFIGS);

    const aggregatedData = await this.aggregateModuleData(modules, request);

    return NextResponse.json({
      data: aggregatedData,
      timestamp: new Date().toISOString(),
      modules: modules.length,
      metrics: this.getMetricsSummary(),
    });
  }

  /**
   * 处理单模块请?   */
  private async handleModuleRequest(
    request: NextRequest,
    module: string,
    endpoint: string,
    requestId: string
  ): Promise<NextResponse> {
    // 验证模块是否存在
    const routeConfig = ROUTE_CONFIGS[module];
    if (!routeConfig) {
      return NextResponse.json(
        {
          error: `不支持的模块: ${module}`,
          available_modules: Object.keys(ROUTE_CONFIGS),
          requestId,
        },
        { status: 400 }
      );
    }

    // 权限验证
    const authResult = await this.checkAuthorization(request, routeConfig);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: '未授权访?,
          details: authResult.error,
          requestId,
        },
        { status: 401 }
      );
    }

    // 速率限制检?    const rateLimitResult = this.checkRateLimit(
      module,
      routeConfig.rateLimit || '1000/hour'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: '请求频率超限',
          retry_after: rateLimitResult.retryAfter,
          limit: rateLimitResult.limit,
          requestId,
        },
        { status: 429 }
      );
    }

    // 构造完整端?    const fullEndpoint = `${routeConfig.basePath}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    // 执行代理请求
    const result = await this.proxyRequest(
      fullEndpoint,
      request,
      module,
      requestId
    );

    return NextResponse.json(result);
  }

  /**
   * 返回API目录信息
   */
  private handleApiDirectory(): NextResponse {
    return NextResponse.json({
      message: '数据中心API网关',
      version: '1.0.0',
      available_modules: Object.keys(ROUTE_CONFIGS),
      health_check_modules: Object.keys(HEALTH_CHECK_ENDPOINTS),
      endpoints: {
        '/api/data-center?module={module}&endpoint={path}': '访问特定模块API',
        '/api/data-center?action=health': '系统健康检?,
        '/api/data-center?action=aggregate&modules=device,supply':
          '聚合多个模块数据',
      },
      metrics: this.getMetricsSummary(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 执行HTTP代理请求
   */
  private async proxyRequest(
    targetUrl: string,
    request: NextRequest,
    source: string,
    requestId: string
  ): Promise<ApiResponse> {
    try {
      // 构造转发请求URL
      const baseUrl = this.getBaseUrl(request);
      const fullUrl = `${baseUrl}${targetUrl}`;

      // 保留原始查询参数
      const url = new URL(fullUrl);
      const { searchParams } = new URL(request.url);
      searchParams.forEach((value, key) => {
        if (key !== 'module' && key !== 'endpoint' && key !== 'action') {
          url.searchParams.append(key, value);
        }
      });

      // 转发请求
      const response = await fetch(url.toString(), {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
          ...Object.fromEntries(request.headers),
        },
        body:
          request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.text()
            : undefined,
      });

      const data = await response.json();

      return {
        data,
        status: response.status,
        timestamp: new Date().toISOString(),
        source,
        requestId,
      };
    } catch (error: any) {
      console.error(`API代理错误 [${source}]:`, error);
      return {
        data: null,
        status: 500,
        message: error.message || 'API调用失败',
        timestamp: new Date().toISOString(),
        source,
        requestId,
      };
    }
  }

  /**
   * 聚合多个模块数据
   */
  private async aggregateModuleData(
    modules: string[],
    request: NextRequest
  ): Promise<Record<string, ApiResponse>> {
    const results: Record<string, ApiResponse> = {};
    const promises = modules.map(async module => {
      const routeConfig = ROUTE_CONFIGS[module];
      if (routeConfig) {
        const requestId = this.generateRequestId();
        results[module] = await this.proxyRequest(
          `${routeConfig.basePath}/overview`,
          request,
          module,
          requestId
        );
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * 检查模块健康状?   */
  private async checkModuleHealth(
    modules: string[]
  ): Promise<Record<string, any>> {
    const healthStatus: Record<string, any> = {};
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const promises = modules.map(async module => {
      const healthEndpoint = HEALTH_CHECK_ENDPOINTS[module];
      if (healthEndpoint) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(`${baseUrl}${healthEndpoint}`, {
            method: 'GET',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          healthStatus[module] = {
            status: response.status === 200 ? 'healthy' : 'unhealthy',
            statusCode: response.status,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          healthStatus[module] = {
            status: 'offline',
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          };
        }
      }
    });

    await Promise.all(promises);
    return healthStatus;
  }

  /**
   * 权限验证
   */
  private async checkAuthorization(
    request: NextRequest,
    routeConfig: RouteConfig
  ): Promise<AuthResult> {
    // 如果不需要认证，直接通过
    if (!routeConfig.authRequired) {
      return { authorized: true };
    }

    // 检查认证头
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return {
        authorized: false,
        error: '缺少认证信息',
      };
    }

    // 这里应该集成实际的认证逻辑
    // 暂时简化处理，实际项目中需要验证JWT令牌
    try {
      // 模拟认证验证
      const token = authHeader.replace('Bearer ', '');
      if (!token || token.length < 10) {
        return {
          authorized: false,
          error: '无效的认证令?,
        };
      }

      // 模拟权限检?      const permissions = ['data_center_access']; // 实际应该从令牌解?      return {
        authorized: true,
        userId: 'mock-user-id',
        permissions,
      };
    } catch (error) {
      return {
        authorized: false,
        error: '认证验证失败',
      };
    }
  }

  /**
   * 速率限制检?   */
  private checkRateLimit(
    module: string,
    limitConfig: string
  ): { allowed: boolean; retryAfter?: number; limit?: number } {
    const now = Date.now();
    const key = `${module}:${this.getCurrentHour()}`;

    let rateLimit = this.rateLimits.get(key);

    // 初始化或重置计数?    if (!rateLimit || now >= rateLimit.resetTime) {
      const limit = parseInt(limitConfig) || this.DEFAULT_RATE_LIMIT;
      rateLimit = {
        count: 0,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      };
      this.rateLimits.set(key, rateLimit);
    }

    // 检查限?    const limit = parseInt(limitConfig) || this.DEFAULT_RATE_LIMIT;
    if (rateLimit.count >= limit) {
      const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        limit,
      };
    }

    // 增加计数
    rateLimit.count++;
    this.rateLimits.set(key, rateLimit);

    return { allowed: true };
  }

  /**
   * 监控指标记录
   */
  private recordRequest(service: string): void {
    this.metrics.requestCount++;
    this.ensureServiceMetrics(service);
    this.metrics.serviceMetrics[service].requestCount++;
  }

  private recordError(service: string): void {
    this.metrics.errorCount++;
    this.ensureServiceMetrics(service);
    this.metrics.serviceMetrics[service].errorCount++;
  }

  private recordResponseTime(service: string, responseTime: number): void {
    this.metrics.totalResponseTime += responseTime;
    this.metrics.avgResponseTime =
      this.metrics.totalResponseTime / this.metrics.requestCount;

    this.ensureServiceMetrics(service);
    const serviceMetrics = this.metrics.serviceMetrics[service];
    serviceMetrics.totalResponseTime += responseTime;
    serviceMetrics.avgResponseTime =
      serviceMetrics.totalResponseTime / serviceMetrics.requestCount;
  }

  private ensureServiceMetrics(service: string): void {
    if (!this.metrics.serviceMetrics[service]) {
      this.metrics.serviceMetrics[service] = {
        requestCount: 0,
        errorCount: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
      };
    }
  }

  /**
   * 辅助方法
   */
  private initializeMetrics(): void {
    // 初始化所有服务的监控指标
    Object.keys(ROUTE_CONFIGS).forEach(service => {
      this.ensureServiceMetrics(service);
    });
  }

  private getMetricsSummary(): any {
    return {
      totalRequests: this.metrics.requestCount,
      totalErrors: this.metrics.errorCount,
      averageResponseTime: Math.round(this.metrics.avgResponseTime),
      uptime: process.uptime(),
      services: Object.keys(this.metrics.serviceMetrics).length,
    };
  }

  private getCurrentHour(): string {
    return new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBaseUrl(request: NextRequest): string {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  /**
   * 获取当前监控指标（用于外部查询）
   */
  public getMetrics(): Metrics {
    return { ...this.metrics };
  }

  /**
   * 重置监控指标
   */
  public resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      avgResponseTime: 0,
      serviceMetrics: {},
    };
    this.initializeMetrics();
  }
}

// 导出单例实例
export const apiGatewayService = new ApiGatewayService();
