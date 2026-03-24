/**
 * 智能体最近 7 天统计查询 API（使用物化视图，快速查询）
 *
 * GET /api/analytics/agents/stats/recent
 * Query params:
 *  - agentId: 智能体 ID（可选）
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
    const agentId = searchParams.get('agentId');

    // 构建查询
    let query = supabase
      .from('agent_status_last_7days')
      .select('*')
      .order('record_date', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查询统计数据失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        total: data?.length || 0,
        agentId,
        cached: true, // 标记这是缓存数据（物化视图）
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
