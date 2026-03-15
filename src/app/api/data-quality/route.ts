import { NextRequest, NextResponse } from 'next/server';
import { dataQualityService } from '@/modules/data-center/monitoring/data-quality-service';

// GET璇眰澶勭悊
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'report';

    switch (action) {
      case 'report':
        // 鐢熸垚鏁版嵁璐ㄩ噺鎶ュ憡
        const report = await dataQualityService.generateQualityReport();
        return NextResponse.json(report);

      case 'rules':
        // 鑾峰彇妫€鏌ヨ        const rules = dataQualityService.getAllCheckRules();
        const enabledOnly = searchParams.get('enabled') === 'true';
        const filteredRules = enabledOnly
           rules.filter(rule => rule.enabled)
          : rules;

        return NextResponse.json({
          rules: filteredRules,
          count: filteredRules.length,
          timestamp: new Date().toISOString(),
        });

      case 'results':
        // 鑾峰彇妫€鏌ョ粨        const ruleId = searchParams.get('ruleId');
        const limit = parseInt(searchParams.get('limit') || '10');

        let results;
        if (ruleId) {
          results = dataQualityService.getRuleCheckResults(ruleId, limit);
        } else {
          results = dataQualityService.getCheckHistory(limit);
        }

        return NextResponse.json({
          results,
          count: results.length,
          timestamp: new Date().toISOString(),
        });

      case 'tables':
        // 鑾峰彇娑夊強鐨勮〃鍒楄〃
        const allRules = dataQualityService.getAllCheckRules();
        const tables = [...new Set(allRules.map(rule => rule.tableName))];
        return NextResponse.json({
          tables,
          count: tables.length,
          timestamp: new Date().toISOString(),
        });

      case 'health':
        // 鏁版嵁璐ㄩ噺鏈嶅姟鍋ュ悍妫€        return NextResponse.json({
          status: 'healthy',
          service: 'data-quality',
          rulesCount: dataQualityService.getAllCheckRules().length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鏁版嵁璐ㄩ噺API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST璇眰澶勭悊
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'run-check':
        // 鎵ц鍗曚釜妫€        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: '缂哄皯妫€鏌ヨ鍒橧D' },
            { status: 400 }
          );
        }

        const result = await dataQualityService.executeCheckRule(ruleId);
        if (!result) {
          return NextResponse.json(
            { error: '妫€鏌ヨ鍒欎笉瀛樺湪鎴栨湭鍚敤' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: '妫€鏌ユ墽琛屽畬,
          result,
          timestamp: new Date().toISOString(),
        });

      case 'run-all-checks':
        // 鎵ц鎵€鏈夋        const allResults = await dataQualityService.runAllChecks();
        return NextResponse.json({
          message: `鎵ц${allResults.length} 涓暟鎹川閲忔鏌,
          results: allResults,
          summary: {
            total: allResults.length,
            passed: allResults.filter(r => r.status === 'passed').length,
            warning: allResults.filter(r => r.status === 'warning').length,
            failed: allResults.filter(r => r.status === 'failed').length,
          },
          timestamp: new Date().toISOString(),
        });

      case 'run-table-checks':
        // 鎵ц鐗瑰畾琛ㄧ殑妫€        const { tableName } = params;
        if (!tableName) {
          return NextResponse.json({ error: '缂哄皯琛ㄥ悕鍙傛暟' }, { status: 400 });
        }

        const tableResults = await dataQualityService.runTableChecks(tableName);
        return NextResponse.json({
          message: `鎵ц${tableName} 琛ㄧ殑 ${tableResults.length} 涓鏌,
          tableName,
          results: tableResults,
          timestamp: new Date().toISOString(),
        });

      case 'add-rule':
        // 娣诲姞妫€鏌ヨ        const ruleData = params.rule;
        if (!ruleData) {
          return NextResponse.json(
            { error: '缂哄皯妫€鏌ヨ鍒欐暟 },
            { status: 400 }
          );
        }

        const newRule = {
          id: ruleData.id || `rule_${Date.now()}`,
          name: ruleData.name,
          tableName: ruleData.tableName,
          columnName: ruleData.columnName,
          checkType: ruleData.checkType,
          parameters: ruleData.parameters,
          threshold: ruleData.threshold || 5,
          enabled: ruleData.enabled !== false,
          schedule: ruleData.schedule,
          description: ruleData.description,
          severity: ruleData.severity || 'medium',
        };

        dataQualityService.addCheckRule(newRule);

        return NextResponse.json({
          message: '妫€鏌ヨ鍒欐坊鍔犳垚,
          rule: newRule,
          timestamp: new Date().toISOString(),
        });

      case 'update-rule':
        // 鏇存柊妫€鏌ヨ        const { ruleId: updateRuleId, updates } = params;
        if (!updateRuleId || !updates) {
          return NextResponse.json(
            { error: '缂哄皯瑙勫垯ID鎴栨洿鏂版暟 },
            { status: 400 }
          );
        }

        const updateSuccess = dataQualityService.updateCheckRule(
          updateRuleId,
          updates
        );
        if (!updateSuccess) {
          return NextResponse.json(
            { error: '妫€鏌ヨ鍒欎笉瀛樺湪' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: '妫€鏌ヨ鍒欐洿鏂版垚,
          ruleId: updateRuleId,
          timestamp: new Date().toISOString(),
        });

      case 'remove-rule':
        // 鍒犻櫎妫€鏌ヨ        const { ruleId: removeRuleId } = params;
        if (!removeRuleId) {
          return NextResponse.json({ error: '缂哄皯瑙勫垯ID' }, { status: 400 });
        }

        const removeSuccess = dataQualityService.removeCheckRule(removeRuleId);
        if (!removeSuccess) {
          return NextResponse.json(
            { error: '妫€鏌ヨ鍒欎笉瀛樺湪' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: '妫€鏌ヨ鍒欏垹闄ゆ垚,
          ruleId: removeRuleId,
          timestamp: new Date().toISOString(),
        });

      case 'configure':
        // 閰嶇疆鏈嶅姟鍙傛暟
        const config = params.config;
        if (!config) {
          return NextResponse.json({ error: '缂哄皯閰嶇疆鍙傛暟' }, { status: 400 });
        }

        dataQualityService.updateConfig(config);

        return NextResponse.json({
          message: '鏁版嵁璐ㄩ噺鏈嶅姟閰嶇疆鏇存柊鎴愬姛',
          config,
          timestamp: new Date().toISOString(),
        });

      case 'test-rule':
        // 娴嬭瘯妫€鏌ヨ        const testRuleData = params.rule;
        if (!testRuleData) {
          return NextResponse.json(
            { error: '缂哄皯娴嬭瘯瑙勫垯鏁版嵁' },
            { status: 400 }
          );
        }

        // 鍒涘缓涓存椂瑙勫垯杩涜娴嬭瘯
        const testRule = {
          id: `test_${Date.now()}`,
          name: testRuleData.name || '娴嬭瘯瑙勫垯',
          tableName: testRuleData.tableName,
          columnName: testRuleData.columnName,
          checkType: testRuleData.checkType,
          parameters: testRuleData.parameters,
          threshold: testRuleData.threshold || 5,
          enabled: true,
          severity: testRuleData.severity || 'medium',
        };

        const testResult = await dataQualityService.executeCheckRule(
          testRule.id
        );

        return NextResponse.json({
          message: '瑙勫垯娴嬭瘯瀹屾垚',
          testRule,
          result: testResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鏁版嵁璐ㄩ噺API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

