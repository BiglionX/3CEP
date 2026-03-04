/**
 * B2B閲囪喘闇€姹傝В鏋怉PI绔偣
 */

import { NextResponse } from 'next/server';
import { DemandParserService } from '@/b2b-procurement-agent/services/demand-parser.service';
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
          error: '璇锋彁渚涙湁鏁堢殑閲囪喘闇€姹傛弿?,
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

    // 鍒涘缓鍘熷璇锋眰瀵硅薄
    const rawRequest: RawProcurementRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      requesterId,
      rawDescription: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 璋冪敤瑙ｆ瀽鏈嶅姟
    const parserService = new DemandParserService();
    const parsedRequest = await parserService.parseDemand(rawRequest);

    return NextResponse.json({
      success: true,
      data: {
        rawRequest,
        parsedRequest,
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
    message: 'B2B閲囪喘闇€姹傝В鏋愭湇鍔¤繍琛屾?,
    timestamp: new Date().toISOString(),
  });
}

