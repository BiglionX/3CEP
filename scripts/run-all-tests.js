#!/usr/bin/env node

/**
 * 统一测试执行器
 * 整合 n8n 工作流测试、Playwright E2E 测试和其他测试套件
 * 生成统一的测试报告目录
 */

const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 FixCycle 统一测试执行器\n');
console.log('=====================================\n');

// 测试配置
const TEST_CONFIG = {
  suites: {
    unit: {
      name: '单元测试',
      command: 'npm',
      args: ['test', '--', '--testPathPattern=tests/unit'],
      enabled: true,
      required: true
    },
    integration: {
      name: '集成测试',
      command: 'npm',
      args: ['test', '--', '--testPathPattern=tests/integration'],
      enabled: true,
      required: false
    },
    'n8n-workflows': {
      name: 'n8n工作流测试',
      script: 'tests/n8n/test-n8n-workflows.js',
      enabled: true,
      required: false
    },
    e2e: {
      name: 'Playwright端到端测试',
      command: 'npm',
      args: ['run', 'test:e2e'],
      enabled: true,
      required: false
    },
    playwright: {
      name: 'Playwright功能测试',
      script: 'scripts/run-e2e-tests.js',
      enabled: true,
      required: false
    }
  },
  reportDir: 'test-results/unified-test-report',
  timeout: 900000 // 15分钟总超时
};

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  ci: args.includes('--ci') || process.env.CI === 'true',
  suite: args.find(arg => arg.startsWith('--suite='))?.split('=')[1],
  parallel: args.includes('--parallel')
};

// 创建报告目录
const reportBaseDir = path.join(process.cwd(), TEST_CONFIG.reportDir);
if (!fs.existsSync(reportBaseDir)) {
  fs.mkdirSync(reportBaseDir, { recursive: true });
}

