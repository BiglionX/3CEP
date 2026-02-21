/**
 * 智能分仓引擎API接口
 * 路径: /api/warehouse/optimize
 * 根据用户地理位置、各仓库库存、运费和时效，自动选择最优发货仓
 */

import { WarehouseOptimizationRequest } from "@/supply-chain/models/warehouse-optimization.model";
import { WarehouseOptimizationService } from "@/supply-chain/services/warehouse-optimization.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 参数验证
    const validationError = validateOptimizationRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          error: "参数验证失败",
          details: validationError,
        },
        { status: 400 }
      );
    }

    const optimizationRequest: WarehouseOptimizationRequest = {
      deliveryAddress: {
        country: body.deliveryAddress.country,
        province: body.deliveryAddress.province,
        city: body.deliveryAddress.city,
        district: body.deliveryAddress.district,
        address: body.deliveryAddress.address,
        coordinates: body.deliveryAddress.coordinates,
      },
      orderItems: body.orderItems.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        weight: item.weight,
        dimensions: item.dimensions,
      })),
      deliveryPreferences: body.deliveryPreferences,
      orderMetadata: body.orderMetadata,
    };

    // 执行分仓优化
    const optimizationService = new WarehouseOptimizationService();
    const result = await optimizationService.optimizeWarehouseSelection(
      optimizationRequest
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("智能分仓API错误:", error);
    return NextResponse.json(
      {
        error: "分仓优化服务暂时不可用",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 参数验证函数
 */
function validateOptimizationRequest(data: any): string | null {
  if (!data) {
    return "请求体不能为空";
  }

  // 验证配送地址
  if (!data.deliveryAddress) {
    return "缺少配送地址信息";
  }

  if (
    !data.deliveryAddress.country ||
    !data.deliveryAddress.province ||
    !data.deliveryAddress.city
  ) {
    return "配送地址必须包含国家、省份和城市信息";
  }

  // 验证订单商品
  if (!data.orderItems || !Array.isArray(data.orderItems)) {
    return "订单商品列表不能为空";
  }

  if (data.orderItems.length === 0) {
    return "订单商品列表不能为空数组";
  }

  // 验证每个商品项
  for (let i = 0; i < data.orderItems.length; i++) {
    const item = data.orderItems[i];
    if (!item.productId) {
      return `第${i + 1}个商品缺少productId`;
    }
    if (!item.productName) {
      return `第${i + 1}个商品缺少productName`;
    }
    if (!item.quantity || item.quantity <= 0) {
      return `第${i + 1}个商品quantity必须大于0`;
    }
    if (!item.unitPrice || item.unitPrice < 0) {
      return `第${i + 1}个商品unitPrice不能为负数`;
    }
  }

  // 验证配送偏好（可选）
  if (data.deliveryPreferences) {
    const prefs = data.deliveryPreferences;
    if (prefs.maxDeliveryTime && prefs.maxDeliveryTime <= 0) {
      return "最大配送时间必须大于0";
    }
    if (prefs.maxBudget && prefs.maxBudget <= 0) {
      return "最大预算必须大于0";
    }
    if (
      prefs.deliveryPriority &&
      !["fastest", "cheapest", "balanced"].includes(prefs.deliveryPriority)
    ) {
      return "配送优先级必须是 fastest, cheapest 或 balanced";
    }
  }

  return null;
}

/**
 * GET方法 - 健康检查和文档说明
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "智能分仓引擎API服务运行正常",
    endpoint: "/api/warehouse/optimize",
    method: "POST",
    description: "根据用户地理位置、各仓库库存、运费和时效，自动选择最优发货仓",
    request_format: {
      deliveryAddress: {
        country: "string (必填)",
        province: "string (必填)",
        city: "string (必填)",
        district: "string (可选)",
        address: "string (必填)",
        coordinates: {
          lat: "number (可选)",
          lng: "number (可选)",
        },
      },
      orderItems: [
        {
          productId: "string (必填)",
          productName: "string (必填)",
          quantity: "number (必填, >0)",
          unitPrice: "number (必填, >=0)",
          weight: "number (可选, kg)",
          dimensions: {
            length: "number (可选, cm)",
            width: "number (可选, cm)",
            height: "number (可选, cm)",
          },
        },
      ],
      deliveryPreferences: {
        maxDeliveryTime: "number (可选, 小时)",
        maxBudget: "number (可选, 元)",
        deliveryPriority: "string (可选: fastest|cheapest|balanced)",
      },
    },
    response_format: {
      success: "boolean",
      data: {
        selectedWarehouse: {
          warehouseId: "string",
          warehouseName: "string",
          distance: "number (km)",
          estimatedDeliveryTime: "number (小时)",
          totalCost: "number (元)",
          optimizationScore: "number (0-100)",
        },
        alternativeOptions: "WarehouseSelection[]",
        optimizationMetrics: {
          improvementRate: "number (%)",
          processingTime: "number (ms)",
        },
        costAnalysis: {
          savings: {
            percentage: "number (%)",
          },
        },
      },
    },
    example_request: {
      deliveryAddress: {
        country: "中国",
        province: "上海市",
        city: "上海市",
        address: "浦东新区张江路123号",
      },
      orderItems: [
        {
          productId: "phone-case-001",
          productName: "iPhone 14 Pro 手机壳",
          quantity: 2,
          unitPrice: 89.9,
          weight: 0.3,
        },
      ],
      deliveryPreferences: {
        deliveryPriority: "balanced",
      },
    },
  });
}
