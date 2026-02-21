/**
 * 物流追踪系统测试脚本
 * 验证至少3家主流物流商的轨迹查询功能
 */

const fs = require('fs');
const path = require('path');

// 模拟Next.js环境变量
process.env.TRACK17_API_KEY = 'test_17track_api_key';
process.env.SF_EXPRESS_API_KEY = 'test_sf_express_api_key';
process.env.KDNIAO_API_KEY = 'test_kdniao_api_key';
process.env.KDNIAO_CUSTOMER_ID = 'test_customer_id';

// 导入物流追踪服务
const { LogisticsTrackingService } = require('../dist/supply-chain/services/logistics-tracking.service');
const { LogisticsTrackingConfig, LogisticsCarrier } = require('../dist/supply-chain/models/logistics.model');

// 测试配置
const testConfig = {
  defaultTimeout: 5000,
  maxRetryAttempts: 1,
  autoDetectEnabled: true,
  cacheEnabled: false, // 测试时禁用缓存
  cacheTTL: 60,
  carriers: [
    {
      carrier: LogisticsCarrier.OTHER,
      apiKey: 'test_17track_api_key',
      isEnabled: true,
      timeout: 5000,
      retryAttempts: 1
    },
    {
      carrier: LogisticsCarrier.SF_EXPRESS,
      apiKey: 'test_sf_express_api_key',
      endpoint: 'https://mock.sf-express.com',
      isEnabled: true,
      timeout: 5000,
      retryAttempts: 1
    }
  ]
};

// 测试用例
const testCases = [
  {
    name: '顺丰速运测试',
    trackingNumber: '123456789012', // 12位数字，符合顺丰格式
    carrier: LogisticsCarrier.SF_EXPRESS,
    description: '测试顺丰速运官方API对接'
  },
  {
    name: '圆通速递测试',
    trackingNumber: 'YT123456789012', // YT开头，符合圆通格式
    carrier: LogisticsCarrier.YTO,
    description: '测试圆通速递轨迹查询'
  },
  {
    name: '中通快递测试',
    trackingNumber: 'ZT123456789012', // ZT开头，符合中通格式
    carrier: LogisticsCarrier.ZTO,
    description: '测试中通快递轨迹查询'
  },
  {
    name: '自动识别测试',
    trackingNumber: 'ST123456789012', // ST开头，应该识别为申通
    carrier: null,
    description: '测试自动物流商识别功能'
  },
  {
    name: '批量查询测试',
    trackingNumbers: ['123456789012', 'YT123456789012', 'ZT123456789012'],
    description: '测试批量轨迹查询功能'
  }
];

// 模拟物流商客户端
class MockTrack17Client {
  getCarrierName() { return 'Mock 17TRACK'; }
  
  validateTrackingNumber(trackingNumber) {
    return trackingNumber.length >= 8 && trackingNumber.length <= 32;
  }
  
  async getTrackingInfo(trackingNumber) {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    
    return {
      success: true,
      tracking: {
        trackingNumber,
        carrier: this.detectCarrier(trackingNumber),
        carrierName: '模拟物流商',
        status: 'in_transit',
        origin: '上海',
        destination: '北京',
        timeline: [
          {
            timestamp: new Date(Date.now() - 86400000), // 1天前
            location: '上海转运中心',
            status: 'collected',
            description: '已揽收'
          },
          {
            timestamp: new Date(Date.now() - 43200000), // 12小时前
            location: '北京转运中心',
            status: 'in_transit',
            description: '运输中'
          },
          {
            timestamp: new Date(),
            location: '北京市朝阳区',
            status: 'out_for_delivery',
            description: '派送中'
          }
        ],
        lastUpdated: new Date(),
        isDelivered: false
      },
      requestId: 'mock_' + Date.now(),
      timestamp: new Date()
    };
  }
  
  async getBatchTrackingInfo(trackingNumbers) {
    return Promise.all(trackingNumbers.map(tn => this.getTrackingInfo(tn)));
  }
  
  getSupportedCarriers() {
    return [
      LogisticsCarrier.SF_EXPRESS,
      LogisticsCarrier.YTO,
      LogisticsCarrier.ZTO,
      LogisticsCarrier.STO,
      LogisticsCarrier.EMS,
      LogisticsCarrier.YUNDA
    ];
  }
  
