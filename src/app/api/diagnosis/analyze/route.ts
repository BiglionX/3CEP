/**
 * AI璇婃柇鍒嗘瀽API绔偣
 * POST /api/diagnosis/analyze
 * 鎺ユ敹鏁呴殰鎻忚堪锛岃繑鍥炵粨鏋勫寲璇婃柇缁撴灉
 */

import {
  DiagnosisAnalysisService,
  DiagnosisRequest,
} from '@/services/diagnosis-analysis.service';
import { validateDiagnosisResult } from '@/services/diagnosis-prompt-template';
import { NextResponse } from 'next/server';

// 璇锋眰浣撴帴?interface DiagnosisApiRequest {
  faultDescription: string;
  deviceId?: string;
  deviceInfo?: {
    brand?: string;
    model?: string;
    category?: string;
    purchaseTime?: string;
  };
  sessionId?: string;
  language?: string;
}

// 鍝嶅簲浣撴帴?interface DiagnosisApiResponse {
  success: boolean;
  data?: {
    diagnosisResult: any;
    sessionId: string;
    processingTimeMs: number;
  };
  error?: string;
  timestamp: string;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // 1. 瑙ｆ瀽璇锋眰?    const body: DiagnosisApiRequest = await request.json();

    // 2. 鍙傛暟楠岃瘉
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. 鏋勯€犺瘖鏂?    const diagnosisRequest: DiagnosisRequest = {
      faultDescription: body.faultDescription,
      deviceId: body.deviceId,
      deviceInfo: body.deviceInfo,
      sessionId:
        body.sessionId ||
        `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      language: body.language || 'zh',
    };

    // 4. 璋冪敤璇婃柇鏈嶅姟
    const diagnosisService = new DiagnosisAnalysisService({
      timeoutMs: 30000,
      maxRetries: 2,
      fallbackToMock: true,
      enableLogging: true,
    });

    const diagnosisResult =
      await diagnosisService.analyzeFault(diagnosisRequest);

    // 5. 楠岃瘉缁撴灉鏍煎紡
    if (!validateDiagnosisResult(diagnosisResult)) {
      throw new Error('璇婃柇缁撴灉鏍煎紡楠岃瘉澶辫触');
    }

    // 6. 鏋勯€犳垚鍔熷搷?    const response: DiagnosisApiResponse = {
      success: true,
      data: {
        diagnosisResult: diagnosisResult,
        sessionId: diagnosisRequest.sessionId!,
        processingTimeMs: Date.now() - startTime,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('璇婃柇API澶勭悊閿欒:', error);

    // 7. 閿欒鍝嶅簲
    const response: DiagnosisApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      timestamp: new Date().toISOString(),
    };

    // 鏍规嵁閿欒绫诲瀷杩斿洖涓嶅悓鐨凥TTP鐘舵€佺爜
    const statusCode =
      error instanceof Error && error.message.includes('瓒呮椂') ? 408 : 500;

    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯sessionId鍙傛暟',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 鑾峰彇浼氳瘽淇℃伅
    const diagnosisService = new DiagnosisAnalysisService();
    const sessionStats = diagnosisService.getSessionStats(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        stats: sessionStats,
        isActive: !!sessionStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇浼氳瘽淇℃伅閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        timestamp: new Date().toISOString(),
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
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯sessionId鍙傛暟',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 娓呯悊浼氳瘽
    const diagnosisService = new DiagnosisAnalysisService();
    diagnosisService.clearSession(sessionId);

    return NextResponse.json({
      success: true,
      message: '浼氳瘽宸叉竻?,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('娓呴櫎浼氳瘽閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * 楠岃瘉璇锋眰鍙傛暟
 */
function validateRequest(body: DiagnosisApiRequest): string | null {
  // 蹇呴渶瀛楁妫€?  if (!body.faultDescription) {
    return '鏁呴殰鎻忚堪涓嶈兘涓虹┖';
  }

  if (typeof body.faultDescription !== 'string') {
    return '鏁呴殰鎻忚堪蹇呴』鏄瓧绗︿覆绫诲瀷';
  }

  if (body.faultDescription.trim().length === 0) {
    return '鏁呴殰鎻忚堪涓嶈兘涓虹┖瀛楃?;
  }

  if (body.faultDescription.length > 1000) {
    return '鏁呴殰鎻忚堪闀垮害涓嶈兘瓒呰繃1000瀛楃';
  }

  // 璁惧淇℃伅楠岃瘉
  if (body.deviceInfo) {
    if (body.deviceInfo.brand && typeof body.deviceInfo.brand !== 'string') {
      return '璁惧鍝佺墝蹇呴』鏄瓧绗︿覆绫诲瀷';
    }

    if (body.deviceInfo.model && typeof body.deviceInfo.model !== 'string') {
      return '璁惧鍨嬪彿蹇呴』鏄瓧绗︿覆绫诲瀷';
    }

    if (
      body.deviceInfo.category &&
      typeof body.deviceInfo.category !== 'string'
    ) {
      return '璁惧绫诲埆蹇呴』鏄瓧绗︿覆绫诲瀷';
    }
  }

  // 浼氳瘽ID楠岃瘉
  if (body.sessionId && typeof body.sessionId !== 'string') {
    return '浼氳瘽ID蹇呴』鏄瓧绗︿覆绫诲瀷';
  }

  // 璇█楠岃瘉
  if (body.language && !['zh', 'en'].includes(body.language)) {
    return '璇█鍙傛暟鍙兘鏄痾h鎴杄n';
  }

  return null;
}

/**
 * API浣跨敤绀轰緥鍜屾枃? */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// API璺敱閰嶇疆

