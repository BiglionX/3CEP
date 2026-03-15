import { NextResponse } from 'next/server';
import { quotationRequestService } from '../../../../../b2b-procurement-agent/services/quotation-request.service';

export async function GET(request: Request) {
  try {
    const userId = 'test-user-id'; // 涓存椂娴嬭瘯
    const { searchParams } = new URL(request.url);
    const params: any = {};

    if (searchParams.get('status')) {
      params.status = searchParams.get('status');
    }

    if (searchParams.get('keyword')) {
      params.keyword = searchParams.get('keyword');
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
    console.error('鑾峰彇璇环璇眰鍒楄〃閿欒:', error);
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
    const userId = 'test-user-id'; // 涓存椂娴嬭瘯
    const quotationRequest =
      await quotationRequestService.createQuotationRequest(body, userId);

    return NextResponse.json({
      success: true,
      data: quotationRequest,
    });
  } catch (error) {
    console.error('鍒涘缓璇环璇眰閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
