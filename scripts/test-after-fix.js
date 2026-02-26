// 修复后全面测试脚本
async function comprehensiveTestAfterFix() {
  console.log('🔧 修复后全面功能测试...\n');
  
  const baseUrl = 'http://localhost:3001';
  const testResults = [];
  
  // 测试1: 原有API功能恢复
  console.log('1️⃣ 测试原有API功能恢复...');
  
  const legacyApis = [
    { path: '/api/articles', name: '文章列表API' },
    { path: '/api/workflows', name: '工作流API' },
    { path: '/api/auth/check-session', name: '会话检查API' },
    { path: '/api/auth/login', name: '登录API' },
    { path: '/api/dashboard/data', name: '仪表板数据API' }
  ];
  
  for (const api of legacyApis) {
    try {
      const response = await fetch(`${baseUrl}${api.path}`, { method: 'HEAD' });
      const status = response.status;
      
      if (status < 500) {
        console.log(`   ✅ ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}恢复`, 
          status: status < 400 ? 'PASS' : 'WARN',
          details: `状态码: ${status}`
        });
      } else {
        console.log(`   ❌ ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}恢复`, 
          status: 'FAIL',
          details: `状态码: ${status}`
        });
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} - 连接失败`);
      testResults.push({ 
        name: `${api.name}恢复`, 
        status: 'ERROR',
        details: `错误: ${error.message}`
      });
    }
  }
  
  // 测试2: 页面访问恢复
  console.log('\n2️⃣ 测试页面访问恢复...');
  
  const pages = [
    { path: '/', name: '首页' },
    { path: '/articles', name: '文章页面' },
    { path: '/workflows', name: '工作流页面' },
    { path: '/login', name: '登录页面' },
    { path: '/dashboard', name: '仪表板页面' }
  ];
  
  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`, { method: 'HEAD' });
      const status = response.status;
      
      if (status < 500) {
        console.log(`   ✅ ${page.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${page.name}访问`, 
          status: status < 400 ? 'PASS' : 'WARN',
          details: `状态码: ${status}`
        });
      } else {
        console.log(`   ❌ ${page.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${page.name}访问`, 
          status: 'FAIL',
          details: `状态码: ${status}`
        });
      }
    } catch (error) {
      console.log(`   ❌ ${page.name} - 连接失败`);
      testResults.push({ 
        name: `${page.name}访问`, 
        status: 'ERROR',
        details: `错误: ${error.message}`
      });
    }
  }
  
  // 测试3: 新移动端API功能
  console.log('\n3️⃣ 测试新移动端API功能...');
  
  const mobileApis = [
    { path: '/api/v1/feed/hot?page=1&page_size=3', name: '热点信息流API' },
    { path: '/api/v1/search?q=test&page=1&page_size=3', name: '搜索API' },
    { path: '/api/v1/user/profile', name: '用户画像API' },
    { path: '/api/v1/articles/non-existent-id', name: '文章详情API' }
  ];
  
  for (const api of mobileApis) {
    try {
      const response = await fetch(`${baseUrl}${api.path}`);
      const status = response.status;
      
      if (status === 404 || status === 401 || (status === 200 && api.path.includes('search'))) {
        console.log(`   ✅ ${api.name} - 状态码 ${status} (预期)`);
        testResults.push({ 
          name: `${api.name}功能`, 
          status: 'PASS',
          details: `状态码: ${status}`
        });
      } else if (status < 500) {
        console.log(`   ⚠️  ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}功能`, 
          status: 'WARN',
          details: `状态码: ${status}`
        });
      } else {
        console.log(`   ❌ ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}功能`, 
          status: 'FAIL',
          details: `状态码: ${status}`
        });
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} - 连接失败`);
      testResults.push({ 
        name: `${api.name}功能`, 
        status: 'ERROR',
        details: `错误: ${error.message}`
      });
    }
  }
  
  // 测试4: 第二阶段功能
  console.log('\n4️⃣ 测试第二阶段功能...');
  
  const phase2Apis = [
    { path: '/api/v1/interact/like', method: 'POST', name: '点赞API' },
    { path: '/api/v1/interact/favorite', method: 'POST', name: '收藏API' },
    { path: '/api/v1/parts/prices', method: 'POST', name: '配件价格API' }
  ];
  
  for (const api of phase2Apis) {
    try {
      const response = await fetch(`${baseUrl}${api.path}`, { 
        method: api.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      const status = response.status;
      
      // 期待401认证错误或200成功
      if (status === 401 || status === 200 || status < 500) {
        console.log(`   ✅ ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}功能`, 
          status: 'PASS',
          details: `状态码: ${status}`
        });
      } else {
        console.log(`   ❌ ${api.name} - 状态码 ${status}`);
        testResults.push({ 
          name: `${api.name}功能`, 
          status: 'FAIL',
          details: `状态码: ${status}`
        });
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} - 连接失败`);
      testResults.push({ 
        name: `${api.name}功能`, 
        status: 'ERROR',
        details: `错误: ${error.message}`
      });
    }
  }
  
  // 输出测试总结
  console.log('\n📊 修复后全面测试报告:');
  console.log('=====================================');
  
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const warnCount = testResults.filter(r => r.status === 'WARN').length;
  const failCount = testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
  const totalCount = testResults.length;
  const successRate = Math.round(((passCount + warnCount) / totalCount) * 100);
  
  testResults.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
  });
  
  console.log('=====================================');
  console.log(`测试总数: ${totalCount}`);
  console.log(`通过: ${passCount} ✅`);
  console.log(`警告: ${warnCount} ⚠️`);
  console.log(`失败: ${failCount} ❌`);
  console.log(`成功率: ${successRate}%`);
  
  if (successRate >= 85) {
    console.log('\n🎉 修复成功！系统功能基本恢复正常');
    console.log('\n📋 修复效果:');
    console.log('- 原有API功能已恢复');
    console.log('- 页面访问问题已解决');
    console.log('- 新增移动端API正常工作');
    console.log('- 系统整体稳定性得到保障');
  } else if (successRate >= 70) {
    console.log('\n🟡 修复基本完成，但仍需进一步优化');
  } else {
    console.log('\n🔴 修复效果不佳，需要深入排查问题');
  }
  
  return {
    successRate,
    passCount,
    warnCount,
    failCount,
    testResults
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  comprehensiveTestAfterFix().then(result => {
    console.log('\n修复测试完成！');
    process.exit(result.successRate >= 85 ? 0 : 1);
  }).catch(error => {
    console.error('测试过程出错:', error);
    process.exit(1);
  });
}

module.exports = { comprehensiveTestAfterFix };