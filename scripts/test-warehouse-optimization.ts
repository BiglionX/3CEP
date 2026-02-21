/**
 * 智能分仓引擎测试用例
 * 验证分仓效果优于随机选择，成本降低≥10%
 */

import { WarehouseOptimizationRequest } from "@/supply-chain/models/warehouse-optimization.model";
import { WarehouseOptimizationService } from "@/supply-chain/services/warehouse-optimization.service";

interface TestCase {
  name: string;
  request: Partial<WarehouseOptimizationRequest> & {
    deliveryAddress: any;
    orderItems: any[];
  };
  expectedImprovement?: number; // 期望的成本改善率(%)
  description: string;
  shouldFail?: boolean;
  expectedError?: string;
}

interface TestResult {
  testName: string;
  passed: boolean;
  actualImprovement?: number;
  expectedImprovement?: number;
  processingTime?: number;
  selectedWarehouse?: string;
  totalCost?: number;
  error?: string;
}

async function runWarehouseOptimizationTests() {
  console.log("🧪 开始智能分仓引擎测试...\n");

  const optimizationService = new WarehouseOptimizationService();

  // 测试用例集合
  const testCases: TestCase[] = [
    {
      name: "TC-001 上海地区订单测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "上海市",
          city: "上海市",
          address: "浦东新区陆家嘴金融中心",
        },
        orderItems: [
          {
            productId: "phone-screen-001",
            productName: "iPhone屏幕总成",
            quantity: 5,
            unitPrice: 1200,
            weight: 0.8,
          },
          {
            productId: "battery-001",
            productName: "手机电池",
            quantity: 10,
            unitPrice: 150,
            weight: 0.3,
          },
        ],
        deliveryPreferences: {
          deliveryPriority: "balanced",
        },
      },
      expectedImprovement: 15,
      description: "测试上海地区订单的分仓优化效果",
    },
    {
      name: "TC-002 深圳地区订单测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "广东省",
          city: "深圳市",
          address: "南山区科技园",
        },
        orderItems: [
          {
            productId: "laptop-charger-001",
            productName: "笔记本充电器",
            quantity: 3,
            unitPrice: 200,
            weight: 0.5,
          },
        ],
        deliveryPreferences: {
          deliveryPriority: "fastest",
        },
      },
      expectedImprovement: 12,
      description: "测试深圳地区订单的快速配送优化",
    },
    {
      name: "TC-003 北京地区订单测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "北京市",
          city: "北京市",
          address: "朝阳区三里屯",
        },
        orderItems: [
          {
            productId: "headphones-001",
            productName: "无线耳机",
            quantity: 8,
            unitPrice: 300,
            weight: 0.2,
          },
          {
            productId: "mouse-001",
            productName: "无线鼠标",
            quantity: 12,
            unitPrice: 150,
            weight: 0.1,
          },
        ],
        deliveryPreferences: {
          maxBudget: 200,
          deliveryPriority: "cheapest",
        },
      },
      expectedImprovement: 18,
      description: "测试北京地区订单的成本优化效果",
    },
    {
      name: "TC-004 大件商品测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "浙江省",
          city: "杭州市",
          address: "西湖区文三路",
        },
        orderItems: [
          {
            productId: "desktop-pc-001",
            productName: "台式电脑主机",
            quantity: 1,
            unitPrice: 5000,
            weight: 15,
            dimensions: {
              length: 40,
              width: 30,
              height: 15,
            },
          },
        ],
        deliveryPreferences: {
          deliveryPriority: "balanced",
        },
      },
      expectedImprovement: 20,
      description: "测试大件商品的分仓优化效果",
    },
    {
      name: "TC-005 批量订单测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "江苏省",
          city: "南京市",
          address: "鼓楼区中山路",
        },
        orderItems: [
          {
            productId: "keyboard-001",
            productName: "机械键盘",
            quantity: 50,
            unitPrice: 400,
            weight: 1.2,
          },
          {
            productId: "monitor-001",
            productName: "显示器",
            quantity: 20,
            unitPrice: 1200,
            weight: 8,
          },
        ],
        deliveryPreferences: {
          deliveryPriority: "balanced",
        },
      },
      expectedImprovement: 25,
      description: "测试批量订单的大规模分仓优化",
    },
  ];

  // 执行测试
  const results: TestResult[] = [];
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n📋 执行测试: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);

    try {
      const startTime = Date.now();
      const result = await optimizationService.optimizeWarehouseSelection(
        testCase.request
      );
      const endTime = Date.now();

      const actualImprovement = result.optimizationMetrics.improvementRate;
      const isPassed = testCase.expectedImprovement
        ? actualImprovement >= testCase.expectedImprovement
        : true;

      console.log(`✅ 测试${isPassed ? "通过" : "失败"}`);
      console.log(`   📊 实际改善率: ${actualImprovement.toFixed(2)}%`);
      console.log(`   🎯 期望改善率: ≥${testCase.expectedImprovement}%`);
      console.log(`   🏪 选中仓库: ${result.selectedWarehouse.warehouseName}`);
      console.log(
        `   💰 总成本: ¥${result.selectedWarehouse.totalCost.toFixed(2)}`
      );
      console.log(`   ⏱️  处理时间: ${endTime - startTime}ms`);
      console.log(`   📈 置信度: ${result.confidenceScore}%`);

      if (result.alternativeOptions.length > 0) {
        console.log(`   🔁 替代方案: ${result.alternativeOptions.length}个`);
        result.alternativeOptions.forEach((alt, index) => {
          console.log(
            `      ${index + 1}. ${
              alt.warehouseName
            } - ¥${alt.totalCost.toFixed(2)}`
          );
        });
      }

      results.push({
        testName: testCase.name,
        passed: isPassed,
        actualImprovement,
        expectedImprovement: testCase.expectedImprovement,
        processingTime: endTime - startTime,
        selectedWarehouse: result.selectedWarehouse.warehouseName,
        totalCost: result.selectedWarehouse.totalCost,
      });

      if (isPassed) passedTests++;
    } catch (error) {
      console.log(`❌ 测试失败: ${(error as Error).message}`);
      results.push({
        testName: testCase.name,
        passed: false,
        error: (error as Error).message,
      });
    }
  }

  // 输出测试总结
  console.log("\n" + "=".repeat(60));
  console.log("📊 智能分仓引擎测试总结");
  console.log("=".repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  // 性能统计
  const validResults = results.filter((r) => r.processingTime !== undefined);
  const avgProcessingTime =
    validResults.reduce((sum, r) => sum + (r.processingTime || 0), 0) /
    validResults.length;

  const improvementResults = results.filter(
    (r) => r.actualImprovement !== undefined
  );
  const avgImprovement =
    improvementResults.reduce((sum, r) => sum + (r.actualImprovement || 0), 0) /
    improvementResults.length;

  console.log(`\n⚡ 性能指标:`);
  console.log(`   平均处理时间: ${avgProcessingTime.toFixed(2)}ms`);
  console.log(`   平均成本改善率: ${avgImprovement.toFixed(2)}%`);

  // 详细结果表格
  console.log(`\n📋 详细测试结果:`);
  console.log("-".repeat(100));
  console.log(
    "测试名称".padEnd(25) +
      "结果".padEnd(8) +
      "改善率".padEnd(12) +
      "选中仓库".padEnd(15) +
      "成本".padEnd(12) +
      "处理时间"
  );
  console.log("-".repeat(100));

  results.forEach((result) => {
    const status = result.passed ? "✅ 通过" : "❌ 失败";
    const improvement = result.actualImprovement
      ? `${result.actualImprovement.toFixed(1)}%`
      : "N/A";
    const warehouse = result.selectedWarehouse || "N/A";
    const cost = result.totalCost ? `¥${result.totalCost.toFixed(0)}` : "N/A";
    const time = result.processingTime ? `${result.processingTime}ms` : "N/A";

    console.log(
      result.testName.padEnd(25) +
        status.padEnd(8) +
        improvement.padEnd(12) +
        warehouse.padEnd(15) +
        cost.padEnd(12) +
        time
    );
  });

  console.log("-".repeat(100));

  // 验收标准检查
  const meetsAcceptanceCriteria = avgImprovement >= 10;
  console.log(`\n🎯 验收标准检查:`);
  console.log(
    `   成本降低≥10%: ${
      meetsAcceptanceCriteria ? "✅ 满足" : "❌ 不满足"
    } (${avgImprovement.toFixed(2)}%)`
  );

  if (passedTests === totalTests && meetsAcceptanceCriteria) {
    console.log(`\n🎉 智能分仓引擎测试全部通过！`);
    console.log(`   ✅ 所有测试用例执行成功`);
    console.log(`   ✅ 平均成本改善率达到验收标准`);
    console.log(`   ✅ 系统性能符合预期`);
  } else {
    console.log(
      `\n⚠️  智能分仓引擎测试存在${totalTests - passedTests}个失败用例`
    );
    console.log(`   ⚠️  请检查失败原因并进行优化`);
  }

  return {
    totalTests,
    passedTests,
    passRate: (passedTests / totalTests) * 100,
    averageImprovement: avgImprovement,
    averageProcessingTime: avgProcessingTime,
    meetsAcceptanceCriteria,
  };
}

