/**
 * 多类型用户注册功能 - 自动化测试脚本
 *
 * 使用说明:
 * 1. 确保开发服务器已启动 (npm run dev)
 * 2. 确保数据库表已创建
 * 3. 运行此脚本进行自动化测试
 *
 * 运行方式：node scripts/test-registration.js
 */

const https = require('https');
const http = require('http');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testUsers: [
    {
      type: 'individual',
      name: '测试个人用户',
      phone: '13800138001',
      email: `test_individual_${Date.now()}@test.com`,
      password: 'Test123456',
      confirmPassword: 'Test123456',
    },
    {
      type: 'repair_shop',
      name: '测试维修店联系人',
      phone: '13800138002',
      shopName: '测试维修店',
      email: `test_repairshop_${Date.now()}@test.com`,
      password: 'Test123456',
      confirmPassword: 'Test123456',
    },
    {
      type: 'enterprise',
      name: '测试企业联系人',
      phone: '13800138003',
      companyName: '测试企业公司',
      email: `test_enterprise_${Date.now()}@test.com`,
      password: 'Test123456',
      confirmPassword: 'Test123456',
    },
    {
      type: 'foreign_trade_company',
      name: '测试外贸联系人',
      phone: '13800138004',
      companyName: '测试外贸公司',
      email: `test_foreigntrade_${Date.now()}@test.com`,
      password: 'Test123456',
      confirmPassword: 'Test123456',
    },
  ],
};

// 测试结果统计
const testResults = {
  total: 0,
  success: 0,
  failed: 0,
  details: [],
};

/**
 * 发送 HTTP POST 请求
 */
