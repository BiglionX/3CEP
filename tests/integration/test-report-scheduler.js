const fs = require('fs');
const path = require('path');

async function testReportScheduler() {
  console.log('🚀 开始报表调度器功能测试\n');

  // 测试配置
  const baseURL = 'http://localhost:3001';
  const testResults = [];

  try {
    // 1. 测试获取调度器状态
    console.log('1️⃣ 测试获取调度器状态...');
    const statusResponse = await testEndpoint(
      `${baseURL}/api/data-center/scheduler?action=status`
    );
    testResults.push({
      name: '调度器状态获取',
      success: statusResponse.success,
      details: statusResponse.data,
    });

    // 2. 测试获取报表模板
    console.log('\n2️⃣ 测试获取报表模板...');
    const templatesResponse = await testEndpoint(
      `${baseURL}/api/data-center/scheduler?action=templates`
    );
    testResults.push({
      name: '报表模板获取',
      success: templatesResponse.success,
      details: {
        count: templatesResponse.data?.length || 0,
        sample: templatesResponse.data?.slice(0, 2),
      },
    });

    // 3. 测试创建调度任务
    console.log('\n3️⃣ 测试创建调度任务...');
    const createData = {
      templateId: 'device-overview',
      name: '设备概览日报',
      description: '每日生成设备统计数据报表',
      schedule: {
        frequency: 'day',
        interval: 1,
        startTime: '09:00',
      },
      recipients: ['admin@example.com', 'manager@example.com'],
      format: 'pdf',
      enabled: true,
    };

    const createResponse = await testPostEndpoint(
      `${baseURL}/api/data-center/scheduler`,
      createData
    );
    testResults.push({
      name: '调度任务创建',
      success: createResponse.success,
      details: createResponse.data,
    });

    // 4. 测试获取调度任务列表
    console.log('\n4️⃣ 测试获取调度任务列表...');
    const listResponse = await testEndpoint(
      `${baseURL}/api/data-center/scheduler?action=list`
    );
    testResults.push({
      name: '调度任务列表获取',
      success: listResponse.success,
      details: {
        count: listResponse.data?.length || 0,
        sample: listResponse.data?.slice(0, 1),
      },
    });

    // 5. 测试手动触发报表生成（如果创建成功）
    if (createResponse.success && createResponse.data?.id) {
      console.log('\n5️⃣ 测试手动触发报表生成...');
      const triggerResponse = await testPostEndpoint(
        `${baseURL}/api/data-center/scheduler/trigger?scheduleId=${createResponse.data.id}`,
        {}
      );
      testResults.push({
        name: '手动触发报表生成',
        success: triggerResponse.success,
        details: triggerResponse.message,
      });
    }

    // 6. 测试更新调度任务（如果创建成功）
    if (createResponse.success && createResponse.data?.id) {
      console.log('\n6️⃣ 测试更新调度任务...');
      const updateData = {
        name: '设备概览日报 - 更新版',
        description: '更新后的每日设备统计数据报表',
        enabled: false,
      };

      const updateResponse = await testPutEndpoint(
        `${baseURL}/api/data-center/scheduler?id=${createResponse.data.id}`,
        updateData
      );
      testResults.push({
        name: '调度任务更新',
        success: updateResponse.success,
        details: updateResponse.data,
      });
    }

    // 7. 测试删除调度任务（如果创建成功）
    if (createResponse.success && createResponse.data?.id) {
      console.log('\n7️⃣ 测试删除调度任务...');
      const deleteResponse = await testDeleteEndpoint(
        `${baseURL}/api/data-center/scheduler?id=${createResponse.data.id}`
      );
      testResults.push({
        name: '调度任务删除',
        success: deleteResponse.success,
        details: deleteResponse.message,
      });
    }

    // 生成测试报告
    await generateTestReport(testResults);
  } catch (error) {
    console.error('❌ 测试执行过程中发生错误:', error);
    testResults.push({
      name: '整体测试',
      success: false,
      details: { error: error.message },
    });
  }

  // 输出汇总结果
  console.log('\n📋 测试结果汇总:');
  console.log('==================');
  const passedTests = testResults.filter(t => t.success).length;
  const totalTests = testResults.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  testResults.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${test.name}`);
  });

  console.log(
    `\n📊 总体结果: ${passedTests}/${totalTests} 通过 (${successRate}%)`
  );

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查实现');
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    successRate: parseFloat(successRate),
    details: testResults,
  };
}

async function testEndpoint(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testPostEndpoint(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testPutEndpoint(url, data) {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testDeleteEndpoint(url) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function generateTestReport(testResults) {
  const report = {
    testName: '报表调度器功能测试',
    timestamp: new Date().toISOString(),
    environment: 'development',
    results: testResults,
    summary: {
      total: testResults.length,
      passed: testResults.filter(t => t.success).length,
      failed: testResults.filter(t => !t.success).length,
      successRate: `${(
        (testResults.filter(t => t.success).length / testResults.length) *
        100
      ).toFixed(1)}%`,
    },
  };

  // 保存测试报告
  const reportPath = path.join(
    __dirname,
    '../../reports',
    'report-scheduler-test-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 测试报告已保存至: ${reportPath}`);
}

// 执行测试
if (require.main === module) {
  testReportScheduler()
    .then(result => {
      process.exit(result.passed === result.total ? 0 : 1);
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testReportScheduler };
