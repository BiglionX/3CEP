/**
 * 自动化工作流测试套件
 * 测试所有n8n工作流的功能正确性和集成效果
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const config = {
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || 'test-api-key',
  timeout: 10000
};

// 测试用例定义
const testCases = {
  'scan-flow': {
    name: '扫码智能服务工作流测试',
    webhook: '/webhook/scan-service',
    testData: {
      deviceId: 'DEV20260220001',
      qrCode: 'QR123456789',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      serialNumber: 'SN123456789'
    },
    expectedFields: ['success', 'deviceId', 'diagnosis', 'tutorials', 'newDevices']
  },
  'tutorial-flow': {
    name: '教程浏览引导工作流测试',
    webhook: '/webhook/tutorial-guide',
    testData: {
      userId: 'USER001',
      tutorialId: 'TUT001',
      deviceType: 'smartphone',
      eventType: 'page_view',
      duration: 120,
      latitude: 39.9042,
      longitude: 116.4074
    },
    expectedFields: ['userId', 'tutorialId', 'recommendations']
  },
  'payment-success': {
    name: '支付成功后续处理工作流测试',
    webhook: '/webhook/payment-success',
    testData: {
      order_id: 'ORDER20260220001',
      payment_id: 'PAY20260220001',
      amount: 2999.00,
      currency: 'CNY',
      payment_method: 'alipay',
      signature: 'test_signature_hash'
    },
    expectedFields: ['success', 'orderId', 'results']
  },
  'ai-escalation': {
    name: 'AI诊断转人工工作流测试',
    webhook: '/webhook/ai-escalation',
    testData: {
      diagnosisId: 'DIAG20260220001',
      confidenceScore: 65,
      userId: 'USER001',
      deviceModel: 'iPhone 14 Pro',
      issueDescription: '电池异常耗电',
      urgency: 'high'
    },
    expectedFields: ['success', 'escalationId']
  }
};

/**
 * 发送HTTP请求的辅助函数
 */
async function sendRequest(url, options = {}) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...options.headers
      },
      timeout: config.timeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * 验证响应数据结构
 */
function validateResponse(response, expectedFields) {
  const errors = [];
  
  // 检查必需字段
  expectedFields.forEach(field => {
    if (!(field in response.body)) {
      errors.push(`缺少必需字段: ${field}`);
    }
  });
  
  // 检查响应格式
  if (typeof response.body !== 'object') {
    errors.push('响应不是有效的JSON对象');
  }
  
  // 检查状态码
  if (response.statusCode !== 200) {
    errors.push(`HTTP状态码异常: ${response.statusCode}`);
  }
  
  return errors;
}

/**
 * 测试单个工作流
 */
async function testWorkflow(workflowName, testCase) {
  console.log(`\n🧪 开始测试: ${testCase.name}`);
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  let result = {
    workflow: workflowName,
    name: testCase.name,
    passed: false,
    errors: [],
    responseTime: 0,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 构造完整的Webhook URL
    const webhookUrl = `${config.baseUrl}${testCase.webhook}`;
    
    console.log(`📍 请求URL: ${webhookUrl}`);
    console.log(`📋 测试数据:`, JSON.stringify(testCase.testData, null, 2));
    
    // 发送测试请求
    const response = await sendRequest(webhookUrl, {
      method: 'POST',
      body: testCase.testData
    });
    
    result.responseTime = Date.now() - startTime;
    console.log(`⏱️  响应时间: ${result.responseTime}ms`);
    console.log(`📊 状态码: ${response.statusCode}`);
    console.log(`📥 响应数据:`, JSON.stringify(response.body, null, 2));
    
    // 验证响应
    const validationErrors = validateResponse(response, testCase.expectedFields);
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      console.log(`❌ 验证失败:`);
      validationErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      result.passed = true;
      console.log(`✅ 测试通过`);
    }
    
  } catch (error) {
    result.responseTime = Date.now() - startTime;
    result.errors = [error.message];
    console.log(`💥 测试异常: ${error.message}`);
  }
  
  return result;
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 启动自动化工作流测试套件');
  console.log('=====================================');
  
  const results = [];
  const startTime = Date.now();
  
  // 依次测试每个工作流
  for (const [workflowName, testCase] of Object.entries(testCases)) {
    const result = await testWorkflow(workflowName, testCase);
    results.push(result);
    
    // 短暂延迟避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const totalTime = Date.now() - startTime;
  
  // 生成测试报告
  generateReport(results, totalTime);
  
  return results;
}

