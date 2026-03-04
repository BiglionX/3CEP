/**
 * API请求拦截器控制器
 * 实现统一的认证检查和安全拦截机制
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  PermissionManager,
  UserInfo,
} from '@/modules/common/permissions/core/permission-manager';
import { DataProtectionController } from '@/modules/common/permissions/core/data-protection-controller';

export interface InterceptorConfig {
  enabled: boolean;
  authRequired: boolean;
  rateLimiting: boolean;
  ipWhitelist: string[];
  blockedPaths: string[];
  allowedPaths: string[];
  logLevel: 'none' | 'basic' | 'detailed';
}

export interface RateLimitInfo {
  ip: string;
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export interface SecurityEvent {
  timestamp: Date;
  eventType:
    | 'AUTH_FAILURE'
    | 'RATE_LIMIT'
    | 'BLOCKED_PATH'
    | 'UNAUTHORIZED_ACCESS'
    | 'SUCCESS';
  ip: string;
  userAgent: string;
  path: string;
  userId?: string;
  details?: string;
}

export class ApiInterceptor {
  private static instance: ApiInterceptor;
  private config: InterceptorConfig;
  private permissionManager: PermissionManager;
  private dataProtection: DataProtectionController;
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private readonly RATE_LIMIT_WINDOW = 60000; // 1分钟
  private readonly MAX_REQUESTS_PER_WINDOW = 100;
  private readonly BLOCK_DURATION = 300000; // 5分钟

  private constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.dataProtection = DataProtectionController.getInstance();

    this.config = {
      enabled: true,
      authRequired: true,
      rateLimiting: true,
      ipWhitelist: ['127.0.0.1', '::1'], // 本地地址白名?      blockedPaths: ['/api/admin/sensitive', '/api/system/config'],
      allowedPaths: ['/api/auth/login', '/api/health', '/api/public'],
      logLevel: 'detailed',
    };
  }

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  /**
   * 处理传入的API请求
   */
  async intercept(request: NextRequest): Promise<NextResponse | null> {
    if (!this.config.enabled) {
      return null; // 不拦截，继续处理
    }

    const ip = this.getClientIP(request);
    const path = request.nextUrl.pathname;
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 记录请求信息
    this.log(
      `Intercepting request: ${request.method} ${path} from ${ip}`,
      'basic'
    );

    // IP白名单检?    if (this.isIpWhitelisted(ip)) {
      this.log(`Allowing whitelisted IP: ${ip}`, 'basic');
      return null;
    }

    // 路径检?    if (this.isPathBlocked(path)) {
      this.log(`Blocking request to blocked path: ${path}`, 'basic');
      this.recordSecurityEvent('BLOCKED_PATH', ip, userAgent, path);
      return NextResponse.json(
        { error: '访问被拒?, message: '此路径不允许访问' },
        { status: 403 }
      );
    }

    // 允许的公开路径
    if (this.isPathAllowed(path)) {
      this.log(`Allowing public path: ${path}`, 'basic');
      return null;
    }

    // 速率限制检?    if (this.config.rateLimiting && this.isRateLimited(ip)) {
      this.log(`Rate limiting IP: ${ip}`, 'basic');
      this.recordSecurityEvent('RATE_LIMIT', ip, userAgent, path);
      return NextResponse.json(
        { error: '请求过于频繁', message: '请稍后再? },
        { status: 429 }
      );
    }

    // 认证检?    if (this.config.authRequired) {
      const authResult = await this.checkAuthentication(request);
      if (!authResult.authenticated) {
        this.log(`Authentication failed for IP: ${ip}`, 'basic');
        this.recordSecurityEvent(
          'AUTH_FAILURE',
          ip,
          userAgent,
          path,
          undefined,
          authResult.reason
        );
        return NextResponse.json(
          {
            error: '认证失败',
            message: authResult.reason || '需要有效的认证令牌',
          },
          { status: 401 }
        );
      }

      // 权限检查（如果需要）
      if (authResult.user) {
        const permissionResult = await this.checkAuthorization(
          request,
          authResult.user
        );
        if (!permissionResult.authorized) {
          this.log(
            `Authorization failed for user: ${authResult.user.id}`,
            'basic'
          );
          this.recordSecurityEvent(
            'UNAUTHORIZED_ACCESS',
            ip,
            userAgent,
            path,
            authResult.user.id,
            permissionResult.reason
          );
          return NextResponse.json(
            {
              error: '权限不足',
              message: permissionResult.reason || '无权访问此资?,
            },
            { status: 403 }
          );
        }
      }
    }

    // 请求合法，记录成功事?    this.recordSecurityEvent('SUCCESS', ip, userAgent, path);
    this.log(`Request allowed: ${request.method} ${path}`, 'basic');

    return null; // 允许继续处理
  }

  /**
   * 检查用户认证状?   */
  private async checkAuthentication(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: UserInfo;
    reason?: string;
  }> {
    try {
      const authHeader = request.headers.get('authorization');
      const cookieToken = request.cookies.get('auth-token')?.value;

      // 优先检查Authorization�?      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const user = await this.validateToken(token);
        if (user) {
          return { authenticated: true, user };
        }
      }

      // 检查Cookie中的token
      if (cookieToken) {
        const user = await this.validateToken(cookieToken);
        if (user) {
          return { authenticated: true, user };
        }
      }

      return {
        authenticated: false,
        reason: '未提供有效的认证凭证',
      };
    } catch (error) {
      this.log(`Authentication error: ${error}`, 'detailed');
      return {
        authenticated: false,
        reason: '认证过程出现错误',
      };
    }
  }

  /**
   * 验证JWT Token
   */
  private async validateToken(token: string): Promise<UserInfo | null> {
    try {
      // 简化实?- 实际应该使用jwt.verify
      // 这里模拟token解析
      if (token.startsWith('valid_token_')) {
        const userId = token.replace('valid_token_', '');
        return {
          id: userId,
          email: `${userId}@example.com`,
          roles: ['user'],
          isActive: true,
        };
      }

      // 模拟管理员token
      if (token === 'admin_token') {
        return {
          id: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
          isActive: true,
        };
      }

      return null;
    } catch (error) {
      this.log(`Token validation error: ${error}`, 'detailed');
      return null;
    }
  }

  /**
   * 检查用户授?   */
  private async checkAuthorization(
    request: NextRequest,
    user: UserInfo
  ): Promise<{
    authorized: boolean;
    reason?: string;
  }> {
    try {
      const path = request.nextUrl.pathname;
      const method = request.method.toLowerCase();

      // 构造权限字符串
      const permission = this.getPathPermission(path, method);

      if (permission) {
        const result = this.permissionManager.hasPermission(user, permission);
        return {
          authorized: result.hasPermission,
          reason: result.reason,
        };
      }

      // 如果没有对应的权限定义，默认允许
      return { authorized: true };
    } catch (error) {
      this.log(`Authorization error: ${error}`, 'detailed');
      return {
        authorized: false,
        reason: '授权检查出现错?,
      };
    }
  }

  /**
   * 根据路径和方法生成权限字符串
   */
  private getPathPermission(path: string, method: string): string | null {
    // API路由映射到权?    const permissionMap: Record<string, Record<string, string>> = {
      '/api/users': {
        get: 'users_read',
        post: 'users_create',
        put: 'users_update',
        delete: 'users_delete',
      },
      '/api/shops': {
        get: 'shops_read',
        post: 'shops_create',
        put: 'shops_update',
        delete: 'shops_delete',
      },
      '/api/payments': {
        get: 'payments_read',
        post: 'payments_refund',
      },
      '/api/reports': {
        get: 'reports_read',
        post: 'reports_export',
      },
    };

    // 查找匹配的路?    for (const [basePath, methods] of Object.entries(permissionMap)) {
      if (path.startsWith(basePath)) {
        return methods[method] || null;
      }
    }

    return null;
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIP(request: NextRequest): string {
    // 检查各种可能的IP�?    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // 回退到请求socket地址
    return request.ip || 'unknown';
  }

  /**
   * 检查IP是否在白名单?   */
  private isIpWhitelisted(ip: string): boolean {
    return this.config.ipWhitelist.includes(ip);
  }

  /**
   * 检查路径是否被阻止
   */
  private isPathBlocked(path: string): boolean {
    return this.config.blockedPaths.some(blockedPath =>
      path.startsWith(blockedPath)
    );
  }

  /**
   * 检查路径是否允许（无需认证?   */
  private isPathAllowed(path: string): boolean {
    return this.config.allowedPaths.some(allowedPath =>
      path.startsWith(allowedPath)
    );
  }

  /**
   * 检查是否触发速率限制
   */
  private isRateLimited(ip: string): boolean {
    const now = Date.now();
    let rateInfo = this.rateLimits.get(ip);

    if (!rateInfo) {
      rateInfo = {
        ip,
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      };
      this.rateLimits.set(ip, rateInfo);
      return false;
    }

    // 检查是否仍在阻止期?    if (rateInfo.blockedUntil && now < rateInfo.blockedUntil) {
      return true;
    }

    // 重置窗口已过?    if (now >= rateInfo.resetTime) {
      rateInfo.count = 1;
      rateInfo.resetTime = now + this.RATE_LIMIT_WINDOW;
      rateInfo.blockedUntil = undefined;
      return false;
    }

    // 增加请求?    rateInfo.count++;

    // 超过限制
    if (rateInfo.count > this.MAX_REQUESTS_PER_WINDOW) {
      rateInfo.blockedUntil = now + this.BLOCK_DURATION;
      this.log(`IP ${ip} blocked due to rate limiting`, 'basic');
      return true;
    }

    return false;
  }

  /**
   * 记录安全事件
   */
  private recordSecurityEvent(
    eventType: SecurityEvent['eventType'],
    ip: string,
    userAgent: string,
    path: string,
    userId?: string,
    details?: string
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date(),
      eventType,
      ip,
      userAgent,
      path,
      userId,
      details,
    };

    this.securityEvents.push(event);

    // 保持事件缓冲区大?    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }

    // 记录到日?    if (this.config.logLevel === 'detailed') {
      this.log(`Security Event: ${JSON.stringify(event)}`, 'detailed');
    }
  }

  /**
   * 日志记录
   */
  private log(message: string, level: 'basic' | 'detailed'): void {
    if (this.config.logLevel === 'none') return;

    if (this.config.logLevel === 'basic' && level === 'detailed') return;

    const timestamp = new Date().toISOString();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`[API Interceptor ${timestamp}] ${message}`)// 在开发环境中也可以写入文件或发送到日志服务
    if (process.env.NODE_ENV === 'development') {
      // 可以在这里添加更详细的日志处?    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): InterceptorConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<InterceptorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated', 'basic');
  }

  /**
   * 获取安全统计信息
   */
  getSecurityStats(): {
    totalRequests: number;
    blockedRequests: number;
    rateLimitedIps: number;
    activeRateLimits: number;
  } {
    const events = this.securityEvents;
    const blockedEvents = events.filter(
      e =>
        e.eventType === 'BLOCKED_PATH' ||
        e.eventType === 'RATE_LIMIT' ||
        e.eventType === 'AUTH_FAILURE' ||
        e.eventType === 'UNAUTHORIZED_ACCESS'
    );

    const activeRateLimits = Array.from(this.rateLimits.values()).filter(
      info => info.blockedUntil && Date.now() < info.blockedUntil
    ).length;

    return {
      totalRequests: events.length,
      blockedRequests: blockedEvents.length,
      rateLimitedIps: this.rateLimits.size,
      activeRateLimits,
    };
  }

  /**
   * 获取最近的安全事件
   */
  getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  /**
   * 清空安全事件日志
   */
  clearSecurityEvents(): void {
    this.securityEvents = [];
  }

  /**
   * 手动解除IP阻止
   */
  unblockIP(ip: string): boolean {
    const rateInfo = this.rateLimits.get(ip);
    if (rateInfo) {
      rateInfo.blockedUntil = undefined;
      this.log(`IP ${ip} manually unblocked`, 'basic');
      return true;
    }
    return false;
  }
}
