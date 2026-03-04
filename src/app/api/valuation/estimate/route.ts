import { NextRequest, NextResponse } from 'next/server';
import { DeviceProfileService } from '@/services/device-profile.service';
import { fusionEngineV1Service } from '@/services/fusion-engine-v1.service';
import { confidenceService } from '@/services/confidence.service';
import { DeviceCondition } from '@/lib/valuation/valuation-engine.service';
import { createClient } from '@supabase/supabase-js';
import { recordValuationMetrics } from '@/app/api/monitoring/metrics/route';

const profileService = new DeviceProfileService();

// 鍒濆鍖朣upabase瀹㈡埛绔敤浜庢棩蹇楄?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鏃ュ織璁板綍鍑芥暟
async function logValuation(
  request: NextRequest,
  requestBody: any,
  deviceProfile: any,
  result: any,
  source: string,
  processingTime: number
) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || '';
    const authHeader = request.headers.get('authorization') || '';
    const apiKeyUsed = authHeader.replace('Bearer ', '');

    const logEntry = {
      device_qrcode_id: requestBody.deviceQrcodeId,
      device_profile: {
        productModel: deviceProfile.productModel,
        brandName: deviceProfile.brandName,
        productCategory: deviceProfile.productCategory,
        manufacturingDate: deviceProfile.manufacturingDate,
      },
      condition_input: requestBody.condition,
      market_price: requestBody.marketPrice,
      final_value: result.finalValue,
      valuation_method: source,
      confidence_score: result.confidence,
      confidence_level:
        result.confidence >= 0.8
          ? 'high'
          : result.confidence >= 0.5
            ? 'medium'
            : 'low',
      fusion_details: result.fusionDetails,
      breakdown: result.breakdown,
      request_source: 'api',
      client_ip: clientIp,
      user_agent: userAgent,
      api_key_used: apiKeyUsed,
      processing_time_ms: processingTime,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/valuation/estimate',
      },
    };

    await supabase.from('valuation_logs').insert(logEntry);
    console.log('锟?浼板€兼棩蹇楄褰曟垚?);
  } catch (error) {
    console.error('锟?浼板€兼棩蹇楄褰曞け?', error);
  }
}

// API瀵嗛挜楠岃瘉涓棿?function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const validKeys = [
    process.env.VALUATION_API_KEY,
    process.env.LIFECYCLE_API_KEY,
    'dev-key', // 寮€鍙戠幆澧冩祴璇曠敤
  ];

  return validKeys.some(key => key && token === key);
}

// 璇锋眰浣撻獙?interface ValuationRequest {
  deviceQrcodeId: string;
  condition?: {
    screen?: string;
    battery?: string;
    body?: string;
    functionality?: string;
  };
  marketPrice?: number;
  useMarketData?: boolean; // 鏄惁浣跨敤甯傚満鏁版嵁
}

