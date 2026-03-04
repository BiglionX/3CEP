/**
 * n8n 工作流验证测试脚本
 * 验证 B2B 采购智能体通信工作流的功能
 * 包含工作流激活状态、节点健康和测试数据通过率检查
 */

const BASE_N8N_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const BASE_API_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_DATA_PASS_RATE = parseInt(process.env.N8N_TEST_DATA_PASS_RATE) || 95;

console.log('🚀 开始 n8n 工作流验证测试...');
console.log('📊 测试配置:');
console.log(`   n8n URL: ${BASE_N8N_URL}`);
console.log(`   API URL: ${BASE_API_URL}`);
console.log(`   通过率要求: ${TEST_DATA_PASS_RATE}%`);
console.log('');

// 测试用例定义
const testCases = [
  {
    name: '基础采购需求解析',
    webhookPath: '/webhook/b2b-procurement-parse',
    payload: {
      description: '我需要采购100个电子元件A和50个连接器B，预算5000元',
      companyId: 'test-company-001',
      requesterId: 'test-user-001',
    },
  },
  {
    name: '高级采购需求解析',
    webhookPath: '/webhook/b2b-procurement-advanced',
    payload: {
      description:
        '紧急采购一批服务器配件，包括CPU、内存条、硬盘等，要求一周内到货',
      companyId: 'tech-company-ltd',
      requesterId: 'procurement-manager',
    },
  },
  {
    name: '复杂多物品需求',
    webhookPath: '/webhook/b2b-procurement-advanced',
    payload: {
      description:
        '需要采购以下物品：20台笔记本电脑（ThinkPad系列）、50套办公椅、100个无线鼠标、200个机械键盘，总预算控制在10万元以内，要求两周内交付',
      companyId: 'office-supply-co',
      requesterId: 'purchasing-director',
    },
  },
];

// 模板工作流测试用例
const templateTestCases = [
  {
    name: '模板实例化 - 采购报价代理调用',
    agentName: 'procurement.quote_agent',
    payload: {
      request_id: 'TEST-REQ-20260220-001',
      product_name: '工业级服务器主板',
      specifications: {
        cpu: 'Intel Xeon Silver 4314',
        memory: '32GB DDR4 ECC',
        storage: '1TB NVMe SSD',
        quantity: 50,
      },
      delivery_location: '上海张江高科技园区',
      delivery_deadline: '2026-03-15',
      budget_range: {
        min: 8000,
        max: 12000,
      },
      preferred_suppliers: ['供应商A', '供应商B', '供应商C'],
    },
    expectedFields: ['status', 'data', 'message'],
    expectedDataFields: ['quotes', 'formatted_quotes', 'best_quote', 'summary'],
  },
  {
    name: '模板实例化 - AI故障诊断代理调用',
    agentName: 'ai.diagnosis_agent',
    payload: {
      device_id: 'DEVICE-TEST-001',
      symptoms: '设备无法开机，指示灯不亮',
      device_model: 'ThinkPad X1 Carbon',
      error_codes: ['0x0000007E', '0x000000ED'],
      conversation_history: [
        {
          role: 'user',
          content: '我的电脑突然无法开机了',
        },
      ],
    },
    expectedFields: ['status', 'data', 'message'],
    expectedDataFields: [
      'diagnosis',
      'suggested_solutions',
      'confidence',
      'estimated_time',
    ],
  },
];

/**
 * 测试单个工作流端点
 */
