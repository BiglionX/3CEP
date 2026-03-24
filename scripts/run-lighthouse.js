/**
 * Lighthouse 自动化性能测试脚本 - PERF-001
 *
 * 功能：
 * 1. 自动运行 Lighthouse 测试关键页面
 * 2. 生成 HTML 和 JSON 报告
 * 3. 检查性能分数是否达标（≥90 分）
 * 4. 支持 CI/CD 集成
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  outputDir: path.join(__dirname, '../reports/lighthouse'),
  urls: [
    '/',
    '/analytics/executive-dashboard',
    '/admin/users',
    '/admin/orders',
    '/blockchain/products',
    '/fxc/exchange',
  ],
  thresholds: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
  },
};

// 确保输出目录存在
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

// 启动 Chrome
async function launchChrome() {
  return await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
}

// 运行单个 URL 的 Lighthouse 测试
async function runLighthouseOnUrl(url, chromePort) {
  console.log(`\n🔍 测试 ${url}...`);

  const options = {
    logLevel: 'info',
    output: 'html,json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chromePort,
    locale: 'zh-CN',
  };

  try {
    const runnerResult = await lighthouse(url, options);

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse 无法生成报告');
    }

    const reportHtml = runnerResult.report;
    const reportJson = runnerResult.lhr;

    // 提取分数
    const scores = {
      url,
      performance: Math.round(
        runnerResult.lhr.categories.performance.score * 100
      ),
      accessibility: Math.round(
        runnerResult.lhr.categories.accessibility.score * 100
      ),
      'best-practices': Math.round(
        runnerResult.lhr.categories['best-practices'].score * 100
      ),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
      timestamp: new Date().toISOString(),
    };

    console.log(
      `✅ ${url} - Performance: ${scores.performance}, Accessibility: ${scores.accessibility}`
    );

    return {
      html: reportHtml,
      json: reportJson,
      scores,
    };
  } catch (error) {
    console.error(`❌ ${url} 测试失败:`, error.message);
    throw error;
  }
}

// 保存报告
function saveReports(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 保存单个页面的 HTML 报告
  results.forEach((result, index) => {
    const urlSafe = result.scores.url.replace(/[^a-zA-Z0-9]/g, '_');
    const htmlPath = path.join(
      CONFIG.outputDir,
      `${timestamp}-${urlSafe}.html`
    );
    fs.writeFileSync(htmlPath, result.html);
    console.log(`📄 HTML 报告已保存：${htmlPath}`);
  });

  // 保存汇总 JSON 报告
  const summaryPath = path.join(CONFIG.outputDir, `${timestamp}-summary.json`);
  const summary = {
    timestamp,
    config: CONFIG,
    results: results.map(r => r.scores),
    averageScores: {
      performance: Math.round(
        results.reduce((sum, r) => sum + r.scores.performance, 0) /
          results.length
      ),
      accessibility: Math.round(
        results.reduce((sum, r) => sum + r.scores.accessibility, 0) /
          results.length
      ),
      'best-practices': Math.round(
        results.reduce((sum, r) => sum + r.scores['best-practices'], 0) /
          results.length
      ),
      seo: Math.round(
        results.reduce((sum, r) => sum + r.scores.seo, 0) / results.length
      ),
    },
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📊 汇总报告已保存：${summaryPath}`);

  // 保存最新的报告（覆盖旧文件）
  const latestSummaryPath = path.join(CONFIG.outputDir, 'latest-summary.json');
  fs.writeFileSync(latestSummaryPath, JSON.stringify(summary, null, 2));

  return summary;
}

// 检查是否达到阈值
function checkThresholds(summary) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 性能分数检查');
  console.log('='.repeat(60));

  const passed = [];
  const failed = [];

  Object.entries(CONFIG.thresholds).forEach(([category, threshold]) => {
    const score = summary.averageScores[category];
    const status = score >= threshold ? '✅' : '❌';
    const message = `${status} ${category}: ${score}/100 (要求 ≥${threshold})`;

    if (score >= threshold) {
      passed.push(message);
      console.log(message);
    } else {
      failed.push(message);
      console.log(message);
    }
  });

  console.log('='.repeat(60));

  if (failed.length > 0) {
    console.log('❌ 部分性能指标未达到要求');
    return false;
  } else {
    console.log('✅ 所有性能指标达到要求！');
    return true;
  }
}

// 打印结果表格
function printResultsTable(summary) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 Lighthouse 测试结果汇总');
  console.log('='.repeat(80));

  // 表头
  console.log(
    '| 页面'.padEnd(50) +
      '| Performance | Accessibility | Best Practices | SEO     |'
  );
  console.log(
    '|'.padEnd(50, '-') +
      '|-------------|---------------|----------------|---------|'
  );

  // 数据行
  summary.results.forEach(result => {
    const urlDisplay =
      result.url.length > 47 ? result.url.substring(0, 44) + '...' : result.url;
    console.log(
      `| ${urlDisplay.padEnd(48)}| ${String(result.performance).padEnd(11)}| ${String(result.accessibility).padEnd(13)}| ${String(result['best-practices']).padEnd(14)}| ${result.seo}   |`
    );
  });

  console.log(
    '|'.padEnd(50, '-') +
      '|-------------|---------------|----------------|---------|'
  );

  // 平均分行
  console.log(
    `| ${'平均分'.padEnd(48)}| ${String(summary.averageScores.performance).padEnd(11)}| ${String(summary.averageScores.accessibility).padEnd(13)}| ${String(summary.averageScores['best-practices']).padEnd(14)}| ${summary.averageScores.seo}   |`
  );

  console.log('='.repeat(80));
}

// 主函数
async function runLighthouse() {
  console.log('🚀 开始执行 Lighthouse 性能测试...\n');
  console.log('配置信息:');
  console.log(`  基础 URL: ${CONFIG.baseUrl}`);
  console.log(`  测试页面数：${CONFIG.urls.length}`);
  console.log(
    `  阈值要求：Performance ≥${CONFIG.thresholds.performance}, Accessibility ≥${CONFIG.thresholds.accessibility}`
  );
  console.log(`  报告输出：${CONFIG.outputDir}\n`);

  ensureOutputDir();

  let chrome;
  try {
    // 启动 Chrome
    console.log('🌐 启动 Chrome 浏览器...');
    chrome = await launchChrome();
    console.log(`✅ Chrome 已启动 (端口 ${chrome.port})\n`);

    // 运行所有 URL 的测试
    const results = [];
    for (const url of CONFIG.urls) {
      const fullUrl = `${CONFIG.baseUrl}${url}`;
      const result = await runLighthouseOnUrl(fullUrl, chrome.port);
      results.push(result);
    }

    // 保存报告
    const summary = saveReports(results);

    // 打印结果表格
    printResultsTable(summary);

    // 检查阈值
    const allPassed = checkThresholds(summary);

    // 返回结果
    return {
      success: allPassed,
      summary,
    };
  } catch (error) {
    console.error('\n❌ Lighthouse 测试失败:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // 关闭 Chrome
    if (chrome) {
      await chrome.kill();
      console.log('\n🔒 Chrome 已关闭');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runLighthouse()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Lighthouse 测试完成！所有指标达标。');
        process.exit(0);
      } else {
        console.log('\n⚠️  Lighthouse 测试完成！部分指标未达标。');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 测试过程中发生错误:', error);
      process.exit(1);
    });
}

module.exports = { runLighthouse, CONFIG };
