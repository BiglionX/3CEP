import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// import { Database } from '@/lib/database.types'
import { AuthService } from '@/lib/auth-service';
import { cache } from '@/lib/cache-manager';

// 获取用户列表
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 验证管理员权限
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    const userRole = await AuthService.getUserRole(currentUser.id);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '只有超级管理员可以访问用户管理' },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 生成缓存键
    const cacheKey = `admin_users:${search}:${role}:${status}:${page}:${limit}`;

    // 尝试从缓存获取
    const cachedResult = await cache.get<{ data: any[]; meta: any }>(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        meta: cachedResult.meta,
        fromCache: true,
      });
    }

    // 构建查询条件
    let query = supabase
      .from('user_management_view')
      .select('*', { count: 'exact' });

    // 添加搜索条件
    if (search) {
      query = query.or(`email.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    // 添加角色筛选
    if (role) {
      query = query.eq('role', role);
    }

    // 添加状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('获取用户列表失败:', error);
      return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
    }

    // 缓存结果（仅缓存非搜索结果，避免缓存污染）
    const shouldCache = !search && !role && !status;
    const result = {
      success: true,
      data: data || [],
      meta: {
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNextPage: page < Math.ceil((count || 0) / limit),
          hasPreviousPage: page > 1,
        },
      },
    };

    if (shouldCache) {
      await cache.set(cacheKey, result, { ttl: 300 }); // 缓存5分钟
    }

    return NextResponse.json({
      ...result,
      fromCache: false,
    });
  } catch (error) {
    console.error('用户管理API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 验证管理员权限
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    const userRole = await AuthService.getUserRole(currentUser.id);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '只有超级管理员可以修改用户信息' },
        { status: 403 }
      );
    }

    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    // 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 处理角色更新
    if (updates.role) {
      updateData.role = updates.role;
    }

    // 处理子角色更新
    if (updates.sub_roles !== undefined) {
      updateData.sub_roles = updates.sub_roles;
    }

    // 处理激活状态更新
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }

    // 处理封禁状态更新
    if (updates.status) {
      updateData.status = updates.status;

      if (updates.status === 'banned') {
        updateData.banned_at = new Date().toISOString();
        updateData.banned_reason = updates.banned_reason || '管理员封禁';
      } else if (updates.status === 'active') {
        updateData.unbanned_at = new Date().toISOString();
        updateData.banned_reason = null;
        updateData.banned_at = null;
      }
    }

    const { data, error } = await supabase
      .from('user_profiles_ext')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新用户信息失败:', error);
      return NextResponse.json(
        { error: '更新用户信息失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      data,
    });
  } catch (error) {
    console.error('更新用户API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// 批量操作用户
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 验证管理员权限
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    const userRole = await AuthService.getUserRole(currentUser.id);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '只有超级管理员可以执行批量操作' },
        { status: 403 }
      );
    }

    const { action, userIds, reason } = await request.json();

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'ban':
        updateData = {
          status: 'banned',
          banned_at: new Date().toISOString(),
          banned_reason: reason || '批量封禁操作',
          updated_at: new Date().toISOString(),
        };
        break;

      case 'unban':
        updateData = {
          status: 'active',
          unbanned_at: new Date().toISOString(),
          banned_reason: null,
          banned_at: null,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'activate':
        updateData = {
          is_active: true,
          updated_at: new Date().toISOString(),
        };
        break;

      case 'deactivate':
        updateData = {
          is_active: false,
          updated_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: '不支持的操作类型' },
          { status: 400 }
        );
    }

    // 批量更新用户状态
    const { data, error } = await supabase
      .from('user_profiles_ext')
      .update(updateData)
      .in('id', userIds);

    if (error) {
      console.error('批量操作失败:', error);
      return NextResponse.json(
        { error: '批量操作失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `批量${
        action === 'ban'
          ? '封禁'
          : action === 'unban'
          ? '解封'
          : action === 'activate'
          ? '激活'
          : '停用'
      }操作成功`,
      affected: userIds.length,
    });
  } catch (error) {
    console.error('批量操作API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
