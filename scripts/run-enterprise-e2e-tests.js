#!/usr/bin/env node

/**
 * 企业用户端E2E测试一键执行脚本
 * 简化测试执行流程，支持本地和CI环境
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置选项
const CONFIG = {
  testEnv: process.env.TEST_ENV || 'test',
  headless: process.env.HEADLESS !== 'false',
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3003',
  concurrency: parseInt(process.env.CONCURRENCY || '4'),
  timeout: parseInt(process.env.TIMEOUT || '30000'),
};

// 测试套件配置
const TEST_SUITES = {
  functional: {
    name: '功能测试',
    pattern: 'tests/e2e/enterprise/**/*functional*.spec.ts',
    description: '企业服务核心功能验证',
  },
  permission: {
    name: '权限测试',
    pattern: 'tests/e2e/enterprise/**/*permission*.spec.ts',
    description: 'RBAC权限控制系统验证',
  },
  api: {
    name: 'API测试',
    pattern: 'tests/e2e/enterprise/**/*api*.spec.ts',
    description: '核心业务接口测试',
  },
  performance: {
    name: '性能测试',
    pattern: 'tests/e2e/enterprise/**/*performance*.spec.ts',
    description: '性能基准和负载测试',
  },
  security: {
    name: '安全测试',
    pattern: 'tests/e2e/enterprise/**/*security*.spec.ts',
    description: 'Web安全防护验证',
  },
  all: {
    name: '完整测试套件',
    pattern: 'tests/e2e/enterprise/**/*.spec.ts',
    description: '执行所有企业端到端测试',
  },
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log('🔧 企业用户端E2E测试执行器');
  console.log('='.repeat(50));

  switch (command) {
    case 'run':
      await runTests(args.slice(1));
      break;
    case 'list':
      listTestSuites();
      break;
    case 'setup':
      await setupEnvironment();
      break;
    case 'report':
      await generateReport();
      break;
    case 'clean':
      await cleanArtifacts();
      break;
    default:
      showHelp();
  }
}

