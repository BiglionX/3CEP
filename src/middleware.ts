import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 权限映射配置
const PERMISSION_MAP: Record<string, { resource: string; action: string }> = {
  '/admin/dashboard': { resource: 'dashboard', action: 'read' },
  '/admin/users': { resource: 'users', action: 'read' },
  '/admin/content': { resource: 'content', action: 'read' },
  '/admin/shops': { resource: 'shops', action: 'read' },
  '/admin/finance': { resource: 'payments', action: 'read' },
  '/admin/settings': { resource: 'settings', action: 'read' },
  '/admin/profile': { resource: 'profile', action: 'read' }
}

// 角色权限配置
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'admin': ['dashboard', 'users', 'content', 'shops', 'payments', 'settings', 'profile'],
  'content_reviewer': ['dashboard', 'content'],
  'shop_reviewer': ['dashboard', 'shops'],
  'finance': ['dashboard', 'payments'],
  'viewer': ['dashboard']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 只对管理后台路径进行权限检查
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 获取Cookie和创建Supabase客户端
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // 获取用户会话
    const { data: { session } } = await supabase.auth.getSession()
    
    // 如果没有登录，重定向到登录页
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 检查用户是否为管理员
    const isAdmin = await checkAdminUser(session.user.id, supabase)
    if (!isAdmin) {
      console.log(`用户 ${session.user.id} 不是管理员，重定向到未授权页面`)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    console.log(`管理员用户 ${session.user.id} 访问: ${pathname}`)

    // 检查具体页面权限
    const requiredPermission = getRequiredPermission(pathname)
    const hasPermission = await checkUserPermission(
      session.user.id, 
      requiredPermission.resource, 
      requiredPermission.action,
      supabase
    )

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
    
  } catch (error) {
    console.error('权限检查错误:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// 检查用户是否为管理员
async function checkAdminUser(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    return !error && data !== null
  } catch (error) {
    console.error('检查管理员身份失败:', error)
    return false
  }
}

// 根据路径获取所需权限
function getRequiredPermission(pathname: string): { resource: string; action: string } {
  // 精确匹配
  if (PERMISSION_MAP[pathname]) {
    return PERMISSION_MAP[pathname]
  }
  
  // 模糊匹配（处理动态路由）
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length >= 2 && pathSegments[0] === 'admin') {
    const resource = pathSegments[1]
    return { resource, action: 'read' }
  }
  
  // 默认权限
  return { resource: 'dashboard', action: 'read' }
}

// 检查用户具体权限
async function checkUserPermission(
  userId: string, 
  resource: string, 
  action: string,
  supabase: any
): Promise<boolean> {
  try {
    // 获取用户角色
    const { data: adminUserData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUserData) {
      console.log('用户未找到或非活跃管理员:', userId)
      return false
    }

    const userRole = adminUserData.role
    console.log(`用户 ${userId} 的角色: ${userRole}, 请求资源: ${resource}`)

    // 管理员拥有所有权限
    if (userRole === 'admin') {
      console.log('超级管理员拥有全部权限')
      return true
    }

    // 检查角色对应的资源权限
    const allowedResources = ROLE_PERMISSIONS[userRole] || []
    const hasResourceAccess = allowedResources.includes(resource)
    
    console.log(`角色 ${userRole} 允许访问的资源:`, allowedResources)
    console.log(`资源访问权限检查结果: ${hasResourceAccess}`)
    
    return hasResourceAccess
    
  } catch (error) {
    console.error('权限检查失败:', error)
    return false
  }
}

// 配置中间件匹配器
export const config = {
  matcher: [
    '/admin/:path*',
    '/unauthorized'
  ]
}