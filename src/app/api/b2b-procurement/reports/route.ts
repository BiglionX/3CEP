import { NextResponse } from 'next/server';
import { comparisonReportService } from '../../../../b2b-procurement-agent/services/comparison-report.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quotationRequestId } = body;
    const userId = 'test-user-id'; // 涓存椂娴嬭瘯?
    const report = await comparisonReportService.generateComparisonReport(
      quotationRequestId,
      userId
    );

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('鐢熸垚姣斾环鎶ュ憡閿欒:', error);
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
    const quotationRequestId = searchParams.get('quotationRequestId');

    if (!quotationRequestId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯璇环璇锋眰ID鍙傛暟' },
        { status: 400 }
      );
    }

    const reports =
      await comparisonReportService.getReportsByQuotationRequest(
        quotationRequestId
      );

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('鑾峰彇姣斾环鎶ュ憡鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

