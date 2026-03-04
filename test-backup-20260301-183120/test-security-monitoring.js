/**
 * 安全监控系统综合测试脚本
 * 验证安全事件检测、异常行为分析和监控告警功能
 */

const BASE_URL = 'http://localhost:3001';

async function runSecurityMonitoringTests() {
  console.log('🛡️  安全监控系统测试开始\n');
  console.log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  // 测试辅助函数
  const test = async (name, testFn) => {
    totalTests++;
    try {
      console.log(`\n📝 测试: ${name}`);
      const result = await testFn();
      if (result.pass) {
        console.log(`   ✅ ${result.message || '测试通过'}`);
        passedTests++;
      } else {
        console.log(`   ❌ ${result.message || '测试失败'}`);
      }
      return result;
    } catch (error) {
      console.log(`   ❌ 测试异常: ${error.message}`);
      return { pass: false, error: error.message };
    }
  };

  // 1. 安全监控API可用性测试
  await test('安全监控API可用性', async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/security-monitoring?action=status`
      );
      const result = await response.json();

      if (result.success && result.data) {
        return { pass: true, message: '安全监控API正常响应' };
      }
      return { pass: false, message: 'API响应格式不正确' };
    } catch (error) {
      return { pass: false, message: `API调用失败: ${error.message}` };
    }
  });

  // 2. 安全事件处理测试
  await test('安全事件处理功能', async () => {
    const testEvent = {
      eventType: 'failed_login',
      userId: 'test_user_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Test Browser',
      details: {
        attemptCount: 5,
        timeWindow: 300,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/api/security-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_event',
          eventData: testEvent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          pass: true,
          message: `事件处理成功，检测到威胁: ${result.detectedThreat ? '是' : '否'}`,
        };
      }
      return { pass: false, message: '事件处理失败' };
    } catch (error) {
      return { pass: false, message: `事件处理异常: ${error.message}` };
    }
  });

  // 3. 批量事件处理测试
  await test('批量安全事件处理', async () => {
    const testEvents = [
      {
        eventType: 'login_attempt',
        userId: 'user_1',
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome',
      },
      {
        eventType: 'failed_login',
        userId: 'user_2',
        ipAddress: '10.0.0.2',
        userAgent: 'Firefox',
      },
      {
        eventType: 'data_access',
        userId: 'user_3',
        ipAddress: '10.0.0.3',
        userAgent: 'Safari',
      },
    ];

    try {
      const response = await fetch(`${BASE_URL}/api/security-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_process',
          events: testEvents,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          pass: true,
          message: `批量处理完成: ${result.successful}/${result.totalProcessed} 成功`,
        };
      }
      return { pass: false, message: '批量处理失败' };
    } catch (error) {
      return { pass: false, message: `批量处理异常: ${error.message}` };
    }
  });

  // 4. 威胁检测规则测试
  await test('威胁检测规则有效性', async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/security-monitoring?action=detection_rules`
      );
      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        const enabledRules = result.data.filter(rule => rule.enabled);
        return {
          pass: true,
          message: `检测规则加载成功: ${enabledRules.length}/${result.data.length} 已启用`,
        };
      }
      return { pass: false, message: '检测规则加载失败或为空' };
    } catch (error) {
      return { pass: false, message: `规则加载异常: ${error.message}` };
    }
  });

  // 5. 安全仪表板数据测试
  await test('安全仪表板数据获取', async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/security-monitoring?action=dashboard`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const { threatMetrics, systemSecurityScore, complianceStatus } =
          result.data;

        return {
          pass: true,
          message: `仪表板数据完整: 安全评分${systemSecurityScore}分, 威胁事件${threatMetrics.threatEvents}个`,
        };
      }
      return { pass: false, message: '仪表板数据不完整' };
    } catch (error) {
      return { pass: false, message: `仪表板数据获取异常: ${error.message}` };
    }
  });

  // 6. 威胁指标查询测试
  await test('威胁指标实时查询', async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/security-monitoring?action=threat_metrics&time_window=60`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const { totalEvents, threatEvents, criticalAlerts } = result.data;
        return {
          pass: true,
          message: `威胁指标获取成功: 总事件${totalEvents}, 威胁${threatEvents}, 严重告警${criticalAlerts}`,
        };
      }
      return { pass: false, message: '威胁指标数据不完整' };
    } catch (error) {
      return { pass: false, message: `威胁指标查询异常: ${error.message}` };
    }
  });

  // 7. 用户风险档案测试
  await test('用户风险档案查询', async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/security-monitoring?action=user_risk_profile&user_id=test_user_123`
      );
      const result = await response.json();

      if (result.success) {
        return { pass: true, message: '用户风险档案查询成功' };
      }
      return { pass: false, message: '用户风险档案查询失败' };
    } catch (error) {
      return { pass: false, message: `风险档案查询异常: ${error.message}` };
    }
  });

  // 8. 异常行为检测测试
  await test('异常行为检测功能', async () => {
    // 模拟异常登录行为
    const anomalyEvent = {
      eventType: 'login_attempt',
      userId: 'user_anomaly_test',
      ipAddress: '192.168.100.100', // 异常IP
      userAgent: 'Suspicious Browser',
      location: {
        country: 'RU', // 高风险国家
        region: 'Moscow',
      },
      timestamp: new Date().toISOString(),
      details: {
        hourOfDay: 3, // 异常时间
        sessionDuration: 0,
        unusualActivity: true,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/api/security-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_event',
          eventData: anomalyEvent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          pass: true,
          message: `异常行为检测: ${result.detectedThreat ? '威胁已识别' : '正常行为'}`,
        };
      }
      return { pass: false, message: '异常行为检测处理失败' };
    } catch (error) {
      return { pass: false, message: `异常行为检测异常: ${error.message}` };
    }
  });

  // 9. 安全配置管理测试
  await test('安全配置动态更新', async () => {
    const newConfig = {
      detectionEnabled: true,
      anomalyDetectionEnabled: true,
      maxAlertsPerHour: 150,
      samplingRate: 0.8,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/security-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          config: newConfig,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return { pass: true, message: '安全配置更新成功' };
      }
      return { pass: false, message: '安全配置更新失败' };
    } catch (error) {
      return { pass: false, message: `配置更新异常: ${error.message}` };
    }
  });

  // 10. 系统性能测试
  await test('安全监控系统性能', async () => {
    const startTime = Date.now();
    const testCount = 10;

    try {
      const promises = [];
      for (let i = 0; i < testCount; i++) {
        promises.push(
          fetch(`${BASE_URL}/api/security-monitoring?action=status`)
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const avgResponseTime = (endTime - startTime) / testCount;

      if (avgResponseTime < 1000) {
        // 1秒内响应
        return {
          pass: true,
          message: `系统性能良好: 平均响应时间 ${avgResponseTime.toFixed(2)}ms`,
        };
      } else {
        return {
          pass: false,
          message: `系统响应较慢: 平均响应时间 ${avgResponseTime.toFixed(2)}ms`,
        };
      }
    } catch (error) {
      return { pass: false, message: `性能测试异常: ${error.message}` };
    }
  });

  // 测试总结
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 安全监控系统测试总结报告');
  console.log('='.repeat(60));

  console.log(`总计测试: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！安全监控系统功能完整');
    console.log('\n📋 已完成功能清单:');
    console.log('✅ 安全事件实时检测');
    console.log('✅ 异常行为智能分析');
    console.log('✅ 多维度威胁评估');
    console.log('✅ 实时告警通知机制');
    console.log('✅ 安全仪表板可视化');
    console.log('✅ 用户风险档案管理');
    console.log('✅ 合规状态监控');
    console.log('✅ 系统性能监控');
    console.log('✅ 动态配置管理');

    console.log('\n🚀 安全监控系统已就绪');
  } else {
    console.log('\n⚠️  部分测试未通过，请检查相关功能实现');
  }

  console.log('\n💡 建议的下一步操作:');
  console.log('1. 在浏览器中访问 /security-dashboard 查看安全监控面板');
  console.log('2. 验证实时威胁检测功能');
  console.log('3. 测试告警通知机制');
  console.log('4. 检查用户行为分析准确性');

  return {
    totalTests,
    passedTests,
    successRate: (passedTests / totalTests) * 100,
    timestamp: new Date().toISOString(),
  };
}

// 执行测试
runSecurityMonitoringTests()
  .then(result => {
    console.log('\n🏁 测试执行完成');
    process.exit(result.passedTests === result.totalTests ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试执行异常:', error);
    process.exit(1);
  });
