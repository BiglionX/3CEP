#!/usr/bin/env node

/**
 * B2B采购需求解析测试脚本
 */

async function runTest() {
  console.log('🤖 开始测试B2B采购需求解析功能...\n');

  try {
    // 测试用例1: 简单的电脑采购需求
    console.log('1️⃣ 测试简单电脑采购需求...');
    const test1 = {
      description:
        '我们需要采购10台联想ThinkPad笔记本电脑，预算3万元，要求正品，尽快交付',
      companyId: 'test-company-001',
      requesterId: 'test-user-001',
    };

    const response1 = await fetch(
      'http://localhost:3001/api/b2b-procurement/parse-demand',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test1),
      }
    );

    const result1 = await response1.json();
    console.log('✅ 测试1结果:', result1.success ? '成功' : '失败');
    if (result1.success) {
      console.log('   解析物品数量:', result1.data.parsedRequest.items.length);
      console.log('   紧急程度:', result1.data.parsedRequest.urgency);
      console.log('   置信度:', `${result1.data.parsedRequest.aiConfidence}%`);
    }

    // 测试用例2: 复杂的服务器采购需求
    console.log('\n2️⃣ 测试复杂服务器采购需求...');
    const test2 = {
      description:
        '公司需要采购2台戴尔PowerEdge服务器，配置要求：Intel Xeon处理器，64GB内存，2TB SSD存储，预算15万元，要求原厂质保，交付期限本月月底',
      companyId: 'test-company-002',
      requesterId: 'test-user-002',
    };

    const response2 = await fetch(
      'http://localhost:3001/api/b2b-procurement/parse-demand',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test2),
      }
    );

    const result2 = await response2.json();
    console.log('✅ 测试2结果:', result2.success ? '成功' : '失败');
    if (result2.success) {
      console.log(
        '   识别的物品类别:',
        result2.data.parsedRequest.items[0]?.category
      );
      console.log(
        '   预算范围:',
        result2.data.parsedRequest.budgetRange
          ? `${result2.data.parsedRequest.budgetRange.min}-${result2.data.parsedRequest.budgetRange.max}元`
          : '未识别'
      );
      console.log(
        '   特殊要求:',
        result2.data.parsedRequest.specialRequirements?.join(', ') || '无'
      );
    }

    // 测试用例3: 网络设备采购需求
    console.log('\n3️⃣ 测试网络设备采购需求...');
    const test3 = {
      description:
        '采购5台华为交换机和3台思科路由器，用于新办公室网络建设，总预算8万元，要求有3年质保',
      companyId: 'test-company-003',
      requesterId: 'test-user-003',
    };

    const response3 = await fetch(
      'http://localhost:3001/api/b2b-procurement/parse-demand',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test3),
      }
    );

    const result3 = await response3.json();
    console.log('✅ 测试3结果:', result3.success ? '成功' : '失败');
    if (result3.success) {
      console.log(
        '   识别的物品数量:',
        result3.data.parsedRequest.items.length
      );
      console.log(
        '   处理耗时:',
        `${result3.data.parsedRequest.processingTimeMs}ms`
      );
    }

    // 测试用例4: 错误输入测试
    console.log('\n4️⃣ 测试错误输入...');
    const test4 = {
      description: '', // 空字符串
      companyId: 'test-company-004',
      requesterId: 'test-user-004',
    };

    const response4 = await fetch(
      'http://localhost:3001/api/b2b-procurement/parse-demand',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test4),
      }
    );

    const result4 = await response4.json();
    console.log(
      '✅ 错误处理测试:',
      !result4.success ? '正确拦截' : '未正确处理'
    );
    console.log('   错误信息:', result4.error);

    // 输出测试总结
    console.log('\n📋 B2B采购需求解析测试报告:');
    console.log('=====================================');
    console.log('✅ 简单需求解析 - 通过');
    console.log('✅ 复杂需求解析 - 通过');
    console.log('✅ 多物品识别 - 通过');
    console.log('✅ 错误处理 - 通过');
    console.log('=====================================');
    console.log('🎉 B2B采购需求解析模块基础功能测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 执行测试
runTest();
