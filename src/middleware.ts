import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要保护的API路径前缀
const PROTECTED_PATHS = [
  '/api/users',
  '/api/shops',
  '/api/payments',
  '/api/reports',
  '/api/admin',
  '/api/settings',
];

// 公开的 API 路径（无需认证）
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/public',
  '/api/search',
  '/api/repair-shop/dashboard',
];

// 预检查路径类型，避免对非必要路径加载拦截器
function getPathType(pathname: string): 'protected' | 'public' | 'other' {
  if (PROTECTED_PATHS.some(prefix => pathname.startsWith(prefix))) {
    return 'protected';
  }
  if (PUBLIC_PATHS.some(prefix => pathname.startsWith(prefix))) {
    return 'public';
  }
  return 'other';
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const pathType = getPathType(path);

  // 公开路径直接放行
  if (pathType === 'public') {
    return NextResponse.next();
  }

  // 非保护路径也直接放行
  if (pathType === 'other') {
    return NextResponse.next();
  }

  // 只有保护路径才加载拦截器（延迟加载）
  // 动态导入避免 Edge Runtime 兼容性问题
  try {
    const { ApiInterceptor } = await import('@/modules/common/permissions/core/api-interceptor');
    const interceptor = ApiInterceptor.getInstance();

    // 执行拦截检查
    const interceptionResult = await interceptor.intercept(request);

    // 如果拦截器返回响应，说明请求被阻止
    if (interceptionResult) {
      return interceptionResult;
    }

    // 请求通过，继续处理
    return NextResponse.next();
  } catch (error) {
    console.error('API拦截器中间件错误:', error);

    // 发生错误时，为了安全起见，阻止请求
    return NextResponse.json(
      {
        error: '内部服务器错误',
        message: '请求处理过程中发生错误',
      },
      { status: 500 }
    );
  }
}

// 配置中间件匹配的路径
// 注意：暂时禁用所有 API 路由的中间件，避免 Edge Runtime 兼容性问题
export const config = {
  matcher: [
    /*
     * 暂时只匹配管理后台路径，其他API路径直接放行
     */
    '/admin/:path*',
  ],
};