  detectCarrier(trackingNumber) {
    if (trackingNumber.startsWith('YT')) return LogisticsCarrier.YTO;
    if (trackingNumber.startsWith('ZT')) return LogisticsCarrier.ZTO;
    if (trackingNumber.startsWith('ST')) return LogisticsCarrier.STO;
    if (/^\d{12}$/.test(trackingNumber)) return LogisticsCarrier.SF_EXPRESS;
    return LogisticsCarrier.OTHER;
  }
}

class MockSfExpressClient {
  getCarrierName() { return 'Mock 顺丰速运'; }
  
  validateTrackingNumber(trackingNumber) {
    return /^\d{12}$/.test(trackingNumber);
  }
  
  async getTrackingInfo(trackingNumber) {
    await new Promise(resolve => setTimeout(resolve, 150)); // 模拟网络延迟
    
    return {
      success: true,
      tracking: {
        trackingNumber,
        carrier: LogisticsCarrier.SF_EXPRESS,
        carrierName: '顺丰速运',
        status: 'delivered',
        origin: '深圳',
        destination: '广州',
        estimatedDelivery: new Date(Date.now() + 86400000), // 1天后
        actualDelivery: new Date(Date.now() - 3600000), // 1小时前
        timeline: [
          {
            timestamp: new Date(Date.now() - 172800000), // 2天前
            location: '深圳宝安区',
            status: 'collected',
            description: '已揽收'
          },
          {
            timestamp: new Date(Date.now() - 86400000), // 1天前
            location: '广州白云区转运中心',
            status: 'in_transit',
            description: '运输中'
          },
          {
            timestamp: new Date(Date.now() - 7200000), // 2小时前
            location: '广州市天河区',
            status: 'out_for_delivery',
            description: '派送中'
          },
          {
            timestamp: new Date(Date.now() - 3600000), // 1小时前
            location: '广州市天河区',
            status: 'delivered',
            description: '已签收'
          }
        ],
        lastUpdated: new Date(),
        isDelivered: true
      },
      requestId: 'mock_sf_' + Date.now(),
      timestamp: new Date()
    };
  }
  
  async getBatchTrackingInfo(trackingNumbers) {
    return Promise.all(trackingNumbers.map(tn => this.getTrackingInfo(tn)));
  }
  
  getSupportedCarriers() {
    return [LogisticsCarrier.SF_EXPRESS];
  }
}

// 替换真实客户端为模拟客户端
function patchServiceWithMocks(service) {
  // 注入模拟客户端
  service.clients.set(LogisticsCarrier.OTHER, new MockTrack17Client());
  service.clients.set(LogisticsCarrier.SF_EXPRESS, new MockSfExpressClient());
  
  // 修改初始化逻辑，使用模拟客户端
  const originalInitialize = service.initializeClients;
  service.initializeClients = function() {
    this.clients.set(LogisticsCarrier.OTHER, new MockTrack17Client());
    this.clients.set(LogisticsCarrier.SF_EXPRESS, new MockSfExpressClient());
  };
  
  // 重新初始化
  service.initializeClients();
}

