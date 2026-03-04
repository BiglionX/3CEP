#!/usr/bin/env node

/**
 * 速率限制功能手动测试脚本
 * 验证限流配置和基本功能
 */

console.log('🚀 开始速率限制功能测试...\n');

// 测试配置规则匹配
const { getMatchingRateLimitRules } = require('../config/ratelimit.config.ts');

function testRuleMatching() {
  console.log('📋 测试规则匹配功能...\n');

  const testCases = [
    {
      path: '/api/procurement-intelligence/supplier-profiling/test',
      method: 'POST',
      expected: 'supplier-profiling-rate-limit',
    },
    {
      path: '/api/auth/login',
      method: 'POST',
      expected: 'auth-sensitive-rate-limit',
    },
    {
      path: '/api/enterprise/dashboard',
      method: 'GET',
      expected: 'enterprise-api-rate-limit',
    },
    {
      path: '/api/admin/users',
      method: 'GET',
      expected: 'admin-api-rate-limit',
    },
    {
      path: '/login',
      method: 'POST',
      expected: 'login-rate-limit',
    },
    {
      path: '/api/auth/register',
      method: 'POST',
      expected: 'register-rate-limit',
    },
  ];

  let passedTests = 0;
  const totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.method} ${testCase.path}`);
    const rules = getMatchingRateLimitRules(testCase.path, testCase.method);

    if (rules.length > 0) {
      const matchedRule = rules[0];
      console.log(`  ✓ 匹配到规则: ${matchedRule.name}`);
      console.log(`  ✓ 限流类型: ${matchedRule.type}`);
      console.log(`  ✓ 限制次数: ${matchedRule.config.maxRequests}/分钟`);
      console.log(
        `  ✓ 封禁时长: ${matchedRule.config.banDuration / 1000 / 60}分钟`
      );

      if (matchedRule.name === testCase.expected) {
        console.log(`  ✅ 测试通过`);
        passedTests++;
      } else {
        console.log(
          `  ❌ 期望规则: ${testCase.expected}, 实际: ${matchedRule.name}`
        );
      }
    } else {
      console.log(`  ❌ 未匹配到任何规则`);
    }
    console.log('');
  });

  console.log(`📊 规则匹配测试结果: ${passedTests}/${totalTests} 通过\n`);
  return passedTests === totalTests;
}

function testConfigurationStructure() {
  console.log('⚙️  测试配置结构...\n');

  const rules = getMatchingRateLimitRules('/api/test', 'GET');
  let isValid = true;

  rules.forEach((rule, index) => {
    console.log(`规则 ${index + 1}: ${rule.name}`);

    // 检查必需字段
    const requiredFields = ['name', 'pathPattern', 'config', 'type', 'enabled'];
    const missingFields = requiredFields.filter(field => !(field in rule));

    if (missingFields.length > 0) {
      console.log(`  ❌ 缺少字段: ${missingFields.join(', ')}`);
      isValid = false;
    } else {
      console.log(`  ✓ 所有必需字段存在`);
    }

    // 检查配置结构
    if (rule.config) {
      const configFields = ['windowMs', 'maxRequests'];
      const missingConfigFields = configFields.filter(
        field => !(field in rule.config)
      );

      if (missingConfigFields.length > 0) {
        console.log(`  ❌ 配置缺少字段: ${missingConfigFields.join(', ')}`);
        isValid = false;
      } else {
        console.log(`  ✓ 配置结构正确`);
        console.log(`    - 时间窗口: ${rule.config.windowMs}ms`);
        console.log(`    - 最大请求数: ${rule.config.maxRequests}`);
        console.log(
          `    - 封禁时长: ${rule.config.banDuration ? `${rule.config.banDuration / 1000 / 60}分钟` : '无'}`
        );
      }
    }

    console.log('');
  });

  return isValid;
}

function testDifferentTypes() {
  console.log('🏷️  测试不同类型限流...\n');

  const typeTests = [
    { path: '/api/auth/login', method: 'POST', expectedType: 'auth' },
    {
      path: '/api/procurement-intelligence/risk-analysis',
      method: 'POST',
      expectedType: 'sensitive',
    },
    { path: '/api/search?q=test', method: 'GET', expectedType: 'search' },
    { path: '/api/general-endpoint', method: 'GET', expectedType: 'api' },
  ];

  let passed = 0;
  typeTests.forEach(test => {
    const rules = getMatchingRateLimitRules(test.path, test.method);
    if (rules.length > 0 && rules[0].type === test.expectedType) {
      console.log(`✓ ${test.method} ${test.path} -> ${test.expectedType} 类型`);
      passed++;
    } else {
      console.log(
        `✗ ${test.method} ${test.path} -> 期望: ${test.expectedType}, 实际: ${rules[0]?.type || '无'}`
      );
    }
  });

  console.log(`\n📊 类型测试结果: ${passed}/${typeTests.length} 通过\n`);
  return passed === typeTests.length;
}

function main() {
  console.log('🔐 速率限制保护功能验证报告\n');
  console.log('='.repeat(50));

  const results = {
    ruleMatching: testRuleMatching(),
    configStructure: testConfigurationStructure(),
    typeTesting: testDifferentTypes(),
  };

  console.log('📈 最终测试结果:');
  console.log('='.repeat(30));
  console.log(`规则匹配测试: ${results.ruleMatching ? '✅ 通过' : '❌ 失败'}`);
  console.log(
    `配置结构测试: ${results.configStructure ? '✅ 通过' : '❌ 失败'}`
  );
  console.log(`类型分类测试: ${results.typeTesting ? '✅ 通过' : '❌ 失败'}`);

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 总体结果: ${totalPassed}/${totalTests} 测试通过`);

  if (totalPassed === totalTests) {
    console.log('\n🎉 所有测试通过！速率限制功能配置正确。');
    console.log('\n📝 功能总结:');
    console.log('  • 已配置多层级限流策略');
    console.log('  • 支持API/敏感操作/认证/搜索等不同类型');
    console.log('  • 实现了自适应限流规则匹配');
    console.log('  • 具备封禁机制防止恶意请求');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
  }
}

// 运行测试
main();
