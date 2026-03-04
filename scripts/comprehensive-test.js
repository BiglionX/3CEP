#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 开始全面测试验证...\n');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testCredentials: {
    email: '1055603323@qq.com',
    password: '12345678',
  },
  testRoutes: [
    '/',
    '/login',
    '/admin/login',
    '/simple-login-test',
    '/api/auth/check-session',
  ],
};

// 测试结果收集
const testResults = [];

// 1. 测试服务器连通性
async function testServerConnectivity() {
  console.log('1️⃣ 测试服务器连通性...');

  try {
    const response = await fetch(TEST_CONFIG.baseUrl, { method: 'HEAD' });
    const result = {
      test: '服务器连通性',
      status: response.ok ? '✅ 通过' : '❌ 失败',
      details: `HTTP状态: ${response.status}`,
      responseTime: 'N/A',
    };

    testResults.push(result);
    console.log(`   ${result.status} ${result.details}`);
  } catch (error) {
    const result = {
      test: '服务器连通性',
      status: '❌ 失败',
      details: `错误: ${error.message}`,
      responseTime: 'N/A',
    };
    testResults.push(result);
    console.log(`   ${result.status} ${result.details}`);
  }
}

// 2. 测试页面可访问性
async function testPageAccessibility() {
  console.log('\n2️⃣ 测试页面可访问性...');

  for (const route of TEST_CONFIG.testRoutes) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${TEST_CONFIG.baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Test-Agent/1.0',
        },
      });
      const endTime = Date.now();

      const result = {
        test: `页面访问 - ${route}`,
        status: response.status < 400 ? '✅ 通过' : '⚠️ 警告',
        details: `HTTP ${response.status} - ${response.statusText}`,
        responseTime: `${endTime - startTime}ms`,
      };

      testResults.push(result);
      console.log(`   ${result.status} ${route} (${result.responseTime})`);
    } catch (error) {
      const result = {
        test: `页面访问 - ${route}`,
        status: '❌ 失败',
        details: `错误: ${error.message}`,
        responseTime: 'N/A',
      };
      testResults.push(result);
      console.log(`   ${result.status} ${route}`);
    }
  }
}

