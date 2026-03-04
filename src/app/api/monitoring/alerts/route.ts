// 鐩戞帶鍛婅API璺敱
import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';
import { logger } from '@/utils/logger';

// GET /api/monitoring/metrics - 鑾峰彇鐩戞帶鎸囨爣
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');
    const timeframe = parseInt(searchParams.get('timeframe') || '300000');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (metricName) {
      // 鑾峰彇鐗瑰畾鎸囨爣鐨勭粺璁℃暟?      const stats = performanceMonitor.getMetricStats(metricName, timeframe);
      return NextResponse.json({
        success: true,
        metric: metricName,
        stats,
        timeframe,
      });
    } else {
      // 鑾峰彇鎵€鏈夋寚鏍囩殑鏈€鏂版暟?      const snapshot = performanceMonitor.getPerformanceSnapshot();
      return NextResponse.json({
        success: true,
        data: snapshot,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Error fetching monitoring metrics', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST /api/monitoring/alerts - 绠＄悊鍛婅瑙勫垯
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, rule } = body;

    switch (action) {
      case 'add_rule':
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Rule data required' },
            { status: 400 }
          );
        }

        performanceMonitor.addAlertRule(rule);
        return NextResponse.json({
          success: true,
          message: 'Alert rule added successfully',
        });

      case 'test_rule':
        // 娴嬭瘯鍛婅瑙勫垯
        return NextResponse.json({
          success: true,
          message: 'Rule test functionality not implemented',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error managing alert rules', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage alert rules' },
      { status: 500 }
    );
  }
}
