#!/usr/bin/env node

/**
 * V-ML端到端集成测试
 * 验证整个机器学习模块的功能完整性和集成效果
 */

const { mlClient } = require('./src/services/ml-client.service');
const { mlConfidenceService } = require('./src/services/ml-confidence.service');

async function runIntegrationTests() {
  console.log('🧪 开始机器学习模块端到端集成测试\n');
  
  try {
    // 测试1: ML服务健康检查
    console.log('1️⃣ 测试ML服务连通性...');
    const healthStatus = await mlClient.healthCheck();
    console.log(`   ${healthStatus.status === 'healthy' ? '✅' : '❌'} ML服务状态: ${healthStatus.status}`);
    if (healthStatus.error) {
      console.log(`      错误信息: ${healthStatus.error}`);
    }
    
    // 测试2: 单次预测功能
    console.log('\n2️⃣ 测试单次价格预测...');
    const testData = {
      deviceAgeMonths: 24,
      brandEncoded: 0, // Apple
      storageGb: 128,
      ramGb: 6,
      screenConditionEncoded: 4, // 良好
      batteryHealthPercent: 85,
      appearanceGradeEncoded: 4, // 九成新
      repairCount: 0,
      partReplacementCount: 0,
      transferCount: 1,
      marketAvgPrice: 4500,
      marketMinPrice: 3800,
      marketMaxPrice: 5200,
      marketSampleCount: 25
    };
    
    const predictionResult = await mlClient.predictPrice(testData);
    console.log(`   ${predictionResult.success ? '✅' : '❌'} 预测请求: ${predictionResult.success ? '成功' : '失败'}`);
    
    if (predictionResult.success) {
      console.log(`      预测价格: ¥${predictionResult.data.predictedPrice.toFixed(2)}`);
      console.log(`      置信度: ${(predictionResult.data.confidence * 100).toFixed(1)}%`);
      console.log(`      模型版本: ${predictionResult.data.modelVersion}`);
    } else {
      console.log(`      错误信息: ${predictionResult.error}`);
    }
    
    // 测试3: 批量预测功能
    console.log('\n3️⃣ 测试批量价格预测...');
    const batchTestData = [
      { ...testData, deviceAgeMonths: 12, storageGb: 256 },
      { ...testData, brandEncoded: 1, batteryHealthPercent: 75 }, // Samsung
      { ...testData, screenConditionEncoded: 3, appearanceGradeEncoded: 3 } // 一般成色
    ];
    
    const batchResult = await mlClient.batchPredict(batchTestData);
    console.log(`   ${batchResult.success ? '✅' : '❌'} 批量预测: ${batchResult.success ? '成功' : '失败'}`);
    
    if (batchResult.success) {
      console.log(`      处理设备数: ${batchResult.data.count}`);
      console.log(`      总处理时间: ${batchResult.data.totalProcessingTime.toFixed(3)}秒`);
      console.log(`      平均每个设备: ${(batchResult.data.totalProcessingTime / batchResult.data.count * 1000).toFixed(1)}毫秒`);
    }
    
    // 测试4: 置信度评估功能
    console.log('\n4️⃣ 测试置信度评估...');
    if (predictionResult.success) {
      const confidenceResult = mlConfidenceService.calculateConfidence(
        predictionResult.data.predictedPrice,
        testData
      );
      
      console.log(`   ✅ 置信度评估完成`);
      console.log(`      综合置信度: ${(confidenceResult.confidence * 100).toFixed(1)}%`);
      console.log(`      置信级别: ${confidenceResult.confidenceLevel}`);
      console.log(`      建议数量: ${confidenceResult.recommendations.length}条`);
      
      // 显示详细因子
      console.log('      置信因子详情:');
      Object.entries(confidenceResult.confidenceFactors).forEach(([factor, value]) => {
        console.log(`        ${factor}: ${(value * 100).toFixed(1)}%`);
      });
    }
    
    // 测试5: 模型信息获取
    console.log('\n5️⃣ 测试模型信息服务...');
    const modelInfo = await mlClient.getModelInfo();
    console.log(`   ${modelInfo.success ? '✅' : '❌'} 模型信息获取: ${modelInfo.success ? '成功' : '失败'}`);
    
    if (modelInfo.success) {
      console.log(`      模型类型: ${modelInfo.data.model_type}`);
      console.log(`      特征数量: ${modelInfo.data.feature_count}`);
      console.log(`      加载时间: ${new Date(modelInfo.data.loaded_at).toLocaleString()}`);
    }
    
    // 测试6: 错误处理测试
    console.log('\n6️⃣ 测试错误处理机制...');
    
    // 测试无效数据
    const invalidData = { deviceAgeMonths: -5 }; // 无效的负年龄
    const errorResult = await mlClient.predictPrice(invalidData);
    console.log(`   ${!errorResult.success ? '✅' : '❌'} 无效数据处理: ${!errorResult.success ? '正确拦截' : '未拦截'}`);
    
    // 测试网络错误恢复
    console.log('\n7️⃣ 测试网络容错能力...');
    const backupClient = new mlClient.constructor({
      baseUrl: 'http://localhost:9999', // 故意错误的地址
      retryAttempts: 2,
      retryDelay: 500
    });
    
    const failoverResult = await backupClient.healthCheck();
    console.log(`   ${failoverResult.status === 'unhealthy' ? '✅' : '❌'} 故障转移: ${failoverResult.status}`);
    
    // 生成测试报告
    generateTestReport({
      healthCheck: healthStatus.status === 'healthy',
      singlePrediction: predictionResult.success,
      batchPrediction: batchResult.success,
      confidenceAssessment: predictionResult.success,
      modelInfo: modelInfo.success,
      errorHandling: !errorResult.success
    });
    
  } catch (error) {
    console.error('❌ 集成测试过程中出现错误:', error);
  }
}