/**
 * 生成测试报告
 */
function generateReport(results, totalTime) {
  console.log('\n📋 测试报告汇总');
  console.log('==================');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`📊 测试统计:`);
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过数量: ${passedTests}`);
  console.log(`   失败数量: ${failedTests}`);
  console.log(`   成功率: ${successRate}%`);
  console.log(`   总耗时: ${totalTime}ms`);
  
  console.log(`\n📈 详细结果:`);
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.name}`);
    console.log(`      响应时间: ${result.responseTime}ms`);
    if (!result.passed) {
      console.log(`      错误信息: ${result.errors.join(', ')}`);
    }
  });
  
  // 保存详细报告到文件
  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: successRate + '%',
      totalTime: totalTime + 'ms',
      timestamp: new Date().toISOString()
    },
    details: results
  };
  
  const reportPath = path.join(__dirname, '../test-results', `workflow-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
  // 返回测试结果状态
  return {
    allPassed: failedTests === 0,
    successRate: parseFloat(successRate),
    reportPath
  };
}

/**
 * 验证n8n工作流文件结构
 */
function validateWorkflowFiles() {
  console.log('\n🔍 验证工作流文件结构');
  console.log('========================');
  
  const workflowDir = path.join(__dirname, '../n8n-workflows');
  const requiredFiles = [
    'scan-flow.json',
    'tutorial-flow.json', 
    'payment-success.json',
    'ai-escalation.json'
  ];
  
  const missingFiles = [];
  const validationResults = [];
  
  requiredFiles.forEach(filename => {
    const filePath = path.join(workflowDir, filename);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(filename);
      console.log(`❌ 缺少文件: ${filename}`);
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const workflow = JSON.parse(content);
      
      // 基本结构验证
      const hasRequiredFields = workflow.name && workflow.nodes && workflow.connections;
      const isActive = workflow.active === false; // 应该是未激活状态
      
      if (hasRequiredFields && isActive) {
        console.log(`✅ ${filename}: 结构正确`);
        validationResults.push({ file: filename, valid: true });
      } else {
        console.log(`⚠️  ${filename}: 结构存在问题`);
        validationResults.push({ file: filename, valid: false, issues: '结构不完整或状态异常' });
      }
    } catch (error) {
      console.log(`❌ ${filename}: JSON格式错误 - ${error.message}`);
      validationResults.push({ file: filename, valid: false, issues: error.message });
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(`\n🚨 缺少 ${missingFiles.length} 个工作流文件`);
  }
  
  return validationResults;
}

/**
 * 验证文档文件
 */
function validateDocumentation() {
  console.log('\n📚 验证设计文档');
  console.log('================');
  
  const docsDir = path.join(__dirname, '../docs/workflows');
  const requiredDocs = [
    'scan-flow.md',
    'tutorial-flow.md',
    'payment-success.md',
    'ai-escalation.md'
  ];
  
  const missingDocs = [];
  
  requiredDocs.forEach(filename => {
    const filePath = path.join(docsDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${filename}: 存在 (${stats.size} bytes)`);
    } else {
      missingDocs.push(filename);
      console.log(`❌ ${filename}: 缺少文档`);
    }
  });
  
  return missingDocs.length === 0;
}

// 主测试函数
async function main() {
  try {
    console.log('🤖 自动化工作流验证系统启动\n');
    
    // 1. 验证文件结构
    const fileValidation = validateWorkflowFiles();
    const docsValid = validateDocumentation();
    
    // 2. 运行功能测试
    console.log('\n🧪 开始功能测试...');
    const testResults = await runAllTests();
    
    // 3. 综合评估
    console.log('\n🎯 最终评估');
    console.log('============');
    
    const fileValid = fileValidation.every(f => f.valid);
    const allPassed = testResults.allPassed && fileValid && docsValid;
    
    console.log(`📁 文件结构: ${fileValid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`📚 文档完整: ${docsValid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🧪 功能测试: ${testResults.allPassed ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🏆 总体结果: ${allPassed ? '🎉 全部通过' : '⚠️  存在问题'}`);
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('💥 测试执行异常:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  validateWorkflowFiles,
  validateDocumentation,
  testCases,
  config
};