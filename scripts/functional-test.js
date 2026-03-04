#!/usr/bin/env node

/**
 * 迁移后功能测试脚本
 * 测试统一认证组件在各业务场景下的实际功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 迁移后功能测试');
console.log('====================\n');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3002',
  testAccounts: {
    admin: {
      email: '1055603323@qq.com',
      password: '12345678',
      is_admin: true,
    },
    user: {
      email: 'test@example.com',
      password: 'password123',
      is_admin: false,
    },
  },

  // 要测试的页面路径
  testPages: [
    {
      path: '/login',
      name: '主登录页面',
      expectedElements: ['欢迎回来', '邮箱地址', '密码', '登录'],
    },
    {
      path: '/admin/login',
      name: '管理员登录页面',
      expectedElements: ['管理后台登录', '管理员凭证'],
      adminOnly: true,
    },
    {
      path: '/brand/login',
      name: '品牌商登录页面',
      expectedElements: ['品牌商平台', '电子产品回收'],
    },
    {
      path: '/repair-shop/login',
      name: '维修店登录页面',
      expectedElements: ['维修师平台', '设备维修'],
    },
    {
      path: '/importer/login',
      name: '进口商登录页面',
      expectedElements: ['贸易平台', '进出口业务'],
    },
    {
      path: '/exporter/login',
      name: '出口商登录页面',
      expectedElements: ['贸易平台', '进出口业务'],
    },
  ],
};

// 简单的HTTP客户端（绕过浏览器自动化复杂性）
class SimpleHttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(path) {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const url = require('url');

      const parsedUrl = url.parse(this.baseUrl + path);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'GET',
        headers: {
          'User-Agent': 'MigrationTestBot/1.0',
        },
      };

      const req = http.request(options, res => {
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

      req.end();
    });
  }

  // 模拟登录请求
  async postLogin(email, password) {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const url = require('url');

      const parsedUrl = url.parse(`${this.baseUrl}/api/auth/login`);

      const postData = JSON.stringify({
        email: email,
        password: password,
      });

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'MigrationTestBot/1.0',
        },
      };

      const req = http.request(options, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: jsonData,
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
            });
          }
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}

// 测试执行器
class FunctionalTester {
  constructor(config) {
    this.config = config;
    this.client = new SimpleHttpClient(config.baseUrl);
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: [],
    };
  }

  async runAllTests() {
    console.log('🚀 开始功能测试...\n');

    // 1. 测试页面可访问性
    await this.testPageAccessibility();

    // 2. 测试API端点
    await this.testApiEndpoints();

    // 3. 测试登录功能
    await this.testLoginFunctionality();

    // 输出结果
    this.printResults();
    this.generateReport();
  }

  async testPageAccessibility() {
    console.log('🌐 测试页面可访问性...\n');

    for (const page of this.config.testPages) {
      this.results.totalTests++;

      try {
        console.log(`测试: ${page.name} (${page.path})`);

        const response = await this.client.get(page.path);

        if (response.statusCode === 200) {
          // 检查页面内容
          const hasExpectedElements = page.expectedElements.every(element =>
            response.body.includes(element)
          );

          if (hasExpectedElements) {
            console.log('   ✅ 页面可访问且内容正确');
            this.results.passedTests++;
            this.results.details.push({
              test: `${page.name} 可访问性`,
              status: 'passed',
              path: page.path,
              statusCode: response.statusCode,
            });
          } else {
            console.log('   ⚠️  页面可访问但内容可能不完整');
            this.results.details.push({
              test: `${page.name} 内容验证`,
              status: 'warning',
              path: page.path,
              statusCode: response.statusCode,
              message: '页面内容不完整',
            });
          }
        } else {
          console.log(`   ❌ 页面不可访问 (状态码: ${response.statusCode})`);
          this.results.failedTests++;
          this.results.details.push({
            test: `${page.name} 可访问性`,
            status: 'failed',
            path: page.path,
            statusCode: response.statusCode,
          });
        }
      } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
        this.results.failedTests++;
        this.results.details.push({
          test: `${page.name} 可访问性`,
          status: 'failed',
          path: page.path,
          error: error.message,
        });
      }

      console.log(''); // 空行分隔
    }
  }

  async testApiEndpoints() {
    console.log('🔌 测试API端点...\n');

    const apiEndpoints = ['/api/health', '/api/auth/check-session'];

    for (const endpoint of apiEndpoints) {
      this.results.totalTests++;

      try {
        console.log(`测试: ${endpoint}`);
        const response = await this.client.get(endpoint);

        if (response.statusCode === 200) {
          console.log('   ✅ API端点正常');
          this.results.passedTests++;
          this.results.details.push({
            test: `API ${endpoint}`,
            status: 'passed',
            endpoint: endpoint,
            statusCode: response.statusCode,
          });
        } else {
          console.log(`   ⚠️  API响应异常 (状态码: ${response.statusCode})`);
          this.results.details.push({
            test: `API ${endpoint}`,
            status: 'warning',
            endpoint: endpoint,
            statusCode: response.statusCode,
          });
        }
      } catch (error) {
        console.log(`   ❌ API测试失败: ${error.message}`);
        this.results.failedTests++;
        this.results.details.push({
          test: `API ${endpoint}`,
          status: 'failed',
          endpoint: endpoint,
          error: error.message,
        });
      }

      console.log(''); // 空行分隔
    }
  }

  async testLoginFunctionality() {
    console.log('🔐 测试登录功能...\n');

    // 测试管理员登录
    await this.testLoginScenario('管理员登录', this.config.testAccounts.admin);

    // 测试普通用户登录
    await this.testLoginScenario('普通用户登录', this.config.testAccounts.user);
  }

  async testLoginScenario(scenarioName, account) {
    this.results.totalTests++;

    try {
      console.log(`测试: ${scenarioName}`);
      console.log(`   账户: ${account.email}`);

      const response = await this.client.postLogin(
        account.email,
        account.password
      );

      if (response.statusCode === 200) {
        const data = response.body;
        if (data && data.success) {
          console.log('   ✅ 登录成功');
          console.log(`   用户ID: ${data.user?.id?.substring(0, 8) || 'N/A'}`);
          console.log(`   管理员: ${data.user?.is_admin || false}`);

          this.results.passedTests++;
          this.results.details.push({
            test: scenarioName,
            status: 'passed',
            account: account.email,
            userId: data.user?.id,
            isAdmin: data.user?.is_admin,
          });
        } else {
          console.log(`   ❌ 登录失败: ${data.error || '未知错误'}`);
          this.results.failedTests++;
          this.results.details.push({
            test: scenarioName,
            status: 'failed',
            account: account.email,
            error: data.error || '登录失败',
          });
        }
      } else {
        console.log(`   ❌ API错误 (状态码: ${response.statusCode})`);
        this.results.failedTests++;
        this.results.details.push({
          test: scenarioName,
          status: 'failed',
          account: account.email,
          statusCode: response.statusCode,
          error: 'API响应错误',
        });
      }
    } catch (error) {
      console.log(`   ❌ 测试异常: ${error.message}`);
      this.results.failedTests++;
      this.results.details.push({
        test: scenarioName,
        status: 'failed',
        account: account.email,
        error: error.message,
      });
    }

    console.log(''); // 空行分隔
  }

  printResults() {
    console.log('📊 测试结果汇总');
    console.log('================');

    const successRate =
      this.results.totalTests > 0
        ? ((this.results.passedTests / this.results.totalTests) * 100).toFixed(
            1
          )
        : '0';

    console.log(`总测试数: ${this.results.totalTests}`);
    console.log(`通过测试: ${this.results.passedTests}`);
    console.log(`失败测试: ${this.results.failedTests}`);
    console.log(`成功率: ${successRate}%`);

    // 按状态分组显示
    const passedTests = this.results.details.filter(d => d.status === 'passed');
    const failedTests = this.results.details.filter(d => d.status === 'failed');
    const warningTests = this.results.details.filter(
      d => d.status === 'warning'
    );

    if (passedTests.length > 0) {
      console.log('\n✅ 通过的测试:');
      passedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.test}`);
      });
    }

    if (warningTests.length > 0) {
      console.log('\n⚠️  警告的测试:');
      warningTests.forEach((test, index) => {
        console.log(
          `   ${index + 1}. ${test.test} - ${test.message || '警告'}`
        );
      });
    }

    if (failedTests.length > 0) {
      console.log('\n❌ 失败的测试:');
      failedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.test} - ${test.error || '失败'}`);
      });
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      server: this.config.baseUrl,
      summary: {
        totalTests: this.results.totalTests,
        passedTests: this.results.passedTests,
        failedTests: this.results.failedTests,
        successRate:
          this.results.totalTests > 0
            ? `${(
                (this.results.passedTests / this.results.totalTests) *
                100
              ).toFixed(2)}%`
            : '0%',
      },
      details: this.results.details,
      testAccounts: this.config.testAccounts,
    };

    const reportPath = path.join(process.cwd(), 'functional-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(
      `\n📄 详细报告已保存至: ${path.relative(process.cwd(), reportPath)}`
    );
  }
}

// 主执行函数
async function main() {
  try {
    const tester = new FunctionalTester(testConfig);
    await tester.runAllTests();

    console.log('\n🎉 功能测试完成！');

    // 根据结果提供建议
    const successRate =
      tester.results.totalTests > 0
        ? tester.results.passedTests / tester.results.totalTests
        : 0;

    if (successRate >= 0.8) {
      console.log('\n✅ 迁移非常成功！大部分功能正常工作。');
      console.log('建议: 可以正式上线使用');
    } else if (successRate >= 0.5) {
      console.log('\n⚠️  迁移基本成功，但需要修复一些问题。');
      console.log('建议: 修复失败的测试项后再上线');
    } else {
      console.log('\n❌ 迁移存在问题，需要深入调查。');
      console.log('建议: 暂停上线，彻底排查问题');
    }
  } catch (error) {
    console.error('❌ 测试执行过程中发生严重错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { FunctionalTester, SimpleHttpClient };
