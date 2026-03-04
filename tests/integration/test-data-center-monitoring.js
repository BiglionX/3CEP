const fs = require('fs');
const path = require('path');

async function testDataCenterMonitoring() {
  console.log('🚀 开始数据管理中心监控告警系统测试\n');

  // 测试配置
  const baseURL = 'http://localhost:3001';
  const testResults = [];

  try {
    // 1. 测试监控整合器状态
    console.log('1️⃣ 测试监控整合器状态...');
    const integratorStatus = await testEndpoint(
      `${baseURL}/api/data-center/monitoring/integrator?action=status`
    );
    testResults.push({
      name: '监控整合器状态',
      success: integratorStatus.success,
      details: integratorStatus.data,
    });

    // 2. 测试告警引擎列表功能
    console.log('\n2️⃣ 测试告警引擎列表功能...');
    const alertList = await testEndpoint(
      `${baseURL}/api/data-center/monitoring/alert-engine?action=list`
    );
    testResults.push({
      name: '告警规则列表',
      success: alertList.success,
      details: alertList.data,
    });

    // 3. 测试性能分析功能
    console.log('\n3️⃣ 测试性能分析功能...');
    const performanceAnalysis = await testEndpoint(
      `${baseURL}/api/data-center/monitoring/performance?action=analyze&timeframe=24h`
    );
    testResults.push({
      name: '性能分析',
      success: performanceAnalysis.success,
      details: performanceAnalysis.data,
    });

    // 4. 测试创建告警规则
    console.log('\n4️⃣ 测试创建告警规则...');
    const newRule = {
      name: '测试告警规则',
      condition: 'test.metric > 100',
      severity: 'medium',
      notificationChannels: ['email'],
    };

    const createRule = await testPostEndpoint(
      `${baseURL}/api/data-center/monitoring/alert-engine`,
      newRule
    );
    testResults.push({
      name: '创建告警规则',
      success: createRule.success,
      details: createRule.data,
    });

    // 5. 测试瓶颈识别
    console.log('\n5️⃣ 测试瓶颈识别...');
    const bottlenecks = await testEndpoint(
      `${baseURL}/api/data-center/monitoring/performance?action=bottlenecks&timeframe=24h`
    );
    testResults.push({
      name: '性能瓶颈识别',
      success: bottlenecks.success,
      details: bottlenecks.data,
    });

    // 6. 测试优化建议
    console.log('\n6️⃣ 测试优化建议...');
    const recommendations = await testEndpoint(
      `${baseURL}/api/data-center/monitoring/performance?action=recommendations&timeframe=24h`
    );
    testResults.push({
      name: '优化建议',
      success: recommendations.success,
      details: recommendations.data,
    });

    // 生成测试报告
    generateTestReport(testResults);
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

async function testEndpoint(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`   ✅ 状态: ${response.status}`);
    console.log(
      `   📝 响应: ${JSON.stringify(data, null, 2).substring(0, 200)}...`
    );
    return data;
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPostEndpoint(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log(`   ✅ 状态: ${response.status}`);
    console.log(
      `   📝 响应: ${JSON.stringify(data, null, 2).substring(0, 200)}...`
    );
    return data;
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function generateTestReport(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 数据管理中心监控告警系统测试报告');
  console.log('='.repeat(60));

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n📈 测试概览:`);
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   成功率: ${successRate}%`);

  console.log(`\n📋 详细结果:`);
  results.forEach((result, index) => {
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${statusIcon} ${result.name}`);
    if (!result.success) {
      console.log(`      错误详情: ${result.details?.error || '未知错误'}`);
    }
  });

  // 生成详细报告文件
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: parseFloat(successRate),
    },
    testCases: results,
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
  };

  const reportPath = path.join(
    __dirname,
    '..',
    '..',
    'reports',
    'data-center-monitoring-test-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细测试报告已保存至: ${reportPath}`);

  // 成功指标评估
  console.log(`\n🎯 功能实现评估:`);
  if (successRate >= 90) {
    console.log('   🌟 优秀 - 核心功能完整实现');
  } else if (successRate >= 70) {
    console.log('   ✅ 良好 - 主要功能基本可用');
  } else {
    console.log('   ⚠️  需要改进 - 部分功能存在问题');
  }

  // 下一步建议
  console.log(`\n💡 下一步建议:`);
  if (passedTests === totalTests) {
    console.log('   1. 部署到测试环境进行集成测试');
    console.log('   2. 配置实际的监控数据源');
    console.log('   3. 设置真实的告警通知渠道');
    console.log('   4. 进行压力测试验证性能');
  } else {
    console.log('   1. 修复失败的测试用例');
    console.log('   2. 检查相关API端点实现');
    console.log('   3. 验证依赖服务状态');
    console.log('   4. 重新运行测试验证修复效果');
  }

  console.log('\n🎉 数据中心监控告警系统测试完成！');
}

// 执行测试
if (require.main === module) {
  testDataCenterMonitoring();
}

module.exports = { testDataCenterMonitoring };
