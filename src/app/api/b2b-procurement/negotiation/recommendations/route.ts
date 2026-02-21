import { SupplierRecommendationService } from "@/b2b-procurement-agent/services/supplier-recommendation.service";
import { NextResponse } from "next/server";

const recommendationService = new SupplierRecommendationService();

// GET /api/b2b-procurement/negotiation/recommendations - 获取供应商推荐
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetPrice = parseFloat(searchParams.get("targetPrice") || "0");
    const maxRecommendations = parseInt(searchParams.get("limit") || "5");

    // 解析采购物品参数（简单处理）
    const itemsParam = searchParams.get("items");
    const procurementItems = itemsParam ? JSON.parse(itemsParam) : [];

    if (targetPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "目标价格必须大于0",
        },
        { status: 400 }
      );
    }

    const recommendations = await recommendationService.recommendSuppliers(
      procurementItems,
      targetPrice,
      maxRecommendations
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("获取供应商推荐错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `获取供应商推荐失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
