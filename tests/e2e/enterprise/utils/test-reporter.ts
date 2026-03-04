/**
 * 企业用户端E2E测试报告生成器
 * 生成详细的测试执行报告和质量分析
 */

import * as fs from 'fs';
import * as path from 'path';
import { REPORT_CONFIG, PERFORMANCE_BENCHMARKS } from '../enterprise.config';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  metadata?: any;
}

interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  testResults: TestResult[];
}

interface PerformanceMetrics {
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  percentile95: number;
  percentile99: number;
}

interface SecurityFindings {
  vulnerabilities: Array<{
    severity: 'high' | 'medium' | 'low';
    type: string;
    description: string;
    location: string;
  }>;
  passedChecks: string[];
}

interface QualityGateResult {
  name: string;
  status: 'passed' | 'failed';
  threshold: number | string;
  actual: number | string;
  message: string;
}

export class EnterpriseTestReporter {
  private results: TestSuiteResult[] = [];
  private performanceMetrics: PerformanceMetrics | null = null;
  private securityFindings: SecurityFindings | null = null;
  private startTime: number = Date.now();

  /**
   * 添加测试套件结果
   */
  addTestSuite(suiteName: string, results: TestResult[]): void {
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    this.results.push({
      suiteName,
      totalTests: results.length,
      passedTests,
      failedTests,
      skippedTests,
      duration: totalDuration,
      testResults: results,
    });
  }

  /**
   * 设置性能指标
   */
  setPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics = metrics;
  }

  /**
   * 设置安全检查结果
   */
  setSecurityFindings(findings: SecurityFindings): void {
    this.securityFindings = findings;
  }

  /**
   * 生成完整的测试报告
   */
  generateReport(): any {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    // 计算总体统计
    const totalTests = this.results.reduce(
      (sum, suite) => sum + suite.totalTests,
      0
    );
    const totalPassed = this.results.reduce(
      (sum, suite) => sum + suite.passedTests,
      0
    );
    const totalFailed = this.results.reduce(
      (sum, suite) => sum + suite.failedTests,
      0
    );
    const totalSkipped = this.results.reduce(
      (sum, suite) => sum + suite.skippedTests,
      0
    );
    const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    // 执行质量门禁检查
    const qualityGates = this.checkQualityGates(
      totalTests,
      totalPassed,
      totalFailed
    );

    // 生成报告对象
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        environment: process.env.NODE_ENV || 'test',
        version: '1.0.0',
      },
      summary: {
        totalTests,
        passedTests: totalPassed,
        failedTests: totalFailed,
        skippedTests: totalSkipped,
        passRate: parseFloat(passRate.toFixed(2)),
        totalSuites: this.results.length,
      },
      suites: this.results,
      performance: this.performanceMetrics,
      security: this.securityFindings,
      qualityGates,
      recommendations: this.generateRecommendations(
        totalTests,
        totalPassed,
        totalFailed
      ),
    };

    return report;
  }

  /**
   * 执行质量门禁检查
   */
  private checkQualityGates(
    totalTests: number,
    passed: number,
    failed: number
  ): QualityGateResult[] {
    const gates: QualityGateResult[] = [];
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    // 通过率门禁
    gates.push({
      name: 'Minimum Pass Rate',
      status:
        passRate >= REPORT_CONFIG.qualityGates.minimumPassRate
          ? 'passed'
          : 'failed',
      threshold: `${REPORT_CONFIG.qualityGates.minimumPassRate}%`,
      actual: `${passRate.toFixed(2)}%`,
      message: `测试通过率应≥${REPORT_CONFIG.qualityGates.minimumPassRate}%`,
    });

    // 失败用例数量门禁
    gates.push({
      name: 'Maximum Failure Count',
      status:
        failed <= REPORT_CONFIG.qualityGates.maximumFailureCount
          ? 'passed'
          : 'failed',
      threshold: REPORT_CONFIG.qualityGates.maximumFailureCount,
      actual: failed,
      message: `失败用例数应≤${REPORT_CONFIG.qualityGates.maximumFailureCount}`,
    });

    // 安全漏洞门禁
    if (this.securityFindings) {
      const highSeverityVulns = this.securityFindings.vulnerabilities.filter(
        v => v.severity === 'high'
      ).length;
      gates.push({
        name: 'Security Vulnerabilities',
        status:
          highSeverityVulns <=
          REPORT_CONFIG.qualityGates.securityVulnerabilities
            ? 'passed'
            : 'failed',
        threshold: REPORT_CONFIG.qualityGates.securityVulnerabilities,
        actual: highSeverityVulns,
        message: `高危安全漏洞数应≤${REPORT_CONFIG.qualityGates.securityVulnerabilities}`,
      });
    }

    // 性能基准门禁
    if (this.performanceMetrics) {
      gates.push({
        name: 'Page Load Time',
        status:
          this.performanceMetrics.avgResponseTime <=
          REPORT_CONFIG.qualityGates.performanceThreshold.pageLoadThreshold
            ? 'passed'
            : 'failed',
        threshold: `${REPORT_CONFIG.qualityGates.performanceThreshold.pageLoadThreshold}ms`,
        actual: `${this.performanceMetrics.avgResponseTime.toFixed(2)}ms`,
        message: `平均页面加载时间应≤${REPORT_CONFIG.qualityGates.performanceThreshold.pageLoadThreshold}ms`,
      });
    }

    return gates;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    totalTests: number,
    passed: number,
    failed: number
  ): string[] {
    const recommendations: string[] = [];
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    if (passRate < 90) {
      recommendations.push('测试通过率较低，建议优先修复失败的测试用例');
    }

    if (failed > 0) {
      recommendations.push(
        `存在 ${failed} 个失败的测试用例，需要分析失败原因并修复`
      );
    }

    if (
      this.securityFindings &&
      this.securityFindings.vulnerabilities.length > 0
    ) {
      const highVulns = this.securityFindings.vulnerabilities.filter(
        v => v.severity === 'high'
      ).length;
      if (highVulns > 0) {
        recommendations.push(`发现 ${highVulns} 个高危安全漏洞，建议立即修复`);
      }
    }

    if (this.performanceMetrics) {
      if (
        this.performanceMetrics.avgResponseTime >
        PERFORMANCE_BENCHMARKS.pageLoadThreshold
      ) {
        recommendations.push(
          '页面加载性能未达标，建议优化前端资源加载和后端响应'
        );
      }
    }

    if (totalTests < 100) {
      recommendations.push('测试覆盖率有待提升，建议增加更多测试用例');
    }

    return recommendations;
  }

  /**
   * 保存报告到文件
   */
  saveReport(report: any): void {
    // 确保输出目录存在
    const outputDir = path.dirname(REPORT_CONFIG.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存JSON报告
    fs.writeFileSync(REPORT_CONFIG.outputPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    this.generateHtmlReport(report);

    // 生成JUnit报告（如果需要）
    this.generateJunitReport(report);

    console.log(`\n📋 测试报告已生成:`);
    console.log(`   JSON报告: ${REPORT_CONFIG.outputPath}`);
    console.log(`   HTML报告: ${REPORT_CONFIG.htmlReportPath}/index.html`);
  }

  /**
   * 生成HTML报告
   */
  private generateHtmlReport(report: any): void {
    const htmlDir = REPORT_CONFIG.htmlReportPath;
    if (!fs.existsSync(htmlDir)) {
      fs.mkdirSync(htmlDir, { recursive: true });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企业用户端E2E测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #6c757d; margin-top: 5px; }
        .quality-gates { margin-bottom: 30px; }
        .gate-item { padding: 15px; margin: 10px 0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .gate-passed { background: #d4edda; border-left: 4px solid #28a745; }
        .gate-failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .badge-passed { background: #28a745; color: white; }
        .badge-failed { background: #dc3545; color: white; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; }
        .recommendations h3 { margin-top: 0; color: #856404; }
        .recommendations ul { margin: 10px 0; }
        .recommendations li { margin: 5px 0; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>企业用户端E2E测试报告</h1>
            <p>测试时间: ${report.metadata.timestamp}</p>
            <p>测试环境: ${report.metadata.environment}</p>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalTests}</div>
                <div class="stat-label">总测试数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #28a745;">${report.summary.passedTests}</div>
                <div class="stat-label">通过</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #dc3545;">${report.summary.failedTests}</div>
                <div class="stat-label">失败</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.passRate}%</div>
                <div class="stat-label">通过率</div>
            </div>
        </div>

        <div class="quality-gates">
            <h2>质量门禁检查</h2>
            ${report.qualityGates
              .map(
                (gate: any) => `
                <div class="gate-item ${gate.status === 'passed' ? 'gate-passed' : 'gate-failed'}">
                    <span>${gate.name}: ${gate.message}</span>
                    <span>
                        <span class="status-badge badge-${gate.status}">${gate.status === 'passed' ? '通过' : '失败'}</span>
                        实际: ${gate.actual} | 阈值: ${gate.threshold}
                    </span>
                </div>
            `
              )
              .join('')}
        </div>

        ${
          report.recommendations.length > 0
            ? `
        <div class="recommendations">
            <h3>改进建议</h3>
            <ul>
                ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        `
            : ''
        }

        <div style="margin-top: 30px; text-align: center; color: #6c757d;">
            <p>报告生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(htmlDir, 'index.html'), htmlContent);
  }

  /**
   * 生成JUnit格式报告
   */
  private generateJunitReport(report: any): void {
    const junitDir = path.dirname(REPORT_CONFIG.junitReportPath);
    if (!fs.existsSync(junitDir)) {
      fs.mkdirSync(junitDir, { recursive: true });
    }

    let junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
`;

    report.suites.forEach((suite: TestSuiteResult) => {
      junitXml += `  <testsuite name="${suite.suiteName}" tests="${suite.totalTests}" failures="${suite.failedTests}" skipped="${suite.skippedTests}" time="${(suite.duration / 1000).toFixed(3)}">
`;

      suite.testResults.forEach((test: TestResult) => {
        junitXml += `    <testcase name="${test.name}" time="${(test.duration / 1000).toFixed(3)}" classname="${suite.suiteName}">
`;
        if (test.status === 'failed') {
          junitXml += `      <failure message="${test.error || 'Test failed'}"></failure>
`;
        } else if (test.status === 'skipped') {
          junitXml += `      <skipped></skipped>
`;
        }
        junitXml += `    </testcase>
`;
      });

      junitXml += `  </testsuite>
`;
    });

    junitXml += `</testsuites>`;

    fs.writeFileSync(REPORT_CONFIG.junitReportPath, junitXml);
  }
}

// 导出便捷函数
export function createTestReporter(): EnterpriseTestReporter {
  return new EnterpriseTestReporter();
}

export default EnterpriseTestReporter;
