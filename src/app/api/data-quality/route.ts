import { NextRequest, NextResponse } from 'next/server';
import { dataQualityService } from '@/data-center/monitoring/data-quality-service';

// GET请求处理
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'report';
    
    switch (action) {
      case 'report':
        // 生成数据质量报告
        const report = await dataQualityService.generateQualityReport();
        return NextResponse.json(report);
        
      case 'rules':
        // 获取检查规则
        const rules = dataQualityService.getAllCheckRules();
        const enabledOnly = searchParams.get('enabled') === 'true';
        const filteredRules = enabledOnly ? 
          rules.filter(rule => rule.enabled) : rules;
        
        return NextResponse.json({
          rules: filteredRules,
          count: filteredRules.length,
          timestamp: new Date().toISOString()
        });
        
      case 'results':
        // 获取检查结果
        const ruleId = searchParams.get('ruleId');
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
          timestamp: new Date().toISOString()
        });
        
      case 'tables':
        // 获取涉及的表列表
        const allRules = dataQualityService.getAllCheckRules();
        const tables = [...new Set(allRules.map(rule => rule.tableName))];
        return NextResponse.json({
          tables,
          count: tables.length,
          timestamp: new Date().toISOString()
        });
        
      case 'health':
        // 数据质量服务健康检查
        return NextResponse.json({
          status: 'healthy',
          service: 'data-quality',
          rulesCount: dataQualityService.getAllCheckRules().length,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }
    
  } catch (error: any) {
    console.error('数据质量API错误:', error);
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
      case 'run-check':
        // 执行单个检查
        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: '缺少检查规则ID' },
            { status: 400 }
          );
        }
        
        const result = await dataQualityService.executeCheckRule(ruleId);
        if (!result) {
          return NextResponse.json(
            { error: '检查规则不存在或未启用' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: '检查执行完成',
          result,
          timestamp: new Date().toISOString()
        });
        
      case 'run-all-checks':
        // 执行所有检查
        const allResults = await dataQualityService.runAllChecks();
        return NextResponse.json({
          message: `执行了 ${allResults.length} 个数据质量检查`,
          results: allResults,
          summary: {
            total: allResults.length,
            passed: allResults.filter(r => r.status === 'passed').length,
            warning: allResults.filter(r => r.status === 'warning').length,
            failed: allResults.filter(r => r.status === 'failed').length
          },
          timestamp: new Date().toISOString()
        });
        
      case 'run-table-checks':
        // 执行特定表的检查
        const { tableName } = params;
        if (!tableName) {
          return NextResponse.json(
            { error: '缺少表名参数' },
            { status: 400 }
          );
        }
        
        const tableResults = await dataQualityService.runTableChecks(tableName);
        return NextResponse.json({
          message: `执行了 ${tableName} 表的 ${tableResults.length} 个检查`,
          tableName,
          results: tableResults,
          timestamp: new Date().toISOString()
        });
        
      case 'add-rule':
        // 添加检查规则
        const ruleData = params.rule;
        if (!ruleData) {
          return NextResponse.json(
            { error: '缺少检查规则数据' },
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
          severity: ruleData.severity || 'medium'
        };
        
        dataQualityService.addCheckRule(newRule);
        
        return NextResponse.json({
          message: '检查规则添加成功',
          rule: newRule,
          timestamp: new Date().toISOString()
        });
        
      case 'update-rule':
        // 更新检查规则
        const { ruleId: updateRuleId, updates } = params;
        if (!updateRuleId || !updates) {
          return NextResponse.json(
            { error: '缺少规则ID或更新数据' },
            { status: 400 }
          );
        }
        
        const updateSuccess = dataQualityService.updateCheckRule(updateRuleId, updates);
        if (!updateSuccess) {
          return NextResponse.json(
            { error: '检查规则不存在' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: '检查规则更新成功',
          ruleId: updateRuleId,
          timestamp: new Date().toISOString()
        });
        
      case 'remove-rule':
        // 删除检查规则
        const { ruleId: removeRuleId } = params;
        if (!removeRuleId) {
          return NextResponse.json(
            { error: '缺少规则ID' },
            { status: 400 }
          );
        }
        
        const removeSuccess = dataQualityService.removeCheckRule(removeRuleId);
        if (!removeSuccess) {
          return NextResponse.json(
            { error: '检查规则不存在' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: '检查规则删除成功',
          ruleId: removeRuleId,
          timestamp: new Date().toISOString()
        });
        
      case 'configure':
        // 配置服务参数
        const config = params.config;
        if (!config) {
          return NextResponse.json(
            { error: '缺少配置参数' },
            { status: 400 }
          );
        }
        
        dataQualityService.updateConfig(config);
        
        return NextResponse.json({
          message: '数据质量服务配置更新成功',
          config,
          timestamp: new Date().toISOString()
        });
        
      case 'test-rule':
        // 测试检查规则
        const testRuleData = params.rule;
        if (!testRuleData) {
          return NextResponse.json(
            { error: '缺少测试规则数据' },
            { status: 400 }
          );
        }
        
        // 创建临时规则进行测试
        const testRule = {
          id: `test_${Date.now()}`,
          name: testRuleData.name || '测试规则',
          tableName: testRuleData.tableName,
          columnName: testRuleData.columnName,
          checkType: testRuleData.checkType,
          parameters: testRuleData.parameters,
          threshold: testRuleData.threshold || 5,
          enabled: true,
          severity: testRuleData.severity || 'medium'
        };
        
        const testResult = await dataQualityService.executeCheckRule(testRule.id);
        
        return NextResponse.json({
          message: '规则测试完成',
          testRule,
          result: testResult,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }
    
  } catch (error: any) {
    console.error('数据质量API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}