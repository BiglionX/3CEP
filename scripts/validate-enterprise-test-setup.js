#!/usr/bin/env node

/**
 * 企业用户端E2E测试完整性验证脚本
 * 验证整个测试体系的完整性和正确性
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function main() {
  console.log('🔍 企业用户端E2E测试体系完整性验证');
  console.log('='.repeat(60));

  let allChecksPassed = true;

  // 1. 目录结构验证
  console.log('\n📁 1. 验证目录结构...');
  const structureChecks = await validateDirectoryStructure();
  allChecksPassed = allChecksPassed && structureChecks.passed;

  // 2. 配置文件验证
  console.log('\n⚙️  2. 验证配置文件...');
  const configChecks = await validateConfigFiles();
  allChecksPassed = allChecksPassed && configChecks.passed;

  // 3. 测试文件验证
  console.log('\n🧪 3. 验证测试文件...');
  const testFileChecks = await validateTestFiles();
  allChecksPassed = allChecksPassed && testFileChecks.passed;

  // 4. 依赖验证
  console.log('\n📦 4. 验证依赖项...');
  const dependencyChecks = await validateDependencies();
  allChecksPassed = allChecksPassed && dependencyChecks.passed;

  // 5. 环境验证
  console.log('\n🌍 5. 验证测试环境...');
  const environmentChecks = await validateEnvironment();
  allChecksPassed = allChecksPassed && environmentChecks.passed;

  // 输出最终结果
  console.log(`\n${'='.repeat(60)}`);
  if (allChecksPassed) {
    console.log('✅ 所有验证检查通过！企业用户端E2E测试体系完整可用');
    console.log('\n💡 快速开始:');
    console.log('   npm run test:e2e:enterprise setup     # 初始化环境');
    console.log('   npm run test:e2e:enterprise run all   # 运行所有测试');
    console.log('   npm run test:e2e:enterprise report    # 生成报告');
  } else {
    console.log('❌ 部分验证检查失败，请修复后再使用');
    process.exit(1);
  }
}

async function validateDirectoryStructure() {
  const requiredDirs = [
    'tests/e2e/enterprise',
    'tests/e2e/enterprise/config',
    'tests/e2e/enterprise/data',
    'tests/e2e/enterprise/fixtures',
    'tests/e2e/enterprise/utils',
    'tests/e2e/enterprise/functional',
    'tests/e2e/enterprise/permission',
    'tests/e2e/enterprise/api',
    'tests/e2e/enterprise/performance',
    'tests/e2e/enterprise/security',
  ];

  let passed = true;
  const missingDirs = [];

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      missingDirs.push(dir);
      passed = false;
    }
  }

  if (passed) {
    console.log('   ✓ 目录结构完整');
  } else {
    console.log('   ❌ 缺少以下目录:');
    missingDirs.forEach(dir => console.log(`     - ${dir}`));
  }

  return { passed, missingDirs };
}

async function validateConfigFiles() {
  const requiredFiles = [
    'tests/e2e/enterprise/enterprise.config.ts',
    'tests/e2e/enterprise/config/test-env-config.ts',
    'tests/e2e/enterprise/fixtures/enterprise-fixture.ts',
    'tests/e2e/enterprise/utils/test-utils.ts',
    'tests/e2e/enterprise/utils/test-reporter.ts',
  ];

  let passed = true;
  const missingFiles = [];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
      passed = false;
    }
  }

  if (passed) {
    console.log('   ✓ 配置文件完整');
  } else {
    console.log('   ❌ 缺少以下配置文件:');
    missingFiles.forEach(file => console.log(`     - ${file}`));
  }

  return { passed, missingFiles };
}

async function validateTestFiles() {
  const testPatterns = [
    'tests/e2e/enterprise/functional/*spec.ts',
    'tests/e2e/enterprise/permission/*spec.ts',
    'tests/e2e/enterprise/api/*spec.ts',
    'tests/e2e/enterprise/performance/*spec.ts',
    'tests/e2e/enterprise/security/*spec.ts',
  ];

  let passed = true;
  let totalTests = 0;

  for (const pattern of testPatterns) {
    try {
      const files = getFilesMatchingPattern(pattern);
      totalTests += files.length;

      // 验证每个测试文件的基本结构
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('test(') && !content.includes('it(')) {
          console.log(`   ⚠ 测试文件可能无效: ${file}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠ 无法验证模式: ${pattern}`);
    }
  }

  if (totalTests > 0) {
    console.log(`   ✓ 发现 ${totalTests} 个测试文件`);
  } else {
    console.log('   ❌ 未找到测试文件');
    passed = false;
  }

  return { passed, totalTests };
}

async function validateDependencies() {
  let passed = true;

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // 检查必需的依赖
    const requiredDeps = ['@playwright/test'];
    const missingDeps = [];

    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      console.log('   ❌ 缺少以下依赖:');
      missingDeps.forEach(dep => console.log(`     - ${dep}`));
      passed = false;
    } else {
      console.log('   ✓ 依赖项完整');
    }

    // 检查npm脚本
    const requiredScripts = [
      'test:e2e:enterprise',
      'test:e2e:enterprise:functional',
      'test:e2e:enterprise:api',
    ];

    const missingScripts = [];
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        missingScripts.push(script);
      }
    }

    if (missingScripts.length > 0) {
      console.log('   ⚠ 缺少以下npm脚本:');
      missingScripts.forEach(script => console.log(`     - ${script}`));
    }
  } catch (error) {
    console.log('   ❌ 无法读取package.json');
    passed = false;
  }

  return { passed };
}

async function validateEnvironment() {
  let passed = true;
  const issues = [];

  // 检查Node.js版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion < 16) {
    issues.push(`Node.js版本过低: ${nodeVersion} (建议≥16)`);
    passed = false;
  }

  // 检查环境变量
  const requiredEnvVars = ['NODE_ENV'];
  const missingEnvVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length > 0) {
    console.log('   ⚠ 建议设置以下环境变量:');
    missingEnvVars.forEach(envVar => console.log(`     - ${envVar}`));
  }

  // 检查端口可用性
  try {
    const { execSync } = require('child_process');
    const portCheck = execSync('netstat -an | findstr :3003', {
      encoding: 'utf8',
    });
    if (portCheck.includes('LISTENING')) {
      console.log('   ✓ 测试端口3003可用');
    } else {
      console.log('   ⚠ 端口3003可能不可用');
    }
  } catch (error) {
    console.log('   ⚠ 无法检查端口状态');
  }

  if (issues.length > 0) {
    console.log('   ❌ 环境问题:');
    issues.forEach(issue => console.log(`     - ${issue}`));
  } else {
    console.log('   ✓ 环境配置良好');
  }

  return { passed, issues };
}

function getFilesMatchingPattern(pattern) {
  const glob = require('glob');
  return glob.sync(pattern);
}

// 执行验证
if (require.main === module) {
  main().catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

module.exports = { main };
