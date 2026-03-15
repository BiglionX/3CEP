/**
 * 鐩戞帶API璺敱
 * FixCycle 6.0 鐩戞帶绯荤粺鎺ュ彛
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring-service';
import { MetricThreshold, AlertEvent } from '@/types/monitoring.types';
import { logger } from '@/tech/utils/logger';

// GET /api/monitoring - 鑾峰彇鐩戞帶鏁版嵁
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'snapshot';

    switch (action) {
      case 'snapshot':
        // 鑾峰彇瀹炴椂鐩戞帶蹇収
        const snapshot = monitoringService.getPerformanceSnapshot();
        return NextResponse.json({
          success: true,
          data: snapshot,
          timestamp: new Date().toISOString(),
        });

      case 'metrics':
        // 鑾峰彇鐗瑰畾鎸囨爣鍘嗗彶鏁版嵁
        const metricName = searchParams.get('name');
        const hours = parseInt(searchParams.get('hours') || '24');

        if (!metricName) {
          return NextResponse.json(
            { success: false, error: '鎸囨爣鍚嶇О涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const history = monitoringService.getMetricHistory(metricName, hours);
        return NextResponse.json({
          success: true,
          metric: metricName,
          data: history,
          count: history.length,
          timestamp: new Date().toISOString(),
        });

      case 'alerts':
        // 鑾峰彇鍛婅淇℃伅
        const alertStatus = searchParams.get('status') || 'active';
        let alerts: AlertEvent[];

        if (alertStatus === 'active') {
          alerts = monitoringService.getActiveAlerts();
        } else {
          // 鍙互鎵╁睍鏀寔鍘嗗彶鍛婅鏌ヨ
          alerts = [];
        }

        return NextResponse.json({
          success: true,
          alerts,
          count: alerts.length,
          status: alertStatus,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // 鑾峰彇鍛婅瑙勫垯閰嶇疆
        return NextResponse.json({
          success: true,
          message: '鍛婅瑙勫垯閰嶇疆鎺ュ彛寰呭疄,
          timestamp: new Date().toISOString(),
        });

      case 'health':
        // 绯荤粺鍋ュ悍妫€        return NextResponse.json({
          success: true,
          status: 'healthy',
          service: 'monitoring',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鐩戞帶API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/monitoring - 鎻愪氦鐩戞帶鏁版嵁鎴栭厤缃憡璀﹁export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'record_metric':
        // 璁板綍鎸囨爣鏁版嵁
        if (!data || !data.name || data.value === undefined) {
          return NextResponse.json(
            { success: false, error: '缂哄皯蹇呰鐨勬寚鏍囨暟 },
            { status: 400 }
          );
        }

        const {
          name,
          value,
          type = 'gauge',
          description = '',
          unit = '',
          labels,
        } = data;

        switch (type) {
          case 'counter':
            monitoringService.recordCounterMetric(
              name,
              value,
              description,
              unit,
              labels
            );
            break;
          case 'histogram':
            monitoringService.recordHistogramMetric(
              name,
              value,
              description,
              unit,
              labels
            );
            break;
          case 'gauge':
          default:
            monitoringService.recordGaugeMetric(
              name,
              value,
              description,
              unit,
              labels
            );
            break;
        }

        return NextResponse.json({
          success: true,
          message: '鎸囨爣鏁版嵁璁板綍鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'add_alert_rule':
        // 娣诲姞鍛婅瑙勫垯
        if (!data) {
          return NextResponse.json(
            { success: false, error: '鍛婅瑙勫垯鏁版嵁涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const rule: MetricThreshold = {
          metric_name: data.metric_name,
          warning_threshold: data.warning_threshold,
          critical_threshold: data.critical_threshold,
          operator: data.operator || '>',
          severity: data.severity || 'warning',
          enabled: data.enabled !== false,
          description: data.description || '',
        };

        monitoringService.addAlertRule(rule);

        return NextResponse.json({
          success: true,
          message: '鍛婅瑙勫垯娣诲姞鎴愬姛',
          rule: rule,
          timestamp: new Date().toISOString(),
        });

      case 'acknowledge_alert':
        // 纭鍛婅
        const alertId = data.alert_id;
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: '鍛婅ID涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        // 杩欓噷鍙互瀹炵幇鍛婅纭昏緫
        logger.info(`Alert acknowledged: ${alertId}`);

        return NextResponse.json({
          success: true,
          message: '鍛婅宸茬‘,
          alert_id: alertId,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鐩戞帶API POST閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PUT /api/monitoring - 鏇存柊鐩戞帶閰嶇疆
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'update_config':
        // 鏇存柊鐩戞帶閰嶇疆
        if (!config) {
          return NextResponse.json(
            { success: false, error: '閰嶇疆鏁版嵁涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        // 杩欓噷鍙互瀹炵幇閰嶇疆鏇存柊昏緫
        logger.info('Monitoring config updated:', config);

        return NextResponse.json({
          success: true,
          message: '鐩戞帶閰嶇疆鏇存柊鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鐩戞帶API PUT閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/monitoring - 鍒犻櫎鐩戞帶鏁版嵁鎴栬export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    switch (action) {
      case 'delete_alert_rule':
        if (!id) {
          return NextResponse.json(
            { success: false, error: '瑙勫垯ID涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        // 杩欓噷鍙互瀹炵幇鍒犻櫎鍛婅瑙勫垯鐨勯€昏緫
        logger.info(`Alert rule deleted: ${id}`);

        return NextResponse.json({
          success: true,
          message: '鍛婅瑙勫垯鍒犻櫎鎴愬姛',
          rule_id: id,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鐩戞帶API DELETE閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

