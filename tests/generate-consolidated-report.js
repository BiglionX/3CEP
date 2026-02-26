#!/usr/bin/env node

/**
 * 统一测试结果汇总报告生成器
 * 整合所有测试类型的报告，生成统一的质量门禁报告
 */

const fs = require('fs');
const path = require('path');

class ConsolidatedTestReporter {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'test-results');
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.outputDir = this.reportsDir;
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 收集所有测试报告
   */
  collectReports() {
    const reports = {
      jest: this.collectJestReports(),
      playwright: this.collectPlaywrightReports(),
      n8n: this.collectN8nReports(),
      perf: this.collectPerfReports(),
      security: this.collectSecurityReports(),
      coverage: this.collectCoverageReports()
    };
    
    return reports;
  }

  /**
   * 收集Jest测试报告
   */
  collectJestReports() {
    const jestReports = [];
    
    // 查找Jest JUnit报告
    const jestJUnitPath = path.join(this.reportsDir, 'jest-junit.xml');
    if (fs.existsSync(jestJUnitPath)) {
      const junitContent = fs.readFileSync(jestJUnitPath, 'utf8');
      jestReports.push({
        type: 'junit',
        path: jestJUnitPath,
        content: junitContent,
        parsed: this.parseJUnitReport(junitContent)
      });
    }
    
    // 查找覆盖率报告
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');
    if (fs.existsSync(coverageSummaryPath)) {
      const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      jestReports.push({
        type: 'coverage',
        path: coverageSummaryPath,
        data: coverageData
      });
    }
    
    return jestReports;
  }

  /**
   * 收集Playwright测试报告
   */
  collectPlaywrightReports() {
    const playwrightReports = [];
    
    // JUnit报告
    const pwJUnitPath = path.join(this.reportsDir, 'playwright-junit.xml');
    if (fs.existsSync(pwJUnitPath)) {
      const junitContent = fs.readFileSync(pwJUnitPath, 'utf8');
      playwrightReports.push({
        type: 'junit',
        path: pwJUnitPath,
        content: junitContent,
        parsed: this.parseJUnitReport(junitContent)
      });
    }
    
    // JSON报告
    const pwJsonPath = path.join(this.reportsDir, 'playwright-results.json');
    if (fs.existsSync(pwJsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(pwJsonPath, 'utf8'));
      playwrightReports.push({
        type: 'json',
        path: pwJsonPath,
        data: jsonData
      });
    }
    
    return playwrightReports;
  }

  /**
   * 收集n8n测试报告
   */
  collectN8nReports() {
    const n8nReports = [];
    
    // 查找n8n测试结果（通常是stdout输出）
    const summaryReportPath = path.join(this.reportsDir, 'test-summary-report.json');
    if (fs.existsSync(summaryReportPath)) {
      const summaryData = JSON.parse(fs.readFileSync(summaryReportPath, 'utf8'));
      if (summaryData.details) {
        const n8nDetail = summaryData.details.find(detail => detail.name.includes('n8n'));
        if (n8nDetail) {
          n8nReports.push({
            type: 'summary',
            data: n8nDetail
          });
        }
      }
    }
    
    return n8nReports;
  }

  /**
   * 收集性能测试报告
   */
  collectPerfReports() {
    const perfReports = [];
    
    // 查找性能测试的JSON输出
    const perfReportPath = path.join(this.reportsDir, 'performance-report.json');
    if (fs.existsSync(perfReportPath)) {
      const perfData = JSON.parse(fs.readFileSync(perfReportPath, 'utf8'));
      perfReports.push({
        type: 'json',
        path: perfReportPath,
        data: perfData
      });
    }
    
    return perfReports;
  }

  /**
   * 收集安全检查报告
   */
  collectSecurityReports() {
    const securityReports = [];
    
    // 查找安全检查的JSON输出
    const securityReportPath = path.join(this.reportsDir, 'security-report.json');
    if (fs.existsSync(securityReportPath)) {
      const securityData = JSON.parse(fs.readFileSync(securityReportPath, 'utf8'));
      securityReports.push({
        type: 'json',
        path: securityReportPath,
        data: securityData
      });
    }
    
    return securityReports;
  }

  /**
   * 收集覆盖率报告
   */
  collectCoverageReports() {
    const coverageReports = [];
    
    // lcov报告
    const lcovPath = path.join(this.coverageDir, 'lcov.info');
    if (fs.existsSync(lcovPath)) {
      coverageReports.push({
        type: 'lcov',
        path: lcovPath
      });
    }
    
    // HTML报告
    const htmlIndexPath = path.join(this.coverageDir, 'index.html');
    if (fs.existsSync(htmlIndexPath)) {
      coverageReports.push({
        type: 'html',
        path: htmlIndexPath
      });
    }
    
    return coverageReports;
  }

  /**
   * 解析JUnit格式报告
   */
  parseJUnitReport(xmlContent) {
    const parser = new (require('@xmldom/xmldom').DOMParser)();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    
    const testSuites = doc.getElementsByTagName('testsuite');
    const results = [];
    
    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];
      const testCases = suite.getElementsByTagName('testcase');
      
      for (let j = 0; j < testCases.length; j++) {
        const testCase = testCases[j];
        const failure = testCase.getElementsByTagName('failure')[0];
        const skipped = testCase.getElementsByTagName('skipped')[0];
        
        results.push({
          name: testCase.getAttribute('name'),
          classname: testCase.getAttribute('classname'),
          time: parseFloat(testCase.getAttribute('time') || 0),
          status: failure ? 'failed' : (skipped ? 'skipped' : 'passed'),
          failure: failure ? failure.textContent : null
        });
      }
    }
    
    return results;
  }

  /**
   * 生成综合质量报告
   */
  generateQualityGateReport(reports) {
    const qualityReport = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: process.env.CI === 'true'
      },
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        coverage: 0,
        qualityScore: 0
      },
      details: {},
      qualityGates: {
        coverageThreshold: 80,
        passRateThreshold: 85,
        criticalFailuresAllowed: 0
      }
    };

    // 处理Jest报告
    if (reports.jest.length > 0) {
      const jestData = reports.jest.find(r => r.type === 'junit')?.parsed || [];
      const coverageData = reports.jest.find(r => r.type === 'coverage')?.data;
      
      qualityReport.details.jest = {
        total: jestData.length,
        passed: jestData.filter(t => t.status === 'passed').length,
        failed: jestData.filter(t => t.status === 'failed').length,
        skipped: jestData.filter(t => t.status === 'skipped').length
      };
      
      qualityReport.summary.totalTests += qualityReport.details.jest.total;
      qualityReport.summary.passedTests += qualityReport.details.jest.passed;
      qualityReport.summary.failedTests += qualityReport.details.jest.failed;
      qualityReport.summary.skippedTests += qualityReport.details.jest.skipped;
      
      // 覆盖率数据
      if (coverageData) {
        const totalCoverage = (
          coverageData.total.lines.pct +
          coverageData.total.functions.pct +
          coverageData.total.branches.pct
        ) / 3;
        qualityReport.summary.coverage = Math.round(totalCoverage);
      }
    }

    // 处理Playwright报告
    if (reports.playwright.length > 0) {
      const pwData = reports.playwright.find(r => r.type === 'junit')?.parsed || [];
      
      qualityReport.details.playwright = {
        total: pwData.length,
        passed: pwData.filter(t => t.status === 'passed').length,
        failed: pwData.filter(t => t.status === 'failed').length,
        skipped: pwData.filter(t => t.status === 'skipped').length
      };
      
      qualityReport.summary.totalTests += qualityReport.details.playwright.total;
      qualityReport.summary.passedTests += qualityReport.details.playwright.passed;
      qualityReport.summary.failedTests += qualityReport.details.playwright.failed;
      qualityReport.summary.skippedTests += qualityReport.details.playwright.skipped;
    }

    // 处理n8n报告
    if (reports.n8n.length > 0) {
      const n8nData = reports.n8n[0]?.data;
      if (n8nData) {
        qualityReport.details.n8n = {
          status: n8nData.status,
          passed: n8nData.status === 'passed' ? 1 : 0,
          failed: n8nData.status === 'failed' ? 1 : 0,
          total: 1
        };
        
        qualityReport.summary.totalTests += 1;
        qualityReport.summary.passedTests += qualityReport.details.n8n.passed;
        qualityReport.summary.failedTests += qualityReport.details.n8n.failed;
      }
    }

    // 计算质量分数
    const passRate = qualityReport.summary.totalTests > 0 
      ? (qualityReport.summary.passedTests / qualityReport.summary.totalTests) * 100 
      : 100;
    
    const coverageScore = qualityReport.summary.coverage;
    const failurePenalty = Math.min(qualityReport.summary.failedTests * 5, 30);
    
    qualityReport.summary.qualityScore = Math.max(
      0, 
      Math.round((passRate * 0.7 + coverageScore * 0.3 - failurePenalty))
    );

    return qualityReport;
  }

  /**
   * 生成HTML格式的综合报告
   */
  generateHTMLReport(qualityReport) {
    const passRate = qualityReport.summary.totalTests > 0 
      ? (qualityReport.summary.passedTests / qualityReport.summary.totalTests) * 100 
      : 100;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FixCycle 测试质量门禁报告</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f7fa;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .quality-score { 
            font-size: 48px; font-weight: bold; text-align: center;
            background: white; color: #667eea; width: 120px; height: 120px;
            border-radius: 50%; margin: 0 auto 20px; display: flex;
            align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .metrics-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px; margin: 30px 0;
        }
        .metric-card {
            background: white; padding: 25px; border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
        }
        .metric-card:hover { transform: translateY(-5px); }
        .metric-title { 
            font-size: 16px; color: #666; margin-bottom: 10px;
            display: flex; align-items: center;
        }
        .metric-value { 
            font-size: 32px; font-weight: bold; margin: 10px 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .details-section {
            background: white; padding: 30px; border-radius: 10px;
            margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .test-type { 
            margin: 20px 0; padding: 15px; border-left: 4px solid #667eea;
            background: #f8f9fa;
        }
        .quality-gates {
            background: #e3f2fd; padding: 20px; border-radius: 10px;
            margin: 20px 0;
        }
        .gate-item { 
            display: flex; justify-content: space-between; 
            padding: 10px 0; border-bottom: 1px solid #e0e0e0;
        }
        .gate-item:last-child { border-bottom: none; }
        .status-badge {
            padding: 5px 15px; border-radius: 20px; font-size: 14px;
            font-weight: bold;
        }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-warning { background: #fff3cd; color: #856404; }
        .progress-bar {
            height: 10px; background: #e9ecef; border-radius: 5px;
            margin: 10px 0; overflow: hidden;
        }
        .progress-fill {
            height: 100%; transition: width 0.3s ease;
        }
        .progress-high { background: #28a745; }
        .progress-medium { background: #ffc107; }
        .progress-low { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 ProdCycleAI 测试质量门禁报告</h1>
            <p>执行时间: ${qualityReport.timestamp}</p>
            <p>环境: ${qualityReport.environment.platform} (Node.js ${qualityReport.environment.nodeVersion})</p>
        </div>

        <div class="quality-score">${qualityReport.summary.qualityScore}</div>
        <h2 style="text-align: center; color: #667eea;">
            ${qualityReport.summary.qualityScore >= 80 ? '🟢 质量优秀' : 
              qualityReport.summary.qualityScore >= 60 ? '🟡 质量合格' : '🔴 需要改进'}
        </h2>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">📊 总测试数</div>
                <div class="metric-value info">${qualityReport.summary.totalTests}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">✅ 通过测试</div>
                <div class="metric-value passed">${qualityReport.summary.passedTests}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">❌ 失败测试</div>
                <div class="metric-value failed">${qualityReport.summary.failedTests}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">📈 通过率</div>
                <div class="metric-value ${passRate >= 85 ? 'passed' : 'warning'}">
                    ${passRate.toFixed(1)}%
                </div>
                <div class="progress-bar">
                    <div class="progress-fill progress-${passRate >= 85 ? 'high' : passRate >= 60 ? 'medium' : 'low'}" 
                         style="width: ${passRate}%"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-title">🎯 代码覆盖率</div>
                <div class="metric-value ${qualityReport.summary.coverage >= 80 ? 'passed' : 'warning'}">
                    ${qualityReport.summary.coverage}%
                </div>
                <div class="progress-bar">
                    <div class="progress-fill progress-${qualityReport.summary.coverage >= 80 ? 'high' : 'low'}" 
                         style="width: ${qualityReport.summary.coverage}%"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-title">🏆 质量分数</div>
                <div class="metric-value ${qualityReport.summary.qualityScore >= 80 ? 'passed' : 
                                         qualityReport.summary.qualityScore >= 60 ? 'warning' : 'failed'}">
                    ${qualityReport.summary.qualityScore}/100
                </div>
            </div>
        </div>

        <div class="quality-gates">
            <h3>⚖️ 质量门禁标准</h3>
            <div class="gate-item">
                <span>覆盖率门槛</span>
                <span class="status-badge ${qualityReport.summary.coverage >= qualityReport.qualityGates.coverageThreshold ? 'status-passed' : 'status-failed'}">
                    ${qualityReport.summary.coverage}% ≥ ${qualityReport.qualityGates.coverageThreshold}%
                </span>
            </div>
            <div class="gate-item">
                <span>通过率门槛</span>
                <span class="status-badge ${passRate >= qualityReport.qualityGates.passRateThreshold ? 'status-passed' : 'status-failed'}">
                    ${passRate.toFixed(1)}% ≥ ${qualityReport.qualityGates.passRateThreshold}%
                </span>
            </div>
            <div class="gate-item">
                <span>关键失败限制</span>
                <span class="status-badge ${qualityReport.summary.failedTests <= qualityReport.qualityGates.criticalFailuresAllowed ? 'status-passed' : 'status-failed'}">
                    ${qualityReport.summary.failedTests} ≤ ${qualityReport.qualityGates.criticalFailuresAllowed}
                </span>
            </div>
        </div>

        <div class="details-section">
            <h3>📋 详细测试结果</h3>
            
            ${Object.keys(qualityReport.details).map(type => `
            <div class="test-type">
                <h4>${this.getTypeDisplayName(type)}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div><strong>总计:</strong> ${qualityReport.details[type].total || 0}</div>
                    <div style="color: #28a745;"><strong>通过:</strong> ${qualityReport.details[type].passed || 0}</div>
                    <div style="color: #dc3545;"><strong>失败:</strong> ${qualityReport.details[type].failed || 0}</div>
                    <div style="color: #6c757d;"><strong>跳过:</strong> ${qualityReport.details[type].skipped || 0}</div>
                </div>
            </div>
            `).join('')}
        </div>

        <div class="details-section">
            <h3>📝 建议与行动项</h3>
            <ul>
                ${this.generateActionItems(qualityReport)}
            </ul>
        </div>
    </div>
</body>
</html>`;

    const outputPath = path.join(this.outputDir, 'consolidated-quality-report.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`📄 综合质量报告已生成: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * 获取测试类型显示名称
   */
  getTypeDisplayName(type) {
    const names = {
      jest: '单元测试 (Jest)',
      playwright: '端到端测试 (Playwright)',
      n8n: 'n8n工作流测试',
      perf: '性能测试',
      security: '安全检查'
    };
    return names[type] || type;
  }

  /**
   * 生成行动建议
   */
  generateActionItems(qualityReport) {
    const items = [];
    const passRate = qualityReport.summary.totalTests > 0 
      ? (qualityReport.summary.passedTests / qualityReport.summary.totalTests) * 100 
      : 100;

    if (qualityReport.summary.qualityScore >= 80) {
      items.push('<li>🎉 质量表现优秀，可以考虑部署到生产环境</li>');
      items.push('<li>📚 建议编写更多边缘案例测试</li>');
    } else if (qualityReport.summary.qualityScore >= 60) {
      items.push('<li>⚠️ 质量基本合格，但仍有改进空间</li>');
      if (passRate < 85) {
        items.push('<li>🔧 优先修复失败的测试用例</li>');
      }
      if (qualityReport.summary.coverage < 80) {
        items.push('<li>📖 增加代码覆盖率，重点关注未覆盖的业务逻辑</li>');
      }
    } else {
      items.push('<li>❌ 质量不达标，建议暂停新功能开发</li>');
      items.push('<li>🔥 优先解决所有失败的测试</li>');
      items.push('<li>📊 重点关注核心功能的稳定性和可靠性</li>');
    }

    if (qualityReport.summary.failedTests > 0) {
      items.push('<li>🐛 分析失败原因，修复关键缺陷</li>');
    }

    return items.join('');
  }

  /**
   * 生成JSON格式的综合报告
   */
  generateJSONReport(qualityReport) {
    const outputPath = path.join(this.outputDir, 'consolidated-quality-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(qualityReport, null, 2));
    console.log(`📄 JSON格式报告已生成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 主执行函数
   */
  async generateReport() {
    console.log('📊 开始生成综合测试报告...');
    
    try {
      // 收集所有报告
      const reports = this.collectReports();
      
      // 生成质量门禁报告
      const qualityReport = this.generateQualityGateReport(reports);
      
      // 生成各种格式的报告
      const htmlPath = this.generateHTMLReport(qualityReport);
      const jsonPath = this.generateJSONReport(qualityReport);
      
      // 输出摘要
      console.log('\n✅ 综合报告生成完成!');
      console.log(`📊 质量分数: ${qualityReport.summary.qualityScore}/100`);
      console.log(`📈 通过率: ${((qualityReport.summary.passedTests / qualityReport.summary.totalTests) * 100).toFixed(1)}%`);
      console.log(`🎯 覆盖率: ${qualityReport.summary.coverage}%`);
      
      // 质量门禁检查
      const gatesPassed = (
        qualityReport.summary.coverage >= qualityReport.qualityGates.coverageThreshold &&
        ((qualityReport.summary.passedTests / qualityReport.summary.totalTests) * 100) >= qualityReport.qualityGates.passRateThreshold &&
        qualityReport.summary.failedTests <= qualityReport.qualityGates.criticalFailuresAllowed
      );
      
      console.log(`\n⚖️ 质量门禁: ${gatesPassed ? '🟢 通过' : '🔴 未通过'}`);
      
      return {
        qualityReport,
        htmlPath,
        jsonPath,
        gatesPassed
      };
      
    } catch (error) {
      console.error('❌ 生成报告时出错:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const reporter = new ConsolidatedTestReporter();
  reporter.generateReport()
    .then(result => {
      if (!result.gatesPassed) {
        console.log('\n⚠️  警告: 未通过质量门禁检查');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ 报告生成失败:', error);
      process.exit(1);
    });
}

module.exports = ConsolidatedTestReporter;