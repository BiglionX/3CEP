/**
 * 智能体历史监控数据查询 API
 *
 * GET /api/analytics/agents/history
 * Query params:
 *  - agentId: 智能体 ID（可选，不传则查询所有）
 *  - startDate: 开始日期（ISO 格式）
 *  - endDate: 结束日期（ISO 格式）
 *  - granularity: 粒度（hourly/daily/weekly）
 *
 * POST /api/analytics/agents/history/export
 * Body: { agentId, startDate, endDate }
 * 导出 CSV 格式的历史数据
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：查询历史监控数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const granularity = searchParams.get('granularity') || 'daily';

    // 验证必填参数
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '缺少必填参数：startDate, endDate',
          },
        },
        { status: 400 }
      );
    }

    // 构建查询
    let query = supabase
      .from('agent_status_history')
      .select('*')
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: true });

    // 如果指定了 agentId，添加过滤条件
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查询历史数据失败:', error);
      throw error;
    }

    // 按粒度聚合数据
    const aggregatedData = aggregateByGranularity(data || [], granularity);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      meta: {
        total: data?.length || 0,
        agentId,
        startDate,
        endDate,
        granularity,
      },
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '查询失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：导出历史数据为 CSV
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '缺少必填参数：startDate, endDate',
          },
        },
        { status: 400 }
      );
    }

    // 查询数据
    let query = supabase
      .from('agent_status_history')
      .select('*')
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: true });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 转换为 CSV 格式
    const csv = convertToCSV(data || []);

    // 返回 CSV 文件
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="agent_history_${startDate}_${endDate}.csv"`,
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
 * 按粒度聚合数据
 */
function aggregateByGranularity(
  data: any[],
  granularity: 'hourly' | 'daily' | 'weekly'
) {
  const grouped: Record<string, any[]> = {};

  data.forEach(record => {
    const date = new Date(record.recorded_at);
    let key: string;

    switch (granularity) {
      case 'hourly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}`;
        break;
      case 'daily':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'weekly':
        const weekNumber = getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record);
  });

  // 计算每个时间段的统计值
  return Object.entries(grouped).map(([timestamp, records]) => {
    const metrics = records.map(r => r.metrics || {});

    return {
      timestamp,
      count: records.length,
      avg_response_time: average(metrics.map(m => m.response_time || 0)),
      max_response_time: Math.max(...metrics.map(m => m.response_time || 0)),
      min_response_time: Math.min(...metrics.map(m => m.response_time || 0)),
      avg_error_rate: average(metrics.map(m => m.error_rate || 0)),
      avg_success_rate: average(metrics.map(m => m.success_rate || 0)),
      total_usage_count: sum(metrics.map(m => m.usage_count || 0)),
      avg_active_users: average(metrics.map(m => m.active_users || 0)),
    };
  });
}

/**
 * 计算周数
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * 计算平均值
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * 计算总和
 */
function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

/**
 * 转换为 CSV 格式
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    'Agent ID',
    'Status',
    'Response Time',
    'Error Rate',
    'Success Rate',
    'Usage Count',
    'Active Users',
    'Recorded At',
  ];

  const rows = data.map(record => [
    record.id,
    record.agent_id,
    record.status,
    record.metrics?.response_time || '',
    record.metrics?.error_rate || '',
    record.metrics?.success_rate || '',
    record.metrics?.usage_count || '',
    record.metrics?.active_users || '',
    record.recorded_at,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
