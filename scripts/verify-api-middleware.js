/**
 * API 权限中间件验证脚本
 *
 * 用于快速测试中间件功能是否正常
 *
 * 使用方法:
 * node scripts/verify-api-middleware.js
 */

const http = require('http');

// 配置
const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/admin/users',
    name: '获取用户列表',
    requiredPermission: 'users_read',
  },
];

// 测试用例
const testCases = [
  {
    name: '未认证访问',
    headers: {},
    expectedStatus: 401,
  },
  {
    name: '无效 Token 访问',
    headers: {
      Authorization: 'Bearer invalid-token',
    },
    expectedStatus: 401,
  },
];

/**
 * 发送 HTTP 请求
 */
function sendRequest(method, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL.replace('http://', '').split(':')[0],
      port: 3000,
      path,
      method,
      headers,
    };

    const req = http.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);

    // 超时处理
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

/**
 * 运行测试
 */
async function runTests() {
  console.log('🧪 开始测试 API 权限中间件...\n');
  console.log(`基础 URL: ${BASE_URL}`);
  console.log(`测试端点数量：${TEST_ENDPOINTS.length}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  };

  for (const endpoint of TEST_ENDPOINTS) {
    console.log(`\n📍 测试端点：${endpoint.method} ${endpoint.path}`);
    console.log(`   名称：${endpoint.name}`);
    console.log(`   需要权限：${endpoint.requiredPermission}\n`);

    for (const testCase of testCases) {
      results.total++;
      const testName = `${endpoint.name} - ${testCase.name}`;

      try {
        console.log(`   执行测试：${testCase.name}...`);

        const response = await sendRequest(
          endpoint.method,
          endpoint.path,
          testCase.headers
        );

        const passed = response.status === testCase.expectedStatus;

        if (passed) {
          console.log(`   ✅ 通过 (状态码：${response.status})`);
          results.passed++;
        } else {
          console.log(
            `   ❌ 失败 (期望：${testCase.expectedStatus}, 实际：${response.status})`
          );
          results.failed++;
        }

        results.tests.push({
          name: testName,
          passed,
          expected: testCase.expectedStatus,
          actual: response.status,
          response: response.body,
        });
      } catch (error) {
        console.log(`   ❌ 错误：${error.message}`);
        results.failed++;

        results.tests.push({
          name: testName,
          passed: false,
          error: error.message,
        });
      }
    }
  }

  // 打印汇总
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`总测试数：${results.total}`);
  console.log(`✅ 通过：${results.passed}`);
  console.log(`❌ 失败：${results.failed}`);
  console.log(
    `通过率：${((results.passed / results.total) * 100).toFixed(2)}%`
  );
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log('\n失败的测试:');
    results.tests
      .filter(t => !t.passed)
      .forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name}`);
        if (test.error) {
          console.log(`     错误：${test.error}`);
        } else {
          console.log(
            `     期望状态码：${test.expected}, 实际：${test.actual}`
          );
        }
      });
  }

  console.log('\n');

  // 返回结果
  return results.failed === 0;
}

/**
 * 主函数
 */
async function main() {
  try {
    const success = await runTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('测试执行失败:', error);
    process.exit(1);
  }
}

// 执行测试
main();
