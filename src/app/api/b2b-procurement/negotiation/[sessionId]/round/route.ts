import { SmartNegotiationEngine } from "@/b2b-procurement-agent/services/smart-negotiation-engine.service";
import { NextResponse } from "next/server";

const negotiationEngine = new SmartNegotiationEngine();

// POST /api/b2b-procurement/negotiation/{sessionId}/round - 执行议价回合
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();

    // 验证必需参数
    if (!body.supplierQuote) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必要参数：supplierQuote",
        },
        { status: 400 }
      );
    }

    const result = await negotiationEngine.executeNegotiationRound({
      sessionId,
      supplierQuote: body.supplierQuote,
      roundRemarks: body.roundRemarks,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          nextOffer: result.nextOffer,
          strategyUsed: result.strategyUsed,
          result: result.result,
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
    console.error("执行议价回合错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `执行议价回合失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
