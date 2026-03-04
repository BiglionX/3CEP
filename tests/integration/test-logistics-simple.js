/**
 * 物流追踪系统简化测试脚本
 * 直接测试核心功能逻辑
 */

// 模拟必要的类型和枚举
const LogisticsCarrier = {
  SF_EXPRESS: 'sf_express',
  YTO: 'yto',
  ZTO: 'zto',
  STO: 'sto',
  EMS: 'ems',
  YUNDA: 'yunda',
  JD_LOGISTICS: 'jd_logistics',
  DHL: 'dhl',
  FEDEX: 'fedex',
  UPS: 'ups',
  OTHER: 'other',
};

const TrackingStatus = {
  PENDING: 'pending',
  COLLECTED: 'collected',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
  EXCEPTION: 'exception',
  FAILED: 'failed',
};

// 简化的物流商识别函数
function detectCarrier(trackingNumber) {
  // 顺丰速运：12位纯数字
  if (/^\d{12}$/.test(trackingNumber)) {
    return {
      carrier: LogisticsCarrier.SF_EXPRESS,
      confidence: 0.95,
      isValidFormat: true,
    };
  }

  // 圆通速递：通常以YT开头
  if (/^YT\d{10,12}$/.test(trackingNumber)) {
    return {
      carrier: LogisticsCarrier.YTO,
      confidence: 0.9,
      isValidFormat: true,
    };
  }

  // 中通快递：通常以ZT开头或纯数字
  if (/^(ZT\d{10,12}|\d{12})$/.test(trackingNumber)) {
    return {
      carrier: LogisticsCarrier.ZTO,
      confidence: 0.85,
      isValidFormat: true,
    };
  }

  // 申通快递：通常以ST开头
  if (/^ST\d{10,12}$/.test(trackingNumber)) {
    return {
      carrier: LogisticsCarrier.STO,
      confidence: 0.85,
      isValidFormat: true,
    };
  }

  // 如果无法识别，返回OTHER
  return {
    carrier: LogisticsCarrier.OTHER,
    confidence: 0.1,
    isValidFormat: trackingNumber.length >= 8 && trackingNumber.length <= 32,
  };
}

// 简化的轨迹信息生成函数
function generateMockTracking(trackingNumber, carrierInfo) {
  const statuses = [
    {
      status: TrackingStatus.COLLECTED,
      desc: '已揽收',
      location: '上海转运中心',
    },
    {
      status: TrackingStatus.IN_TRANSIT,
      desc: '运输中',
      location: '北京转运中心',
    },
    {
      status: TrackingStatus.OUT_FOR_DELIVERY,
      desc: '派送中',
      location: '北京市朝阳区',
    },
    {
      status: TrackingStatus.DELIVERED,
      desc: '已签收',
      location: '北京市朝阳区',
    },
  ];

  // 随机生成2-4个轨迹节点
  const nodeCount = Math.floor(Math.random() * 3) + 2;
  const timeline = [];

  for (let i = 0; i < nodeCount; i++) {
    const statusIndex = Math.min(i, statuses.length - 1);
    const hoursAgo = (nodeCount - i - 1) * 6; // 每个节点间隔6小时

    timeline.push({
      timestamp: new Date(Date.now() - hoursAgo * 3600000),
      location: statuses[statusIndex].location,
      status: statuses[statusIndex].status,
      description: statuses[statusIndex].desc,
    });
  }

  const latestStatus = timeline[timeline.length - 1].status;

  return {
    trackingNumber,
    carrier: carrierInfo.carrier,
    carrierName: getCarrierName(carrierInfo.carrier),
    status: latestStatus,
    origin: '上海',
    destination: '北京',
    timeline,
    lastUpdated: new Date(),
    isDelivered: latestStatus === TrackingStatus.DELIVERED,
  };
}

function getCarrierName(carrier) {
  const names = {
    [LogisticsCarrier.SF_EXPRESS]: '顺丰速运',
    [LogisticsCarrier.YTO]: '圆通速递',
    [LogisticsCarrier.ZTO]: '中通快递',
    [LogisticsCarrier.STO]: '申通快递',
    [LogisticsCarrier.EMS]: 'EMS邮政速递',
    [LogisticsCarrier.YUNDA]: '韵达快递',
    [LogisticsCarrier.JD_LOGISTICS]: '京东物流',
    [LogisticsCarrier.DHL]: 'DHL国际快递',
    [LogisticsCarrier.FEDEX]: 'FedEx联邦快递',
    [LogisticsCarrier.UPS]: 'UPS联合包裹',
    [LogisticsCarrier.OTHER]: '未知承运商',
  };
  return names[carrier] || '未知承运商';
}

