/**
 * 智能分仓引擎简单测试
 */

import { WarehouseOptimizationService } from "@/supply-chain/services/warehouse-optimization.service";

async function simpleTest() {
  console.log("🧪 开始简单测试...\n");

  try {
    const service = new WarehouseOptimizationService();

    // 简单测试用例
    const request = {
      deliveryAddress: {
        country: "中国",
        province: "上海市",
        city: "上海市",
        address: "浦东新区张江高科技园区",
      },
      orderItems: [
        {
          productId: "test-001",
          productName: "测试商品",
          quantity: 2,
          unitPrice: 100,
          weight: 0.5,
        },
      ],
    };

    console.log("📍 测试请求:");
    console.log(
      `   收货地址: ${request.deliveryAddress.province}${request.deliveryAddress.city}`
    );
    console.log(`   商品数量: ${request.orderItems.length}种`);
    console.log(
      `   总价值: ¥${request.orderItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )}`
    );

    const result = await service.optimizeWarehouseSelection(request as any);

    console.log("\n✅ 测试成功!");
    console.log(`🏪 选中仓库: ${result.selectedWarehouse.warehouseName}`);
    console.log(`💰 总成本: ¥${result.selectedWarehouse.totalCost.toFixed(2)}`);
    console.log(`📍 距离: ${result.selectedWarehouse.distance.toFixed(1)} km`);
    console.log(
      `⏱️  配送时间: ${result.selectedWarehouse.estimatedDeliveryTime} 小时`
    );
    console.log(
      `⭐ 优化得分: ${result.selectedWarehouse.optimizationScore}/100`
    );
    console.log(
      `📊 成本改善率: ${result.optimizationMetrics.improvementRate.toFixed(2)}%`
    );
    console.log(`📈 置信度: ${result.confidenceScore}%`);

    // 验证验收标准
    const meetsStandard = result.optimizationMetrics.improvementRate >= 10;
    console.log(
      `\n🎯 验收标准检查 (成本降低≥10%): ${
        meetsStandard ? "✅ 通过" : "❌ 未通过"
      }`
    );

    if (meetsStandard) {
      console.log("\n🎉 智能分仓引擎基础功能测试通过！");
    } else {
      console.log("\n⚠️  成本优化效果未达到预期标准");
    }

    return meetsStandard;
  } catch (error) {
    console.error("❌ 测试失败:", (error as Error).message);
    return false;
  }
}

// 运行测试
if (require.main === module) {
  simpleTest().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { simpleTest };
