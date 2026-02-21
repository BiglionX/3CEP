/**
 * 估值API集成测试
 * 验证API端点的功能和响应格式
 */

const BASE_URL = 'http://localhost:3001';

async function runApiTests() {
  console.log('🔌 开始估值API集成测试...\n');
  
  // 测试前置条件检查
  console.log('📋 测试前置条件检查...');
  
  const healthChecks = [
    {
      name: '应用服务状态',
      url: `${BASE_URL}/api/health`,
      check: async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: '设备档案API可用性',
      url: `${BASE_URL}/api/lifecycle/profile`,
      check: async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/lifecycle/profile`, { method: 'OPTIONS' });
          return response.ok;
        } catch {
          return false;
        }
      }
    }
  ];
  
  for (const check of healthChecks) {
    const passed = await check.check();
    console.log(`   ${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) {
      console.log(`      详情: 请确保服务在 ${BASE_URL} 正常运行`);
    }
  }
  
  // 准备测试数据
  console.log('\n🔧 准备测试数据...');
  const testDeviceQrcodeId = 'QR_TEST_VALUATION_001';
  
  // 测试用例1: GET查询估值
  console.log('\n📝 测试用例1: GET查询设备估值');
  try {
    const response = await fetch(
      `${BASE_URL}/api/valuation/estimate?deviceQrcodeId=${testDeviceQrcodeId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log('   ✅ GET估值查询成功');
      console.log(`   📱 设备型号: ${result.data.deviceInfo?.productModel || 'N/A'}`);
      console.log(`   💰 最终估值: ¥${result.data.finalValue}`);
      console.log(`   📊 基础价值: ¥${result.data.baseValue}`);
      console.log(`   🏷️  货币单位: ${result.data.currency}`);
    } else {
      console.log('   ⚠️  GET查询返回错误:', result.error);
      console.log('      说明: 设备档案可能不存在，这是预期的行为');
    }
    
  } catch (error) {
    console.log('   ❌ GET测试失败:', error.message);
  }
  
  // 测试用例2: POST详细估值
  console.log('\n📝 测试用例2: POST详细估值请求');
  try {
    const requestBody = {
      deviceQrcodeId: testDeviceQrcodeId,
      condition: {
        screen: 'minor_scratches',
        battery: 'good',
        body: 'light_wear',
        functionality: 'perfect'
      },
      marketPrice: 5000
    };
    
    const response = await fetch(
      `${BASE_URL}/api/valuation/estimate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log('   ✅ POST估值计算成功');
      console.log(`   📱 设备: ${result.data.deviceInfo?.productModel || 'N/A'}`);
      console.log(`   💰 最终估值: ¥${result.data.finalValue}`);
      console.log(`   📊 详细分解:`);
      console.log(`      - 原始价格: ¥${result.data.breakdown?.originalPrice || 'N/A'}`);
      console.log(`      - 折旧金额: ¥${result.data.breakdown?.depreciation?.toFixed(2) || 'N/A'}`);
      console.log(`      - 部件评分: ${(result.data.breakdown?.componentAdjustment * 100 || 0).toFixed(1)}%`);
      console.log(`      - 成色乘数: ${(result.data.breakdown?.conditionAdjustment * 100 || 0).toFixed(1)}%`);
    } else {
      console.log('   ⚠️  POST计算返回错误:', result.error);
    }
    
  } catch (error) {
    console.log('   ❌ POST测试失败:', error.message);
  }
  
  // 测试用例3: 错误处理测试
  console.log('\n📝 测试用例3: 错误处理测试');
  
  // 测试缺少必要参数
  try {
    const response = await fetch(
      `${BASE_URL}/api/valuation/estimate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // 空请求体
      }
    );
    
    const result = await response.json();
    
    if (response.status === 400 && result.error?.includes('deviceQrcodeId')) {
      console.log('   ✅ 参数验证正确（缺少必要参数）');
    } else {
      console.log('   ❌ 参数验证失败');
    }
    
  } catch (error) {
    console.log('   ❌ 错误处理测试失败:', error.message);
  }
  
  // 测试无效的设备ID
  try {
    const response = await fetch(
      `${BASE_URL}/api/valuation/estimate?deviceQrcodeId=NON_EXISTENT_DEVICE`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`
        }
      }
    );
    
    const result = await response.json();
    
    if (response.status === 404 && result.error?.includes('未找到')) {
      console.log('   ✅ 不存在设备处理正确');
    } else {
      console.log('   ❌ 不存在设备处理异常');
    }
    
  } catch (error) {
    console.log('   ❌ 不存在设备测试失败:', error.message);
  }
  
  // 测试用例4: 响应格式验证
  console.log('\n📝 测试用例4: 响应格式验证');
  try {
    const response = await fetch(
      `${BASE_URL}/api/valuation/estimate?deviceQrcodeId=${testDeviceQrcodeId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`
        }
      }
    );
    
    const result = await response.json();
    
    // 验证响应结构
    const requiredFields = ['success', 'data'];
    const dataFields = ['deviceQrcodeId', 'finalValue', 'currency', 'estimatedAt'];
    
    let formatValid = true;
    
    for (const field of requiredFields) {
      if (!(field in result)) {
        console.log(`   ❌ 缺少必需字段: ${field}`);
        formatValid = false;
      }
    }
    
    if (result.success && result.data) {
      for (const field of dataFields) {
        if (!(field in result.data)) {
          console.log(`   ❌ 缺少数据字段: ${field}`);
          formatValid = false;
        }
      }
    }
    
    if (formatValid) {
      console.log('   ✅ 响应格式正确');
      console.log('   📋 包含所有必需字段');
    } else {
      console.log('   ❌ 响应格式不完整');
    }
    
  } catch (error) {
    console.log('   ❌ 响应格式测试失败:', error.message);
  }
  
  // 性能测试
  console.log('\n⚡ 测试用例5: 性能测试');
  try {
    const startTime = Date.now();
    
    // 发送5个并发请求
    const requests = Array(5).fill().map((_, i) => 
      fetch(`${BASE_URL}/api/valuation/estimate?deviceQrcodeId=${testDeviceQrcodeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VALUATION_API_KEY || process.env.LIFECYCLE_API_KEY || 'dev-key'}`
        }
      })
    );
    
    await Promise.all(requests);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgResponseTime = duration / 5;
    
    console.log(`   📊 5个并发请求总耗时: ${duration}ms`);
    console.log(`   ⏱️  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    
    if (avgResponseTime < 1000) {
      console.log('   ✅ 性能表现良好（平均响应时间<1秒）');
    } else {
      console.log('   ⚠️  性能有待优化');
    }
    
  } catch (error) {
    console.log('   ❌ 性能测试失败:', error.message);
  }
  
  console.log('\n🎉 估值API集成测试完成！');
}

// 运行测试
if (typeof window === 'undefined') {
  runApiTests().catch(console.error);
}

module.exports = { runApiTests };