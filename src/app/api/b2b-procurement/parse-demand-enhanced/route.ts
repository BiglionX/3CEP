/**
 * BERT澧炲己鐗圔2B閲囪喘闇€姹傝В鏋怉PI绔偣
 */

import { NextResponse } from 'next/server';
import { BertEnhancedParserService } from '@/b2b-procurement-agent/services/bert-enhanced-parser.service';
import { RawProcurementRequest } from '@/b2b-procurement-agent/models/procurement.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, companyId, requesterId } = body;

    // 鍙傛暟楠岃瘉
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '璇彁渚涙湁鏁堢殑閲囪喘闇€姹傛弿,'
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

    // 鍒涘缓鍘熷璇眰瀵硅薄
    const rawRequest: RawProcurementRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      requesterId,
      rawDescription: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 璋冪敤BERT澧炲己瑙ｆ瀽鏈嶅姟
    const parserService = new BertEnhancedParserService();
    const parsedRequest = await parserService.parseDemand(rawRequest);

    return NextResponse.json({
      success: true,
      data: {
        rawRequest,
        parsedRequest,
        enhancement: 'BERT + 瑙勫垯娣峰悎鏋舵瀯',
        confidenceImprovement:
          parsedRequest.aiConfidence > 85 ? '鏄捐憲鎻愬崌' : '淇濇寔绋冲畾',
      },
      message: '閲囪喘闇€姹傝В鏋愭垚鍔燂紙澧炲己鐗堬級',
    });
  } catch (error) {
    console.error('閲囪喘闇€姹傝В鏋愰敊', error);

    return NextResponse.json(
      {
        success: false,
        error: '閲囪喘闇€姹傝В鏋愬け,'
        details: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// GET鏂规硶鐢ㄤ簬鍋ュ悍妫€export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BERT澧炲己鐗圔2B閲囪喘闇€姹傝В鏋愭湇鍔¤繍琛屾,'
    enhancement: '闆嗘垚BERT妯″瀷鐨勬贩鍚堟灦,'
    timestamp: new Date().toISOString(),
  });
}


