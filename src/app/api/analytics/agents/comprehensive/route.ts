/**
 * 智能体综合分析 API
 *
 * GET /api/analytics/agents/comprehensive
 * Query params:
 *  - range: 时间范围 (7d|30d|90d|1y)
 */

import { AgentAnalyticsService } from '@/services/analytics/agent-analytics.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') as any) || '30d';

    // 验证时间范围
    const validRanges = ['7d', '30d', '90d', '1y'];
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RANGE',
            message: `无效的时间范围，有效值：${validRanges.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // 获取综合指标
    const metrics = await AgentAnalyticsService.getComprehensiveMetrics(range);

    return NextResponse.json({
      success: true,
      data: {
        range,
        ...metrics,
      },
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYTICS_FAILED',
          message: error instanceof Error ? error.message : '获取分析数据失败',
        },
      },
      { status: 500 }
    );
  }
}
