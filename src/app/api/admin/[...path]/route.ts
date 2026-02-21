import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { AdminUserService } from '@/lib/admin-user-service'

// 统一的管理API处理器
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleAdminRequest(request, params, 'GET')
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleAdminRequest(request, params, 'POST')
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleAdminRequest(request, params, 'PUT')
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleAdminRequest(request, params, 'DELETE')
}

async function handleAdminRequest(
  request: Request, 
  params: Promise<{ path: string[] }>, 
  method: string
) {
  try {
    // 验证认证状态
    const isAuthenticated = await AuthService.isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '未授权访问' }, 
        { status: 401 }
      )
    }

    // 验证权限
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: '用户未登录' }, 
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const resource = resolvedParams.path[0] || 'dashboard'
    const action = getActionFromMethod(method)
    
    const hasPermission = await AuthService.checkPermission(
      currentUser.id, 
      resource, 
      action
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: '权限不足' }, 
        { status: 403 }
      )
    }

    // 处理具体的API逻辑
    return await handleApiLogic(resolvedParams.path, method, request)

  } catch (error) {
    console.error('管理API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    )
  }
}

function getActionFromMethod(method: string): string {
  const actionMap: Record<string, string> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'DELETE': 'delete'
  }
  return actionMap[method] || 'read'
}

async function handleApiLogic(path: string[], method: string, request: Request) {
  // 根据路径和方法处理不同的API逻辑
  const endpoint = path.join('/')
  
  try {
    switch (endpoint) {
      case 'users':
        return handleUsersApi(method, request)
      case 'users/stats':
        return handleUsersStatsApi(method, request)
      case 'permissions':
        return handlePermissionsApi(method, request)
      case 'dashboard/stats':
        return handleDashboardStatsApi(method, request)
      case 'dashboard/export':
        return handleDashboardExportApi(method, request)
      default:
        // 尝试解析更复杂的路径
        if (path.length >= 2 && path[0] === 'users') {
          return handleUserDetailApi(method, path[1], request)
        }
        return NextResponse.json(
          { error: 'API端点不存在' }, 
          { status: 404 }
        )
    }
  } catch (error) {
    console.error('API处理错误:', error)
    return NextResponse.json(
      { error: 'API处理失败' }, 
      { status: 500 }
    )
  }
}

// 用户管理API
async function handleUsersApi(method: string, request: Request) {
  switch (method) {
    case 'GET':
      const users = await AdminUserService.getAllUsers()
      return NextResponse.json({ users })
    
    case 'POST':
      const body = await request.json()
      const newUser = await AdminUserService.createUser(body)
      if (newUser) {
        return NextResponse.json({ user: newUser }, { status: 201 })
      } else {
        return NextResponse.json(
          { error: '创建用户失败' }, 
          { status: 400 }
        )
      }
    
    default:
      return NextResponse.json(
        { error: '不支持的请求方法' }, 
        { status: 405 }
      )
  }
}

// 用户详情API
async function handleUserDetailApi(method: string, userId: string, request: Request) {
  switch (method) {
    case 'GET':
      // 获取单个用户详情
      const user = await AdminUserService.findUserById(userId)
      if (user) {
        return NextResponse.json({ user })
      } else {
        return NextResponse.json(
          { error: '用户不存在' }, 
          { status: 404 }
        )
      }
    
    case 'PUT':
      const body = await request.json()
      const updated = await AdminUserService.updateUser(userId, body)
      if (updated) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: '更新用户失败' }, 
          { status: 400 }
        )
      }
    
    case 'DELETE':
      const deleted = await AdminUserService.deleteUser(userId)
      if (deleted) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: '删除用户失败' }, 
          { status: 400 }
        )
      }
    
    default:
      return NextResponse.json(
        { error: '不支持的请求方法' }, 
        { status: 405 }
      )
  }
}

// 用户统计API
async function handleUsersStatsApi(method: string, request: Request) {
  if (method !== 'GET') {
    return NextResponse.json(
      { error: '只支持GET方法' }, 
      { status: 405 }
    )
  }
  
  const stats = await AdminUserService.getUserStats()
  return NextResponse.json({ stats })
}

// 权限管理API
async function handlePermissionsApi(method: string, request: Request) {
  if (method !== 'GET') {
    return NextResponse.json(
      { error: '只支持GET方法' }, 
      { status: 405 }
    )
  }
  
  const currentUser = await AuthService.getCurrentUser()
  if (!currentUser) {
    return NextResponse.json(
      { error: '用户未登录' }, 
      { status: 401 }
    )
  }
  
  const permissions = await AuthService.getUserPermissions(currentUser.id)
  return NextResponse.json({ permissions })
}

// 仪表板统计API
async function handleDashboardStatsApi(method: string, request: Request) {
  if (method !== 'GET') {
    return NextResponse.json(
      { error: '只支持GET方法' }, 
      { status: 405 }
    )
  }
  
  // 这里可以集成实际的业务统计数据
  const mockStats = {
    totalUsers: 15,
    activeUsers: 12,
    pendingReviews: 8,
    totalRevenue: 32500,
    recentActivity: [
      { type: 'user_created', message: '新用户注册', time: '2小时前' },
      { type: 'content_reviewed', message: '内容审核完成', time: '4小时前' },
      { type: 'payment_received', message: '收到新订单', time: '1天前' }
    ]
  }
  
  return NextResponse.json({ stats: mockStats })
}