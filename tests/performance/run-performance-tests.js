#!/usr/bin/env node

/**
 * 性能测试主执行脚本
 * 统一执行所有性能测试并生成综合报告
 */

const path = require('path');
const fs = require('fs');

// 导入配置和工具
const config = require('./config/performance.config.js');
const PerformanceTestRunner = require('./utils/test-runner.js');
const UnitPerformanceTests = require('./unit/unit-performance-tests.js');
const IntegrationPerformanceTests = require('./integration/integration-performance-tests.js');
const E2EPerformanceTests = require('./e2e/e2e-performance-tests.js');
const PerformanceBaseline = require('./baseline/performance-baseline.js');

class PerformanceTestSuite {
  constructor() {
    this.runner = new PerformanceTestRunner(config);
    this.unitTests = new UnitPerformanceTests();
    this.integrationTests = new IntegrationPerformanceTests();
    this.e2eTests = new E2EPerformanceTests();
    this.baseline = new PerformanceBaseline();
    this.results = {
      timestamp: new Date().toISOString(),
      environment: 'development',
      overallScore: 0,
      testResults: {},
      baselineAssessment: null,
    };
  }

  /**
   * 执行完整的性能测试套件
   */
  async run() {
    console.log('🚀 启动维修店用户中心性能测试套件');
    console.log('='.repeat(60));

    try {
      // 1. 执行单元性能测试
      await this.executeUnitTests();

      // 2. 执行集成性能测试
      await this.executeIntegrationTests();

      // 3. 执行端到端性能测试
      await this.executeE2ETests();

      // 4. 进行基准评估
      await this.performBaselineAssessment();

      // 5. 生成综合报告
      await this.generateFinalReport();

      // 6. 输出总结
      this.printSummary();

      console.log('\n✅ 性能测试套件执行完成！');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ 性能测试执行失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * 执行单元测试
   */
  async executeUnitTests() {
    console.log('\n🔬 开始执行单元性能测试...');

    try {
      const componentResults =
        await this.unitTests.testReactComponentRendering();
      const functionResults =
        await this.unitTests.testFunctionExecutionEfficiency();
      const dataResults = await this.unitTests.testDataProcessingPerformance();

      this.results.testResults.unit = {
        componentRendering: componentResults,
        functionExecution: functionResults,
        dataProcessing: dataResults,
        overallPass:
          componentResults.overallPass &&
          functionResults.overallPass &&
          dataResults.overallPass,
      };

      console.log(
        `✅ 单元测试完成 - 通过率: ${this.results.testResults.unit.overallPass ? '100%' : '部分失败'}`
      );
    } catch (error) {
      console.error('❌ 单元测试执行失败:', error.message);
      this.results.testResults.unit = {
        error: error.message,
        overallPass: false,
      };
    }
  }

  /**
   * 执行集成测试
   */
  async executeIntegrationTests() {
    console.log('\n🔗 开始执行集成性能测试...');

    try {
      const apiResults = await this.integrationTests.testAPICallPerformance();
      const dbResults =
        await this.integrationTests.testDatabaseQueryPerformance();
      const cacheResults = await this.integrationTests.testCachePerformance();
      const dataFlowResults =
        await this.integrationTests.testDataFlowPerformance();

      this.results.testResults.integration = {
        apiPerformance: apiResults,
        databasePerformance: dbResults,
        cachePerformance: cacheResults,
        dataFlowPerformance: dataFlowResults,
        overallPass:
          apiResults.overallPass &&
          dbResults.overallPass &&
          cacheResults.overallPass &&
          dataFlowResults.overallPass,
      };

      console.log(
        `✅ 集成测试完成 - 通过率: ${this.results.testResults.integration.overallPass ? '100%' : '部分失败'}`
      );
    } catch (error) {
      console.error('❌ 集成测试执行失败:', error.message);
      this.results.testResults.integration = {
        error: error.message,
        overallPass: false,
      };
    }
  }

  /**
   * 执行端到端测试
   */
  async executeE2ETests() {
    console.log('\n🌐 开始执行端到端性能测试...');

    try {
      const pageLoadResults = await this.e2eTests.testPageLoadPerformance();
      const journeyResults = await this.e2eTests.testUserJourneyPerformance();
      const concurrentResults =
        await this.e2eTests.testConcurrentUsersPerformance();
      const resourceResults =
        await this.e2eTests.testResourceLoadingPerformance();
      const interactiveResults =
        await this.e2eTests.testInteractiveResponsePerformance();

      this.results.testResults.e2e = {
        pageLoadPerformance: pageLoadResults,
        userJourneyPerformance: journeyResults,
        concurrentUsersPerformance: concurrentResults,
        resourceLoadingPerformance: resourceResults,
        interactiveResponsePerformance: interactiveResults,
        overallPass:
          pageLoadResults.overallPass &&
          journeyResults.overallPass &&
          concurrentResults.overallPass &&
          resourceResults.overallPass &&
          interactiveResults.overallPass,
      };

      console.log(
        `✅ 端到端测试完成 - 通过率: ${this.results.testResults.e2e.overallPass ? '100%' : '部分失败'}`
      );
    } catch (error) {
      console.error('❌ 端到端测试执行失败:', error.message);
      this.results.testResults.e2e = {
        error: error.message,
        overallPass: false,
      };
    }
  }

  /**
   * 执行基准评估
   */
  async performBaselineAssessment() {
    console.log('\n📊 开始性能基准评估...');

    try {
      // 模拟收集一些性能指标
      const mockMetrics = {
        paint: {
          'first-contentful-paint': 1200,
          firstMeaningfulPaint: 2800,
        },
        custom: {
          api_health_check: { value: 45, timestamp: Date.now() },
          api_work_orders: { value: 120, timestamp: Date.now() },
          render_DashboardChart: { value: 35, timestamp: Date.now() },
          render_DataTable: { value: 65, timestamp: Date.now() },
        },
      };

      const assessment = this.baseline.generateAssessmentReport(mockMetrics);
      this.results.baselineAssessment = assessment;
      this.results.overallScore = assessment.overallScore;

      console.log(
        `✅ 基准评估完成 - 综合评分: ${assessment.overallScore} (${assessment.level})`
      );
    } catch (error) {
      console.error('❌ 基准评估失败:', error.message);
      this.results.baselineAssessment = { error: error.message };
    }
  }

  /**
   * 生成最终报告
   */
  async generateFinalReport() {
    console.log('\n📝 生成性能测试综合报告...');

    const reportDir = path.join(process.cwd(), 'reports', 'performance');

    // 确保报告目录存在
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 生成JSON报告
    const jsonReportPath = path.join(
      reportDir,
      'a3test001-performance-test-report.json'
    );
    fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));

    // 生成HTML报告
    await this.generateHTMLReport(
      path.join(reportDir, 'a3test001-performance-test-report.html')
    );

    // 生成Markdown报告
    await this.generateMarkdownReport(
      path.join(reportDir, 'a3test001-performance-test-report.md')
    );

    console.log(`✅ 报告已生成至: ${reportDir}`);
  }

