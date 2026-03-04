// 第二阶段功能测试脚本
async function testPhase2Features() {
  console.log('📱 开始测试第二阶段功能...\n');

  const baseUrl = 'http://localhost:3001';
  const testResults = [];

  // 测试1: 点赞API (无认证)
  console.log('1️⃣ 测试点赞API (无认证)...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/interact/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_id: 'test-article-123',
        target_type: 'article',
      }),
    });

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);

    if (response.status === 401 && data.code === 40101) {
      console.log('   ✅ 点赞API认证拦截正常');
      testResults.push({ name: '点赞API认证', status: 'PASS' });
    } else {
      console.log('   ❌ 点赞API认证异常');
      testResults.push({ name: '点赞API认证', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 点赞API测试异常: ${error.message}`);
    testResults.push({ name: '点赞API认证', status: 'ERROR' });
  }

  // 测试2: 收藏API (无认证)
  console.log('\n2️⃣ 测试收藏API (无认证)...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/interact/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_id: 'test-part-123',
        target_type: 'part',
      }),
    });

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);

    if (response.status === 401 && data.code === 40101) {
      console.log('   ✅ 收藏API认证拦截正常');
      testResults.push({ name: '收藏API认证', status: 'PASS' });
    } else {
      console.log('   ❌ 收藏API认证异常');
      testResults.push({ name: '收藏API认证', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 收藏API测试异常: ${error.message}`);
    testResults.push({ name: '收藏API认证', status: 'ERROR' });
  }

  // 测试3: 配件价格API
  console.log('\n3️⃣ 测试配件价格API...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/parts/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        part_ids: ['part-1', 'part-2'],
        refresh: false,
      }),
    });

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   返回数据数量: ${data.data?.length || 0}`);

    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 配件价格API测试通过');
      testResults.push({ name: '配件价格API', status: 'PASS' });
    } else {
      console.log('   ❌ 配件价格API测试失败');
      testResults.push({ name: '配件价格API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 配件价格API测试异常: ${error.message}`);
    testResults.push({ name: '配件价格API', status: 'ERROR' });
  }

  // 测试4: 收藏列表API (无认证)
  console.log('\n4️⃣ 测试收藏列表API (无认证)...');
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/interact/favorite?type=all&page=1&page_size=10`
    );

    const data = await response.json();
    console.log(`   状态码: ${response.status}`);

    if (response.status === 401 && data.code === 40101) {
      console.log('   ✅ 收藏列表API认证拦截正常');
      testResults.push({ name: '收藏列表API认证', status: 'PASS' });
    } else {
      console.log('   ❌ 收藏列表API认证异常');
      testResults.push({ name: '收藏列表API认证', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 收藏列表API测试异常: ${error.message}`);
    testResults.push({ name: '收藏列表API认证', status: 'ERROR' });
  }

  // 测试5: API路由可达性检查
  console.log('\n5️⃣ 检查第二阶段API路由...');
  const phase2Routes = [
    '/api/v1/interact/like',
    '/api/v1/interact/favorite',
    '/api/v1/parts/prices',
  ];

  let routeCheckPassed = 0;
  for (const route of phase2Routes) {
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
    name: '第二阶段API路由',
    status: routeCheckPassed === phase2Routes.length ? 'PASS' : 'PARTIAL',
    details: `${routeCheckPassed}/${phase2Routes.length} 路由可达`,
  });

  // 测试6: 功能完整性检查
  console.log('\n6️⃣ 检查第二阶段功能完整性...');
  const expectedFiles = [
    'src/app/api/v1/interact/like/route.ts',
    'src/app/api/v1/interact/favorite/route.ts',
    'src/app/api/v1/parts/prices/route.ts',
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
    name: '第二阶段文件完整性',
    status: fileCheckPassed === expectedFiles.length ? 'PASS' : 'FAIL',
    details: `${fileCheckPassed}/${expectedFiles.length} 文件存在`,
  });

  // 输出测试总结
  console.log('\n📊 第二阶段功能测试报告:');
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
    console.log('🎉 第二阶段功能实现完成！');
    console.log('\n📋 下一步建议:');
    console.log('1. 准备真实测试数据');
    console.log('2. 配置Redis缓存');
    console.log('3. 开始第三阶段开发');
  } else {
    console.log('⚠️  需要进一步完善第二阶段功能');
  }

  return {
    successRate,
    testResults,
    recommendations:
      successRate >= 80
        ? ['准备测试数据', '配置缓存', '开始第三阶段']
        : ['完善功能实现', '修复测试错误', '验证API逻辑'],
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  testPhase2Features()
    .then(result => {
      console.log('\n测试完成！');
      process.exit(result.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('测试过程出错:', error);
      process.exit(1);
    });
}

module.exports = { testPhase2Features };
