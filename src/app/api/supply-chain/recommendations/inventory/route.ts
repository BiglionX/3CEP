/**
 * 搴撳瓨浼樺寲寤鸿API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { InventoryOptimizationRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      warehouseId,
      productIds,
      analysisPeriodDays,
      optimizationStrategy,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!warehouseId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: warehouseId' },
        { status: 400 }
      );
    }

    const recommendationRequest: InventoryOptimizationRequest = {
      warehouseId,
      productIds:
        productIds && Array.isArray(productIds) ? productIds : undefined,
      analysisPeriodDays: analysisPeriodDays || 90,
      optimizationStrategy: optimizationStrategy || 'cost_optimization',
    };

    const recommendationService = new RecommendationService();
    const suggestions =
      await recommendationService.getInventoryOptimizationSuggestions(
        recommendationRequest
      );

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length,
        request: recommendationRequest,
      },
    });
  } catch (error) {
    console.error('搴撳瓨浼樺寲寤鸿閿欒:', error);
    return NextResponse.json(
      {
        error: '鐢熸垚搴撳瓨浼樺寲寤鸿澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