async function runTest() {
  console.log('🚀 开始物流追踪系统测试...\n');
  
  // 创建物流追踪服务实例
  const logisticsService = new LogisticsTrackingService(testConfig);
  
  // 应用模拟客户端
  patchServiceWithMocks(logisticsService);
  
  const testResults = [];
  let passedTests = 0;
  let totalTests = 0;
  
  // 运行单个运单查询测试
  for (const testCase of testCases.filter(tc => tc.trackingNumber)) {
    totalTests++;
    console.log(`📋 测试 ${testCase.name}`);
    console.log(`   描述: ${testCase.description}`);
    console.log(`   运单号: ${testCase.trackingNumber}`);
    console.log(`   指定物流商: ${testCase.carrier || '自动识别'}`);
    
    try {
      const result = await logisticsService.trackShipment({
        trackingNumber: testCase.trackingNumber,
        carrier: testCase.carrier,
        autoDetect: !testCase.carrier
      });
      
      if (result.success) {
        console.log(`   ✅ 测试通过`);
        console.log(`   📦 物流商: ${result.tracking?.carrierName}`);
        console.log(`   📍 状态: ${result.tracking?.status}`);
        console.log(`   📍 轨迹节点数: ${result.tracking?.timeline.length}`);
        passedTests++;
      } else {
        console.log(`   ❌ 测试失败: ${result.error?.message}`);
      }
      
      testResults.push({
        testName: testCase.name,
        trackingNumber: testCase.trackingNumber,
        success: result.success,
        error: result.error,
        tracking: result.tracking
      });
      
    } catch (error) {
      console.log(`   ❌ 测试异常: ${error.message}`);
      testResults.push({
        testName: testCase.name,
        trackingNumber: testCase.trackingNumber,
        success: false,
        error: { message: error.message }
      });
    }
    
    console.log('');
  }
  
  // 运行批量查询测试
  const batchTest = testCases.find(tc => tc.trackingNumbers);
  if (batchTest) {
    totalTests++;
    console.log(`📋 批量查询测试`);
    console.log(`   描述: ${batchTest.description}`);
    console.log(`   运单数量: ${batchTest.trackingNumbers.length}`);
    
    try {
      const results = await logisticsService.batchTrackShipments({
        trackingNumbers: batchTest.trackingNumbers
      });
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        console.log(`   ✅ 批量测试通过 (${successCount}/${totalCount})`);
        passedTests++;
      } else {
        console.log(`   ⚠️  部分成功 (${successCount}/${totalCount})`);
      }
      
      testResults.push({
        testName: '批量查询测试',
        trackingNumbers: batchTest.trackingNumbers,
        success: successCount === totalCount,
        results: results.map(r => ({
          success: r.success,
          error: r.error
        }))
      });
      
    } catch (error) {
      console.log(`   ❌ 批量测试异常: ${error.message}`);
      testResults.push({
        testName: '批量查询测试',
        success: false,
        error: { message: error.message }
      });
    }
    
    console.log('');
  }
  
  // 测试物流商识别功能
  totalTests++;
  console.log('📋 物流商自动识别测试');
  
  const recognitionTests = [
    { number: '123456789012', expected: LogisticsCarrier.SF_EXPRESS, desc: '12位数字' },
    { number: 'YT123456789012', expected: LogisticsCarrier.YTO, desc: 'YT开头' },
    { number: 'ZT123456789012', expected: LogisticsCarrier.ZTO, desc: 'ZT开头' },
    { number: 'ST123456789012', expected: LogisticsCarrier.STO, desc: 'ST开头' }
  ];
  
  let recognitionPassed = 0;
  for (const test of recognitionTests) {
    const result = logisticsService.detectCarrier(test.number);
    if (result.carrier === test.expected) {
      recognitionPassed++;
      console.log(`   ✅ ${test.desc}: ${test.number} -> ${test.expected}`);
    } else {
      console.log(`   ❌ ${test.desc}: ${test.number} -> 期望${test.expected}, 实际${result.carrier}`);
    }
  }
  
  if (recognitionPassed === recognitionTests.length) {
    console.log(`   ✅ 识别功能测试通过 (${recognitionPassed}/${recognitionTests.length})`);
    passedTests++;
  } else {
    console.log(`   ⚠️  识别功能部分通过 (${recognitionPassed}/${recognitionTests.length})`);
  }
  
  testResults.push({
    testName: '物流商识别测试',
    success: recognitionPassed === recognitionTests.length,
    passed: recognitionPassed,
    total: recognitionTests.length
  });
  
  console.log('\n📊 测试总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过数: ${passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2) + '%'
    },
    results: testResults,
    supportedCarriers: logisticsService.getSupportedCarriers()
  };
  
  // 保存测试报告
  const reportPath = path.join(__dirname, '..', 'logs', 'logistics-tracking-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存至: ${reportPath}`);
  
  // 输出支持的物流商
  console.log('\n🚛 支持的物流商:');
  logisticsService.getSupportedCarriers().forEach(carrier => {
    console.log(`   • ${carrier}`);
  });
  
  return report;
}

// 运行测试
if (require.main === module) {
  runTest().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { runTest };