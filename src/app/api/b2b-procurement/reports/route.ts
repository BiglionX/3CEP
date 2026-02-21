import { NextResponse } from "next/server";
import { comparisonReportService } from "../../../../b2b-procurement-agent/services/comparison-report.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quotationRequestId } = body;
    const userId = "test-user-id"; // 临时测试用

    const report = await comparisonReportService.generateComparisonReport(
      quotationRequestId,
      userId
    );

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("生成比价报告错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quotationRequestId = searchParams.get("quotationRequestId");

    if (!quotationRequestId) {
      return NextResponse.json(
        { success: false, error: "缺少询价请求ID参数" },
        { status: 400 }
      );
    }

    const reports = await comparisonReportService.getReportsByQuotationRequest(
      quotationRequestId
    );

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("获取比价报告列表错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
