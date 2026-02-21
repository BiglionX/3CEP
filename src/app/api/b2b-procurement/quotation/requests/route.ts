import { NextResponse } from "next/server";
import { quotationRequestService } from "../../../../../b2b-procurement-agent/services/quotation-request.service";

export async function GET(request: Request) {
  try {
    const userId = "test-user-id"; // 临时测试用

    const { searchParams } = new URL(request.url);
    const params: any = {};

    if (searchParams.get("status")) {
      params.status = searchParams.get("status");
    }

    if (searchParams.get("keyword")) {
      params.keyword = searchParams.get("keyword");
    }

    const requests = await quotationRequestService.getQuotationRequests(
      userId,
      params
    );

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("获取询价请求列表错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = "test-user-id"; // 临时测试用

    const quotationRequest =
      await quotationRequestService.createQuotationRequest(body, userId);

    return NextResponse.json({
      success: true,
      data: quotationRequest,
    });
  } catch (error) {
    console.error("创建询价请求错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
