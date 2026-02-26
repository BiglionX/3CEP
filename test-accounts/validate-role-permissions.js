#!/usr/bin/env node

/**
 * 角色权限自动化验证脚本
 * 批量验证所有角色的权限配置正确性
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONFIG = {
  testEnv: process.env.TEST_ENV || 'development',
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
  headless: process.env.HEADLESS !== 'false',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000')
};

// 读取测试配置
const testData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'generated-test-data.json'), 'utf8')
);

/**
 * 执行单个角色的权限测试
 */
async function testRolePermissions(roleKey, roleData) {
  console.log(`\n🧪 开始测试角色: ${roleData.role_info.name} (${roleKey})`);
  console.log('='.repeat(50));
  
  const results = {
    role: roleKey,
    roleName: roleData.role_info.name,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  // 获取第一个测试账户
  const testAccount = roleData.test_accounts[0];
  if (!testAccount) {
    console.log('❌ 未找到测试账户');
    return results;
  }

  try {
    // 1. API权限测试
    console.log('\n1️⃣ 执行API权限测试...');
    const apiResults = await testApiPermissions(roleKey, testAccount, roleData);
    results.details.push(...apiResults.details);
    results.totalTests += apiResults.totalTests;
    results.passedTests += apiResults.passedTests;
    results.failedTests += apiResults.failedTests;

    // 2. Web界面权限测试
    console.log('\n2️⃣ 执行Web界面权限测试...');
    const webResults = await testWebPermissions(roleKey, testAccount, roleData);
    results.details.push(...webResults.details);
    results.totalTests += webResults.totalTests;
    results.passedTests += webResults.passedTests;
    results.failedTests += webResults.failedTests;

    // 3. 边界权限测试
    console.log('\n3️⃣ 执行边界权限测试...');
    const boundaryResults = await testBoundaryPermissions(roleKey, testAccount, roleData);
    results.details.push(...boundaryResults.details);
    results.totalTests += boundaryResults.totalTests;
    results.passedTests += boundaryResults.passedTests;
    results.failedTests += boundaryResults.failedTests;

  } catch (error) {
    console.log(`❌ 测试执行失败: ${error.message}`);
    results.failedTests++;
    results.details.push({
      test: '整体测试执行',
      status: 'failed',
      error: error.message
    });
  }

  // 输出结果摘要
  console.log('\n📊 测试结果摘要:');
  console.log(`   总测试数: ${results.totalTests}`);
  console.log(`   通过: ${results.passedTests}`);
  console.log(`   失败: ${results.failedTests}`);
  console.log(`   通过率: ${results.totalTests > 0 ? ((results.passedTests / results.totalTests) * 100).toFixed(1) : 0}%`);

  return results;
}

/**
 * API权限测试
 */
async function testApiPermissions(roleKey, account, roleData) {
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  try {
    // 1. 登录获取token
    console.log('   🔐 获取认证令牌...');
    const loginResponse = await fetch(`${CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        password: account.password
      })
    });

    results.totalTests++;
    if (!loginResponse.ok) {
      console.log('   ❌ 登录失败');
      results.failedTests++;
      results.details.push({
        test: 'API登录认证',
        status: 'failed',
        error: `HTTP ${loginResponse.status}: ${loginResponse.statusText}`
      });
      return results;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ 登录成功');

    results.passedTests++;
    results.details.push({
      test: 'API登录认证',
      status: 'passed',
      tokenObtained: !!token
    });

    // 2. 测试授权API访问
    console.log('   🧪 测试API权限...');
    const authorizedApis = getAuthorizedApis(roleKey, account.expected_permissions);
    
    for (const api of authorizedApis.slice(0, 5)) {
      results.totalTests++;
      
      try {
        const response = await fetch(`${CONFIG.baseUrl}${api.endpoint}`, {
          method: api.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // 期望200系列状态码表示成功
        if (response.status >= 200 && response.status < 300) {
          console.log(`   ✅ ${api.method} ${api.endpoint} - 成功`);
          results.passedTests++;
          results.details.push({
            test: `API访问: ${api.method} ${api.endpoint}`,
            status: 'passed',
            statusCode: response.status
          });
        } else if (response.status === 403 || response.status === 401) {
          console.log(`   ⚠️  ${api.method} ${api.endpoint} - 权限拒绝 (这可能不正确)`);
          results.failedTests++;
          results.details.push({
            test: `API访问: ${api.method} ${api.endpoint}`,
            status: 'failed',
            statusCode: response.status,
            note: '权限被意外拒绝'
          });
        } else {
          console.log(`   ⚠️  ${api.method} ${api.endpoint} - 异常状态 ${response.status}`);
          results.details.push({
            test: `API访问: ${api.method} ${api.endpoint}`,
            status: 'warning',
            statusCode: response.status
          });
        }
      } catch (error) {
        console.log(`   ❌ ${api.method} ${api.endpoint} - 请求失败: ${error.message}`);
        results.failedTests++;
        results.details.push({
          test: `API访问: ${api.method} ${api.endpoint}`,
          status: 'failed',
          error: error.message
        });
      }
    }

  } catch (error) {
    console.log(`   ❌ API测试异常: ${error.message}`);
    results.failedTests++;
    results.details.push({
      test: 'API权限测试',
      status: 'failed',
      error: error.message
    });
  }

  return results;
}

/**
 * Web界面权限测试
 */
async function testWebPermissions(roleKey, account, roleData) {
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  // 这部分需要Playwright来执行，这里只是框架
  console.log('   🌐 Web界面测试需要Playwright环境');
  
  results.totalTests++;
  results.details.push({
    test: 'Web界面权限测试框架',
    status: 'skipped',
    note: '需要运行Playwright测试'
  });

  return results;
}

/**
 * 边界权限测试
 */
async function testBoundaryPermissions(roleKey, account, roleData) {
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  // 测试不应该有权限的API
  console.log('   🚫 测试权限边界...');
  const unauthorizedApis = getUnauthorizedApis(roleKey);
  
  for (const api of unauthorizedApis.slice(0, 3)) {
    results.totalTests++;
    
    try {
      // 不登录直接访问，应该被拒绝
      const response = await fetch(`${CONFIG.baseUrl}${api.endpoint}`, {
        method: api.method,
        headers: { 'Content-Type': 'application/json' }
      });

      // 401或403表示权限控制正常工作
      if (response.status === 401 || response.status === 403) {
        console.log(`   ✅ ${api.method} ${api.endpoint} - 正确拒绝未认证访问`);
        results.passedTests++;
        results.details.push({
          test: `边界权限: ${api.method} ${api.endpoint}`,
          status: 'passed',
          statusCode: response.status,
          note: '权限控制正常'
        });
      } else {
        console.log(`   ⚠️  ${api.method} ${api.endpoint} - 未正确拒绝 (${response.status})`);
        results.failedTests++;
        results.details.push({
          test: `边界权限: ${api.method} ${api.endpoint}`,
          status: 'failed',
          statusCode: response.status,
          note: '权限边界控制不足'
        });
      }
    } catch (error) {
      console.log(`   ❌ 边界测试失败: ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: `边界权限测试`,
        status: 'failed',
        error: error.message
      });
    }
  }

  return results;
}

