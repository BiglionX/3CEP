#!/usr/bin/env node

/**
 * 页面导航功能检查工具
 * 针对用户指定的页面路径进行全面的功能验证
 */

const http = require('http');
const https = require('https');

// 配置信息
const CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 10000,
  userAgent: 'Page-Navigation-Checker/1.0',
};

// 实际存在的测试页面列表
const TARGET_PAGES = [
  // 用户中心
  { name: '个人仪表板', path: '/profile/dashboard', category: '用户中心' },
  { name: '账户设置', path: '/profile/settings', category: '用户中心' },
  { name: '安全设置', path: '/profile/security', category: '用户中心' },
  { name: '用户主页', path: '/profile', category: '用户中心' },

  // 业务功能
  { name: '维修店铺', path: '/repair-shop', category: '业务功能' },
  { name: '配件商城', path: '/parts-market', category: '业务功能' },
  { name: '众筹平台', path: '/crowdfunding', category: '业务功能' },
  { name: 'FCX系统', path: '/fcx', category: '业务功能' },

  // 系统工具
  { name: '帮助中心', path: '/help', category: '系统工具' },
  { name: '意见反馈', path: '/feedback', category: '系统工具' },
  { name: '联系我们', path: '/contact', category: '系统工具' },
  { name: '关于我们', path: '/about', category: '系统工具' },

  // 其他重要页面
  { name: '首页', path: '/', category: '核心页面' },
  { name: '登录页', path: '/login', category: '核心页面' },
  { name: '注册页', path: '/register', category: '核心页面' },
];

// 关键元素检查列表
const EXPECTED_ELEMENTS = {
  用户中心: ['个人仪表板', '账户设置', '安全设置', '设备管理'],
  业务功能: ['维修店铺', '配件商城', '众筹平台', 'FCX联盟'],
  系统工具: ['帮助中心', '意见反馈', '联系我们', '关于我们'],
};

