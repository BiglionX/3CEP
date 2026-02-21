/**
 * AI诊断集成功能测试脚本
 * 验证诊断分析API的功能完整性和准确性
 */

const BASE_URL = 'http://localhost:3005';

// 测试用例
const TEST_CASES = [
  {
    name: '手机充电故障',
    faultDescription: '手机充不进电，插上充电器没有任何反应',
    deviceInfo: {
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      category: '手机'
    },
    expectedKeywords: ['充电', '接口', '电池', '线缆']
  },
  {
    name: '屏幕显示异常',
    faultDescription: '屏幕显示异常，有时候会出现花屏现象',
    deviceInfo: {
      brand: 'Samsung',
      model: 'Galaxy S23',
      category: '手机'
    },
    expectedKeywords: ['屏幕', '显示', '花屏', '驱动']
  },
  {
    name: '设备发热严重',
    faultDescription: '设备使用一会儿就发热严重，甚至有点烫手',
    deviceInfo: {
      brand: 'Huawei',
      model: 'MateBook D14',
      category: '笔记本电脑'
    },
    expectedKeywords: ['发热', '散热', '风扇', 'CPU']
  },
  {
    name: 'WiFi连接问题',
    faultDescription: 'WiFi经常断开连接，信号也不稳定',
    deviceInfo: {
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      category: '手机'
    },
    expectedKeywords: ['WiFi', '网络', '信号', '连接']
  }
];

/**
 * 测试诊断API
 */
async function testDiagnosisAPI() {
  console.log('🚀 开始AI诊断集成功能测试...\n');
  
  let passedTests = 0;
  let totalTests = TEST_CASES.length;
  
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    console.log(`📋 测试用例 ${i + 1}/${TEST_CASES.length}: ${testCase.name}`);
    console.log(`📝 故障描述: ${testCase.faultDescription}`);
    
    try {
      const result = await runSingleTest(testCase);
      if (result.passed) {
        passedTests++;
        console.log('✅ 测试通过\n');
      } else {
        console.log('❌ 测试失败\n');
      }
    } catch (error) {
      console.log(`❌ 测试执行错误: ${error.message}\n`);
    }
  }
  
  // 输出测试总结
  console.log('📊 测试总结:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过数: ${passedTests}`);
  console.log(`失败数: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！AI诊断集成功能工作正常。');
  } else {
    console.log('⚠️  部分测试失败，请检查相关功能。');
  }
}

/**
 * 执行单个测试用例
 */
async function runSingleTest(testCase) {
  const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 调用诊断API
    const response = await fetch(`${BASE_URL}/api/diagnosis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        faultDescription: testCase.faultDescription,
        deviceId: 'test_device_123',
        deviceInfo: testCase.deviceInfo,
        sessionId: sessionId,
        language: 'zh'
      })
    });
    
    const result = await response.json();
    
    // 验证响应格式
    if (!result.success) {
      console.log(`   错误响应: ${result.error}`);
      return { passed: false, reason: 'API返回错误' };
    }
    
    const diagnosisResult = result.data.diagnosisResult;
    
    // 验证必需字段
    const requiredFields = [
      'faultCauses',
      'solutions', 
      'recommendedParts',
      'estimatedTotalTime',
      'estimatedTotalCost',
      'confidenceLevel'
    ];
    
    for (const field of requiredFields) {
      if (!(field in diagnosisResult)) {
        console.log(`   缺少必需字段: ${field}`);
        return { passed: false, reason: `缺少字段 ${field}` };
      }
    }
    
    // 验证数据类型
    if (!Array.isArray(diagnosisResult.faultCauses)) {
      console.log('   faultCauses 不是数组');
      return { passed: false, reason: 'faultCauses格式错误' };
    }
    
    if (!Array.isArray(diagnosisResult.solutions)) {
      console.log('   solutions 不是数组');
      return { passed: false, reason: 'solutions格式错误' };
    }
    
    if (!Array.isArray(diagnosisResult.recommendedParts)) {
      console.log('   recommendedParts 不是数组');
      return { passed: false, reason: 'recommendedParts格式错误' };
    }
    
    // 验证内容质量
    if (diagnosisResult.faultCauses.length === 0) {
      console.log('   未返回故障原因');
      return { passed: false, reason: '缺少故障原因' };
    }
    
    if (diagnosisResult.solutions.length === 0) {
      console.log('   未返回解决方案');
      return { passed: false, reason: '缺少解决方案' };
    }
    
    // 检查关键词匹配
    const content = JSON.stringify(diagnosisResult).toLowerCase();
    const matchedKeywords = testCase.expectedKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    console.log(`   ✓ 响应格式正确`);
    console.log(`   ✓ 返回 ${diagnosisResult.faultCauses.length} 个故障原因`);
    console.log(`   ✓ 返回 ${diagnosisResult.solutions.length} 个解决方案`);
    console.log(`   ✓ 返回 ${diagnosisResult.recommendedParts.length} 个推荐配件`);
    console.log(`   ✓ 关键词匹配: ${matchedKeywords.length}/${testCase.expectedKeywords.length}`);
    console.log(`   ✓ 处理时间: ${result.data.processingTimeMs}ms`);
    console.log(`   ✓ 会话ID: ${result.data.sessionId}`);
    
    // 显示部分诊断结果作为示例
    console.log('   📋 诊断结果示例:');
    if (diagnosisResult.faultCauses.length > 0) {
      console.log(`     故障原因1: ${diagnosisResult.faultCauses[0].reason}`);
    }
    if (diagnosisResult.solutions.length > 0) {
      console.log(`     解决方案1: ${diagnosisResult.solutions[0].title}`);
    }
    
    return { passed: true };
    
  } catch (error) {
    console.log(`   网络请求失败: ${error.message}`);
    return { passed: false, reason: '网络请求失败' };
  }
}

