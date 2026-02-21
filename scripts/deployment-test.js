#!/usr/bin/env node

/**
 * 🚀 FixCycle 部署测试脚本
 * 执行完整的部署前验证和测试
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 FixCycle 部署测试启动\n');

// 测试配置
const TEST_CONFIG = {
  timeout: 30000,
  retryAttempts: 3
};

// 测试结果收集
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(name, status, message = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} ${name}${message ? ` - ${message}` : ''}`);
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  testResults.details.push({ name, status, message });
}

function runCommand(command, description) {
  try {
    console.log(`\n🔧 执行: ${description}`);
    const result = execSync(command, { 
      stdio: 'pipe',
      timeout: TEST_CONFIG.timeout 
    });
    logTest(description, 'PASS');
    return { success: true, output: result.toString() };
  } catch (error) {
    logTest(description, 'FAIL', error.message.substring(0, 100));
    return { success: false, error: error.message };
  }
}

// 1. 环境配置检查
console.log('📋 第一阶段：环境配置检查');

function checkEnvironmentVariables() {
  console.log('\n🔐 环境变量验证:');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV'
  ];
  
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    logTest('环境文件读取', 'FAIL', '无法读取.env文件');
    return false;
  }
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    const hasValue = envContent.includes(`${varName}=`) && 
                     !envContent.includes(`${varName}=your_`) &&
                     !envContent.includes(`${varName}=YOUR_`);
    
    if (hasVar && hasValue) {
      logTest(`${varName}`, 'PASS');
    } else {
      logTest(`${varName}`, 'FAIL', hasVar ? '值为占位符' : '未配置');
      allPresent = false;
    }
  });
  
  return allPresent;
}

// 2. 依赖和构建检查
console.log('\n🏗️ 第二阶段：依赖和构建检查');

function checkDependencies() {
  console.log('\n📦 依赖检查:');
  
  // 检查 package.json
  const pkgPath = path.join(__dirname, '..', 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    logTest('package.json 格式', 'PASS');
    
    // 检查关键依赖
    const keyDeps = ['next', '@supabase/supabase-js', 'react'];
    keyDeps.forEach(dep => {
      const hasDep = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
      logTest(`依赖 ${dep}`, hasDep ? 'PASS' : 'FAIL');
    });
    
  } catch (error) {
    logTest('package.json 解析', 'FAIL', error.message);
    return false;
  }
  
  return true;
}

function testBuild() {
  console.log('\n🔨 构建测试:');
  
  // 清理之前的构建
  runCommand('rimraf .next', '清理构建目录');
  
  // 执行构建
  const buildResult = runCommand('npm run build', '生产构建');
  
  if (buildResult.success) {
    // 检查构建产物
    const nextDir = path.join(__dirname, '..', '.next');
    const hasBuild = fs.existsSync(nextDir);
    logTest('构建产物生成', hasBuild ? 'PASS' : 'FAIL');
    
    if (hasBuild) {
      const buildSize = getDirectorySize(nextDir);
      logTest('构建大小检查', buildSize < 100 * 1024 * 1024 ? 'PASS' : 'WARN', 
              `大小: ${(buildSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  return buildResult.success;
}

// 3. 代码质量检查
console.log('\n🔍 第三阶段：代码质量检查');

function checkCodeQuality() {
  console.log('\n🧾 代码规范检查:');
  
  // 检查 TypeScript 编译
  const tsResult = runCommand('npx tsc --noEmit', 'TypeScript 编译检查');
  
  // 检查 ESLint（如果有配置）
  const eslintConfig = path.join(__dirname, '..', '.eslintrc.js');
  if (fs.existsSync(eslintConfig)) {
    runCommand('npx eslint . --ext .ts,.tsx --quiet', 'ESLint 检查');
  } else {
    logTest('ESLint 检查', 'SKIP', '未配置 ESLint');
  }
  
  return tsResult.success;
}

// 4. 安全检查
console.log('\n🛡️ 第四阶段：安全检查');

function checkSecurity() {
  console.log('\n🔒 安全配置检查:');
  
  // 检查敏感信息泄露
  const filesToCheck = ['.env', '.env.local', 'next.config.js'];
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasSensitive = content.includes('your_actual') || 
                          content.includes('YOUR_ACTUAL') ||
                          content.includes('placeholder');
      logTest(`${file} 敏感信息`, hasSensitive ? 'FAIL' : 'PASS');
    }
  });
  
  // 检查安全头配置
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    const hasSecurityHeaders = content.includes('headers') || 
                              content.includes('security');
    logTest('安全头配置', hasSecurityHeaders ? 'PASS' : 'WARN');
  }
  
  return true;
}

// 5. 性能基准测试
console.log('\n⚡ 第五阶段：性能基准测试');

function runPerformanceTests() {
  console.log('\n🏃 性能测试:');
  
  // 模拟简单的性能测试
  const startTime = Date.now();
  
  // 执行一些基本操作
  for (let i = 0; i < 1000; i++) {
    // 模拟计算密集型操作
    Math.sqrt(i * Math.PI);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  logTest('基础性能测试', duration < 100 ? 'PASS' : 'WARN', 
          `耗时: ${duration}ms`);
  
  return true;
}

// 辅助函数
function getDirectorySize(dirPath) {
  let size = 0;
  
  function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        walk(itemPath);
      } else {
        size += stat.size;
      }
    });
  }
  
  try {
    walk(dirPath);
  } catch (error) {
    console.warn('无法计算目录大小:', error.message);
  }
  
  return size;
}

// 主执行流程
async function runDeploymentTests() {
  console.log('🎯 开始 FixCycle 部署前全面测试\n');
  
  // 执行各个测试阶段
  const envCheck = checkEnvironmentVariables();
  const depCheck = checkDependencies();
  const buildCheck = testBuild();
  const qualityCheck = checkCodeQuality();
  const securityCheck = checkSecurity();
  const perfCheck = runPerformanceTests();
  
  // 汇总结果
  console.log('\n📊 测试结果汇总:');
  console.log(`  总测试数: ${testResults.total}`);
  console.log(`  通过: ${testResults.passed}`);
  console.log(`  失败: ${testResults.failed}`);
  console.log(`  通过率: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  // 详细结果
  console.log('\n📋 详细测试结果:');
  testResults.details.forEach(detail => {
    const statusIcon = detail.status === 'PASS' ? '✅' : 
                      detail.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${statusIcon} ${detail.name}${detail.message ? ` (${detail.message})` : ''}`);
  });
  
  // 部署建议
  const canDeploy = testResults.passed / testResults.total >= 0.8;
  console.log(`\n🚀 部署建议: ${canDeploy ? '✅ 可以部署' : '❌ 建议修复问题后再部署'}`);
  
  if (!canDeploy) {
    console.log('\n🔧 建议修复的问题:');
    testResults.details
      .filter(detail => detail.status === 'FAIL')
      .forEach(detail => {
        console.log(`  - ${detail.name}: ${detail.message}`);
      });
  }
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: Math.round((testResults.passed / testResults.total) * 100)
    },
    details: testResults.details,
    canDeploy: canDeploy
  };
  
  const reportPath = path.join(__dirname, '..', 'deployment-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存到: ${reportPath}`);
  
  return canDeploy;
}

// 执行测试
runDeploymentTests()
  .then(canDeploy => {
    console.log(`\n🎉 部署测试${canDeploy ? '通过' : '未通过'}!`);
    process.exit(canDeploy ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试执行出错:', error);
    process.exit(1);
  });