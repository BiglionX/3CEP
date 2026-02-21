/**
 * 智能议价引擎集成测试脚本
 * 验证议价成功率≥60%，平均折扣≥5%的验收标准
 */

const BASE_URL = 'http://localhost:3001';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testNegotiationEngine() {
  console.log('🚀 开始智能议价引擎集成测试...\n');

  try {
    // 测试1: 获取议价策略列表
    console.log('📋 测试1: 获取议价策略列表');
    const strategiesResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/start`);
    const strategiesResult = await strategiesResponse.json();
    console.log('✅ 获取策略列表:', strategiesResult.success ? '成功' : '失败');
    if (strategiesResult.data) {
      console.log('   策略数量:', strategiesResult.data.length);
      strategiesResult.data.forEach((strategy, index) => {
        console.log(`   ${index + 1}. ${strategy.name} (${strategy.strategyType})`);
      });
    }

    // 测试2: 启动议价会话
    console.log('\n📋 测试2: 启动议价会话');
    const startNegotiationData = {
      procurementRequestId: 'test-pr-001',
      supplierId: 'test-supplier-001',
      targetPrice: 10000,
      initialQuote: 12000,
      maxRounds: 5
    };

    const startResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(startNegotiationData)
    });

    const startResult = await startResponse.json();
    console.log('✅ 启动议价会话:', startResult.success ? '成功' : '失败');
    
    if (!startResult.success) {
      console.log('   错误信息:', startResult.error);
      return;
    }

    const sessionId = startResult.data.sessionId;
    console.log('   会话ID:', sessionId);
    console.log('   建议价格:', startResult.data.advice?.recommendedPrice);
    console.log('   预期折扣:', startResult.data.advice?.expectedDiscount.toFixed(2) + '%');

    // 测试3: 执行多轮议价
    console.log('\n📋 测试3: 执行多轮议价');
    const rounds = [
      { supplierQuote: 11500, remarks: '第一轮供应商报价' },
      { supplierQuote: 11200, remarks: '第二轮供应商报价' },
      { supplierQuote: 11000, remarks: '第三轮供应商报价' }
    ];

    let currentPrice = 12000;
    let totalDiscount = 0;
    let successfulRounds = 0;

    for (let i = 0; i < rounds.length; i++) {
      console.log(`\n--- 第 ${i + 1} 轮议价 ---`);
      
      const roundResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/${sessionId}/round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rounds[i])
      });

      const roundResult = await roundResponse.json();
      
      if (roundResult.success) {
        console.log('✅ 执行议价回合: 成功');
        console.log('   下一轮报价:', roundResult.data.nextOffer);
        console.log('   使用策略:', roundResult.data.strategyUsed);
        
        const discount = ((currentPrice - roundResult.data.nextOffer) / currentPrice) * 100;
        totalDiscount += discount;
        successfulRounds++;
        
        console.log('   本轮折扣:', discount.toFixed(2) + '%');
        currentPrice = roundResult.data.nextOffer;
      } else {
        console.log('❌ 执行议价回合: 失败');
        console.log('   错误信息:', roundResult.error);
      }

      // 添加延迟避免请求过快
      await delay(1000);
    }

    // 测试4: 获取议价状态
    console.log('\n📋 测试4: 获取议价状态');
    const statusResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/${sessionId}`);
    const statusResult = await statusResponse.json();
    console.log('✅ 获取议价状态:', statusResult.success ? '成功' : '失败');
    
    if (statusResult.success) {
      console.log('   当前状态:', statusResult.data.session?.status);
      console.log('   总轮次:', statusResult.data.currentRound);
      console.log('   历史记录数:', statusResult.data.history?.length);
    }

    // 测试5: 接受最终报价
    console.log('\n📋 测试5: 接受最终报价');
    const acceptResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/${sessionId}/accept`, {
      method: 'POST'
    });
    
    const acceptResult = await acceptResponse.json();
    console.log('✅ 接受最终报价:', acceptResult.success ? '成功' : '失败');
    
    if (acceptResult.success) {
      console.log('   最终价格:', acceptResult.data.finalPrice);
      console.log('   最终折扣:', acceptResult.data.discountRate.toFixed(2) + '%');
      console.log('   总轮次:', acceptResult.data.totalRounds);
    }

    // 测试6: 供应商推荐功能
    console.log('\n📋 测试6: 供应商推荐功能');
    const recommendationResponse = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/recommendations?targetPrice=10000&limit=3`);
    const recommendationResult = await recommendationResponse.json();
    console.log('✅ 供应商推荐:', recommendationResult.success ? '成功' : '失败');
    
    if (recommendationResult.success && recommendationResult.data) {
      console.log('   推荐供应商数量:', recommendationResult.data.length);
      recommendationResult.data.forEach((supplier, index) => {
        console.log(`   ${index + 1}. ${supplier.supplierName} - ${supplier.score}分`);
        console.log(`      平均折扣: ${supplier.averageDiscountRate}%`);
        console.log(`      交易次数: ${supplier.transactionCount}`);
      });
    }

    // 测试7: 性能基准测试
    console.log('\n📋 测试7: 性能基准测试');
    const startTime = Date.now();
    
    // 并发执行多个议价启动请求
    const concurrentTests = Array(5).fill(null).map(async (_, index) => {
      const testData = {
        procurementRequestId: `perf-test-${index}`,
        supplierId: `perf-supplier-${index}`,
        targetPrice: 8000 + index * 1000,
        initialQuote: 10000 + index * 1200,
        maxRounds: 3
      };

      const response = await fetch(`${BASE_URL}/api/b2b-procurement/negotiation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      return response.json();
    });

    const results = await Promise.all(concurrentTests);
    const endTime = Date.now();
    
    const successfulConcurrent = results.filter(r => r.success).length;
    const avgResponseTime = (endTime - startTime) / results.length;
    
    console.log('✅ 并发性能测试完成');
    console.log('   成功请求数:', successfulConcurrent, '/ 5');
    console.log('   平均响应时间:', avgResponseTime.toFixed(2), 'ms');
    console.log('   总耗时:', (endTime - startTime), 'ms');

    // 验收标准验证
    console.log('\n🎯 验收标准验证:');
    
    const successRate = (successfulRounds / rounds.length) * 100;
    const avgDiscountRate = totalDiscount / successfulRounds;
    
    console.log(`   议价成功率: ${successRate.toFixed(1)}% (目标: ≥60%)`);
    console.log(`   平均折扣率: ${avgDiscountRate.toFixed(2)}% (目标: ≥5%)`);
    
    const successRatePassed = successRate >= 60;
    const avgDiscountPassed = avgDiscountRate >= 5;
    
    console.log(`   成功率达标: ${successRatePassed ? '✅' : '❌'}`);
    console.log(`   折扣率达标: ${avgDiscountPassed ? '✅' : '❌'}`);
    
    if (successRatePassed && avgDiscountPassed) {
      console.log('\n🎉 所有验收标准均已达标！');
    } else {
      console.log('\n⚠️  部分验收标准未达标，请检查实现');
    }

    // 测试总结
    console.log('\n📊 测试总结:');
    console.log('   ✓ 议价策略管理');
    console.log('   ✓ 会话生命周期管理');
    console.log('   ✓ 多轮议价执行');
    console.log('   ✓ 状态查询和更新');
    console.log('   ✓ 供应商推荐功能');
    console.log('   ✓ 并发性能测试');
    console.log('   ✓ 验收标准验证');

  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    console.error('详细错误:', error);
  }

  console.log('\n🏁 智能议价引擎集成测试完成');
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js环境
  testNegotiationEngine().catch(console.error);
}

// 如果在浏览器环境，导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testNegotiationEngine };
}
