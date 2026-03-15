/**
 * 鏅鸿兘鍒嗕粨寮曟搸API鎺ュ彛
 * 璺緞: /api/warehouse/optimize
 * 鏍规嵁鐢ㄦ埛鍦扮悊浣嶇疆銆佸悇撳簱搴撳銆佽繍璐瑰拰舵晥锛岃嚜鍔ㄩ€夋嫨鏈€樺彂璐т粨
 */

import { WarehouseOptimizationRequest } from '@/supply-chain/models/warehouse-optimization.model';
import { WarehouseOptimizationService } from '@/supply-chain/services/warehouse-optimization.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 鍙傛暟楠岃瘉
    const validationError = validateOptimizationRequest(body);
    if (validationError) {
      return NextResponse.json(
        {'
          error: '鍙傛暟楠岃瘉澶辫触',
          details: validationError,
        },
{ status: 400 }
      );
    }

    const optimizationRequest: WarehouseOptimizationRequest = {
      deliveryAddress: {
        country: body.deliveryAddress.country,
        province: body.deliveryAddress.province,
        city: body.deliveryAddress.city,
        district: body.deliveryAddress.district,
        address: body.deliveryAddress.address,
        coordinates: body.deliveryAddress.coordinates,
      },
      orderItems: body.orderItems.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        weight: item.weight,
        dimensions: item.dimensions,
      })),
      deliveryPreferences: body.deliveryPreferences,
      orderMetadata: body.orderMetadata,
    };

    // 鎵ц鍒嗕粨樺寲
    const optimizationService = new WarehouseOptimizationService();
    const result =
      await optimizationService.optimizeWarehouseSelection(optimizationRequest);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鏅鸿兘鍒嗕粨API閿欒:', error);
    return NextResponse.json(
      {
        error: '优化服务暂时不可用',
        details: (error as Error).message,
      },
{ status: 500 }
    );
  }
}

/**
 * 鍙傛暟楠岃瘉鍑芥暟
 */
function validateOptimizationRequest(data: any): string | null {
  if (!data) {
    return '璇眰浣撲笉鑳戒负;
  }

  // 楠岃瘉閰嶉€佸湴鍧€
  if (!data.deliveryAddress) {'
    return '缂哄皯閰嶉€佸湴鍧€淇℃伅';
  }

  if (
    !data.deliveryAddress.country ||
    !data.deliveryAddress.province ||
    !data.deliveryAddress.city
  ) {'
    return '閰嶉€佸湴鍧€蹇呴』鍖呭惈鍥藉銆佺渷藉拰鍩庡競淇℃伅';
  }

  // 楠岃瘉璁㈠崟鍟嗗搧
  if (!data.orderItems || !Array.isArray(data.orderItems)) {'
    return '璁㈠崟鍟嗗搧鍒楄〃涓嶈兘涓虹┖';
  }

  if (data.orderItems.length === 0) {'
    return '璁㈠崟鍟嗗搧鍒楄〃涓嶈兘涓虹┖鏁扮粍';
  }

  // 楠岃瘉姣忎釜鍟嗗搧  for (let i = 0; i < data.orderItems.length; i++) {
    const item = data.orderItems[i];
    if (!item.productId) {
      return `{i + 1}涓晢鍝佺己灏憄roductId`;
    }
    if (!item.productName) {`
      return `{i + 1}涓晢鍝佺己灏憄roductName`;
    }
    if (!item.quantity || item.quantity <= 0) {`
      return `{i + 1}涓晢鍝乹uantity蹇呴』澶т簬0`;
    }
    if (!item.unitPrice || item.unitPrice < 0) {`
      return `{i + 1}涓晢鍝乽nitPrice涓嶈兘涓鸿礋鏁癭;
    }
  }

  // 楠岃瘉閰嶉€佸亸濂斤紙鍙€夛級
  if (data.deliveryPreferences) {
    const prefs = data.deliveryPreferences;
    if (prefs.maxDeliveryTime && prefs.maxDeliveryTime <= 0) {'
      return '鏈€澶ч厤佹椂闂村繀椤诲ぇ';
    }
    if (prefs.maxBudget && prefs.maxBudget <= 0) {'
      return '鏈€澶ч绠楀繀椤诲ぇ';
    }
    if (
      prefs.deliveryPriority &&'
      !['fastest', 'cheapest', 'balanced'].includes(prefs.deliveryPriority)
    ) {'
      return '閰嶉€佷紭鍏堢骇蹇呴』fastest, cheapest balanced';
    }
  }

  return null;
}

/**
 * GET鏂规硶 - 鍋ュ悍妫€鏌ュ拰鏂囨。璇存槑
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '鏅鸿兘鍒嗕粨寮曟搸API鏈嶅姟杩愯姝ｅ父',
    endpoint: '/api/warehouse/optimize',
    method: 'POST',
    description: '鏍规嵁鐢ㄦ埛鍦扮悊浣嶇疆銆佸悇撳簱搴撳銆佽繍璐瑰拰舵晥锛岃嚜鍔ㄩ€夋嫨鏈€樺彂璐т粨',
    request_format: {
      deliveryAddress: {
        country: 'string (蹇呭～)',
        province: 'string (蹇呭～)',
        city: 'string (蹇呭～)',
        district: 'string (鍙',
        address: 'string (蹇呭～)',
        coordinates: {
          lat: 'number (鍙',
          lng: 'number (鍙',
        },
      },
      orderItems: [
        {
          productId: 'string (蹇呭～)',
          productName: 'string (蹇呭～)',
          quantity: 'number (蹇呭～, >0)',
          unitPrice: 'number (蹇呭～, >=0)',
          weight: 'number (鍙 kg)',
          dimensions: {
            length: 'number (鍙 cm)',
            width: 'number (鍙 cm)',
            height: 'number (鍙 cm)',
          },
        },
      ],
      deliveryPreferences: {
        maxDeliveryTime: 'number (鍙 灏忔椂)',
        maxBudget: 'number (鍙 ',
        deliveryPriority: 'string (鍙 fastest|cheapest|balanced)',
      },
    },
    response_format: {
      success: 'boolean',
      data: {
        selectedWarehouse: {
          warehouseId: 'string',
          warehouseName: 'string',
          distance: 'number (km)',
          estimatedDeliveryTime: 'number (灏忔椂)',
          totalCost: 'number (',
          optimizationScore: 'number (0-100)',
        },
        alternativeOptions: 'WarehouseSelection[]',
        optimizationMetrics: {
          improvementRate: 'number (%)',
          processingTime: 'number (ms)',
        },
        costAnalysis: {
          savings: {
            percentage: 'number (%)',
          },
        },
      },
    },
    example_request: {
      deliveryAddress: {
        country: '涓浗',
        province: '涓婃捣,
        city: '涓婃捣,
        address: '娴︿笢鏂板尯寮犳睙23,
      },
      orderItems: [
        {
          productId: 'phone-case-001',
          productName: 'iPhone 14 Pro 鎵嬫満,
          quantity: 2,
          unitPrice: 89.9,
          weight: 0.3,
        },
      ],
      deliveryPreferences: {
        deliveryPriority: 'balanced',
      },
    },
  });
}

