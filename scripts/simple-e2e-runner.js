#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SimpleTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };
  }

  async runSingleTest(testFile, testName) {
    console.log(`\n🧪 执行测试: ${testName}`);
    console.log(`📄 测试文件: ${testFile}`);

    try {
      const command = `npx playwright test ${testFile} --project=chromium-desktop --reporter=list`;
      const result = execSync(command, {
        stdio: 'pipe',
        timeout: 120000, // 2分钟超时
      });

      const output = result.toString();
      const passed = (output.match(/✓/g) || []).length;
      const failed = (output.match(/✘|failed/gi) || []).length;

      this.results.passed += passed;
      this.results.failed += failed;
      this.results.total += passed + failed;

      this.results.details.push({
        test: testName,
        file: testFile,
        status: failed === 0 ? '✅ 通过' : '❌ 失败',
        passed,
        failed,
        output: `${output.substring(0, 500)}...`, // 截取前500字符
      });

      console.log(`📊 结果: ${passed} 通过, ${failed} 失败`);
      return failed === 0;
    } catch (error) {
      this.results.failed += 1;
      this.results.total += 1;

      this.results.details.push({
        test: testName,
        file: testFile,
        status: '❌ 错误',
        passed: 0,
        failed: 1,
        error: error.message.substring(0, 200),
      });

      console.log(`❌ 执行失败: ${error.message.substring(0, 100)}`);
      return false;
    }
  }

  async runAllTests() {
    const testSuites = [
      {
        name: 'E2E-ROLE-01: 管理员权限验证',
        file: 'tests/e2e/roles-permissions.e2e.spec.ts',
        line: '21:7',
      },
      {
        name: 'E2E-ROLE-02: 消费者权限边界',
        file: 'tests/e2e/roles-permissions.e2e.spec.ts',
        line: '76:7',
      },
      {
        name: 'E2E-REPAIR-01: 完整维修流程',
        file: 'tests/e2e/repair-workflow.e2e.spec.ts',
        line: '25:7',
      },
      {
        name: 'E2E-PARTS-01: 配件搜索比价',
        file: 'tests/e2e/parts-shop-management.e2e.spec.ts',
        line: '21:7',
      },
      {
        name: 'E2E-SHOP-01: 店铺入驻审核',
        file: 'tests/e2e/parts-shop-management.e2e.spec.ts',
        line: '143:7',
      },
      {
        name: 'E2E-FCX-01: Token经济激励',
        file: 'tests/e2e/fcx-ecosystem.e2e.spec.ts',
        line: '25:7',
      },
      {
        name: 'E2E-WMS-01: 仓储库存管理',
        file: 'tests/e2e/wms-warehouse.e2e.spec.ts',
        line: '25:7',
      },
      {
        name: 'E2E-CROSS-01: 用户数据一致性',
        file: 'tests/e2e/cross-module-consistency.e2e.spec.ts',
        line: '21:7',
      },
    ];

    console.log('🚀 开始执行端到端测试...\n');
    console.log('='.repeat(50));

    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];
      const success = await this.runSingleTest(suite.file, suite.name);

      if (success) {
        console.log(`✅ 测试 ${i + 1}/${testSuites.length} 完成`);
      } else {
        console.log(`❌ 测试 ${i + 1}/${testSuites.length} 失败`);
      }

      // 短暂延迟避免过于频繁的请求
      if (i < testSuites.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.generateSummary();
  }

  generateSummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 测试执行总结');
    console.log('='.repeat(50));

    console.log(`总计测试: ${this.results.total}`);
    console.log(`通过测试: ${this.results.passed}`);
    console.log(`失败测试: ${this.results.failed}`);
    console.log(
      `通过率: ${Math.round((this.results.passed / this.results.total) * 100)}%`
    );

    console.log('\n📋 详细结果:');
    this.results.details.forEach(detail => {
      console.log(`${detail.status} ${detail.test}`);
      console.log(`   文件: ${detail.file}`);
      console.log(`   通过: ${detail.passed}, 失败: ${detail.failed}`);
      if (detail.error) {
        console.log(`   错误: ${detail.error}`);
      }
    });

    // 生成JSON报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        passRate: Math.round((this.results.passed / this.results.total) * 100),
      },
      details: this.results.details,
    };

    const reportPath = path.join(
      process.cwd(),
      'test-results',
      'simple-e2e-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
  }
}

// 执行测试
if (require.main === module) {
  const runner = new SimpleTestRunner();
  runner.runAllTests().catch(error => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
}

module.exports = SimpleTestRunner;
