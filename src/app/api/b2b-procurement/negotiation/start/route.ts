import { NegotiationStrategyService } from "@/b2b-procurement-agent/services/negotiation-strategy.service";
import { SmartNegotiationEngine } from "@/b2b-procurement-agent/services/smart-negotiation-engine.service";
import { SupplierRecommendationService } from "@/b2b-procurement-agent/services/supplier-recommendation.service";
import { NextResponse } from "next/server";

const negotiationEngine = new SmartNegotiationEngine();
const strategyService = new NegotiationStrategyService();
const recommendationService = new SupplierRecommendationService();

// POST /api/b2b-procurement/negotiation/start - 启动议价流程
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证必需参数
    if (
      !body.procurementRequestId ||
      !body.supplierId ||
      !body.targetPrice ||
      !body.initialQuote
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "缺少必要参数：procurementRequestId, supplierId, targetPrice, initialQuote",
        },
        { status: 400 }
      );
    }

    const result = await negotiationEngine.startNegotiation({
      procurementRequestId: body.procurementRequestId,
      supplierId: body.supplierId,
      quotationRequestId: body.quotationRequestId,
      targetPrice: body.targetPrice,
      initialQuote: body.initialQuote,
      maxRounds: body.maxRounds || 5,
      strategyPreferences: body.strategyPreferences,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          session: result.session,
          advice: result.advice,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("启动议价流程错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `启动议价流程失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

// GET /api/b2b-procurement/negotiation/strategies - 获取议价策略列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyType = searchParams.get("type");

    const strategies = await strategyService.getActiveStrategies();

    // 如果指定了策略类型，进行过滤
    const filteredStrategies = strategyType
      ? strategies.filter((s) => s.strategyType === strategyType)
      : strategies;

    return NextResponse.json({
      success: true,
      data: filteredStrategies,
    });
  } catch (error) {
    console.error("获取议价策略列表错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `获取议价策略失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
