import { NegotiationStrategyService } from '@/b2b-procurement-agent/services/negotiation-strategy.service';
import { SmartNegotiationEngine } from '@/b2b-procurement-agent/services/smart-negotiation-engine.service';
import { SupplierRecommendationService } from '@/b2b-procurement-agent/services/supplier-recommendation.service';
import { NextResponse } from 'next/server';

const negotiationEngine = new SmartNegotiationEngine();
const strategyService = new NegotiationStrategyService();
const recommendationService = new SupplierRecommendationService();

// POST /api/b2b-procurement/negotiation/start - 鍚姩璁环娴佺▼
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呴渶鍙傛暟
    if (
      !body.procurementRequestId ||
      !body.supplierId ||
      !body.targetPrice ||
      !body.initialQuote
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            '缂哄皯蹇呰鍙傛暟锛歱rocurementRequestId, supplierId, targetPrice, initialQuote',
        },
        { status: 400 }
      );
    }

    const result = await negotiationEngine.startNegotiation({
      procurementRequestId: body.procurementRequestId,
      supplierId: body.supplierId,
      quotationRequestId: body.quotationRequestId,
      targetPrice: body.targetPrice,
      initialQuote: body.initialQuote,
      maxRounds: body.maxRounds || 5,
      strategyPreferences: body.strategyPreferences,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          session: result.session,
          advice: result.advice,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('鍚姩璁环娴佺▼閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: `鍚姩璁环娴佺▼澶辫触: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

// GET /api/b2b-procurement/negotiation/strategies - 鑾峰彇璁环绛栫暐鍒楄〃
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyType = searchParams.get('type');

    const strategies = await strategyService.getActiveStrategies();

    // 濡傛灉鎸囧畾浜嗙瓥鐣ョ被鍨嬶紝杩涜杩囨护
    const filteredStrategies = strategyType
       strategies.filter(s => s.strategyType === strategyType)
      : strategies;

    return NextResponse.json({
      success: true,
      data: filteredStrategies,
    });
  } catch (error) {
    console.error('鑾峰彇璁环绛栫暐鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: `鑾峰彇璁环绛栫暐澶辫触: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

