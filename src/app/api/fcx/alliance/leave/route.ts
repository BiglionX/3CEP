/**
 * 缁翠慨搴楅€€鍑鸿仈鐩烝PI
 * 澶勭悊搴楅摵€鍑篎CX鑱旂洘鍜岃В闄よ川 */

import { NextResponse } from 'next/server';
import { AllianceService } from '@/fcx-system';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId } = body;

    // 鍙傛暟楠岃瘉
    if (!shopId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: shopId' },
        { status: 400 }
      );
    }

    const allianceService = new AllianceService();
    const updatedShop = await allianceService.leaveAlliance(shopId);

    return NextResponse.json({
      success: true,
      data: {
        shop: updatedShop,
        message: '鎴愬姛€鍑篎CX鑱旂洘',
      },
    });
  } catch (error) {
    console.error('缁翠慨搴楅€€鍑鸿仈鐩熼敊', error);
    return NextResponse.json(
      {
        error: '€鍑哄鐞嗗け,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

