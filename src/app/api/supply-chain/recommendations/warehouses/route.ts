/**
 * 撳簱浣嶇疆鎺ㄨ崘API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { WarehouseRecommendationRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userLocation,
      productIds,
      quantities,
      deliveryTimePreference,
      budgetConstraint,
      optimizationGoal,
    } = body;

    // 鍙傛暟楠岃瘉
    if (
      !userLocation ||
      !userLocation.coordinates ||
      !productIds ||
      !Array.isArray(productIds)
    ) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: userLocation.coordinates, productIds' },
        { status: 400 }
      );
    }

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: '浜у搧ID鍒楄〃涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    const recommendationRequest: WarehouseRecommendationRequest = {
      userLocation,
      productIds,
      quantities,
      deliveryTimePreference,
      budgetConstraint,
      optimizationGoal,
    };

    const recommendationService = new RecommendationService();
    const recommendations = await recommendationService.recommendWarehouses(
      recommendationRequest
    );

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        request: recommendationRequest,
      },
    });
  } catch (error) {
    console.error('撳簱鎺ㄨ崘閿欒:', error);
    return NextResponse.json(
      {
        error: '撳簱鎺ㄨ崘澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
