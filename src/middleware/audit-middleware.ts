import { AuthService } from '@/lib/auth-service';
import { AuditService } from '@/services/audit-service';
import { NextRequest, NextResponse } from 'next/server';

export async function auditMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 只记录管理后台的操作
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 排除静态资源和API路由
  if (
    pathname.includes('.') ||
    pathname.includes('_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  try {
    // 获取用户信息
    const user = await AuthService.getCurrentUser();
    if (!user) {
      return NextResponse.next();
    }

    // 解析操作信息
    const actionInfo = parseAction(pathname, request.method);

    if (actionInfo) {
      await AuditService.logAction({
        user_id: user.id,
        user_email: user.email || '',
        action: actionInfo.action,
        resource: actionInfo.resource,
        resource_id: actionInfo.resource_id,
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '',
        user_agent: request.headers.get('user-agent') || '',
        session_id: request.cookies.get('session-id')?.value,
      });
    }
  } catch (error) {
    console.error('审计中间件错?', error);
  }

  return NextResponse.next();
}

function parseAction(
  pathname: string,
  method: string
): {
  action: string;
  resource: string;
  resource_id?: string;
} | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length < 2) return null;

  const resource = segments[1]; // admin/[resource]
  const resourceId = segments[2]; // 可能的资源ID

  let action = '';

  switch (method) {
    case 'POST':
      action = 'create';
      break;
    case 'PUT':
    case 'PATCH':
      action = 'update';
      break;
    case 'DELETE':
      action = 'delete';
      break;
    case 'GET':
      action = resourceId ? 'view' : 'list';
      break;
    default:
      return null;
  }

  // 特殊操作映射
  if (pathname.includes('approve')) action = 'approve';
  if (pathname.includes('reject')) action = 'reject';
  if (pathname.includes('publish')) action = 'publish';

  return {
    action,
    resource,
    resource_id:
      resourceId && !isNaN(Number(resourceId)) ? resourceId : undefined,
  };
}

// 导出中间件配?export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * - _next/static (静态文?
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon文件)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