function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    const options = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 80,
      path: new URL(url).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': jsonData.length,
      },
    };

    const req = http.request(options, res => {
      let responseBody = '';

      res.on('data', chunk => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseBody);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: response,
          });
        } catch (error) {
          reject(new Error(`响应解析失败：${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

/**
 * 测试单个用户类型注册
 */
async function testUserRegistration(testUser) {
  const testName = `${testUser.type} 用户注册`;
  console.log(`\n📝 开始测试：${testName}`);
  console.log(`   邮箱：${testUser.email}`);

  testResults.total++;

  try {
    // 检查 API 是否可访问
    const apiUrl = `${TEST_CONFIG.baseUrl}/api/auth/register`;

    const response = await postRequest(apiUrl, testUser);

    if (response.statusCode === 200 && response.data.success) {
      console.log(`✅ ${testName} - 成功`);
      console.log(`   用户 ID: ${response.data.user?.id || 'N/A'}`);
      console.log(`   用户类型：${response.data.user?.user_type || 'N/A'}`);
      console.log(`   账户类型：${response.data.user?.account_type || 'N/A'}`);

      testResults.success++;
      testResults.details.push({
        test: testName,
        status: 'success',
        email: testUser.email,
        userId: response.data.user?.id,
        userType: response.data.user?.user_type,
        accountType: response.data.user?.account_type,
      });

      return true;
    } else {
      console.log(`❌ ${testName} - 失败`);
      console.log(`   状态码：${response.statusCode}`);
      console.log(`   错误信息：${response.data.error || '未知错误'}`);

      testResults.failed++;
      testResults.details.push({
        test: testName,
        status: 'failed',
        email: testUser.email,
        error: response.data.error || '未知错误',
      });

      return false;
    }
  } catch (error) {
    console.log(`❌ ${testName} - 异常`);
    console.log(`   错误：${error.message}`);

    testResults.failed++;
    testResults.details.push({
      test: testName,
      status: 'error',
      email: testUser.email,
      error: error.message,
    });

    return false;
  }
}

/**
 * 验证表单字段
 */
function validateFormData() {
  console.log('\n🔍 验证表单数据结构...');

  const requiredFields = [
    'type',
    'name',
    'phone',
    'email',
    'password',
    'confirmPassword',
  ];
  let allValid = true;

  TEST_CONFIG.testUsers.forEach((user, index) => {
    const missingFields = requiredFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
      console.log(
        `❌ 测试用户 ${index + 1} 缺少必填字段：${missingFields.join(', ')}`
      );
      allValid = false;
    }

    // 验证特定用户类型的额外字段
    if (user.type === 'enterprise' && !user.companyName) {
      console.log(`❌ 企业用户缺少公司名称`);
      allValid = false;
    }

    if (user.type === 'repair_shop' && !user.shopName) {
      console.log(`❌ 维修店用户缺少店铺名称`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ 所有测试数据格式正确');
  }

  return allValid;
}

/**
 * 检查开发服务器是否运行
 */
async function checkServerStatus() {
  console.log('🔍 检查开发服务器状态...\n');

  try {
    const response = await postRequest(
      `${TEST_CONFIG.baseUrl}/api/auth/register`,
      {
        email: 'test@example.com',
        password: 'Test123',
        confirmPassword: 'Test123',
      }
    );

    // 只要能连接上就算成功（即使是错误响应）
    console.log('✅ 开发服务器运行正常');
    console.log(`   基础 URL: ${TEST_CONFIG.baseUrl}`);
    console.log(`   响应状态：${response.statusCode}`);
    return true;
  } catch (error) {
    console.log('❌ 无法连接到开发服务器');
    console.log(`   错误：${error.message}`);
    console.log('\n💡 提示：请确保已运行 "npm run dev" 启动服务器');
    return false;
  }
}

/**
 * 打印测试结果摘要
 */
function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 测试结果摘要');
  console.log('='.repeat(60));
  console.log(`总测试数：${testResults.total}`);
  console.log(`✅ 成功：${testResults.success}`);
  console.log(`❌ 失败：${testResults.failed}`);
  console.log(
    `成功率：${((testResults.success / testResults.total) * 100).toFixed(1)}%`
  );
  console.log('='.repeat(60));

  if (testResults.details.length > 0) {
    console.log('\n📋 详细结果:');
    testResults.details.forEach((detail, index) => {
      const icon = detail.status === 'success' ? '✅' : '❌';
      console.log(`\n${index + 1}. ${icon} ${detail.test}`);
      console.log(`   状态：${detail.status}`);
      console.log(`   邮箱：${detail.email}`);

      if (detail.status === 'success') {
        console.log(`   用户 ID: ${detail.userId || 'N/A'}`);
        console.log(`   用户类型：${detail.userType || 'N/A'}`);
        console.log(`   账户类型：${detail.accountType || 'N/A'}`);
      } else {
        console.log(`   错误：${detail.error || '未知'}`);
      }
    });
  }

  // 生成测试报告文件
  generateReport();
}

/**
 * 生成测试报告文件
 */
function generateReport() {
  const reportPath = 'reports/registration-test-result.json';
  const fs = require('fs');
  const path = require('path');

  const report = {
    testDate: new Date().toISOString(),
    config: TEST_CONFIG,
    results: testResults,
    summary: {
      total: testResults.total,
      success: testResults.success,
      failed: testResults.failed,
      successRate: `${((testResults.success / testResults.total) * 100).toFixed(1)}%`,
    },
  };

  try {
    // 确保 reports 目录存在
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, 'registration-test-result.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📄 测试报告已保存到：${reportFile}`);
  } catch (error) {
    console.log('\n⚠️ 保存测试报告失败:', error.message);
  }
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     多类型用户注册功能 - 自动化测试                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n🕐 测试时间：${new Date().toLocaleString('zh-CN')}`);

  // 步骤 1: 检查服务器状态
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    console.log('\n❌ 测试中止：服务器未运行');
    process.exit(1);
  }

  // 步骤 2: 验证测试数据
  console.log(`\n${'='.repeat(60)}`);
  const dataValid = validateFormData();
  if (!dataValid) {
    console.log('\n❌ 测试数据验证失败');
    process.exit(1);
  }

  // 步骤 3: 执行注册测试
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 开始执行注册测试\n');

  for (const testUser of TEST_CONFIG.testUsers) {
    await testUserRegistration(testUser);
    // 每个测试之间延迟 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 步骤 4: 打印摘要
  printSummary();

  // 步骤 5: 退出
  if (testResults.failed > 0) {
    console.log('\n⚠️ 部分测试失败，请查看详细错误信息');
    process.exit(1);
  } else {
    console.log('\n✅ 所有测试通过！');
    process.exit(0);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n💥 测试执行出错:', error);
  process.exit(1);
});
