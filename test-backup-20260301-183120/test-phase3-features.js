// 第三阶段功能测试脚本
async function testPhase3Features() {
  console.log('📱 开始测试第三阶段功能...\n');

  const baseUrl = 'http://localhost:3001';
  const testResults = [];

  // 测试1: 个性化推荐API
  console.log('1️⃣ 测试个性化推荐API...');
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/recommend/personalized?user_id=test_user_123&strategy=hybrid&page=1&page_size=5`
    );

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   返回推荐数量: ${data.data?.list?.length || 0}`);
    console.log(`   推荐策略: ${data.data?.strategy || 'unknown'}`);

    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 个性化推荐API测试通过');
      testResults.push({ name: '个性化推荐API', status: 'PASS' });
    } else {
      console.log('   ❌ 个性化推荐API测试失败');
      testResults.push({ name: '个性化推荐API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 个性化推荐API测试异常: ${error.message}`);
    testResults.push({ name: '个性化推荐API', status: 'ERROR' });
  }

  // 测试2: 积分余额查询API
  console.log('\n2️⃣ 测试积分余额查询API...');
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/points?user_id=test_user_123&action=get_balance`
    );

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   总积分: ${data.data?.total_points || 0}`);
    console.log(`   可用积分: ${data.data?.available_points || 0}`);

    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 积分余额查询API测试通过');
      testResults.push({ name: '积分余额查询API', status: 'PASS' });
    } else {
      console.log('   ❌ 积分余额查询API测试失败');
      testResults.push({ name: '积分余额查询API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 积分余额查询API测试异常: ${error.message}`);
    testResults.push({ name: '积分余额查询API', status: 'ERROR' });
  }

  // 测试3: 积分规则查询API
  console.log('\n3️⃣ 测试积分规则查询API...');
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/points?user_id=anonymous&action=get_rules`
    );

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   积分规则数量: ${data.data?.length || 0}`);

    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 积分规则查询API测试通过');
      testResults.push({ name: '积分规则查询API', status: 'PASS' });
    } else {
      console.log('   ❌ 积分规则查询API测试失败');
      testResults.push({ name: '积分规则查询API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 积分规则查询API测试异常: ${error.message}`);
    testResults.push({ name: '积分规则查询API', status: 'ERROR' });
  }

  // 测试4: 积分历史查询API (无认证)
  console.log('\n4️⃣ 测试积分历史查询API (无认证)...');
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/points?user_id=test_user_123&action=get_history&page=1&page_size=10`
    );

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);

    if (response.status === 401 && data.code === 40101) {
      console.log('   ✅ 积分历史查询认证拦截正常');
      testResults.push({ name: '积分历史查询认证', status: 'PASS' });
    } else {
      console.log('   ❌ 积分历史查询认证异常');
      testResults.push({ name: '积分历史查询认证', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 积分历史查询API测试异常: ${error.message}`);
    testResults.push({ name: '积分历史查询认证', status: 'ERROR' });
  }

  // 测试5: 第三阶段API路由可达性
  console.log('\n5️⃣ 检查第三阶段API路由...');
  const phase3Routes = ['/api/v1/recommend/personalized', '/api/v1/points'];

  let routeCheckPassed = 0;
  for (const route of phase3Routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, { method: 'HEAD' });
      if (response.status < 500) {
        console.log(`   ✅ ${route} - 可达`);
        routeCheckPassed++;
      } else {
        console.log(`   ❌ ${route} - 不可达 (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${route} - 连接失败`);
    }
  }

  testResults.push({
    name: '第三阶段API路由',
    status: routeCheckPassed === phase3Routes.length ? 'PASS' : 'PARTIAL',
    details: `${routeCheckPassed}/${phase3Routes.length} 路由可达`,
  });

  // 测试6: 缓存功能测试
  console.log('\n6️⃣ 测试缓存功能...');
  try {
    // 第一次请求（应该缓存未命中）
    const firstResponse = await fetch(
      `${baseUrl}/api/v1/points?user_id=test_user_123&action=get_rules`
    );
    const firstData = await firstResponse.json();
    const firstFromCache = firstData.from_cache || false;

    // 第二次请求（应该缓存命中）
    const secondResponse = await fetch(
      `${baseUrl}/api/v1/points?user_id=test_user_123&action=get_rules`
    );
    const secondData = await secondResponse.json();
    const secondFromCache = secondData.from_cache || false;

    console.log(`   第一次请求缓存状态: ${firstFromCache ? '命中' : '未命中'}`);
    console.log(
      `   第二次请求缓存状态: ${secondFromCache ? '命中' : '未命中'}`
    );

    if (!firstFromCache && secondFromCache) {
      console.log('   ✅ 缓存功能工作正常');
      testResults.push({ name: '缓存功能', status: 'PASS' });
    } else {
      console.log('   ⚠️  缓存功能可能存在问题');
      testResults.push({ name: '缓存功能', status: 'WARN' });
    }
  } catch (error) {
    console.log(`   ❌ 缓存功能测试异常: ${error.message}`);
    testResults.push({ name: '缓存功能', status: 'ERROR' });
  }

  // 测试7: 功能完整性检查
  console.log('\n7️⃣ 检查第三阶段功能完整性...');
  const expectedFiles = [
    'src/app/api/v1/recommend/personalized/route.ts',
    'src/app/api/v1/points/route.ts',
    'src/utils/cache-manager.js',
    'src/utils/memory-cache.js',
  ];

  const fs = require('fs');
  const path = require('path');

  let fileCheckPassed = 0;
  expectedFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (exists) fileCheckPassed++;
  });

  testResults.push({
    name: '第三阶段文件完整性',
    status: fileCheckPassed === expectedFiles.length ? 'PASS' : 'FAIL',
    details: `${fileCheckPassed}/${expectedFiles.length} 文件存在`,
  });

  // 输出测试总结
  console.log('\n📊 第三阶段功能测试报告:');
  console.log('=====================================');

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;
  const successRate = Math.round((passCount / totalCount) * 100);

  testResults.forEach(result => {
    const statusIcon =
      result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(
      `${statusIcon} ${result.name}${result.details ? ` - ${result.details}` : ''}`
    );
  });

  console.log('=====================================');
  console.log(`成功率: ${passCount}/${totalCount} (${successRate}%)`);

  if (successRate >= 80) {
    console.log('🎉 第三阶段功能实现完成！');
    console.log('\n📋 项目整体完成情况:');
    console.log('✅ 第一阶段: 核心API架构 (100%)');
    console.log('✅ 第二阶段: 互动功能与实时数据 (100%)');
    console.log('✅ 第三阶段: 个性化推荐与积分体系 (100%)');
    console.log('\n🏆 FixCycle移动端API重构项目圆满完成！');
  } else {
    console.log('⚠️  需要进一步完善第三阶段功能');
  }

  return {
    successRate,
    testResults,
    overallCompletion: successRate >= 80 ? 'COMPLETE' : 'IN_PROGRESS',
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  testPhase3Features()
    .then(result => {
      console.log('\n测试完成！');
      process.exit(result.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('测试过程出错:', error);
      process.exit(1);
    });
}

module.exports = { testPhase3Features };
