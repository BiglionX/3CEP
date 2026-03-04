#!/usr/bin/env node

/**
 * Agents 监控脚本测试用例
 * 验证监控脚本的各项功能
 */

const AgentsMonitor = require('./monitor-agents.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试 Agents 监控脚本...\n');

// 测试1: 基本实例化
console.log('1. 测试基本实例化...');
try {
  const monitor = new AgentsMonitor({
    host: 'localhost',
    port: 3001,
    sampleSize: 5,
    timeout: 3000,
  });

  console.log('✅ 实例化成功');
  console.log(`   配置: ${monitor.agentsHost}:${monitor.agentsPort}`);
  console.log(`   采样数: ${monitor.sampleSize}`);
  console.log(`   超时: ${monitor.timeout}ms\n`);
} catch (error) {
  console.error('❌ 实例化失败:', error.message);
  process.exit(1);
}

// 测试2: 生成测试用例
console.log('2. 测试测试用例生成...');
try {
  const monitor = new AgentsMonitor({ sampleSize: 10 });
  const testCases = monitor.generateTestCases();

  console.log('✅ 测试用例生成成功');
  console.log(`   生成用例数: ${testCases.length}`);
  console.log(
    `   包含Agent类型: ${[...new Set(testCases.map(tc => tc.agentName))].join(', ')}\n`
  );
} catch (error) {
  console.error('❌ 测试用例生成失败:', error.message);
}

// 测试3: 负载生成
console.log('3. 测试负载生成...');
try {
  const monitor = new AgentsMonitor();
  const domains = ['设备识别', '用户体验', '供应链', '售后服务', '数据分析'];

  domains.forEach(domain => {
    const payload = monitor.generatePayload(domain);
    console.log(`   ${domain}: ${typeof payload}`);
  });
  console.log('✅ 负载生成成功\n');
} catch (error) {
  console.error('❌ 负载生成失败:', error.message);
}

// 测试4: 指标计算
console.log('4. 测试指标计算...');
try {
  const monitor = new AgentsMonitor();

  // 模拟一些测试结果
  monitor.recordResult('测试Agent1', {
    success: true,
    duration: 100,
    errorCode: 200,
  });

  monitor.recordResult('测试Agent1', {
    success: false,
    duration: 200,
    errorCode: 500,
  });

  monitor.recordResult('测试Agent2', {
    success: true,
    duration: 150,
    errorCode: 200,
  });

  const metrics = monitor.calculateMetrics();

  console.log('✅ 指标计算成功');
  console.log(`   总请求数: ${metrics.summary.totalRequests}`);
  console.log(`   成功率: ${metrics.summary.successRate}%`);
  console.log(`   P95延迟: ${metrics.latency.p95}ms`);
  console.log(`   错误码:`, Object.keys(metrics.errorCodes));
  console.log(
    `   Agent数量: ${Object.keys(metrics.agentPerformance).length}\n`
  );
} catch (error) {
  console.error('❌ 指标计算失败:', error.message);
}

// 测试5: 报告生成
console.log('5. 测试报告生成...');
try {
  const monitor = new AgentsMonitor();
  const sampleMetrics = {
    summary: {
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      successRate: 95,
      errorRate: 5,
    },
    latency: {
      p95: 150,
      average: 120,
      min: 50,
      max: 300,
    },
    errorCodes: {
      500: 3,
      404: 2,
    },
    agentPerformance: {
      测试Agent1: {
        totalRequests: 50,
        successRate: 96,
        p95Latency: 140,
        avgLatency: 115,
      },
    },
  };

  const report = monitor.generateReport(sampleMetrics);

  console.log('✅ 报告生成成功');
  console.log(`   报告ID: ${report.reportId}`);
  console.log(`   生成时间: ${report.generatedAt}`);
  console.log(`   环境: ${report.environment}`);
  console.log(`   目标: ${report.target.host}:${report.target.port}\n`);
} catch (error) {
  console.error('❌ 报告生成失败:', error.message);
}

// 测试6: 文件保存
console.log('6. 测试文件保存...');
try {
  const testDir = './test-output';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const monitor = new AgentsMonitor({ outputDir: testDir });
  const testReport = {
    reportId: 'test-report-001',
    generatedAt: new Date().toISOString(),
    metrics: {
      summary: { totalRequests: 10, successRate: 100 },
    },
  };

  const filePath = monitor.saveReport(testReport);
  console.log('✅ 文件保存成功');
  console.log(`   保存路径: ${filePath}`);

  // 验证文件存在
  if (fs.existsSync(filePath)) {
    console.log('   文件验证通过');
    // 清理测试文件
    fs.unlinkSync(filePath);
    fs.rmdirSync(testDir);
  } else {
    console.log('   ❌ 文件不存在');
  }
  console.log('');
} catch (error) {
  console.error('❌ 文件保存失败:', error.message);
}

console.log('🎉 所有测试完成!\n');

// 显示使用示例
console.log('📘 使用示例:');
console.log('============');
console.log('1. 基本使用:');
console.log('   npm run monitor:agents');
console.log('');
console.log('2. 指定参数:');
console.log('   node scripts/monitor-agents.js localhost 3001 50 5000');
console.log('');
console.log('3. 使用环境变量:');
console.log(
  '   AGENTS_HOST=prod-server AGENTS_PORT=3001 npm run monitor:agents'
);
console.log('');
console.log('4. 查看帮助:');
console.log('   node scripts/monitor-agents.js --help');
