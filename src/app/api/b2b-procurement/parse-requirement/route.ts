/**
 * B2B閲囪喘闇€姹傜悊瑙ｅ紩鎿嶢PI绔偣
 * 鏀寔鏂囨湰銆佸浘鐗囥€侀摼鎺ョ瓑澶氱杈撳叆绫诲瀷鐨勬櫤鑳借В? */

import {
  InputType,
  RawProcurementRequest,
} from '@/b2b-procurement-agent/models/procurement.model';
import { RequirementUnderstandingService } from '@/b2b-procurement-agent/services/requirement-understanding.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, inputType = 'auto', companyId, requesterId } = body;

    // 鍙傛暟楠岃瘉
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '璇锋彁渚涙湁鏁堢殑閲囪喘闇€姹傝緭?,
        },
        { status: 400 }
      );
    }

    if (!companyId || !requesterId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鐨勫叕鍙窱D鎴栬姹傝€匢D',
        },
        { status: 400 }
      );
    }

    // 鑷姩妫€娴嬭緭鍏ョ被?    const detectedInputType =
      inputType === 'auto' ? detectInputType(input) : (inputType as InputType);

    // 鍒涘缓鍘熷璇锋眰瀵硅薄
    const rawRequest: RawProcurementRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      requesterId,
      input: input.trim(),
      inputType: detectedInputType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 鏍规嵁杈撳叆绫诲瀷璁剧疆鐩稿簲瀛楁
    switch (detectedInputType) {
      case InputType.IMAGE:
        rawRequest.imageUrl = input.trim();
        break;
      case InputType.LINK:
        rawRequest.sourceUrl = input.trim();
        break;
      case InputType.TEXT:
        rawRequest.rawDescription = input.trim();
        break;
    }

    // 璋冪敤闇€姹傜悊瑙ｆ湇?    const understandingService = new RequirementUnderstandingService();
    const result = await understandingService.processRequest(rawRequest);

    return NextResponse.json({
      success: true,
      data: {
        rawRequest,
        parsedRequest: result.parsedRequest,
        processingInfo: {
          inputType: detectedInputType,
          modelUsed: result.modelUsed,
          confidenceLevel: result.confidenceLevel,
          processingSteps: result.processingSteps,
          processingTimeMs: result.processingTimeMs,
        },
      },
      message: '閲囪喘闇€姹傝В鏋愭垚?,
    });
  } catch (error) {
    console.error('閲囪喘闇€姹傝В鏋愰敊?', error);

    return NextResponse.json(
      {
        success: false,
        error: '閲囪喘闇€姹傝В鏋愬け?,
        details: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// GET鏂规硶鐢ㄤ簬鍋ュ悍妫€?export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'B2B閲囪喘闇€姹傜悊瑙ｅ紩鎿庢湇鍔¤繍琛屾?,
    supportedInputTypes: ['text', 'image', 'link'],
    features: [
      '澶氭ā鎬佽緭鍏ユ敮?,
      '鏅鸿兘杈撳叆绫诲瀷妫€?,
      '澶фā鍨婣PI闆嗘垚',
      '缁撴瀯鍖栭渶姹傝緭?,
    ],
    timestamp: new Date().toISOString(),
  });
}

// 杈呭姪鍑芥暟锛氳嚜鍔ㄦ娴嬭緭鍏ョ被?function detectInputType(input: string): InputType {
  const trimmedInput = input.trim().toLowerCase();

  // 妫€娴嬫槸鍚︿负URL
  const urlPattern =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (urlPattern.test(trimmedInput)) {
    // 杩涗竴姝ュ垽鏂槸鍥剧墖杩樻槸鏅€氶摼?    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const isImageUrl = imageExtensions.some(ext => trimmedInput.includes(ext));

    return isImageUrl ? InputType.IMAGE : InputType.LINK;
  }

  // 榛樿涓烘枃鏈緭?  return InputType.TEXT;
}

