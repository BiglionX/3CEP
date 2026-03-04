#!/usr/bin/env node

/**
 * agents/invoke 接口测试脚本
 * 验证 POST /agents/invoke 接口的功能
 */

const http = require('http');

console.log('🧪 开始测试 /agents/invoke 接口...\n');

// 测试配置
const config = {
  hostname: 'localhost',
  port: 3001,
  path: '/agents/invoke',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-agents-api-key',
  },
};

// 测试用例
const testCases = [
  {
    name: '正常调用 - AI故障诊断服务',
    data: {
      idempotency_key: 'diag_20260220_001',
      trace_id: 'trace_123456789',
      timeout: 30,
      agent_name: 'AI故障诊断服务',
      payload: {
        device_id: 'DEV001',
        symptoms: '设备无法开机',
        conversation_history: [],
      },
    },
  },
  {
    name: '正常调用 - FCX智能推荐引擎',
    data: {
      idempotency_key: 'rec_20260220_001',
      trace_id: 'trace_987654321',
      timeout: 15,
      agent_name: 'FCX智能推荐引擎',
      payload: {
        user_id: 'user_123',
        context: {
          location: { lat: 39.9042, lng: 116.4074 },
          device_type: 'smartphone',
        },
      },
    },
  },
  {
    name: '参数校验测试 - 缺少必需字段',
    data: {
      // 故意缺少必需字段来测试校验
      agent_name: '测试智能体',
      payload: {},
    },
    expectError: true,
  },
  {
    name: '参数校验测试 - 字段类型错误',
    data: {
      idempotency_key: 'test_001',
      trace_id: 'trace_001',
      timeout: 'invalid_timeout', // 应该是数字
      agent_name: '测试智能体',
      payload: {},
    },
    expectError: true,
  },
];

async function runTest(testCase) {
  console.log(`📋 测试: ${testCase.name}`);

  return new Promise(resolve => {
    const req = http.request(config, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          const isSuccess = res.statusCode === 200;

          console.log(`   状态码: ${res.statusCode}`);
          console.log(
            `   响应头: X-Mock-Response=${res.headers['x-mock-response'] || 'N/A'}, X-Execution-Time=${res.headers['x-execution-time'] || 'N/A'}`
          );

          if (isSuccess && !testCase.expectError) {
            console.log(`   ✅ 成功响应`);
            console.log(`   响应数据: ${JSON.stringify(result.data, null, 2)}`);
          } else if (!isSuccess && testCase.expectError) {
            console.log(`   ✅ 正确捕获错误`);
            console.log(`   错误信息: ${result.error}`);
            if (result.data) {
              console.log(
                `   详细错误: ${JSON.stringify(result.data, null, 2)}`
              );
            }
          } else {
            console.log(`   ❌ 响应不符合预期`);
            console.log(`   响应内容: ${responseData}`);
          }

          resolve({
            name: testCase.name,
            success: testCase.expectError ? !isSuccess : isSuccess,
            statusCode: res.statusCode,
            response: result,
          });
        } catch (error) {
          console.log(`   ❌ 解析响应失败: ${error.message}`);
          resolve({
            name: testCase.name,
            success: false,
            error: error.message,
          });
        }
      });
    });

    req.on('error', error => {
      console.log(`   ❌ 请求失败: ${error.message}`);
      resolve({
        name: testCase.name,
        success: false,
        error: error.message,
      });
    });

    // 发送请求数据
    req.write(JSON.stringify(testCase.data));
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 开始执行测试套件...\n');

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    console.log(''); // 空行分隔
  }

  // 输出测试总结
  console.log('📊 测试结果总结:');
  console.log('=================');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n📈 总结: ${passed} 通过, ${failed} 失败`);

  if (failed === 0) {
    console.log('🎉 所有测试通过!');
    process.exit(0);
  } else {
    console.log('⚠️  存在测试失败，请检查实现');
    process.exit(1);
  }
}

// 验证服务是否运行
function checkService() {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: config.hostname,
        port: config.port,
        path: '/api/health',
        method: 'GET',
      },
      res => {
        if (res.statusCode === 200) {
          console.log('✅ 服务运行正常\n');
          resolve(true);
        } else {
          console.log('❌ 服务健康检查失败\n');
          resolve(false);
        }
      }
    );

    req.on('error', () => {
      console.log('❌ 无法连接到服务，请确保服务已启动\n');
      resolve(false);
    });

    req.end();
  });
}

// 主执行流程
async function main() {
  const serviceOk = await checkService();
  if (!serviceOk) {
    console.log('请先启动服务: node deploy-simple/server.js');
    process.exit(1);
  }

  await runAllTests();
}

// 执行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, runAllTests };