// 测试结果收集
const testResults = {
  startTime: new Date(),
  suites: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

/**
 * 运行单个测试套件
 */
async function runTestSuite(suiteKey, suiteConfig) {
  console.log(`\n🧪 执行测试套件: ${suiteConfig.name}`);
  console.log('─'.repeat(50));
  
  const suiteStartTime = Date.now();
  const suiteReportDir = path.join(reportBaseDir, suiteKey);
  
  if (!fs.existsSync(suiteReportDir)) {
    fs.mkdirSync(suiteReportDir, { recursive: true });
  }
  
  try {
    let result;
    
    if (suiteConfig.command) {
      // 执行命令
      console.log(`🚀 执行: ${suiteConfig.command} ${suiteConfig.args.join(' ')}`);
      
      result = spawnSync(suiteConfig.command, suiteConfig.args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 600000, // 10分钟单个套件超时
        env: { ...process.env, FORCE_COLOR: '1' }
      });
      
    } else if (suiteConfig.script) {
      // 执行脚本
      const scriptPath = path.join(process.cwd(), suiteConfig.script);
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️  跳过: 脚本文件不存在 ${scriptPath}`);
        return { status: 'skipped', reason: '脚本文件不存在' };
      }
      
      console.log(`🚀 执行脚本: ${scriptPath}`);
      
      result = spawnSync('node', [scriptPath], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 600000,
        env: { ...process.env, FORCE_COLOR: '1' }
      });
    }
    
    const suiteEndTime = Date.now();
    const duration = suiteEndTime - suiteStartTime;
    
    // 保存套件输出
    if (result.stdout) {
      fs.writeFileSync(
        path.join(suiteReportDir, 'stdout.log'), 
        result.stdout.toString()
      );
    }
    
    if (result.stderr) {
      fs.writeFileSync(
        path.join(suiteReportDir, 'stderr.log'), 
        result.stderr.toString()
      );
    }
    
    // 解析测试结果
    const suiteResult = {
      status: result.status === 0 ? 'passed' : 'failed',
      exitCode: result.status,
      duration: duration,
      startTime: new Date(suiteStartTime).toISOString(),
      endTime: new Date(suiteEndTime).toISOString(),
      error: result.error ? result.error.message : null
    };
    
    // 保存套件报告
    fs.writeFileSync(
      path.join(suiteReportDir, 'result.json'),
      JSON.stringify(suiteResult, null, 2)
    );
    
    console.log(`📊 结果: ${suiteResult.status.toUpperCase()} (${Math.round(duration/1000)}秒)`);
    
    return suiteResult;
    
  } catch (error) {
    console.log(`❌ 执行出错: ${error.message}`);
    
    const suiteResult = {
      status: 'error',
      error: error.message,
      duration: Date.now() - suiteStartTime,
      startTime: new Date(suiteStartTime).toISOString(),
      endTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(suiteReportDir, 'result.json'),
      JSON.stringify(suiteResult, null, 2)
    );
    
    return suiteResult;
  }
}

/**
 * 确定要运行的测试套件
 */
function getSelectedSuites() {
  let suitesToRun = [];
  
  if (options.suite) {
    // 运行指定套件
    if (TEST_CONFIG.suites[options.suite]) {
      suitesToRun = [{ key: options.suite, config: TEST_CONFIG.suites[options.suite] }];
    }
  } else if (options.quick) {
    // 快速模式：只运行必需的测试
    suitesToRun = Object.entries(TEST_CONFIG.suites)
      .filter(([key, config]) => config.required)
      .map(([key, config]) => ({ key, config }));
  } else {
    // 默认：运行所有启用的测试
    suitesToRun = Object.entries(TEST_CONFIG.suites)
      .filter(([key, config]) => config.enabled)
      .map(([key, config]) => ({ key, config }));
  }
  
  return suitesToRun;
}

/**
 * 顺序执行测试套件
 */
async function runSequentialTests() {
  const suitesToRun = getSelectedSuites();
  
  console.log(`🎯 计划执行 ${suitesToRun.length} 个测试套件\n`);
  
  for (let i = 0; i < suitesToRun.length; i++) {
    const { key, config } = suitesToRun[i];
    console.log(`[${i + 1}/${suitesToRun.length}] ${config.name}`);
    
    const result = await runTestSuite(key, config);
    testResults.suites[key] = result;
    
    // 更新汇总统计
    testResults.summary.total++;
    if (result.status === 'passed') testResults.summary.passed++;
    else if (result.status === 'failed' || result.status === 'error') testResults.summary.failed++;
    else testResults.summary.skipped++;
    
    // 如果是必需测试且失败，在非CI环境下停止执行
    if (config.required && (result.status === 'failed' || result.status === 'error') && !options.ci) {
      console.log('\n🛑 必需测试失败，停止执行');
      break;
    }
  }
}

/**
 * 并行执行测试套件
 */
async function runParallelTests() {
  const suitesToRun = getSelectedSuites();
  
  console.log(`🎯 并行执行 ${suitesToRun.length} 个测试套件\n`);
  
  const promises = suitesToRun.map(async ({ key, config }, index) => {
    console.log(`[${index + 1}/${suitesToRun.length}] 启动 ${config.name}`);
    const result = await runTestSuite(key, config);
    
    testResults.suites[key] = result;
    testResults.summary.total++;
    
    if (result.status === 'passed') testResults.summary.passed++;
    else if (result.status === 'failed' || result.status === 'error') testResults.summary.failed++;
    else testResults.summary.skipped++;
    
    return { key, result };
  });
  
  await Promise.all(promises);
}

/**
 * 生成统一测试报告
 */
function generateUnifiedReport() {
  testResults.endTime = new Date();
  testResults.duration = testResults.endTime - testResults.startTime;
  
  // 生成JSON报告
  const jsonReport = {
    ...testResults,
    options: options,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(
    path.join(reportBaseDir, 'unified-test-report.json'),
    JSON.stringify(jsonReport, null, 2)
  );
  
  // 生成HTML报告
  generateHTMLReport(jsonReport);
  
  // 生成JUnit报告
  generateJUnitReport(jsonReport);
  
  // 打印汇总
  printSummary(jsonReport);
}

/**
 * 生成HTML报告
 */
function generateHTMLReport(report) {
  const passRate = Math.round((report.summary.passed / report.summary.total) * 100);
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>FixCycle 统一测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #6c757d; }
        .suite-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .suite-item { padding: 15px; margin: 10px 0; border-left: 4px solid #ddd; border-radius: 4px; }
        .suite-item.passed { border-left-color: #28a745; background: #f8fff8; }
        .suite-item.failed { border-left-color: #dc3545; background: #fff8f8; }
        .suite-item.error { border-left-color: #ffc107; background: #fffdf8; }
        .suite-item.skipped { border-left-color: #6c757d; background: #f8f8f8; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-error { background: #fff3cd; color: #856404; }
        .status-skipped { background: #e2e3e5; color: #383d41; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 FixCycle 统一测试报告</h1>
            <p><strong>执行时间:</strong> ${report.environment.timestamp}</p>
            <p><strong>环境:</strong> ${report.environment.platform} (Node.js ${report.environment.nodeVersion})</p>
            <p><strong>总执行时间:</strong> ${Math.round(report.duration / 1000)}秒</p>
        </div>
        
        <div class="summary-grid">
            <div class="metric-card">
                <h3>总测试套件</h3>
                <div class="metric-value">${report.summary.total}</div>
            </div>
            <div class="metric-card">
                <h3>通过</h3>
                <div class="metric-value passed">${report.summary.passed}</div>
            </div>
            <div class="metric-card">
                <h3>失败</h3>
                <div class="metric-value failed">${report.summary.failed}</div>
            </div>
            <div class="metric-card">
                <h3>跳过</h3>
                <div class="metric-value skipped">${report.summary.skipped}</div>
            </div>
            <div class="metric-card">
                <h3>通过率</h3>
                <div class="metric-value ${passRate >= 80 ? 'passed' : 'failed'}">${passRate}%</div>
            </div>
        </div>
        
        <div class="suite-list">
            <h2>测试套件详情</h2>
            ${Object.entries(report.suites).map(([suiteKey, result]) => `
                <div class="suite-item ${result.status}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0;">${suiteKey}</h3>
                        <span class="status-badge status-${result.status}">${result.status.toUpperCase()}</span>
                    </div>
                    <p><strong>执行时间:</strong> ${Math.round(result.duration / 1000)}秒</p>
                    <p><strong>开始时间:</strong> ${result.startTime}</p>
                    <p><strong>结束时间:</strong> ${result.endTime}</p>
                    ${result.error ? `<p style="color: #dc3545;"><strong>错误:</strong> ${result.error}</p>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(
    path.join(reportBaseDir, 'unified-test-report.html'),
    htmlContent
  );
}

/**
 * 生成JUnit报告
 */
function generateJUnitReport(report) {
  const junitContent = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="FixCycle Unified Test Suite" 
            tests="${report.summary.total}" 
            failures="${report.summary.failed}" 
            skipped="${report.summary.skipped}" 
            time="${report.duration / 1000}">
    ${Object.entries(report.suites).map(([suiteKey, result]) => `
    <testsuite name="${suiteKey}" 
               tests="1" 
               failures="${result.status === 'failed' || result.status === 'error' ? 1 : 0}" 
               skipped="${result.status === 'skipped' ? 1 : 0}" 
               time="${result.duration / 1000}">
        <testcase name="${suiteKey}" classname="FixCycle.UnifiedTests" time="${result.duration / 1000}">
            ${result.status === 'failed' || result.status === 'error' ? 
              `<failure message="${result.error || 'Test suite failed'}">${result.error || 'Test suite failed'}</failure>` : ''}
            ${result.status === 'skipped' ? `<skipped/>` : ''}
        </testcase>
    </testsuite>`).join('')}
</testsuites>`;
  
  fs.writeFileSync(
    path.join(reportBaseDir, 'junit-report.xml'),
    junitContent
  );
}

/**
 * 打印汇总信息
 */
function printSummary(report) {
  const passRate = Math.round((report.summary.passed / report.summary.total) * 100);
  
  console.log('\n' + '='.repeat(50));
  console.log('🏆 统一测试汇总报告');
  console.log('='.repeat(50));
  
  console.log(`\n📊 测试执行概览:`);
  console.log(`   总测试套件: ${report.summary.total}`);
  console.log(`   通过: ${report.summary.passed}`);
  console.log(`   失败: ${report.summary.failed}`);
  console.log(`   跳过: ${report.summary.skipped}`);
  console.log(`   通过率: ${passRate}%`);
  console.log(`   总执行时间: ${Math.round(report.duration / 1000)}秒`);
  
  console.log(`\n📋 详细结果:`);
  Object.entries(report.suites).forEach(([suiteKey, result]) => {
    const statusIcons = {
      'passed': '✅',
      'failed': '❌',
      'error': '💥',
      'skipped': '⏭️'
    };
    console.log(`  ${statusIcons[result.status] || '❓'} ${suiteKey} [${result.status.toUpperCase()}] - ${Math.round(result.duration/1000)}秒`);
  });
  
  console.log(`\n📄 报告文件位置:`);
  console.log(`   JSON报告: ${path.join(reportBaseDir, 'unified-test-report.json')}`);
  console.log(`   HTML报告: ${path.join(reportBaseDir, 'unified-test-report.html')}`);
  console.log(`   JUnit报告: ${path.join(reportBaseDir, 'junit-report.xml')}`);
  
  if (passRate === 100) {
    console.log('\n🎉 所有测试通过！系统状态良好');
  } else if (passRate >= 80) {
    console.log('\n👍 大部分测试通过，可以继续开发');
  } else {
    console.log('\n⚠️  测试通过率较低，建议优先修复问题');
  }
  
  console.log('\n✨ 统一测试执行完成！');
}

// 主执行逻辑
async function main() {
  try {
    if (options.parallel) {
      await runParallelTests();
    } else {
      await runSequentialTests();
    }
    
    generateUnifiedReport();
    
    // 根据结果设置退出码
    const passRate = (testResults.summary.passed / testResults.summary.total) * 100;
    if (passRate < 80 && options.ci) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 测试执行过程中发生错误:', error);
    process.exit(1);
  }
}

// 命令行帮助
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法:
  node scripts/run-all-tests.js              # 运行所有启用的测试套件
  node scripts/run-all-tests.js --quick      # 快速模式，只运行必需测试
  node scripts/run-all-tests.js --ci         # CI模式，严格的质量门禁
  node scripts/run-all-tests.js --suite=n8n-workflows  # 运行指定测试套件
  node scripts/run-all-tests.js --parallel   # 并行执行测试套件

可用测试套件:
  ${Object.keys(TEST_CONFIG.suites).join(', ')}

报告输出目录:
  ${TEST_CONFIG.reportDir}
  `);
  process.exit(0);
}

main();