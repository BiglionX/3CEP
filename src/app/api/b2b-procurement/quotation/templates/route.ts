import { NextResponse } from 'next/server';
import { quotationTemplateService } from '../../../../../b2b-procurement-agent/services/quotation-template.service';

export async function GET(request: Request) {
  try {
    // 鑾峰彇鐢ㄦ埛ID锛堝疄闄呭簲鐢ㄤ腑搴旇庤璇乼oken鑾峰彇    const userId = 'test-user-id'; // 涓存椂娴嬭瘯
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const templates = await quotationTemplateService.getTemplates(
      userId,
      activeOnly
    );

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('鑾峰彇璇环妯℃澘鍒楄〃閿欒:', error);
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
    const template = await quotationTemplateService.createTemplate(
      body,
      userId
    );

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('鍒涘缓璇环妯℃澘閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