// 鍝嶅簲鏍煎紡
interface ValuationResponse {
  success: boolean;
  message: string;
  data?: {
    deviceQrcodeId: string;
    deviceInfo: {
      productModel: string;
      brandName?: string;
      productCategory?: string;
      manufacturingDate?: string;
    };
    value: number;
    confidence: number;
    source: 'market' | 'rule' | 'fused';
    breakdown: {
      baseValue: number;
      depreciation: number;
      marketAdjustment?: number;
      conditionMultiplier: number;
      componentScore: number;
      finalValue: number;
    };
    freshnessInfo?: {
      daysOld: number;
      freshnessScore: number;
    };
    fusionDetails?: {
      depreciationValue: number;
      marketValue: number;
      weights: {
        depreciation: number;
        market: number;
      };
      strategy: string;
    };
    recommendations?: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇锋彁渚涙湁鏁堢殑API瀵嗛挜',
        },
        { status: 401 }
      );
    }

    const body: ValuationRequest = await request.json();

    // 楠岃瘉蹇呰鍙傛暟
    if (!body.deviceQrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: deviceQrcodeId',
        },
        { status: 400 }
      );
    }

    // 鑾峰彇璁惧妗ｆ
    const deviceProfile = await profileService.getDeviceProfile(
      body.deviceQrcodeId
    );

    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈壘鍒版寚瀹氳澶囨。?,
        },
        { status: 404 }
      );
    }

    // 瑙ｆ瀽鎴愯壊鍙傛暟
    let condition: DeviceCondition | undefined;
    if (body.condition) {
      condition = {
        screen: (body.condition.screen as any) || 'minor_scratches',
        battery: (body.condition.battery as any) || 'good',
        body: (body.condition.body as any) || 'light_wear',
        functionality: (body.condition.functionality as any) || 'perfect',
      };
    }

    // 璁＄畻缃俊?    const confidenceAssessment = await confidenceService.assessConfidence(
      deviceProfile.productModel
    );

    let finalResult: any;
    let source: 'market' | 'rule' | 'fused' = 'rule';

    // 鏍规嵁缃俊搴﹀喅瀹氫娇鐢ㄥ摢绉嶄及鍊兼柟?    if (!confidenceAssessment.shouldFallback && body.useMarketData !== false) {
      // 浣跨敤铻嶅悎寮曟搸
      finalResult = await fusionEngineV1Service.calculateFusedValue(
        deviceProfile,
        condition,
        body.marketPrice
      );
      source = 'fused';
    } else {
      // 鍥為€€鍒扮函瑙勫垯寮曟搸
      finalResult = await fusionEngineV1Service[
        'fusionEngine'
      ].calculateBaselineValue(deviceProfile, condition, body.marketPrice);
      source = 'rule';
    }

    // 鏋勫缓鍝嶅簲鏁版嵁
    const responseData: ValuationResponse = {
      success: true,
      message: '浼板€艰绠楁垚?,
      data: {
        deviceQrcodeId: body.deviceQrcodeId,
        deviceInfo: {
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName,
          productCategory: deviceProfile.productCategory,
          manufacturingDate: deviceProfile?.toISOString().split('T')[0],
        },
        value: finalResult.finalValue,
        confidence: confidenceAssessment.overallConfidence,
        source,
        breakdown: {
          baseValue: finalResult.baseValue,
          depreciation: finalResult.breakdown.depreciation,
          conditionMultiplier: finalResult.conditionMultiplier,
          componentScore: finalResult.componentScore,
          finalValue: finalResult.finalValue,
        },
        recommendations: confidenceAssessment.recommendations,
      },
    };

    // 娣诲姞甯傚満璋冩暣淇℃伅锛堝鏋滀娇鐢ㄤ簡甯傚満鏁版嵁?    if (source === 'fused' && finalResult.fusionDetails) {
      responseData.data!.breakdown.marketAdjustment =
        finalResult.fusionDetails.marketValue -
        finalResult.fusionDetails.depreciationValue;

      responseData.data!.fusionDetails = {
        depreciationValue: finalResult.fusionDetails.depreciationValue,
        marketValue: finalResult.fusionDetails.marketValue,
        weights: finalResult.fusionDetails.weights,
        strategy: finalResult.fusionDetails.strategy,
      };
    }

    // 娣诲姞鏂伴矞搴︿俊?    if (finalResult.breakdown.marketDaysOld !== undefined) {
      responseData.data!.freshnessInfo = {
        daysOld: finalResult.breakdown.marketDaysOld,
        freshnessScore: finalResult.breakdown.marketConfidence || 0,
      };
    }

    // 璁板綍浼板€兼棩?    const processingTime = Date.now() - startTime;
    await logValuation(
      request,
      body,
      deviceProfile,
      {
        finalValue: finalResult.finalValue,
        confidence: confidenceAssessment.overallConfidence,
        fusionDetails: finalResult.fusionDetails,
        breakdown: finalResult.breakdown,
      },
      source,
      processingTime
    );

    // 璁板綍鐩戞帶鎸囨爣
    recordValuationMetrics(
      true,
      source,
      confidenceAssessment.overallConfidence,
      processingTime
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('浼板€糀PI澶勭悊閿欒:', error);

    // 璁板綍閿欒鐩戞帶鎸囨爣
    const processingTime = Date.now() - startTime;
    recordValuationMetrics(false, 'error', 0, processingTime);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

// GET 鏂规硶 - 鏍规嵁璁惧浜岀淮鐮両D鑾峰彇浼?export async function GET(request: NextRequest) {
  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇锋彁渚涙湁鏁堢殑API瀵嗛挜',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceQrcodeId = searchParams.get('deviceQrcodeId');
    const useMarketData = searchParams.get('useMarketData') !== 'false';

    // 楠岃瘉蹇呰鍙傛暟
    if (!deviceQrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: deviceQrcodeId',
        },
        { status: 400 }
      );
    }

    // 鑾峰彇璁惧妗ｆ
    const deviceProfile = await profileService.getDeviceProfile(deviceQrcodeId);

    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈壘鍒版寚瀹氳澶囨。?,
        },
        { status: 404 }
      );
    }

    // 璁＄畻缃俊?    const confidenceAssessment = await confidenceService.assessConfidence(
      deviceProfile.productModel
    );

    let finalResult: any;
    let source: 'market' | 'rule' | 'fused' = 'rule';

    // 鏍规嵁缃俊搴﹀喅瀹氫娇鐢ㄥ摢绉嶄及鍊兼柟?    if (!confidenceAssessment.shouldFallback && useMarketData) {
      // 浣跨敤铻嶅悎寮曟搸
      finalResult =
        await fusionEngineV1Service.calculateFusedValue(deviceProfile);
      source = 'fused';
    } else {
      // 鍥為€€鍒扮函瑙勫垯寮曟搸
      finalResult =
        await fusionEngineV1Service['fusionEngine'].calculateBaselineValue(
          deviceProfile
        );
      source = 'rule';
    }

    // 鏋勫缓鍝嶅簲鏁版嵁
    const responseData: ValuationResponse = {
      success: true,
      message: '浼板€兼煡璇㈡垚?,
      data: {
        deviceQrcodeId,
        deviceInfo: {
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName,
          productCategory: deviceProfile.productCategory,
          manufacturingDate: deviceProfile?.toISOString().split('T')[0],
        },
        value: finalResult.finalValue,
        confidence: confidenceAssessment.overallConfidence,
        source,
        breakdown: {
          baseValue: finalResult.baseValue,
          depreciation: finalResult.breakdown.depreciation,
          conditionMultiplier: finalResult.conditionMultiplier,
          componentScore: finalResult.componentScore,
          finalValue: finalResult.finalValue,
        },
        recommendations: confidenceAssessment.recommendations,
      },
    };

    // 娣诲姞甯傚満璋冩暣淇℃伅锛堝鏋滀娇鐢ㄤ簡甯傚満鏁版嵁?    if (source === 'fused' && finalResult.fusionDetails) {
      responseData.data!.breakdown.marketAdjustment =
        finalResult.fusionDetails.marketValue -
        finalResult.fusionDetails.depreciationValue;

      responseData.data!.fusionDetails = {
        depreciationValue: finalResult.fusionDetails.depreciationValue,
        marketValue: finalResult.fusionDetails.marketValue,
        weights: finalResult.fusionDetails.weights,
        strategy: finalResult.fusionDetails.strategy,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('浼板€兼煡璇PI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

// 鍋ュ悍妫€鏌ョ?export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    message: '浼板€糀PI鏈嶅姟杩愯姝ｅ父',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

