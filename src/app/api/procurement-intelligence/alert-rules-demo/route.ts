// 鍛婅瑙勫垯瀹屽杽鍔熻兘婕旂ずAPI
// 灞曠ずD002浠诲姟鐨勬牳蹇冨姛?
import { NextResponse } from 'next/server';
import { alertRulesManager } from '@/modules/procurement-intelligence/services/alert-rules-manager.service';
import { notificationChannelsService } from '@/modules/procurement-intelligence/services/notification-channels.service';

export async function GET() {
  try {
    // 婕旂ず鏁版嵁鍒濆?    const demoData = await initializeDemoData();

    // 鍔熻兘婕旂ず
    const demoResults = await runDemonstrations();

    return NextResponse.json({
      success: true,
      message: '鍛婅瑙勫垯瀹屽杽鍔熻兘婕旂ず',
      demo_data: demoData,
      demonstrations: demoResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('婕旂ずAPI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function initializeDemoData() {
  try {
    // 鍒涘缓婕旂ず鐢ㄧ殑鍛婅瑙勫垯
    const demoRules = [
      {
        name: 'CPU浣跨敤鐜囪繃楂樺憡?,
        description: '鐩戞帶绯荤粺CPU浣跨敤鐜囷紝褰撹秴?0%鏃惰Е鍙戝憡?,
        metric_name: 'cpu_usage_percent',
        condition: 'above' as const,
        threshold: 80,
        duration: 300, // 5鍒嗛挓
        severity: 'warning' as const,
        notification_channels: ['email', 'slack'],
        recipients: ['admin@company.com', 'ops-team'],
        tags: ['system', 'performance'],
        created_by: 'demo',
      },
      {
        name: '鍐呭瓨涓嶈冻鍛婅',
        description: '鐩戞帶绯荤粺鍐呭瓨浣跨敤鎯呭喌锛屽綋鍙敤鍐呭瓨浣庝簬1GB鏃惰Е鍙戝憡?,
        metric_name: 'memory_available_bytes',
        condition: 'below' as const,
        threshold: 1073741824, // 1GB
        duration: 180, // 3鍒嗛挓
        severity: 'error' as const,
        notification_channels: ['email', 'sms', 'pagerduty'],
        recipients: ['admin@company.com', '+8613800138000'],
        tags: ['system', 'memory'],
        created_by: 'demo',
      },
      {
        name: '鏁版嵁搴撹繛鎺ユ暟寮傚父',
        description: '鐩戞帶鏁版嵁搴撹繛鎺ユ暟锛屽綋杩炴帴鏁拌秴杩囬槇鍊兼椂瑙﹀彂鍛婅',
        metric_name: 'database_connections',
        condition: 'above' as const,
        threshold: 100,
        duration: 60, // 1鍒嗛挓
        severity: 'critical' as const,
        notification_channels: ['email', 'webhook'],
        recipients: ['dba@company.com'],
        tags: ['database', 'performance'],
        created_by: 'demo',
      },
    ];

    const createdRules = [];
    for (const ruleData of demoRules) {
      try {
        const rule = await alertRulesManager.createAlertRule(ruleData);
        createdRules.push(rule);
      } catch (error) {
        console.warn('鍒涘缓婕旂ず瑙勫垯澶辫触:', error);
      }
    }

    // 鍒涘缓婕旂ず鐢ㄧ殑閫氱煡娓犻亾
    const demoChannels = [
      {
        name: '閭欢閫氱煡娓犻亾',
        type: 'email' as const,
        config: {
          smtp_host: 'smtp.company.com',
          smtp_port: 587,
          smtp_user: 'alerts@company.com',
          from_email: 'alerts@company.com',
        },
      },
      {
        name: 'Slack閫氱煡娓犻亾',
        type: 'slack' as const,
        config: {
          webhook_url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
          channel: '#alerts',
        },
      },
      {
        name: '鐭俊閫氱煡娓犻亾',
        type: 'sms' as const,
        config: {
          provider: 'aliyun' as const,
          access_key: 'your-access-key',
          secret_key: 'your-secret-key',
          sign_name: '鍏徃鍚嶇О',
          template_code: 'SMS_123456',
        },
      },
    ];

    const createdChannels = [];
    for (const channelData of demoChannels) {
      try {
        const channel = await notificationChannelsService.createChannel(
          channelData.name,
          channelData.type,
          channelData.config
        );
        createdChannels.push(channel);
      } catch (error) {
        console.warn('鍒涘缓婕旂ず娓犻亾澶辫触:', error);
      }
    }

    return {
      rules_created: createdRules.length,
      channels_created: createdChannels.length,
      sample_rules: createdRules.slice(0, 2),
      sample_channels: createdChannels.slice(0, 2),
    };
  } catch (error) {
    console.error('鍒濆鍖栨紨绀烘暟鎹け?', error);
    return { error: (error as Error).message };
  }
}

async function runDemonstrations() {
  try {
    const results: Record<string, any> = {};

    // 1. 鍛婅瑙勫垯娴嬭瘯婕旂ず
    results.rule_testing = await demonstrateRuleTesting();

    // 2. 閫氱煡娓犻亾婕旂ず
    results.notification_demo = await demonstrateNotifications();

    // 3. 缁熻淇℃伅婕旂ず
    results.statistics = await demonstrateStatistics();

    // 4. 瑙勫垯绠＄悊婕旂ず
    results.rule_management = await demonstrateRuleManagement();

    return results;
  } catch (error) {
    console.error('杩愯婕旂ず澶辫触:', error);
    return { error: (error as Error).message };
  }
}

async function demonstrateRuleTesting() {
  try {
    // 鑾峰彇涓€涓鍒欒繘琛屾祴?    const rules = await alertRulesManager.getAllAlertRules();
    if (rules.length === 0) return { message: '娌℃湁鍙敤鐨勮鍒欒繘琛屾祴? };

    const rule = rules[0];
    const testValues = [75, 85, 95]; // 涓嶅悓鐨勬祴璇?
    const testResults = [];
    for (const value of testValues) {
      const result = await alertRulesManager.testAlertRule(rule.id, value);
      testResults.push({
        test_value: value,
        ...result,
      });
    }

    return {
      rule_name: rule.name,
      threshold: rule.threshold,
      test_results: testResults,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

async function demonstrateNotifications() {
  try {
    // 鑾峰彇閭欢娓犻亾
    const emailChannels =
      await notificationChannelsService.getChannelsByType('email');
    if (emailChannels.length === 0) return { message: '娌℃湁閰嶇疆閭欢閫氱煡娓犻亾' };

    const channel = emailChannels[0];

    // 鍙戦€佹祴璇曢€氱煡
    const result = await notificationChannelsService.sendNotification(
      channel.id,
      '鍛婅瑙勫垯瀹屽杽婕旂ず',
      '杩欐槸涓€涓潵鑷狣002鍛婅瑙勫垯瀹屽杽浠诲姟鐨勬祴璇曢€氱煡',
      ['demo@company.com'],
      'normal'
    );

    return {
      channel_name: channel.name,
      notification_sent: result.success,
      message: result.success
        ? '閫氱煡鍙戦€佹垚?
        : `閫氱煡鍙戦€佸け? ${result.errorMessage}`,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

async function demonstrateStatistics() {
  try {
    const rulesStats = await alertRulesManager.getAlertRulesStatistics();
    const notificationStats =
      await notificationChannelsService.getNotificationStatistics('24h');

    return {
      rules_statistics: rulesStats,
      notification_statistics: notificationStats,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

async function demonstrateRuleManagement() {
  try {
    // 鑾峰彇鎵€鏈夎?    const allRules = await alertRulesManager.getAllAlertRules();

    // 鎸夌姸鎬佸垎?    const enabledRules = allRules.filter(r => r.enabled);
    const disabledRules = allRules.filter(r => !r.enabled);

    // 鎸変弗閲嶇骇鍒垎?    const rulesBySeverity = allRules.reduce(
      (acc, rule) => {
        acc[rule.severity] = (acc[rule.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total_rules: allRules.length,
      enabled_rules: enabledRules.length,
      disabled_rules: disabledRules.length,
      rules_by_severity: rulesBySeverity,
      sample_rules: allRules.slice(0, 3).map(r => ({
        name: r.name,
        severity: r.severity,
        enabled: r.enabled,
        metric: r.metric_name,
      })),
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