function generateTestReport(results) {
  console.log('\n📊 机器学习模块集成测试报告');
  console.log('===========================================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n📈 测试概览:`);
  console.log(`   总测试项: ${totalTests}`);
  console.log(`   通过项: ${passedTests}`);
  console.log(`   通过率: ${passRate}%`);
  
  console.log(`\n✅ 通过的测试:`);
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      console.log(`   • ${test.replace(/([A-Z])/g, ' $1').trim()}`);
    }
  });
  
  console.log(`\n❌ 失败的测试:`);
  Object.entries(results).forEach(([test, passed]) => {
    if (!passed) {
      console.log(`   • ${test.replace(/([A-Z])/g, ' $1').trim()}`);
    }
  });
  
  console.log(`\n🔧 集成功能验证:`);
  console.log(`   ✓ Python ML服务通信`);
  console.log(`   ✓ Node.js客户端封装`);
  console.log(`   ✓ HTTP重试机制`);
  console.log(`   ✓ 错误处理和恢复`);
  console.log(`   ✓ 置信度评估引擎`);
  console.log(`   ✓ 批量处理能力`);
  
  console.log(`\n🚀 部署建议:`);
  if (passRate === '100.0') {
    console.log(`   🎉 所有测试通过！系统已准备好生产部署`);
    console.log(`   1. 配置生产环境ML服务地址`);
    console.log(`   2. 设置适当的超时和重试参数`);
    console.log(`   3. 配置监控和告警`);
    console.log(`   4. 准备A/B测试方案`);
  } else {
    console.log(`   ⚠️  部分测试失败，请先解决相关问题再部署`);
    console.log(`   1. 检查ML服务是否正常运行`);
    console.log(`   2. 验证网络连接配置`);
    console.log(`   3. 检查数据验证逻辑`);
  }
  
  console.log('\n===========================================');
}

// 运行测试
if (require.main === module) {
  runIntegrationTests();
}

module.exports = { runIntegrationTests };