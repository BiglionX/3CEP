/**
 * 閲囪喘鏅鸿兘浣揂PI闄愭祦绀轰緥
 * 婕旂ず濡備綍鍦ㄥ疄闄匒PI涓娇鐢ㄩ檺娴佷腑闂翠欢
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  rateLimitMiddleware,
  procurementIntelligenceBreaker,
} from '@/middleware/rate-limit.middleware';
import { getMatchingRateLimitRules } from '../../../../../config/ratelimit.config';

// 妯℃嫙閲囪喘鏅鸿兘浣撴湇?class MockProcurementService {
  async getSupplierProfile(supplierId: string) {
    // 妯℃嫙鏁版嵁搴撴煡璇㈠欢?    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      supplierId,
      companyName: `渚涘簲?${supplierId}`,
      score: Math.floor(Math.random() * 40) + 60, // 60-100锟?      status: 'active',
    };
  }

  async analyzeMarketTrends(commodity: string) {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      commodity,
      currentPrice: Math.random() * 1000 + 500,
      trend: ['涓婃定', '涓嬭穼', '骞崇ǔ'][Math.floor(Math.random() * 3)],
      confidence: Math.random() * 0.3 + 0.7, // 70%-100%
    };
  }
}

const mockService = new MockProcurementService();

export async function GET(request: NextRequest) {
  try {
    // 1. 搴旂敤闄愭祦涓棿?    const rateLimitResult = await rateLimitMiddleware(request, { type: 'api' });
    if (rateLimitResult) {
      return rateLimitResult; // 杩斿洖闄愭祦鍝嶅簲
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const action = searchParams.get('action') || 'profile';

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Missing supplierId parameter' },
        { status: 400 }
      );
    }

    // 2. 浣跨敤鐔旀柇鍣ㄦ墽琛屼笟鍔￠€昏緫
    const result = await procurementIntelligenceBreaker.execute(async () => {
      switch (action) {
        case 'profile':
          return await mockService.getSupplierProfile(supplierId);
        case 'market':
          return await mockService.analyzeMarketTrends(supplierId);
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);

    // 妫€鏌ユ槸鍚︽槸鐔旀柇鍣ㄩ敊?    if (error instanceof Error && error.message === 'Circuit breaker is OPEN') {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message:
            'Service is temporarily unavailable due to high failure rate',
          retryAfter: 30,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 瀵逛簬POST璇锋眰浣跨敤鏇翠弗鏍肩殑闄愭祦
    const pathname = request.nextUrl.pathname;
    const matchingRules = getMatchingRateLimitRules(pathname, 'POST');

    // 濡傛灉鏈夊尮閰嶇殑瑙勫垯锛屼娇鐢ㄦ渶涓ユ牸鐨勯偅?    if (matchingRules.length > 0) {
      const strictestRule = matchingRules.reduce((prev, current) =>
        prev.config.maxRequests < current.config.maxRequests ? prev : current
      );

      const rateLimitResult = await rateLimitMiddleware(request, {
        customConfig: strictestRule.config,
      });

      if (rateLimitResult) {
        return rateLimitResult;
      }
    }

    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    // 浣跨敤鐔旀柇鍣ㄦ墽琛屾晱鎰熸搷?    const result = await procurementIntelligenceBreaker.execute(async () => {
      // 妯℃嫙涓嶅悓鐨勪笟鍔℃搷?      switch (action) {
        case 'create_profile':
          await new Promise(resolve => setTimeout(resolve, 200)); // 妯℃嫙鍒涘缓鑰楁椂
          return {
            success: true,
            profileId: `profile_${Date.now()}`,
            message: '渚涘簲鍟嗙敾鍍忓垱寤烘垚?,
          };

        case 'risk_assessment':
          await new Promise(resolve => setTimeout(resolve, 300)); // 妯℃嫙椋庨櫓璇勪及鑰楁椂
          return {
            success: true,
            riskLevel: ['浣庨?, '涓?, '楂橀?][
              Math.floor(Math.random() * 3)
            ],
            score: Math.floor(Math.random() * 100),
            recommendations: ['鍔犲己璐ㄩ噺绠℃帶', '澧炲姞澶囬€変緵搴斿晢', '浼樺寲浠樻鏉′欢'],
          };

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST API Error:', error);

    if (error instanceof Error && error.message === 'Circuit breaker is OPEN') {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message:
            'Service is temporarily unavailable due to high failure rate',
          retryAfter: 30,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 鍋ュ悍妫€鏌ョ鐐癸紙涓嶅彈闄愭祦褰卞搷?export async function OPTIONS() {
  return NextResponse.json({
    status: 'healthy',
    rateLimitInfo: {
      circuitBreakerState: procurementIntelligenceBreaker.getState(),
      failureCount: procurementIntelligenceBreaker.getFailureCount(),
    },
  });
}

