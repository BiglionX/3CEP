import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { getMatchingRateLimitRules } from '../config/ratelimit.config';
// import { monitoringMiddleware } from './middleware/monitoring-middleware' // 暂时禁用以解决Edge Runtime兼容性问?

// 权限映射配置
const PERMISSION_MAP: Record<string, { resource: string; action: string }> = {
  '/admin/dashboard': { resource: 'dashboard', action: 'read' },
  '/admin/users': { resource: 'users', action: 'read' },
  '/admin/content': { resource: 'content', action: 'read' },
  '/admin/shops': { resource: 'shops', action: 'read' },
  '/admin/finance': { resource: 'payments', action: 'read' },
  '/admin/settings': { resource: 'settings', action: 'read' },
  '/admin/profile': { resource: 'profile', action: 'read' },
};

// 角色权限配置
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'dashboard',
    'users',
    'content',
    'shops',
    'payments',
    'settings',
    'profile',
  ],
  content_reviewer: ['dashboard', 'content'],
  shop_reviewer: ['dashboard', 'shops'],
  finance: ['dashboard', 'payments'],
  viewer: ['dashboard'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 应用监控中间?
  let response: NextResponse | null = null;
  try {
    response = await monitoringMiddleware(request, async () => {
      // 应用速率限制保护
      const rateLimitResult = await applyRateLimiting(request);
      if (rateLimitResult) {
        return rateLimitResult;
      }

      // 只对管理后台路径进行权限检?
      if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
      }

      // 创建Supabase客户?
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      try {
        // 优先检查Authorization header
        const authHeader = request.headers.get('authorization');
        let session = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const { data, error } = await supabase.auth.getUser(token);

          if (!error && data.user) {
            session = {
              user: data.user,
            };
          }
        }

        // 如果没有有效的header token，尝试从cookie获取会话
        if (!session) {
          // 手动从cookie中提取会话信?
          const cookieHeader = request.headers.get('cookie');
          if (cookieHeader) {
            // 查找Supabase auth cookie
            const supabaseCookieName = `sb-${process.env?.split('//')[1].split('.')[0]}-auth-token`;
            const cookieMatch = cookieHeader.match(
              new RegExp(`${supabaseCookieName}=([^;]+)`)
            );

            if (cookieMatch && cookieMatch[1]) {
              try {
                const cookieValue = decodeURIComponent(cookieMatch[1]);
                const sessionData = JSON.parse(cookieValue);

                if (sessionData.access_token) {
                  const { data, error } = await supabase.auth.getUser(
                    sessionData.access_token
                  );
                  if (!error && data.user) {
                    session = {
                      user: data.user,
                    };
                  }
                }
              } catch (parseError: unknown) {
                // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Cookie解析失败:', (parseError as Error).message);
              }
            }
          }

          // 如果cookie解析失败，尝试默认getSession方法
          if (!session) {
            const { data: sessionData } = await supabase.auth.getSession();
            session = sessionData.session;
          }
        }

        // 如果没有登录，重定向到登录页
        if (!session) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // 检查用户是否为管理?
        const isAdmin = await checkAdminUser(session.user.id, supabase);
        if (!isAdmin) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${session.user.id} 不是管理员，重定向到未授权页面`)return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        // 为管理员用户应用更宽松的限流策略
        if (isAdmin) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`管理员用?${session.user.id} 访问: ${pathname}`)}

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`管理员用?${session.user.id} 访问: ${pathname}`)// 检查具体页面权?
        const requiredPermission = getRequiredPermission(pathname);
        const hasPermission = await checkUserPermission(
          session.user.id,
          requiredPermission.resource,
          requiredPermission.action,
          supabase
        );

        if (!hasPermission) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        return NextResponse.next();
      } catch (error) {
        console.error('权限检查错?', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    });
  } catch (error) {
    console.error('监控中间件错?', error);
    // 即使监控失败也要继续处理请求
    response = NextResponse.next();
  }

  return response;

  // 只对管理后台路径进行权限检?
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 创建Supabase客户?
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 优先检查Authorization header
    const authHeader = request.headers.get('authorization');
    let session = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data.user) {
        session = {
          user: data.user,
        };
      }
    }

    // 如果没有有效的header token，尝试从cookie获取会话
    if (!session) {
      // 手动从cookie中提取会话信?
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        // 查找Supabase auth cookie
        const supabaseCookieName = `sb-${process.env?.split('//')[1].split('.')[0]}-auth-token`;
        const cookieMatch = cookieHeader.match(
          new RegExp(`${supabaseCookieName}=([^;]+)`)
        );

        if (cookieMatch) {
          try {
            const cookieValue = decodeURIComponent(cookieMatch[1]);
            const sessionData = JSON.parse(cookieValue);

            if (sessionData.access_token) {
              const { data, error } = await supabase.auth.getUser(
                sessionData.access_token
              );
              if (!error && data.user) {
                session = {
                  user: data.user,
                };
              }
            }
          } catch (parseError: unknown) {
            // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Cookie解析失败:', (parseError as Error).message);
          }
        }
      }

      // 如果cookie解析失败，尝试默认getSession方法
      if (!session) {
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      }
    }

    // 如果没有登录，重定向到登录页
    if (!session) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 检查用户是否为管理?
    const isAdmin = await checkAdminUser(session.user.id, supabase);
    if (!isAdmin) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${session.user.id} 不是管理员，重定向到未授权页面`)return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // 为管理员用户应用更宽松的限流策略
    if (isAdmin) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`管理员用?${session.user.id} 访问: ${pathname}`)}

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`管理员用?${session.user.id} 访问: ${pathname}`)// 检查具体页面权?
    const requiredPermission = getRequiredPermission(pathname);
    const hasPermission = await checkUserPermission(
      session.user.id,
      requiredPermission.resource,
      requiredPermission.action,
      supabase
    );

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('权限检查错?', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 检查用户是否为管理?
async function checkAdminUser(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    // 首先检查用户元数据中的管理员标识（优先方案?
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (!userError && userData?.user_metadata?.isAdmin === true) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 通过元数据验证为管理员`)return true;
    }

    // 如果元数据检查失败，尝试检查数据库中的管理员记录（备用方案?
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!error && data !== null) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 通过数据库验证为管理员`)return true;
      }
    } catch (dbError) {
      // 数据库检查失败时，如果元数据检查也失败，则返回false
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 数据库检查失败，且元数据不是管理员`)}

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 不是管理员`)return false;
  } catch (error) {
    console.error('检查管理员身份失败:', error);
    return false;
  }
}

