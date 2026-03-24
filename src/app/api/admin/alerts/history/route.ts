/**
 * 告警历史查询 API
 *
 * GET /api/admin/alerts/history - 获取告警历史
 * Query params:
 *  - status: 告警状态（active/acknowledged/resolved）
 *  - severity: 严重程度（info/warning/critical/fatal）
 *  - ruleId: 规则 ID
 *  - startDate: 开始日期
 *  - endDate: 结束日期
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const ruleId = searchParams.get('ruleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase.from('alert_history').select('*', { count: 'exact' });

    // 添加过滤条件
    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (ruleId) {
      query = query.eq('rule_id', ruleId);
    }

    if (startDate) {
      query = query.gte('triggered_at', startDate);
    }

    if (endDate) {
      query = query.lte('triggered_at', endDate);
    }

    // 分页和排序
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('triggered_at', { ascending: false });

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
    console.error('获取告警历史失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}
