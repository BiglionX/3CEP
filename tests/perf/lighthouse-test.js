const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  console.log(`🚀 开始 Lighthouse 性能测试: ${url}`);
  console.log('='.repeat(50));

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);

    // 输出结果
    const report = runnerResult.lhr;

    console.log('\n📊 Lighthouse 测试结果:');
    console.log('='.repeat(50));

    console.log(
      `\n⭐ 性能评分: ${report.categories.performance.score * 100}/100`
    );
    console.log(
      `♿ 无障碍性评分: ${report.categories.accessibility.score * 100}/100`
    );
    console.log(
      `👍 最佳实践评分: ${report.categories['best-practices'].score * 100}/100`
    );
    console.log(`🔍 SEO评分: ${report.categories.seo.score * 100}/100`);

    // 详细性能指标
    console.log('\n⏱️  关键性能指标:');
    console.log('┌─────────────────────────────────┬─────────────┐');
    console.log('│ 指标                            │ 数值        │');
    console.log('├─────────────────────────────────┼─────────────┤');

    const metrics = report.audits.metrics.details.items[0];
    console.log(
      `│ 首次内容绘制 (FCP)              │ ${metrics.firstContentfulPaint}ms │`
    );
    console.log(
      `│ 最大内容绘制 (LCP)              │ ${metrics.largestContentfulPaint}ms │`
    );
    console.log(
      `│ 首次输入延迟 (FID)              │ ${metrics.interactive}ms │`
    );
    console.log(
      `│ 累积布局偏移 (CLS)              │ ${metrics.cumulativeLayoutShift.toFixed(3)} │`
    );
    console.log(
      `│ Speed Index                     │ ${metrics.speedIndex}ms │`
    );
    console.log('└─────────────────────────────────┴─────────────┘');

    // 性能评级
    const perfScore = report.categories.performance.score * 100;
    console.log(`\n🏆 性能评级:`);
    if (perfScore >= 90) {
      console.log(`  ⭐ 优秀 - 得分 ${perfScore}/100`);
    } else if (perfScore >= 50) {
      console.log(`  👍 需要改进 - 得分 ${perfScore}/100`);
    } else {
      console.log(`  ❌ 差劲 - 得分 ${perfScore}/100`);
    }

    // 保存报告
    require('fs').writeFileSync('lighthouse-report.html', runnerResult.report);
    console.log('\n📄 详细报告已保存为: lighthouse-report.html');

    return report;
  } catch (error) {
    console.error('❌ Lighthouse 测试失败:', error.message);
  } finally {
    await chrome.kill();
  }
}

// 简单的页面性能测试（不依赖Chrome）
async function simplePageTest(url) {
  console.log(`\n🚀 简单页面性能测试: ${url}`);
  console.log('='.repeat(50));

  const startTime = Date.now();

  try {
    const response = await fetch(url);
    const loadTime = Date.now() - startTime;

    console.log(`\n📊 页面加载测试结果:`);
    console.log(`  HTTP状态码: ${response.status}`);
    console.log(`  响应时间: ${loadTime}ms`);
    console.log(`  内容长度: ${(await response.text()).length} 字符`);

    if (loadTime < 1000) {
      console.log(`  ⭐ 页面加载速度优秀 (< 1秒)`);
    } else if (loadTime < 3000) {
      console.log(`  👍 页面加载速度良好 (1-3秒)`);
    } else {
      console.log(`  ⚠️  页面加载较慢 (> 3秒)`);
    }

    return { status: response.status, loadTime, url };
  } catch (error) {
    console.error(`❌ 页面测试失败: ${error.message}`);
    return { error: error.message, url };
  }
}

// 执行所有测试
async function runAllPerformanceTests() {
  console.log('🔧 FixCycle 性能测试套件');
  console.log('='.repeat(60));
  console.log(`开始时间: ${new Date().toISOString()}\n`);

  const baseUrl = 'http://localhost:3000';

  // 1. 简单页面测试
  await simplePageTest(baseUrl);
  await simplePageTest(`${baseUrl}/api/health`);

  // 2. Lighthouse测试（如果Chrome可用）
  try {
    await runLighthouse(baseUrl);
  } catch (error) {
    console.log('\n⚠️  Lighthouse测试需要Chrome浏览器，跳过此项测试');
    console.log('💡 建议安装Chrome并重试完整的Lighthouse测试');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ 性能测试完成');
  console.log(`结束时间: ${new Date().toISOString()}`);
}

if (require.main === module) {
  runAllPerformanceTests().catch(console.error);
}

module.exports = { runLighthouse, simplePageTest };
