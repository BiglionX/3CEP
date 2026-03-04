/**
 * 管理员访问快速修复中间件
 * 临时放宽权限检查，增加调试日志，创建豁免机? */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';

// 开发环境豁免白名单
const DEVELOPMENT_WHITELIST = [
  'localhost',
  '127.0.0.1',
  'local.3cep.com',
  'dev.3cep.com',
];

// 管理员路?const ADMIN_PATHS = [
  '/admin',
  '/dashboard',
  '/profile',
  '/settings',
  '/users',
  '/audit',
  '/monitoring',
];

/**
 * 检查是否为开发环? */
function isDevelopmentEnvironment(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const referer = request.headers.get('referer') || '';

  return DEVELOPMENT_WHITELIST.some(
    domain => host.includes(domain) || referer.includes(domain)
  );
}

/**
 * 检查是否为管理员路? */
function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(path => pathname.startsWith(path));
}

/**
 * 快速管理员权限检查（临时放宽? */
async function quickAdminCheck(request: NextRequest): Promise<{
  authorized: boolean;
  user: any;
  debugInfo: any;
}> {
  const pathname = request.nextUrl.pathname;
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    pathname,
    userAgent: request.headers.get('user-agent'),
    host: request.headers.get('host'),
  };

  try {
    // 获取当前用户
    const user = await AuthService.getCurrentUser();
    debugInfo.userId = user?.id || 'anonymous';
    debugInfo.userEmail = user?.email || 'no-email';

    if (!user) {
      debugInfo.reason = 'no-auth-session';
      return { authorized: false, user: null, debugInfo };
    }

    // 检查用户元数据中的管理员标?    const userMetadata = user.user_metadata || {};
    const isAdminFromMetadata =
      userMetadata.isAdmin === true ||
      userMetadata.is_admin === true ||
      userMetadata.role === 'admin';

    debugInfo.metadataCheck = {
      isAdmin: userMetadata.isAdmin,
      is_admin: userMetadata.is_admin,
      role: userMetadata.role,
      result: isAdminFromMetadata,
    };

    // 检查本地存储的临时管理员权限（浏览器环境）
    let hasTempAdmin = false;
    if (typeof window !== 'undefined') {
      try {
        const tempAdmin = localStorage.getItem('temp-admin-access');
        const isAdminFlag = localStorage.getItem('is-admin');
        const userRole = localStorage.getItem('user-role');

        hasTempAdmin =
          tempAdmin === 'true' ||
          isAdminFlag === 'true' ||
          userRole === 'admin';

        debugInfo.tempAdminCheck = {
          tempAdmin,
          isAdminFlag,
          userRole,
          result: hasTempAdmin,
        };
      } catch (e: any) {
        debugInfo.tempAdminError = e?.message || String(e);
      }
    }

    // 检查数据库中的管理员记?    let hasDbAdmin = false;
    try {
      hasDbAdmin = await AuthService.isAdminUser(user.id);
      debugInfo.dbCheck = hasDbAdmin;
    } catch (dbError: any) {
      debugInfo.dbError = dbError?.message || String(dbError);
    }

    // 综合判断权限
    const isAuthorized = isAdminFromMetadata || hasTempAdmin || hasDbAdmin;

    debugInfo.finalResult = {
      metadata: isAdminFromMetadata,
      temp: hasTempAdmin,
      database: hasDbAdmin,
      authorized: isAuthorized,
    };

    // 记录详细的调试日?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[ADMIN ACCESS DEBUG]', JSON.stringify(debugInfo, null, 2));

    return {
      authorized: isAuthorized,
      user: isAuthorized ? user : null,
      debugInfo,
    };
  } catch (error: any) {
    debugInfo.error = error?.message || String(error);
    console.error('[ADMIN ACCESS ERROR]', error);
    return { authorized: false, user: null, debugInfo };
  }
}

/**
 * 主要的管理员访问中间? */
export async function adminAccessMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 只处理管理员相关路径
  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // 开发环境豁免检?  const isDevEnv = isDevelopmentEnvironment(request);
  if (isDevEnv) {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`[DEV EXEMPTION] 允许开发环境访? ${pathname}`)const response = NextResponse.next();
    response.headers.set('x-dev-exemption', 'true');
    return response;
  }

  // 执行权限检?  const { authorized, user, debugInfo } = await quickAdminCheck(request);

  if (!authorized) {
    console.warn(`[ADMIN DENIED] 管理员访问被拒绝:`, {
      pathname,
      userId: debugInfo.userId,
      reasons: debugInfo,
    });

    // 返回友好的错误页面而不?03
    const response = NextResponse.redirect(
      new URL('/unauthorized', request.url)
    );
    response.headers.set('x-admin-access-denied', 'true');
    response.headers.set('x-debug-info', JSON.stringify(debugInfo));
    return response;
  }

  // 授权成功 - 添加用户信息到响应头
  const response = NextResponse.next();
  response.headers.set('x-admin-user-id', user.id);
  response.headers.set('x-admin-user-email', user.email || '');
  response.headers.set('x-admin-authorized', 'true');
  response.headers.set('x-debug-info', JSON.stringify(debugInfo));

  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
    `[ADMIN GRANTED] 管理员访问授权成? ${user.email} -> ${pathname}`
  )return response;
}

/**
 * 调试专用中间?- 输出详细日志
 */
export async function debugLoggingMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // 记录所有请求的基本信息
  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[REQUEST DEBUG]', {
    method,
    pathname,
    host: request.headers.get('host'),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    timestamp: new Date().toISOString(),
  });

  // 如果是管理员路径，记录更详细的信?  if (isAdminPath(pathname)) {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[ADMIN REQUEST DETAIL]', {
      pathname,
      hasAuthHeader: !!authHeader,
      hasCookies: !!cookieHeader,
      cookieLength: cookieHeader ? cookieHeader.length : 0,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.next();
}

// 导出配置
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/users/:path*',
    '/audit/:path*',
    '/monitoring/:path*',
  ],
};
