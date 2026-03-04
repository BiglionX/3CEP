/**
 * 智能分仓引擎API测试脚本
 * 测试 /api/warehouse/optimize 接口的功能
 */

async function testWarehouseOptimizationAPI() {
  console.log('🚀 开始测试智能分仓引擎API...\n');

  const apiUrl = 'http://localhost:3000/api/warehouse/optimize';

  // 测试用例1: 标准订单测试
  const testCases = [
    {
      name: '标准订单测试',
      data: {
        deliveryAddress: {
          country: '中国',
          province: '上海市',
          city: '上海市',
          address: '浦东新区张江高科技园区',
        },
        orderItems: [
          {
            productId: 'phone-case-001',
            productName: 'iPhone 14 Pro 手机壳',
            quantity: 2,
            unitPrice: 89.9,
            weight: 0.3,
          },
          {
            productId: 'screen-protector-001',
            productName: '钢化膜',
            quantity: 1,
            unitPrice: 29.9,
            weight: 0.1,
          },
        ],
        deliveryPreferences: {
          deliveryPriority: 'balanced',
        },
      },
    },
    {
      name: '大件商品测试',
      data: {
        deliveryAddress: {
          country: '中国',
          province: '广东省',
          city: '深圳市',
          address: '南山区科技园',
        },
        orderItems: [
          {
            productId: 'laptop-001',
            productName: '游戏本电脑',
            quantity: 1,
            unitPrice: 8999,
            weight: 2.5,
            dimensions: {
              length: 35,
              width: 25,
              height: 20,
            },
          },
        ],
        deliveryPreferences: {
          deliveryPriority: 'fastest',
        },
      },
    },
    {
      name: '批量订单测试',
      data: {
        deliveryAddress: {
          country: '中国',
          province: '北京市',
          city: '北京市',
          address: '朝阳区三里屯',
        },
        orderItems: [
          {
            productId: 'keyboard-001',
            productName: '机械键盘',
            quantity: 10,
            unitPrice: 399,
            weight: 1.2,
          },
          {
            productId: 'mouse-001',
            productName: '无线鼠标',
            quantity: 15,
            unitPrice: 199,
            weight: 0.3,
          },
        ],
        deliveryPreferences: {
          maxBudget: 500,
          deliveryPriority: 'cheapest',
        },
      },
    },
  ];

  // 执行测试
  for (const testCase of testCases) {
    console.log(`\n📋 执行测试: ${testCase.name}`);

    try {
      const startTime = Date.now();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const endTime = Date.now();
      const result = await response.json();

      if (result.success) {
        const selected = result.data.selectedWarehouse;
        const metrics = result.data.optimizationMetrics;
        const costAnalysis = result.data.costAnalysis;

        console.log(`✅ API调用成功`);
        console.log(
          `   🏪 选中仓库: ${selected.warehouseName} (${selected.warehouseCode})`
        );
        console.log(`   📍 距离: ${selected.distance.toFixed(1)} km`);
        console.log(
          `   ⏱️  预计配送时间: ${selected.estimatedDeliveryTime} 小时`
        );
        console.log(`   💰 总成本: ¥${selected.totalCost.toFixed(2)}`);
        console.log(`   📊 成本改善率: ${metrics.improvementRate.toFixed(2)}%`);
        console.log(
          `   💡 成本节省: ¥${costAnalysis.savings.absolute.toFixed(
            2
          )} (${costAnalysis.savings.percentage.toFixed(2)}%)`
        );
        console.log(`   ⭐ 优化得分: ${selected.optimizationScore}/100`);
        console.log(`   📈 置信度: ${result.data.confidenceScore}%`);
        console.log(`   ⏱️  API响应时间: ${endTime - startTime}ms`);

        // 显示替代方案
        if (result.data.alternativeOptions.length > 0) {
          console.log(`   🔁 可选替代方案:`);
          result.data.alternativeOptions
            .slice(0, 2)
            .forEach((alt: any, index: number) => {
              console.log(
                `      ${index + 1}. ${
                  alt.warehouseName
                } - ¥${alt.totalCost.toFixed(2)} (${
                  alt.estimatedDeliveryTime
                }h)`
              );
            });
        }

        // 验证验收标准
        const meetsStandard = metrics.improvementRate >= 10;
        console.log(
          `   🎯 验收标准(≥10%改善): ${meetsStandard ? '✅ 通过' : '❌ 未通过'}`
        );
      } else {
        console.log(`❌ API返回错误: ${result.error}`);
        if (result.details) {
          console.log(`   详情: ${result.details}`);
        }
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${(error as Error).message}`);
      console.log(`   请确认服务是否正在运行在 ${apiUrl}`);
    }
  }

  // 测试错误情况
  console.log('\n🔍 测试错误处理...');

  const errorTestCases = [
    {
      name: '缺少必填字段',
      data: {
        deliveryAddress: {
          country: '中国',
          // 缺少province和city
        },
        orderItems: [],
      },
    },
    {
      name: '空订单',
      data: {
        deliveryAddress: {
          country: '中国',
          province: '上海市',
          city: '上海市',
          address: '测试地址',
        },
        orderItems: [],
      },
    },
  ];

  for (const testCase of errorTestCases) {
    console.log(`\n📋 错误测试: ${testCase.name}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();

      if (response.status === 400) {
        console.log(`✅ 正确返回400错误`);
        console.log(`   错误信息: ${result.error}`);
      } else {
        console.log(`❌ 期望400错误但得到 ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${(error as Error).message}`);
    }
  }

  console.log('\n🏁 API测试完成！');
}

// GET请求测试（健康检查）
async function testHealthCheck() {
  console.log('\n🏥 测试API健康检查...');

  try {
    const response = await fetch(
      'http://localhost:3000/api/warehouse/optimize',
      {
        method: 'GET',
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('✅ 健康检查通过');
      console.log(`   服务状态: ${result.message}`);
      console.log(`   端点: ${result.endpoint}`);
      console.log(`   方法: ${result.method}`);
    } else {
      console.log('❌ 健康检查失败');
    }
  } catch (error) {
    console.log(`❌ 健康检查请求失败: ${(error as Error).message}`);
    console.log('   请确认服务是否启动');
  }
}

// 主函数
async function main() {
  try {
    // 先测试健康检查
    await testHealthCheck();

    // 再测试主要功能
    await testWarehouseOptimizationAPI();
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { testHealthCheck, testWarehouseOptimizationAPI };
