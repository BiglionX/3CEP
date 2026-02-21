import { NextResponse } from "next/server";
import { quotationRequestService } from "../../../../../../../b2b-procurement-agent/services/quotation-request.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = "test-user-id"; // 临时测试用

    const result = await quotationRequestService.sendQuotation(body, userId);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error("发送询价错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
