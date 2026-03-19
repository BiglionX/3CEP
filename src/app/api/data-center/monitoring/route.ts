import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/modules/data-center/monitoring/monitoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard':
        // 鑾峰彇鐩戞帶〃鏉挎暟        const activeAlerts = monitoringService.getActiveAlerts();
        const dataQuality = monitoringService.getDataQualityReport();

        return NextResponse.json({
          systemHealth: {
            status: activeAlerts.length === 0 ? 'healthy' : 'degraded',
            activeAlerts: activeAlerts.length,
            criticalAlerts: activeAlerts.filter(a => a.severity === 'critical')
              .length,
          },
          dataQuality: {
            overallScore: dataQuality.overallScore,
            issueCount: dataQuality.issues.length,
          },
          recentMetrics: monitoringService.getMetrics(undefined, 20),
          alerts: activeAlerts,
          timestamp: new Date().toISOString(),
        });

      case 'metrics':
        const metricName = searchParams.get('name');
        const limit = parseInt(searchParams.get('limit') || '100');
        const metrics = monitoringService.getMetrics(
          metricName || undefined,
          limit
        );

        return NextResponse.json({
          metrics,
          count: metrics.length,
          timestamp: new Date().toISOString(),
        });

      case 'alerts':
        const alerts = monitoringService.getActiveAlerts();
        return NextResponse.json({
          alerts,
          count: alerts.length,
          timestamp: new Date().toISOString(),
        });

      case 'data-quality':
        const qualityReport = monitoringService.getDataQualityReport();
        return NextResponse.json({
          report: qualityReport,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // 杩斿洖鍛婅瑙勫垯鍒楄〃
        return NextResponse.json({
          rules: Array.from(monitoringService.alertRules.values()),
          count: monitoringService.alertRules.size,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鐩戞帶API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, metric, alert, dataQuality } = body;

    switch (action) {
      case 'record-metric':
        if (!metric || !metric.name || metric.value === undefined) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勬寚鏍囧弬 },
            { status: 400 }
          );
        }

        monitoringService.recordMetric(metric.name, metric.value, metric.tags);

        return NextResponse.json({
          message: '鎸囨爣璁板綍鎴愬姛',
          metric,
          timestamp: new Date().toISOString(),
        });

      case 'add-alert-rule':
        if (!alert) {
          return NextResponse.json(
            { error: '缂哄皯鍛婅瑙勫垯鍙傛暟' },
            { status: 400 }
          );
        }

        monitoringService.addAlertRule({
          id: alert.id || `rule_${Date.now()}`,
          name: alert.name,
          metric: alert.metric,
          condition: alert.condition,
          threshold: alert.threshold,
          duration: alert.duration || 300,
          severity: alert.severity || 'warning',
          enabled: alert.enabled !== false,
          notifications: alert.notifications || ['console'],
        });

        return NextResponse.json({
          message: '鍛婅瑙勫垯娣诲姞鎴愬姛',
          ruleId: alert.id,
          timestamp: new Date().toISOString(),
        });

      case 'record-data-quality':
        if (!dataQuality) {
          return NextResponse.json(
            { error: '缂哄皯鏁版嵁璐ㄩ噺鍙傛暟' },
            { status: 400 }
          );
        }

        monitoringService.recordDataQuality({
          tableName: dataQuality.tableName,
          metricType: dataQuality.metricType,
          score: dataQuality.score,
          sampleSize: dataQuality.sampleSize,
          issues: dataQuality.issues || [],
          lastChecked: new Date().toISOString(),
        });

        return NextResponse.json({
          message: '鏁版嵁璐ㄩ噺璁板綍鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'test-alert':
        // 娴嬭瘯鍛婅瑙﹀彂
        const testMetricName = 'test_metric';
        const testValue = 9999; // 纭繚瑙﹀彂鍛婅

        monitoringService.recordMetric(testMetricName, testValue);

        return NextResponse.json({
          message: '娴嬭瘯鍛婅宸茶Е,
          testMetric: { name: testMetricName, value: testValue },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鐩戞帶API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

