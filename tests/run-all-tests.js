#!/usr/bin/env node

/**
 * 统一测试套件执行器
 * 整合单元测试、集成测试、E2E测试、n8n流程测试、性能测试和安全检查
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 FixCycle 统一测试套件\n');
console.log('=====================================\n');

// 测试套件配置
const TEST_SUITES = {
  unit: {
    name: '单元测试',
    command: 'npm',
    args: ['test', '--', '--coverage', '--testPathPattern=tests/unit'],
    description: '运行 Jest 单元测试并生成覆盖率报告',
    required: true,
    timeout: 300000, // 5分钟
  },
  integration: {
    name: '集成测试',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=tests/integration'],
    description: '运行集成测试套件',
    required: false,
    timeout: 600000, // 10分钟
  },
  e2e: {
    name: '端到端测试',
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: '运行 Playwright 端到端测试',
    required: false,
    timeout: 900000, // 15分钟
  },
  n8n: {
    name: 'n8n流程测试',
    script: 'tests/n8n/test-n8n-workflows.js',
    description: '验证 n8n 工作流功能',
    required: false,
    timeout: 300000, // 5分钟
  },
  perf: {
    name: '性能测试',
    script: 'tests/perf/comprehensive-performance-test.js',
    description: '运行性能基准测试',
    required: false,
    timeout: 600000, // 10分钟
  },
  security: {
    name: '安全检查',
    script: 'tests/security/security-check.js',
    description: '执行安全扫描和配置检查',
    required: false,
    timeout: 120000, // 2分钟
  },
};

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  full: args.includes('--full'),
  ci: args.includes('--ci') || process.env.CI === 'true',
  coverageThreshold: process.env.COVERAGE_THRESHOLD || 80,
  include: [],
  exclude: [],
};

// 处理包含/排除特定测试类型
args.forEach(arg => {
  if (arg.startsWith('--include=')) {
    options.include = arg.split('=')[1].split(',');
  }
  if (arg.startsWith('--exclude=')) {
    options.exclude = arg.split('=')[1].split(',');
  }
});

// 确定要运行的测试套件
let selectedSuites = [];

if (options.quick) {
  // 快速模式：只运行必需的测试
  selectedSuites = Object.entries(TEST_SUITES)
    .filter(([key, suite]) => suite.required)
    .map(([key, suite]) => ({ key, ...suite }));
  console.log('⚡ 运行快速测试套件\n');
} else if (options.full) {
  // 完整模式：运行所有测试
  selectedSuites = Object.entries(TEST_SUITES).map(([key, suite]) => ({
    key,
    ...suite,
  }));
  console.log('🔬 运行完整测试套件\n');
} else if (options.include.length > 0) {
  // 包含指定测试类型
  selectedSuites = Object.entries(TEST_SUITES)
    .filter(([key]) => options.include.includes(key))
    .map(([key, suite]) => ({ key, ...suite }));
  console.log(`🎯 运行指定测试类型: ${options.include.join(', ')}\n`);
} else if (options.exclude.length > 0) {
  // 排除指定测试类型
  selectedSuites = Object.entries(TEST_SUITES)
    .filter(([key]) => !options.exclude.includes(key))
    .map(([key, suite]) => ({ key, ...suite }));
  console.log(`🎯 排除测试类型: ${options.exclude.join(', ')}\n`);
} else {
  // 默认模式：运行核心测试
  const defaultSuites = ['unit', 'integration', 'e2e'];
  selectedSuites = Object.entries(TEST_SUITES)
    .filter(([key]) => defaultSuites.includes(key))
    .map(([key, suite]) => ({ key, ...suite }));
  console.log('🧪 运行标准测试套件\n');
}

// 过滤掉被排除的测试
if (options.exclude.length > 0) {
  selectedSuites = selectedSuites.filter(
    suite => !options.exclude.includes(suite.key)
  );
}

console.log(`🎯 计划执行 ${selectedSuites.length} 个测试套件\n`);

// 测试执行结果收集
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: selectedSuites.length,
  details: [],
  startTime: new Date(),
  endTime: null,
  coverage: null,
};

// 创建测试结果目录
const testResultsDir = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 运行单个测试套件
async function runTestSuite(suite) {
  console.log(
    `[${results.passed + results.failed + results.skipped + 1}/${results.total}] ${suite.name}`
  );
  console.log(`📝 ${suite.description}`);
  console.log('----------------------------------------');

  try {
    let result;

    if (suite.command) {
      // 运行命令
      result = spawnSync(suite.command, suite.args, {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: suite.timeout,
        env: { ...process.env, FORCE_COLOR: '1' },
      });
    } else if (suite.script) {
      // 运行脚本文件
      const scriptPath = path.join(process.cwd(), suite.script);
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️  跳过测试: 脚本文件不存在 ${scriptPath}`);
        results.skipped++;
        results.details.push({
          name: suite.name,
          status: 'skipped',
          reason: '脚本文件不存在',
        });
        return;
      }

      result = spawnSync('node', [scriptPath], {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: suite.timeout,
        env: { ...process.env, FORCE_COLOR: '1' },
      });
    }

    if (result && result.status === 0) {
      console.log(`✅ ${suite.name} 通过\n`);
      results.passed++;
      results.details.push({
        name: suite.name,
        status: 'passed',
        duration: result.duration || 0,
      });
    } else {
      console.log(`❌ ${suite.name} 失败\n`);
      results.failed++;
      results.details.push({
        name: suite.name,
        status: 'failed',
        exitCode: result?.status,
        error: result?.error?.message,
      });

      if (suite.required && !options.ci) {
        console.log('🛑 必需的测试失败，停止执行');
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(`❌ ${suite.name} 执行出错: ${error.message}\n`);
    results.failed++;
    results.details.push({
      name: suite.name,
      status: 'error',
      error: error.message,
    });

    if (suite.required && !options.ci) {
      console.log('🛑 必需的测试出错，停止执行');
      process.exit(1);
    }
  }
}

// 顺序执行所有测试套件
async function runAllTests() {
  for (const suite of selectedSuites) {
    await runTestSuite(suite);
  }

  results.endTime = new Date();
  generateSummaryReport();
  saveDetailedReport();

  // CI模式下根据覆盖率和通过率决定退出码
  if (options.ci) {
    const passRate = (results.passed / results.total) * 100;
    const coverageOk =
      !results.coverage || results.coverage >= options.coverageThreshold;

    if (passRate < 80 || !coverageOk) {
      console.log('\n❌ CI检查失败 - 不满足质量门禁要求');
      process.exit(1);
    }
  }
}

// 生成摘要报告
function generateSummaryReport() {
  console.log('=====================================');
  console.log('🏆 测试汇总报告\n');

  const passRate = Math.round((results.passed / results.total) * 100);
  const duration = results.endTime - results.startTime;

  console.log(`📊 测试执行概览:`);
  console.log(`   总测试套件: ${results.total}`);
  console.log(`   通过: ${results.passed}`);
  console.log(`   失败: ${results.failed}`);
  console.log(`   跳过: ${results.skipped}`);
  console.log(`   通过率: ${passRate}%`);
  console.log(`   执行时间: ${Math.round(duration / 1000)}秒`);

  if (results.coverage) {
    console.log(`   代码覆盖率: ${results.coverage}%`);
    console.log(`   覆盖率门槛: ${options.coverageThreshold}%`);
  }

  console.log('');

  // 通过率评级
  if (passRate === 100) {
    console.log('🎉 所有测试通过！');
    console.log('🚀 代码质量优秀，可以安全部署');
  } else if (passRate >= 80) {
    console.log('👍 大部分测试通过');
    console.log('🔧 存在少量问题，建议修复后重新测试');
  } else if (passRate >= 60) {
    console.log('⚠️  测试通过率偏低');
    console.log('🛑 建议暂停开发，优先修复测试问题');
  } else {
    console.log('❌ 测试失败较多');
    console.log('🚨 存在严重质量问题，需要立即修复');
  }

  // 显示详细结果
  console.log('\n📋 详细测试结果:');
  results.details.forEach(detail => {
    const statusIcon =
      {
        passed: '✅',
        failed: '❌',
        error: '💥',
        skipped: '⏭️',
      }[detail.status] || '❓';

    console.log(
      `  ${statusIcon} ${detail.name} [${detail.status.toUpperCase()}]`
    );
    if (detail.error) {
      console.log(`     错误: ${detail.error}`);
    }
  });

  // 提供建议
  console.log('\n📝 后续建议:');
  if (passRate >= 80) {
    console.log('1. 修复失败的测试用例');
    console.log('2. 运行 npm run check:health 验证系统状态');
    console.log('3. 准备部署到测试环境');
  } else {
    console.log('1. 优先修复核心功能问题');
    console.log('2. 重新运行相关测试验证修复效果');
    console.log('3. 暂停新功能开发，专注质量改进');
  }

  if (passRate === 100) {
    console.log('4. 考虑运行性能测试和安全扫描');
    console.log('5. 准备发布候选版本');
  }

  console.log('\n✨ 测试套件执行完成！');
}

// 保存详细报告
function saveDetailedReport() {
  const report = {
    ...results,
    options,
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      ci: options.ci,
    },
  };

  const reportPath = path.join(testResultsDir, 'test-summary-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成JUnit格式报告（用于CI集成）
  generateJUnitReport(report);

  // 生成HTML报告
  generateHTMLReport(report);

  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
}

// 生成JUnit格式报告
function generateJUnitReport(report) {
  const junitReport = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="FixCycle Test Suite" 
             tests="${report.total}" 
             failures="${report.failed}" 
             skipped="${report.skipped}" 
             time="${(report.endTime - report.startTime) / 1000}">
    ${report.details
      .map(
        detail => `
    <testcase name="${detail.name}" classname="FixCycle.${detail.name.replace(/\s+/g, '')}" time="0">
      ${
        detail.status === 'failed' || detail.status === 'error'
          ? `<failure message="${detail.error || 'Test failed'}">${detail.error || 'Test failed'}</failure>`
          : ''
      }
      ${detail.status === 'skipped' ? `<skipped/>` : ''}
    </testcase>`
      )
      .join('')}
  </testsuite>
</testsuites>`;

  const junitPath = path.join(testResultsDir, 'junit-report.xml');
  fs.writeFileSync(junitPath, junitReport);
  console.log(`📄 JUnit报告已保存到: ${junitPath}`);
}

// 生成HTML报告
function generateHTMLReport(report) {
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ProdCycleAI 测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .details { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item { padding: 10px; margin: 5px 0; border-left: 4px solid #ddd; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.error { border-left-color: #ffc107; }
        .test-item.skipped { border-left-color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 ProdCycleAI 测试报告</h1>
        <p>执行时间: ${report.timestamp}</p>
        <p>环境: ${report.environment.platform} (Node.js ${report.environment.nodeVersion})</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>总测试数</h3>
            <div class="value">${report.total}</div>
        </div>
        <div class="metric">
            <h3>通过</h3>
            <div class="value passed">${report.passed}</div>
        </div>
        <div class="metric">
            <h3>失败</h3>
            <div class="value failed">${report.failed}</div>
        </div>
        <div class="metric">
            <h3>通过率</h3>
            <div class="value ${(report.passed / report.total) * 100 >= 80 ? 'passed' : 'failed'}">
                ${Math.round((report.passed / report.total) * 100)}%
            </div>
        </div>
    </div>
    
    <div class="details">
        <h2>详细测试结果</h2>
        ${report.details
          .map(
            detail => `
        <div class="test-item ${detail.status}">
            <strong>${detail.name}</strong> - ${detail.status.toUpperCase()}
            ${detail.error ? `<br><small style="color: #666;">错误: ${detail.error}</small>` : ''}
        </div>
        `
          )
          .join('')}
    </div>
</body>
</html>`;

  const htmlPath = path.join(testResultsDir, 'test-report.html');
  fs.writeFileSync(htmlPath, htmlReport);
  console.log(`📄 HTML报告已保存到: ${htmlPath}`);
}

// 启动测试执行
runAllTests().catch(error => {
  console.error('❌ 测试执行过程中发生错误:', error);
  process.exit(1);
});
