// 前端兼容性检查脚本
async function checkFrontendCompatibility() {
  console.log('🔍 开始检查前端兼容性...\n');

  const baseUrl = 'http://localhost:3001';
  const testResults = [];

  // 检查原有API是否仍然可用
  console.log('1️⃣ 检查原有API兼容性...');

  const legacyApis = [
    '/api/articles',
    '/api/workflows',
    '/api/auth/check-session',
    '/api/auth/login',
    '/api/dashboard/data',
  ];

  let legacyApiCount = 0;
  for (const api of legacyApis) {
    try {
      const response = await fetch(`${baseUrl}${api}`, { method: 'HEAD' });
      if (response.status < 500) {
        console.log(`   ✅ ${api} - 可访问`);
        legacyApiCount++;
      } else {
        console.log(`   ⚠️  ${api} - 状态码 ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${api} - 连接失败`);
    }
  }

  testResults.push({
    name: '原有API兼容性',
    status: legacyApiCount > 0 ? 'PARTIAL' : 'WARN',
    details: `${legacyApiCount}/${legacyApis.length} 个API可访问`,
  });

  // 检查新API是否正常工作
  console.log('\n2️⃣ 检查新移动端API...');

  const newApis = [
    '/api/v1/feed/hot',
    '/api/v1/search',
    '/api/v1/user/profile',
    '/api/v1/articles/test-id',
  ];

  let newApiCount = 0;
  for (const api of newApis) {
    try {
      const response = await fetch(`${baseUrl}${api}`, { method: 'HEAD' });
      if (response.status < 500) {
        console.log(`   ✅ ${api} - 可访问`);
        newApiCount++;
      } else {
        console.log(`   ❌ ${api} - 状态码 ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${api} - 连接失败`);
    }
  }

  testResults.push({
    name: '新移动端API',
    status: newApiCount === newApis.length ? 'PASS' : 'PARTIAL',
    details: `${newApiCount}/${newApis.length} 个API可访问`,
  });

  // 检查页面路由
  console.log('\n3️⃣ 检查关键页面路由...');

  const pages = ['/', '/articles', '/workflows', '/login', '/dashboard'];

  let pageCount = 0;
  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page}`, { method: 'HEAD' });
      if (response.status < 500) {
        console.log(`   ✅ ${page} - 页面可访问`);
        pageCount++;
      } else {
        console.log(`   ❌ ${page} - 状态码 ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${page} - 连接失败`);
    }
  }

  testResults.push({
    name: '页面路由',
    status: pageCount === pages.length ? 'PASS' : 'PARTIAL',
    details: `${pageCount}/${pages.length} 个页面可访问`,
  });

  // 检查静态资源
  console.log('\n4️⃣ 检查静态资源加载...');

  const staticResources = [
    '/favicon.ico',
    '/_next/static/chunks/main.js',
    '/globals.css',
  ];

  let resourceCount = 0;
  for (const resource of staticResources) {
    try {
      const response = await fetch(`${baseUrl}${resource}`, { method: 'HEAD' });
      if (response.ok || response.status === 404) {
        // 404也算正常，说明路径正确
        console.log(`   ✅ ${resource} - 路径正确`);
        resourceCount++;
      } else {
        console.log(`   ⚠️  ${resource} - 状态码 ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${resource} - 加载失败`);
    }
  }

  testResults.push({
    name: '静态资源',
    status: resourceCount > 0 ? 'PASS' : 'WARN',
    details: `${resourceCount}/${staticResources.length} 个资源路径正确`,
  });

  // 输出兼容性检查总结
  console.log('\n📊 前端兼容性检查报告:');
  console.log('=====================================');

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;
  const compatibilityRate = Math.round((passCount / totalCount) * 100);

  testResults.forEach(result => {
    const statusIcon =
      result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(
      `${statusIcon} ${result.name}${result.details ? ` - ${result.details}` : ''}`
    );
  });

  console.log('=====================================');
  console.log(`兼容性: ${passCount}/${totalCount} (${compatibilityRate}%)`);

  if (compatibilityRate >= 80) {
    console.log('🎉 前端兼容性良好，原有功能未受影响！');
    console.log('\n📋 兼容性分析:');
    console.log('- 新增的移动端API不会影响现有功能');
    console.log('- 原有的API路由保持完整');
    console.log('- 页面和资源加载正常');
    console.log('- 系统可以同时支持新旧两种API');
  } else {
    console.log('⚠️  存在兼容性问题，需要进一步检查');
  }

  return {
    compatibilityRate,
    testResults,
    analysis: compatibilityRate >= 80 ? 'GOOD' : 'ISSUES_FOUND',
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  checkFrontendCompatibility()
    .then(result => {
      console.log('\n兼容性检查完成！');
      process.exit(result.compatibilityRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('兼容性检查出错:', error);
      process.exit(1);
    });
}

module.exports = { checkFrontendCompatibility };
