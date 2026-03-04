#!/usr/bin/env node

/**
 * 智能体集成冒烟测试脚本
 * 目标：循环调用 /agents/invoke 接口，验证所有已部署智能体的基本功能
 * 输入：读取 docs/technical-docs/agents-inventory.md 或本地 JSON 清单
 * 输出：断言 200 状态码与关键字段存在性
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 智能体集成冒烟测试开始...\n');

// 测试配置
const config = {
  hostname: process.env.AGENTS_HOST || 'localhost',
  port: process.env.AGENTS_PORT || 3001,
  basePath: '/agents/invoke',
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.AGENTS_API_KEY || 'test-agents-api-key'}`,
    'User-Agent': 'Agents-Integration-Test/1.0',
  },
};

// 从 Markdown 文件解析智能体清单
function parseAgentsInventory(markdownContent) {
  const lines = markdownContent.split('\n');
  const agents = [];

  // 更宽松的解析方式：直接查找包含"已部署"的行
  for (const line of lines) {
    // 查找包含智能体信息的行
    if (line.includes('已部署') && line.includes('|')) {
      // 清理和分割行
      const cleanLine = line.replace(/\|\s*$/g, '').trim(); // 移除末尾的 |
      const columns = cleanLine
        .split('|')
        .map(col => col.trim())
        .filter(col => col);

      // 确保有足够的列并且不是表头
      if (
        columns.length >= 9 &&
        !columns[0].includes('名称') &&
        !columns[0].includes('---') &&
        columns.some(col => col.includes('已部署'))
      ) {
        // 找到状态列（通常是最后一列）
        const statusColumn = columns[columns.length - 1];
        if (statusColumn.includes('已部署')) {
          agents.push({
            name: columns[0],
            domain: columns[1],
            mode: columns[2],
            latencySensitivity: columns[3],
            stateComplexity: columns[4],
            securityLevel: columns[5],
            trafficLevel: columns[6],
            owner: columns[7],
            status: statusColumn,
          });
        }
      }
    }
  }

  return agents;
}

// 生成智能体特定的测试数据
function generateTestData(agent) {
  const baseData = {
    idempotency_key: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    trace_id: `trace_${Date.now()}`,
    timeout: agent.latencySensitivity === '高' ? 5 : 30,
    agent_name: agent.name,
  };

  // 根据不同领域生成特定的 payload
  switch (agent.domain) {
    case '设备识别':
      baseData.payload = {
        device_id: 'TEST_DEVICE_001',
        image_url: 'https://example.com/device.jpg',
        scan_context: {
          location: '测试地点',
          timestamp: new Date().toISOString(),
        },
      };
      break;

    case '用户体验':
      baseData.payload = {
        user_id: 'test_user_123',
        session_id: 'session_456',
        action: 'browse_manuals',
        context: {
          device_type: 'mobile',
          preferred_language: 'zh-CN',
        },
      };
      break;

    case '交易处理':
      baseData.payload = {
        order_id: 'ORDER_TEST_789',
        payment_method: 'alipay',
        amount: 99.99,
        currency: 'CNY',
      };
      break;

    case '供应链':
      baseData.payload = {
        procurement_request: {
          items: [
            {
              product_name: '测试产品',
              quantity: 10,
              specifications: '测试规格',
            },
          ],
          delivery_address: '测试地址',
        },
      };
      break;

    case '售后服务':
      baseData.payload = {
        device_serial: 'SN_TEST_001',
        issue_description: '设备故障测试',
        customer_info: {
          name: '测试客户',
          phone: '13800138000',
        },
      };
      break;

    case '数据分析':
      baseData.payload = {
        analysis_target: 'sales_trend',
        time_range: {
          start: '2026-01-01',
          end: '2026-02-20',
        },
        dimensions: ['region', 'product_category'],
      };
      break;

    case '仓储管理':
      baseData.payload = {
        warehouse_id: 'WH_TEST_001',
        inventory_check: {
          sku_list: ['SKU001', 'SKU002'],
          check_type: 'cycle_count',
        },
      };
      break;

    default:
      baseData.payload = {
        test_mode: true,
        timestamp: new Date().toISOString(),
        dummy_data: 'test_value',
      };
  }

  return baseData;
}

// 执行单个智能体测试
function testAgent(agent) {
  return new Promise(resolve => {
    console.log(`📋 测试智能体: ${agent.name} (${agent.domain})`);

    const testData = generateTestData(agent);
    const postData = JSON.stringify(testData);

    const options = {
      hostname: config.hostname,
      port: config.port,
      path: config.basePath,
      method: 'POST',
      headers: {
        ...config.headers,
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: config.timeout,
    };

    const req = http.request(options, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          const isSuccess = res.statusCode === 200;

          // 验证关键字段存在性
          const topLevelFields = ['code', 'data', 'message'];
          const hasTopLevelFields = topLevelFields.every(field =>
            result.hasOwnProperty(field)
          );

          // 验证 data 内部结构
          let hasValidDataStructure = false;
          let hasDataStatus = false;
          if (result.data && typeof result.data === 'object') {
            hasValidDataStructure = true;
            hasDataStatus = result.data.hasOwnProperty('status');
          }

          const hasRequiredFields = hasTopLevelFields && hasDataStatus;

          const testResult = {
            agentName: agent.name,
            domain: agent.domain,
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
            success: isSuccess && hasRequiredFields && hasValidDataStructure,
            hasRequiredFields,
            hasValidDataStructure,
            errorMessage: null,
            response: result,
          };

          if (testResult.success) {
            console.log(
              `   ✅ 通过 - 状态码: ${res.statusCode}, 响应时间: ${testResult.responseTime}ms`
            );
          } else {
            console.log(`   ❌ 失败 - 状态码: ${res.statusCode}`);
            if (!isSuccess) {
              testResult.errorMessage = `HTTP 状态码错误: ${res.statusCode}`;
            } else if (!hasTopLevelFields) {
              testResult.errorMessage = `缺少顶层必需字段: ${topLevelFields.filter(f => !result.hasOwnProperty(f)).join(', ')}`;
            } else if (!hasDataStatus) {
              testResult.errorMessage = 'data 对象缺少 status 字段';
            } else if (!hasValidDataStructure) {
              testResult.errorMessage = 'data 字段结构无效';
            }
            console.log(`   错误详情: ${testResult.errorMessage}`);
          }

          resolve(testResult);
        } catch (error) {
          const testResult = {
            agentName: agent.name,
            domain: agent.domain,
            statusCode: null,
            responseTime: Date.now() - startTime,
            success: false,
            hasRequiredFields: false,
            hasValidDataStructure: false,
            errorMessage: `响应解析失败: ${error.message}`,
            response: responseData,
          };
          console.log(`   ❌ 失败 - ${testResult.errorMessage}`);
          resolve(testResult);
        }
      });
    });

    const startTime = Date.now();

    req.on('error', error => {
      const testResult = {
        agentName: agent.name,
        domain: agent.domain,
        statusCode: null,
        responseTime: Date.now() - startTime,
        success: false,
        hasRequiredFields: false,
        hasValidDataStructure: false,
        errorMessage: `请求失败: ${error.message}`,
        response: null,
      };
      console.log(`   ❌ 失败 - ${testResult.errorMessage}`);
      resolve(testResult);
    });

    req.on('timeout', () => {
      req.destroy();
      const testResult = {
        agentName: agent.name,
        domain: agent.domain,
        statusCode: null,
        responseTime: config.timeout,
        success: false,
        hasRequiredFields: false,
        hasValidDataStructure: false,
        errorMessage: `请求超时 (${config.timeout}ms)`,
        response: null,
      };
      console.log(`   ❌ 失败 - ${testResult.errorMessage}`);
      resolve(testResult);
    });

    // 发送请求
    req.write(postData);
    req.end();
  });
}

// 运行所有测试
async function runAllTests(agents) {
  console.log(`🚀 开始测试 ${agents.length} 个智能体...\n`);

  const results = [];

  // 串行执行测试以避免资源竞争
  for (const agent of agents) {
    const result = await testAgent(agent);
    results.push(result);

    // 添加短暂延迟避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// 生成测试报告
function generateReport(results) {
  console.log('\n📊 测试结果报告');
  console.log('==================');

  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = total - passed;

  console.log(`总计: ${total} 个智能体`);
  console.log(`通过: ${passed} 个 ✅`);
  console.log(`失败: ${failed} 个 ❌`);
  console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%\n`);

  // 按领域分组统计
  const domainStats = {};
  results.forEach(result => {
    if (!domainStats[result.domain]) {
      domainStats[result.domain] = { total: 0, passed: 0 };
    }
    domainStats[result.domain].total++;
    if (result.success) {
      domainStats[result.domain].passed++;
    }
  });

  console.log('按领域统计:');
  Object.entries(domainStats).forEach(([domain, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${domain}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  // 详细失败信息
  if (failed > 0) {
    console.log('\n❌ 失败详情:');
    results
      .filter(r => !r.success)
      .forEach(result => {
        console.log(`  • ${result.agentName} (${result.domain})`);
        console.log(`    错误: ${result.errorMessage}`);
        console.log(`    状态码: ${result.statusCode || 'N/A'}`);
        console.log(`    响应时间: ${result.responseTime}ms`);
      });
  }

  // 性能统计
  const responseTimes = results
    .map(r => r.responseTime)
    .filter(t => t !== undefined);
  if (responseTimes.length > 0) {
    const avgTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);

    console.log('\n⏱️  性能统计:');
    console.log(`  平均响应时间: ${avgTime.toFixed(2)}ms`);
    console.log(`  最大响应时间: ${maxTime}ms`);
    console.log(`  最小响应时间: ${minTime}ms`);
  }

  return { total, passed, failed, successRate: (passed / total) * 100 };
}

// 主函数
async function main() {
  try {
    // 读取智能体清单
    const inventoryPath = path.join(
      __dirname,
      '..',
      'docs',
      'technical-docs',
      'agents-inventory.md'
    );

    if (!fs.existsSync(inventoryPath)) {
      throw new Error(`智能体清单文件不存在: ${inventoryPath}`);
    }

    const markdownContent = fs.readFileSync(inventoryPath, 'utf8');
    const agents = parseAgentsInventory(markdownContent);

    if (agents.length === 0) {
      throw new Error('未找到已部署的智能体');
    }

    console.log(`发现 ${agents.length} 个已部署智能体:\n`);
    agents.forEach(agent => {
      console.log(`  • ${agent.name} (${agent.domain})`);
    });
    console.log('');

    // 运行测试
    const results = await runAllTests(agents);

    // 生成报告
    const report = generateReport(results);

    // 退出码处理
    if (report.failed === 0) {
      console.log('\n🎉 所有智能体测试通过!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${report.failed} 个智能体测试失败，请检查相关服务`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  }
}

// 导出函数供其他脚本使用
module.exports = {
  parseAgentsInventory,
  generateTestData,
  testAgent,
  runAllTests,
  generateReport,
};

// 直接运行时执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('程序执行异常:', error);
    process.exit(1);
  });
}
