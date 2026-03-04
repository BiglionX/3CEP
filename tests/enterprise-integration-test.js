#!/usr/bin/env node

/**
 * 企业服务模块集成测试脚本
 * 验证企业服务门户、管理后台和API接口的完整功能
 */

const http = require('http');
const https = require('https');

// 配置信息
const CONFIG = {
  baseUrl: 'http://localhost:3003',
  timeout: 10000,
  userAgent: 'Enterprise-Service-Tester/1.0',
};

// 企业服务相关页面列表
const ENTERPRISE_PAGES = [
  // 企业服务门户
  { name: '企业服务首页', path: '/enterprise', category: '门户页面' },
  {
    name: '智能体定制服务',
    path: '/enterprise/agents/customize',
    category: '服务页面',
  },
  {
    name: 'B2B采购服务',
    path: '/enterprise/procurement',
    category: '服务页面',
  },

  // 企业管理后台
  {
    name: '企业认证页面',
    path: '/enterprise/admin/auth',
    category: '管理页面',
  },
  {
    name: '企业管理仪表板',
    path: '/enterprise/admin/dashboard',
    category: '管理页面',
  },
  {
    name: '智能体管理页面',
    path: '/enterprise/admin/agents',
    category: '管理页面',
  },
  {
    name: '采购管理页面',
    path: '/enterprise/admin/procurement',
    category: '管理页面',
  },
];

// 企业服务API端点
const ENTERPRISE_APIS = [
  {
    name: '企业注册接口',
    path: '/api/enterprise/register',
    method: 'POST',
    category: '认证API',
  },
  {
    name: '企业登录接口',
    path: '/api/enterprise/login',
    method: 'POST',
    category: '认证API',
  },
  {
    name: '智能体列表接口',
    path: '/api/enterprise/agents',
    method: 'GET',
    category: '业务API',
  },
  {
    name: '采购订单接口',
    path: '/api/enterprise/procurement/orders',
    method: 'GET',
    category: '业务API',
  },
];

// HTTP请求工具函数
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.setTimeout(CONFIG.timeout, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// 测试单个页面
async function testPage(page) {
  const startTime = Date.now();

  try {
    const url = new URL(CONFIG.baseUrl + page.path);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': CONFIG.userAgent,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      protocol: url.protocol,
    };

    const response = await makeRequest(options);
    const responseTime = Date.now() - startTime;

    const isSuccess = response.statusCode === 200;
    const hasHtmlContent =
      response.data.includes('<html') || response.data.includes('<div');

    return {
      page: page.name,
      path: page.path,
      category: page.category,
      status: isSuccess ? 'PASS' : 'FAIL',
      statusCode: response.statusCode,
      responseTime: responseTime,
      hasContent: hasHtmlContent,
      errorMessage: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      page: page.name,
      path: page.path,
      category: page.category,
      status: 'ERROR',
      statusCode: null,
      responseTime: responseTime,
      hasContent: false,
      errorMessage: error.message,
    };
  }
}

// 测试API接口
async function testApi(api) {
  const startTime = Date.now();

  try {
    const url = new URL(CONFIG.baseUrl + api.path);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: api.method,
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      protocol: url.protocol,
    };

    // 为POST请求准备测试数据
    let postData = null;
    if (api.method === 'POST') {
      if (api.path.includes('register')) {
        postData = JSON.stringify({
          companyName: '测试企业有限公司',
          businessLicense: '91310000MA12345678',
          contactPerson: '测试联系人',
          phone: '13800138000',
          email: 'test@enterprise.com',
          password: 'Test123456',
        });
      } else if (api.path.includes('login')) {
        postData = JSON.stringify({
          email: 'test@enterprise.com',
          password: 'Test123456',
        });
      }
    }

    const response = await makeRequest(options, postData);
    const responseTime = Date.now() - startTime;

    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const isJson =
      response.headers['content-type'] &&
      response.headers['content-type'].includes('application/json');

    let responseData = null;
    if (isJson) {
      try {
        responseData = JSON.parse(response.data);
      } catch (e) {
        // 解析JSON失败
      }
    }

    return {
      api: api.name,
      path: api.path,
      method: api.method,
      category: api.category,
      status: isSuccess ? 'PASS' : 'FAIL',
      statusCode: response.statusCode,
      responseTime: responseTime,
      isJson: isJson,
      responseData: responseData,
      errorMessage: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      api: api.name,
      path: api.path,
      method: api.method,
      category: api.category,
      status: 'ERROR',
      statusCode: null,
      responseTime: responseTime,
      isJson: false,
      responseData: null,
      errorMessage: error.message,
    };
  }
}

