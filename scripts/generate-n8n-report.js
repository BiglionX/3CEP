/**
 * n8n 测试结果收集和报告生成器
 * 自动生成详细的测试报告并归档到指定目录
 */

const fs = require('fs');
const path = require('path');

class N8nTestReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './test-results/n8n-workflow-tests';
    this.reportRetentionDays = options.retentionDays || 30;
    this.minPassRate = options.minPassRate || 95;
  }

  /**
   * 生成详细的测试报告
   */
  generateDetailedReport(testResults, metadata = {}) {
    const timestamp = new Date().toISOString();
    const reportId = `n8n-test-report-${Date.now()}`;
    
    const report = {
      id: reportId,
      timestamp: timestamp,
      environment: process.env.DEPLOY_ENV || 'unknown',
      git: {
        commit: process.env.GITHUB_SHA || 'unknown',
        branch: process.env.GITHUB_REF || 'unknown',
        actor: process.env.GITHUB_ACTOR || 'unknown'
      },
      metadata: metadata,
      summary: {
        total_tests: testResults.length,
        passed: testResults.filter(t => t.status === 'PASS').length,
        failed: testResults.filter(t => t.status === 'FAIL').length,
        skipped: testResults.filter(t => t.status === 'SKIP').length,
        errors: testResults.filter(t => t.status === 'ERROR').length,
        timeouts: testResults.filter(t => t.status === 'TIMEOUT').length
      },
      performance: {
        total_duration_ms: testResults.reduce((sum, t) => sum + (t.duration || 0), 0),
        average_duration_ms: testResults.length > 0 ? 
          Math.round(testResults.reduce((sum, t) => sum + (t.duration || 0), 0) / testResults.length) : 0,
        min_duration_ms: testResults.length > 0 ? 
          Math.min(...testResults.map(t => t.duration || 0)) : 0,
        max_duration_ms: testResults.length > 0 ? 
          Math.max(...testResults.map(t => t.duration || 0)) : 0
      },
      details: testResults.map(result => ({
        test_case: result.test_case || result.name,
        workflow: result.workflow,
        status: result.status,
        duration_ms: result.duration || 0,
        error_message: result.error || null,
        performance_metrics: result.metrics || {},
        timestamp: result.timestamp || timestamp
      })),
      recommendations: [],
      health_score: 0
    };

    // 计算通过率
    const passRate = report.summary.total_tests > 0 ? 
      (report.summary.passed / report.summary.total_tests * 100) : 0;
    report.summary.pass_rate = `${passRate.toFixed(2)}%`;

    // 生成建议
    if (report.summary.failed > 0) {
      report.recommendations.push(`${report.summary.failed}个测试用例失败，请检查相应的工作流配置`);
    }

    if (report.summary.errors > 0) {
      report.recommendations.push(`${report.summary.errors}个测试出现错误，请排查技术问题`);
    }

    if (report.summary.timeouts > 0) {
      report.recommendations.push(`${report.summary.timeouts}个测试超时，请优化性能`);
    }

    if (passRate < this.minPassRate) {
      report.recommendations.push(`测试通过率${passRate.toFixed(2)}%低于最低要求${this.minPassRate}%，建议暂停部署`);
    }

    // 计算健康分数 (0-100)
    const healthComponents = [
      { weight: 0.4, score: passRate }, // 通过率权重40%
      { weight: 0.3, score: report.summary.errors === 0 ? 100 : Math.max(0, 100 - report.summary.errors * 10) }, // 错误权重30%
      { weight: 0.2, score: report.summary.timeouts === 0 ? 100 : Math.max(0, 100 - report.summary.timeouts * 20) }, // 超时权重20%
      { weight: 0.1, score: report.performance.average_duration_ms < 5000 ? 100 : 
                         Math.max(0, 100 - (report.performance.average_duration_ms - 5000) / 100) } // 性能权重10%
    ];

    report.health_score = Math.round(
      healthComponents.reduce((sum, component) => sum + (component.score * component.weight), 0)
    );

    // 添加健康等级
    if (report.health_score >= 90) {
      report.health_level = 'EXCELLENT';
      report.health_description = '系统健康状况优秀';
    } else if (report.health_score >= 75) {
      report.health_level = 'GOOD';
      report.health_description = '系统健康状况良好';
    } else if (report.health_score >= 60) {
      report.health_level = 'FAIR';
      report.health_description = '系统健康状况一般';
    } else {
      report.health_level = 'POOR';
      report.health_description = '系统健康状况较差';
    }

    return report;
  }

  /**
   * 保存报告到文件
   */
  saveReport(report) {
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const reportFileName = `n8n-test-report-${timestamp}.json`;
    const latestReportFileName = 'latest-report.json';
    const historicalDir = path.join(this.outputDir, 'historical');

    // 确保历史目录存在
    if (!fs.existsSync(historicalDir)) {
      fs.mkdirSync(historicalDir, { recursive: true });
    }

    const reportPath = path.join(this.outputDir, reportFileName);
    const latestPath = path.join(this.outputDir, latestReportFileName);
    const historicalPath = path.join(historicalDir, reportFileName);

    try {
      // 保存完整报告
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`✅ 测试报告已保存: ${reportPath}`);

      // 更新最新报告
      fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
      console.log(`✅ 最新报告已更新: ${latestPath}`);

      // 保存到历史目录
      fs.writeFileSync(historicalPath, JSON.stringify(report, null, 2));
      console.log(`✅ 历史报告已保存: ${historicalPath}`);

      return {
        main: reportPath,
        latest: latestPath,
        historical: historicalPath
      };
    } catch (error) {
      console.error('❌ 保存报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成人类可读的报告
   */
  generateHumanReadableReport(report) {
    const sections = [];

    // 标题
    sections.push('# n8n 工作流测试报告');
    sections.push(`**生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}`);
    sections.push(`**环境**: ${report.environment}`);
    sections.push(`**Git提交**: ${report.git.commit?.substring(0, 8) || 'unknown'}`);
    sections.push('');

    // 摘要
    sections.push('## 📊 测试摘要');
    sections.push('| 指标 | 数值 |');
    sections.push('|------|------|');
    sections.push(`| 总测试数 | ${report.summary.total_tests} |`);
    sections.push(`| 通过 | ${report.summary.passed} |`);
    sections.push(`| 失败 | ${report.summary.failed} |`);
    sections.push(`| 错误 | ${report.summary.errors} |`);
    sections.push(`| 超时 | ${report.summary.timeouts} |`);
    sections.push(`| 通过率 | ${report.summary.pass_rate} |`);
    sections.push(`| 健康分数 | ${report.health_score}/100 (${report.health_level}) |`);
    sections.push('');

    // 性能指标
    sections.push('## ⚡ 性能指标');
    sections.push('| 指标 | 数值 |');
    sections.push('|------|------|');
    sections.push(`| 总耗时 | ${report.performance.total_duration_ms}ms |`);
    sections.push(`| 平均耗时 | ${report.performance.average_duration_ms}ms |`);
    sections.push(`| 最短耗时 | ${report.performance.min_duration_ms}ms |`);
    sections.push(`| 最长耗时 | ${report.performance.max_duration_ms}ms |`);
    sections.push('');

    // 详细结果
    if (report.details.length > 0) {
      sections.push('## 🧪 详细测试结果');
      sections.push('| 测试用例 | 工作流 | 状态 | 耗时 |');
      sections.push('|----------|--------|------|------|');
      
      report.details.forEach(detail => {
        const statusIcon = this.getStatusIcon(detail.status);
        sections.push(`| ${detail.test_case} | ${detail.workflow} | ${statusIcon} ${detail.status} | ${detail.duration_ms}ms |`);
      });
      sections.push('');
    }

    // 错误详情
    const failedTests = report.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
    if (failedTests.length > 0) {
      sections.push('## ❌ 失败详情');
      failedTests.forEach((test, index) => {
        sections.push(`### ${index + 1}. ${test.test_case}`);
        sections.push(`**工作流**: ${test.workflow}`);
        sections.push(`**状态**: ${test.status}`);
        sections.push(`**错误信息**: ${test.error_message || '无详细信息'}`);
        sections.push('');
      });
    }

    // 建议
    if (report.recommendations.length > 0) {
      sections.push('## 💡 建议和改进');
      report.recommendations.forEach((rec, index) => {
        sections.push(`${index + 1}. ${rec}`);
      });
      sections.push('');
    }

    // 健康评估
    sections.push('## 🏥 系统健康评估');
    sections.push(`**健康等级**: ${report.health_level}`);
    sections.push(`**评估描述**: ${report.health_description}`);
    sections.push(`**健康分数**: ${report.health_score}/100`);

    if (report.health_score < 75) {
      sections.push('> ⚠️ 建议进行深入调查和性能优化');
    } else if (report.health_score < 90) {
      sections.push('> ✅ 系统运行正常，可考虑进一步优化');
    } else {
      sections.push('> 🎉 系统健康状况优秀');
    }

    return sections.join('\n');
  }

  /**
   * 获取状态图标
   */
  getStatusIcon(status) {
    const icons = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '💥',
      'TIMEOUT': '⏰',
      'SKIP': '⏭️'
    };
    return icons[status] || '❓';
  }

  /**
   * 清理过期报告
   */
  cleanupOldReports() {
    const historicalDir = path.join(this.outputDir, 'historical');
    if (!fs.existsSync(historicalDir)) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.reportRetentionDays);

    try {
      const files = fs.readdirSync(historicalDir);
      let deletedCount = 0;

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(historicalDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`🗑️  已删除过期报告: ${file}`);
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`✅ 共清理 ${deletedCount} 个过期报告`);
      }
    } catch (error) {
      console.error('❌ 清理过期报告失败:', error.message);
    }
  }

  /**
   * 生成仪表板数据
   */
  generateDashboardData(reports) {
    const dashboard = {
      generated_at: new Date().toISOString(),
      report_count: reports.length,
      trends: {
        pass_rate: [],
        health_score: [],
        total_tests: []
      },
      summary_stats: {
        avg_pass_rate: 0,
        avg_health_score: 0,
        total_executions: 0
      }
    };

    // 计算趋势数据
    reports.slice(-30).forEach(report => { // 最近30次报告
      dashboard.trends.pass_rate.push({
        date: report.timestamp.split('T')[0],
        value: parseFloat(report.summary.pass_rate)
      });
      
      dashboard.trends.health_score.push({
        date: report.timestamp.split('T')[0],
        value: report.health_score
      });
      
      dashboard.trends.total_tests.push({
        date: report.timestamp.split('T')[0],
        value: report.summary.total_tests
      });
    });

    // 计算汇总统计
    if (reports.length > 0) {
      const passRates = reports.map(r => parseFloat(r.summary.pass_rate));
      const healthScores = reports.map(r => r.health_score);
      const totalTests = reports.map(r => r.summary.total_tests);

      dashboard.summary_stats.avg_pass_rate = Math.round(
        passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length
      );
      
      dashboard.summary_stats.avg_health_score = Math.round(
        healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
      );
      
      dashboard.summary_stats.total_executions = totalTests.reduce((sum, count) => sum + count, 0);
    }

    return dashboard;
  }
}

