/**
 * 仓库位置推荐API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { WarehouseRecommendationRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userLocation, productIds, quantities, deliveryTimePreference, budgetConstraint, optimizationGoal } = body;

    // 参数验证
    if (!userLocation || !userLocation.coordinates || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: '缺少必要参数: userLocation.coordinates, productIds' },
        { status: 400 }
      );
    }

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: '产品ID列表不能为空' },
        { status: 400 }
      );
    }

    const recommendationRequest: WarehouseRecommendationRequest = {
      userLocation,
      productIds,
      quantities,
      deliveryTimePreference,
      budgetConstraint,
      optimizationGoal
    };

    const recommendationService = new RecommendationService();
    const recommendations = await recommendationService.recommendWarehouses(recommendationRequest);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        request: recommendationRequest
      }
    });

  } catch (error) {
    console.error('仓库推荐错误:', error);
    return NextResponse.json(
      { 
        error: '仓库推荐失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}