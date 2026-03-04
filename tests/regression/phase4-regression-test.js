#!/usr/bin/env node

/**
 * Phase 4 回测验证脚本
 * Agent Marketplace Phase 4 Regression Test
 */

const fs = require('fs');
const path = require('path');

class Phase4RegressionTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  logTest(testName, passed, expected, actual = null, error = null) {
    this.totalTests++;
    if (passed) this.passedTests++;

    this.testResults.push({
      testName,
      passed,
      expected,
      actual,
      error,
      timestamp: new Date().toISOString(),
    });

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (!passed && error) {
      console.log(`   错误: ${error}`);
    }
  }

  // 测试文件结构
  testFileStructure() {
    console.log('\n=== 文件结构测试 ===');

    const requiredFiles = [
      'docs/modules/agent-team-management-architecture.md',
      'src/types/team-management.types.ts',
      'supabase/migrations/021_agent_team_management_module.sql',
      'src/services/agent-orchestration.service.ts',
      'src/app/team/page.tsx',
      'src/app/team/[teamId]/page.tsx',
    ];

    requiredFiles.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath);
      const exists = fs.existsSync(fullPath);
      this.logTest(
        `文件存在: ${filePath}`,
        exists,
        '文件应该存在',
        exists ? '存在' : '不存在',
        exists ? null : '文件缺失'
      );
    });
  }

  // 测试数据库迁移
  testDatabaseMigration() {
    console.log('\n=== 数据库迁移测试 ===');

    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/021_agent_team_management_module.sql'
    );
    if (fs.existsSync(migrationPath)) {
      const content = fs.readFileSync(migrationPath, 'utf8');

      // 检查关键表是否存在
      const requiredTables = [
        'team_teams',
        'team_members',
        'team_orchestrations',
        'team_execution_instances',
      ];

      requiredTables.forEach(tableName => {
        const tableExists = content.includes(
          `CREATE TABLE IF NOT EXISTS ${tableName}`
        );
        this.logTest(
          `表结构: ${tableName}`,
          tableExists,
          '应该包含表创建语句',
          tableExists ? '存在' : '不存在'
        );
      });

      // 检查RLS策略
      const rlsEnabled = content.includes('ENABLE ROW LEVEL SECURITY');
      this.logTest(
        'RLS安全策略',
        rlsEnabled,
        '应该启用行级安全',
        rlsEnabled ? '已启用' : '未启用'
      );

      // 检查触发器
      const triggersExist = content.includes('CREATE TRIGGER');
      this.logTest(
        '数据库触发器',
        triggersExist,
        '应该包含触发器定义',
        triggersExist ? '存在' : '不存在'
      );
    }
  }

  // 测试类型定义
  testTypeDefinitions() {
    console.log('\n=== 类型定义测试 ===');

    const typesPath = path.join(
      process.cwd(),
      'src/types/team-management.types.ts'
    );
    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, 'utf8');

      const requiredTypes = [
        'Team',
        'TeamMember',
        'AgentOrchestration',
        'WorkflowDefinition',
        'PermissionSet',
      ];

      requiredTypes.forEach(typeName => {
        const typeExists =
          content.includes(`export interface ${typeName}`) ||
          content.includes(`export type ${typeName}`);
        this.logTest(
          `类型定义: ${typeName}`,
          typeExists,
          '应该定义该类型',
          typeExists ? '已定义' : '未定义'
        );
      });
    }
  }

  // 测试前端页面
  testFrontendPages() {
    console.log('\n=== 前端页面测试 ===');

    const pageFiles = [
      {
        path: 'src/app/team/page.tsx',
        checks: ['useState', 'useEffect', '团队管理', '创建团队'],
      },
      {
        path: 'src/app/team/[teamId]/page.tsx',
        checks: ['useParams', '团队详情', '编排管理', '仪表板'],
      },
    ];

    pageFiles.forEach(page => {
      const fullPath = path.join(process.cwd(), page.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');

        let allChecksPassed = true;
        const failedChecks = [];

        page.checks.forEach(check => {
          if (!content.includes(check)) {
            allChecksPassed = false;
            failedChecks.push(check);
          }
        });

        this.logTest(
          `页面功能: ${path.basename(page.path)}`,
          allChecksPassed,
          '应该包含所有必要功能',
          allChecksPassed ? '功能完整' : `缺少: ${failedChecks.join(', ')}`,
          allChecksPassed ? null : '功能不完整'
        );
      }
    });
  }

  // 测试架构文档
  testArchitectureDocumentation() {
    console.log('\n=== 架构文档测试 ===');

    const docPath = path.join(
      process.cwd(),
      'docs/modules/agent-team-management-architecture.md'
    );
    if (fs.existsSync(docPath)) {
      const content = fs.readFileSync(docPath, 'utf8');

      const requiredSections = [
        '# 智能体团队管理架构设计',
        '## 1. 系统概述',
        '## 2. 核心概念',
        '## 3. 技术架构',
        '## 4. 核心功能模块',
      ];

      requiredSections.forEach(section => {
        const sectionExists = content.includes(section);
        this.logTest(
          `文档章节: ${section.substring(0, 30)}...`,
          sectionExists,
          '文档应该包含该章节',
          sectionExists ? '存在' : '不存在'
        );
      });
    }
  }

  // 生成测试报告
  generateReport() {
    const passRate =
      this.totalTests > 0
        ? ((this.passedTests / this.totalTests) * 100).toFixed(1)
        : 0;

    const report = {
      title: 'Phase 4 回测验证报告',
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.totalTests - this.passedTests,
        passRate: parseFloat(passRate),
      },
      testResults: this.testResults,
      recommendations: this.generateRecommendations(),
    };

    // 保存JSON报告
    const jsonPath = path.join(
      process.cwd(),
      'reports',
      'phase4-regression-test-report.json'
    );
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(
      process.cwd(),
      'docs',
      'reports',
      'phase4-regression-test-report.md'
    );
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`\n📊 测试完成! 通过率: ${passRate}%`);
    console.log(`📋 详细报告已保存到:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${markdownPath}`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    if (failedTests.length > 0) {
      recommendations.push('修复失败的测试项');
      failedTests.forEach(test => {
        recommendations.push(`修复: ${test.testName} - ${test.error}`);
      });
    }

    if (this.testResults.some(r => r.testName.includes('类型定义'))) {
      recommendations.push('完善TypeScript类型定义');
    }

    if (this.testResults.some(r => r.testName.includes('前端页面'))) {
      recommendations.push('增强前端页面功能和用户体验');
    }

    return recommendations;
  }

  generateMarkdownReport(report) {
    let markdown = `# Phase 4 回测验证报告\n\n`;
    markdown += `**生成时间**: ${report.timestamp}\n\n`;
    markdown += `## 测试摘要\n\n`;
    markdown += `| 指标 | 数值 |\n`;
    markdown += `|------|------|\n`;
    markdown += `| 总测试数 | ${report.summary.totalTests} |\n`;
    markdown += `| 通过测试 | ${report.summary.passedTests} |\n`;
    markdown += `| 失败测试 | ${report.summary.failedTests} |\n`;
    markdown += `| 通过率 | ${report.summary.passRate}% |\n\n`;

    markdown += `## 详细测试结果\n\n`;
    markdown += `| 测试项 | 结果 | 预期 | 实际 |\n`;
    markdown += `|--------|------|------|------|\n`;

    report.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      markdown += `| ${result.testName} | ${status} | ${result.expected} | ${result.actual || ''} |\n`;
    });

    if (report.recommendations.length > 0) {
      markdown += `\n## 建议改进\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    return markdown;
  }
}

// 执行测试
async function runPhase4RegressionTest() {
  console.log('🚀 开始执行 Phase 4 回测验证...\n');

  const tester = new Phase4RegressionTester();

  try {
    tester.testFileStructure();
    tester.testDatabaseMigration();
    tester.testTypeDefinitions();
    tester.testFrontendPages();
    tester.testArchitectureDocumentation();

    const report = tester.generateReport();

    // 如果通过率低于90%，返回失败状态
    if (report.summary.passRate < 90) {
      console.log('\n⚠️  警告: 测试通过率低于90%');
      process.exit(1);
    }

    console.log('\n✅ Phase 4 回测验证完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试执行出错:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runPhase4RegressionTest();
}

module.exports = { Phase4RegressionTester };
