/**
 * 库存优化建议API
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { InventoryOptimizationRequest } from '@/supply-chain/models/recommendation.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, productIds, analysisPeriodDays, optimizationStrategy } = body;

    // 参数验证
    if (!warehouseId) {
      return NextResponse.json(
        { error: '缺少必要参数: warehouseId' },
        { status: 400 }
      );
    }

    const recommendationRequest: InventoryOptimizationRequest = {
      warehouseId,
      productIds: productIds && Array.isArray(productIds) ? productIds : undefined,
      analysisPeriodDays: analysisPeriodDays || 90,
      optimizationStrategy: optimizationStrategy || 'cost_optimization'
    };

    const recommendationService = new RecommendationService();
    const suggestions = await recommendationService.getInventoryOptimizationSuggestions(recommendationRequest);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length,
        request: recommendationRequest
      }
    });

  } catch (error) {
    console.error('库存优化建议错误:', error);
    return NextResponse.json(
      { 
        error: '生成库存优化建议失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}