#!/usr/bin/env node

/**
 * 外贸采购端到端测试执行脚本
 * 自动化执行完整的外贸采购流程测试
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  projectName: '外贸采购端到端测试',
  testFiles: ['tests/e2e/foreign-trade-procurement.e2e.spec.ts'],
  headless: process.env.HEADLESS !== 'false', // 默认无头模式
  workers: process.env.WORKERS || 1,
  timeout: 300000, // 5分钟超时
  retries: 2, // 失败重试次数
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/foreign-trade-e2e-html-report' }],
    ['json', { outputFile: 'test-results/foreign-trade-e2e-report.json' }],
  ],
};

// 测试报告生成器
class TestReporter {
  constructor() {
    this.startTime = new Date();
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      failures: [],
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m', // 青色
      success: '\x1b[32m', // 绿色
      warning: '\x1b[33m', // 黄色
      error: '\x1b[31m', // 红色
      reset: '\x1b[0m', // 重置
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  updateResults(testResult) {
    this.results.total++;
    if (testResult.status === 'passed') {
      this.results.passed++;
    } else if (testResult.status === 'failed') {
      this.results.failed++;
      this.results.failures.push({
        name: testResult.name,
        error: testResult.error,
        duration: testResult.duration,
      });
    } else if (testResult.status === 'skipped') {
      this.results.skipped++;
    }
  }

  generateSummary() {
    const endTime = new Date();
    this.results.duration = endTime - this.startTime;

    this.log('='.repeat(60), 'info');
    this.log('测试执行总结', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`项目: ${TEST_CONFIG.projectName}`, 'info');
    this.log(`总用例数: ${this.results.total}`, 'info');
    this.log(`✅ 通过: ${this.results.passed}`, 'success');
    this.log(
      `❌ 失败: ${this.results.failed}`,
      this.results.failed > 0 ? 'error' : 'info'
    );
    this.log(`⏭️ 跳过: ${this.results.skipped}`, 'warning');
    this.log(
      `⏱️ 总耗时: ${(this.results.duration / 1000).toFixed(2)}秒`,
      'info'
    );
    this.log(
      `成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`,
      'info'
    );

    if (this.results.failures.length > 0) {
      this.log('\n失败用例详情:', 'error');
      this.results.failures.forEach((failure, index) => {
        this.log(`${index + 1}. ${failure.name}`, 'error');
        this.log(`   错误: ${failure.error}`, 'error');
        this.log(`   耗时: ${failure.duration}ms`, 'error');
      });
    }

    this.log('='.repeat(60), 'info');

    return this.results;
  }
}

// 环境准备函数
async function prepareTestEnvironment() {
  const reporter = new TestReporter();

  reporter.log('🔧 开始准备测试环境...', 'info');

  try {
    // 创建测试结果目录
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
      reporter.log('📁 创建测试结果目录', 'success');
    }

    // 检查必要的环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingVars.length > 0) {
      reporter.log(`⚠️ 缺少环境变量: ${missingVars.join(', ')}`, 'warning');
      reporter.log('请确保设置了必要的环境变量', 'warning');
    }

    // 启动开发服务器（如果需要）
    if (process.env.START_SERVER !== 'false') {
      reporter.log('🚀 启动开发服务器...', 'info');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });

      // 等待服务器启动
      await new Promise((resolve, reject) => {
        let serverReady = false;

        serverProcess.stdout.on('data', data => {
          const output = data.toString();
          if (
            output.includes('ready started server') ||
            output.includes('Local:')
          ) {
            serverReady = true;
            reporter.log('✅ 服务器启动成功', 'success');
            resolve(serverProcess);
          }
        });

        serverProcess.stderr.on('data', data => {
          console.error('Server error:', data.toString());
        });

        // 30秒超时
        setTimeout(() => {
          if (!serverReady) {
            reject(new Error('服务器启动超时'));
          }
        }, 30000);
      });

      return serverProcess;
    }

    reporter.log('✅ 测试环境准备完成', 'success');
    return null;
  } catch (error) {
    reporter.log(`❌ 环境准备失败: ${error.message}`, 'error');
    throw error;
  }
}

// 执行测试函数
async function runTests(serverProcess) {
  const reporter = new TestReporter();

  reporter.log('🧪 开始执行端到端测试...', 'info');

  return new Promise((resolve, reject) => {
    const testArgs = [
      'test',
      ...TEST_CONFIG.testFiles,
      `--headed=${!TEST_CONFIG.headless}`,
      `--workers=${TEST_CONFIG.workers}`,
      `--timeout=${TEST_CONFIG.timeout}`,
      `--retries=${TEST_CONFIG.retries}`,
      ...TEST_CONFIG.reporter.flatMap(([reporter, options]) =>
        options
          ? [
              `--reporter=${reporter}`,
              `--reporter-options=${JSON.stringify(options)}`,
            ]
          : [`--reporter=${reporter}`]
      ),
    ];

    reporter.log(`执行命令: npx playwright ${testArgs.join(' ')}`, 'info');

    const testProcess = spawn('npx', ['playwright', ...testArgs], {
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    testProcess.on('close', code => {
      if (serverProcess) {
        reporter.log('🛑 关闭开发服务器...', 'info');
        serverProcess.kill();
      }

      if (code === 0) {
        reporter.log('✅ 所有测试执行完成', 'success');
        resolve(reporter.generateSummary());
      } else {
        reporter.log(`❌ 测试执行失败，退出码: ${code}`, 'error');
        const summary = reporter.generateSummary();
        reject(
          new Error(
            `测试失败，通过率: ${((summary.passed / summary.total) * 100).toFixed(1)}%`
          )
        );
      }
    });

    testProcess.on('error', error => {
      if (serverProcess) {
        serverProcess.kill();
      }
      reporter.log(`❌ 测试进程错误: ${error.message}`, 'error');
      reject(error);
    });
  });
}

// 主执行函数
async function main() {
  const reporter = new TestReporter();

  try {
    reporter.log(`🚀 开始执行 ${TEST_CONFIG.projectName}`, 'info');

    // 准备测试环境
    const serverProcess = await prepareTestEnvironment();

    // 执行测试
    const results = await runTests(serverProcess);

    // 根据结果决定退出码
    const successRate = (results.passed / results.total) * 100;
    const exitCode = successRate >= 90 ? 0 : 1;

    process.exit(exitCode);
  } catch (error) {
    reporter.log(`💥 测试执行异常: ${error.message}`, 'error');
    console.error(error.stack);
    process.exit(1);
  }
}

// 信号处理
process.on('SIGINT', () => {
  console.log('\n👋 收到中断信号，正在优雅关闭...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  TEST_CONFIG,
  TestReporter,
  prepareTestEnvironment,
  runTests,
  main,
};
