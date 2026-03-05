import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ApiInterceptor } from '@/modules/common/permissions/core/api-interceptor';

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
];

export async function middleware(request: NextRequest) {
  const interceptor = ApiInterceptor.getInstance();
  const path = request.nextUrl.pathname;

  // 检查是否需要拦截
  const shouldIntercept = PROTECTED_PATHS.some(prefix =>
    path.startsWith(prefix)
  );
  const isPublicPath = PUBLIC_PATHS.some(prefix => path.startsWith(prefix));

  // 公开路径不拦截
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 非保护路径且非公开路径，可以选择性拦截
  if (!shouldIntercept && !isPublicPath) {
    // 可以根据配置决定是否拦截其他路径
    return NextResponse.next();
  }

  try {
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
export const config = {
  matcher: [
    /*
     * 匹配所有API路由
     */
    '/api/:path*',
  ],
};
