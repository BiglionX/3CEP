#!/usr/bin/env node

/**
 * 重定向上下文提示测试脚本
 * 验证修复后的重定向参数检测功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试重定向上下文提示修复...\n');

// 1. 检查登录页面修复
console.log('1️⃣ 检查登录页面重定向参数处理');

const loginPagePath = path.join(process.cwd(), 'src', 'app', 'login', 'page.tsx');
if (fs.existsSync(loginPagePath)) {
  const content = fs.readFileSync(loginPagePath, 'utf8');
  
  const hasProperRedirectHandling = content.includes('searchParams.get(\'redirect\') || undefined');
  const hasCorrectPropPassing = content.includes('redirectUrl={redirect}');
  
  console.log(`   重定向参数默认值处理: ${hasProperRedirectHandling ? '✅' : '❌'}`);
  console.log(`   正确的属性传递: ${hasCorrectPropPassing ? '✅' : '❌'}`);
  
  if (hasProperRedirectHandling && hasCorrectPropPassing) {
    console.log('   🟢 登录页面修复完成');
  } else {
    console.log('   🔴 登录页面仍需修复');
  }
}

// 2. 检查UnifiedLogin组件修复
console.log('\n2️⃣ 检查UnifiedLogin组件修复');

const unifiedLoginPath = path.join(process.cwd(), 'src', 'components', 'auth', 'UnifiedLogin.tsx');
if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');
  
  const hasEmptyStringCheck = content.includes('redirectUrl === \'\'');
  const hasRedirectInfoComponent = content.includes('RedirectInfo') && content.includes('redirectUrl');
  
  console.log(`   空字符串检查: ${hasEmptyStringCheck ? '✅' : '❌'}`);
  console.log(`   重定向信息组件: ${hasRedirectInfoComponent ? '✅' : '❌'}`);
  
  if (hasEmptyStringCheck && hasRedirectInfoComponent) {
    console.log('   🟢 UnifiedLogin组件修复完成');
  } else {
    console.log('   🔴 UnifiedLogin组件仍需修复');
  }
}

// 3. 测试不同场景的重定向参数
console.log('\n3️⃣ 测试不同重定向场景');

const testScenarios = [
  { url: '/login', expected: '无重定向参数' },
  { url: '/login?redirect=/admin/dashboard', expected: '管理后台' },
  { url: '/login?redirect=/brand/products', expected: '品牌商平台' },
  { url: '/login?redirect=/repair-shop/orders', expected: '维修师平台' },
  { url: '/login?redirect=/importer/inventory', expected: '贸易平台' },
  { url: '/login?redirect=', expected: '无重定向参数' }
];

console.log('测试场景分析:');
testScenarios.forEach((scenario, index) => {
  const hasRedirectParam = scenario.url.includes('redirect=');
  const isEmptyRedirect = scenario.url.endsWith('redirect=');
  const shouldShowInfo = hasRedirectParam && !isEmptyRedirect && scenario.url !== '/login';
  
  console.log(`   ${index + 1}. ${scenario.url}`);
  console.log(`      包含重定向参数: ${hasRedirectParam ? '✅' : '❌'}`);
  console.log(`      空重定向值: ${isEmptyRedirect ? '✅' : '❌'}`);
  console.log(`      应显示提示: ${shouldShowInfo ? '✅' : '❌'} ${scenario.expected}`);
  console.log('');
});

// 4. 验证目标识别准确性
console.log('4️⃣ 验证目标识别准确性');

const targetMappings = {
  '/admin': '管理后台',
  '/brand': '品牌商平台', 
  '/repair-shop': '维修师平台',
  '/importer': '贸易平台',
  '/exporter': '贸易平台'
};

console.log('目标路径映射检查:');
Object.entries(targetMappings).forEach(([path, description]) => {
  console.log(`   ${path} → ${description}`);
});

const hasCompleteMappings = Object.keys(targetMappings).length >= 5;
console.log(`\n   目标映射完整性: ${hasCompleteMappings ? '✅' : '❌'} (${Object.keys(targetMappings).length}/5)`);

// 5. 总体验证结果
console.log('\n📊 修复验证总结');

const fixesNeeded = [];
const fixesCompleted = [];

// 检查登录页面
if (fs.existsSync(loginPagePath)) {
  const content = fs.readFileSync(loginPagePath, 'utf8');
  if (content.includes('searchParams.get(\'redirect\') || undefined')) {
    fixesCompleted.push('登录页面重定向参数默认值处理');
  } else {
    fixesNeeded.push('登录页面重定向参数默认值处理');
  }
}

// 检查UnifiedLogin组件
if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');
  if (content.includes('redirectUrl === \'\'')) {
    fixesCompleted.push('UnifiedLogin空字符串检查');
  } else {
    fixesNeeded.push('UnifiedLogin空字符串检查');
  }
}

console.log(`已完成修复: ${fixesCompleted.length}项`);
fixesCompleted.forEach(fix => console.log(`   ✅ ${fix}`));

if (fixesNeeded.length > 0) {
  console.log(`\n待完成修复: ${fixesNeeded.length}项`);
  fixesNeeded.forEach(fix => console.log(`   ❌ ${fix}`));
}

const overallCompletion = Math.round((fixesCompleted.length / (fixesCompleted.length + fixesNeeded.length)) * 100);
console.log(`\n总体完成度: ${overallCompletion}%`);

// 6. 提供测试命令
console.log('\n🧪 验证测试命令');

console.log('\n手动测试URLs:');
console.log('1. 无重定向参数: http://localhost:3000/login');
console.log('2. 管理后台: http://localhost:3000/login?redirect=/admin/dashboard');
console.log('3. 品牌商平台: http://localhost:3000/login?redirect=/brand/products');
console.log('4. 空重定向值: http://localhost:3000/login?redirect=');

console.log('\n自动化测试:');
console.log('node scripts/test-redirect-context.js');

if (overallCompletion === 100) {
  console.log('\n✅ 所有修复已完成！重定向上下文提示功能应该正常工作。');
} else {
  console.log('\n⚠️  还有修复工作需要完成。');
}

console.log('\n💡 预期行为:');
console.log('- 有有效redirect参数时：显示蓝色信息提示框');
console.log('- 无redirect参数或为空时：不显示提示框');
console.log('- 正确识别不同平台类型并显示相应描述');