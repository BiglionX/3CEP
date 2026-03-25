import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 Skill ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 尝试调用数据库函数获取统计
    let { data: stats, error } = await supabase.rpc('get_skill_usage_stats', {
      p_skill_id: skillId,
      p_days: days,
    });

    // 如果函数不存在，使用基础查询
    if (error && error.code === '42883') {
      console.warn('get_skill_usage_stats 函数不存在，使用基础查询');

      const { data: executions } = await supabase
        .from('skill_executions')
        .select('*')
        .eq('skill_id', skillId)
        .gte(
          'created_at',
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        );

      if (executions) {
        const totalExecutions = executions.length;
        const successCount = executions.filter(
          e => e.status === 'success'
        ).length;
        const errorCount = executions.filter(e => e.status === 'error').length;
        const timeoutCount = executions.filter(
          e => e.status === 'timeout'
        ).length;

        const executionTimes = executions
          .map(e => e.execution_time)
          .filter(t => t != null);
        const avgExecutionTime =
          executionTimes.length > 0
            ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
            : 0;

        stats = [
          {
            total_executions: totalExecutions,
            success_count: successCount,
            error_count: errorCount,
            timeout_count: timeoutCount,
            avg_execution_time: avgExecutionTime,
            min_execution_time:
              executionTimes.length > 0 ? Math.min(...executionTimes) : 0,
            max_execution_time:
              executionTimes.length > 0 ? Math.max(...executionTimes) : 0,
            success_rate:
              totalExecutions > 0
                ? ((successCount / totalExecutions) * 100).toFixed(2)
                : 0,
          },
        ];
      }
    }

    // 获取趋势数据
    let { data: trendData } = await supabase
      .rpc('get_skill_daily_trend', {
        p_skill_id: skillId,
        p_days: days,
      })
      .catch(() => null);

    // 如果趋势函数不存在，手动计算
    if (!trendData) {
      const { data: executions } = await supabase
        .from('skill_executions')
        .select('*')
        .eq('skill_id', skillId)
        .gte(
          'created_at',
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('created_at', { ascending: false });

      if (executions) {
        // 按日期分组
        const dailyMap = new Map<string, any[]>();
        executions.forEach((e: any) => {
          const date = new Date(e.created_at).toISOString().split('T')[0];
          if (!dailyMap.has(date)) {
            dailyMap.set(date, []);
          }
          dailyMap.get(date)!.push(e);
        });

        trendData = Array.from(dailyMap.entries())
          .map(([date, items]) => ({
            date,
            total_executions: items.length,
            success_count: items.filter(i => i.status === 'success').length,
            error_count: items.filter(i => i.status === 'error').length,
            avg_execution_time:
              items
                .map(i => i.execution_time)
                .filter(t => t != null)
                .reduce((a, b) => a + b, 0) /
                items.filter(i => i.execution_time != null).length || 0,
          }))
          .sort((a, b) => b.date.localeCompare(a.date));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: stats?.[0] || {
          total_executions: 0,
          success_count: 0,
          error_count: 0,
          timeout_count: 0,
          avg_execution_time: 0,
          min_execution_time: 0,
          max_execution_time: 0,
          success_rate: 0,
        },
        trend: trendData || [],
      },
    });
  } catch (error: any) {
    console.error('获取使用统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