module.exports = N8nTestReporter;

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  const reporter = new N8nTestReporter();
  
  // 示例测试结果
  const sampleResults = [
    {
      test_case: '基础采购需求解析',
      workflow: 'b2b-procurement-basic',
      status: 'PASS',
      duration: 156,
      metrics: { response_time: 120, memory_usage: '45MB' }
    },
    {
      test_case: '高级采购需求解析',
      workflow: 'b2b-procurement-advanced',
      status: 'PASS',
      duration: 234,
      metrics: { response_time: 180, memory_usage: '67MB' }
    },
    {
      test_case: '支付成功处理',
      workflow: 'payment-success',
      status: 'FAIL',
      duration: 312,
      error: 'API调用超时',
      metrics: { response_time: 5000, memory_usage: '89MB' }
    }
  ];

  const report = reporter.generateDetailedReport(sampleResults, {
    test_type: 'regression',
    triggered_by: 'scheduled'
  });

  console.log('生成的报告:');
  console.log(JSON.stringify(report, null, 2));

  // 保存报告
  const savedPaths = reporter.saveReport(report);
  console.log('报告保存路径:', savedPaths);

  // 生成人类可读报告
  const humanReport = reporter.generateHumanReadableReport(report);
  console.log('\n人类可读报告:');
  console.log(humanReport);
}