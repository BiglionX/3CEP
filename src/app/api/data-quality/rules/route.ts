// 鏁版嵁璐ㄩ噺瑙勫垯閰嶇疆绠＄悊API
import { NextRequest, NextResponse } from 'next/server';
import { qualityRuleConfigManager } from '@/modules/data-center/monitoring/rule-config-manager';
import { dataQualityService } from '@/modules/data-center/monitoring/data-quality-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'statistics';

    switch (action) {
      case 'statistics':
        // 鑾峰彇瑙勫垯缁熻淇℃伅
        const stats = qualityRuleConfigManager.getRuleStatistics();
        return NextResponse.json({
          statistics: stats,
          timestamp: new Date().toISOString(),
        });

      case 'groups':
        // 鑾峰彇瑙勫垯缁勪俊        const groups = qualityRuleConfigManager['ruleGroups'];
        return NextResponse.json({
          groups: Object.fromEntries(groups),
          count: groups.size,
          timestamp: new Date().toISOString(),
        });

      case 'templates':
        // 鑾峰彇瑙勫垯妯℃澘
        const templates = qualityRuleConfigManager['ruleTemplates'];
        return NextResponse.json({
          templates: Object.fromEntries(templates),
          count: templates.size,
          timestamp: new Date().toISOString(),
        });

      case 'configuration':
        // 鑾峰彇瀹屾暣閰嶇疆
        const config = qualityRuleConfigManager.exportRuleConfiguration();
        return NextResponse.json({
          configuration: config,
          timestamp: new Date().toISOString(),
        });

      case 'validation':
        // 楠岃瘉閰嶇疆
        const validation = qualityRuleConfigManager.validateRuleConfiguration();
        return NextResponse.json({
          validation: validation,
          timestamp: new Date().toISOString(),
        });

      case 'critical-rules':
        // 鑾峰彇鍏抽敭瑙勫垯
        const criticalRules = qualityRuleConfigManager.getCriticalRules();
        return NextResponse.json({
          criticalRules: criticalRules,
          count: criticalRules.length,
          timestamp: new Date().toISOString(),
        });

      case 'report':
        // 鐢熸垚閰嶇疆鎶ュ憡
        const report = qualityRuleConfigManager.generateConfigurationReport();
        return NextResponse.json(report);

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瑙勫垯閰嶇疆API閿欒:', error);
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
    const { action, ...params } = body;

    switch (action) {
      case 'create-rule':
        // 鍩轰簬妯℃澘鍒涘缓瑙勫垯
        const { templateName, ruleParameters } = params;
        if (!templateName || !ruleParameters) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鍙傛暟: templateName ruleParameters' },
            { status: 400 }
          );
        }

        const newRule = qualityRuleConfigManager.createRuleFromTemplate(
          templateName,
          ruleParameters
        );

        if (!newRule) {
          return NextResponse.json(
            { error: '鍒涘缓瑙勫垯澶辫触锛屾ā鏉夸笉瀛樺湪鎴栧弬鏁伴敊 },
            { status: 400 }
          );
        }

        dataQualityService.addCheckRule(newRule);

        return NextResponse.json({
          message: '瑙勫垯鍒涘缓鎴愬姛',
          rule: newRule,
          timestamp: new Date().toISOString(),
        });

      case 'batch-create-rules':
        // 鎵归噺鍒涘缓瑙勫垯
        const { template, tableColumnPairs } = params;
        if (!template || !tableColumnPairs) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鍙傛暟: template tableColumnPairs' },
            { status: 400 }
          );
        }

        const createdRules = qualityRuleConfigManager.batchCreateRules(
          template,
          tableColumnPairs
        );

        return NextResponse.json({
          message: `鎵归噺鍒涘缓${createdRules.length} 涓鍒檂,
          rules: createdRules,
          timestamp: new Date().toISOString(),
        });

      case 'execute-group':
        // 鎵ц瑙勫垯        const { groupName } = params;
        if (!groupName) {
          return NextResponse.json(
            { error: '缂哄皯瑙勫垯缁勫悕 },
            { status: 400 }
          );
        }

        const groupResults =
          await qualityRuleConfigManager.executeRuleGroup(groupName);

        return NextResponse.json({
          message: `瑙勫垯${groupName} 鎵ц瀹屾垚`,
          groupName,
          results: groupResults,
          summary: {
            total: groupResults.length,
            passed: groupResults.filter(r => r.status === 'passed').length,
            failed: groupResults.filter(r => r.status === 'failed').length,
            warning: groupResults.filter(r => r.status === 'warning').length,
          },
          timestamp: new Date().toISOString(),
        });

      case 'toggle-group':
        // 鍚敤/绂佺敤瑙勫垯        const { group, enabled } = params;
        if (!group || enabled === undefined) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鍙傛暟: group enabled' },
            { status: 400 }
          );
        }

        const toggleResult = qualityRuleConfigManager.toggleRuleGroup(
          group,
          enabled
        );

        return NextResponse.json({
          message: toggleResult
             `瑙勫垯${group} ${enabled  '鍚敤' : '绂佺敤'}鎴愬姛`
            : `瑙勫垯${group} 鎿嶄綔澶辫触`,
          groupName: group,
          enabled: enabled,
          success: toggleResult,
          timestamp: new Date().toISOString(),
        });

      case 'update-config':
        // 鏇存柊閰嶇疆
        const { configUpdates } = params;
        if (!configUpdates) {
          return NextResponse.json(
            { error: '缂哄皯閰嶇疆鏇存柊鏁版嵁' },
            { status: 400 }
          );
        }

        // 鏍规嵁鏇存柊绫诲瀷鍒嗗埆澶勭悊
        if (configUpdates.globalSettings) {
          qualityRuleConfigManager.updateGlobalConfig(
            configUpdates.globalSettings
          );
        }
        if (configUpdates.notificationSettings) {
          qualityRuleConfigManager.updateNotificationConfig(
            configUpdates.notificationSettings
          );
        }
        if (configUpdates.autoRemediation) {
          qualityRuleConfigManager.updateAutoRemediationConfig(
            configUpdates.autoRemediation
          );
        }

        return NextResponse.json({
          message: '閰嶇疆鏇存柊鎴愬姛',
          updates: configUpdates,
          timestamp: new Date().toISOString(),
        });

      case 'import-config':
        // 瀵煎叆閰嶇疆
        const { configData } = params;
        if (!configData) {
          return NextResponse.json({ error: '缂哄皯閰嶇疆鏁版嵁' }, { status: 400 });
        }

        qualityRuleConfigManager.importRuleConfiguration(configData);

        return NextResponse.json({
          message: '閰嶇疆瀵煎叆鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'export-config':
        // 瀵煎嚭閰嶇疆
        const exportedConfig =
          qualityRuleConfigManager.exportRuleConfiguration();
        return NextResponse.json({
          configuration: exportedConfig,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瑙勫垯閰嶇疆API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

