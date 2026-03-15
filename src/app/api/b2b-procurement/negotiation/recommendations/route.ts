import { SupplierRecommendationService } from '@/b2b-procurement-agent/services/supplier-recommendation.service';
import { NextResponse } from 'next/server';

const recommendationService = new SupplierRecommendationService();

// GET /api/b2b-procurement/negotiation/recommendations - 鑾峰彇渚涘簲鍟嗘帹export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetPrice = parseFloat(searchParams.get('targetPrice') || '0');
    const maxRecommendations = parseInt(searchParams.get('limit') || '5');

    // 瑙ｆ瀽閲囪喘鐗╁搧鍙傛暟锛堢畝鍗曞鐞嗭級
    const itemsParam = searchParams.get('items');
    const procurementItems = itemsParam  JSON.parse(itemsParam) : [];

    if (targetPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '鐩爣牸蹇呴』澶т簬0',
        },
        { status: 400 }
      );
    }

    const recommendations = await recommendationService.recommendSuppliers(
      procurementItems,
      targetPrice,
      maxRecommendations
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('鑾峰彇渚涘簲鍟嗘帹鑽愰敊', error);
    return NextResponse.json(
      {
        success: false,
        error: `鑾峰彇渚涘簲鍟嗘帹鑽愬け ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}


