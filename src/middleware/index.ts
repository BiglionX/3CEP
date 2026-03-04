/**
 * 统一中间件入? * 整合所有中间件逻辑，包括快速修复方? */

import { NextRequest, NextResponse } from 'next/server';
import {
  adminAccessMiddleware,
  debugLoggingMiddleware,
} from './admin-access-fix';
import { enterprisePermissionMiddleware } from './enterprise-permissions';
import { rateLimitMiddleware } from './rate-limit.middleware';

// 中间件执行顺?const MIDDLEWARE_PIPELINE = [
  debugLoggingMiddleware, // 1. 调试日志
  rateLimitMiddleware, // 2. 速率限制
  adminAccessMiddleware, // 3. 管理员访问控制（快速修复版?  enterprisePermissionMiddleware, // 4. 企业权限检?];

/**
 * 主中间件处理? */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 跳过静态资源和API路由的中间件处理
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // 按顺序执行中间件管道
  for (const middlewareFn of MIDDLEWARE_PIPELINE) {
    try {
      const response = await middlewareFn(request);

      // 如果中间件返回了响应（非NextResponse.next()），则直接返?      if (response && response !== NextResponse.next()) {
        return response;
      }
    } catch (error) {
      console.error(`中间件执行错?(${middlewareFn.name}):`, error);
      // 继续执行下一个中间件，不中断整个流程
    }
  }

  // 所有中间件都通过，正常继?  return NextResponse.next();
}

// 配置匹配?export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * - API路由
     * - 静态文?     * - _next目录
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
