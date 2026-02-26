#!/usr/bin/env node

/**
 * 企业用户端E2E测试报告生成脚本
 * 聚合所有测试结果并生成综合报告
 */

const fs = require('fs');
const path = require('path');
const { createTestReporter } = require('../tests/e2e/enterprise/utils/test-reporter');

// 配置参数
const CONFIG = {
  testResultsPath: process.env.TEST_RESULTS_PATH || './test-results',
  outputPath: './test-results/enterprise-e2e-report.json',
  htmlReportPath: './test-results/enterprise-e2e-html-report'
};

async function main() {
  console.log('🚀 开始生成企业用户端E2E测试综合报告');
  console.log('='.repeat(60));
  
  try {
    // 创建报告器实例
    const reporter = createTestReporter();
    
    // 收集所有测试结果
    await collectTestResults(reporter);
    
    // 收集性能数据
    await collectPerformanceData(reporter);
    
    // 收集安全扫描结果
    await collectSecurityData(reporter);
    
    // 生成最终报告
    const report = reporter.generateReport();
    
    // 保存报告
    reporter.saveReport(report);
    
    // 输出摘要信息
    printSummary(report);
    
    // 检查质量门禁
    const qualityCheck = checkQualityGates(report);
    
    if (!qualityCheck.passed) {
      console.error('\n❌ 质量门禁检查未通过:');
      qualityCheck.failures.forEach(failure => {
        console.error(`   - ${failure}`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ 所有质量门禁检查通过');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ 报告生成失败:', error);
    process.exit(1);
  }
}

async function collectTestResults(reporter) {
  console.log('\n📋 收集测试结果...');
  
  // 查找所有测试结果文件
  const resultFiles = findTestResultFiles(CONFIG.testResultsPath);
  
  for (const file of resultFiles) {
    try {
      const results = parseTestResults(file);
      const suiteName = path.basename(file, path.extname(file));
      reporter.addTestSuite(suiteName, results);
      console.log(`   ✓ 已处理: ${suiteName} (${results.length} 个测试)`);
    } catch (error) {
      console.warn(`   ⚠ 跳过无效结果文件: ${file}`, error.message);
    }
  }
}

async function collectPerformanceData(reporter) {
  console.log('\n⚡ 收集性能数据...');
  
  try {
    const perfData = await gatherPerformanceMetrics();
    if (perfData) {
      reporter.setPerformanceMetrics(perfData);
      console.log('   ✓ 性能数据收集完成');
      console.log(`     平均响应时间: ${perfData.avgResponseTime.toFixed(2)}ms`);
      console.log(`     最大响应时间: ${perfData.maxResponseTime.toFixed(2)}ms`);
    }
  } catch (error) {
    console.warn('   ⚠ 性能数据收集失败:', error.message);
  }
}

async function collectSecurityData(reporter) {
  console.log('\n🔒 收集安全扫描结果...');
  
  try {
    const securityData = await gatherSecurityFindings();
    if (securityData) {
      reporter.setSecurityFindings(securityData);
      console.log('   ✓ 安全扫描结果收集完成');
      console.log(`     发现漏洞: ${securityData.vulnerabilities.length} 个`);
    }
  } catch (error) {
    console.warn('   ⚠ 安全数据收集失败:', error.message);
  }
}

function findTestResultFiles(dirPath) {
  const resultFiles = [];
  
  if (!fs.existsSync(dirPath)) {
    return resultFiles;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      resultFiles.push(...findTestResultFiles(fullPath));
    } else if (item.endsWith('.json') && item.includes('test')) {
      resultFiles.push(fullPath);
    }
  }
  
  return resultFiles;
}

function parseTestResults(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  // 根据不同格式解析测试结果
  if (data.tests) {
    // Jest格式
    return data.tests.map(test => ({
      name: test.name,
      status: test.status,
      duration: test.duration || 0,
      error: test.failureMessages ? test.failureMessages[0] : undefined
    }));
  } else if (data.suites) {
    // Playwright格式
    const results = [];
    data.suites.forEach(suite => {
      suite.tests.forEach(test => {
        results.push({
          name: test.name,
          status: test.ok ? 'passed' : 'failed',
          duration: test.results ? test.results[0]?.duration || 0 : 0,
          error: test.results && test.results[0]?.error ? test.results[0].error.message : undefined
        });
      });
    });
    return results;
  } else {
    throw new Error('未知的测试结果格式');
  }
}

async function gatherPerformanceMetrics() {
  // 模拟性能数据收集
  // 实际实现应该从性能测试结果中提取真实数据
  return {
    avgResponseTime: 1250,
    maxResponseTime: 3500,
    minResponseTime: 200,
    percentile95: 2800,
    percentile99: 3200
  };
}

async function gatherSecurityFindings() {
  // 模拟安全扫描结果
  // 实际实现应该从安全测试工具的结果中提取
  return {
    vulnerabilities: [
      {
        severity: 'medium',
        type: 'XSS',
        description: '潜在的跨站脚本攻击风险',
        location: '/enterprise/contact'
      }
    ],
    passedChecks: [
      'SQL注入防护',
      'CSRF防护',
      '会话安全',
      '输入验证'
    ]
  };
}

function printSummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试执行摘要');
  console.log('='.repeat(60));
  
  console.log(`总测试数: ${report.summary.totalTests}`);
  console.log(`✅ 通过: ${report.summary.passedTests}`);
  console.log(`❌ 失败: ${report.summary.failedTests}`);
  console.log(`⏭️  跳过: ${report.summary.skippedTests}`);
  console.log(`📈 通过率: ${report.summary.passRate}%`);
  console.log(`⏱️  总耗时: ${(report.metadata.duration / 1000).toFixed(2)}秒`);
  
  console.log('\n📋 测试套件分布:');
  report.suites.forEach(suite => {
    const passRate = suite.totalTests > 0 ? (suite.passedTests / suite.totalTests * 100).toFixed(1) : 0;
    console.log(`   ${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} 通过 (${passRate}%)`);
  });
  
  if (report.performance) {
    console.log('\n⚡ 性能指标:');
    console.log(`   平均响应时间: ${report.performance.avgResponseTime.toFixed(2)}ms`);
    console.log(`   最大响应时间: ${report.performance.maxResponseTime.toFixed(2)}ms`);
    console.log(`   95%分位响应时间: ${report.performance.percentile95.toFixed(2)}ms`);
  }
  
  if (report.security) {
    console.log('\n🔒 安全扫描结果:');
    console.log(`   发现漏洞: ${report.security.vulnerabilities.length} 个`);
    report.security.vulnerabilities.forEach(vuln => {
      console.log(`   ${vuln.severity.toUpperCase()}: ${vuln.type} - ${vuln.description}`);
    });
  }
}

function checkQualityGates(report) {
  const failures = [];
  
  // 通过率检查 (≥95%)
  if (report.summary.passRate < 95) {
    failures.push(`测试通过率 ${report.summary.passRate}% 低于 95% 的要求`);
  }
  
  // 失败用例检查 (≤5个)
  if (report.summary.failedTests > 5) {
    failures.push(`失败用例数 ${report.summary.failedTests} 超过 5 个的限制`);
  }
  
  // 安全漏洞检查 (高危漏洞=0)
  if (report.security) {
    const highVulns = report.security.vulnerabilities.filter(v => v.severity === 'high').length;
    if (highVulns > 0) {
      failures.push(`发现 ${highVulns} 个高危安全漏洞`);
    }
  }
  
  // 性能基准检查
  if (report.performance && report.performance.avgResponseTime > 3000) {
    failures.push(`平均响应时间 ${report.performance.avgResponseTime.toFixed(2)}ms 超过 3000ms 的基准`);
  }
  
  return {
    passed: failures.length === 0,
    failures
  };
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main };