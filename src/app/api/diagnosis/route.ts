import { NextResponse } from 'next/server';
import { AIDiagnosisService } from '@/services/ai-diagnosis-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, productId } = body;

    // 楠岃瘉杈撳叆
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '娑堟伅鍐呭涓嶈兘涓虹┖' }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: '浼氳瘽ID涓嶈兘涓虹┖' }, { status: 400 });
    }

    // 澶勭悊璇婃柇璇锋眰
    const result = await AIDiagnosisService.processDiagnosis(
      sessionId,
      message,
      productId
    );

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        suggestions: result.suggestions,
        sessionId: sessionId,
      },
    });
  } catch (error) {
    console.error('AI璇婃柇API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: '缂哄皯浼氳瘽ID鍙傛暟' }, { status: 400 });
    }

    // 鑾峰彇浼氳瘽鎽樿
    const summary = AIDiagnosisService.getSessionSummary(sessionId);

    return NextResponse.json({
      success: true,
      data: summary || { messageCount: 0, duration: '0锟? },
    });
  } catch (error) {
    console.error('鑾峰彇浼氳瘽淇℃伅閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: '缂哄皯浼氳瘽ID鍙傛暟' }, { status: 400 });
    }

    // 娓呯悊浼氳瘽
    AIDiagnosisService.clearSession(sessionId);

    return NextResponse.json({
      success: true,
      message: '浼氳瘽宸叉竻?,
    });
  } catch (error) {
    console.error('娓呴櫎浼氳瘽閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

