import { AuthService } from '@/lib/auth-service';
import { NextResponse } from 'next/server';

// 统一的管理API处理器
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleAdminRequest(request, params, 'GET');
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleAdminRequest(request, params, 'POST');
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleAdminRequest(request, params, 'PUT');
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleAdminRequest(request, params, 'DELETE');
}

async function handleAdminRequest(
  request: Request,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    console.log('[Admin API] ====== 请求开始 ======');
    console.log('[Admin API] 路径:', request.url);
    console.log('[Admin API] Cookie Header:', request.headers.get('cookie'));
    console.log(
      '[Admin API] Authorization Header:',
      request.headers.get('authorization')
    );

    // 优先从 Authorization header 获取用户信息
    const authHeader = request.headers.get('authorization');
    let currentUser = await AuthService.getCurrentUserFromHeader(authHeader);

    // 如果 header 中没有，再尝试从 cookie 获取
    if (!currentUser) {
      console.log('[Admin API] Header 中未找到用户，尝试从 cookie 获取...');
      currentUser = await AuthService.getCurrentUser();
    }

    console.log('[Admin API] 当前用户:', currentUser?.email || 'null');

    if (!currentUser) {
      console.log('[Admin API] ❌ 未找到认证用户');
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    // 验证是否为管理员
    const isAdmin = await AuthService.isAdminUser(currentUser.id);
    console.log('[Admin API] 是否为管理员:', isAdmin);

    if (!isAdmin) {
      console.log('[Admin API] ❌ 非管理员用户');
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const resolvedParams = await params;
    const resource = resolvedParams.path[0] || 'dashboard';
    const action = getActionFromMethod(method);

    const hasPermission = await AuthService.checkPermission(
      currentUser.id,
      resource,
      action
    );

    if (!hasPermission) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 处理具体的API逻辑
    return await handleApiLogic(resolvedParams.path, method, request);
  } catch (error) {
    console.error('管理API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

function getActionFromMethod(method: string): string {
  const actionMap: Record<string, string> = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    DELETE: 'delete',
  };
  return actionMap[method] || 'read';
}

async function handleApiLogic(
  path: string[],
  method: string,
  request: Request
) {
  // 根据路径和方法处理不同的API逻辑
  const endpoint = path.join('/');

  try {
    switch (endpoint) {
      case 'users':
        return handleUsersApi(method, request);
      case 'users/stats':
        return handleUsersStatsApi();
      case 'permissions':
        return handlePermissionsApi(method);
      case 'dashboard/stats':
        return handleDashboardStatsApi();
      case 'dashboard/export':
        return handleDashboardExportApi(method, request);
      default:
        // 尝试解析更复杂的路径
        if (path.length >= 2 && path[0] === 'users') {
          return handleUserDetailApi(method, path[1], request);
        }
        return NextResponse.json({ error: 'API端点不存在' }, { status: 404 });
    }
  } catch (error) {
    console.error('API处理错误:', error);
    return NextResponse.json({ error: 'API处理失败' }, { status: 500 });
  }
}

// 用户管理 API
async function handleUsersApi(method: string, request: Request) {
  switch (method) {
    case 'GET':
      // 模拟用户列表
      const users = [
        { id: '1', email: 'admin@example.com', role: 'admin' },
        { id: '2', email: 'user@example.com', role: 'user' },
      ];
      return NextResponse.json({ users });

    case 'POST':
      const body = await request.json();
      const newUser = {
        id: String(Date.now()),
        ...body,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ user: newUser }, { status: 201 });

    default:
      return NextResponse.json({ error: '不支持的请求方法' }, { status: 405 });
  }
}

// 用户详情 API
async function handleUserDetailApi(
  method: string,
  userId: string,
  request: Request
) {
  switch (method) {
    case 'GET':
      // 模拟单个用户详情
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      };
      return NextResponse.json({ user: mockUser });

    case 'PUT':
      const body = await request.json();
      return NextResponse.json({
        success: true,
        user: { id: userId, ...body },
      });

    case 'DELETE':
      return NextResponse.json({ success: true, message: '用户已删除' });

    default:
      return NextResponse.json({ error: '不支持的请求方法' }, { status: 405 });
  }
}

// 用户统计 API
async function handleUsersStatsApi() {
  const stats = {
    totalUsers: 100,
    activeUsers: 85,
    newUsersToday: 5,
  };
  return NextResponse.json({ stats });
}

// 权限管理 API
async function handlePermissionsApi(method: string) {
  if (method !== 'GET') {
    return NextResponse.json({ error: '只支持 GET 方法' }, { status: 405 });
  }

  const currentUser = await AuthService.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: '用户未登录' }, { status: 401 });
  }

  const permissions = await AuthService.getUserPermissions(currentUser.id);
  return NextResponse.json({ permissions });
}

// 仪表板统计 API
async function handleDashboardStatsApi() {
  // 这里可以集成实际的业务统计数据
  const mockStats = {
    totalUsers: 15,
    activeUsers: 12,
    pendingReviews: 8,
    totalRevenue: 32500,
    recentActivity: [
      { type: 'user_created', message: '新用户注册', time: '2 小时前' },
      { type: 'content_reviewed', message: '内容审核完成', time: '4 小时前' },
      { type: 'payment_received', message: '收到新订单', time: '1 天前' },
    ],
  };

  return NextResponse.json({ stats: mockStats });
}

// 仪表板导出 API
async function handleDashboardExportApi(method: string, request: Request) {
  if (method !== 'GET') {
    return NextResponse.json({ error: '只支持 GET 方法' }, { status: 405 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily_report';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 模拟导出数据
    const mockExportData = {
      type,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      data: [
        {
          date: '2024-01-15',
          users: 150,
          orders: 89,
          revenue: 12500,
        },
        {
          date: '2024-01-16',
          users: 165,
          orders: 95,
          revenue: 13800,
        },
      ],
    };

    return NextResponse.json({ success: true, data: mockExportData });
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json(
      { success: false, error: '导出数据失败' },
      { status: 500 }
    );
  }
}
