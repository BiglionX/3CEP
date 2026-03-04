/**
 * 琛ヨ揣寤鸿API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { ReplenishmentRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, productIds, forecastHorizonDays, serviceLevelTarget } =
      body;

    // 鍙傛暟楠岃瘉
    if (!warehouseId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: warehouseId' },
        { status: 400 }
      );
    }

    const recommendationRequest: ReplenishmentRequest = {
      warehouseId,
      productIds:
        productIds && Array.isArray(productIds) ? productIds : undefined,
      forecastHorizonDays: forecastHorizonDays || 30,
      serviceLevelTarget: serviceLevelTarget || 0.95,
    };

    const recommendationService = new RecommendationService();
    const suggestions = await recommendationService.getReplenishmentSuggestions(
      recommendationRequest
    );

    return NextResponse.json({
      success: true,
      data: {
        replenishmentSuggestions: suggestions,
        count: suggestions.length,
        request: recommendationRequest,
      },
    });
  } catch (error) {
    console.error('琛ヨ揣寤鸿閿欒:', error);
    return NextResponse.json(
      {
        error: '鐢熸垚琛ヨ揣寤鸿澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
