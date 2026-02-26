/**
 * 企业服务API中间件
 * 用于保护企业服务相关的API端点
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { checkEnterpriseApiAccess } from '@/middleware/enterprise-permissions'

// API权限映射
const API_PERMISSIONS: Record<string, string> = {
  'GET /api/enterprise/dashboard': 'enterprise_read',
  'POST /api/enterprise/dashboard': 'enterprise_manage',
  'GET /api/enterprise/agents': 'enterprise_agents_read',
  'POST /api/enterprise/agents': 'enterprise_agents_manage',
  'GET /api/enterprise/procurement': 'enterprise_procurement_read',
  'POST /api/enterprise/procurement': 'enterprise_procurement_manage',
  'GET /api/enterprise/profile': 'enterprise_read',
  'PUT /api/enterprise/profile': 'enterprise_manage'
}

/**
 * 企业服务API中间件处理器
 */
export async function enterpriseApiMiddleware(request: NextRequest) {
  const method = request.method
  const pathname = request.nextUrl.pathname
  const routeKey = `${method} ${pathname}`
  
  // 获取所需权限
  const requiredPermission = API_PERMISSIONS[routeKey]
  
  if (!requiredPermission) {
    // 如果没有定义权限，允许访问但记录警告
    console.warn(`未定义权限的API路由: ${routeKey}`)
    return NextResponse.next()
  }
  
  // 检查权限
  const { allowed, user } = await checkEnterpriseApiAccess(request, requiredPermission)
  
  if (!allowed) {
    console.warn(`API权限拒绝: ${routeKey}`, {
      userId: user?.id || 'anonymous',
      requiredPermission,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      {
        error: '权限不足',
        message: '您没有权限访问此API端点',
        requiredPermission
      },
      { status: 403 }
    )
  }
  
  // 添加用户信息到响应头
  const response = NextResponse.next()
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email || '')
  }
  
  return response
}

/**
 * 通用API权限检查装饰器
 */
export function withEnterprisePermission(
  handler: (req: NextRequest) => Promise<NextResponse>,
  permission: string
) {
  return async (request: NextRequest) => {
    const { allowed, user } = await checkEnterpriseApiAccess(request, permission)
    
    if (!allowed) {
      return NextResponse.json(
        {
          error: '权限不足',
          message: '您没有执行此操作的权限',
          requiredPermission: permission
        },
        { status: 403 }
      )
    }
    
    // 将用户信息注入到请求上下文中
    (request as any).currentUser = user
    
    return handler(request)
  }
}

export { API_PERMISSIONS }