async function runTests(suiteNames) {
  console.log('🚀 开始执行企业用户端E2E测试');

  // 如果没有指定套件，默认运行所有测试
  if (suiteNames.length === 0) {
    suiteNames = ['all'];
  }

  // 验证测试环境
  await validateEnvironment();

  // 执行每个测试套件
  for (const suiteName of suiteNames) {
    if (!TEST_SUITES[suiteName]) {
      console.error(`❌ 未知的测试套件: ${suiteName}`);
      console.log('可用的测试套件:');
      listTestSuites();
      process.exit(1);
    }

    const suite = TEST_SUITES[suiteName];
    console.log(`\n🧪 执行测试套件: ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log('-'.repeat(40));

    try {
      await executePlaywrightTest(suite.pattern);
      console.log(`✅ ${suite.name} 执行完成`);
    } catch (error) {
      console.error(`❌ ${suite.name} 执行失败:`, error.message);
      // 继续执行其他套件，但标记整体失败
      process.exitCode = 1;
    }
  }

  // 生成综合报告
  console.log('\n📊 生成测试报告...');
  await generateReport();

  console.log('\n🏁 测试执行完成');
}

async function executePlaywrightTest(pattern) {
  const env = {
    ...process.env,
    TEST_ENV: CONFIG.testEnv,
    HEADLESS: CONFIG.headless.toString(),
    TEST_BASE_URL: CONFIG.baseUrl,
    TIMEOUT: CONFIG.timeout.toString(),
  };

  const cmd = 'npx';
  const args = [
    'playwright',
    'test',
    pattern,
    '--config=playwright.config.ts',
    `--workers=${CONFIG.concurrency}`,
    '--reporter=html,json,junit',
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      env,
      stdio: 'inherit',
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`测试执行失败，退出码: ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

function listTestSuites() {
  console.log('\n📋 可用的测试套件:');
  console.log('='.repeat(40));

  Object.entries(TEST_SUITES).forEach(([key, suite]) => {
    console.log(`${key.padEnd(12)} - ${suite.name}`);
    console.log(`               ${suite.description}`);
  });

  console.log('\n💡 使用示例:');
  console.log('   npm run test:e2e:enterprise run functional');
  console.log('   npm run test:e2e:enterprise run api performance');
  console.log('   npm run test:e2e:enterprise run all');
}

async function setupEnvironment() {
  console.log('⚙️  初始化测试环境...');

  try {
    // 检查必要的目录
    const requiredDirs = [
      './test-results',
      './test-results/screenshots',
      './test-results/videos',
      './test-results/logs',
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✓ 创建目录: ${dir}`);
      }
    }

    // 检查Playwright安装
    console.log('   检查Playwright浏览器...');
    const { execSync } = require('child_process');
    execSync('npx playwright install --with-deps', { stdio: 'inherit' });

    console.log('✅ 测试环境初始化完成');
  } catch (error) {
    console.error('❌ 环境初始化失败:', error.message);
    process.exit(1);
  }
}

async function validateEnvironment() {
  console.log('🔍 验证测试环境...');

  try {
    // 检查服务是否运行
    const { execSync } = require('child_process');

    try {
      execSync(`curl -s ${CONFIG.baseUrl}/health`, { timeout: 5000 });
      console.log('   ✓ 应用服务运行正常');
    } catch (error) {
      console.warn('   ⚠ 无法访问应用服务，测试可能失败');
      console.warn(`     请确保服务在 ${CONFIG.baseUrl} 正常运行`);
    }

    // 检查必要的环境变量
    const requiredVars = ['NODE_ENV'];
    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        console.warn(`   ⚠ 环境变量 ${envVar} 未设置`);
      }
    }
  } catch (error) {
    console.warn('   ⚠ 环境验证出现警告:', error.message);
  }
}

async function generateReport() {
  try {
    console.log('   生成综合测试报告...');
    const {
      main: generateReportMain,
    } = require('./generate-enterprise-test-report.js');
    await generateReportMain();
  } catch (error) {
    console.error('   ❌ 报告生成失败:', error.message);
  }
}

async function cleanArtifacts() {
  console.log('🧹 清理测试产物...');

  const cleanupPaths = [
    './test-results',
    './playwright-report',
    './test-results.tmp',
  ];

  for (const cleanupPath of cleanupPaths) {
    if (fs.existsSync(cleanupPath)) {
      fs.rmSync(cleanupPath, { recursive: true, force: true });
      console.log(`   ✓ 清理: ${cleanupPath}`);
    }
  }

  console.log('✅ 清理完成');
}

function showHelp() {
  console.log(`
企业用户端E2E测试执行器

用法: npm run test:e2e:enterprise <命令> [选项]

命令:
  run [套件...]     执行指定的测试套件
  list             列出所有可用的测试套件
  setup            初始化测试环境
  report           生成测试报告
  clean            清理测试产物
  help             显示此帮助信息

测试套件:
  functional       功能测试 - 核心业务功能验证
  permission       权限测试 - RBAC权限控制系统
  api             API测试 - 核心接口验证
  performance      性能测试 - 基准和负载测试
  security         安全测试 - Web安全防护
  all             完整测试 - 执行所有测试

环境变量:
  TEST_ENV         测试环境 (default: test)
  HEADLESS         无头模式 (default: true)
  TEST_BASE_URL    应用基础URL (default: http://localhost:3003)
  CONCURRENCY      并发数 (default: 4)
  TIMEOUT          超时时间(ms) (default: 30000)

示例:
  npm run test:e2e:enterprise run functional
  npm run test:e2e:enterprise run api performance security
  npm run test:e2e:enterprise setup
  TEST_ENV=production npm run test:e2e:enterprise run all
  `);
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main, TEST_SUITES, CONFIG };