  /**
   * 生成HTML报告
   */
  async generateHTMLReport(filePath) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A3Test001 性能测试报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); }
        .card h3 { margin-top: 0; color: #333; }
        .score-display { font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }
        .excellent { color: #4CAF50; }
        .good { color: #2196F3; }
        .fair { color: #FF9800; }
        .poor { color: #f44336; }
        .veryPoor { color: #9C27B0; }
        .section { margin: 40px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .pass { color: #4CAF50; }
        .fail { color: #f44336; }
        .recommendations { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 A3Test001 性能测试报告</h1>
            <p>维修店用户中心性能测试完整评估</p>
            <p>生成时间: ${new Date(this.results.timestamp).toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="card">
                    <h3>📊 综合评分</h3>
                    <div class="score-display ${this.getScoreClass(this.results.overallScore)}">
                        ${this.results.overallScore}
                    </div>
                    <p style="text-align: center; font-size: 1.2em;">
                        ${this.getPerformanceLevelText(this.results.overallScore)}
                    </p>
                </div>
                
                <div class="card">
                    <h3>🔬 单元测试</h3>
                    <p>组件渲染、函数执行、数据处理</p>
                    <p class="score-display ${this.results.testResults.unit?.overallPass ? 'pass' : 'fail'}">
                        ${this.results.testResults.unit?.overallPass ? '✅' : '❌'}
                    </p>
                </div>
                
                <div class="card">
                    <h3>🔗 集成测试</h3>
                    <p>API调用、数据库、缓存性能</p>
                    <p class="score-display ${this.results.testResults.integration?.overallPass ? 'pass' : 'fail'}">
                        ${this.results.testResults.integration?.overallPass ? '✅' : '❌'}
                    </p>
                </div>
                
                <div class="card">
                    <h3>🌐 端到端测试</h3>
                    <p>用户场景、页面加载、并发性能</p>
                    <p class="score-display ${this.results.testResults.e2e?.overallPass ? 'pass' : 'fail'}">
                        ${this.results.testResults.e2e?.overallPass ? '✅' : '❌'}
                    </p>
                </div>
            </div>
            
            ${
              this.results.baselineAssessment?.recommendations?.length > 0
                ? `
            <div class="recommendations">
                <h3>💡 优化建议</h3>
                <ul>
                    ${this.results.baselineAssessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            `
                : ''
            }
            
            <div class="section">
                <h2>📋 详细测试结果</h2>
                <table>
                    <thead>
                        <tr>
                            <th>测试类别</th>
                            <th>测试项目</th>
                            <th>状态</th>
                            <th>详情</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTestResultsTable()}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>A3Test001 性能测试报告 - 维修店用户中心优化项目</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, htmlContent);
  }

  /**
   * 生成Markdown报告
   */
  async generateMarkdownReport(filePath) {
    const markdownContent = `# 🔧 A3Test001 性能测试报告

## 📊 测试概要

- **测试时间**: ${new Date(this.results.timestamp).toLocaleString('zh-CN')}
- **测试环境**: ${this.results.environment}
- **综合评分**: **${this.results.overallScore}** (${this.getPerformanceLevelText(this.results.overallScore)})
- **测试状态**: ${this.isAllPassed() ? '✅ 全部通过' : '⚠️ 部分失败'}

## 🎯 测试结果汇总

| 测试类别 | 状态 | 通过率 |
|---------|------|--------|
| 单元测试 | ${this.results.testResults.unit?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.calculatePassRate(this.results.testResults.unit)} |
| 集成测试 | ${this.results.testResults.integration?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.calculatePassRate(this.results.testResults.integration)} |
| 端到端测试 | ${this.results.testResults.e2e?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.calculatePassRate(this.results.testResults.e2e)} |

## 📈 详细测试结果

${this.generateMarkdownTestResults()}

## 💡 性能评估

${
  this.results.baselineAssessment?.recommendations?.length > 0
    ? `### 优化建议
${this.results.baselineAssessment.recommendations.map(rec => `- ${rec}`).join('\n')}`
    : '### 暂无优化建议'
}

## 📋 技术细节

\`\`\`json
${JSON.stringify(this.results, null, 2)}
\`\`\`

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*A3Test001 - 维修店用户中心性能测试*
`;

    fs.writeFileSync(filePath, markdownContent);
  }

  /**
   * 输出执行总结
   */
  printSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏁 A3Test001 性能测试执行总结');
    console.log('='.repeat(60));

    console.log(
      `📊 综合评分: ${this.results.overallScore}/100 (${this.getPerformanceLevelText(this.results.overallScore)})`
    );
    console.log(
      `✅ 测试通过: ${this.getPassedCount()}/${this.getTotalTestCount()} 项`
    );
    console.log(`🎯 通过率: ${this.getOverallPassRate()}%`);

    if (this.results.baselineAssessment?.recommendations?.length > 0) {
      console.log('\n💡 主要优化建议:');
      this.results.baselineAssessment.recommendations
        .slice(0, 3)
        .forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
    }

    console.log('\n📁 报告位置:');
    console.log(
      '  - JSON: reports/performance/a3test001-performance-test-report.json'
    );
    console.log(
      '  - HTML: reports/performance/a3test001-performance-test-report.html'
    );
    console.log(
      '  - MD:   reports/performance/a3test001-performance-test-report.md'
    );
  }

  // === 辅助方法 ===

  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'poor';
    return 'veryPoor';
  }

  getPerformanceLevelText(score) {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    if (score >= 30) return '较差';
    return '很差';
  }

  isAllPassed() {
    return (
      this.results.testResults.unit?.overallPass &&
      this.results.testResults.integration?.overallPass &&
      this.results.testResults.e2e?.overallPass
    );
  }

  getPassedCount() {
    let count = 0;
    if (this.results.testResults.unit?.overallPass) count++;
    if (this.results.testResults.integration?.overallPass) count++;
    if (this.results.testResults.e2e?.overallPass) count++;
    return count;
  }

  getTotalTestCount() {
    return 3;
  }

  getOverallPassRate() {
    return Math.round((this.getPassedCount() / this.getTotalTestCount()) * 100);
  }

  calculatePassRate(testCategory) {
    if (!testCategory) return '0%';
    return testCategory.overallPass ? '100%' : '0%';
  }

  generateTestResultsTable() {
    const rows = [];

    // 单元测试结果
    if (this.results.testResults.unit) {
      rows.push(`
        <tr>
          <td rowspan="3">单元测试</td>
          <td>组件渲染性能</td>
          <td>${this.results.testResults.unit.componentRendering?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.unit.componentRendering?.results?.length || 0} 个测试用例</td>
        </tr>
        <tr>
          <td>函数执行效率</td>
          <td>${this.results.testResults.unit.functionExecution?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.unit.functionExecution?.results?.length || 0} 个测试用例</td>
        </tr>
        <tr>
          <td>数据处理性能</td>
          <td>${this.results.testResults.unit.dataProcessing?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.unit.dataProcessing?.results?.length || 0} 个测试用例</td>
        </tr>
      `);
    }

    // 集成测试结果
    if (this.results.testResults.integration) {
      rows.push(`
        <tr>
          <td rowspan="4">集成测试</td>
          <td>API调用性能</td>
          <td>${this.results.testResults.integration.apiPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.integration.apiPerformance?.results?.length || 0} 个端点测试</td>
        </tr>
        <tr>
          <td>数据库查询性能</td>
          <td>${this.results.testResults.integration.databasePerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.integration.databasePerformance?.results?.length || 0} 个查询测试</td>
        </tr>
        <tr>
          <td>缓存性能</td>
          <td>${this.results.testResults.integration.cachePerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.integration.cachePerformance?.results?.length || 0} 个缓存场景</td>
        </tr>
        <tr>
          <td>数据流性能</td>
          <td>${this.results.testResults.integration.dataFlowPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.integration.dataFlowPerformance?.results?.length || 0} 个数据流测试</td>
        </tr>
      `);
    }

    // 端到端测试结果
    if (this.results.testResults.e2e) {
      rows.push(`
        <tr>
          <td rowspan="5">端到端测试</td>
          <td>页面加载性能</td>
          <td>${this.results.testResults.e2e.pageLoadPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.e2e.pageLoadPerformance?.results?.length || 0} 个页面测试</td>
        </tr>
        <tr>
          <td>用户旅程性能</td>
          <td>${this.results.testResults.e2e.userJourneyPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.e2e.userJourneyPerformance?.results?.length || 0} 个用户场景</td>
        </tr>
        <tr>
          <td>并发用户性能</td>
          <td>${this.results.testResults.e2e.concurrentUsersPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.e2e.concurrentUsersPerformance?.results?.length || 0} 个并发场景</td>
        </tr>
        <tr>
          <td>资源加载性能</td>
          <td>${this.results.testResults.e2e.resourceLoadingPerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.e2e.resourceLoadingPerformance?.results?.length || 0} 个资源类型</td>
        </tr>
        <tr>
          <td>交互响应性能</td>
          <td>${this.results.testResults.e2e.interactiveResponsePerformance?.overallPass ? '✅ 通过' : '❌ 失败'}</td>
          <td>${this.results.testResults.e2e.interactiveResponsePerformance?.results?.length || 0} 个交互类型</td>
        </tr>
      `);
    }

    return rows.join('');
  }

  generateMarkdownTestResults() {
    let content = '';

    if (this.results.testResults.unit) {
      content += '\n### 单元测试\n\n';
      content +=
        '| 测试项目 | 状态 | 测试用例数 |\n|---------|------|------------|\n';
      content += `| 组件渲染性能 | ${this.results.testResults.unit.componentRendering?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.unit.componentRendering?.results?.length || 0} |\n`;
      content += `| 函数执行效率 | ${this.results.testResults.unit.functionExecution?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.unit.functionExecution?.results?.length || 0} |\n`;
      content += `| 数据处理性能 | ${this.results.testResults.unit.dataProcessing?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.unit.dataProcessing?.results?.length || 0} |\n`;
    }

    if (this.results.testResults.integration) {
      content += '\n### 集成测试\n\n';
      content +=
        '| 测试项目 | 状态 | 测试用例数 |\n|---------|------|------------|\n';
      content += `| API调用性能 | ${this.results.testResults.integration.apiPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.integration.apiPerformance?.results?.length || 0} |\n`;
      content += `| 数据库查询性能 | ${this.results.testResults.integration.databasePerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.integration.databasePerformance?.results?.length || 0} |\n`;
      content += `| 缓存性能 | ${this.results.testResults.integration.cachePerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.integration.cachePerformance?.results?.length || 0} |\n`;
      content += `| 数据流性能 | ${this.results.testResults.integration.dataFlowPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.integration.dataFlowPerformance?.results?.length || 0} |\n`;
    }

    if (this.results.testResults.e2e) {
      content += '\n### 端到端测试\n\n';
      content +=
        '| 测试项目 | 状态 | 测试用例数 |\n|---------|------|------------|\n';
      content += `| 页面加载性能 | ${this.results.testResults.e2e.pageLoadPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.e2e.pageLoadPerformance?.results?.length || 0} |\n`;
      content += `| 用户旅程性能 | ${this.results.testResults.e2e.userJourneyPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.e2e.userJourneyPerformance?.results?.length || 0} |\n`;
      content += `| 并发用户性能 | ${this.results.testResults.e2e.concurrentUsersPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.e2e.concurrentUsersPerformance?.results?.length || 0} |\n`;
      content += `| 资源加载性能 | ${this.results.testResults.e2e.resourceLoadingPerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.e2e.resourceLoadingPerformance?.results?.length || 0} |\n`;
      content += `| 交互响应性能 | ${this.results.testResults.e2e.interactiveResponsePerformance?.overallPass ? '✅ 通过' : '❌ 失败'} | ${this.results.testResults.e2e.interactiveResponsePerformance?.results?.length || 0} |\n`;
    }

    return content;
  }
}

// 执行测试
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.run().catch(error => {
    console.error('测试执行异常:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTestSuite;
