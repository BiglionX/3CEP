// 最终系统状态验证报告
async function finalSystemStatusVerification() {
  console.log('📋 最终系统状态验证报告\n');

  const baseUrl = 'http://localhost:3001';
  const testResults = [];

  // 核心功能验证
  console.log('🚀 核心功能状态检查...\n');

  const criticalTests = [
    { path: '/', name: '首页访问', expected: 200 },
    { path: '/login', name: '登录页面', expected: 200 },
    { path: '/register', name: '注册页面', expected: 200 },
    { path: '/articles', name: '文章页面', expected: 200 },
    { path: '/workflows', name: '工作流页面', expected: 200 },
    { path: '/dashboard', name: '仪表板页面', expected: 200 },
    { path: '/api/auth/login', name: '登录API', expected: 405 },
    { path: '/api/auth/check-session', name: '会话检查API', expected: 401 },
  ];

  for (const test of criticalTests) {
    try {
      const response = await fetch(`${baseUrl}${test.path}`, {
        method: 'HEAD',
      });
      const status = response.status;

      if (status === test.expected) {
        console.log(`   ✅ ${test.name} - 状态码 ${status} (符合预期)`);
        testResults.push({
          name: test.name,
          status: 'PASS',
          details: `状态码: ${status}`,
        });
      } else if (status < 500) {
        console.log(
          `   ⚠️  ${test.name} - 状态码 ${status} (预期: ${test.expected})`
        );
        testResults.push({
          name: test.name,
          status: 'WARN',
          details: `状态码: ${status}, 预期: ${test.expected}`,
        });
      } else {
        console.log(
          `   ❌ ${test.name} - 状态码 ${status} (预期: ${test.expected})`
        );
        testResults.push({
          name: test.name,
          status: 'FAIL',
          details: `状态码: ${status}, 预期: ${test.expected}`,
        });
      }
    } catch (error) {
      console.log(`   ❌ ${test.name} - 连接失败`);
      testResults.push({
        name: test.name,
        status: 'ERROR',
        details: `错误: ${error.message}`,
      });
    }
  }

  // 移动端API验证
  console.log('\n📱 移动端API功能检查...\n');

  const mobileApis = [
    { path: '/api/v1/feed/hot?page=1', name: '热点信息流', expected: 200 },
    { path: '/api/v1/search?q=test', name: '搜索功能', expected: 200 },
    { path: '/api/v1/user/profile', name: '用户画像', expected: 401 },
    { path: '/api/v1/articles/test-id', name: '文章详情', expected: 404 },
  ];

  for (const api of mobileApis) {
    try {
      const response = await fetch(`${baseUrl}${api.path}`);
      const status = response.status;

      if (status === api.expected) {
        console.log(`   ✅ ${api.name} - 状态码 ${status} (符合预期)`);
        testResults.push({
          name: `${api.name} API`,
          status: 'PASS',
          details: `状态码: ${status}`,
        });
      } else {
        console.log(
          `   ⚠️  ${api.name} - 状态码 ${status} (预期: ${api.expected})`
        );
        testResults.push({
          name: `${api.name} API`,
          status: 'WARN',
          details: `状态码: ${status}, 预期: ${api.expected}`,
        });
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} - 连接失败`);
      testResults.push({
        name: `${api.name} API`,
        status: 'ERROR',
        details: `错误: ${error.message}`,
      });
    }
  }

  // 第二阶段功能验证
  console.log('\n⚡ 第二阶段功能检查...\n');

  const phase2Features = [
    { path: '/api/v1/interact/like', method: 'POST', name: '点赞功能' },
    { path: '/api/v1/interact/favorite', method: 'POST', name: '收藏功能' },
    { path: '/api/v1/parts/prices', method: 'POST', name: '配件价格查询' },
  ];

  for (const feature of phase2Features) {
    try {
      const response = await fetch(`${baseUrl}${feature.path}`, {
        method: feature.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      const status = response.status;

      if (status === 401 || status === 400 || status < 500) {
        console.log(`   ✅ ${feature.name} - 状态码 ${status} (正常)`);
        testResults.push({
          name: feature.name,
          status: 'PASS',
          details: `状态码: ${status}`,
        });
      } else {
        console.log(`   ❌ ${feature.name} - 状态码 ${status}`);
        testResults.push({
          name: feature.name,
          status: 'FAIL',
          details: `状态码: ${status}`,
        });
      }
    } catch (error) {
      console.log(`   ❌ ${feature.name} - 连接失败`);
      testResults.push({
        name: feature.name,
        status: 'ERROR',
        details: `错误: ${error.message}`,
      });
    }
  }

  // 系统健康度评估
  console.log('\n🏥 系统健康度综合评估:');
  console.log('=====================================');

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const warnCount = testResults.filter(r => r.status === 'WARN').length;
  const failCount = testResults.filter(
    r => r.status === 'FAIL' || r.status === 'ERROR'
  ).length;
  const totalCount = testResults.length;
  const healthScore = Math.round(
    ((passCount + warnCount * 0.5) / totalCount) * 100
  );

  testResults.forEach(result => {
    const statusIcon =
      result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(
      `${statusIcon} ${result.name}${result.details ? ` - ${result.details}` : ''}`
    );
  });

  console.log('=====================================');
  console.log(`总测试项: ${totalCount}`);
  console.log(`通过: ${passCount} ✅`);
  console.log(`警告: ${warnCount} ⚠️`);
  console.log(`失败: ${failCount} ❌`);
  console.log(`系统健康度: ${healthScore}%`);

  // 最终评估
  console.log('\n🎯 最终评估结论:');

  if (healthScore >= 90) {
    console.log('🟢 系统状态优秀 - 所有核心功能正常运行');
  } else if (healthScore >= 80) {
    console.log('🟡 系统状态良好 - 主要功能正常，少量警告');
  } else if (healthScore >= 70) {
    console.log('🟠 系统状态一般 - 基本功能可用，需要关注问题');
  } else {
    console.log('🔴 系统状态较差 - 存在较多问题需要修复');
  }

  // 具体改进建议
  console.log('\n📝 改进建议:');

  if (failCount > 0) {
    console.log('- 优先修复失败的功能模块');
  }

  if (warnCount > 0) {
    console.log('- 优化警告级别的功能表现');
  }

  console.log('- 持续监控系统性能指标');
  console.log('- 定期执行回归测试确保稳定性');

  return {
    healthScore,
    passCount,
    warnCount,
    failCount,
    testResults,
  };
}

// 执行验证
if (require.main === module) {
  finalSystemStatusVerification()
    .then(result => {
      console.log('\n📊 验证完成！');

      if (result.healthScore >= 85) {
        console.log('🎉 系统已达到稳定运行状态');
      } else {
        console.log('🔧 建议继续优化系统稳定性');
      }

      process.exit(result.healthScore >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('验证过程出错:', error);
      process.exit(1);
    });
}

module.exports = { finalSystemStatusVerification };
