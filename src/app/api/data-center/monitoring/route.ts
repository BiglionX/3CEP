import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/data-center/monitoring/monitoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard':
        // 获取监控仪表板数据
        const activeAlerts = monitoringService.getActiveAlerts();
        const dataQuality = monitoringService.getDataQualityReport();
        
        return NextResponse.json({
          systemHealth: {
            status: activeAlerts.length === 0 ? 'healthy' : 'degraded',
            activeAlerts: activeAlerts.length,
            criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length
          },
          dataQuality: {
            overallScore: dataQuality.overallScore,
            issueCount: dataQuality.issues.length
          },
          recentMetrics: monitoringService.getMetrics(undefined, 20),
          alerts: activeAlerts,
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        const metricName = searchParams.get('name');
        const limit = parseInt(searchParams.get('limit') || '100');
        const metrics = monitoringService.getMetrics(metricName || undefined, limit);
        
        return NextResponse.json({
          metrics,
          count: metrics.length,
          timestamp: new Date().toISOString()
        });

      case 'alerts':
        const alerts = monitoringService.getActiveAlerts();
        return NextResponse.json({
          alerts,
          count: alerts.length,
          timestamp: new Date().toISOString()
        });

      case 'data-quality':
        const qualityReport = monitoringService.getDataQualityReport();
        return NextResponse.json({
          report: qualityReport,
          timestamp: new Date().toISOString()
        });

      case 'rules':
        // 返回告警规则列表
        return NextResponse.json({
          rules: Array.from(monitoringService.alertRules.values()),
          count: monitoringService.alertRules.size,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('监控API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
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
            { error: '缺少必要的指标参数' },
            { status: 400 }
          );
        }

        monitoringService.recordMetric(
          metric.name,
          metric.value,
          metric.tags
        );

        return NextResponse.json({
          message: '指标记录成功',
          metric,
          timestamp: new Date().toISOString()
        });

      case 'add-alert-rule':
        if (!alert) {
          return NextResponse.json(
            { error: '缺少告警规则参数' },
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
          notifications: alert.notifications || ['console']
        });

        return NextResponse.json({
          message: '告警规则添加成功',
          ruleId: alert.id,
          timestamp: new Date().toISOString()
        });

      case 'record-data-quality':
        if (!dataQuality) {
          return NextResponse.json(
            { error: '缺少数据质量参数' },
            { status: 400 }
          );
        }

        monitoringService.recordDataQuality({
          tableName: dataQuality.tableName,
          metricType: dataQuality.metricType,
          score: dataQuality.score,
          sampleSize: dataQuality.sampleSize,
          issues: dataQuality.issues || [],
          lastChecked: new Date().toISOString()
        });

        return NextResponse.json({
          message: '数据质量记录成功',
          timestamp: new Date().toISOString()
        });

      case 'test-alert':
        // 测试告警触发
        const testMetricName = 'test_metric';
        const testValue = 9999; // 确保触发告警
        
        monitoringService.recordMetric(testMetricName, testValue);
        
        return NextResponse.json({
          message: '测试告警已触发',
          testMetric: { name: testMetricName, value: testValue },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('监控API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}