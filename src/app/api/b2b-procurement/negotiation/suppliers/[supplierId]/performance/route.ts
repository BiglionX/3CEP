import { SupplierRecommendationService } from "@/b2b-procurement-agent/services/supplier-recommendation.service";
import { NextResponse } from "next/server";

const recommendationService = new SupplierRecommendationService();

// GET /api/b2b-procurement/negotiation/suppliers/{supplierId}/performance - 获取供应商性能
export async function GET(
  request: Request,
  { params }: { params: { supplierId: string } }
) {
  try {
    const { supplierId } = params;

    const performance = await recommendationService.getSupplierPerformanceStats(
      supplierId
    );

    return NextResponse.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error("获取供应商性能错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `获取供应商性能失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