/**
 * 获取角色授权的API列表
 */
function getAuthorizedApis(roleKey, permissions) {
  const apis = [];
  
  permissions.forEach(permission => {
    const [resource, action] = permission.split('_');
    const method = getHttpMethod(action);
    const endpoint = `/api/${resource}`;
    
    apis.push({ endpoint, method, resource, action });
  });
  
  return apis;
}

/**
 * 获取角色不应该访问的API列表
 */
function getUnauthorizedApis(roleKey) {
  const allResources = ['users', 'content', 'shops', 'payments', 'settings'];
  const unauthorized = [];
  
  // 简化处理：假设某些高权限API不应该被低级别角色访问
  const restrictedEndpoints = {
    viewer: ['/api/users', '/api/settings', '/api/payments'],
    warehouse_operator: ['/api/users', '/api/settings', '/api/content'],
    procurement_specialist: ['/api/users', '/api/settings']
  };
  
  const restricted = restrictedEndpoints[roleKey] || [];
  
  restricted.forEach(endpoint => {
    unauthorized.push({ endpoint, method: 'DELETE' });
    unauthorized.push({ endpoint, method: 'POST' });
  });
  
  return unauthorized;
}

/**
 * 根据权限动作获取HTTP方法
 */
function getHttpMethod(action) {
  const methodMap = {
    'read': 'GET',
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'approve': 'PATCH'
  };
  return methodMap[action] || 'GET';
}

/**
 * 生成测试报告
 */
function generateTestReport(allResults) {
  const report = {
    generatedAt: new Date().toISOString(),
    environment: CONFIG.testEnv,
    baseUrl: CONFIG.baseUrl,
    summary: {
      totalRoles: Object.keys(allResults).length,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0
    },
    roleResults: allResults,
    recommendations: []
  };

  // 计算汇总统计
  Object.values(allResults).forEach(roleResult => {
    report.summary.totalTests += roleResult.totalTests;
    report.summary.passedTests += roleResult.passedTests;
    report.summary.failedTests += roleResult.failedTests;
  });

  if (report.summary.totalTests > 0) {
    report.summary.passRate = ((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(2);
  }

  // 生成建议
  if (report.summary.passRate < 90) {
    report.recommendations.push('权限测试通过率较低，建议检查RBAC配置');
  }

  Object.entries(allResults).forEach(([roleKey, result]) => {
    if (result.failedTests > 0) {
      report.recommendations.push(`角色 ${result.roleName} 存在 ${result.failedTests} 个失败测试，请检查相关权限配置`);
    }
  });

  // 保存报告
  const reportPath = path.join(__dirname, `role-permission-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return { report, reportPath };
}

/**
 * 主测试函数
 */
async function runAllRoleTests() {
  console.log('🚀 FixCycle 角色权限自动化验证');
  console.log('====================================');
  console.log(`测试环境: ${CONFIG.testEnv}`);
  console.log(`基础URL: ${CONFIG.baseUrl}`);
  console.log(`超时设置: ${CONFIG.timeout}ms\n`);

  const allResults = {};
  
  // 按顺序测试每个角色
  for (const [roleKey, roleData] of Object.entries(testData.roles)) {
    const roleResults = await testRolePermissions(roleKey, roleData);
    allResults[roleKey] = roleResults;
    
    // 短暂延迟避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 生成最终报告
  const { report, reportPath } = generateTestReport(allResults);
  
  // 输出最终结果
  console.log('\n🏆 最终测试报告');
  console.log('==================');
  console.log(`总角色数: ${report.summary.totalRoles}`);
  console.log(`总测试数: ${report.summary.totalTests}`);
  console.log(`通过测试: ${report.summary.passedTests}`);
  console.log(`失败测试: ${report.summary.failedTests}`);
  console.log(`通过率: ${report.summary.passRate}%`);
  console.log(`报告文件: ${reportPath}`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 建议改进项:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  // 返回测试结果供CI使用
  process.exit(report.summary.passRate >= 95 ? 0 : 1);
}

// 执行测试
if (require.main === module) {
  runAllRoleTests().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  testRolePermissions,
  runAllRoleTests,
  generateTestReport
};