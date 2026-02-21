/**
 * 供应商匹配推荐API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { SupplierMatchingRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productRequirements, locationPreferences, budgetConstraints } = body;

    // 参数验证
    if (!productRequirements || !Array.isArray(productRequirements)) {
      return NextResponse.json(
        { error: '缺少必要参数: productRequirements' },
        { status: 400 }
      );
    }

    if (productRequirements.length === 0) {
      return NextResponse.json(
        { error: '产品需求列表不能为空' },
        { status: 400 }
      );
    }

    const recommendationRequest: SupplierMatchingRequest = {
      productRequirements,
      locationPreferences,
      budgetConstraints
    };

    const recommendationService = new RecommendationService();
    const matches = await recommendationService.matchSuppliers(recommendationRequest);

    return NextResponse.json({
      success: true,
      data: {
        supplierMatches: matches,
        count: matches.length,
        request: recommendationRequest
      }
    });

  } catch (error) {
    console.error('供应商匹配错误:', error);
    return NextResponse.json(
      { 
        error: '供应商匹配失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}