// 移动端API功能测试脚本
async function testMobileAPIs() {
  console.log('📱 开始测试移动端API功能...\n');
  
  const baseUrl = 'http://localhost:3001';
  const testResults = [];
  
  // 测试1: 热点信息流API
  console.log('1️⃣ 测试热点信息流API...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/feed/hot?page=1&page_size=5`);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应数据:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 热点信息流API测试通过');
      testResults.push({ name: '热点信息流API', status: 'PASS' });
    } else {
      console.log('   ❌ 热点信息流API测试失败');
      testResults.push({ name: '热点信息流API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 热点信息流API测试异常: ${error.message}`);
    testResults.push({ name: '热点信息流API', status: 'ERROR' });
  }
  
  // 测试2: 全局搜索API
  console.log('\n2️⃣ 测试全局搜索API...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/search?q=iPhone&page=1&page_size=5`);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应数据:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.code === 0) {
      console.log('   ✅ 全局搜索API测试通过');
      testResults.push({ name: '全局搜索API', status: 'PASS' });
    } else {
      console.log('   ❌ 全局搜索API测试失败');
      testResults.push({ name: '全局搜索API', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 全局搜索API测试异常: ${error.message}`);
    testResults.push({ name: '全局搜索API', status: 'ERROR' });
  }
  
  // 测试3: 用户画像API (无认证)
  console.log('\n3️⃣ 测试用户画像API (无认证)...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/user/profile`);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应数据:`, JSON.stringify(data, null, 2));
    
    // 期望返回401未授权
    if (response.status === 401 && data.code === 40101) {
      console.log('   ✅ 用户画像API认证拦截正常');
      testResults.push({ name: '用户画像API认证', status: 'PASS' });
    } else {
      console.log('   ⚠️  用户画像API认证行为异常');
      testResults.push({ name: '用户画像API认证', status: 'WARN' });
    }
  } catch (error) {
    console.log(`   ❌ 用户画像API测试异常: ${error.message}`);
    testResults.push({ name: '用户画像API认证', status: 'ERROR' });
  }
  
  // 测试4: 文章详情API (测试不存在的文章)
  console.log('\n4️⃣ 测试文章详情API...');
  try {
    const response = await fetch(`${baseUrl}/api/v1/articles/non-existent-id`);
    const data = await response.json();
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应数据:`, JSON.stringify(data, null, 2));
    
    // 期望返回404
    if (response.status === 404 && data.code === 40401) {
      console.log('   ✅ 文章详情API 404处理正常');
      testResults.push({ name: '文章详情API 404', status: 'PASS' });
    } else {
      console.log('   ⚠️  文章详情API 404处理异常');
      testResults.push({ name: '文章详情API 404', status: 'WARN' });
    }
  } catch (error) {
    console.log(`   ❌ 文章详情API测试异常: ${error.message}`);
    testResults.push({ name: '文章详情API 404', status: 'ERROR' });
  }
  
  // 测试5: API路由可达性检查
  console.log('\n5️⃣ 检查API路由结构...');
  const apiRoutes = [
    '/api/v1/feed/hot',
    '/api/v1/search',
    '/api/v1/user/profile',
    '/api/v1/articles/test-id'
  ];
  
  let routeCheckPassed = 0;
  for (const route of apiRoutes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, { method: 'HEAD' });
      if (response.status < 500) { // 只要不是5xx错误就算路由可达
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
    name: 'API路由可达性',
    status: routeCheckPassed === apiRoutes.length ? 'PASS' : 'PARTIAL',
    details: `${routeCheckPassed}/${apiRoutes.length} 路由可达`
  });
  
  // 输出测试总结
  console.log('\n📊 API测试总结报告:');
  console.log('=====================================');
  
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;
  const successRate = Math.round((passCount / totalCount) * 100);
  
  testResults.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
  });
  
  console.log('=====================================');
  console.log(`成功率: ${passCount}/${totalCount} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('🎉 API基础功能测试通过！');
    console.log('\n📋 下一步建议:');
    console.log('1. 配置真实的数据库连接');
    console.log('2. 准备测试数据');
    console.log('3. 开始第二阶段开发');
  } else {
    console.log('⚠️  需要进一步调试API功能');
  }
  
  return {
    successRate,
    testResults,
    recommendations: successRate >= 80 ? 
      ['配置数据库', '准备测试数据', '开始第二阶段'] :
      ['调试API错误', '检查路由配置', '验证数据库连接']
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  testMobileAPIs().then(result => {
    console.log('\n测试完成！');
    process.exit(result.successRate >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('测试过程出错:', error);
    process.exit(1);
  });
}

module.exports = { testMobileAPIs };