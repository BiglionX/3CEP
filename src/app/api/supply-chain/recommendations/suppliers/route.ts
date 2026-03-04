/**
 * 渚涘簲鍟嗗尮閰嶆帹鑽怉PI
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { SupplierMatchingRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productRequirements, locationPreferences, budgetConstraints } =
      body;

    // 鍙傛暟楠岃瘉
    if (!productRequirements || !Array.isArray(productRequirements)) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: productRequirements' },
        { status: 400 }
      );
    }

    if (productRequirements.length === 0) {
      return NextResponse.json(
        { error: '浜у搧闇€姹傚垪琛ㄤ笉鑳戒负? },
        { status: 400 }
      );
    }

    const recommendationRequest: SupplierMatchingRequest = {
      productRequirements,
      locationPreferences,
      budgetConstraints,
    };

    const recommendationService = new RecommendationService();
    const matches = await recommendationService.matchSuppliers(
      recommendationRequest
    );

    return NextResponse.json({
      success: true,
      data: {
        supplierMatches: matches,
        count: matches.length,
        request: recommendationRequest,
      },
    });
  } catch (error) {
    console.error('渚涘簲鍟嗗尮閰嶉敊?', error);
    return NextResponse.json(
      {
        error: '渚涘簲鍟嗗尮閰嶅け?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

