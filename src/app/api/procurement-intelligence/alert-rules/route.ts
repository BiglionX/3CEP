// 鍛婅瑙勫垯绠＄悊API绔偣
// 鎻愪緵鍛婅瑙勫垯鐨勫鍒犳敼鏌ュ拰绠＄悊鍔熻兘

import { NextResponse } from 'next/server';
import { alertRulesManager } from '@/modules/procurement-intelligence/services/alert-rules-manager.service';
import { notificationChannelsService } from '@/modules/procurement-intelligence/services/notification-channels.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'list':
        // 鑾峰彇鍛婅瑙勫垯鍒楄〃
        const filters = {
          enabled:
            searchParams.get('enabled') === 'true'
               true
              : searchParams.get('enabled') === 'false'
                 false
                : undefined,
          severity: searchParams.get('severity') || undefined,
          metric_name: searchParams.get('metric_name') || undefined,
        };

        const rules = await alertRulesManager.getAllAlertRules(filters);
        return NextResponse.json({
          success: true,
          data: rules,
          count: rules.length,
          timestamp: new Date().toISOString(),
        });

      case 'get':
        // 鑾峰彇鍗曚釜鍛婅瑙勫垯
        const ruleId = searchParams.get('id');
        if (!ruleId) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯鍛婅瑙勫垯ID',
            },
            { status: 400 }
          );
        }

        const rule = await alertRulesManager.getAlertRuleById(ruleId);
        if (!rule) {
          return NextResponse.json(
            {
              success: false,
              error: '鍛婅瑙勫垯涓嶅,
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: rule,
          timestamp: new Date().toISOString(),
        });

      case 'statistics':
        // 鑾峰彇鍛婅瑙勫垯缁熻
        const statistics = await alertRulesManager.getAlertRulesStatistics();
        return NextResponse.json({
          success: true,
          data: statistics,
          timestamp: new Date().toISOString(),
        });

      case 'test':
        // 娴嬭瘯鍛婅瑙勫垯
        const testRuleId = searchParams.get('rule_id');
        const testValue = parseFloat(searchParams.get('value') || '0');

        if (!testRuleId) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯鍛婅瑙勫垯ID',
            },
            { status: 400 }
          );
        }

        const testResult = await alertRulesManager.testAlertRule(
          testRuleId,
          testValue
        );
        return NextResponse.json({
          success: true,
          data: testResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '涓嶆敮鎸佺殑鎿嶄綔',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('鍛婅瑙勫垯API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create':
        // 鍒涘缓鍛婅瑙勫垯
        if (
          !params.name ||
          !params.metric_name ||
          !params.condition ||
          params.threshold === undefined ||
          !params.severity
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                '缂哄皯蹇呴渶鍙傛暟: name, metric_name, condition, threshold, severity',
            },
            { status: 400 }
          );
        }

        const newRule = await alertRulesManager.createAlertRule({
          ...params,
          created_by: params.created_by || 'system',
        });

        return NextResponse.json({
          success: true,
          data: newRule,
          message: '鍛婅瑙勫垯鍒涘缓鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'update':
        // 鏇存柊鍛婅瑙勫垯
        if (!params.id) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯鍛婅瑙勫垯ID',
            },
            { status: 400 }
          );
        }

        const updatedRule = await alertRulesManager.updateAlertRule(params);
        return NextResponse.json({
          success: true,
          data: updatedRule,
          message: '鍛婅瑙勫垯鏇存柊鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'toggle':
        // 鍚敤/绂佺敤鍛婅瑙勫垯
        if (!params.id || params.enabled === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯蹇呴渶鍙傛暟: id, enabled',
            },
            { status: 400 }
          );
        }

        const toggledRule = await alertRulesManager.toggleAlertRule(
          params.id,
          params.enabled
        );
        return NextResponse.json({
          success: true,
          data: toggledRule,
          message: `鍛婅瑙勫垯{params.enabled ? '鍚敤' : '绂佺敤'}`,
          timestamp: new Date().toISOString(),
        });

      case 'delete':
        // 鍒犻櫎鍛婅瑙勫垯
        if (!params.id) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯鍛婅瑙勫垯ID',
            },
            { status: 400 }
          );
        }

        await alertRulesManager.deleteAlertRule(params.id);
        return NextResponse.json({
          success: true,
          message: '鍛婅瑙勫垯鍒犻櫎鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'create_escalation':
        // 鍒涘缓鍗囩骇绛栫暐
        if (!params.name || !params.levels) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯蹇呴渶鍙傛暟: name, levels',
            },
            { status: 400 }
          );
        }

        const escalationPolicy =
          await alertRulesManager.createEscalationPolicy(params);
        return NextResponse.json({
          success: true,
          data: escalationPolicy,
          message: '鍗囩骇绛栫暐鍒涘缓鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'create_suppression':
        // 鍒涘缓鎶戝埗瑙勫垯
        if (!params.name || !params.condition) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯蹇呴渶鍙傛暟: name, condition',
            },
            { status: 400 }
          );
        }

        const suppressionRule =
          await alertRulesManager.createSuppressionRule(params);
        return NextResponse.json({
          success: true,
          data: suppressionRule,
          message: '鎶戝埗瑙勫垯鍒涘缓鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'create_channel':
        // 鍒涘缓氱煡娓犻亾
        if (!params.name || !params.type || !params.config) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯蹇呴渶鍙傛暟: name, type, config',
            },
            { status: 400 }
          );
        }

        const channel = await notificationChannelsService.createChannel(
          params.name,
          params.type,
          params.config
        );

        return NextResponse.json({
          success: true,
          data: channel,
          message: '氱煡娓犻亾鍒涘缓鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '涓嶆敮鎸佺殑鎿嶄綔',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('鍛婅瑙勫垯API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鎵€鏈夊崌绾х瓥export async function GET_ESCALATION_POLICIES() {
  try {
    const policies = await alertRulesManager.getAllEscalationPolicies();
    return NextResponse.json({
      success: true,
      data: policies,
      count: policies.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('鑾峰彇鍗囩骇绛栫暐澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鎵€鏈夐€氱煡娓犻亾
export async function GET_NOTIFICATION_CHANNELS(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get('enabled_only') === 'true';

    const channels =
      await notificationChannelsService.getAllChannels(enabledOnly);
    return NextResponse.json({
      success: true,
      data: channels,
      count: channels.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('鑾峰彇氱煡娓犻亾澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

