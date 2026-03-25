import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/audit-logs
 * 获取审计日志列表
 */
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 构建查询
    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' });

    // 应用筛选条件
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 分页和排序
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: logs,
      error,
      count,
    } = await query.order('created_at', { ascending: false }).range(from, to);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取审计日志失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit-logs
 * 记录审计日志 (内部使用)
 */
export async function POST(request: NextRequest) {
  try {
    // 验证权限 (仅允许内部调用)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      userId,
      action,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    } = body;

    // 参数验证
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 插入审计日志
    const { error } = await supabase.from('admin_audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '审计日志已记录',
    });
  } catch (error) {
    console.error('记录审计日志失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