class PageNavigationChecker {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      categories: {},
      details: [],
    };
  }

  // 发送HTTP请求
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': CONFIG.userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: CONFIG.timeout,
      };

      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.request(options, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.end();
    });
  }

  // 检查页面可访问性
  async checkPageAccessibility(page) {
    const fullUrl = CONFIG.baseUrl + page.path;
    console.log(`🔍 测试: ${page.category} → ${page.name}`);
    console.log(`   路径: ${page.path}`);

    try {
      const response = await this.makeRequest(fullUrl);

      if (response.statusCode === 200) {
        // 检查关键元素
        const hasExpectedElements = this.checkExpectedElements(
          response.body,
          page.category
        );
        const hasNavigation = this.checkNavigationElements(response.body);
        const hasButtons = this.checkButtonElements(response.body);

        const isPassing = hasExpectedElements && hasNavigation && hasButtons;

        if (isPassing) {
          console.log('   ✅ 页面可访问且功能完整');
          this.results.passed++;
        } else {
          console.log('   ⚠️  页面可访问但功能可能不完整');
          console.log(`      元素检查: ${hasExpectedElements ? '✅' : '❌'}`);
          console.log(`      导航检查: ${hasNavigation ? '✅' : '❌'}`);
          console.log(`      按钮检查: ${hasButtons ? '✅' : '❌'}`);
        }

        this.results.details.push({
          category: page.category,
          page: page.name,
          path: page.path,
          status: isPassing ? 'passed' : 'partial',
          statusCode: response.statusCode,
          elementsFound: hasExpectedElements,
          navigationFound: hasNavigation,
          buttonsFound: hasButtons,
        });
      } else {
        console.log(`   ❌ 页面不可访问 (状态码: ${response.statusCode})`);
        this.results.failed++;
        this.results.details.push({
          category: page.category,
          page: page.name,
          path: page.path,
          status: 'failed',
          statusCode: response.statusCode,
          error: `HTTP ${response.statusCode}`,
        });
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        category: page.category,
        page: page.name,
        path: page.path,
        status: 'failed',
        error: error.message,
      });
    }

    console.log(''); // 分隔行
  }

  // 检查预期元素
  checkExpectedElements(html, category) {
    const elements = EXPECTED_ELEMENTS[category] || [];
    return elements.every(element => html.includes(element));
  }

  // 检查导航元素
  checkNavigationElements(html) {
    const navIndicators = [
      '<nav',
      'navigation',
      'navbar',
      'menu',
      'href=',
      'link',
      'button',
      'click',
    ];
    return navIndicators.some(indicator =>
      html.toLowerCase().includes(indicator)
    );
  }

  // 检查按钮元素
  checkButtonElements(html) {
    const buttonIndicators = [
      '<button',
      'btn',
      'submit',
      'onclick',
      'data-testid',
      'role="button"',
    ];
    return buttonIndicators.some(indicator =>
      html.toLowerCase().includes(indicator)
    );
  }

  // 按分类统计结果
  calculateCategoryStats() {
    const categories = {};

    this.results.details.forEach(detail => {
      if (!categories[detail.category]) {
        categories[detail.category] = { total: 0, passed: 0, failed: 0 };
      }

      categories[detail.category].total++;
      if (detail.status === 'passed') {
        categories[detail.category].passed++;
      } else if (detail.status === 'failed') {
        categories[detail.category].failed++;
      }
    });

    this.results.categories = categories;
  }

  // 打印结果摘要
  printSummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 页面导航功能检查结果汇总');
    console.log('='.repeat(50));

    console.log(`\n📈 总体统计:`);
    console.log(`   总测试页面: ${this.results.total}`);
    console.log(`   通过: ${this.results.passed}`);
    console.log(`   失败: ${this.results.failed}`);
    console.log(
      `   成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`
    );

    console.log(`\n📋 分类统计:`);
    Object.entries(this.results.categories).forEach(([category, stats]) => {
      const rate =
        stats.total > 0
          ? ((stats.passed / stats.total) * 100).toFixed(1)
          : '0.0';
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
    });

    // 显示失败详情
    const failedTests = this.results.details.filter(d => d.status === 'failed');
    if (failedTests.length > 0) {
      console.log(`\n❌ 失败的测试:`);
      failedTests.forEach(test => {
        console.log(
          `   • ${test.category} - ${test.page}: ${test.error || `HTTP ${test.statusCode}`}`
        );
      });
    }

    // 显示部分通过详情
    const partialTests = this.results.details.filter(
      d => d.status === 'partial'
    );
    if (partialTests.length > 0) {
      console.log(`\n⚠️  需要关注的测试:`);
      partialTests.forEach(test => {
        const issues = [];
        if (!test.elementsFound) issues.push('缺少预期元素');
        if (!test.navigationFound) issues.push('导航元素缺失');
        if (!test.buttonsFound) issues.push('按钮元素缺失');
        console.log(
          `   • ${test.category} - ${test.page}: ${issues.join(', ')}`
        );
      });
    }
  }

  // 生成详细报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(
          2
        ),
      },
      categories: this.results.categories,
      details: this.results.details,
    };

    const fs = require('fs');
    fs.writeFileSync(
      'page-navigation-check-report.json',
      JSON.stringify(report, null, 2),
      'utf8'
    );

    console.log('\n📄 详细报告已保存至: page-navigation-check-report.json');
  }

  // 主执行函数
  async run() {
    console.log('🚀 页面导航功能检查工具启动');
    console.log(`🎯 目标地址: ${CONFIG.baseUrl}`);
    console.log(`📋 测试页面数: ${TARGET_PAGES.length}\n`);

    this.results.total = TARGET_PAGES.length;

    // 逐个测试页面
    for (const page of TARGET_PAGES) {
      await this.checkPageAccessibility(page);
    }

    // 计算统计信息
    this.calculateCategoryStats();

    // 显示结果
    this.printSummary();
    this.generateReport();

    console.log('\n🎉 检查完成！');

    // 返回状态码
    return this.results.failed === 0 ? 0 : 1;
  }
}

// 执行检查
async function main() {
  try {
    const checker = new PageNavigationChecker();
    const exitCode = await checker.run();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ 执行出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PageNavigationChecker;
