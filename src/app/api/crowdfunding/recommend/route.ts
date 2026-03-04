import { NextResponse } from 'next/server';
import {
  upgradeRecommendationService,
  UpgradeRecommendation,
} from '@/services/crowdfunding/upgrade-recommendation.service';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/crowdfunding/recommend?userId=xxx
 * 鑾峰彇鐢ㄦ埛鏈哄瀷鍗囩骇鎺ㄨ崘
 *
 * 鏌ヨ鍙傛暟:
 * - userId: 鐢ㄦ埛ID (蹇呴渶)
 * - limit: 杩斿洖鎺ㄨ崘鏁伴噺锛岄粯?
 * - useCache: 鏄惁浣跨敤缂撳瓨鎺ㄨ崘锛岄粯璁rue
 *
 * 杩斿洖:
 * - success: boolean - 鏄惁鎴愬姛
 * - data: UpgradeRecommendation[] - 鎺ㄨ崘鍒楄〃
 * - message: string - 缁撴灉娑堟伅
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const useCache = searchParams.get('useCache') !== 'false'; // 榛樿浣跨敤缂撳瓨

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯userId鍙傛暟',
        },
        { status: 400 }
      );
    }

    // 楠岃瘉鐢ㄦ埛鏄惁瀛樺湪
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: '鐢ㄦ埛涓嶅瓨?,
        },
        { status: 404 }
      );
    }

    let recommendations: UpgradeRecommendation[] = [];

    // 濡傛灉浣跨敤缂撳瓨锛屽厛灏濊瘯鑾峰彇缂撳瓨鐨勬帹?    if (useCache) {
      const cachedRecommendations =
        await upgradeRecommendationService.getCachedRecommendations(
          userId,
          limit
        );
      recommendations = cachedRecommendations;
    }

    // 濡傛灉缂撳瓨涓虹┖鎴栦笉浣跨敤缂撳瓨锛屽垯鐢熸垚鏂扮殑鎺ㄨ崘
    if (recommendations.length === 0) {
      const freshRecommendations =
        await upgradeRecommendationService.generateRecommendations(
          userId,
          limit
        );
      recommendations = freshRecommendations;
    }

    // 鍑嗗鍝嶅簲鏁版嵁
    const responseData = {
      success: true,
      data: recommendations,
      meta: {
        totalCount: recommendations.length,
        userId,
        timestamp: new Date().toISOString(),
        fromCache: useCache && recommendations.some(r => r.isNew === false),
      },
      message:
        recommendations.length > 0
          ? `涓烘偍鎵惧埌${recommendations.length}涓崌绾ф帹鑽恅
          : '鏆傛棤閫傚悎鐨勫崌绾ф帹?,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('鑾峰彇鍗囩骇鎺ㄨ崘澶辫触:', error);

    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鎺ㄨ崘澶辫触',
        message: error.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crowdfunding/recommend
 * 寮哄埗鍒锋柊鐢ㄦ埛鐨勬帹鑽愶紙蹇界暐缂撳瓨? *
 * 璇锋眰?
 * - userId: string - 鐢ㄦ埛ID (蹇呴渶)
 * - limit: number - 杩斿洖鎺ㄨ崘鏁伴噺锛岄粯?
 *
 * 杩斿洖:
 * - success: boolean - 鏄惁鎴愬姛
 * - data: UpgradeRecommendation[] - 鏂扮敓鎴愮殑鎺ㄨ崘鍒楄〃
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, limit = 5 } = body;

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯userId鍙傛暟',
        },
        { status: 400 }
      );
    }

    // 楠岃瘉鐢ㄦ埛鏄惁瀛樺湪
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: '鐢ㄦ埛涓嶅瓨?,
        },
        { status: 404 }
      );
    }

    // 鐩存帴鐢熸垚鏂扮殑鎺ㄨ崘锛堜笉浣跨敤缂撳瓨?    const recommendations =
      await upgradeRecommendationService.generateRecommendations(userId, limit);

    const responseData = {
      success: true,
      data: recommendations,
      meta: {
        totalCount: recommendations.length,
        userId,
        timestamp: new Date().toISOString(),
        refreshed: true,
      },
      message:
        recommendations.length > 0
          ? `宸蹭负鎮ㄥ埛?{recommendations.length}涓崌绾ф帹鑽恅
          : '鏆傛棤閫傚悎鐨勫崌绾ф帹?,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('鍒锋柊鍗囩骇鎺ㄨ崘澶辫触:', error);

    return NextResponse.json(
      {
        success: false,
        error: '鍒锋柊鎺ㄨ崘澶辫触',
        message: error.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/crowdfunding/recommend/click
 * 璁板綍鎺ㄨ崘鐐瑰嚮
 *
 * 璇锋眰?
 * - userId: string - 鐢ㄦ埛ID (蹇呴渶)
 * - oldModel: string - 鏃ф満?(蹇呴渶)
 * - newModel: string - 鏂版満?(蹇呴渶)
 *
 * 杩斿洖:
 * - success: boolean - 鏄惁鎴愬姛
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, oldModel, newModel } = body;

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!userId || !oldModel || !newModel) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶鍙傛暟',
        },
        { status: 400 }
      );
    }

    // 璁板綍鐐瑰嚮
    await upgradeRecommendationService.recordRecommendationClick(
      userId,
      oldModel,
      newModel
    );

    return NextResponse.json({
      success: true,
      message: '鐐瑰嚮璁板綍鎴愬姛',
    });
  } catch (error: any) {
    console.error('璁板綍鎺ㄨ崘鐐瑰嚮澶辫触:', error);

    return NextResponse.json(
      {
        success: false,
        error: '璁板綍鐐瑰嚮澶辫触',
        message: error.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/crowdfunding/recommend/conversion
 * 璁板綍鎺ㄨ崘杞寲锛堢敤鎴蜂笅鍗曪級
 *
 * 璇锋眰?
 * - userId: string - 鐢ㄦ埛ID (蹇呴渶)
 * - oldModel: string - 鏃ф満?(蹇呴渶)
 * - newModel: string - 鏂版満?(蹇呴渶)
 *
 * 杩斿洖:
 * - success: boolean - 鏄惁鎴愬姛
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, oldModel, newModel } = body;

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!userId || !oldModel || !newModel) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶鍙傛暟',
        },
        { status: 400 }
      );
    }

    // 璁板綍杞寲
    await upgradeRecommendationService.recordRecommendationConversion(
      userId,
      oldModel,
      newModel
    );

    return NextResponse.json({
      success: true,
      message: '杞寲璁板綍鎴愬姛',
    });
  } catch (error: any) {
    console.error('璁板綍鎺ㄨ崘杞寲澶辫触:', error);

    return NextResponse.json(
      {
        success: false,
        error: '璁板綍杞寲澶辫触',
        message: error.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