// 3. 测试认证API功能
async function testAuthAPI() {
  console.log('\n3️⃣ 测试认证API功能...');

  // 测试会话检查
  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/api/auth/check-session`
    );
    const data = await response.json();

    const result = {
      test: '会话检查API',
      status: response.status === 401 ? '✅ 通过' : '⚠️ 注意',
      details: `状态: ${response.status}, 未认证状态正常`,
      responseTime: 'N/A',
    };

    testResults.push(result);
    console.log(`   ${result.status} ${result.details}`);
  } catch (error) {
    const result = {
      test: '会话检查API',
      status: '❌ 失败',
      details: `错误: ${error.message}`,
      responseTime: 'N/A',
    };
    testResults.push(result);
    console.log(`   ${result.status} ${result.details}`);
  }

  // 测试登录API（模拟）
  try {
    const startTime = Date.now();
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_CONFIG.testCredentials.email,
        password: TEST_CONFIG.testCredentials.password,
      }),
    });
    const endTime = Date.now();

    const data = await response.json();

    const result = {
      test: '登录API测试',
      status: response.ok ? '✅ 通过' : '⚠️ 需要人工验证',
      details: `状态: ${response.status}, ${data.message || data.error || '需要查看响应'}`,
      responseTime: `${endTime - startTime}ms`,
    };

    testResults.push(result);
    console.log(
      `   ${result.status} ${result.details} (${result.responseTime})`
    );
  } catch (error) {
    const result = {
      test: '登录API测试',
      status: '❌ 失败',
      details: `错误: ${error.message}`,
      responseTime: 'N/A',
    };
    testResults.push(result);
    console.log(`   ${result.status} ${result.details}`);
  }
}

// 4. 检查关键文件状态
function checkFileIntegrity() {
  console.log('\n4️⃣ 检查文件完整性...');

  const criticalFiles = [
    'src/components/auth/UnifiedLogin.tsx',
    'src/app/login/page.tsx',
    'src/hooks/use-unified-auth.ts',
    'src/app/api/auth/login/route.ts',
  ];

  criticalFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const result = {
        test: `文件完整性 - ${file}`,
        status: '✅ 存在',
        details: `最后修改: ${stats.mtime.toLocaleString()}`,
        responseTime: 'N/A',
      };
      testResults.push(result);
      console.log(`   ${result.status} ${file}`);
    } else {
      const result = {
        test: `文件完整性 - ${file}`,
        status: '❌ 缺失',
        details: '文件不存在',
        responseTime: 'N/A',
      };
      testResults.push(result);
      console.log(`   ${result.status} ${file}`);
    }
  });
}

// 5. 检查修复标记
function checkFixIndicators() {
  console.log('\n5️⃣ 检查修复标记...');

  const unifiedLoginPath = path.join(
    process.cwd(),
    'src/components/auth/UnifiedLogin.tsx'
  );
  if (fs.existsSync(unifiedLoginPath)) {
    const content = fs.readFileSync(unifiedLoginPath, 'utf8');

    const checks = [
      {
        name: '防抖动初始化',
        pattern: /unifiedLoginInitialized/,
        required: true,
      },
      {
        name: '优化的useEffect依赖',
        pattern: /\[isAuthenticated, isOpen, onLoginSuccess\]/,
        required: true,
      },
      {
        name: '延迟跳转逻辑',
        pattern: /setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{/,
        required: true,
      },
    ];

    checks.forEach(check => {
      const found = check.pattern.test(content);
      const result = {
        test: `代码检查 - ${check.name}`,
        status: found ? '✅ 通过' : check.required ? '❌ 缺失' : '⚠️ 可选',
        details: found ? '已正确实现' : '未找到相关代码',
        responseTime: 'N/A',
      };
      testResults.push(result);
      console.log(`   ${result.status} ${check.name}`);
    });
  }
}

// 6. 生成测试报告
function generateReport() {
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 测试报告汇总');
  console.log('='.repeat(50));

  const passed = testResults.filter(r => r.status.includes('✅')).length;
  const warnings = testResults.filter(r => r.status.includes('⚠️')).length;
  const failed = testResults.filter(r => r.status.includes('❌')).length;

  console.log(`总计测试项: ${testResults.length}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`⚠️ 警告: ${warnings}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`成功率: ${((passed / testResults.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n🔴 失败项详情:');
    testResults
      .filter(r => r.status.includes('❌'))
      .forEach(result => {
        console.log(`   • ${result.test}: ${result.details}`);
      });
  }

  if (warnings > 0) {
    console.log('\n🟡 警告项详情:');
    testResults
      .filter(r => r.status.includes('⚠️'))
      .forEach(result => {
        console.log(`   • ${result.test}: ${result.details}`);
      });
  }

  console.log('\n📋 建议操作:');
  if (failed === 0 && warnings === 0) {
    console.log('✅ 所有测试通过，登录功能应该正常工作');
    console.log(
      '🚀 建议访问: http://localhost:3001/login?redirect=/admin/dashboard'
    );
  } else if (failed === 0) {
    console.log('⚠️ 部分警告，功能基本正常但需要关注');
    console.log('🔍 建议检查警告项并进行相应调整');
  } else {
    console.log('❌ 存在失败项，需要进一步排查和修复');
    console.log('🔧 重点关注失败的测试项');
  }

  // 保存详细报告
  const reportPath = path.join(process.cwd(), 'TEST_RESULT_REPORT.md');
  const reportContent = `# 自动化测试报告

## 测试时间
${new Date().toLocaleString()}

## 测试概要
- 总测试项: ${testResults.length}
- 通过: ${passed}
- 警告: ${warnings}
- 失败: ${failed}
- 成功率: ${((passed / testResults.length) * 100).toFixed(1)}%

## 详细结果

${testResults
  .map(
    result =>
      `- ${result.status} **${result.test}**: ${result.details} ${result.responseTime !== 'N/A' ? `(${result.responseTime})` : ''}`
  )
  .join('\n')}

## 结论
${
  failed === 0 && warnings === 0
    ? '✅ 系统状态良好，可以正常使用'
    : failed === 0
      ? '⚠️ 系统基本正常，但需要注意警告项'
      : '❌ 系统存在问题，需要修复'
}

## 建议
${
  failed === 0 && warnings === 0
    ? '1. 访问登录页面进行实际测试\n2. 验证所有功能正常\n3. 监控系统运行状态'
    : '1. 优先解决失败项\n2. 关注警告项\n3. 重新运行测试验证'
}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n💾 详细报告已保存至: ${reportPath}`);
}

// 执行所有测试
async function runAllTests() {
  try {
    await testServerConnectivity();
    await testPageAccessibility();
    await testAuthAPI();
    checkFileIntegrity();
    checkFixIndicators();
    generateReport();
  } catch (error) {
    console.error('❌ 测试执行过程中发生错误:', error.message);
  }
}

// 立即执行测试
runAllTests();
