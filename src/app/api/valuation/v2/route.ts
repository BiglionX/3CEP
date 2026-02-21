import { NextRequest, NextResponse } from 'next/server';
import { fusionEngineV2Service, ValuationMethod } from '@/services/fusion-engine-v2.service';
import { DeviceProfile } from '@/lib/constants/lifecycle';
import { DeviceCondition } from '@/lib/valuation/valuation-engine.service';

/**
 * 估值API v2 - 智能融合版本
 * 根据置信度动态选择最优估值策略
 */

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
    
    // 参数验证
    if (!body.deviceQrcodeId && !body.deviceProfile) {
      return NextResponse.json({
        success: false,
        error: '必须提供 deviceQrcodeId 或 deviceProfile',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 获取设备档案
    const deviceProfile = await getDeviceProfile(body.deviceQrcodeId, body.deviceProfile);
    if (!deviceProfile) {
      return NextResponse.json({
        success: false,
        error: '未找到指定的设备档案',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 执行智能决策
    const decision = await fusionEngineV2Service.makeIntelligentDecision(
      deviceProfile,
      body.condition,
      body.marketPrice
    );

    // 构建响应
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
          productCategory: deviceProfile.productCategory || ''
        },
        rationale: decision.rationale,
        metadata: decision.metadata
      },
      timestamp: new Date().toISOString()
    };

    // 添加详细信息（如果请求）
    if (body.includeDetails) {
      response.data!.breakdown = await getDetailedBreakdown(
        deviceProfile,
        body.condition,
        decision
      );
    }

    // 添加替代估值（如果请求）
    if (body.includeAlternatives) {
      response.data!.alternatives = decision.alternativeValues;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('估值API v2错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '内部服务器错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceQrcodeId = searchParams.get('deviceQrcodeId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const includeAlternatives = searchParams.get('includeAlternatives') === 'true';

    if (!deviceQrcodeId) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数: deviceQrcodeId',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 获取设备档案
    const deviceProfile = await getDeviceProfile(deviceQrcodeId);
    if (!deviceProfile) {
      return NextResponse.json({
        success: false,
        error: '未找到指定的设备档案',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 执行智能决策
    const decision = await fusionEngineV2Service.makeIntelligentDecision(deviceProfile);

    // 构建响应
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
          productCategory: deviceProfile.productCategory || ''
        },
        rationale: decision.rationale,
        metadata: decision.metadata
      },
      timestamp: new Date().toISOString()
    };

    // 添加详细信息（如果请求）
    if (includeDetails) {
      response.data!.breakdown = await getDetailedBreakdown(deviceProfile, undefined, decision);
    }

    // 添加替代估值（如果请求）
    if (includeAlternatives) {
      response.data!.alternatives = decision.alternativeValues;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('估值API v2 GET错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '内部服务器错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==================== 辅助函数 ====================

/**
 * 获取设备档案
 */
async function getDeviceProfile(
  deviceQrcodeId?: string,
  partialProfile?: Partial<DeviceProfile>
): Promise<DeviceProfile | null> {
  // 如果提供了完整的设备档案，直接使用
  if (partialProfile && partialProfile.id) {
    return partialProfile as DeviceProfile;
  }

  // 否则通过二维码ID查询数据库
  if (deviceQrcodeId) {
    try {
      // 这里应该调用实际的数据库查询服务
      // 暂时返回模拟数据
      return mockDeviceProfile(deviceQrcodeId);
    } catch (error) {
      console.error('获取设备档案失败:', error);
      return null;
    }
  }

  return null;
}

/**
 * 获取详细分解信息
 */
async function getDetailedBreakdown(
  deviceProfile: DeviceProfile,
  condition: DeviceCondition | undefined,
  decision: any
) {
  // 这里可以调用具体的估值引擎获取详细分解
  // 暂时返回基本结构
  return {
    originalPrice: 5000,
    depreciation: 1200,
    componentAdjustment: 0.85,
    conditionAdjustment: 0.92,
    strategyDetails: {
      method: decision.method,
      confidenceFactors: decision.metadata?.confidenceFactors || {},
      weightDistribution: decision.metadata?.weights || {}
    }
  };
}

/**
 * 模拟设备档案数据
 */
function mockDeviceProfile(qrcodeId: string): DeviceProfile {
  return {
    id: `device_${qrcodeId}`,
    qrcodeId: qrcodeId,
    productModel: 'iPhone 14 Pro',
    productCategory: '智能手机',
    brandName: 'Apple',
    manufacturingDate: new Date('2022-09-16'),
    currentStatus: 'active' as any,
    totalRepairCount: 0,
    totalPartReplacementCount: 0,
    totalTransferCount: 1,
    specifications: {
      ram: '6GB',
      storage: '256GB',
      processor: 'A16 Bionic'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}