// 根据路径获取所需权限
function getRequiredPermission(pathname: string): {
  resource: string;
  action: string;
} {
  // 精确匹配
  if (PERMISSION_MAP[pathname]) {
    return PERMISSION_MAP[pathname];
  }

  // 模糊匹配（处理动态路由）
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length >= 2 && pathSegments[0] === 'admin') {
    const resource = pathSegments[1];
    return { resource, action: 'read' };
  }

  // 默认权限
  return { resource: 'dashboard', action: 'read' };
}

// 检查用户具体权?
async function checkUserPermission(
  userId: string,
  resource: string,
  action: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    // 首先检查用户元数据中的管理员标识（优先方案?
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (!userError && userData?.user_metadata?.isAdmin === true) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 是超级管理员，拥有全部权限`)return true;
    }

    // 如果元数据不是管理员，检查数据库中的管理员记录（备用方案?
    try {
      const { data: adminUserData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUserData) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('用户未找到或非活跃管理员:', userId)return false
      }

      const userRole = adminUserData.role;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 的角? ${userRole}, 请求资源: ${resource}`)// 管理员拥有所有权?
      if (userRole === 'admin') {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('超级管理员拥有全部权?)return true
      }

      // 检查角色对应的资源权限
      const allowedResources = ROLE_PERMISSIONS[userRole] || [];
      const hasResourceAccess = allowedResources.includes(resource);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`角色 ${userRole} 允许访问的资?`, allowedResources)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`资源访问权限检查结? ${hasResourceAccess}`)return hasResourceAccess;
    } catch (dbError) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 数据库权限检查失败`)return false;
    }
  } catch (error) {
    console.error('权限检查失?', error);
    return false;
  }
}

// 配置中间件匹配器
export const config = {
  matcher: [
    '/admin/:path*',
    '/unauthorized',
    '/api/:path*',
    '/login',
    '/auth/:path*',
    '/monitoring/:path*',
  ],
};

// 应用速率限制保护
async function applyRateLimiting(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 获取匹配的限流规?
  const matchingRules = getMatchingRateLimitRules(pathname, method);

  if (matchingRules.length > 0) {
    // 应用最严格的限流规?
    const strictestRule = matchingRules.reduce((prev: any, current: any) =>
      prev.config.maxRequests < current.config.maxRequests ? prev : current
    );

    const result = await rateLimitMiddleware(request, {
      type: strictestRule.type === 'custom' ? 'api' : strictestRule.type,
      customConfig: strictestRule.config,
    });

    if (result) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`请求被限? ${method} ${pathname} - 规则: ${strictestRule.name}`)return result;
    }
  }

  return null;
}