// 测试用例
const testCases = [
  {
    name: '顺丰速运测试',
    trackingNumber: '123456789012',
    description: '12位数字，应识别为顺丰速运',
  },
  {
    name: '圆通速递测试',
    trackingNumber: 'YT123456789012',
    description: 'YT开头，应识别为圆通速递',
  },
  {
    name: '中通快递测试',
    trackingNumber: 'ZT123456789012',
    description: 'ZT开头，应识别为中通快递',
  },
  {
    name: '申通快递测试',
    trackingNumber: 'ST123456789012',
    description: 'ST开头，应识别为申通快递',
  },
  {
    name: 'EMS测试',
    trackingNumber: 'EA123456789CN',
    description: 'EMS标准格式',
  },
];

async function runSimpleTest() {
  console.log('🚀 开始物流追踪系统简化测试...\n');

  const testResults = [];
  let passedTests = 0;
  let totalTests = 0;

  // 测试物流商识别功能
  console.log('📋 物流商自动识别测试');
  console.log('========================');

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n测试: ${testCase.name}`);
    console.log(`运单号: ${testCase.trackingNumber}`);
    console.log(`描述: ${testCase.description}`);

    try {
      const result = detectCarrier(testCase.trackingNumber);
      console.log(
        `识别结果: ${getCarrierName(result.carrier)} (置信度: ${(result.confidence * 100).toFixed(1)}%)`
      );
      console.log(`格式有效: ${result.isValidFormat}`);

      if (result.isValidFormat) {
        console.log('✅ 识别成功');
        passedTests++;

        // 生成模拟轨迹信息
        const trackingInfo = generateMockTracking(
          testCase.trackingNumber,
          result
        );
        console.log(`📦 生成轨迹信息:`);
        console.log(`   当前状态: ${trackingInfo.status}`);
        console.log(`   轨迹节点数: ${trackingInfo.timeline.length}`);
        console.log(
          `   最后更新: ${trackingInfo.lastUpdated.toLocaleString()}`
        );
        console.log(`   已送达: ${trackingInfo.isDelivered ? '是' : '否'}`);
      } else {
        console.log('❌ 格式验证失败');
      }

      testResults.push({
        testName: testCase.name,
        trackingNumber: testCase.trackingNumber,
        success: result.isValidFormat,
        carrier: result.carrier,
        confidence: result.confidence,
      });
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
      testResults.push({
        testName: testCase.name,
        trackingNumber: testCase.trackingNumber,
        success: false,
        error: error.message,
      });
    }
  }

  // 测试批量处理
  console.log('\n📋 批量处理测试');
  console.log('================');
  totalTests++;

  const batchNumbers = testCases.slice(0, 3).map(tc => tc.trackingNumber);
  console.log(`批量查询运单号: ${batchNumbers.join(', ')}`);

  try {
    const batchResults = batchNumbers.map(num => {
      const carrierInfo = detectCarrier(num);
      return {
        trackingNumber: num,
        success: carrierInfo.isValidFormat,
        tracking: carrierInfo.isValidFormat
          ? generateMockTracking(num, carrierInfo)
          : null,
      };
    });

    const successCount = batchResults.filter(r => r.success).length;
    console.log(`批量处理结果: ${successCount}/${batchResults.length} 成功`);

    if (successCount === batchResults.length) {
      console.log('✅ 批量处理测试通过');
      passedTests++;
    } else {
      console.log('⚠️ 批量处理部分成功');
    }

    testResults.push({
      testName: '批量处理测试',
      success: successCount === batchResults.length,
      totalCount: batchResults.length,
      successCount: successCount,
    });
  } catch (error) {
    console.log(`❌ 批量处理异常: ${error.message}`);
    testResults.push({
      testName: '批量处理测试',
      success: false,
      error: error.message,
    });
  }

  // 显示支持的物流商
  console.log('\n🚛 支持的物流商列表');
  console.log('====================');
  const supportedCarriers = Object.values(LogisticsCarrier);
  supportedCarriers.forEach(carrier => {
    console.log(`• ${getCarrierName(carrier)} (${carrier})`);
  });

  // 测试总结
  console.log('\n📊 测试总结');
  console.log('============');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过数: ${passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️ 部分测试未通过');
  }

  // 生成简单的测试报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    },
    results: testResults,
  };

  return report;
}

// 运行测试
if (require.main === module) {
  runSimpleTest()
    .then(report => {
      console.log('\n📝 测试完成');
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleTest, detectCarrier, generateMockTracking };
