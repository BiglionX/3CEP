#!/usr/bin/env node

/**
 * FixCycle E2E测试执行脚本
 * 自动化执行端到端测试并生成报告
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class E2ETestRunner {
  constructor() {
    this.testResults = {
      startTime: new Date(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testSuites: [],
      errors: []
    };
  }

  async runTests() {
    console.log('🚀 开始执行FixCycle端到端测试...\n');
    
    try {
      // 1. 确保应用正在运行
      await this.ensureAppRunning();
      
      // 2. 准备测试数据
      await this.prepareTestData();
      
      // 3. 执行测试套件
      await this.executeTestSuite('engineer-workflow.spec.ts');
      await this.executeTestSuite('consumer-workflow.spec.ts');
      await this.executeTestSuite('admin/link-review.spec.ts');
      await this.executeTestSuite('api/auth-endpoints.spec.ts');
      
      // 4. 生成测试报告
      await this.generateReport();
      
      // 5. 输出总结
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 测试执行过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  async ensureAppRunning() {
    console.log('📋 检查应用运行状态...');
    
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        console.log('✅ 应用已在运行');
        return;
      }
    } catch (error) {
      console.log('⚠️  应用未运行，启动开发服务器...');
    }

    // 启动开发服务器
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // 等待服务器启动
    await new Promise((resolve) => {
      let output = '';
      devProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('ready started server')) {
          console.log('✅ 开发服务器启动成功');
          resolve();
        }
      });

      // 设置超时
      setTimeout(() => {
        console.log('⚠️  服务器启动超时，继续执行测试...');
        resolve();
      }, 30000);
    });
  }

  async prepareTestData() {
    console.log('\n📋 准备测试数据...');
    try {
      const prepareScript = spawn('node', ['scripts/prepare-test-data.js'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        prepareScript.on('close', (code) => {
          if (code === 0) {
            console.log('✅ 测试数据准备完成');
            resolve();
          } else {
            reject(new Error(`数据准备脚本退出码: ${code}`));
          }
        });
      });
    } catch (error) {
      console.error('❌ 测试数据准备失败:', error.message);
      throw error;
    }
  }

  async executeTestSuite(suiteName) {
    console.log(`\n🧪 执行测试套件: ${suiteName}`);
    
    const testProcess = spawn('npx', ['playwright', 'test', suiteName], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    return new Promise((resolve) => {
      testProcess.on('close', (code) => {
        const suiteResult = {
          name: suiteName,
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          passed: code === 0,
          timestamp: new Date()
        };

        this.testResults.testSuites.push(suiteResult);
        
        if (code === 0) {
          console.log(`✅ ${suiteName} 测试通过`);
          this.testResults.passedTests++;
        } else {
          console.log(`❌ ${suiteName} 测试失败`);
          this.testResults.failedTests++;
          this.testResults.errors.push({
            suite: suiteName,
            error: stderr || stdout
          });
        }
        
        this.testResults.totalTests++;
        resolve();
      });
    });
  }

  async generateReport() {
    console.log('\n📊 生成测试报告...');
    
    this.testResults.endTime = new Date();
    this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
    
    const reportPath = path.join(process.cwd(), 'test-results', 'e2e-test-report.json');
    const htmlReportPath = path.join(process.cwd(), 'test-results', 'e2e-test-report.html');
    
    // 确保报告目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // 生成JSON报告
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    // 生成HTML报告
    const htmlReport = this.generateHtmlReport();
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`✅ 测试报告已生成:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  generateHtmlReport() {
    const passedPercentage = ((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>FixCycle E2E测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 10px 0; color: #666; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .suite { margin: 20px 0; padding: 15px; border-left: 4px solid #ddd; }
        .suite.passed { border-left-color: #4CAF50; background: #f1f8e9; }
        .suite.failed { border-left-color: #f44336; background: #ffebee; }
        .error { background: #ffeb3b; padding: 10px; border-radius: 3px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FixCycle 端到端测试报告</h1>
        <p>执行时间: ${this.testResults.startTime.toLocaleString()} - ${this.testResults.endTime.toLocaleString()}</p>
        <p>执行耗时: ${(this.testResults.duration / 1000).toFixed(2)} 秒</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>总测试数</h3>
            <div class="value">${this.testResults.totalTests}</div>
        </div>
        <div class="metric">
            <h3>通过测试</h3>
            <div class="value passed">${this.testResults.passedTests}</div>
        </div>
        <div class="metric">
            <h3>失败测试</h3>
            <div class="value failed">${this.testResults.failedTests}</div>
        </div>
        <div class="metric">
            <h3>通过率</h3>
            <div class="value ${passedPercentage >= 90 ? 'passed' : 'failed'}">${passedPercentage}%</div>
        </div>
    </div>
    
    <h2>测试套件详情</h2>
    ${this.testResults.testSuites.map(suite => `
        <div class="suite ${suite.passed ? 'passed' : 'failed'}">
            <h3>${suite.name}</h3>
            <p>状态: ${suite.passed ? '✅ 通过' : '❌ 失败'}</p>
            <p>执行时间: ${suite.timestamp.toLocaleString()}</p>
            ${!suite.passed ? `<div class="error"><pre>${suite.stderr || suite.stdout}</pre></div>` : ''}
        </div>
    `).join('')}
    
    ${this.testResults.errors.length > 0 ? `
        <h2>错误详情</h2>
        ${this.testResults.errors.map(error => `
            <div class="error">
                <h4>${error.suite}</h4>
                <pre>${error.error}</pre>
            </div>
        `).join('')}
    ` : ''}
</body>
</html>`;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试执行总结');
    console.log('='.repeat(60));
    console.log(`总测试套件数: ${this.testResults.totalTests}`);
    console.log(`✅ 通过: ${this.testResults.passedTests}`);
    console.log(`❌ 失败: ${this.testResults.failedTests}`);
    console.log(`⏱️  执行耗时: ${(this.testResults.duration / 1000).toFixed(2)} 秒`);
    
    const passRate = ((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1);
    console.log(`📈 通过率: ${passRate}%`);
    
    if (this.testResults.failedTests > 0) {
      console.log('\n❌ 失败的测试套件:');
      this.testResults.testSuites
        .filter(suite => !suite.passed)
        .forEach(suite => console.log(`   • ${suite.name}`));
    }
    
    console.log('\n✅ 测试执行完成！');
  }
}

// 执行测试
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.runTests().catch(console.error);
}

module.exports = { E2ETestRunner };