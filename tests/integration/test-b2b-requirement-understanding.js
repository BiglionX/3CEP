#!/usr/bin/env node

/**
 * B2B采购需求理解引擎测试脚本
 * 验证多模态输入处理和解析准确性
 */

async function runRequirementUnderstandingTest() {
  console.log('🧪 开始B2B采购需求理解引擎测试...\n');
  
  const testCases = [
    {
      name: "文本输入 - 简单电脑采购",
      input: "我们需要采购10台联想ThinkPad笔记本电脑，预算3万元，要求正品，尽快交付",
      inputType: "text",
      companyId: "test-company-text-001",
      requesterId: "test-user-text-001"
    },
    {
      name: "文本输入 - 复杂服务器采购",
      input: "公司需要采购2台戴尔PowerEdge服务器，配置要求：Intel Xeon处理器，64GB内存，2TB SSD存储，预算15万元，要求原厂质保，交付期限本月月底",
      inputType: "text",
      companyId: "test-company-text-002",
      requesterId: "test-user-text-002"
    },
    {
      name: "图片输入模拟 - OCR内容",
      input: "https://example.com/procurement-image.jpg",
      inputType: "image",
      companyId: "test-company-image-001",
      requesterId: "test-user-image-001"
    },
    {
      name: "链接输入模拟 - 网页内容",
      input: "https://example.com/procurement-requirements.html",
      inputType: "link",
      companyId: "test-company-link-001",
      requesterId: "test-user-link-001"
    },
    {
      name: "紧急采购需求",
      input: "紧急需要一批办公用品：A4打印纸10箱，黑色签字笔50支，订书机20个，预算5000元，明天必须到货",
      inputType: "text",
      companyId: "test-company-urgent-001",
      requesterId: "test-user-urgent-001"
    },
    {
      name: "网络设备采购",
      input: "采购5台华为交换机和3台思科路由器，用于新办公室网络建设，总预算8万元，要求有3年质保",
      inputType: "text",
      companyId: "test-company-network-001",
      requesterId: "test-user-network-001"
    },
    {
      name: "多物品混合采购",
      input: "采购清单：\n1. 苹果MacBook Pro 16英寸 5台\n2. 三星曲面显示器 27寸 10台\n3. 罗技机械键盘 15个\n4. 雷蛇游戏鼠标 20个\n预算：12万元\n交付时间：下周一前",
      inputType: "text",
      companyId: "test-company-mixed-001",
      requesterId: "test-user-mixed-001"
    },
    {
      name: "带特殊要求的采购",
      input: "需要采购一批高品质办公椅，要求：\n- 人体工学设计\n- 真皮材质\n- 可调节高度\n- 颜色：黑色\n数量：25把\n预算：每把不超过2000元\n要求本周内到货",
      inputType: "text",
      companyId: "test-company-special-001",
      requesterId: "test-user-special-001"
    },
    {
      name: "国际采购需求",
      input: "从美国采购Cisco路由器设备：\n- Cisco ISR 4000系列路由器 3台\n- 预算：USD 15,000\n- 要求：全新原厂包装\n- 交付：洛杉矶港口提货\n- 时间：45天内完成",
      inputType: "text",
      companyId: "test-company-international-001",
      requesterId: "test-user-international-001"
    },
    {
      name: "制造业原材料采购",
      input: "钢铁原材料采购需求：\n冷轧钢板 20mm厚度 50吨\n热轧圆钢 φ50mm 30吨\n不锈钢板材 304材质 15吨\n预算总计：25万元\n要求：国标质量认证\n交付期：30天内分批交付",
      inputType: "text",
      companyId: "test-company-manufacturing-001",
      requesterId: "test-user-manufacturing-001"
    }
  ];

  try {
    let passedTests = 0;
    let totalTests = testCases.length;
    let totalProcessingTime = 0;
    let totalConfidence = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`${i + 1}️⃣ 测试用例: ${testCase.name}`);
      console.log(`   输入类型: ${testCase.inputType}`);
      console.log(`   输入内容: ${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}\n`);
      
      const result = await testRequirementUnderstanding(testCase);
      
      if (result.success) {
        passedTests++;
        totalProcessingTime += result.processingTimeMs;
        totalConfidence += result.aiConfidence;
        
        console.log(`   ✅ 解析成功`);
        console.log(`   📦 识别物品: ${result.itemsCount} 个`);
        console.log(`   💯 置信度: ${result.aiConfidence}%`);
        console.log(`   ⏱️  处理时间: ${result.processingTimeMs}ms`);
        console.log(`   ⚡ 紧急程度: ${result.urgency}`);
        console.log(`   💰 预算范围: ${result.budgetRange ? `${result.budgetRange.min}-${result.budgetRange.max} ${result.budgetRange.currency}` : '未指定'}`);
        console.log(`   📍 交付信息: ${result.deliveryInfo || '未指定'}`);
        
        if (result.modelUsed) {
          console.log(`   🤖 使用模型: ${result.modelUsed}`);
        }
        if (result.confidenceLevel) {
          console.log(`   🏆 质量评级: ${result.confidenceLevel}`);
        }
      } else {
        console.log(`   ❌ 解析失败: ${result.error}`);
      }
      
      console.log('   ' + '='.repeat(60) + '\n');
    }
    
    // 输出测试总结
    const accuracyRate = (passedTests / totalTests) * 100;
    const avgProcessingTime = totalProcessingTime / passedTests;
    const avgConfidence = totalConfidence / passedTests;
    
    console.log('📋 B2B采购需求理解引擎测试总结报告:');
    console.log('===========================================');
    console.log(`✅ 成功率: ${passedTests}/${totalTests} (${accuracyRate.toFixed(1)}%)`);
    console.log(`⏱️  平均处理时间: ${avgProcessingTime.toFixed(0)}ms`);
    console.log(`💯 平均置信度: ${avgConfidence.toFixed(1)}%`);
    console.log('===========================================');
    
    // 验收标准检查
    console.log('\n🎯 验收标准检查:');
    console.log(`   准确率 ≥85%: ${accuracyRate >= 85 ? '✅ 通过' : '❌ 未达到'}`);
    console.log(`   响应时间 ≤2s: ${avgProcessingTime <= 2000 ? '✅ 通过' : '❌ 未达到'}`);
    console.log(`   测试用例 ≥10: ${totalTests >= 10 ? '✅ 通过' : '❌ 未达到'}`);
    
    if (accuracyRate >= 85 && avgProcessingTime <= 2000 && totalTests >= 10) {
      console.log('\n🎉 B2B采购需求理解引擎验收通过！');
    } else {
      console.log('\n⚠️  B2B采购需求理解引擎需要进一步优化');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

async function testRequirementUnderstanding(testCase) {
  try {
    const response = await fetch('http://localhost:3001/api/b2b-procurement/parse-requirement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: testCase.input,
        inputType: testCase.inputType,
        companyId: testCase.companyId,
        requesterId: testCase.requesterId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const parsedRequest = result.data.parsedRequest;
      const processingInfo = result.data.processingInfo;
      
      return {
        success: true,
        itemsCount: parsedRequest.items.length,
        aiConfidence: parsedRequest.aiConfidence,
        processingTimeMs: processingInfo.processingTimeMs,
        urgency: parsedRequest.urgency,
        budgetRange: parsedRequest.budgetRange,
        deliveryInfo: parsedRequest.deliveryLocation ? parsedRequest.deliveryLocation.address : 
                     (parsedRequest.deliveryDeadline ? parsedRequest.deliveryDeadline.toISOString() : null),
        modelUsed: processingInfo.modelUsed,
        confidenceLevel: processingInfo.confidenceLevel,
        rawResponse: result
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 执行测试
runRequirementUnderstandingTest();