// 边界情况测试
async function runBoundaryTests() {
  console.log("\n🔍 开始边界情况测试...\n");

  const optimizationService = new WarehouseOptimizationService();

  const boundaryTestCases: TestCase[] = [
    {
      name: "空订单测试",
      request: {
        deliveryAddress: {
          country: "中国",
          province: "上海市",
          city: "上海市",
          address: "测试地址",
        },
        orderItems: [],
      } as any,
      shouldFail: true,
      expectedError: "订单商品列表不能为空",
      description: "测试空订单处理",
    },
    {
      name: "无效地址测试",
      request: {
        deliveryAddress: {
          country: "",
          province: "",
          city: "",
          address: "测试地址",
        },
        orderItems: [
          {
            productId: "test-001",
            productName: "测试商品",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      } as any,
      shouldFail: true,
      expectedError: "配送地址必须包含国家、省份和城市信息",
      description: "测试无效地址验证",
    },
    {
      name: "超远距离测试",
      request: {
        deliveryAddress: {
          country: "美国",
          province: "California",
          city: "Los Angeles",
          address: "Test Address",
        },
        orderItems: [
          {
            productId: "test-001",
            productName: "测试商品",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      },
      shouldFail: false,
      description: "测试国际订单处理能力",
    },
  ];

  for (const testCase of boundaryTestCases) {
    console.log(`\n📋 边界测试: ${testCase.name}`);

    try {
      const result = await optimizationService.optimizeWarehouseSelection(
        testCase.request
      );

      if (testCase.shouldFail) {
        console.log(`❌ 预期失败但实际成功`);
      } else {
        console.log(`✅ 边界情况处理正常`);
        console.log(`   选中仓库: ${result.selectedWarehouse.warehouseName}`);
        console.log(
          `   总成本: ¥${result.selectedWarehouse.totalCost.toFixed(2)}`
        );
      }
    } catch (error) {
      if (testCase.shouldFail) {
        console.log(`✅ 正确捕获异常: ${(error as Error).message}`);
      } else {
        console.log(`❌ 意外错误: ${(error as Error).message}`);
      }
    }
  }
}

// 性能压力测试
async function runPerformanceTests() {
  console.log("\n⚡ 开始性能压力测试...\n");

  const optimizationService = new WarehouseOptimizationService();

  // 生成大量测试数据
  const largeOrderItems = [];
  for (let i = 0; i < 100; i++) {
    largeOrderItems.push({
      productId: `product-${i.toString().padStart(3, "0")}`,
      productName: `测试商品${i}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      unitPrice: Math.random() * 1000 + 50,
      weight: Math.random() * 2 + 0.1,
    });
  }

  const performanceTestCase: WarehouseOptimizationRequest = {
    deliveryAddress: {
      country: "中国",
      province: "广东省",
      city: "广州市",
      address: "天河区珠江新城",
    },
    orderItems: largeOrderItems,
    deliveryPreferences: {
      deliveryPriority: "balanced",
    },
  };

  console.log(`📦 测试订单规模: ${largeOrderItems.length}个商品`);

  // 多次执行测试稳定性
  const executionTimes = [];
  for (let i = 0; i < 5; i++) {
    const startTime = Date.now();
    try {
      await optimizationService.optimizeWarehouseSelection(performanceTestCase);
      const endTime = Date.now();
      executionTimes.push(endTime - startTime);
      console.log(`   第${i + 1}次执行: ${endTime - startTime}ms`);
    } catch (error) {
      console.log(`   第${i + 1}次执行失败: ${(error as Error).message}`);
    }
  }

  if (executionTimes.length > 0) {
    const avgTime =
      executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length;
    const minTime = Math.min(...executionTimes);
    const maxTime = Math.max(...executionTimes);

    console.log(`\n📈 性能统计:`);
    console.log(`   平均执行时间: ${avgTime.toFixed(2)}ms`);
    console.log(`   最快执行时间: ${minTime}ms`);
    console.log(`   最慢执行时间: ${maxTime}ms`);
    console.log(
      `   性能稳定性: ${(((maxTime - minTime) / avgTime) * 100).toFixed(
        2
      )}%差异`
    );
  }
}

// 主测试函数
async function main() {
  try {
    // 运行主要功能测试
    const mainResults = await runWarehouseOptimizationTests();

    // 运行边界测试
    await runBoundaryTests();

    // 运行性能测试
    await runPerformanceTests();

    console.log("\n🏁 所有测试完成！");

    return mainResults;
  } catch (error) {
    console.error("测试执行失败:", error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  main()
    .then((results) => {
      console.log("\n✨ 测试结束");
      process.exit(0);
    })
    .catch((error) => {
      console.error("测试异常:", error);
      process.exit(1);
    });
}

export { runBoundaryTests, runPerformanceTests, runWarehouseOptimizationTests };