// 运行完整测试
async function runIntegrationTest() {
  console.log('🚀 企业服务模块集成测试开始');
  console.log('='.repeat(60));
  console.log(`测试目标: ${CONFIG.baseUrl}`);
  console.log(`测试时间: ${new Date().toISOString()}`);
  console.log('');

  // 测试页面访问
  console.log('📋 页面访问测试');
  console.log('-'.repeat(40));

  const pageResults = [];
  for (const page of ENTERPRISE_PAGES) {
    const result = await testPage(page);
    pageResults.push(result);

    const statusIcon =
      result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.page} (${result.category})`);
    console.log(`   路径: ${result.path}`);
    console.log(
      `   状态码: ${result.statusCode || 'N/A'} | 响应时间: ${result.responseTime}ms`
    );
    if (result.errorMessage) {
      console.log(`   错误: ${result.errorMessage}`);
    }
    console.log('');
  }

  // 测试API接口
  console.log('🔌 API接口测试');
  console.log('-'.repeat(40));

  const apiResults = [];
  for (const api of ENTERPRISE_APIS) {
    const result = await testApi(api);
    apiResults.push(result);

    const statusIcon =
      result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.api} (${result.category})`);
    console.log(`   方法: ${result.method} | 路径: ${result.path}`);
    console.log(
      `   状态码: ${result.statusCode || 'N/A'} | 响应时间: ${result.responseTime}ms`
    );
    if (result.isJson && result.responseData) {
      if (result.responseData.success !== undefined) {
        console.log(
          `   响应: ${result.responseData.success ? '成功' : '失败'}`
        );
      }
    }
    if (result.errorMessage) {
      console.log(`   错误: ${result.errorMessage}`);
    }
    console.log('');
  }

  // 生成测试报告
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));

  const totalTests = pageResults.length + apiResults.length;
  const passedTests = [...pageResults, ...apiResults].filter(
    r => r.status === 'PASS'
  ).length;
  const failedTests = [...pageResults, ...apiResults].filter(
    r => r.status === 'FAIL'
  ).length;
  const errorTests = [...pageResults, ...apiResults].filter(
    r => r.status === 'ERROR'
  ).length;

  console.log(`总测试数: ${totalTests}`);
  console.log(
    `✅ 通过: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`
  );
  console.log(
    `❌ 失败: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`
  );
  console.log(
    `⚠️  错误: ${errorTests} (${((errorTests / totalTests) * 100).toFixed(1)}%)`
  );

  // 分类统计
  console.log('\n📈 分类统计:');

  const categories = [
    ...new Set([...pageResults, ...apiResults].map(r => r.category)),
  ];
  categories.forEach(category => {
    const categoryTests = [...pageResults, ...apiResults].filter(
      r => r.category === category
    );
    const categoryPassed = categoryTests.filter(
      r => r.status === 'PASS'
    ).length;
    const categoryTotal = categoryTests.length;
    console.log(
      `${category}: ${categoryPassed}/${categoryTotal} 通过 (${((categoryPassed / categoryTotal) * 100).toFixed(1)}%)`
    );
  });

  // 性能统计
  console.log('\n⚡ 性能统计:');
  const allResponseTimes = [...pageResults, ...apiResults].map(
    r => r.responseTime
  );
  const avgResponseTime =
    allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
  const maxResponseTime = Math.max(...allResponseTimes);
  const minResponseTime = Math.min(...allResponseTimes);

  console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`最快响应时间: ${minResponseTime}ms`);
  console.log(`最慢响应时间: ${maxResponseTime}ms`);

  // 生成详细报告文件
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      errors: errorTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2),
    },
    pages: pageResults,
    apis: apiResults,
    performance: {
      averageResponseTime: avgResponseTime,
      maxResponseTime: maxResponseTime,
      minResponseTime: minResponseTime,
    },
  };

  const fs = require('fs');
  const reportPath = './enterprise-integration-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 详细测试报告已保存到: ${reportPath}`);

  // 返回测试结果
  return {
    success: passedTests === totalTests,
    summary: report.summary,
    reportPath: reportPath,
  };
}

// 执行测试
if (require.main === module) {
  runIntegrationTest()
    .then(result => {
      console.log(`\n${'='.repeat(60)}`);
      if (result.success) {
        console.log('🎉 所有测试通过！企业服务模块功能正常');
      } else {
        console.log('⚠️  部分测试未通过，请检查上述错误信息');
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTest };
