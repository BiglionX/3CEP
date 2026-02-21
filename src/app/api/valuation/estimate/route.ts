import { NextRequest, NextResponse } from 'next/server';
import { DeviceProfileService } from '@/services/device-profile.service';
import { fusionEngineV1Service } from '@/services/fusion-engine-v1.service';
import { confidenceService } from '@/services/confidence.service';
import { DeviceCondition } from '@/lib/valuation/valuation-engine.service';
import { createClient } from '@supabase/supabase-js';
import { recordValuationMetrics } from '@/app/api/monitoring/metrics/route';

const profileService = new DeviceProfileService();

// 初始化Supabase客户端用于日志记录
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 日志记录函数
async function logValuation(
  request: NextRequest,
  requestBody: any,
  deviceProfile: any,
  result: any,
  source: string,
  processingTime: number
) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 
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
        manufacturingDate: deviceProfile.manufacturingDate
      },
      condition_input: requestBody.condition,
      market_price: requestBody.marketPrice,
      final_value: result.finalValue,
      valuation_method: source,
      confidence_score: result.confidence,
      confidence_level: result.confidence >= 0.8 ? 'high' : 
                       result.confidence >= 0.5 ? 'medium' : 'low',
      fusion_details: result.fusionDetails,
      breakdown: result.breakdown,
      request_source: 'api',
      client_ip: clientIp,
      user_agent: userAgent,
      api_key_used: apiKeyUsed,
      processing_time_ms: processingTime,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/valuation/estimate'
      }
    };
    
    await supabase.from('valuation_logs').insert(logEntry);
    console.log('✅ 估值日志记录成功');
  } catch (error) {
    console.error('❌ 估值日志记录失败:', error);
  }
}

// API密钥验证中间件
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const validKeys = [
    process.env.VALUATION_API_KEY,
    process.env.LIFECYCLE_API_KEY,
    'dev-key' // 开发环境测试用
  ];
  
  return validKeys.some(key => key && token === key);
}

// 请求体验证
interface ValuationRequest {
  deviceQrcodeId: string;
  condition?: {
    screen?: string;
    battery?: string;
    body?: string;
    functionality?: string;
  };
  marketPrice?: number;
  useMarketData?: boolean; // 是否使用市场数据
}

// 响应格式
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
    // API密钥验证
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问，请提供有效的API密钥',
        },
        { status: 401 }
      );
    }

    const body: ValuationRequest = await request.json();

    // 验证必要参数
    if (!body.deviceQrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: deviceQrcodeId',
        },
        { status: 400 }
      );
    }

    // 获取设备档案
    const deviceProfile = await profileService.getDeviceProfile(body.deviceQrcodeId);
    
    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到指定设备档案',
        },
        { status: 404 }
      );
    }

    // 解析成色参数
    let condition: DeviceCondition | undefined;
    if (body.condition) {
      condition = {
        screen: (body.condition.screen as any) || 'minor_scratches',
        battery: (body.condition.battery as any) || 'good',
        body: (body.condition.body as any) || 'light_wear',
        functionality: (body.condition.functionality as any) || 'perfect'
      };
    }

    // 计算置信度
    const confidenceAssessment = await confidenceService.assessConfidence(
      deviceProfile.productModel
    );

    let finalResult: any;
    let source: 'market' | 'rule' | 'fused' = 'rule';

    // 根据置信度决定使用哪种估值方式
    if (!confidenceAssessment.shouldFallback && body.useMarketData !== false) {
      // 使用融合引擎
      finalResult = await fusionEngineV1Service.calculateFusedValue(
        deviceProfile,
        condition,
        body.marketPrice
      );
      source = 'fused';
    } else {
      // 回退到纯规则引擎
      finalResult = await fusionEngineV1Service['fusionEngine'].calculateBaselineValue(
        deviceProfile,
        condition,
        body.marketPrice
      );
      source = 'rule';
    }

    // 构建响应数据
    const responseData: ValuationResponse = {
      success: true,
      message: '估值计算成功',
      data: {
        deviceQrcodeId: body.deviceQrcodeId,
        deviceInfo: {
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName,
          productCategory: deviceProfile.productCategory,
          manufacturingDate: deviceProfile.manufacturingDate?.toISOString().split('T')[0]
        },
        value: finalResult.finalValue,
        confidence: confidenceAssessment.overallConfidence,
        source,
        breakdown: {
          baseValue: finalResult.baseValue,
          depreciation: finalResult.breakdown.depreciation,
          conditionMultiplier: finalResult.conditionMultiplier,
          componentScore: finalResult.componentScore,
          finalValue: finalResult.finalValue
        },
        recommendations: confidenceAssessment.recommendations
      }
    };

    // 添加市场调整信息（如果使用了市场数据）
    if (source === 'fused' && finalResult.fusionDetails) {
      responseData.data!.breakdown.marketAdjustment = 
        finalResult.fusionDetails.marketValue - finalResult.fusionDetails.depreciationValue;
      
      responseData.data!.fusionDetails = {
        depreciationValue: finalResult.fusionDetails.depreciationValue,
        marketValue: finalResult.fusionDetails.marketValue,
        weights: finalResult.fusionDetails.weights,
        strategy: finalResult.fusionDetails.strategy
      };
    }

    // 添加新鲜度信息
    if (finalResult.breakdown.marketDaysOld !== undefined) {
      responseData.data!.freshnessInfo = {
        daysOld: finalResult.breakdown.marketDaysOld,
        freshnessScore: finalResult.breakdown.marketConfidence || 0
      };
    }

    // 记录估值日志
    const processingTime = Date.now() - startTime;
    await logValuation(request, body, deviceProfile, {
      finalValue: finalResult.finalValue,
      confidence: confidenceAssessment.overallConfidence,
      fusionDetails: finalResult.fusionDetails,
      breakdown: finalResult.breakdown
    }, source, processingTime);

    // 记录监控指标
    recordValuationMetrics(true, source, confidenceAssessment.overallConfidence, processingTime);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('估值API处理错误:', error);
    
    // 记录错误监控指标
    const processingTime = Date.now() - startTime;
    recordValuationMetrics(false, 'error', 0, processingTime);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// GET 方法 - 根据设备二维码ID获取估值
export async function GET(request: NextRequest) {
  try {
    // API密钥验证
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问，请提供有效的API密钥',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceQrcodeId = searchParams.get('deviceQrcodeId');
    const useMarketData = searchParams.get('useMarketData') !== 'false';

    // 验证必要参数
    if (!deviceQrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: deviceQrcodeId',
        },
        { status: 400 }
      );
    }

    // 获取设备档案
    const deviceProfile = await profileService.getDeviceProfile(deviceQrcodeId);
    
    if (!deviceProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到指定设备档案',
        },
        { status: 404 }
      );
    }

    // 计算置信度
    const confidenceAssessment = await confidenceService.assessConfidence(
      deviceProfile.productModel
    );

    let finalResult: any;
    let source: 'market' | 'rule' | 'fused' = 'rule';

    // 根据置信度决定使用哪种估值方式
    if (!confidenceAssessment.shouldFallback && useMarketData) {
      // 使用融合引擎
      finalResult = await fusionEngineV1Service.calculateFusedValue(deviceProfile);
      source = 'fused';
    } else {
      // 回退到纯规则引擎
      finalResult = await fusionEngineV1Service['fusionEngine'].calculateBaselineValue(deviceProfile);
      source = 'rule';
    }

    // 构建响应数据
    const responseData: ValuationResponse = {
      success: true,
      message: '估值查询成功',
      data: {
        deviceQrcodeId,
        deviceInfo: {
          productModel: deviceProfile.productModel,
          brandName: deviceProfile.brandName,
          productCategory: deviceProfile.productCategory,
          manufacturingDate: deviceProfile.manufacturingDate?.toISOString().split('T')[0]
        },
        value: finalResult.finalValue,
        confidence: confidenceAssessment.overallConfidence,
        source,
        breakdown: {
          baseValue: finalResult.baseValue,
          depreciation: finalResult.breakdown.depreciation,
          conditionMultiplier: finalResult.conditionMultiplier,
          componentScore: finalResult.componentScore,
          finalValue: finalResult.finalValue
        },
        recommendations: confidenceAssessment.recommendations
      }
    };

    // 添加市场调整信息（如果使用了市场数据）
    if (source === 'fused' && finalResult.fusionDetails) {
      responseData.data!.breakdown.marketAdjustment = 
        finalResult.fusionDetails.marketValue - finalResult.fusionDetails.depreciationValue;
      
      responseData.data!.fusionDetails = {
        depreciationValue: finalResult.fusionDetails.depreciationValue,
        marketValue: finalResult.fusionDetails.marketValue,
        weights: finalResult.fusionDetails.weights,
        strategy: finalResult.fusionDetails.strategy
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('估值查询API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// 健康检查端点
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    message: '估值API服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}