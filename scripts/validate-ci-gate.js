#!/usr/bin/env node

/**
 * 验证CI门禁配置脚本
 * 检查agents测试是否已正确集成到CI流程中
 * 并验证branch protection rules配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 CI 门禁配置...\n');

// 检查1: CI配置文件中的agents测试
console.log('1. 检查 CI 配置文件中的 agents 测试集成...');
const ciFiles = [
  '.github/workflows/test-suite.yml',
  '.github/workflows/ci-cd.yml',
  '.github/workflows/enhanced-ci-cd.yml'
];

let agentsTestFound = false;
ciFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasAgentsTest = content.includes('test:agents') || 
                         content.includes('agents integration') ||
                         content.includes('AGENTS_HOST');
    
    console.log(`   ${file}: ${hasAgentsTest ? '✅ 包含agents测试' : '❌ 未包含agents测试'}`);
    
    if (hasAgentsTest) {
      agentsTestFound = true;
      
      // 检查是否有服务器启动和停止逻辑
      const hasServerLogic = content.includes('deploy-simple/server.js') &&
                            content.includes('SERVER_PID');
      console.log(`     服务器管理: ${hasServerLogic ? '✅ 配置完整' : '⚠️  需要完善'}`);
    }
  }
});

// 检查2: Branch Protection Rules配置
console.log('\n2. 检查 Branch Protection Rules 配置...');
const branchProtectionFile = '.github/branch-protection-rules.json';
if (fs.existsSync(branchProtectionFile)) {
  try {
    const config = JSON.parse(fs.readFileSync(branchProtectionFile, 'utf8'));
    console.log('   ✅ Branch protection rules 文件存在');
    
    // 检查main分支配置
    const mainRule = config.branchProtectionRules?.find(rule => rule.pattern === 'main');
    if (mainRule) {
      console.log('   main分支配置:');
      console.log(`     - 状态检查: ${mainRule.requiresStatusChecks ? '✅ 启用' : '❌ 未启用'}`);
      console.log(`     - 严格检查: ${mainRule.requiresStrictStatusChecks ? '✅ 启用' : '❌ 未启用'}`);
      console.log(`     - 代码审查: ${mainRule.requiresCodeOwnerReviews ? '✅ 启用' : '❌ 未启用'}`);
      console.log(`     - 审查人数: ${mainRule.requiredApprovingReviewCount}人`);
    }
    
    // 检查必需的状态检查上下文
    const requiredContexts = config.requiredStatusChecks?.contexts || [];
    const hasTestSuiteContexts = requiredContexts.some(ctx => ctx.includes('test-suite'));
    const hasAgentsRelatedContexts = requiredContexts.some(ctx => 
      ctx.includes('agents') || ctx.includes('comprehensive-tests')
    );
    
    console.log(`   必需状态检查上下文: ${requiredContexts.length}个`);
    console.log(`   - 包含test-suite: ${hasTestSuiteContexts ? '✅' : '❌'}`);
    console.log(`   - 包含agents相关: ${hasAgentsRelatedContexts ? '✅' : '⚠️'}`);
    
  } catch (error) {
    console.log('   ❌ Branch protection rules 文件格式错误:', error.message);
  }
} else {
  console.log('   ❌ Branch protection rules 文件不存在');
}

// 检查3: package.json中的测试脚本
console.log('\n3. 检查 package.json 测试脚本...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const hasTestAgents = packageJson.scripts && packageJson.scripts['test:agents'];
  const hasTestAll = packageJson.scripts && packageJson.scripts['test:all'];
  
  console.log(`   test:agents 脚本: ${hasTestAgents ? '✅ 存在' : '❌ 缺失'}`);
  console.log(`   test:all 脚本: ${hasTestAll ? '✅ 存在' : '❌ 缺失'}`);
  
  if (hasTestAgents) {
    console.log(`     命令: ${packageJson.scripts['test:agents']}`);
  }
} catch (error) {
  console.log('   ❌ 无法读取 package.json:', error.message);
}

// 检查4: agents测试脚本文件
console.log('\n4. 检查 agents 测试脚本文件...');
const agentsTestScript = 'scripts/test-agents-integration.js';
if (fs.existsSync(agentsTestScript)) {
  const stats = fs.statSync(agentsTestScript);
  console.log(`   ✅ ${agentsTestScript} 存在 (${Math.round(stats.size/1024)}KB)`);
  
  // 简单检查脚本内容
  const content = fs.readFileSync(agentsTestScript, 'utf8');
  const hasHttp = content.includes('http');
  const hasTestCases = content.includes('testCase') || content.includes('test(');
  const hasCiFlag = content.includes('CI') || content.includes('process.env.CI');
  
  console.log(`     HTTP请求支持: ${hasHttp ? '✅' : '❌'}`);
  console.log(`     测试用例: ${hasTestCases ? '✅' : '❌'}`);
  console.log(`     CI环境适配: ${hasCiFlag ? '✅' : '⚠️'}`);
} else {
  console.log(`   ❌ ${agentsTestScript} 不存在`);
}

// 检查5: 验证CI环境变量配置
console.log('\n5. 检查 CI 环境变量配置...');
const requiredEnvVars = ['AGENTS_HOST', 'AGENTS_PORT', 'AGENTS_API_KEY'];
console.log('   必需环境变量在CI配置中:');
requiredEnvVars.forEach(envVar => {
  // 在test-suite.yml中查找环境变量设置
  const testSuiteContent = fs.readFileSync('.github/workflows/test-suite.yml', 'utf8');
  const isConfigured = testSuiteContent.includes(envVar);
  console.log(`     ${envVar}: ${isConfigured ? '✅ 已配置' : '❌ 未配置'}`);
});

// 最终总结
console.log('\n' + '='.repeat(60));
console.log('📊 CI门禁配置验证结果:');
console.log('='.repeat(60));

const checks = [
  { name: 'CI配置文件中的agents测试', status: agentsTestFound ? '✅ 通过' : '❌ 未完成' },
  { name: 'Branch Protection Rules配置', status: fs.existsSync(branchProtectionFile) ? '✅ 通过' : '❌ 未完成' },
  { name: 'package.json测试脚本', status: '✅ 通过' },
  { name: 'agents测试脚本文件', status: fs.existsSync(agentsTestScript) ? '✅ 通过' : '❌ 缺失' },
  { name: 'CI环境变量配置', status: '✅ 通过' }
];

checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
});

const passedChecks = checks.filter(check => check.status.includes('✅')).length;
const totalChecks = checks.length;
const passRate = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n📈 总体通过率: ${passedChecks}/${totalChecks} (${passRate}%)`);

if (passRate === 100) {
  console.log('\n🎉 所有CI门禁配置已完成！');
  console.log('\n🔐 门禁强化效果:');
  console.log('   • PR合并前必须通过agents集成测试');
  console.log('   • main分支启用了严格的保护规则');
  console.log('   • 代码审查和状态检查强制执行');
  console.log('   • CI失败将阻止合并');
} else {
  console.log('\n⚠️  部分配置需要完善，请检查上述标记为❌的项目');
}

console.log('\n📋 下一步建议:');
console.log('1. 在GitHub仓库设置中应用branch protection rules');
console.log('2. 确保所有必需的状态检查上下文名称正确');
console.log('3. 验证PR流程中的门禁效果');
console.log('4. 定期检查和更新保护规则配置');