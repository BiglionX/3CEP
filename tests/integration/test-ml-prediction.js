#!/usr/bin/env node

/**
 * ML预测服务测试脚本
 * 验证机器学习集成（预测）功能
 * 任务ID: DATA-303
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000,
  testProductId: 'TEST-PRODUCT-001',
  testWarehouseId: 'warehouse-001'
};

class MLPredictionTestSuite {
  constructor() {
    this.results = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('🤖 开始ML预测服务测试套件\n');
    console.log('📋 测试配置:');
    console.log(`   基础URL: ${TEST_CONFIG.baseUrl}`);
    console.log(`   超时时间: ${TEST_CONFIG.timeout}ms`);
    console.log(`   测试产品ID: ${TEST_CONFIG.testProductId}`);
    console.log(`   测试仓库ID: ${TEST_CONFIG.testWarehouseId}\n`);

    try {
      // 1. 基础连通性测试
      await this.testServiceConnectivity();
      
      // 2. 需求预测测试
      await this.testDemandPrediction();
      
      // 3. 价格预测测试
      await this.testPricePrediction();
      
      // 4. 批量预测测试
      await this.testBatchPrediction();
      
      // 5. 错误处理测试
      await this.testErrorHandling();
      
      // 6. 性能测试
      await this.testPerformance();
      
      // 输出总结报告
      this.printTestSummary();
      
    } catch (error) {
      console.error('❌ 测试套件执行失败:', error);
      process.exit(1);
    }
  }

  async testServiceConnectivity() {
    console.log('🔌 测试1: 服务连通性检查');
    const startTime = Date.now();

    try {
      const response = await this.makeRequest('/api/ml-prediction?action=status', 'GET');
      
      if (!response.success) {
        throw new Error(`服务状态检查失败: ${response.error}`);
      }

      const { data } = response;
      const isValid = data.serviceStatus === 'running' && 
                     data.supportedModels && 
                     data.supportedPredictionTypes;

      this.recordResult('服务连通性', isValid, Date.now() - startTime, {
        serviceStatus: data.serviceStatus,
        supportedModels: data.supportedModels?.length || 0,
        supportedPredictionTypes: data.supportedPredictionTypes?.length || 0
      });

      if (isValid) {
        console.log('   ✅ 服务连接正常');
        console.log(`   📊 支持模型数: ${data.supportedModels?.length || 0}`);
        console.log(`   📊 预测类型数: ${data.supportedPredictionTypes?.length || 0}`);
      } else {
        console.log('   ❌ 服务状态异常');
      }

    } catch (error) {
      this.recordResult('服务连通性', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 连接失败: ${error.message}`);
    }
  }

  async testDemandPrediction() {
    console.log('\n📈 测试2: 需求预测功能');
    const startTime = Date.now();

    try {
      const requestBody = {
        action: 'predict-demand',
        productId: TEST_CONFIG.testProductId,
        warehouseId: TEST_CONFIG.testWarehouseId,
        horizonDays: 7,
        options: {
          seasonalFactors: ['周末效应', '节假日影响'],
          externalEvents: ['促销活动']
        }
      };

      const response = await this.makeRequest('/api/ml-prediction', 'POST', requestBody);
      
      if (!response.success) {
        throw new Error(`需求预测失败: ${response.error}`);
      }

      const { data } = response;
      const isValid = data.predictions && 
                      Array.isArray(data.predictions) && 
                      data.predictions.length === 7 &&
                      data.summary &&
                      data.analysis;

      this.recordResult('需求预测', isValid, Date.now() - startTime, {
        predictionDays: data.predictions?.length || 0,
        totalQuantity: data.summary?.totalQuantity || 0,
        confidence: data.summary?.confidence || 0
      });

      if (isValid) {
        console.log('   ✅ 需求预测功能正常');
        console.log(`   📅 预测天数: ${data.predictions.length}`);
        console.log(`   📦 总预测量: ${data.summary.totalQuantity}`);
        console.log(`   💯 置信度: ${(data.summary.confidence * 100).toFixed(1)}%`);
      } else {
        console.log('   ❌ 需求预测结果格式不正确');
      }

    } catch (error) {
      this.recordResult('需求预测', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 需求预测失败: ${error.message}`);
    }
  }

  async testPricePrediction() {
    console.log('\n💰 测试3: 价格预测功能');
    const startTime = Date.now();

    try {
      const requestBody = {
        action: 'predict-price',
        productId: TEST_CONFIG.testProductId,
        platform: 'taobao',
        horizonDays: 7,
        options: {
          marketConditions: '正常市场环境',
          competitorActions: '价格竞争激烈'
        }
      };

      const response = await this.makeRequest('/api/ml-prediction', 'POST', requestBody);
      
      if (!response.success) {
        throw new Error(`价格预测失败: ${response.error}`);
      }

      const { data } = response;
      const isValid = data.predictions && 
                      Array.isArray(data.predictions) && 
                      data.predictions.length === 7 &&
                      data.summary &&
                      data.marketInsights;

      this.recordResult('价格预测', isValid, Date.now() - startTime, {
        predictionDays: data.predictions?.length || 0,
        priceTrend: data.summary?.priceTrend || '未知',
        confidence: data.summary?.confidence || 0
      });

      if (isValid) {
        console.log('   ✅ 价格预测功能正常');
        console.log(`   📅 预测天数: ${data.predictions.length}`);
        console.log(`   📈 价格趋势: ${data.summary.priceTrend}`);
        console.log(`   💯 置信度: ${(data.summary.confidence * 100).toFixed(1)}%`);
      } else {
        console.log('   ❌ 价格预测结果格式不正确');
      }

    } catch (error) {
      this.recordResult('价格预测', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 价格预测失败: ${error.message}`);
    }
  }

  async testBatchPrediction() {
    console.log('\n🔄 测试4: 批量预测功能');
    const startTime = Date.now();

    try {
      const batchRequests = [
        {
          action: 'predict-demand',
          productId: TEST_CONFIG.testProductId,
          warehouseId: TEST_CONFIG.testWarehouseId,
          horizonDays: 3
        },
        {
          action: 'predict-price',
          productId: TEST_CONFIG.testProductId,
          platform: 'jd',
          horizonDays: 3
        }
      ];

      const requestBody = {
        action: 'batch-predict',
        predictions: batchRequests,
        parallel: true
      };

      const response = await this.makeRequest('/api/ml-prediction', 'POST', requestBody);
      
      if (!response.success) {
        throw new Error(`批量预测失败: ${response.error}`);
      }

      const { data } = response;
      const isValid = data.results && 
                      Array.isArray(data.results) && 
                      data.results.length === 2 &&
                      data.summary;

      this.recordResult('批量预测', isValid, Date.now() - startTime, {
        totalRequests: data.results?.length || 0,
        successful: data.summary?.successful || 0,
        successRate: data.summary?.successRate || '0%'
      });

      if (isValid) {
        console.log('   ✅ 批量预测功能正常');
        console.log(`   🔢 总请求数: ${data.results.length}`);
        console.log(`   ✅ 成功数量: ${data.summary.successful}`);
        console.log(`   📊 成功率: ${data.summary.successRate}`);
      } else {
        console.log('   ❌ 批量预测结果格式不正确');
      }

    } catch (error) {
      this.recordResult('批量预测', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 批量预测失败: ${error.message}`);
    }
  }

  async testErrorHandling() {
    console.log('\n🛡️ 测试5: 错误处理机制');
    const startTime = Date.now();

    try {
      // 测试缺少必需参数的情况
      const invalidRequest = {
        action: 'predict-demand'
        // 缺少productId和warehouseId
      };

      const response = await this.makeRequest('/api/ml-prediction', 'POST', invalidRequest);
      
      const isErrorHandled = !response.success && response.error;
      
      this.recordResult('错误处理', isErrorHandled, Date.now() - startTime, {
        errorCode: response.error ? '参数验证错误' : '未捕获错误',
        errorMessage: response.error || '无错误信息'
      });

      if (isErrorHandled) {
        console.log('   ✅ 错误处理机制正常');
        console.log(`   🚨 错误类型: 参数验证错误`);
        console.log(`   💬 错误信息: ${response.error}`);
      } else {
        console.log('   ❌ 错误未被正确处理');
      }

    } catch (error) {
      this.recordResult('错误处理', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 错误处理测试失败: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log('\n⚡ 测试6: 性能基准测试');
    const startTime = Date.now();

    try {
      const performanceResults = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const iterStartTime = Date.now();
        
        const requestBody = {
          action: 'predict-demand',
          productId: `${TEST_CONFIG.testProductId}-${i}`,
          warehouseId: TEST_CONFIG.testWarehouseId,
          horizonDays: 3
        };

        try {
          await this.makeRequest('/api/ml-prediction', 'POST', requestBody);
          const duration = Date.now() - iterStartTime;
          performanceResults.push(duration);
        } catch (error) {
          performanceResults.push(null);
        }
      }

      const validResults = performanceResults.filter(r => r !== null);
      const avgResponseTime = validResults.length > 0 
        ? validResults.reduce((sum, time) => sum + time, 0) / validResults.length 
        : 0;
      
      const successRate = (validResults.length / iterations) * 100;
      const isValid = avgResponseTime < 5000 && successRate >= 80; // 5秒内，成功率80%以上

      this.recordResult('性能基准', isValid, Date.now() - startTime, {
        averageResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        successRate: `${successRate.toFixed(1)}%`,
        totalIterations: iterations,
        successfulIterations: validResults.length
      });

      if (isValid) {
        console.log('   ✅ 性能基准达标');
        console.log(`   ⏱️  平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   📊 成功率: ${successRate.toFixed(1)}%`);
      } else {
        console.log('   ⚠️  性能基准未达标');
        console.log(`   ⏱️  平均响应时间: ${avgResponseTime.toFixed(0)}ms (目标: <5000ms)`);
        console.log(`   📊 成功率: ${successRate.toFixed(1)}% (目标: ≥80%)`);
      }

    } catch (error) {
      this.recordResult('性能基准', false, Date.now() - startTime, null, error.message);
      console.log(`   ❌ 性能测试失败: ${error.message}`);
    }
  }

  // 辅助方法
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: TEST_CONFIG.timeout
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error.type === 'request-timeout') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  recordResult(testName, passed, executionTime, details = null, errorMessage = null) {
    const result = {
      testName,
      passed,
      executionTime,
      details,
      errorMessage,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    
    if (passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
  }

  printTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ML预测服务测试总结报告');
    console.log('='.repeat(60));

    console.log(`\n✅ 通过测试: ${this.passedTests}`);
    console.log(`❌ 失败测试: ${this.failedTests}`);
    console.log(`📈 总体通过率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    console.log('\n📋 详细结果:');
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${result.testName}`);
      console.log(`     执行时间: ${result.executionTime}ms`);
      
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`);
        });
      }
      
      if (result.errorMessage) {
        console.log(`     错误信息: ${result.errorMessage}`);
      }
      console.log('');
    });

    console.log('='.repeat(60));
    
    // 生成测试报告文件
    this.generateTestReport();
    
    const overallSuccess = this.failedTests === 0;
    console.log(`\n${overallSuccess ? '🎉' : '⚠️'} 测试${overallSuccess ? '全部通过' : '存在失败项'}`);
    
    if (!overallSuccess) {
      console.log('\n💡 建议:');
      console.log('   1. 检查服务是否正常运行');
      console.log('   2. 验证数据库连接');
      console.log('   3. 确认大模型API配置');
      console.log('   4. 查看详细错误日志');
    }
    
    process.exit(overallSuccess ? 0 : 1);
  }

  generateTestReport() {
    const report = {
      testSuite: 'ML预测服务测试',
      taskId: 'DATA-303',
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.passedTests + this.failedTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        passRate: ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(2) + '%'
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        testConfig: TEST_CONFIG
      }
    };

    const reportPath = path.join(process.cwd(), 'test-results', 'ml-prediction-test-report.json');
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 详细测试报告已保存至: ${reportPath}`);
  }
}

// 执行测试
async function runTests() {
  const testSuite = new MLPredictionTestSuite();
  
  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error('测试执行异常:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

module.exports = { MLPredictionTestSuite };