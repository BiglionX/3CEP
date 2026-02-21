import { SmartNegotiationEngine } from "@/b2b-procurement-agent/services/smart-negotiation-engine.service";
import { NextResponse } from "next/server";

const negotiationEngine = new SmartNegotiationEngine();

// GET /api/b2b-procurement/negotiation/{sessionId} - 获取议价状态
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const status = await negotiationEngine.getNegotiationStatus(sessionId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("获取议价状态错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `获取议价状态失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

// POST /api/b2b-procurement/negotiation/{sessionId}/accept - 接受最终报价
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const result = await negotiationEngine.acceptFinalOffer(sessionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.result,
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
    console.error("接受最终报价错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: `接受最终报价失败: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
