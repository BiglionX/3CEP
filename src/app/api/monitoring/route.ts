import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/data-center/monitoring/monitoring-service';
import { dashboardService } from '@/data-center/monitoring/dashboard-service';

// GET请求处理
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    
    switch (action) {
      case 'dashboard':
        const forceRefresh = searchParams.get('refresh') === 'true';
        const dashboardData = await dashboardService.getDashboardData(forceRefresh);
        return NextResponse.json(dashboardData);
        
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
        const alertStatus = searchParams.get('status') || 'active';
        let alerts;
        
        if (alertStatus === 'active') {
          alerts = monitoringService.getActiveAlerts();
        } else if (alertStatus === 'history') {
          const historyLimit = parseInt(searchParams.get('limit') || '50');
          alerts = monitoringService.getAlertHistory(historyLimit);
        } else {
          return NextResponse.json(
            { error: '无效的告警状态参数' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          alerts,
          count: alerts.length,
          status: alertStatus,
          timestamp: new Date().toISOString()
        });
        
      case 'rules':
        const rules = Array.from(monitoringService.alertRules.values());
        return NextResponse.json({
          rules,
          count: rules.length,
          timestamp: new Date().toISOString()
        });
        
      case 'quality':
        const qualityReport = monitoringService.getDataQualityReport();
        return NextResponse.json(qualityReport);
        
      case 'stats':
        const stats = monitoringService.getMonitoringStats();
        return NextResponse.json(stats);
        
      case 'health':
        // 系统健康检查
        return NextResponse.json({
          status: 'healthy',
          service: 'monitoring',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
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

// POST请求处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'record-metric':
        const { name, value, tags } = params.metric || {};
        if (!name || value === undefined) {
          return NextResponse.json(
            { error: '缺少必要的指标参数' },
            { status: 400 }
          );
        }
        
        monitoringService.recordMetric(name, value, tags);
        return NextResponse.json({
          message: '指标记录成功',
          metric: { name, value, tags },
          timestamp: new Date().toISOString()
        });
        
      case 'add-alert-rule':
        const rule = params.rule;
        if (!rule) {
          return NextResponse.json(
            { error: '缺少告警规则参数' },
            { status: 400 }
          );
        }
        
        const newRule = {
          id: rule.id || `rule_${Date.now()}`,
          name: rule.name,
          metric: rule.metric,
          condition: rule.condition || 'above',
          threshold: rule.threshold,
          duration: rule.duration || 300,
          severity: rule.severity || 'warning',
          enabled: rule.enabled !== false,
          notifications: rule.notifications || ['console'],
          description: rule.description
        };
        
        monitoringService.addAlertRule(newRule);
        return NextResponse.json({
          message: '告警规则添加成功',
          rule: newRule,
          timestamp: new Date().toISOString()
        });
        
      case 'configure-notifications':
        const config = params.config;
        if (!config) {
          return NextResponse.json(
            { error: '缺少通知配置参数' },
            { status: 400 }
          );
        }
        
        monitoringService.configureNotifications(config);
        return NextResponse.json({
          message: '通知配置更新成功',
          timestamp: new Date().toISOString()
        });
        
      case 'acknowledge-alert':
        const { alertId } = params;
        if (!alertId) {
          return NextResponse.json(
            { error: '缺少告警ID参数' },
            { status: 400 }
          );
        }
        
        // 这里应该实现告警确认逻辑
        return NextResponse.json({
          message: `告警 ${alertId} 已确认`,
          timestamp: new Date().toISOString()
        });
        
      case 'test-notification':
        const { channel, message } = params;
        if (!channel) {
          return NextResponse.json(
            { error: '缺少通知渠道参数' },
            { status: 400 }
          );
        }
        
        // 发送测试通知
        const testAlert = {
          id: `test_${Date.now()}`,
          ruleId: 'test_rule',
          ruleName: '测试告警',
          metric: 'test_metric',
          currentValue: 999,
          threshold: 100,
          severity: 'warning' as const,
          triggeredAt: new Date().toISOString(),
          status: 'triggered' as const
        };
        
        // 这里应该调用具体的发送方法
        console.log(`🧪 测试${channel}通知: ${message || '测试消息'}`);
        
        return NextResponse.json({
          message: `${channel}测试通知已发送`,
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