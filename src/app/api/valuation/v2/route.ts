import { NextRequest, NextResponse } from 'next/server';
import {
  fusionEngineV2Service,
  ValuationMethod,
} from '@/services/fusion-engine-v2.service';
import { DeviceProfile } from '@/lib/constants/lifecycle';
import { DeviceCondition } from '@/lib/valuation/valuation-engine.service';

/**
 * 浼板€糀PI v2 - 鏅鸿兘铻嶅悎鐗堟湰
 * 鏍规嵁缃俊搴﹀姩鎬侀€夋嫨鏈€浼樹及鍊肩瓥? */

interface ValuationRequest {
  deviceQrcodeId?: string;
  deviceProfile?: Partial<DeviceProfile>;
  condition?: DeviceCondition;
  marketPrice?: number;
  includeDetails?: boolean;
  includeAlternatives?: boolean;
}

interface ValuationResponse {
  success: boolean;
  data?: {
    finalValue: number;
    method: ValuationMethod;
    confidenceLevel: string;
    confidenceScore: number;
    deviceInfo?: {
      id: string;
      productModel: string;
      brandName: string;
      productCategory: string;
    };
    breakdown?: any;
    alternatives?: {
      ml?: number;
      market?: number;
      rule?: number;
    };
    rationale?: string;
    metadata?: Record<string, any>;
  };
  error?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValuationRequest = await request.json();

    // 鍙傛暟楠岃瘉
    if (!body.deviceQrcodeId && !body.deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '蹇呴』鎻愪緵 deviceQrcodeId 锟?deviceProfile',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 鑾峰彇璁惧妗ｆ
    const deviceProfile = await getDeviceProfile(
      body.deviceQrcodeId,
      body.deviceProfile
    );
    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈壘鍒版寚瀹氱殑璁惧妗ｆ',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 鎵ц鏅鸿兘鍐崇瓥
    const decision = await fusionEngineV2Service.makeIntelligentDecision(
      deviceProfile,
      body.condition,
      body.marketPrice
    );

    // 鏋勫缓鍝嶅簲
    const response: ValuationResponse = {
      success: true,
      data: {
        finalValue: decision.primaryValue,
        method: decision.method,
        confidenceLevel: decision.confidenceLevel,
        confidenceScore: decision.confidenceScore,
        deviceInfo: {
          id: deviceProfile.id,
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName || '',
          productCategory: deviceProfile.productCategory || '',
        },
        rationale: decision.rationale,
        metadata: decision.metadata,
      },
      timestamp: new Date().toISOString(),
    };

    // 娣诲姞璇︾粏淇℃伅锛堝鏋滆姹傦級
    if (body.includeDetails) {
      response.data!.breakdown = await getDetailedBreakdown(
        deviceProfile,
        body.condition,
        decision
      );
    }

    // 娣诲姞鏇夸唬浼板€硷紙濡傛灉璇锋眰?    if (body.includeAlternatives) {
      response.data!.alternatives = decision.alternativeValues;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('浼板€糀PI v2閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceQrcodeId = searchParams.get('deviceQrcodeId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const includeAlternatives =
      searchParams.get('includeAlternatives') === 'true';

    if (!deviceQrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶鍙傛暟: deviceQrcodeId',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 鑾峰彇璁惧妗ｆ
    const deviceProfile = await getDeviceProfile(deviceQrcodeId);
    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈壘鍒版寚瀹氱殑璁惧妗ｆ',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 鎵ц鏅鸿兘鍐崇瓥
    const decision =
      await fusionEngineV2Service.makeIntelligentDecision(deviceProfile);

    // 鏋勫缓鍝嶅簲
    const response: ValuationResponse = {
      success: true,
      data: {
        finalValue: decision.primaryValue,
        method: decision.method,
        confidenceLevel: decision.confidenceLevel,
        confidenceScore: decision.confidenceScore,
        deviceInfo: {
          id: deviceProfile.id,
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName || '',
          productCategory: deviceProfile.productCategory || '',
        },
        rationale: decision.rationale,
        metadata: decision.metadata,
      },
      timestamp: new Date().toISOString(),
    };

    // 娣诲姞璇︾粏淇℃伅锛堝鏋滆姹傦級
    if (includeDetails) {
      response.data!.breakdown = await getDetailedBreakdown(
        deviceProfile,
        undefined,
        decision
      );
    }

    // 娣诲姞鏇夸唬浼板€硷紙濡傛灉璇锋眰?    if (includeAlternatives) {
      response.data!.alternatives = decision.alternativeValues;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('浼板€糀PI v2 GET閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ==================== 杈呭姪鍑芥暟 ====================

/**
 * 鑾峰彇璁惧妗ｆ
 */
async function getDeviceProfile(
  deviceQrcodeId?: string,
  partialProfile?: Partial<DeviceProfile>
): Promise<DeviceProfile | null> {
  // 濡傛灉鎻愪緵浜嗗畬鏁寸殑璁惧妗ｆ锛岀洿鎺ヤ娇?  if (partialProfile && partialProfile.id) {
    return partialProfile as DeviceProfile;
  }

  // 鍚﹀垯閫氳繃浜岀淮鐮両D鏌ヨ鏁版嵁?  if (deviceQrcodeId) {
    try {
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬暟鎹簱鏌ヨ鏈嶅姟
      // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
      return mockDeviceProfile(deviceQrcodeId);
    } catch (error) {
      console.error('鑾峰彇璁惧妗ｆ澶辫触:', error);
      return null;
    }
  }

  return null;
}

/**
 * 鑾峰彇璇︾粏鍒嗚В淇℃伅
 */
async function getDetailedBreakdown(
  deviceProfile: DeviceProfile,
  condition: DeviceCondition | undefined,
  decision: any
) {
  // 杩欓噷鍙互璋冪敤鍏蜂綋鐨勪及鍊煎紩鎿庤幏鍙栬缁嗗垎?  // 鏆傛椂杩斿洖鍩烘湰缁撴瀯
  return {
    originalPrice: 5000,
    depreciation: 1200,
    componentAdjustment: 0.85,
    conditionAdjustment: 0.92,
    strategyDetails: {
      method: decision.method,
      confidenceFactors: decision?.confidenceFactors || {},
      weightDistribution: decision?.weights || {},
    },
  };
}

/**
 * 妯℃嫙璁惧妗ｆ鏁版嵁
 */
function mockDeviceProfile(qrcodeId: string): DeviceProfile {
  return {
    id: `device_${qrcodeId}`,
    qrcodeId: qrcodeId,
    productModel: 'iPhone 14 Pro',
    productCategory: '鏅鸿兘鎵嬫満',
    brandName: 'Apple',
    manufacturingDate: new Date('2022-09-16'),
    currentStatus: 'active' as any,
    totalRepairCount: 0,
    totalPartReplacementCount: 0,
    totalTransferCount: 1,
    specifications: {
      ram: '6GB',
      storage: '256GB',
      processor: 'A16 Bionic',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