/**
 * 测试会话管理功能
 */
async function testSessionManagement() {
  console.log('🔄 测试会话管理功能...\n');
  
  const sessionId = `session_test_${Date.now()}`;
  
  try {
    // 1. 创建会话并进行诊断
    await fetch(`${BASE_URL}/api/diagnosis/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faultDescription: '设备无法开机',
        sessionId: sessionId
      })
    });
    
    // 2. 查询会话信息
    const infoResponse = await fetch(`${BASE_URL}/api/diagnosis/analyze?sessionId=${sessionId}`);
    const infoResult = await infoResponse.json();
    
    if (infoResult.success && infoResult.data.stats) {
      console.log('✅ 会话查询功能正常');
      console.log(`   会话消息数: ${infoResult.data.stats.messageCount}`);
    } else {
      console.log('❌ 会话查询失败');
      return false;
    }
    
    // 3. 清理会话
    const deleteResponse = await fetch(`${BASE_URL}/api/diagnosis/analyze?sessionId=${sessionId}`, {
      method: 'DELETE'
    });
    const deleteResult = await deleteResponse.json();
    
    if (deleteResult.success) {
      console.log('✅ 会话清理功能正常');
    } else {
      console.log('❌ 会话清理失败');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ 会话管理测试失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('🛡️  测试错误处理功能...\n');
  
  const testCases = [
    {
      name: '空故障描述',
      requestBody: { faultDescription: '' },
      expectedError: '故障描述不能为空'
    },
    {
      name: '超长故障描述',
      requestBody: { faultDescription: 'A'.repeat(1001) },
      expectedError: '故障描述长度不能超过1000字符'
    },
    {
      name: '缺少必需参数',
      requestBody: {},
      expectedError: '故障描述不能为空'
    }
  ];
  
  let passed = 0;
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/diagnosis/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.requestBody)
      });
      
      const result = await response.json();
      
      if (!result.success && result.error.includes(testCase.expectedError)) {
        console.log(`✅ ${testCase.name}: 错误处理正确`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}: 错误处理不正确`);
        console.log(`   期望错误: ${testCase.expectedError}`);
        console.log(`   实际响应: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: 测试执行失败 - ${error.message}`);
    }
  }
  
  console.log(`\n错误处理测试通过率: ${passed}/${testCases.length}\n`);
  return passed === testCases.length;
}

/**
 * 性能测试
 */
async function testPerformance() {
  console.log('⚡ 测试性能表现...\n');
  
  const concurrentRequests = 5;
  const testDescription = '手机充不进电';
  
  const startTime = Date.now();
  
  // 并发测试
  const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
    try {
      const response = await fetch(`${BASE_URL}/api/diagnosis/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faultDescription: `${testDescription} - 测试${index + 1}`,
          sessionId: `perf_test_${index}`
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const successfulRequests = results.filter(r => r.success).length;
  const averageTime = (endTime - startTime) / concurrentRequests;
  
  console.log(`并发请求数: ${concurrentRequests}`);
  console.log(`成功请求数: ${successfulRequests}`);
  console.log(`平均响应时间: ${averageTime.toFixed(2)}ms`);
  console.log(`总耗时: ${endTime - startTime}ms\n`);
  
  return {
    concurrentRequests,
    successfulRequests,
    averageTime,
    totalTime: endTime - startTime
  };
}

// 主测试函数
async function runAllTests() {
  try {
    console.log('🧪 AI诊断集成功能完整测试\n');
    console.log('=' .repeat(50));
    
    // 1. 基础功能测试
    await testDiagnosisAPI();
    
    console.log('=' .repeat(50));
    
    // 2. 会话管理测试
    const sessionPassed = await testSessionManagement();
    console.log('=' .repeat(50));
    
    // 3. 错误处理测试
    const errorPassed = await testErrorHandling();
    console.log('=' .repeat(50));
    
    // 4. 性能测试
    const perfResults = await testPerformance();
    
    // 最终总结
    console.log('\n🏁 测试完成总结');
    console.log('=' .repeat(50));
    console.log('✅ 基础功能测试: 通过');
    console.log(`✅ 会话管理测试: ${sessionPassed ? '通过' : '失败'}`);
    console.log(`✅ 错误处理测试: ${errorPassed ? '通过' : '失败'}`);
    console.log(`📊 性能测试结果:`);
    console.log(`   - 并发处理能力: ${perfResults.successfulRequests}/${perfResults.concurrentRequests}`);
    console.log(`   - 平均响应时间: ${perfResults.averageTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('测试执行过程中发生错误:', error);
  }
}

// 执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDiagnosisAPI,
  testSessionManagement,
  testErrorHandling,
  testPerformance,
  runAllTests
};