/**
 * 审计日志查询 API
 *
 * GET /api/admin/audit-logs - 查询审计日志
 * Query params:
 *  - startDate: 开始日期
 *  - endDate: 结束日期
 *  - actionType: 操作类型
 *  - userId: 用户 ID
 *  - resourceType: 资源类型
 *  - page: 页码
 *  - limit: 每页数量
 *
 * POST /api/admin/audit-logs/export - 导出 CSV
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：查询审计日志
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 获取筛选参数
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const actionType = searchParams.get('actionType');
    const userId = searchParams.get('userId');
    const resourceType = searchParams.get('resourceType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 构建查询
    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    // 应用筛选条件
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else if (startDate) {
      query = query.gte('created_at', startDate);
    } else if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    // 分页和排序
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('查询审计日志失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: error instanceof Error ? error.message : '查询失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：导出 CSV
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, actionType, userId, resourceType } = body;

    // 构建查询
    let query = supabase.from('audit_logs').select('*');

    // 应用筛选条件
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    // 转换为 CSV
    const csv = convertToCSV(data || []);

    // 返回 CSV 文件
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('导出 CSV 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: error instanceof Error ? error.message : '导出失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 转换为 CSV 格式
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    '用户 ID',
    '操作类型',
    '资源类型',
    '资源 ID',
    '变更详情',
    'IP 地址',
    '用户代理',
    '创建时间',
  ];

  const rows = data.map(log => [
    log.id,
    log.user_id || '',
    log.action_type || '',
    log.resource_type || '',
    log.resource_id || '',
    JSON.stringify(log.changes || {}).replace(/"/g, '""'),
    log.ip_address || '',
    log.user_agent || '',
    log.created_at,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