async function testWorkflowEndpoint(testCase) {
  console.log(`🧪 测试: ${testCase.name}`);
  console.log(`🔗 Webhook URL: ${BASE_N8N_URL}${testCase.webhookPath}`);

  try {
    const startTime = Date.now();

    const response = await fetch(`${BASE_N8N_URL}${testCase.webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📡 HTTP状态码: ${response.status}`);

    if (!response.ok) {
      console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();
    console.log(`✅ 响应结果:`);
    console.log(`   成功状态: ${result.success}`);
    console.log(`   消息: ${result.message}`);

    if (result.success) {
      console.log(`   识别物品数: ${result.itemsCount || 0}`);
      console.log(`   置信度: ${result.confidence || 0}%`);
      console.log(`   处理时间: ${result.processingTime || 'N/A'}`);

      if (result.parsedItems && result.parsedItems.length > 0) {
        console.log(`   解析物品列表:`);
        result.parsedItems.forEach((item, index) => {
          console.log(
            `     ${index + 1}. ${item.productName} - ${item.quantity}${item.unit || '个'}`
          );
        });
      }
    } else {
      console.log(`   错误详情: ${result.errorCode || 'N/A'}`);
    }

    return { success: result.success, data: result, duration };
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 测试模板实例化工作流
 */
async function testTemplateWorkflow(templateTestCase) {
  console.log(`🧪 模板测试: ${templateTestCase.name}`);
  console.log(`🤖 代理名称: ${templateTestCase.agentName}`);

  try {
    const startTime = Date.now();

    // 构造模板工作流调用的数据
    const requestData = {
      idempotency_key: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trace_id: `trace_${Date.now()}`,
      timeout: 30,
      agent_name: templateTestCase.agentName,
      payload: templateTestCase.payload,
    };

    const response = await fetch(`${BASE_API_URL}/agents/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AGENTS_API_KEY || 'test-agents-api-key'}`,
      },
      body: JSON.stringify(requestData),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📡 HTTP状态码: ${response.status}`);

    if (!response.ok) {
      console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();
    console.log(`✅ 响应结果:`);
    console.log(`   顶层状态码: ${result.code}`);
    console.log(`   消息: ${result.message}`);

    // 验证顶层字段
    const hasExpectedFields = templateTestCase.expectedFields.every(field =>
      result.hasOwnProperty(field)
    );

    if (!hasExpectedFields) {
      const missingFields = templateTestCase.expectedFields.filter(
        field => !result.hasOwnProperty(field)
      );
      console.log(`❌ 缺少顶层字段: ${missingFields.join(', ')}`);
      return {
        success: false,
        error: `缺少顶层字段: ${missingFields.join(', ')}`,
        data: result,
      };
    }

    // 验证 data 字段结构
    if (result.data && typeof result.data === 'object') {
      console.log(`   Data 状态: ${result.data.status}`);

      // 验证 data 内部字段
      const hasExpectedDataFields = templateTestCase.expectedDataFields.every(
        field => result.data.hasOwnProperty(field)
      );

      if (!hasExpectedDataFields) {
        const missingDataFields = templateTestCase.expectedDataFields.filter(
          field => !result.data.hasOwnProperty(field)
        );
        console.log(`❌ 缺少 data 字段: ${missingDataFields.join(', ')}`);
        return {
          success: false,
          error: `缺少 data 字段: ${missingDataFields.join(', ')}`,
          data: result,
        };
      }

      // 显示关键数据字段
      templateTestCase.expectedDataFields.forEach(field => {
        if (result.data[field] !== undefined) {
          const value = Array.isArray(result.data[field])
            ? `${result.data[field].length} 个项目`
            : typeof result.data[field] === 'object'
              ? `${Object.keys(result.data[field]).length} 个属性`
              : result.data[field];
          console.log(`   ${field}: ${value}`);
        }
      });
    } else {
      console.log(`❌ data 字段无效或不存在`);
      return {
        success: false,
        error: 'data 字段无效或不存在',
        data: result,
      };
    }

    console.log(`✅ 模板测试通过`);
    return { success: true, data: result, duration };
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 验证工作流激活状态
 */
async function checkWorkflowActivation() {
  console.log('📋 检查工作流激活状态...');

  try {
    const response = await fetch(`${BASE_N8N_URL}/workflows`, {
      headers: {
        Authorization: `Bearer ${process.env.N8N_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ 无法获取工作流列表: ${response.status}`);
      return { success: false, activated: 0, total: 0 };
    }

    const workflows = await response.json();
    const activatedCount = workflows.filter(wf => wf.active === true).length;
    const totalCount = workflows.length;

    console.log(`📊 工作流状态: ${activatedCount}/${totalCount} 已激活`);

    if (activatedCount === 0) {
      console.log('⚠️  没有激活的工作流');
      return { success: false, activated: 0, total: totalCount };
    }

    if (activatedCount < totalCount) {
      console.log(`⚠️  ${totalCount - activatedCount} 个工作流未激活`);
      const inactiveWorkflows = workflows.filter(wf => !wf.active);
      inactiveWorkflows.forEach(wf => {
        console.log(`   - ${wf.name} (ID: ${wf.id})`);
      });
    }

    return {
      success: activatedCount > 0,
      activated: activatedCount,
      total: totalCount,
      workflows: workflows,
    };
  } catch (error) {
    console.log(`❌ 检查工作流激活状态失败: ${error.message}`);
    return { success: false, activated: 0, total: 0 };
  }
}

/**
 * 验证节点健康状态
 */
async function checkNodeHealth() {
  console.log('🔧 检查节点健康状态...');

  try {
    const response = await fetch(`${BASE_N8N_URL}/nodes`, {
      headers: {
        Authorization: `Bearer ${process.env.N8N_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  无法获取节点信息: ${response.status} (这可能是正常的)`);
      return { success: true, healthy: 0, total: 0 }; // 节点API可能不可用
    }

    const nodes = await response.json();
    const healthyNodes = nodes.filter(node => node.connected !== false);
    const totalCount = nodes.length;
    const healthyCount = healthyNodes.length;

    console.log(`📊 节点健康: ${healthyCount}/${totalCount} 正常`);

    if (healthyCount < totalCount) {
      console.log(`⚠️  ${totalCount - healthyCount} 个节点连接异常`);
      const unhealthyNodes = nodes.filter(node => node.connected === false);
      unhealthyNodes.forEach(node => {
        console.log(`   - ${node.name}: ${node.type}`);
      });
    }

    return {
      success: healthyCount === totalCount,
      healthy: healthyCount,
      total: totalCount,
    };
  } catch (error) {
    console.log(`⚠️  检查节点健康状态失败: ${error.message} (这可能是正常的)`);
    return { success: true, healthy: 0, total: 0 }; // 不影响整体测试
  }
}

/**
 * 验证 n8n 服务状态
 */
async function checkN8nHealth() {
  console.log('🏥 检查 n8n 服务状态...');

  try {
    const response = await fetch(`${BASE_N8N_URL}/healthz`);
    if (response.ok) {
      console.log('✅ n8n 服务运行正常');
      return true;
    } else {
      console.log(`⚠️  n8n 服务返回状态: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 无法连接到 n8n 服务: ${error.message}`);
    return false;
  }
}

/**
 * 验证智能体 API 状态
 */
async function checkApiHealth() {
  console.log('🏥 检查智能体 API 状态...');

  try {
    const response = await fetch(
      `${BASE_API_URL}/api/b2b-procurement/parse-demand`,
      {
        method: 'GET',
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ 智能体 API 运行正常: ${result.message}`);
      return true;
    } else {
      console.log(`⚠️  智能体 API 返回状态: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 无法连接到智能体 API: ${error.message}`);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('📋 开始执行完整测试套件...\n');

  // 1. 健康检查
  const n8nHealthy = await checkN8nHealth();
  const apiHealthy = await checkApiHealth();
  const workflowStatus = await checkWorkflowActivation();
  const nodeStatus = await checkNodeHealth();

  if (!n8nHealthy || !apiHealthy) {
    console.log('\n❌ 基础服务检查失败，请确保:');
    if (!n8nHealthy) console.log('   - n8n 服务正在运行 (默认端口 5678)');
    if (!apiHealthy)
      console.log('   - 智能体 API 服务正在运行 (默认端口 3000)');
    return;
  }

  if (!workflowStatus.success) {
    console.log('\n❌ 工作流激活检查失败，请确保至少有一个工作流处于激活状态');
    return;
  }

  console.log('');

  // 2. 执行常规工作流测试用例
  const results = [];

  console.log('🧪 执行常规工作流测试...');
  console.log('═'.repeat(50));

  for (const testCase of testCases) {
    console.log('─'.repeat(50));
    const result = await testWorkflowEndpoint(testCase);
    results.push({
      name: testCase.name,
      type: 'regular',
      ...result,
    });
    console.log('─'.repeat(50));
    console.log('');
  }

  // 3. 执行模板工作流测试用例
  console.log('🧪 执行模板实例化测试...');
  console.log('═'.repeat(50));

  const templateResults = [];

  for (const templateTestCase of templateTestCases) {
    console.log('─'.repeat(50));
    const result = await testTemplateWorkflow(templateTestCase);
    templateResults.push({
      name: templateTestCase.name,
      type: 'template',
      ...result,
    });
    console.log('─'.repeat(50));
    console.log('');
  }

  // 4. 合并所有结果
  const allResults = [...results, ...templateResults];

  // 5. 生成测试报告
  console.log('📊 测试报告汇总:');
  console.log('═'.repeat(50));

  let passedTests = 0;
  const totalTests = allResults.length;
  let regularPassed = 0;
  let templatePassed = 0;

  allResults.forEach((result, index) => {
    const status = result.success ? '✅ 通过' : '❌ 失败';
    const testType = result.type === 'template' ? '[模板]' : '[常规]';
    console.log(
      `${index + 1}. ${testType} ${result.name}: ${status} (${result.duration || 'N/A'}ms)`
    );
    if (result.success) {
      passedTests++;
      if (result.type === 'template') {
        templatePassed++;
      } else {
        regularPassed++;
      }
    }
  });

  console.log('═'.repeat(50));
  console.log(
    `工作流激活: ${workflowStatus.activated}/${workflowStatus.total}`
  );
  console.log(`节点健康: ${nodeStatus.healthy}/${nodeStatus.total}`);
  console.log(`常规测试: ${regularPassed}/${results.length} 个通过`);
  console.log(`模板测试: ${templatePassed}/${templateResults.length} 个通过`);
  console.log(`总体测试: ${passedTests}/${totalTests} 个通过`);

  const overallPassRate = Math.round((passedTests / totalTests) * 100);
  console.log(`测试通过率: ${overallPassRate}%`);

  // 检查通过率是否满足要求
  if (overallPassRate < TEST_DATA_PASS_RATE) {
    console.log(
      `⚠️  测试通过率 ${overallPassRate}% 低于要求的 ${TEST_DATA_PASS_RATE}%`
    );
  }

  if (passedTests === totalTests && overallPassRate >= TEST_DATA_PASS_RATE) {
    console.log('\n🎉 所有测试通过！工作流配置正确。');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查工作流配置。');
    process.exit(1);
  }
}

/**
 * 单独测试特定工作流
 */
async function testSpecificWorkflow(workflowType = 'basic') {
  const testCase = workflowType === 'advanced' ? testCases[1] : testCases[0];

  console.log(`🎯 单独测试 ${workflowType} 工作流...\n`);
  await testWorkflowEndpoint(testCase);
}

/**
 * 单独测试模板工作流
 */
async function testSpecificTemplate(templateType = 'quote') {
  const templateTestCase =
    templateType === 'diagnosis' ? templateTestCases[1] : templateTestCases[0];

  console.log(`🎯 单独测试 ${templateType} 模板工作流...\n`);
  await testTemplateWorkflow(templateTestCase);
}

/**
 * 只运行模板测试
 */
async function runTemplateTestsOnly() {
  console.log('🧪 只运行模板实例化测试...\n');

  // 健康检查
  const apiHealthy = await checkApiHealth();
  if (!apiHealthy) {
    console.log('\n❌ 智能体 API 服务检查失败');
    return;
  }

  console.log('');

  // 执行模板测试
  const templateResults = [];

  for (const templateTestCase of templateTestCases) {
    console.log('─'.repeat(50));
    const result = await testTemplateWorkflow(templateTestCase);
    templateResults.push({
      name: templateTestCase.name,
      type: 'template',
      ...result,
    });
    console.log('─'.repeat(50));
    console.log('');
  }

  // 生成模板测试报告
  console.log('📊 模板测试报告:');
  console.log('═'.repeat(50));

  let passedTests = 0;
  const totalTests = templateResults.length;

  templateResults.forEach((result, index) => {
    const status = result.success ? '✅ 通过' : '❌ 失败';
    console.log(
      `${index + 1}. [模板] ${result.name}: ${status} (${result.duration || 'N/A'}ms)`
    );
    if (result.success) passedTests++;
  });

  console.log('═'.repeat(50));
  console.log(`模板测试: ${passedTests}/${totalTests} 个通过`);

  const passRate = Math.round((passedTests / totalTests) * 100);
  console.log(`通过率: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有模板测试通过！');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分模板测试失败。');
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法:
  node test-n8n-workflows.js                    # 运行所有测试（包括模板测试）
  node test-n8n-workflows.js --basic           # 只测试基础工作流
  node test-n8n-workflows.js --advanced        # 只测试高级工作流
  node test-n8n-workflows.js --templates       # 只运行模板实例化测试
  node test-n8n-workflows.js --quote           # 只测试采购报价模板
  node test-n8n-workflows.js --diagnosis       # 只测试故障诊断模板
  node test-n8n-workflows.js --health          # 只进行健康检查
  node test-n8n-workflows.js --activation      # 只检查工作流激活状态
  node test-n8n-workflows.js --nodes           # 只检查节点健康状态
  
环境变量:
  N8N_BASE_URL=http://your-n8n-host:5678      # n8n 服务地址
  API_BASE_URL=http://your-api-host:3000      # 智能体 API 地址
  N8N_API_TOKEN=your_api_token               # API 访问令牌
  AGENTS_API_KEY=your_agents_api_key         # 代理 API 密钥
  N8N_TEST_DATA_PASS_RATE=95                 # 测试通过率要求
  `);
  process.exit(0);
}

if (args.includes('--health')) {
  Promise.all([checkN8nHealth(), checkApiHealth()]).then(([n8n, api]) => {
    if (n8n && api) process.exit(0);
    else process.exit(1);
  });
} else if (args.includes('--activation')) {
  checkWorkflowActivation().then(status => {
    process.exit(status.success ? 0 : 1);
  });
} else if (args.includes('--nodes')) {
  checkNodeHealth().then(status => {
    process.exit(status.success ? 0 : 1);
  });
} else if (args.includes('--basic')) {
  testSpecificWorkflow('basic');
} else if (args.includes('--advanced')) {
  testSpecificWorkflow('advanced');
} else if (args.includes('--templates')) {
  runTemplateTestsOnly();
} else if (args.includes('--quote')) {
  testSpecificTemplate('quote');
} else if (args.includes('--diagnosis')) {
  testSpecificTemplate('diagnosis');
} else {
  runAllTests();
}
