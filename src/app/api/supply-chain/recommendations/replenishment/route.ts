/**
 * 补货建议API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { ReplenishmentRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, productIds, forecastHorizonDays, serviceLevelTarget } = body;

    // 参数验证
    if (!warehouseId) {
      return NextResponse.json(
        { error: '缺少必要参数: warehouseId' },
        { status: 400 }
      );
    }

    const recommendationRequest: ReplenishmentRequest = {
      warehouseId,
      productIds: productIds && Array.isArray(productIds) ? productIds : undefined,
      forecastHorizonDays: forecastHorizonDays || 30,
      serviceLevelTarget: serviceLevelTarget || 0.95
    };

    const recommendationService = new RecommendationService();
    const suggestions = await recommendationService.getReplenishmentSuggestions(recommendationRequest);

    return NextResponse.json({
      success: true,
      data: {
        replenishmentSuggestions: suggestions,
        count: suggestions.length,
        request: recommendationRequest
      }
    });

  } catch (error) {
    console.error('补货建议错误:', error);
    return NextResponse.json(
      { 
        error: '生成补货建议失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}