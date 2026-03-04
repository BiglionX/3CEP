/**
 * 浼佷笟鏈嶅姟API涓棿?
 * 鐢ㄤ簬淇濇姢浼佷笟鏈嶅姟鐩稿叧鐨凙PI绔偣
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { checkEnterpriseApiAccess } from '@/middleware/enterprise-permissions'

// API鏉冮檺鏄犲皠
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
 * 浼佷笟鏈嶅姟API涓棿浠跺鐞嗗櫒
 */
export async function enterpriseApiMiddleware(request: NextRequest) {
  const method = request.method
  const pathname = request.nextUrl.pathname
  const routeKey = `${method} ${pathname}`
  
  // 鑾峰彇鎵€闇€鏉冮檺
  const requiredPermission = API_PERMISSIONS[routeKey]
  
  if (!requiredPermission) {
    // 濡傛灉娌℃湁瀹氫箟鏉冮檺锛屽厑璁歌闂絾璁板綍璀﹀憡
    console.warn(`鏈畾涔夋潈闄愮殑API璺敱: ${routeKey}`)
    return NextResponse.next()
  }
  
  // 妫€鏌ユ潈?
  const { allowed, user } = await checkEnterpriseApiAccess(request, requiredPermission)
  
  if (!allowed) {
    console.warn(`API鏉冮檺鎷掔粷: ${routeKey}`, {
      userId: user?.id || 'anonymous',
      requiredPermission,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      {
        error: '鏉冮檺涓嶈冻',
        message: '鎮ㄦ病鏈夋潈闄愯闂API绔偣',
        requiredPermission
      },
      { status: 403 }
    )
  }
  
  // 娣诲姞鐢ㄦ埛淇℃伅鍒板搷搴斿ご
  const response = NextResponse.next()
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email || '')
  }
  
  return response
}

/**
 * 閫氱敤API鏉冮檺妫€鏌ヨ楗板櫒
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
          error: '鏉冮檺涓嶈冻',
          message: '鎮ㄦ病鏈夋墽琛屾鎿嶄綔鐨勬潈?,
          requiredPermission: permission
        },
        { status: 403 }
      )
    }
    
    // 灏嗙敤鎴蜂俊鎭敞鍏ュ埌璇锋眰涓婁笅鏂囦腑
    (request as any).currentUser = user
    
    return handler(request)
  }
}

export { API_PERMISSIONS }
