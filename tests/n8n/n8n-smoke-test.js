#!/usr/bin/env node

/**
 * n8n 关键流程冒烟测试
 * 用于 CI/CD 流水线中的快速验证
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('🔥 n8n 关键流程冒烟测试\n');
console.log('=====================================\n');

// 配置
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const WORKFLOWS_DIR = path.join(__dirname, '..', '..', 'n8n-workflows');
const CRITICAL_WORKFLOWS = [
  'procurement/v1.0.0/b2b-procurement-workflow.json',
  'payment/v1.0.0/payment-processing.json',
  'integration/v1.0.0/supplier-sync.json',
];

// 测试场景定义
const TEST_SCENARIOS = [
  {
    name: '健康检查',
    endpoint: '/healthz',
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'API根路径',
    endpoint: '/',
    expectedStatus: 200,
    critical: true,
  },
  {
    name: '工作流列表',
    endpoint: '/workflows',
    expectedStatus: 200,
    critical: false,
  },
  {
    name: '节点类型',
    endpoint: '/node-types',
    expectedStatus: 200,
    critical: false,
  },
];

async function checkServiceHealth() {
  console.log('🏥 检查 n8n 服务健康状态...\n');

  const criticalTests = TEST_SCENARIOS.filter(t => t.critical);
  let passedTests = 0;
  let failedTests = 0;

  for (const test of criticalTests) {
    try {
      console.log(`🔍 测试: ${test.name}`);

      const response = spawnSync(
        'curl',
        [
          '-s',
          '-w',
          '%{http_code}',
          '-o',
          '/tmp/n8n_response.txt',
          `${N8N_BASE_URL}${test.endpoint}`,
        ],
        { timeout: 10000 }
      );

      const statusCode = response.stdout.toString().trim();

      if (parseInt(statusCode) === test.expectedStatus) {
        console.log(`✅ ${test.name} - 状态码: ${statusCode}\n`);
        passedTests++;
      } else {
        console.log(
          `❌ ${test.name} - 期望: ${test.expectedStatus}, 实际: ${statusCode}\n`
        );
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - 错误: ${error.message}\n`);
      failedTests++;
    }
  }

  return { passed: passedTests, failed: failedTests };
}

async function validateWorkflowFiles() {
  console.log('📄 验证关键工作流文件...\n');

  let validWorkflows = 0;
  let invalidWorkflows = 0;

  for (const workflowPath of CRITICAL_WORKFLOWS) {
    const fullPath = path.join(WORKFLOWS_DIR, workflowPath);

    console.log(`🔍 检查: ${workflowPath}`);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 文件不存在: ${workflowPath}\n`);
      invalidWorkflows++;
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const workflow = JSON.parse(content);

      // 基本结构验证
      const requiredFields = ['nodes', 'connections'];
      const missingFields = requiredFields.filter(field => !workflow[field]);

      if (missingFields.length > 0) {
        console.log(`❌ 缺少必需字段: ${missingFields.join(', ')}\n`);
        invalidWorkflows++;
        continue;
      }

      // 节点验证
      if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
        console.log(`❌ 工作流节点为空或格式错误\n`);
        invalidWorkflows++;
        continue;
      }

      console.log(`✅ 工作流有效 - 节点数: ${workflow.nodes.length}\n`);
      validWorkflows++;
    } catch (error) {
      console.log(`❌ JSON解析失败: ${error.message}\n`);
      invalidWorkflows++;
    }
  }

  return { valid: validWorkflows, invalid: invalidWorkflows };
}

async function testWorkflowImport() {
  console.log('📤 测试工作流导入功能...\n');

  let importedCount = 0;
  let failedCount = 0;

  for (const workflowPath of CRITICAL_WORKFLOWS.slice(0, 2)) {
    // 只测试前两个关键流程
    const fullPath = path.join(WORKFLOWS_DIR, workflowPath);

    if (!fs.existsSync(fullPath)) continue;

    try {
      console.log(`📥 导入: ${path.basename(workflowPath)}`);

      const workflowContent = fs.readFileSync(fullPath, 'utf8');

      const response = spawnSync(
        'curl',
        [
          '-s',
          '-X',
          'POST',
          '-H',
          'Content-Type: application/json',
          '-d',
          workflowContent,
          `${N8N_BASE_URL}/workflows`,
        ],
        { timeout: 30000 }
      );

      const result = response.stdout.toString();

      if (response.status === 0) {
        try {
          const jsonResponse = JSON.parse(result);
          if (jsonResponse.id) {
            console.log(`✅ 导入成功 - 工作流ID: ${jsonResponse.id}\n`);
            importedCount++;
          } else {
            console.log(`❌ 导入失败 - 无效响应\n`);
            failedCount++;
          }
        } catch (parseError) {
          console.log(`❌ 响应解析失败\n`);
          failedCount++;
        }
      } else {
        console.log(`❌ HTTP请求失败 - 状态码: ${response.status}\n`);
        failedCount++;
      }
    } catch (error) {
      console.log(`❌ 导入过程错误: ${error.message}\n`);
      failedCount++;
    }
  }

  return { imported: importedCount, failed: failedCount };
}

async function runSmokeTests() {
  console.log('🚀 开始 n8n 冒烟测试...\n');

  // 1. 服务健康检查
  const healthResults = await checkServiceHealth();

  // 2. 工作流文件验证
  const validationResults = await validateWorkflowFiles();

  // 3. 工作流导入测试
  const importResults = await testWorkflowImport();

  // 生成测试报告
  console.log('=====================================');
  console.log('📋 冒烟测试报告');
  console.log('=====================================');

  console.log('\n🏥 服务健康检查:');
  console.log(`   通过: ${healthResults.passed}`);
  console.log(`   失败: ${healthResults.failed}`);

  console.log('\n📄 工作流验证:');
  console.log(`   有效: ${validationResults.valid}`);
  console.log(`   无效: ${validationResults.invalid}`);

  console.log('\n📤 工作流导入:');
  console.log(`   成功: ${importResults.imported}`);
  console.log(`   失败: ${importResults.failed}`);

  // 计算总体通过率
  const totalTests =
    healthResults.passed +
    healthResults.failed +
    validationResults.valid +
    validationResults.invalid +
    importResults.imported +
    importResults.failed;

  const passedTests =
    healthResults.passed + validationResults.valid + importResults.imported;
  const passRate = Math.round((passedTests / totalTests) * 100);

  console.log(`\n📊 总体通过率: ${passRate}% (${passedTests}/${totalTests})`);

  if (passRate >= 80) {
    console.log('\n✅ 冒烟测试通过！n8n 核心功能正常');
    process.exit(0);
  } else {
    console.log('\n❌ 冒烟测试失败！存在关键功能问题');
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
n8n 冒烟测试工具

用法: node tests/n8n/n8n-smoke-test.js [选项]

选项:
  --help, -h        显示帮助信息
  --health-only     只运行健康检查
  --workflows-only  只验证工作流文件
  --url=<url>       指定 n8n 服务地址 (默认: http://localhost:5678)

环境变量:
  N8N_BASE_URL      n8n 服务地址

示例:
  node tests/n8n/n8n-smoke-test.js
  node tests/n8n/n8n-smoke-test.js --health-only
  N8N_BASE_URL=http://n8n.example.com node tests/n8n/n8n-smoke-test.js
  `);
  process.exit(0);
}

// 检查 n8n 服务是否可达
console.log(`📍 目标服务: ${N8N_BASE_URL}\n`);

// 运行测试
runSmokeTests().catch(error => {
  console.error('\n💥 冒烟测试执行失败:', error.message);
  process.exit(1);
});
