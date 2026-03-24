/**
 * Lighthouse 性能基准报告生成器 - PERF-001.3
 *
 * 功能：
 * 1. 读取最新的 Lighthouse 测试结果
 * 2. 生成 Markdown 格式的性能基准报告
 * 3. 提供优化建议
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports/lighthouse');
const OUTPUT_FILE = path.join(
  __dirname,
  '../docs/LIGHTHOUSE_BENCHMARK_REPORT.md'
);

// 读取最新的汇总报告
function loadLatestSummary() {
  const summaryPath = path.join(REPORTS_DIR, 'latest-summary.json');

  if (!fs.existsSync(summaryPath)) {
    throw new Error('未找到 Lighthouse 测试报告，请先运行测试脚本');
  }

  return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
}

// 生成性能评分等级
function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  return 'D';
}

// 获取颜色标记
function getColor(score) {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  return 'red';
}

// 生成优化建议
function generateRecommendations(summary) {
  const recommendations = [];

  // Performance 优化建议
  if (summary.averageScores.performance < 90) {
    recommendations.push({
      category: 'Performance',
      suggestions: [
        '优化首屏加载时间：减少关键 CSS 和 JS 文件大小',
        '实施图片懒加载：使用 Next.js Image 组件',
        '启用代码分割：按需加载页面资源',
        '优化第三方脚本：延迟加载非关键脚本',
        '使用 WebP 格式：转换图片格式减少体积',
        '启用 Brotli 压缩：比 gzip 更高效',
      ],
    });
  }

  // Accessibility 优化建议
  if (summary.averageScores.accessibility < 90) {
    recommendations.push({
      category: 'Accessibility',
      suggestions: [
        '添加图片 alt 属性：确保所有图片都有描述性文字',
        '改善颜色对比度：确保文本可读性',
        '添加 ARIA 标签：增强屏幕阅读器支持',
        '确保键盘可访问：所有交互元素都可通过键盘访问',
        '添加表单标签：确保所有输入都有对应标签',
        '优化焦点管理：确保焦点顺序合理且可见',
      ],
    });
  }

  // Best Practices 优化建议
  if (summary.averageScores['best-practices'] < 90) {
    recommendations.push({
      category: 'Best Practices',
      suggestions: [
        '使用 HTTPS：确保所有资源都通过 HTTPS 加载',
        '避免已弃用的 API：检查并更新过时的浏览器 API',
        '添加 CSP 头：实施内容安全策略',
        '优化控制台日志：移除生产环境的调试日志',
        '确保正确的字符编码：使用 UTF-8 编码',
        '避免漏洞依赖库：定期更新 npm 依赖',
      ],
    });
  }

  // SEO 优化建议
  if (summary.averageScores.seo < 90) {
    recommendations.push({
      category: 'SEO',
      suggestions: [
        '优化 meta 描述：确保每个页面都有唯一描述',
        '添加结构化数据：使用 Schema.org 标记',
        '优化页面标题：确保标题描述性且唯一',
        '添加规范链接：避免重复内容问题',
        '优化 robots.txt：确保搜索引擎正确抓取',
        '生成 sitemap.xml：帮助搜索引擎索引',
      ],
    });
  }

  return recommendations;
}

// 生成详细的问题列表
function generateAuditDetails(summary) {
  const audits = [];

  summary.results.forEach(result => {
    const jsonReport = result.jsonReport;
    if (!jsonReport) return;

    // 收集性能相关的审计项
    if (result.scores.performance < 90 && jsonReport.audits) {
      Object.entries(jsonReport.audits).forEach(([id, audit]) => {
        if (audit.score !== null && audit.score < 1) {
          audits.push({
            page: result.url,
            audit: audit.title,
            score: Math.round(audit.score * 100),
            description: audit.description,
          });
        }
      });
    }
  });

  return audits.slice(0, 20); // 最多返回 20 个问题
}

// 生成 Markdown 报告
function generateMarkdownReport(summary) {
  const timestamp = new Date(summary.timestamp).toLocaleString('zh-CN');
  const recommendations = generateRecommendations(summary);

  let report = `# 🚀 Lighthouse 性能基准报告\n\n`;
  report += `**生成时间**: ${timestamp}\n`;
  report += `**测试页面数**: ${summary.results.length}\n`;
  report += `**基础 URL**: ${summary.config.baseUrl}\n\n`;

  report += `---\n\n`;

  report += `## 📊 总体评分\n\n`;
  report += `| 指标 | 平均分 | 要求 | 状态 | 等级 |\n`;
  report += `|------|--------|------|------|------|\n`;

  const thresholds = summary.config.thresholds;
  Object.entries(summary.averageScores).forEach(([key, score]) => {
    const threshold = thresholds[key];
    const passed = score >= threshold;
    const icon = passed ? '✅' : '❌';
    const grade = getGrade(score);
    const color = getColor(score);

    report += `| ${key} | **${score}** | ≥${threshold} | ${icon} | ${grade} |\n`;
  });

  report += `\n`;

  report += `---\n\n`;

  report += `## 📋 各页面详细得分\n\n`;
  report += `| 页面 | Performance | Accessibility | Best Practices | SEO |\n`;
  report += `|------|-------------|---------------|----------------|-----|\n`;

  summary.results.forEach(result => {
    const urlDisplay = result.url.replace(summary.config.baseUrl, '');
    const perfColor = getColor(result.performance);
    const accColor = getColor(result.accessibility);
    const bpColor = getColor(result['best-practices']);
    const seoColor = getColor(result.seo);

    report += `| \`${urlDisplay || '/'}\` | `;
    report += `${result.performance} | ${result.accessibility} | ${result['best-practices']} | ${result.seo} |\n`;
  });

  report += `\n`;

  report += `---\n\n`;

  report += `## 🎯 性能指标分析\n\n`;

  if (recommendations.length > 0) {
    recommendations.forEach(rec => {
      report += `### ${rec.category}\n\n`;

      const score = summary.averageScores[rec.category.toLowerCase()];
      const threshold = summary.config.thresholds[rec.category.toLowerCase()];
      const status = score >= threshold ? '✅ 达标' : '⚠️ 需优化';

      report += `**当前得分**: ${score}/100 (要求 ≥${threshold}) - ${status}\n\n`;
      report += `**优化建议**:\n\n`;

      rec.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });

      report += `\n`;
    });
  } else {
    report += `🎉 所有指标均达到要求！无需额外优化。\n\n`;
  }

  report += `---\n\n`;

  report += `## 📈 历史趋势\n\n`;
  report += `> 💡 提示：持续监控性能指标，确保每次更新都不会降低性能。\n\n`;

  report += `### 监控建议\n\n`;
  report += `- **日常监控**: 每天自动运行 Lighthouse 测试\n`;
  report += `- **PR 检查**: 在 PR 中自动评论性能影响\n`;
  report += `- **版本对比**: 每个版本发布前进行性能基准测试\n`;
  report += `- **告警机制**: 性能分数下降超过 5 分时触发告警\n\n`;

  report += `---\n\n`;

  report += `## 🔧 下一步行动计划\n\n`;

  if (recommendations.length > 0) {
    report += `### 优先级 P0（立即处理）\n\n`;
    report += `- [ ] 针对最低分的指标进行优化\n`;
    report += `- [ ] 解决影响用户体验的关键性能问题\n`;
    report += `- [ ] 优化首屏加载时间\n\n`;

    report += `### 优先级 P1（本周完成）\n\n`;
    report += `- [ ] 实施代码分割和懒加载\n`;
    report += `- [ ] 优化图片和静态资源\n`;
    report += `- [ ] 改善无障碍访问体验\n\n`;

    report += `### 优先级 P2（持续优化）\n\n`;
    report += `- [ ] 建立性能监控仪表板\n`;
    report += `- [ ] 定期进行性能回归测试\n`;
    report += `- [ ] 收集体感性能数据\n`;
  } else {
    report += `🎉 当前性能表现优秀，建议保持并持续监控！\n\n`;
  }

  report += `---\n\n`;

  report += `## 📝 技术备注\n\n`;
  report += `- 测试工具：Lighthouse\n`;
  report += `- 测试环境：GitHub Actions CI/CD\n`;
  report += `- 测试模式：Headless Chrome\n`;
  report += `- 网络模拟：4G（默认）\n`;
  report += `- CPU 节流：4x slowdown（默认）\n\n`;

  report += `---\n\n`;

  report += `**报告生成完成！** 🎉\n`;

  return report;
}

// 主函数
function generateBenchmarkReport() {
  console.log('📊 开始生成 Lighthouse 性能基准报告...\n');

  try {
    const summary = loadLatestSummary();
    const report = generateMarkdownReport(summary);

    // 保存报告
    fs.writeFileSync(OUTPUT_FILE, report);

    console.log(`✅ 报告已生成：${OUTPUT_FILE}`);
    console.log('\n摘要信息:');
    console.log(`  测试页面数：${summary.results.length}`);
    console.log(`  平均 Performance: ${summary.averageScores.performance}`);
    console.log(`  平均 Accessibility: ${summary.averageScores.accessibility}`);
    console.log(
      `  平均 Best Practices: ${summary.averageScores['best-practices']}`
    );
    console.log(`  平均 SEO: ${summary.averageScores.seo}`);

    return { success: true, file: OUTPUT_FILE };
  } catch (error) {
    console.error('❌ 生成报告失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 如果直接运行
if (require.main === module) {
  const result = generateBenchmarkReport();
  process.exit(result.success ? 0 : 1);
}

module.exports = { generateBenchmarkReport };
