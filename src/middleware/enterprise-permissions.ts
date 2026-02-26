/**
 * 企业服务权限中间件
 * 专门处理企业服务门户的访问控制和权限验证
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

// 企业服务路由映射
const ENTERPRISE_ROUTES = {
  // 公共访问路径
  PUBLIC: [
    '/enterprise',
    '/enterprise/agents/customize',
    '/enterprise/procurement'
  ],
  
  // 需要认证的路径
  AUTH_REQUIRED: [
    '/enterprise/dashboard',
    '/enterprise/profile',
    '/enterprise/settings'
  ],
  
  // 管理员路径
  ADMIN_ONLY: [
    '/enterprise/admin',
    '/enterprise/admin/dashboard',
    '/enterprise/admin/users',
    '/enterprise/admin/settings'
  ],
  
  // 采购相关路径
  PROCUREMENT_ACCESS: [
    '/enterprise/procurement/dashboard',
    '/enterprise/procurement/orders',
    '/enterprise/procurement/suppliers'
  ],
  
  // 智能体相关路径
  AGENTS_ACCESS: [
    '/enterprise/agents/dashboard',
    '/enterprise/agents/workflows',
    '/enterprise/agents/config'
  ]
}

// 角色权限映射
const ROLE_PERMISSIONS = {
  'enterprise_admin': ['enterprise_full_access'],
  'procurement_manager': ['procurement_access', 'orders_manage'],
  'agent_operator': ['agents_access', 'workflows_execute'],
  'enterprise_user': ['enterprise_basic_access']
}

/**
 * 检查用户是否对企业服务有访问权限
 */
export async function checkEnterpriseAccess(
  request: NextRequest,
  currentUser: any
): Promise<boolean> {
  const pathname = request.nextUrl.pathname
  
  // 检查公共路径
  if (ENTERPRISE_ROUTES.PUBLIC.some(route => pathname.startsWith(route))) {
    return true
  }
  
  // 检查需要认证的路径
  if (ENTERPRISE_ROUTES.AUTH_REQUIRED.some(route => pathname.startsWith(route))) {
    return !!currentUser
  }
  
  // 检查管理员路径
  if (ENTERPRISE_ROUTES.ADMIN_ONLY.some(route => pathname.startsWith(route))) {
    return currentUser?.roles?.includes('admin') || 
           currentUser?.roles?.includes('enterprise_admin')
  }
  
  // 检查采购相关路径
  if (ENTERPRISE_ROUTES.PROCUREMENT_ACCESS.some(route => pathname.startsWith(route))) {
    return currentUser?.roles?.includes('admin') ||
           currentUser?.roles?.includes('enterprise_admin') ||
           currentUser?.roles?.includes('procurement_manager') ||
           currentUser?.roles?.includes('procurement_specialist')
  }
  
  // 检查智能体相关路径
  if (ENTERPRISE_ROUTES.AGENTS_ACCESS.some(route => pathname.startsWith(route))) {
    return currentUser?.roles?.includes('admin') ||
           currentUser?.roles?.includes('enterprise_admin') ||
           currentUser?.roles?.includes('agent_operator')
  }
  
  return false
}

/**
 * 获取用户在企业服务中的具体权限
 */
export function getUserEnterprisePermissions(currentUser: any): string[] {
  if (!currentUser?.roles) return []
  
  const permissions: string[] = []
  
  currentUser.roles.forEach((role: string) => {
    if (ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]) {
      permissions.push(...ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS])
    }
  })
  
  // 管理员拥有所有权限
  if (currentUser.roles.includes('admin') || currentUser.roles.includes('enterprise_admin')) {
    permissions.push('enterprise_full_access')
  }
  
  return [...new Set(permissions)] // 去重
}

/**
 * 企业服务权限中间件主函数
 */
export async function enterprisePermissionMiddleware(request: NextRequest) {
  const currentUser = await AuthService.getCurrentUser()
  
  // 检查访问权限
  const hasAccess = await checkEnterpriseAccess(request, currentUser)
  
  if (!hasAccess) {
    // 记录未授权访问尝试
    console.warn(`Unauthorized enterprise access attempt: ${request.nextUrl.pathname}`, {
      userId: currentUser?.id || 'anonymous',
      timestamp: new Date().toISOString()
    })
    
    // 返回403 Forbidden
    return NextResponse.json(
      { 
        error: '访问被拒绝', 
        message: '您没有权限访问此企业服务页面' 
      }, 
      { status: 403 }
    )
  }
  
  // 添加权限头信息
  const response = NextResponse.next()
  const permissions = getUserEnterprisePermissions(currentUser)
  
  response.headers.set('x-enterprise-permissions', JSON.stringify(permissions))
  response.headers.set('x-user-id', currentUser?.id || '')
  
  return response
}

/**
 * 企业服务API权限检查函数
 */
export async function checkEnterpriseApiAccess(
  request: NextRequest,
  requiredPermission: string
): Promise<{ allowed: boolean; user?: any }> {
  const currentUser = await AuthService.getCurrentUser()
  
  if (!currentUser) {
    return { allowed: false }
  }
  
  const permissions = getUserEnterprisePermissions(currentUser)
  
  // 检查是否具有所需权限
  const hasPermission = permissions.includes(requiredPermission) || 
                       permissions.includes('enterprise_full_access')
  
  return {
    allowed: hasPermission,
    user: currentUser
  }
}

// 导出常量供其他模块使用
export { ENTERPRISE_ROUTES, ROLE_PERMISSIONS }