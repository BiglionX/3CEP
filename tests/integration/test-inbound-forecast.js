/**
 * 入库预报功能测试脚本
 * WMS-203 入库预报管理功能完整测试
 */

const fs = require('fs');
const path = require('path');

class InboundForecastTester {
  constructor() {
    this.testResults = [];
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testData = {
      forecastId: null,
      forecastNumber: null
    };
  }

  async runAllTests() {
    console.log('🧪 开始入库预报功能测试...\n');
    console.log(`测试基础URL: ${this.baseUrl}\n`);

    try {
      // 1. 健康检查
      await this.testHealthCheck();
      
      // 2. 创建预报单测试
      await this.testCreateForecast();
      
      // 3. 查询预报单列表测试
      await this.testListForecasts();
      
      // 4. 查询预报单详情测试
      await this.testGetForecastDetail();
      
      // 5. 更新预报单状态测试
      await this.testUpdateForecastStatus();
      
      // 6. WMS回调测试
      await this.testWMSCallback();
      
      // 7. 边界情况测试
      await this.testEdgeCases();
      
      // 8. 权限测试
      await this.testPermissions();

      this.generateTestReport();
    } catch (error) {
      console.error('测试执行失败:', error);
      this.testResults.push({
        test: '整体测试',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testHealthCheck() {
    console.log('📋 测试API健康检查...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const result = await response.json();
      
      if (response.ok && result.status === 'healthy') {
        this.testResults.push({
          test: 'API健康检查',
          status: 'PASSED',
          data: result
        });
        console.log('✅ API健康检查测试通过');
      } else {
        throw new Error('API健康检查失败');
      }
    } catch (error) {
      this.testResults.push({
        test: 'API健康检查',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ API健康检查测试失败:', error.message);
    }
  }

  async testCreateForecast() {
    console.log('📋 测试创建预报单...');
    
    try {
      const testData = {
        warehouseId: 'us-lax-001',
        supplierName: '测试供应商有限公司',
        supplierContact: '张三 13800138000',
        supplierAddress: '广东省深圳市南山区科技园南路1001号',
        expectedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
        items: [
          {
            sku: 'TEST-SKU-001',
            forecastedQuantity: 100,
            unitWeight: 0.5,
            dimensions: { length: 20, width: 15, height: 10 },
            remarks: '测试商品1'
          },
          {
            sku: 'TEST-SKU-002',
            forecastedQuantity: 50,
            unitWeight: 1.2,
            remarks: '测试商品2'
          }
        ],
        remarks: '自动化测试创建的预报单'
      };

      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        this.testData.forecastId = result.data.id;
        this.testData.forecastNumber = result.data.forecastNumber;
        
        this.testResults.push({
          test: '创建预报单',
          status: 'PASSED',
          data: {
            id: result.data.id,
            forecastNumber: result.data.forecastNumber,
            itemCount: result.data.items.length
          }
        });
        console.log('✅ 创建预报单测试通过');
        console.log(`   预报单号: ${result.data.forecastNumber}`);
        console.log(`   商品数量: ${result.data.items.length}`);
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error) {
      this.testResults.push({
        test: '创建预报单',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 创建预报单测试失败:', error.message);
    }
  }

  async testListForecasts() {
    console.log('📋 测试查询预报单列表...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast?limit=10`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.testResults.push({
          test: '查询预报单列表',
          status: 'PASSED',
          data: { 
            count: result.data.length,
            sample: result.data.slice(0, 2)
          }
        });
        console.log('✅ 查询预报单列表测试通过');
        console.log(`   返回记录数: ${result.data.length}`);
      } else {
        throw new Error(result.error || '查询失败');
      }
    } catch (error) {
      this.testResults.push({
        test: '查询预报单列表',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 查询预报单列表测试失败:', error.message);
    }
  }

  async testGetForecastDetail() {
    console.log('📋 测试查询预报单详情...');
    
    if (!this.testData.forecastId) {
      console.log('⚠️  跳过详情测试，没有有效的预报单ID');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast/${this.testData.forecastId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.testResults.push({
          test: '查询预报单详情',
          status: 'PASSED',
          data: {
            forecastNumber: result.data.forecast.forecastNumber,
            status: result.data.forecast.status,
            items: result.data.forecast.items.length
          }
        });
        console.log('✅ 查询预报单详情测试通过');
        console.log(`   预报单号: ${result.data.forecast.forecastNumber}`);
        console.log(`   状态: ${result.data.forecast.status}`);
      } else {
        throw new Error(result.error || '查询失败');
      }
    } catch (error) {
      this.testResults.push({
        test: '查询预报单详情',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 查询预报单详情测试失败:', error.message);
    }
  }

  async testUpdateForecastStatus() {
    console.log('📋 测试更新预报单状态...');
    
    if (!this.testData.forecastId) {
      console.log('⚠️  跳过状态更新测试，没有有效的预报单ID');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast/${this.testData.forecastId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_transit',
          reason: '货物已发出，正在运输中'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        this.testResults.push({
          test: '更新预报单状态',
          status: 'PASSED'
        });
        console.log('✅ 更新预报单状态测试通过');
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error) {
      this.testResults.push({
        test: '更新预报单状态',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 更新预报单状态测试失败:', error.message);
    }
  }

  async testWMSCallback() {
    console.log('📋 测试WMS回调处理...');
    
    try {
      const callbackData = {
        noticeId: this.testData.forecastId || 'test-notice-id',
        status: 'received',
        actualArrival: new Date().toISOString(),
        receivedItems: [
          {
            sku: 'TEST-SKU-001',
            expectedQuantity: 100,
            receivedQuantity: 98,
            discrepancy: -2
          },
          {
            sku: 'TEST-SKU-002',
            expectedQuantity: 50,
            receivedQuantity: 50,
            discrepancy: 0
          }
        ],
        timestamp: new Date().toISOString(),
        signature: 'test-signature'
      };

      const response = await fetch(`${this.baseUrl}/api/wms/callback/inbound`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-callback-token'
        },
        body: JSON.stringify(callbackData)
      });

      const result = await response.json();
      
      if (response.ok) {
        this.testResults.push({
          test: 'WMS回调处理',
          status: 'PASSED',
          data: result
        });
        console.log('✅ WMS回调处理测试通过');
      } else {
        throw new Error(result.error || '回调处理失败');
      }
    } catch (error) {
      this.testResults.push({
        test: 'WMS回调处理',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ WMS回调处理测试失败:', error.message);
    }
  }

  async testEdgeCases() {
    console.log('📋 测试边界情况...');
    
    // 测试空数据
    try {
      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.status === 400) {
        this.testResults.push({
          test: '空数据校验',
          status: 'PASSED'
        });
        console.log('✅ 空数据校验测试通过');
      } else {
        throw new Error('应该返回400错误');
      }
    } catch (error) {
      this.testResults.push({
        test: '空数据校验',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 空数据校验测试失败:', error.message);
    }

    // 测试无效日期
    try {
      const invalidData = {
        warehouseId: 'us-lax-001',
        supplierName: '测试供应商',
        supplierContact: '联系人',
        supplierAddress: '地址',
        expectedArrival: 'invalid-date',
        items: [{ sku: 'TEST', forecastedQuantity: 1 }]
      };

      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        this.testResults.push({
          test: '无效日期校验',
          status: 'PASSED'
        });
        console.log('✅ 无效日期校验测试通过');
      }
    } catch (error) {
      console.log('❌ 无效日期校验测试失败:', error.message);
    }

    // 测试无效状态转换
    if (this.testData.forecastId) {
      try {
        const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast/${this.testData.forecastId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'cancelled',
            reason: '测试无效状态转换'
          })
        });

        // 收货状态不能再变为取消状态，应该失败
        if (response.status === 400) {
          this.testResults.push({
            test: '无效状态转换校验',
            status: 'PASSED'
          });
          console.log('✅ 无效状态转换校验测试通过');
        }
      } catch (error) {
        console.log('❌ 无效状态转换校验测试失败:', error.message);
      }
    }
  }

  async testPermissions() {
    console.log('📋 测试权限控制...');
    
    try {
      // 测试未认证访问
      const response = await fetch(`${this.baseUrl}/api/wms/inbound-forecast`, {
        method: 'GET'
      });

      if (response.status === 401) {
        this.testResults.push({
          test: '未认证访问控制',
          status: 'PASSED'
        });
        console.log('✅ 未认证访问控制测试通过');
      } else {
        throw new Error('未认证访问应该被拒绝');
      }
    } catch (error) {
      this.testResults.push({
        test: '未认证访问控制',
        status: 'FAILED',
        error: error.message
      });
      console.log('❌ 未认证访问控制测试失败:', error.message);
    }
  }

  generateTestReport() {
    const passedTests = this.testResults.filter(t => t.status === 'PASSED').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAILED').length;
    const totalTests = this.testResults.length;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    console.log('📊 入库预报功能测试报告');
    console.log('='.repeat(60));
    console.log(`总计测试: ${totalTests}`);
    console.log(`✅ 通过: ${passedTests}`);
    console.log(`❌ 失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log('='.repeat(60));

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(t => t.status === 'FAILED')
        .forEach(t => {
          console.log(`  - ${t.test}: ${t.error}`);
        });
    }

    // 保存测试报告
    const reportPath = path.join(__dirname, '..', 'test-results', `inbound-forecast-test-${Date.now()}.json`);
    
    try {
      // 确保目录存在
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      
      // 保存报告
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        testData: this.testData,
        summary: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          successRate: parseFloat(successRate)
        },
        details: this.testResults
      }, null, 2));
      
      console.log(`\n📄 测试报告已保存到: ${reportPath}`);
    } catch (error) {
      console.error('保存测试报告失败:', error);
    }

    // 输出最终结果
    console.log('\n🏁 测试完成!');
    if (successRate >= 80) {
      console.log('🎉 测试通过! 入库预报功能基本可用');
    } else {
      console.log('⚠️  测试未完全通过，请检查失败的测试项');
    }
  }
}

// 执行测试
if (require.main === module) {
  const tester = new InboundForecastTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { InboundForecastTester };