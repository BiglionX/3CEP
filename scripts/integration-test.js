#!/usr/bin/env node

/**
 * 3CEP系统集成测试脚本
 * 测试所有新增功能的完整性和稳定性
 */

const fs = require('fs').promises;
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000,
  retries: 3
};

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  details: []
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTestResult(testName, passed, error = null) {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  
  if (error) {
    log(`  Error: ${error.message}`, 'red');
  }
  
  testResults.details.push({
    name: testName,
    passed,
    error: error?.message || null
  });
  
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// HTTP请求工具
async function httpRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 文件系统检查
async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 测试套件
class IntegrationTests {
  async runAllTests() {
    log('🚀 开始3CEP系统集成测试...\n', 'blue');
    
    // 基础设施测试
    await this.testInfrastructure();
    
    // 功能模块测试
    await this.testDocumentDisplay();
    await this.testAuditManagement();
    await this.testAIDiagnosis();
    await this.testTokenSystem();
    
    // 性能测试
    await this.testPerformance();
    
    // 输出测试报告
    await this.generateReport();
  }

  async testInfrastructure() {
    log('🏗️  基础设施测试...', 'blue');
    
    // 检查必要文件是否存在
    const requiredFiles = [
      'src/app/documents/page.tsx',
      'src/app/admin/reviews/page.tsx',
      'src/app/diagnosis/page.tsx',
      'src/app/tokens/page.tsx',
      'src/services/review-service.ts',
      'src/services/ai-diagnosis-service.ts',
      'src/services/token-service.ts',
      'src/components/ui/document-viewer.tsx'
    ];

    for (const file of requiredFiles) {
      const exists = await checkFileExists(path.join(__dirname, '..', file));
      logTestResult(`文件存在性检查: ${file}`, exists);
    }

    // 检查数据库迁移文件
    const migrationFiles = [
      'supabase/migrations/20240115000000_create_review_system.sql',
      'supabase/migrations/20240115000001_create_token_system.sql'
    ];

    for (const file of migrationFiles) {
      const exists = await checkFileExists(path.join(__dirname, '..', file));
      logTestResult(`数据库迁移文件: ${file}`, exists);
    }
  }

  async testDocumentDisplay() {
    log('\n📚 前端说明书展示组件测试...', 'blue');
    
    try {
      // 测试文档页面访问
      const response = await httpRequest(`${TEST_CONFIG.baseUrl}/documents`);
      logTestResult('文档列表页面访问', response.ok);
      
      // 测试API端点
      const apiResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/documents`);
      logTestResult('文档API端点访问', apiResponse.ok);
      
    } catch (error) {
      logTestResult('文档展示功能测试', false, error);
    }
  }

  async testAuditManagement() {
    log('\n📋 审核管理后台测试...', 'blue');
    
    try {
      // 测试审核页面访问
      const response = await httpRequest(`${TEST_CONFIG.baseUrl}/admin/reviews`);
      logTestResult('审核管理页面访问', response.ok);
      
      // 测试审核API
      const apiResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/reviews/pending`);
      // 401是预期的未授权状态
      logTestResult('审核API端点访问', apiResponse.status === 401 || apiResponse.ok);
      
    } catch (error) {
      logTestResult('审核管理功能测试', false, error);
    }
  }

  async testAIDiagnosis() {
    log('\n🤖 AI诊断聊天API测试...', 'blue');
    
    try {
      // 测试诊断页面访问
      const response = await httpRequest(`${TEST_CONFIG.baseUrl}/diagnosis`);
      logTestResult('AI诊断页面访问', response.ok);
      
      // 测试诊断API POST请求
      const apiResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '测试消息',
          sessionId: 'test_session_' + Date.now()
        })
      });
      logTestResult('AI诊断API调用', apiResponse.ok);
      
      // 测试诊断API GET请求
      const getResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/diagnosis?sessionId=test_session`);
      logTestResult('诊断会话信息获取', getResponse.ok);
      
    } catch (error) {
      logTestResult('AI诊断功能测试', false, error);
    }
  }

  async testTokenSystem() {
    log('\n💰 Token套餐购买页面测试...', 'blue');
    
    try {
      // 测试Token页面访问
      const response = await httpRequest(`${TEST_CONFIG.baseUrl}/tokens`);
      logTestResult('Token购买页面访问', response.ok);
      
      // 测试Token套餐API
      const packagesResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/tokens/packages`);
      logTestResult('Token套餐获取API', packagesResponse.ok);
      
      // 测试用户余额API
      const balanceResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/tokens/balance`);
      // 401是预期的未授权状态
      logTestResult('用户余额查询API', balanceResponse.status === 401 || balanceResponse.ok);
      
    } catch (error) {
      logTestResult('Token系统功能测试', false, error);
    }
  }

  async testPerformance() {
    log('\n⚡ 性能测试...', 'blue');
    
    const testUrls = [
      '/',
      '/documents',
      '/diagnosis',
      '/tokens'
    ];

    for (const url of testUrls) {
      try {
        const startTime = Date.now();
        const response = await httpRequest(`${TEST_CONFIG.baseUrl}${url}`);
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        const passed = response.ok && loadTime < 3000; // 3秒内加载完成
        logTestResult(`页面加载性能 ${url}: ${loadTime}ms`, passed);
        
      } catch (error) {
        logTestResult(`页面加载性能 ${url}`, false, error);
      }
    }
  }

  async generateReport() {
    log('\n📊 测试报告生成...', 'blue');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        passRate: ((testResults.passed / testResults.total) * 100).toFixed(2) + '%'
      },
      details: testResults.details
    };

    // 控制台输出
    log('\n' + '='.repeat(50), 'blue');
    log('测试总结', 'blue');
    log('='.repeat(50), 'blue');
    log(`总计测试: ${report.summary.total}`);
    log(`通过: ${report.summary.passed} ${colors.green}✓${colors.reset}`);
    log(`失败: ${report.summary.failed} ${colors.red}✗${colors.reset}`);
    log(`跳过: ${report.summary.skipped}`);
    log(`通过率: ${report.summary.passRate}`);
    log('='.repeat(50), 'blue');

    // 详细结果
    log('\n详细结果:', 'blue');
    report.details.forEach(detail => {
      const status = detail.passed ? '✓' : '✗';
      const color = detail.passed ? colors.green : colors.red;
      log(`${color}${status}${colors.reset} ${detail.name}`);
      if (!detail.passed && detail.error) {
        log(`   错误: ${detail.error}`, 'yellow');
      }
    });

    // 保存报告文件
    try {
      const reportPath = path.join(__dirname, '..', 'test-results', 'integration-test-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      log(`\n📋 测试报告已保存到: ${reportPath}`, 'green');
    } catch (error) {
      log(`\n❌ 保存测试报告失败: ${error.message}`, 'red');
    }

    // 返回测试结果
    return {
      success: testResults.failed === 0,
      report
    };
  }
}

// 主函数
async function main() {
  try {
    const tester = new IntegrationTests();
    const result = await tester.runAllTests();
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    log(`\n❌ 测试执行失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { IntegrationTests };